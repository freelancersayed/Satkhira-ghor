import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireStaffOrAdmin, getSessionUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectToDatabase();

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      return NextResponse.json({ message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const staffCheck = await requireStaffOrAdmin(request);
    if (staffCheck.error) {
      return NextResponse.json(
        { message: staffCheck.error },
        { status: staffCheck.status }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { orderStatus, paymentStatus } = body;

    await connectToDatabase();

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'অর্ডার স্ট্যাটাস আপডেট করা হয়েছে',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { message: 'অর্ডার আপডেট করা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
