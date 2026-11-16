import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import ModernProductShowcase from '@/components/home/ModernProductShowcase';

export default async function FeaturedProducts({ initialCategories = [] }) {
  let displayProducts = [];

  try {
    await connectToDatabase();
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
  } catch (e) {
    console.warn('Failed to load featured products from DB:', e.message);
    displayProducts = [];
  }

  return (
    <section className="py-12 sm:py-20 bg-[#FDFBF7]/50 border-b border-[#E8E2D5]/50">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <ModernProductShowcase
          initialProducts={displayProducts}
          initialCategories={initialCategories}
        />
      </div>
    </section>
  );
}
