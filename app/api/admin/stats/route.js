import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
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

    await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);

    // Run parallel aggregation pipelines
    const [
      overallStats,
      todayStatsAgg,
      activeOrdersCount,
      holdOrdersCount,
      pendingOrdersCount,
      deliveredOrdersCount,
      lowStockCount,
      outOfStockCount,
      totalProductsCount,
      totalUsersCount,
      salesTrendAgg,
      bestSellingAgg,
      orderStatusDistribution,
      recentOrders,
    ] = await Promise.all([
      // 1. Overall Revenue & Total Orders
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
          },
        },
      ]),

      // 2. Today's Live Sales & Today's Orders ($match, $group, $sum)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
            orderStatus: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: null,
            todaySales: { $sum: '$totalAmount' },
            todayOrders: { $sum: 1 },
          },
        },
      ]),

      // 3. Active Orders (Pending + Processing + Hold)
      Order.countDocuments({ orderStatus: { $in: ['pending', 'processing', 'hold'] } }),

      // 4. Hold orders (Anti-fraud holds)
      Order.countDocuments({ orderStatus: 'hold' }),

      // 5. Pending
      Order.countDocuments({ orderStatus: 'pending' }),

      // 6. Delivered
      Order.countDocuments({ orderStatus: 'delivered' }),

      // 7. Low stock products (<= 5)
      Product.countDocuments({ stock: { $gt: 0, $lte: 5 }, isDeleted: false }),

      // 8. Out of stock products (= 0)
      Product.countDocuments({ stock: { $lte: 0 }, isDeleted: false }),

      // 9. Total products
      Product.countDocuments({ isDeleted: false }),

      // 10. Total customers
      User.countDocuments({ role: 'user' }),

      // 11. Sales Trend Pipeline (Last 7 Days)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
            orderStatus: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // 12. Best-Selling Products Pipeline ($unwind, $group, $sort)
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            productId: { $first: '$items.productId' },
            image: { $first: '$items.image' },
            unit: { $first: '$items.unit' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 8 },
      ]),

      // 13. Order Status Distribution Breakdown
      Order.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
          },
        },
      ]),

      // 14. Recent 5 Orders
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = overallStats[0]?.totalRevenue || 0;
    const totalOrders = overallStats[0]?.totalOrders || 0;
    const todaySales = todayStatsAgg[0]?.todaySales || 0;
    const todayOrders = todayStatsAgg[0]?.todayOrders || 0;

    // Total pending tasks = Pending orders + Hold orders needing call verification + Low stock products
    const pendingTasks = pendingOrdersCount + holdOrdersCount + lowStockCount;

    // Fetch stagnant inventory (products with stock > 0 and least or 0 sales)
    const bestSellingNames = bestSellingAgg.map((b) => b._id);
    const stagnantProducts = await Product.find({
      name: { $nin: bestSellingNames },
      stock: { $gt: 0 },
      isDeleted: false,
    })
      .select('name price stock unit image categoryName')
      .limit(5);

    // Format 7-day trend with complete days
    const formattedTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const match = salesTrendAgg.find((item) => item._id === key);
      const dayNamesBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
      formattedTrend.push({
        date: key,
        day: dayNamesBn[d.getDay()],
        revenue: match ? match.revenue : 0,
        orders: match ? match.ordersCount : 0,
      });
    }

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        todaySales,
        todayOrders,
        activeOrders: activeOrdersCount,
        pendingOrders: pendingOrdersCount,
        holdOrders: holdOrdersCount,
        deliveredOrders: deliveredOrdersCount,
        pendingTasks,
        totalProducts: totalProductsCount,
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        totalUsers: totalUsersCount,
      },
      salesTrend: formattedTrend,
      bestSellingProducts: bestSellingAgg,
      stagnantProducts,
      statusDistribution: orderStatusDistribution.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentOrders,
    });
  } catch (error) {
    console.error('Advanced Stats Aggregation Error:', error);
    return NextResponse.json(
      { message: 'এনালিটিক্স ডাটা লোড করা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
