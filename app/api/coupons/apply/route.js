import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) {
      return NextResponse.json({ message: 'কুপন কোড প্রদান করুন' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check fallback coupons
    if (cleanCode === 'SATKHIRA100') {
      return NextResponse.json({
        success: true,
        discount: 100,
        message: 'অভিনন্দন! ১০০ টাকা ছাড় প্রযোজ্য হয়েছে।',
      });
    }

    if (cleanCode === 'SUNDARBAN') {
      const disc = Math.round(Number(subtotal || 0) * 0.1);
      return NextResponse.json({
        success: true,
        discount: disc,
        message: `অভিনন্দন! ১০% (৳${disc}) বিশেষ ছাড় প্রযোজ্য হয়েছে।`,
      });
    }

    // Check dynamic MongoDB Coupon database
    await connectToDatabase();
    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });

    if (!coupon) {
      return NextResponse.json({ message: 'কুপন কোডটি সঠিক নয় বা মেয়াদোত্তীর্ণ হয়েছে' }, { status: 404 });
    }

    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ message: 'এই কুপনটির মেয়াদ শেষ হয়ে গেছে' }, { status: 400 });
    }

    if (coupon.minOrderAmount && Number(subtotal || 0) < coupon.minOrderAmount) {
      return NextResponse.json(
        { message: `এই কুপনটি ব্যবহার করতে ন্যূনতম ৳${coupon.minOrderAmount} টাকার অর্ডার প্রয়োজন` },
        { status: 400 }
      );
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.round((Number(subtotal || 0) * coupon.discountAmount) / 100);
      if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
        calculatedDiscount = coupon.maxDiscountAmount;
      }
    } else {
      calculatedDiscount = coupon.discountAmount;
    }

    return NextResponse.json({
      success: true,
      discount: calculatedDiscount,
      message: `অভিনন্দন! "${coupon.code}" কুপনে ৳${calculatedDiscount} ছাড় প্রযোজ্য হয়েছে।`,
    });
  } catch (error) {
    return NextResponse.json({ message: 'কুপন যাচাই করা সম্ভব হয়নি: ' + error.message }, { status: 500 });
  }
}
