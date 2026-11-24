/**
 * Storefront Tools for Satkhira Ghor Customer AI Agent
 * Strictly Read-Only Database Queries
 */

import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { deliveryConfig } from '@/lib/deliveryConfig';

// Tool Declarations for Gemini Function Calling
export const storefrontToolDeclarations = [
  {
    name: 'search_catalog',
    description:
      'Search live products in the Satkhira Ghor store catalog from MongoDB. Useful when customer asks about products, stock, prices, categories, or pure honey/ghee/oil.',
    parameters: {
      type: 'OBJECT',
      properties: {
        keyword: {
          type: 'STRING',
          description: 'Product name or search keyword e.g. মধু, ঘি, তেল, হলুদ, কম্বো, khalsi honey',
        },
        category: {
          type: 'STRING',
          description: 'Category name or slug if specified e.g. honey, ghee, spices, oil',
        },
        healthBenefit: {
          type: 'STRING',
          description: 'Health concern e.g. ডায়াবেটিস, গ্যাস্ট্রিক, সর্দি-কাশি, স্কিন কেয়ার, রোগপ্রতিরোধ',
        },
      },
    },
  },
  {
    name: 'track_customer_order',
    description:
      'Track real-time order delivery and courier status using customer phone number or order number (e.g. SKG-123456 or 017xxxxxxxx).',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: {
          type: 'STRING',
          description: 'Customer 11-digit phone number or order number (SKG-...)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_store_policy_and_delivery',
    description:
      'Get official store policies, delivery charges (inside/outside Dhaka & Satkhira), free shipping threshold, and payment methods (COD, bKash, Nagad).',
    parameters: {
      type: 'OBJECT',
      properties: {
        topic: {
          type: 'STRING',
          description: 'Specific topic e.g. delivery, payment, return, refund, hotline',
        },
      },
    },
  },
];

// Tool Execution Dispatcher
export async function executeStorefrontTool(toolName, args = {}) {
  await connectToDatabase();

  switch (toolName) {
    case 'search_catalog': {
      const { keyword = '', category = '', healthBenefit = '' } = args;
      const query = { isDeleted: { $ne: true } };

      const conditions = [];

      if (keyword) {
        const regex = new RegExp(keyword.trim(), 'i');
        conditions.push({
          $or: [
            { name: regex },
            { nameEn: regex },
            { categoryName: regex },
            { shortDescription: regex },
            { description: regex },
            { tags: regex },
            { badge: regex },
          ],
        });
      }

      if (category) {
        conditions.push({
          $or: [
            { category: new RegExp(category.trim(), 'i') },
            { categoryName: new RegExp(category.trim(), 'i') },
          ],
        });
      }

      if (healthBenefit) {
        const regex = new RegExp(healthBenefit.trim(), 'i');
        conditions.push({
          $or: [
            { benefits: regex },
            { description: regex },
            { shortDescription: regex },
            { name: regex },
          ],
        });
      }

      if (conditions.length > 0) {
        query.$and = conditions;
      }

      const products = await Product.find(query)
        .sort({ stock: -1, createdAt: -1 })
        .limit(6)
        .select('name slug price originalPrice unit stock image categoryName badge shortDescription benefits')
        .lean();

      return {
        count: products.length,
        products: products.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          price: p.price,
          originalPrice: p.originalPrice || null,
          unit: p.unit || '১ কেজি',
          stock: p.stock ?? 10,
          inStock: (p.stock ?? 10) > 0,
          image: p.image || '/uploads/upload_1795353755877_oioatm.png',
          category: p.categoryName || '',
          badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
          shortDescription: p.shortDescription || '',
          benefits: Array.isArray(p.benefits) ? p.benefits.slice(0, 3) : [],
        })),
      };
    }

    case 'track_customer_order': {
      const { query = '' } = args;
      const clean = query.trim();
      if (!clean) {
        return { found: false, message: 'সঠিক ফোন নম্বর বা অর্ডার কোড দেওয়া হয়নি।' };
      }

      const cleanPhone = clean.replace(/[^0-9]/g, '');
      const filter = {
        $or: [
          { orderNumber: clean.toUpperCase() },
          { 'customer.phone': cleanPhone.length >= 10 ? cleanPhone : clean },
        ],
      };

      const orders = await Order.find(filter)
        .sort({ createdAt: -1 })
        .limit(3)
        .select('orderNumber customer totalAmount orderStatus paymentMethod paymentStatus courierBooking createdAt items')
        .lean();

      if (!orders || orders.length === 0) {
        return {
          found: false,
          query: clean,
          message: `"${clean}" তথ্যের সাথে কোনো অর্ডার পাওয়া যায়নি। সঠিক মোবাইল নম্বর দিন।`,
        };
      }

      return {
        found: true,
        orders: orders.map((o) => ({
          orderNumber: o.orderNumber,
          customerName: o.customer?.name,
          totalAmount: o.totalAmount,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('bn-BD') : '',
          itemCount: o.items?.length || 1,
          courier: o.courierBooking?.isBooked
            ? {
                provider: o.courierBooking.courierName,
                trackingCode: o.courierBooking.trackingCode,
                status: 'ইন-ট্রানজিট (শিপড)',
              }
            : { status: 'প্রস্তুত হচ্ছে (প্যাকিং চলছে)' },
        })),
      };
    }

    case 'get_store_policy_and_delivery': {
      return {
        delivery: {
          insideSatkhira: `৳${deliveryConfig.insideSatkhira || 70}`,
          outsideSatkhira: `৳${deliveryConfig.outsideSatkhira || 120}`,
          freeDeliveryThreshold: `৳${deliveryConfig.freeDeliveryThreshold} বা তদূর্ধ্ব অর্ডারে সারা দেশে ডেলিভারি সম্পূর্ণ ফ্রি!`,
          deliveryTimeline: 'সাতক্ষীরার ভেতরে ২৪ ঘণ্টা, সাতক্ষীরার বাইরে ২-৩ দিন।',
        },
        paymentMethods: [
          'ক্যাশ অন ডেলিভারি (COD) - সারা দেশে পণ্য হাতে পেয়ে টাকা পরিশোধ',
          'বিকাশ (bKash Send Money) - ট্রানজেকশন আইডি দিয়ে নিরাপদ পেমেন্ট',
          'নগদ (Nagad Send Money) - সরাসরি অনলাইন পেমেন্ট',
        ],
        support: {
          phone: deliveryConfig.supportPhone,
          whatsapp: deliveryConfig.supportPhone,
          hours: 'সকাল ৯টা - রাত ১০টা (সপ্তাহের ৭ দিন)',
        },
        purityGuarantee: '১০০% প্রাকৃতিক সুন্দরবনের খাঁটি পণ্য। কোনো ভেজাল বা ক্ষতিকর উপাদান নেই। সম্পূর্ণ রিফান্ড গ্যারান্টি।',
      };
    }

    default:
      return { error: `অজানা টুল: ${toolName}` };
  }
}
