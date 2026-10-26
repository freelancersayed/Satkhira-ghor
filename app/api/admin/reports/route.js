import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
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
    const range = searchParams.get('range') || 'weekly'; // 'daily' | 'weekly' | 'monthly' | 'custom'
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    const format = searchParams.get('format'); // 'json' | 'csv'

    await connectToDatabase();

    const now = new Date();
    let startDate = new Date();

    if (range === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'custom' && customStart) {
      startDate = new Date(customStart);
    }

    const endDate = customEnd ? new Date(customEnd) : now;
    // Set end date to end of the day if it's the same date
    endDate.setHours(23, 59, 59, 999);

    const matchQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const orders = await Order.find(matchQuery).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled');
    const validOrders = orders.filter((o) => o.orderStatus !== 'cancelled');

    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDeliveryFees = validOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const netProductSales = validOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / (validOrders.length || 1)) : 0;

    // Handle CSV Export
    if (format === 'csv') {
      const headers = [
        'Order ID',
        'Date',
        'Customer Name',
        'Phone',
        'City',
        'Address',
        'Items Count',
        'Subtotal (BDT)',
        'Delivery Fee (BDT)',
        'Total Amount (BDT)',
        'Payment Method',
        'Order Status',
        'Fraud Risk',
      ];

      const rows = orders.map((o) => [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleDateString('en-GB')}"`,
        `"${(o.customer?.name || '').replace(/"/g, '""')}"`,
        `"${o.customer?.phone || ''}"`,
        `"${(o.customer?.city || '').replace(/"/g, '""')}"`,
        `"${(o.customer?.address || '').replace(/"/g, '""')}"`,
        o.items?.length || 0,
        o.subtotal || 0,
        o.deliveryFee || 0,
        o.totalAmount || 0,
        `"${o.paymentMethod || 'cod'}"`,
        `"${o.orderStatus || 'pending'}"`,
        `"${o.fraudRisk || 'low'}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="satkhira-ghor-sales-report-${range}.csv"`,
        },
      });
    }

    return NextResponse.json({
      summary: {
        range,
        startDate,
        endDate,
        totalOrders,
        validOrdersCount: validOrders.length,
        completedOrdersCount: completedOrders.length,
        cancelledOrdersCount: cancelledOrders.length,
        totalRevenue,
        netProductSales,
        totalDeliveryFees,
        averageOrderValue,
      },
      orders,
    });
  } catch (error) {
    console.error('Sales Report Query Error:', error);
    return NextResponse.json(
      { message: 'সেলস রিপোর্ট তৈরি করতে ব্যর্থ হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
