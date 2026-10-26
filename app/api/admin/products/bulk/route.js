import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireManagerOrAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { message: 'অন্তত একটি পণ্যের তথ্য প্রদান করুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const timestamp = Date.now();
    const preparedProducts = products.map((item, idx) => {
      const cleanName = (item.name || '').trim();
      const cleanNameEn = (item.nameEn || '').trim();
      const baseSlug = cleanNameEn
        ? cleanNameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        : `prod-${timestamp}-${idx}`;
      const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        name: cleanName || `পণ্য ${idx + 1}`,
        nameEn: cleanNameEn,
        slug: uniqueSlug,
        category: item.category || 'honey',
        categoryName: item.categoryName || 'সুন্দরবনের মধু',
        price: Number(item.price) || 0,
        originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
        unit: item.unit || '১ কেজি',
        stock: item.stock !== undefined ? Number(item.stock) : 20,
        image: item.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38',
        images: item.image ? [item.image] : [],
        shortDescription: item.shortDescription || '',
        description: item.description || '',
        badge: item.badge || '',
        badgeType: item.badgeType || 'forest',
        hasVariations: !!item.hasVariations,
        variations: Array.isArray(item.variations) ? item.variations : [],
      };
    });

    // Execute optimized MongoDB insertMany
    const inserted = await Product.insertMany(preparedProducts, { ordered: false });

    return NextResponse.json({
      success: true,
      message: `সফলভাবে ${inserted.length} টি পণ্য বাল্ক আপলোড সম্পন্ন হয়েছে!`,
      count: inserted.length,
      products: inserted,
    });
  } catch (error) {
    console.error('Bulk products upload error:', error);
    return NextResponse.json(
      { message: 'বাল্ক আপলোড করতে সমস্যা হয়েছে: ' + error.message },
      { status: 500 }
    );
  }
}
