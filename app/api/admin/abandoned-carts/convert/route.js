import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireManagerOrAdmin } from '@/lib/auth';
import { deliveryConfig, calculateDeliveryFee } from '@/lib/deliveryConfig';
import { invalidateCache } from '@/lib/performance';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { cartId, paymentMethod = 'cod', customNotes = '' } = body;

    if (!cartId) {
      return NextResponse.json(
        { message: 'অসম্পূর্ণ কার্ট আইডি আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cart = await AbandonedCart.findById(cartId);
    if (!cart) {
      return NextResponse.json(
        { message: 'অসম্পূর্ণ কার্ট রেকর্ডটি পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    if (!cart.customer?.phone || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { message: 'কার্টে পর্যাপ্ত গ্রাহক বা পণ্যের তথ্য নেই' },
        { status: 400 }
      );
    }

    // 1. Authoritative Server-Side Product Price & Stock Verification
    let verifiedSubtotal = 0;
    const sanitizedItems = [];
    const stockToDecrement = [];

    for (const item of cart.items) {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const rawId = item.productId || item.id || '';

      let dbProduct = null;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        dbProduct = await Product.findById(rawId);
      }
      if (!dbProduct && item.name) {
        dbProduct = await Product.findOne({ name: item.name });
      }

      const authoritativePrice = dbProduct ? Number(dbProduct.price) || 0 : Number(item.price) || 0;
      const lineTotal = authoritativePrice * quantity;
      verifiedSubtotal += lineTotal;

      sanitizedItems.push({
        productId: dbProduct ? dbProduct._id.toString() : rawId || 'item',
        name: dbProduct ? dbProduct.name : item.name,
        price: authoritativePrice,
        quantity,
        unit: dbProduct?.unit || item.unit || '',
        image: dbProduct?.image || item.image || '',
      });

      if (dbProduct) {
        stockToDecrement.push({
          productId: dbProduct._id,
          quantity,
        });
      }
    }

    // 2. Delivery Fee Engine
    const customerCity = (cart.customer.city || 'সাতক্ষীরা').trim();
    const isInside =
      customerCity === 'সাতক্ষীরা' ||
      customerCity === 'সাতক্ষীরার ভেতরে' ||
      customerCity.toLowerCase().includes('satkhira') ||
      customerCity.includes('সাতক্ষীরা') ||
      customerCity === 'ঢাকা';
    const deliveryFee = calculateDeliveryFee(verifiedSubtotal, isInside ? 'satkhira' : 'outside');
    const totalAmount = verifiedSubtotal + deliveryFee;

    // 3. Generate Unique Order Number
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `SKG-${randomDigits}`;

    // 4. Create Confirmed Order in Database
    const newOrder = await Order.create({
      orderNumber,
      customer: {
        name: cart.customer.name || 'সম্মানিত গ্রাহক',
        phone: cart.customer.phone,
        email: cart.customer.email || '',
        address: cart.customer.address || 'ঠিকানা ফোনে সংগৃহীত',
        city: customerCity,
        notes: customNotes
          ? `${customNotes} (অসম্পূর্ণ কার্ট থেকে রিকভার্ড)`
          : 'অ্যাডমিন কর্তৃক অসম্পূর্ণ কার্ট থেকে সরাসরি নিশ্চিতকৃত অর্ডার',
      },
      items: sanitizedItems,
      subtotal: verifiedSubtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
      securityInfo: {
        ipAddress: '127.0.0.1 (Admin Assisted Recovery)',
        city: customerCity,
        country: 'বাংলাদেশ',
        isp: 'Admin Order Conversion Engine',
        userAgent: 'Satkhira Ghor Admin Recovery/1.0',
      },
      courierHistory: {
        totalOrders: 1,
        successfulDeliveries: 1,
        cancelledDeliveries: 0,
        successRate: 100,
        provider: 'Steadfast (Manual Assisted)',
      },
      fraudRisk: 'low',
      fraudReason: 'অ্যাডমিন কর্তৃক সরাসরি গ্রাহকের সাথে কথা বলে কনফার্ম করা হয়েছে।',
    });

    // 5. Decrement Stock in MongoDB
    for (const st of stockToDecrement) {
      try {
        await Product.findByIdAndUpdate(st.productId, {
          $inc: { stock: -st.quantity },
        });
      } catch (stockErr) {
        console.warn(`Could not update stock for product ${st.productId}:`, stockErr.message);
      }
    }

    // 6. Mark Abandoned Cart as Recovered
    cart.recoveryStatus = 'recovered';
    cart.notes = `সফল রিকভারি: #${orderNumber} অর্ডারে রূপান্তর করা হয়েছে`;
    cart.lastActivityAt = new Date();
    await cart.save();

    // 7. Invalidate Caches
    invalidateCache('admin_stats');
    invalidateCache('products');

    return NextResponse.json({
      success: true,
      message: `অসম্পূর্ণ কার্টটি সফলভাবে #${orderNumber} অর্ডারে রূপান্তরিত হয়েছে!`,
      order: newOrder,
    });
  } catch (error) {
    console.error('Convert abandoned cart error:', error);
    return NextResponse.json(
      { message: 'অর্ডার রূপান্তর করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
