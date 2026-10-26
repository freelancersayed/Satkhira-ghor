import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { requireManagerOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    await connectToDatabase();
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json(
      { message: 'কুপন লোড করা সম্ভব হয়নি' },
      { status: 500 }
    );
  }
}

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
    const {
      code,
      description,
      discountType = 'fixed',
      discountAmount,
      minOrderAmount = 0,
      expiryDate,
      usageLimit = 100,
    } = body;

    if (!code || !discountAmount) {
      return NextResponse.json(
        { message: 'কুপন কোড এবং ছাড়ের পরিমাণ আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json(
        { message: 'এই কোডের একটি কুপন ইতিমধ্যে বিদ্যমান রয়েছে' },
        { status: 400 }
      );
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      description: description || '',
      discountType,
      discountAmount: Number(discountAmount),
      minOrderAmount: Number(minOrderAmount) || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      usageLimit: Number(usageLimit) || 100,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'কুপন সফলভাবে যুক্ত হয়েছে',
      coupon: newCoupon,
    }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { message: 'কুপন তৈরি করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'কুপন আইডি আবশ্যক' }, { status: 400 });
    }

    await connectToDatabase();
    await Coupon.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'কুপন মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      { message: 'কুপন মুছতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
