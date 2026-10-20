import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userPhone: {
      type: String,
      default: '',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSlug: {
      type: String,
      required: true,
      index: true,
    },
    productImage: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'রেটিং প্রদান করুন (১ থেকে ৫)'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'আপনার মতামত বা রিভিউ লিখুন'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    orderId: {
      type: String,
      default: '',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'hidden'],
      default: 'approved',
      index: true,
    },
    adminReply: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple reviews on the same product by the same user, or allow updating
ReviewSchema.index({ product: 1, user: 1 });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
