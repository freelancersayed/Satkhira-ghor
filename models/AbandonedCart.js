import mongoose from 'mongoose';

const AbandonedCartSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, default: 'অজ্ঞাত ক্রেতা' },
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, default: '' },
      city: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        unit: { type: String, default: '' },
        image: { type: String, default: '' },
      },
    ],
    cartTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    step: {
      type: String,
      enum: ['cart_viewed', 'checkout_initiated', 'address_entered', 'payment_aborted'],
      default: 'checkout_initiated',
    },
    recoveryStatus: {
      type: String,
      enum: ['pending', 'contacted', 'recovered', 'lost'],
      default: 'pending',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', AbandonedCartSchema);
