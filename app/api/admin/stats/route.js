import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await connectToDatabase();

    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      allOrders,
      totalUsers,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(5),
      Order.find({ orderStatus: { $ne: 'cancelled' } }).select('totalAmount'),
      User.countDocuments({ role: 'user' }),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        lowStockProducts,
        totalUsers,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { message: 'স্ট্যাটাস লোড করা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
