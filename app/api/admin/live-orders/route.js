import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireStaffOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    const since = searchParams.get('since');

    await connectToDatabase();

    const query = {};
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        query.createdAt = { $gt: sinceDate };
      }
    }

    // Fetch orders placed since the timestamp, or the most recent 10 if initial
    const newOrders = await Order.find(query).sort({ createdAt: -1 }).limit(20);

    const serverTime = new Date().toISOString();

    return NextResponse.json({
      newOrders,
      serverTime,
    });
  } catch (error) {
    console.error('Live orders polling error:', error);
    return NextResponse.json(
      { message: 'লাইভ অর্ডার চেক করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
