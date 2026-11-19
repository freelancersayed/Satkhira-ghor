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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '150', 10);
    const status = searchParams.get('status');

    await connectToDatabase();

    const query = {};
    if (status && status !== 'all') {
      query.recoveryStatus = status;
    }

    const carts = await AbandonedCart.find(query).sort({ lastActivityAt: -1 }).limit(limit);

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
      { recoveryStatus, notes, lastActivityAt: new Date() },
      { new: true }
    );

    return NextResponse.json({ success: true, cart: updated });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ message: 'কার্ট আইডি প্রদান করুন' }, { status: 400 });
    }

    await connectToDatabase();
    await AbandonedCart.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'অসম্পূর্ণ কার্ট রেকর্ড মুছে ফেলা হয়েছে',
    });
  } catch (error) {
    console.error('Delete abandoned cart error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
