import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { requireStaffOrAdmin } from '@/lib/auth';
import { invalidateCache } from '@/lib/performance';

export const dynamic = 'force-dynamic';

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

    // 1. Fetch current order state before modification
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return NextResponse.json({ message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    const updateData = {};
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    // 2. Intelligent Stock Restoration / Re-decrement Engine
    if (orderStatus && orderStatus !== existingOrder.orderStatus) {
      updateData.orderStatus = orderStatus;

      // Case A: Moving from active status to 'cancelled' -> Restore Stock
      if (orderStatus === 'cancelled' && existingOrder.orderStatus !== 'cancelled') {
        for (const item of existingOrder.items || []) {
          const rawId = item.productId;
          if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
            await Product.findByIdAndUpdate(rawId, {
              $inc: { stock: Math.max(1, parseInt(item.quantity) || 1) },
            });
          }
        }
        invalidateCache('products');
      }

      // Case B: Reactivating an order from 'cancelled' to an active status -> Deduct Stock
      else if (existingOrder.orderStatus === 'cancelled' && orderStatus !== 'cancelled') {
        for (const item of existingOrder.items || []) {
          const rawId = item.productId;
          if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
            await Product.findByIdAndUpdate(rawId, {
              $inc: { stock: -Math.max(1, parseInt(item.quantity) || 1) },
            });
          }
        }
        invalidateCache('products');
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

    invalidateCache('admin_stats');

    return NextResponse.json({
      message: 'অর্ডার সফলভাবে আপডেট করা হয়েছে',
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

export async function DELETE(request, { params }) {
  try {
    const staffCheck = await requireStaffOrAdmin(request);
    if (staffCheck.error) {
      return NextResponse.json(
        { message: staffCheck.error },
        { status: staffCheck.status }
      );
    }

    const { id } = params;
    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' }, { status: 404 });
    }

    // If order was active (not cancelled), restore product inventory before removing
    if (order.orderStatus !== 'cancelled') {
      for (const item of order.items || []) {
        const rawId = item.productId;
        if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
          await Product.findByIdAndUpdate(rawId, {
            $inc: { stock: Math.max(1, parseInt(item.quantity) || 1) },
          });
        }
      }
      invalidateCache('products');
    }

    await Order.findByIdAndDelete(id);

    invalidateCache('admin_stats');

    return NextResponse.json({
      success: true,
      message: `অর্ডার #${order.orderNumber} সফলভাবে ডিলিট করা হয়েছে`,
    });
  } catch (error) {
    console.error('Delete order error:', error);
    return NextResponse.json(
      { message: 'অর্ডার ডিলিট করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
