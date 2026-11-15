import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectToDatabase();

    const query = {
      isDeleted: { $ne: true },
    };
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    let dbProducts = await Product.find(query).sort({ createdAt: -1 }).limit(limit).lean();

    let formattedProducts = dbProducts.map((p) => ({
      ...p,
      id: p._id ? p._id.toString() : p.slug,
    }));

    return NextResponse.json(
      {
        products: formattedProducts,
        source: 'database',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.warn('MongoDB products fetch error:', error.message);
    return NextResponse.json({
      products: [],
      source: 'database',
      error: 'ডাটাবেজ কানেক্ট হতে পারেনি।',
    });
  }
}

export async function POST(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const body = await request.json();
    const {
      name,
      nameEn,
      slug,
      category,
      categoryName,
      price,
      originalPrice,
      unit,
      stock,
      badge,
      badgeType,
      image,
      images,
      shortDescription,
      description,
      origin,
    } = body;

    if (!name || !price || !category || !image) {
      return NextResponse.json(
        { message: 'পণ্যের নাম, ক্যাটাগরি, মূল্য এবং প্রধান ছবি আবশ্যক' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Auto-generate slug if not provided
    const finalSlug =
      slug ||
      (nameEn && nameEn.trim()
        ? nameEn.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : 'prod-' + Date.now());

    // Check slug uniqueness
    const existing = await Product.findOne({ slug: finalSlug });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString().slice(-4)}` : finalSlug;

    const newProduct = await Product.create({
      name,
      nameEn: nameEn || '',
      slug: uniqueSlug,
      category,
      categoryName: categoryName || 'সাধারণ পণ্য',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      unit: unit || '১ কেজি',
      stock: stock !== undefined ? Number(stock) : 10,
      badge: badge || '',
      badgeType: badgeType || 'forest',
      image,
      images: images && images.length > 0 ? images : [image],
      shortDescription: shortDescription || '',
      description: description || '',
      origin: origin || 'সাতক্ষীরা',
    });

    return NextResponse.json(
      { message: 'পণ্য সফলভাবে যুক্ত হয়েছে', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { message: 'পণ্য যুক্ত করা যায়নি: ' + error.message },
      { status: 500 }
    );
  }
}
