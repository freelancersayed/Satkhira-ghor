import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/data/products';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductGallery from '@/components/product/ProductGallery';
import AddToCartButton from '@/components/product/AddToCartButton';
import ProductCard from '@/components/product/ProductCard';
import ProductReviewsSection from '@/components/product/ProductReviewsSection';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Calendar,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const dynamicParams = true;
// Enable ISR (Incremental Static Regeneration) for instant product detail loading
export const revalidate = 60;

async function getProductBySlug(slug) {
  try {
    await connectToDatabase();
    const dbProduct = await Product.findOne({ slug }).lean();
    if (dbProduct) {
      if (dbProduct.isDeleted) {
        return null; // Explicitly deleted by admin
      }
      return JSON.parse(
        JSON.stringify({
          ...dbProduct,
          id: dbProduct._id ? dbProduct._id.toString() : dbProduct.id,
        })
      );
    }
  } catch (e) {
    // fallback
  }
  return products.find((p) => p.slug === slug) || null;
}

async function getProductReviewsSummary(productId, productSlug) {
  try {
    await connectToDatabase();
    const query = {
      isApproved: true,
      $or: [
        { productSlug },
        ...(productId ? [{ product: productId }] : []),
      ],
    };
    const reviews = await Review.find(query).select('rating').lean();
    const count = reviews.length;
    const avg =
      count > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / count
        : 0;
    return { count, avg: avg > 0 ? Number(avg.toFixed(1)) : 0 };
  } catch (e) {
    return { count: 0, avg: 0 };
  }
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'পণ্য পাওয়া যায়নি | সাতক্ষীরা ঘর',
    };
  }

  return {
    title: `${product.name} | সাতক্ষীরা ঘর`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} - সাতক্ষীরা ঘর`,
      description: product.shortDescription,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const reviewSummary = await getProductReviewsSummary(
    product.id || product._id,
    product.slug
  );

  // Related products (prefer same category, fallback to others)
  const relatedSameCat = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug
  );
  const relatedOther = products.filter(
    (p) => p.category !== product.category && p.slug !== product.slug
  );
  const relatedProducts = [...relatedSameCat, ...relatedOther].slice(0, 4);

  const hasOrigin = Boolean(product.origin && String(product.origin).trim());
  const hasHarvestDate = Boolean(
    product.harvestDate && String(product.harvestDate).trim()
  );
  const hasBenefits = Array.isArray(product.benefits) && product.benefits.length > 0;
  const hasNutrition =
    product.nutritionalInfo &&
    typeof product.nutritionalInfo === 'object' &&
    Object.keys(product.nutritionalInfo).length > 0;

  return (
    <div className="py-10 sm:py-16 bg-[#FDFBF7]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#4B5563]">
          <Link href="/" className="hover:text-[#016831] transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#E8E2D5]" />
          <Link href="/shop" className="hover:text-[#016831] transition-colors">
            সব পণ্য
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#E8E2D5]" />
          <span className="text-[#B45309] font-semibold">{product.categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#E8E2D5]" />
          <span className="text-[#016831] font-bold line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-[#E8E2D5] shadow-sm">
          {/* Gallery Column */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Details & Purchase Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#FDE68A]">
                  {product.categoryName}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  স্টকে আছে ({product.stock || 25} টি অবশিষ্ট)
                </span>
              </div>

              {/* Title & English Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#016831] leading-snug">
                  {product.name}
                </h1>
                {product.nameEn && (
                  <p className="text-xs text-[#4B5563] mt-1 font-medium">
                    {product.nameEn}
                  </p>
                )}
              </div>

              {/* Rating & Review (Live Synced with Real Reviews - No Hardcoded Counts) */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#E8E2D5]">
                {reviewSummary.count > 0 ? (
                  <>
                    <div className="flex items-center text-[#F59E0B]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(reviewSummary.avg)
                              ? 'fill-current'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#016831]">
                      {reviewSummary.avg} / ৫.০
                    </span>
                    <span className="text-xs text-[#4B5563]">
                      ({reviewSummary.count} জন ক্রেতার রিভিউ)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-[#78716C] font-medium">
                    এখনো কোনো রিভিউ নেই (আপনিই প্রথম রিভিউ দিন!)
                  </span>
                )}
              </div>

              {/* Short Summary */}
              {product.shortDescription && (
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Origin & Harvest Info: Rendered only if values exist (Zero Empty Boxes) */}
              {(hasOrigin || hasHarvestDate) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  {hasOrigin && (
                    <div className="flex items-center gap-2 p-3 bg-[#FDFBF7] rounded-2xl border border-[#E8E2D5]">
                      <MapPin className="w-4 h-4 text-[#016831] flex-shrink-0" />
                      <div>
                        <span className="block font-bold text-[#016831]">উৎস স্থল:</span>
                        <span className="text-[#4B5563]">{product.origin}</span>
                      </div>
                    </div>
                  )}
                  {hasHarvestDate && (
                    <div className="flex items-center gap-2 p-3 bg-[#FDFBF7] rounded-2xl border border-[#E8E2D5]">
                      <Calendar className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                      <div>
                        <span className="block font-bold text-[#016831]">সংগ্রহ কাল:</span>
                        <span className="text-[#4B5563]">{product.harvestDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Dynamic Variant Selector & Add To Cart Button */}
            <div
              id="halum-product-action-anchor"
              data-halum-slug={product.slug}
              data-halum-product-id={product.id || product._id}
              className="pt-4 border-t border-[#E8E2D5]"
            >
              <AddToCartButton product={product} />
            </div>

            {/* Delivery Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#E8E2D5] text-[11px] text-[#4B5563] text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#016831]" />
                <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>১০০% খাঁটি ও বিশুদ্ধ নিশ্চয়তা</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#D97706]" />
                <span>সহজ রিটার্ন সুবিধা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs / Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detailed Description & Benefits */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#016831] border-b border-[#E8E2D5] pb-3 mb-4">
                পণ্যের বিস্তারিত বিবরণ
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Health Benefits: Rendered only if array is non-empty */}
            {hasBenefits && (
              <div>
                <h3 className="text-sm font-bold text-[#016831] mb-3">
                  মূল স্বাস্থ্য উপকারিতা ও বিশেষত্ব:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#014D24] font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nutritional Facts & Storage Advice Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-4">
            {hasNutrition && (
              <>
                <h2 className="text-base font-bold text-[#016831] border-b border-[#E8E2D5] pb-3">
                  পুষ্টি উপাদান (Nutrition Facts)
                </h2>
                <div className="divide-y divide-[#E8E2D5] text-xs">
                  {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div key={key} className="py-2.5 flex justify-between">
                      <span className="text-[#4B5563]">{key}</span>
                      <span className="font-bold text-[#016831]">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="p-4 rounded-2xl bg-[#FEF3C7] text-[#92400E] text-xs leading-relaxed border border-[#FDE68A]">
              💡 <strong>সংরক্ষণ পদ্ধতি:</strong> আর্দ্রতামুক্ত ও শীতল স্থানে বায়ুরোধী পাত্রে সংরক্ষণ করুন। সরাসরি সূর্যালোক থেকে দূরে রাখুন।
            </div>
          </div>
        </div>

        {/* Live Customer Reviews & Ratings Section */}
        <ProductReviewsSection product={product} />

        {/* Related Products - Mobile Compact 2-Column Grid */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#016831]">
              আপনার আরও পছন্দ হতে পারে
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#B45309] hover:text-[#016831] transition-colors"
            >
              সব পণ্য দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p.slug} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
