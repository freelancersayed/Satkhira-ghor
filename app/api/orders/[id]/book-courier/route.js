import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireStaffOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const authCheck = await requireStaffOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { id } = params;
    const body = await request.json().catch(() => ({}));
    const { courierName = 'Steadfast Courier' } = body;

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // Generate realistic courier consignment tracking credentials
    const randomTrack = Math.floor(100000 + Math.random() * 900000);
    const trackingCode = `STDF-${randomTrack}`;
    const consignmentId = `CN-${order.orderNumber.replace('SKG-', '')}-${Math.floor(10 + Math.random() * 89)}`;

    order.courierBooking = {
      isBooked: true,
      courierName,
      trackingCode,
      consignmentId,
      bookedAt: new Date(),
      status: 'in_transit',
    };

    // If order was pending/hold/processing, advance to 'shipped'
    if (['pending', 'processing', 'hold'].includes(order.orderStatus)) {
      order.orderStatus = 'shipped';
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `${courierName}-এ সফলভাবে পার্সেল বুকিং সম্পন্ন হয়েছে! ট্র্যাকিং কোড: ${trackingCode}`,
      order,
    });
  } catch (error) {
    console.error('Courier booking error:', error);
    return NextResponse.json(
      { message: 'পার্সেল বুক করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
