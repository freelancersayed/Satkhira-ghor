import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { products as fallbackProducts } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FeaturedProducts() {
  let displayProducts = [];

  try {
    await connectToDatabase();
    const dbProducts = await Product.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    if (dbProducts && dbProducts.length > 0) {
      displayProducts = dbProducts.map((p) => ({
        ...p,
        id: p._id ? p._id.toString() : p.slug,
      }));
    }

    // Never resurrect products that were deleted by admin
    const allKnown = await Product.find({}, { slug: 1, isDeleted: 1 }).lean();
    const blockedSlugs = new Set(allKnown.map((p) => p.slug));

    for (const fb of fallbackProducts) {
      if (!blockedSlugs.has(fb.slug) && displayProducts.length < 8) {
        displayProducts.push(fb);
      }
    }
  } catch (e) {
    console.warn('Failed to load featured products from DB:', e.message);
  }

  const featured = displayProducts.slice(0, 4);

  return (
    <section className="py-16 sm:py-24 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-widest">
              সবচেয়ে জনপ্রিয়
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E] mt-1">
              আমাদের সেরা বিক্রিত পণ্য
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#1B4D3E] hover:text-[#C86D3B] group transition-colors"
          >
            <span>সকল পণ্য দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
