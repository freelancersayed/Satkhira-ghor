import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Nullable for guest checkout!
    },
    customer: {
      name: {
        type: String,
        required: [true, 'গ্রাহকের নাম প্রদান করুন'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'মোবাইল নম্বর প্রদান করুন'],
        trim: true,
        index: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
        index: true,
      },
      address: {
        type: String,
        required: [true, 'ডেলিভারি ঠিকানা প্রদান করুন'],
        trim: true,
      },
      city: {
        type: String,
        default: 'ঢাকা',
        trim: true,
      },
      notes: {
        type: String,
        default: '',
      },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'অর্ডারে অন্তত একটি পণ্য থাকতে হবে'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 100,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bkash', 'nagad'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
