import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import AbandonedCart from '@/models/AbandonedCart';

export const dynamic = 'force-dynamic';

const bnToEn = (str) =>
  (str || '').replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d));

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, cartTotal = 0, step = 'checkout_initiated' } = body;

    if (!customer || !customer.phone) {
      return NextResponse.json({ message: 'Phone number required' }, { status: 400 });
    }

    const rawPhone = bnToEn(customer.phone);
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    // Must be at least 11 digits (e.g. 017XXXXXXXX)
    if (cleanPhone.length < 11) {
      return NextResponse.json({ message: 'Valid 11-digit phone required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Cart items required' }, { status: 400 });
    }

    await connectToDatabase();

    const sanitizedItems = items.map((it) => ({
      productId: it.id || it.productId || it.slug || 'prod',
      name: it.name || 'পণ্য',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      unit: it.unit || '',
      image: it.image || '',
    }));

    // Find if there is an active (unrecovered) abandoned cart for this phone
    const cart = await AbandonedCart.findOneAndUpdate(
      {
        'customer.phone': cleanPhone,
        recoveryStatus: { $ne: 'recovered' },
      },
      {
        customer: {
          name: (customer.name || 'অজ্ঞাত ক্রেতা').trim(),
          phone: cleanPhone,
          email: (customer.email || '').trim(),
          city: (customer.city || 'ঢাকা').trim(),
          address: (customer.address || '').trim(),
        },
        items: sanitizedItems,
        cartTotal: Number(cartTotal) || 0,
        step: customer.address?.trim() ? 'address_entered' : step,
        lastActivityAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      cartId: cart._id,
      message: 'Cart tracking updated',
    });
  } catch (error) {
    console.error('Abandoned cart auto-capture error:', error);
    return NextResponse.json(
      { message: 'Failed to record abandoned cart: ' + error.message },
      { status: 500 }
    );
  }
}
