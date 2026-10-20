import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryStr = searchParams.get('q') || searchParams.get('orderNumber') || searchParams.get('phone');

    if (!queryStr) {
      return NextResponse.json(
        { message: 'অর্ডার নম্বর অথবা মোবাইল নম্বর লিখুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const cleanQuery = queryStr.trim();

    const orders = await Order.find({
      $or: [
        { orderNumber: cleanQuery.toUpperCase() },
        { 'customer.phone': cleanQuery },
      ],
    })
      .sort({ createdAt: -1 })
      .select('-customer.notes');

    if (orders.length === 0) {
      return NextResponse.json(
        { message: 'এই তথ্যের সাথে কোনো অর্ডার পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Order tracking error:', error);
    return NextResponse.json(
      { message: 'অর্ডার ট্র্যাক করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
