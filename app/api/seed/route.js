import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
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

    // 1. Seed Admin User
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@satkhiraghor.com';
    const adminPhone = process.env.DEFAULT_ADMIN_PHONE || '01700000000';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    let admin = await User.findOne({
      $or: [{ email: adminEmail }, { phone: adminPhone }, { role: 'admin' }],
    });

    if (!admin) {
      const hashedPassword = await hashPassword(adminPassword);
      admin = await User.create({
        name: 'সাতক্ষীরা ঘর অ্যাডমিন',
        phone: adminPhone,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        address: 'সাতক্ষীরা সদর',
        city: 'সাতক্ষীরা',
      });
      console.log('Default admin created successfully');
    }

    // 2. Seed Products if collection is empty
    const productCount = await Product.countDocuments();
    let seededProductsCount = 0;

    if (productCount === 0 && products && products.length > 0) {
      const productsToInsert = products.map((p) => ({
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
        stock: p.stock ?? 20,
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
      }));

      await Product.insertMany(productsToInsert);
      seededProductsCount = productsToInsert.length;
    }

    return NextResponse.json({
      success: true,
      message: 'ডাটাবেজ সফলভাবে সিড (Initialized) করা হয়েছে',
      admin: {
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
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
