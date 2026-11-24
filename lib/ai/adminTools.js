/**
 * Admin Autonomous Tools for Satkhira Ghor AI Co-Pilot
 * Autonomous Database Operations with Security Verification & Cache Invalidation
 */

import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import SiteContent from '@/models/SiteContent';
import Order from '@/models/Order';
import AbandonedCart from '@/models/AbandonedCart';
import Coupon from '@/models/Coupon';
import { invalidateCache } from '@/lib/performance';

export const adminToolDeclarations = [
  {
    name: 'create_product_autonomous',
    description:
      'Autonomous Product Creation: Create and publish a new product in the store with automatic SEO slug, category linking, and stock inventory.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: {
          type: 'STRING',
          description: 'Full product name in Bengali e.g. সুন্দরবনের খাঁটি খলিশা মধু',
        },
        price: {
          type: 'NUMBER',
          description: 'Selling price in BDT (টাকা)',
        },
        originalPrice: {
          type: 'NUMBER',
          description: 'Regular or strikethrough price before discount (optional)',
        },
        stock: {
          type: 'NUMBER',
          description: 'Initial inventory stock quantity (default: 20)',
        },
        category: {
          type: 'STRING',
          description: 'Category name or slug e.g. honey, ghee, spices, oil, snacks, খাঁটি মধু',
        },
        unit: {
          type: 'STRING',
          description: 'Packaging unit e.g. ৫০০ গ্রাম, ১ কেজি, ১ লিটার, ২৫০ গ্রাম',
        },
        badge: {
          type: 'STRING',
          description: 'Marketing badge e.g. ১০০% খাঁটি, নতুন আগমন, সুন্দরবনের সংগ্রহ, বেস্টসেলার',
        },
        image: {
          type: 'STRING',
          description: 'Permanent Image URL of the product (if an image was uploaded by admin or provided in context)',
        },
        shortDescription: {
          type: 'STRING',
          description: 'Concise 1-2 sentence highlight for customer preview',
        },
        benefits: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'List of health benefits and key qualities',
        },
      },
      required: ['name', 'price', 'category'],
    },
  },
  {
    name: 'get_store_analytics',
    description:
      'Get executive business intelligence report: total orders, total revenue, low stock alert (<5 items), pending orders, and recent performance.',
    parameters: {
      type: 'OBJECT',
      properties: {
        timeframe: {
          type: 'STRING',
          description: 'Timeframe for analysis: today, week, month, or all',
        },
      },
    },
  },
  {
    name: 'update_order_status',
    description:
      'Update order delivery status or payment status by Order Number (SKG-...) or Order ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        orderNumber: {
          type: 'STRING',
          description: 'Order Number (e.g. SKG-748392)',
        },
        orderStatus: {
          type: 'STRING',
          description: 'New status: hold, pending, processing, shipped, delivered, cancelled',
        },
        paymentStatus: {
          type: 'STRING',
          description: 'New payment status: paid, unpaid',
        },
      },
      required: ['orderNumber'],
    },
  },
  {
    name: 'get_abandoned_carts_report',
    description:
      'Scan incomplete checkout drop-offs (abandoned carts) to identify recovery opportunities and potential lost revenue.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: {
          type: 'NUMBER',
          description: 'Number of recent abandoned records to inspect (default: 10)',
        },
      },
    },
  },
  {
    name: 'create_promo_coupon',
    description:
      'Create and activate a new promotional discount coupon code for customer sales campaigns.',
    parameters: {
      type: 'OBJECT',
      properties: {
        code: {
          type: 'STRING',
          description: 'Coupon code in capital letters e.g. EID100, FLASH50',
        },
        discountType: {
          type: 'STRING',
          description: 'Type of discount: fixed or percentage',
        },
        discountAmount: {
          type: 'NUMBER',
          description: 'Amount of discount (e.g. 100 for 100 taka, or 10 for 10%)',
        },
        minOrderAmount: {
          type: 'NUMBER',
          description: 'Minimum cart subtotal to apply this coupon',
        },
      },
      required: ['code', 'discountAmount'],
    },
  },
];

// Helper to generate slug from Bengali or English title
function generateCleanSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (base && base.length >= 3) {
    return `${base}-${Date.now().toString().slice(-4)}`;
  }
  return `satkhira-item-${Date.now().toString().slice(-6)}`;
}

// Admin Tool Execution Dispatcher
export async function executeAdminTool(toolName, args = {}) {
  await connectToDatabase();

  switch (toolName) {
    case 'create_product_autonomous': {
      const {
        name,
        price,
        originalPrice,
        stock = 20,
        category,
        unit = '১ কেজি',
        badge = '১০০% খাঁটি',
        image,
        shortDescription,
        benefits = [],
      } = args;

      if (!name || !price) {
        return { success: false, message: 'পণ্যের নাম ও দাম আবশ্যক।' };
      }

      // Check or create Category in SiteContent
      let catSlug = 'general';
      let catName = 'খাঁটি পণ্য';

      if (category) {
        const catClean = category.trim();
        const catDoc = await SiteContent.findOne({ key: 'categories' }).lean();
        const existingCats = Array.isArray(catDoc?.data) ? catDoc.data : [];

        const matched = existingCats.find(
          (c) =>
            (c.name && c.name.toLowerCase() === catClean.toLowerCase()) ||
            (c.slug && c.slug.toLowerCase() === catClean.toLowerCase())
        );

        if (matched) {
          catSlug = matched.slug;
          catName = matched.name;
        } else {
          catSlug = generateCleanSlug(catClean);
          catName = catClean;
          try {
            const newCat = {
              id: catSlug,
              name: catName,
              nameEn: catClean,
              slug: catSlug,
              icon: '🌿',
              image: '/uploads/upload_1795353755877_oioatm.png',
              description: `সাতক্ষীরা ঘর - ${catName}`,
            };
            await SiteContent.findOneAndUpdate(
              { key: 'categories' },
              { $push: { data: newCat } },
              { upsert: true }
            );
          } catch (e) {
            console.warn('Auto category create warning:', e.message);
          }
        }
      }

      const slug = generateCleanSlug(name);
      const numPrice = Number(price) || 0;
      const numOrig = originalPrice ? Number(originalPrice) : null;
      const numStock = Math.max(0, parseInt(stock) || 10);

      const newProduct = await Product.create({
        name: name.trim(),
        nameEn: '',
        slug,
        category: catSlug,
        categoryName: catName,
        price: numPrice,
        originalPrice: numOrig,
        stock: numStock,
        unit: unit.trim(),
        badge: badge.trim(),
        badgeType: 'forest',
        shortDescription:
          shortDescription ||
          `${name} - সাতক্ষীরা অঞ্চলের ১০০% প্রাকৃতিক উপাদানে সংগৃহীত সম্পূর্ণ খাঁটি ও স্বাস্থ্যসম্মত পণ্য।`,
        description: `${name} সাতক্ষীরা ঘর-এর বিশেষ তত্ত্বাবধানে সংগৃহীত ও প্রস্তুতকৃত। কোনো কৃত্রিম প্রিজারভেটিভ, ভেজাল বা কেমিক্যাল ছাড়া সম্পূর্ণ প্রাকৃতিক উপায়ে আপনাদের কাছে পৌঁছে দেওয়া হয়।`,
        origin: 'সুন্দরবন ও সাতক্ষীরা অঞ্চল',
        packaging: 'ফুড-গ্রেড সিল্ড প্যাকেজিং',
        purityGuarantee: '১০০% ক্যাশব্যাক রিটার্ন ও খাঁটি পণ্যের নিশ্চয়তা',
        benefits: Array.isArray(benefits) && benefits.length > 0 ? benefits : ['প্রাকৃতিক পুষ্টিগুণে ভরপুর', 'রোগপ্রতিরোধ ক্ষমতা বৃদ্ধি করে', '১০০% স্বাস্থ্যসম্মত ও কেমিক্যালমুক্ত'],
        image: image || args.contextImageUrl || '/uploads/upload_1795353755877_oioatm.png',
        images: (image || args.contextImageUrl) ? [image || args.contextImageUrl] : [],
        rating: 5.0,
        reviewCount: 1,
      });

      // Invalidate system caches
      invalidateCache('products');
      invalidateCache('admin_stats');
      invalidateCache('categories');

      return {
        success: true,
        message: `"${newProduct.name}" সফলভাবে স্টোরে তৈরি ও পাবলিশ করা হয়েছে!`,
        product: {
          id: newProduct._id.toString(),
          name: newProduct.name,
          slug: newProduct.slug,
          price: newProduct.price,
          stock: newProduct.stock,
          categoryName: newProduct.categoryName,
          unit: newProduct.unit,
          badge: newProduct.badge,
          productUrl: `/products/${newProduct.slug}`,
        },
      };
    }

    case 'get_store_analytics': {
      const { timeframe = 'all' } = args;

      const [orders, products, abandonedCount] = await Promise.all([
        Order.find({}).select('totalAmount orderStatus paymentStatus createdAt').lean(),
        Product.find({ isDeleted: { $ne: true } }).select('name stock price').lean(),
        AbandonedCart.countDocuments({ recoveryStatus: 'pending' }),
      ]);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
      const holdOrders = orders.filter((o) => o.orderStatus === 'hold').length;
      const shippedOrders = orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'delivered').length;
      const paidOrders = orders.filter((o) => o.paymentStatus === 'paid').length;

      const lowStockProducts = products
        .filter((p) => typeof p.stock === 'number' && p.stock <= 5)
        .map((p) => ({ name: p.name, stock: p.stock, price: p.price }));

      const totalProductsCount = products.length;

      return {
        summary: {
          totalRevenue: `৳${totalRevenue.toLocaleString('en-US')}`,
          totalOrders,
          pendingOrders,
          holdOrders,
          shippedOrders,
          paidOrders,
          unpaidOrders: totalOrders - paidOrders,
          totalProductsCount,
          abandonedCartsPending: abandonedCount,
        },
        lowStockAlerts: lowStockProducts.slice(0, 5),
        timeframe,
      };
    }

    case 'update_order_status': {
      const { orderNumber, orderStatus, paymentStatus } = args;
      if (!orderNumber) {
        return { success: false, message: 'অর্ডার নম্বর প্রদান করুন।' };
      }

      const updateData = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;

      const updated = await Order.findOneAndUpdate(
        { orderNumber: orderNumber.trim().toUpperCase() },
        { $set: updateData },
        { new: true }
      ).select('orderNumber customer orderStatus paymentStatus totalAmount');

      if (!updated) {
        return { success: false, message: `"#${orderNumber}" অর্ডারটি ডাটাবেসে পাওয়া যায়নি।` };
      }

      invalidateCache('admin_stats');

      return {
        success: true,
        message: `অর্ডার #${updated.orderNumber} সফলভাবে আপডেট করা হয়েছে।`,
        order: {
          orderNumber: updated.orderNumber,
          customerName: updated.customer?.name,
          orderStatus: updated.orderStatus,
          paymentStatus: updated.paymentStatus,
          totalAmount: updated.totalAmount,
        },
      };
    }

    case 'get_abandoned_carts_report': {
      const { limit = 8 } = args;
      const carts = await AbandonedCart.find({ recoveryStatus: { $ne: 'recovered' } })
        .sort({ lastActivityAt: -1 })
        .limit(limit)
        .lean();

      const totalPotentialLoss = carts.reduce((sum, c) => sum + (Number(c.cartTotal) || 0), 0);

      return {
        pendingCount: carts.length,
        totalPotentialLoss: `৳${totalPotentialLoss}`,
        recentDropOffs: carts.map((c) => ({
          customerName: c.customer?.name || 'অজ্ঞাত',
          phone: c.customer?.phone,
          city: c.customer?.city,
          cartTotal: `৳${c.cartTotal}`,
          itemCount: c.items?.length || 1,
          step: c.step,
          recoveryStatus: c.recoveryStatus,
        })),
      };
    }

    case 'create_promo_coupon': {
      const { code, discountType = 'fixed', discountAmount, minOrderAmount = 500 } = args;
      if (!code || !discountAmount) {
        return { success: false, message: 'কুপন কোড ও ছাড়ের পরিমাণ প্রয়োজন।' };
      }

      const cleanCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return { success: false, message: `"${cleanCode}" কুপনটি ইতোমধ্যেই বিদ্যমান রয়েছে।` };
      }

      const coupon = await Coupon.create({
        code: cleanCode,
        discountType,
        discountAmount: Number(discountAmount),
        minOrderAmount: Number(minOrderAmount),
        isActive: true,
      });

      return {
        success: true,
        message: `কুপন "${coupon.code}" সফলভাবে তৈরি ও সক্রিয় করা হয়েছে!`,
        coupon: {
          code: coupon.code,
          discount: discountType === 'percentage' ? `${coupon.discountAmount}%` : `৳${coupon.discountAmount}`,
          minOrder: `৳${coupon.minOrderAmount}`,
        },
      };
    }

    default:
      return { error: `অজানা অ্যাডমিন টুল: ${toolName}` };
  }
}
