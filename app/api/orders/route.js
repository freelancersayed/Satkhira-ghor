import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getSessionUser, requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, subtotal, deliveryFee = 100, paymentMethod = 'cod' } = body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return NextResponse.json(
        { message: 'নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা আবশ্যক' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'কার্টে কোনো পণ্য নেই' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user is logged in
    const session = await getSessionUser(request);
    const userId = session ? session.id : null;

    // Generate unique order number (e.g. SKG-748392)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `SKG-${randomDigits}`;

    const totalAmount = Number(subtotal) + Number(deliveryFee);

    const newOrder = await Order.create({
      orderNumber,
      user: userId,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email ? customer.email.trim() : (session?.email || ''),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'ঢাকা',
        notes: customer.notes || '',
      },
      items: items.map((item) => ({
        productId: item.id || item.productId || item.slug,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        unit: item.unit || '',
        image: item.image || '',
      })),
      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      totalAmount,
      paymentMethod,
      paymentStatus: 'unpaid',
      orderStatus: 'pending',
    });

    // Optionally decrement product stock if product exists in MongoDB
    try {
      for (const item of items) {
        if (item.id && item.id.match(/^[0-9a-fA-F]{24}$/)) {
          await Product.findByIdAndUpdate(item.id, {
            $inc: { stock: -Number(item.quantity) },
          });
        }
      }
    } catch (stockErr) {
      console.warn('Could not update product stock:', stockErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
        order: {
          id: newOrder._id.toString(),
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount,
          customer: newOrder.customer,
          orderStatus: newOrder.orderStatus,
          createdAt: newOrder.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { message: 'অর্ডার করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100');

    await connectToDatabase();

    const query = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(limit);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { message: 'অর্ডার লোড করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
