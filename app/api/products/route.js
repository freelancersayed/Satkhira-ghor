import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || searchParams.get('cat');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '150');

    await connectToDatabase();

    const andConditions = [{ isDeleted: { $ne: true } }];

    if (category && category !== 'all') {
      const cleanCat = category.trim();
      andConditions.push({
        $or: [
          { category: cleanCat },
          { categoryName: cleanCat },
          { category: { $regex: new RegExp(`^${cleanCat}$`, 'i') } },
          { categoryName: { $regex: new RegExp(`^${cleanCat}$`, 'i') } },
          { categoryName: { $regex: cleanCat, $options: 'i' } },
        ],
      });
    }

    if (search && search.trim()) {
      const s = search.trim();
      andConditions.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { nameEn: { $regex: s, $options: 'i' } },
          { shortDescription: { $regex: s, $options: 'i' } },
          { category: { $regex: s, $options: 'i' } },
          { categoryName: { $regex: s, $options: 'i' } },
          { slug: { $regex: s, $options: 'i' } },
        ],
      });
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice && !isNaN(Number(minPrice))) priceFilter.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) priceFilter.$lte = Number(maxPrice);
      andConditions.push({ price: priceFilter });
    }

    if (inStock === 'true' || inStock === '1') {
      andConditions.push({ stock: { $gt: 0 } });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, reviewCount: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    let dbProducts = await Product.find(query).sort(sortOption).limit(limit).lean();

    let formattedProducts = dbProducts.map((p) => ({
      ...p,
      id: p._id ? p._id.toString() : p.slug,
    }));

    return NextResponse.json(
      {
        products: formattedProducts,
        total: formattedProducts.length,
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
      harvestDate,
      benefits,
      nutritionalInfo,
      packaging,
      purityGuarantee,
      paymentTerms,
      storageTips,
      specialFeatures,
      deliveryTimeline,
      hasVariations,
      variations,
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
      images: images && images.length > 0 ? [image, ...images.filter((i) => i !== image)] : [image],
      shortDescription: shortDescription || '',
      description: description || '',
      origin: origin || 'সুন্দরবন ও সাতক্ষীরা',
      harvestDate: harvestDate || '',
      benefits: Array.isArray(benefits) ? benefits.filter(Boolean) : [],
      nutritionalInfo: nutritionalInfo && typeof nutritionalInfo === 'object' ? nutritionalInfo : {},
      packaging: packaging || 'ফুড-গ্রেড এয়ারটাইট জার',
      purityGuarantee: purityGuarantee || '১০০% প্রাকৃতিক ও খাঁটি',
      paymentTerms: paymentTerms || 'ক্যাশ অন ডেলিভারি',
      storageTips: storageTips || 'আর্দ্রতামুক্ত ও শীতল স্থানে বায়ুরোধী পাত্রে সংরক্ষণ করুন। সরাসরি সূর্যালোক ও অতিরিক্ত তাপ থেকে দূরে রাখুন।',
      specialFeatures: Array.isArray(specialFeatures) ? specialFeatures.filter(Boolean) : [],
      deliveryTimeline: deliveryTimeline || 'ঢাকা সিটির ভেতর ২৪-৪৮ ঘণ্টা, সারাদেশে ২-৩ কার্যদিবস',
      hasVariations: !!hasVariations,
      variations: Array.isArray(variations) ? variations : [],
    });

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      if (newProduct.slug) {
        revalidatePath(`/products/${newProduct.slug}`);
      }
    } catch (e) {}

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
