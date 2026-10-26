import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tierFilter = searchParams.get('tier'); // 'all' | 'vip' | 'regular' | 'new'

    await connectToDatabase();

    // Aggregate unique customer metrics by customer phone number
    const customerAgg = await Order.aggregate([
      {
        $group: {
          _id: '$customer.phone',
          name: { $first: '$customer.name' },
          email: { $first: '$customer.email' },
          city: { $first: '$customer.city' },
          address: { $first: '$customer.address' },
          totalOrders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $ne: ['$orderStatus', 'cancelled'] }, '$totalAmount', 0],
            },
          },
          deliveredCount: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0],
            },
          },
          cancelledCount: {
            $sum: {
              $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0],
            },
          },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' },
          latestFraudRisk: { $last: '$fraudRisk' },
          recentOrders: {
            $push: {
              orderNumber: '$orderNumber',
              totalAmount: '$totalAmount',
              orderStatus: '$orderStatus',
              createdAt: '$createdAt',
              itemsCount: { $size: '$items' },
            },
          },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    let formattedCustomers = customerAgg.map((c) => {
      const successRate = c.totalOrders > 0
        ? Math.round(((c.totalOrders - c.cancelledCount) / c.totalOrders) * 100)
        : 100;

      let tier = 'New';
      if (c.totalSpent >= 5000 || c.totalOrders >= 5) {
        tier = 'VIP';
      } else if (c.totalOrders >= 2) {
        tier = 'Regular';
      }

      const aov = c.totalOrders > 0 ? Math.round(c.totalSpent / c.totalOrders) : 0;

      return {
        phone: c._id,
        name: c.name || 'সম্মানিত ক্রেতা',
        email: c.email || '',
        city: c.city || 'ঢাকা',
        address: c.address || '',
        totalOrders: c.totalOrders,
        totalSpent: c.totalSpent,
        averageOrderValue: aov,
        deliveredCount: c.deliveredCount,
        cancelledCount: c.cancelledCount,
        successRate,
        tier,
        fraudRisk: c.latestFraudRisk || (successRate >= 80 ? 'low' : successRate >= 50 ? 'medium' : 'high'),
        lastOrderDate: c.lastOrderDate,
        firstOrderDate: c.firstOrderDate,
        recentOrders: (c.recentOrders || []).slice(-5).reverse(),
      };
    });

    if (search) {
      const s = search.toLowerCase();
      formattedCustomers = formattedCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          c.city.toLowerCase().includes(s)
      );
    }

    if (tierFilter && tierFilter !== 'all') {
      formattedCustomers = formattedCustomers.filter(
        (c) => c.tier.toLowerCase() === tierFilter.toLowerCase()
      );
    }

    const totalLtv = formattedCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const vipCount = formattedCustomers.filter((c) => c.tier === 'VIP').length;

    return NextResponse.json({
      customers: formattedCustomers,
      summary: {
        totalUniqueCustomers: formattedCustomers.length,
        totalLtv,
        vipCount,
      },
    });
  } catch (error) {
    console.error('CRM Fetch error:', error);
    return NextResponse.json(
      { message: 'কাস্টমার ডিরেক্টরি লোড করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
