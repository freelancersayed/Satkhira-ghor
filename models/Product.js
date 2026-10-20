import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'পণ্যের নাম প্রদান করুন'],
      trim: true,
    },
    nameEn: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      required: [true, 'পণ্যের স্লাগ প্রদান করুন'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'ক্যাটাগরি সিলেক্ট করুন'],
      trim: true,
    },
    categoryName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'পণ্যের মূল্য প্রদান করুন'],
      min: [0, 'মূল্য ০ বা তার বেশি হতে হবে'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    unit: {
      type: String,
      default: '১ কেজি (1 kg)',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'স্টক সংখ্যা প্রদান করুন'],
      default: 10,
      min: 0,
    },
    badge: {
      type: String,
      default: '',
    },
    badgeType: {
      type: String,
      enum: ['forest', 'honey', 'ochre'],
      default: 'forest',
    },
    image: {
      type: String,
      required: [true, 'পণ্যের প্রধান ছবির লিংক প্রদান করুন'],
    },
    images: {
      type: [String],
      default: [],
    },
    shortDescription: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    origin: {
      type: String,
      default: 'সুন্দরবন ও সাতক্ষীরা',
    },
    harvestDate: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    nutritionalInfo: {
      type: Map,
      of: String,
      default: {},
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
