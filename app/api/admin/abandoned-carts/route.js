import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';
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

    await connectToDatabase();
    const carts = await AbandonedCart.find().sort({ lastActivityAt: -1 }).limit(100);

    return NextResponse.json({ carts });
  } catch (error) {
    console.error('Fetch abandoned carts error:', error);
    return NextResponse.json(
      { message: 'অননুমোদিত কার্ট হিস্টোরি লোড করা যায়নি' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { id, recoveryStatus, notes } = body;

    if (!id || !recoveryStatus) {
      return NextResponse.json({ message: 'আইডি ও স্ট্যাটাস প্রয়োজন' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await AbandonedCart.findByIdAndUpdate(
      id,
      { recoveryStatus, notes },
      { new: true }
    );

    return NextResponse.json({ success: true, cart: updated });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
