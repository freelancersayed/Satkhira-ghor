import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import AbandonedCart from '@/models/AbandonedCart';
import SiteContent from '@/models/SiteContent';
import { getSessionUser, requireStaffOrAdmin } from '@/lib/auth';
import { extractClientIp, getIpGeoInfo } from '@/lib/geo';
import { checkCourierHistoryAndFraud } from '@/lib/courierFraudCheck';
import { sanitizeBase64, invalidateCache } from '@/lib/performance';
import { deliveryConfig } from '@/lib/deliveryConfig';

export const dynamic = 'force-dynamic';

const bnToEn = (str) =>
  (str || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      couponCode = '',
      paymentMethod = 'cod',
      paymentDetails = null,
    } = body;

    // 1. Mandatory Customer Details Validation
    if (!customer || !customer.name?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return NextResponse.json(
        { message: 'নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা আবশ্যক' },
        { status: 400 }
      );
    }

    // 2. Phone Normalization (Bengali to English digits, strip symbols)
    const rawPhone = bnToEn(customer.phone);
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    // Bangladeshi phone verification: exactly 11 digits, starts with 01
    if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
      return NextResponse.json(
        { message: 'অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)' },
        { status: 400 }
      );
    }

    // 2.1 bKash / Nagad Transaction ID Verification
    let cleanTrxId = '';
    let cleanSenderNumber = '';
    if (paymentDetails) {
      cleanTrxId = (paymentDetails.transactionId || '').trim().toUpperCase();
      cleanSenderNumber = bnToEn(paymentDetails.senderNumber || '').replace(/[^0-9]/g, '');
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!cleanTrxId || cleanTrxId.length < 4) {
        return NextResponse.json(
          {
            message: `অনুগ্রহ করে ${
              paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'
            } পেমেন্টের সঠিক ট্রানজেকশন আইডি (TrxID) প্রদান করুন।`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Cart Items Non-empty Check
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'কার্টে কোনো পণ্য নেই' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 4. Server-Side Price & Stock Anti-Tamper Engine
    // Authoritatively verify each item from the MongoDB Product collection
    let verifiedSubtotal = 0;
    const sanitizedItems = [];
    const stockToDecrement = [];

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const rawId = item.id || item.productId || '';
      const rawSlug = item.slug || '';

      let dbProduct = null;
      if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
        dbProduct = await Product.findById(rawId);
      }
      if (!dbProduct && rawSlug) {
        dbProduct = await Product.findOne({ slug: rawSlug });
      }
      if (!dbProduct && rawId && typeof rawId === 'string') {
        dbProduct = await Product.findOne({ slug: rawId });
      }

      if (dbProduct) {
        // Out-of-Stock Check
        if (typeof dbProduct.stock === 'number' && dbProduct.stock <= 0) {
          return NextResponse.json(
            { message: `দুঃখিত, "${dbProduct.name}" পণ্যটি বর্তমানে স্টক আউট। অনুগ্রহ করে কার্ট থেকে বাদ দিন।` },
            { status: 400 }
          );
        }

        // Insufficient Stock Check
        if (typeof dbProduct.stock === 'number' && quantity > dbProduct.stock) {
          return NextResponse.json(
            { message: `দুঃখিত, "${dbProduct.name}" পণ্যের মাত্র ${dbProduct.stock} টি স্টকে রয়েছে। আপনি চেয়েছেন ${quantity} টি।` },
            { status: 400 }
          );
        }

        // Use authoritative server-side price from MongoDB
        const authoritativePrice = Number(dbProduct.price) || 0;
        const lineTotal = authoritativePrice * quantity;
        verifiedSubtotal += lineTotal;

        const safeImage = await sanitizeBase64(
          dbProduct.image || item.image || '',
          `order_item_${dbProduct.slug}`
        );

        sanitizedItems.push({
          productId: dbProduct._id.toString(),
          name: dbProduct.name,
          price: authoritativePrice,
          quantity,
          unit: dbProduct.unit || item.unit || '',
          image: safeImage,
        });

        stockToDecrement.push({
          productId: dbProduct._id,
          quantity,
        });
      } else {
        // Fallback for edge cases where product is not in DB
        const fallbackPrice = Math.max(0, Number(item.price) || 0);
        verifiedSubtotal += fallbackPrice * quantity;

        const safeImage = await sanitizeBase64(
          item.image || '',
          `order_item_${rawSlug || 'custom'}`
        );

        sanitizedItems.push({
          productId: rawId || rawSlug || 'custom_item',
          name: item.name || 'পণ্য',
          price: fallbackPrice,
          quantity,
          unit: item.unit || '',
          image: safeImage,
        });
      }
    }

    // 5. Server-Side Coupon Verification (Prevents unauthorized discount manipulation)
    let verifiedDiscount = 0;
    const cleanCouponCode = (couponCode || '').trim().toUpperCase();

    if (cleanCouponCode) {
      if (cleanCouponCode === 'SATKHIRA100') {
        verifiedDiscount = 100;
      } else if (cleanCouponCode === 'SUNDARBAN') {
        verifiedDiscount = Math.round(verifiedSubtotal * 0.1);
      } else {
        const coupon = await Coupon.findOne({ code: cleanCouponCode, isActive: true });
        if (coupon) {
          const isNotExpired = !coupon.expiryDate || new Date() <= new Date(coupon.expiryDate);
          const meetsMinAmount = !coupon.minOrderAmount || verifiedSubtotal >= coupon.minOrderAmount;
          if (isNotExpired && meetsMinAmount) {
            if (coupon.discountType === 'percentage') {
              let disc = Math.round((verifiedSubtotal * coupon.discountAmount) / 100);
              if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
                disc = coupon.maxDiscountAmount;
              }
              verifiedDiscount = disc;
            } else {
              verifiedDiscount = coupon.discountAmount;
            }
          }
        }
      }
    }

    // Clamp discount so it cannot exceed subtotal
    verifiedDiscount = Math.min(verifiedDiscount, verifiedSubtotal);
    const subtotalAfterDiscount = Math.max(0, verifiedSubtotal - verifiedDiscount);

    // 6. Server-Side Authoritative Delivery Fee Engine (Dynamic Admin Settings Aware)
    let dynamicThreshold = deliveryConfig.freeDeliveryThreshold;
    let dynamicInside = deliveryConfig.insideSatkhira || 70;
    let dynamicOutside = deliveryConfig.outsideSatkhira || 120;

    try {
      const settingsDoc = await SiteContent.findOne({ key: 'settings' }).lean();
      if (settingsDoc && settingsDoc.data) {
        if (settingsDoc.data.freeDeliveryThreshold !== undefined && settingsDoc.data.freeDeliveryThreshold !== '') {
          const parsed = Number(settingsDoc.data.freeDeliveryThreshold);
          if (!isNaN(parsed)) dynamicThreshold = parsed;
        }
        if (settingsDoc.data.insideSatkhiraCharge !== undefined && settingsDoc.data.insideSatkhiraCharge !== '') {
          const parsed = Number(settingsDoc.data.insideSatkhiraCharge);
          if (!isNaN(parsed)) dynamicInside = parsed;
        }
        if (settingsDoc.data.outsideSatkhiraCharge !== undefined && settingsDoc.data.outsideSatkhiraCharge !== '') {
          const parsed = Number(settingsDoc.data.outsideSatkhiraCharge);
          if (!isNaN(parsed)) dynamicOutside = parsed;
        }
      }
    } catch (e) {
      // fallback to deliveryConfig
    }

    const isFreeDelivery = subtotalAfterDiscount >= dynamicThreshold && subtotalAfterDiscount > 0;
    const customerCity = (customer.city || 'সাতক্ষীরা').trim();
    const customerDistrict = (customer.district || '').trim();
    const isInsideSatkhira =
      customerDistrict.includes('সাতক্ষীরা') ||
      customerCity === 'সাতক্ষীরা' ||
      customerCity === 'সাতক্ষীরার ভেতরে' ||
      customerCity.toLowerCase().includes('satkhira') ||
      customerCity.includes('সাতক্ষীরা');

    const verifiedDeliveryFee = isFreeDelivery
      ? 0
      : isInsideSatkhira
        ? dynamicInside
        : dynamicOutside;

    const totalAmount = subtotalAfterDiscount + verifiedDeliveryFee;

    // 7. Customer Session Check
    const session = await getSessionUser(request);
    const userId = session ? session.id : null;

    // 8. Customer IP & Geolocation Security Extraction
    const clientIp = extractClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const geoInfo = await getIpGeoInfo(clientIp);

    // 9. Automated Courier History Check & Anti-Fraud Engine
    const fraudAssessment = await checkCourierHistoryAndFraud(cleanPhone);
    const initialOrderStatus = fraudAssessment.suggestedOrderStatus || 'pending';

    // 10. Generate Unique Order Number (e.g. SKG-748392)
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `SKG-${randomDigits}`;

    // 11. Create Order in Database
    const newOrder = await Order.create({
      orderNumber,
      user: userId,
      customer: {
        name: customer.name.trim(),
        phone: cleanPhone,
        email: customer.email ? customer.email.trim() : (session?.email || ''),
        division: customer.division ? customer.division.trim() : '',
        district: customer.district ? customer.district.trim() : '',
        upazila: customer.upazila ? customer.upazila.trim() : '',
        address: customer.address.trim(),
        city: customerCity,
        notes: customer.notes || '',
      },
      items: sanitizedItems,
      subtotal: subtotalAfterDiscount,
      deliveryFee: verifiedDeliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: 'unpaid',
      paymentDetails: {
        provider: paymentMethod,
        senderNumber: cleanSenderNumber || cleanPhone,
        transactionId: cleanTrxId,
        submittedAt: cleanTrxId ? new Date() : null,
      },
      orderStatus: initialOrderStatus,
      securityInfo: {
        ipAddress: geoInfo.ipAddress || clientIp,
        city: geoInfo.city || customerCity,
        country: geoInfo.country || 'বাংলাদেশ',
        isp: geoInfo.isp || 'Telecom / ISP Gateway',
        userAgent,
      },
      courierHistory: fraudAssessment.courierHistory,
      fraudRisk: fraudAssessment.fraudRisk,
      fraudReason: fraudAssessment.fraudReason,
    });

    // 12. Safe Stock Decrement Engine
    for (const item of stockToDecrement) {
      try {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      } catch (stockErr) {
        console.warn(`Could not update stock for product ${item.productId}:`, stockErr.message);
      }
    }

    // 13. Auto Recover Abandoned Cart (Closes loop for incomplete checkouts)
    try {
      await AbandonedCart.updateMany(
        {
          'customer.phone': cleanPhone,
          recoveryStatus: { $ne: 'recovered' },
        },
        {
          $set: {
            recoveryStatus: 'recovered',
            notes: `অর্ডার নিশ্চিত করা হয়েছে (#${orderNumber})`,
            lastActivityAt: new Date(),
          },
        }
      );
    } catch (abandonedErr) {
      console.warn('Could not update abandoned cart recovery status:', abandonedErr.message);
    }

    // 14. Invalidate Performance Caches
    invalidateCache('admin_stats');

    return NextResponse.json(
      {
        success: true,
        message:
          initialOrderStatus === 'hold'
            ? 'অর্ডার গৃহীত হয়েছে (নিরাপত্তা যাচাইয়ের জন্য পর্যালোচনাধীন)'
            : 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!',
        order: {
          id: newOrder._id.toString(),
          orderNumber: newOrder.orderNumber,
          totalAmount: newOrder.totalAmount,
          customer: newOrder.customer,
          orderStatus: newOrder.orderStatus,
          fraudRisk: newOrder.fraudRisk,
          paymentMethod: newOrder.paymentMethod,
          paymentDetails: newOrder.paymentDetails,
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
    const authCheck = await requireStaffOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
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

    return NextResponse.json({ orders, userRole: authCheck.user.role });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { message: 'অর্ডার লোড করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
