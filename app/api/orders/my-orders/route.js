import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authCheck = await requireAuth(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { user } = authCheck;
    await connectToDatabase();

    // Find orders placed by user ID OR using the user's registered phone number
    const query = {
      $or: [
        { user: user.id },
        { 'customer.phone': user.phone },
      ],
    };

    if (user.email) {
      query.$or.push({ 'customer.email': user.email.toLowerCase() });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch my-orders error:', error);
    return NextResponse.json(
      { message: 'অর্ডার তালিকা লোড করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
