import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';
import { products } from '@/data/products';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    await connectToDatabase();

    // 1. Seed Roles (Admin, Manager, Staff for RBAC demonstration)
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@satkhiraghor.com';
    const adminPhone = process.env.DEFAULT_ADMIN_PHONE || '01700000000';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({ phone: adminPhone });
    if (!admin) {
      const hashedPassword = await hashPassword(adminPassword);
      admin = await User.create({
        name: 'সাতক্ষীরা ঘর অ্যাডমিন (Admin)',
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        address: 'সাতক্ষীরা সদর',
        city: 'সাতক্ষীরা',
      });
    }

    // Manager User
    let manager = await User.findOne({ phone: '01800000000' });
    if (!manager) {
      const hashedManagerPw = await hashPassword('manager123');
      manager = await User.create({
        name: 'স্টোর ম্যানেজার (Manager)',
        phone: '01800000000',
        email: 'manager@satkhiraghor.com',
        password: hashedManagerPw,
        role: 'manager',
        address: 'খুলনা সদর',
        city: 'খুলনা',
      });
    }

    // Staff User
    let staff = await User.findOne({ phone: '01900000000' });
    if (!staff) {
      const hashedStaffPw = await hashPassword('staff123');
      staff = await User.create({
        name: 'ডেলিভারি স্টাফ (Staff)',
        phone: '01900000000',
        email: 'staff@satkhiraghor.com',
        password: hashedStaffPw,
        role: 'staff',
        address: 'শ্যামনগর',
        city: 'সাতক্ষীরা',
      });
    }

    // 2. Seed Coupons if none exist
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        {
          code: 'SATKHIRA100',
          description: '১০০ টাকা ফ্ল্যাট ছাড়',
          discountType: 'fixed',
          discountAmount: 100,
          minOrderAmount: 1000,
          usageLimit: 500,
          isActive: true,
        },
        {
          code: 'SUNDARBAN',
          description: '১০% বিশেষ ছাড়',
          discountType: 'percentage',
          discountAmount: 10,
          minOrderAmount: 1500,
          maxDiscountAmount: 300,
          usageLimit: 300,
          isActive: true,
        },
      ]);
    }

    // 3. Seed Products if collection is empty
    const productCount = await Product.countDocuments();
    let seededProductsCount = 0;

    if (productCount === 0 && products && products.length > 0) {
      const productsToInsert = products.map((p, idx) => ({
        name: p.name,
        nameEn: p.nameEn || '',
        slug: p.slug,
        category: p.category,
        categoryName: p.categoryName,
        price: p.price,
        originalPrice: p.originalPrice || null,
        unit: p.unit || '১ কেজি',
        rating: p.rating || 5.0,
        reviewCount: p.reviewCount || 0,
        stock: idx === 2 ? 3 : p.stock ?? 20, // simulate one low-stock item
        badge: p.badge || '',
        badgeType: p.badgeType || 'forest',
        image: p.image,
        images: p.images || [p.image],
        shortDescription: p.shortDescription || '',
        description: p.description || '',
        origin: p.origin || 'সুন্দরবন, সাতক্ষীরা',
        harvestDate: p.harvestDate || '',
        benefits: p.benefits || [],
        nutritionalInfo: p.nutritionalInfo || {},
        isFeatured: true,
        hasVariations: idx === 0,
        variations: idx === 0 ? [
          { sku: 'KH-1KG', size: '১ কেজি (1 kg)', weight: '1000g', price: p.price, stock: 25 },
          { sku: 'KH-500G', size: '৫০০ গ্রাম (500g)', weight: '500g', price: Math.round(p.price * 0.55), stock: 15 },
        ] : [],
      }));

      await Product.insertMany(productsToInsert);
      seededProductsCount = productsToInsert.length;
    }

    return NextResponse.json({
      success: true,
      message: 'ডাটাবেজ সফলভাবে সিড (Admin, Manager, Staff, Products, Coupons) সম্পন্ন হয়েছে!',
      credentials: {
        admin: { phone: adminPhone, password: adminPassword, role: 'admin' },
        manager: { phone: '01800000000', password: 'manager123', role: 'manager' },
        staff: { phone: '01900000000', password: 'staff123', role: 'staff' },
      },
      seededProductsCount,
      totalProducts: await Product.countDocuments(),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ডাটাবেজ সিড করার সময় সমস্যা হয়েছে: ' + error.message,
      },
      { status: 500 }
    );
  }
}
