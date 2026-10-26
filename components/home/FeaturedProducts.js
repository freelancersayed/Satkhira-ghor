import { products as fallbackProducts } from '@/data/products';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import ModernProductShowcase from '@/components/home/ModernProductShowcase';

export default async function FeaturedProducts() {
  let displayProducts = [];

  try {
    await connectToDatabase();
    // Fast lean query with projection
    const dbProducts = await Product.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(24)
      .select('name nameEn slug category categoryName price originalPrice unit image rating reviewCount badge badgeType stock isFeatured hasVariations variations')
      .lean();

    if (dbProducts && dbProducts.length > 0) {
      const plainList = JSON.parse(JSON.stringify(dbProducts));
      displayProducts = plainList.map((p) => ({
        ...p,
        id: p._id ? String(p._id) : p.slug,
      }));
    }

    // Only query deleted slugs to avoid resurrecting them from fallbacks
    const deletedInDb = await Product.find({ isDeleted: true }, { slug: 1 }).lean();
    const blockedSlugs = new Set(deletedInDb.map((p) => p.slug));

    for (const fb of fallbackProducts) {
      if (!blockedSlugs.has(fb.slug) && !displayProducts.some((p) => p.slug === fb.slug)) {
        displayProducts.push(fb);
      }
    }
  } catch (e) {
    console.warn('Failed to load featured products from DB:', e.message);
    displayProducts = [...fallbackProducts];
  }

  // Ensure we at least have fallback products if DB returned empty
  if (displayProducts.length === 0) {
    displayProducts = [...fallbackProducts];
  }

  return (
    <section className="py-12 sm:py-20 bg-[#FDFBF7]/50 border-b border-[#E8E2D5]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ModernProductShowcase initialProducts={displayProducts} />
      </div>
    </section>
  );
}
