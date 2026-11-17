import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductGallery from '@/components/product/ProductGallery';
import AddToCartButton from '@/components/product/AddToCartButton';
import ProductCard from '@/components/product/ProductCard';
import ProductReviewsSection from '@/components/product/ProductReviewsSection';
import ProductDetailsCard from '@/components/product/ProductDetailsCard';
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

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

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
  return null;
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
  try {
    await connectToDatabase();
    const prods = await Product.find({ isDeleted: { $ne: true } }, { slug: 1 }).lean();
    return (prods || []).map((product) => ({
      slug: product.slug,
    }));
  } catch (e) {
    return [];
  }
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

  // Related products from MongoDB database (prioritize same category)
  let relatedProducts = [];
  try {
    const sameCatQuery = {
      isDeleted: { $ne: true },
      slug: { $ne: product.slug },
      $or: [
        { category: product.category },
        { categoryName: product.categoryName },
      ],
    };
    let relatedDb = await Product.find(sameCatQuery)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    if (!relatedDb || relatedDb.length < 4) {
      const existingSlugs = [product.slug, ...(relatedDb || []).map((p) => p.slug)];
      const fallbackRelated = await Product.find({
        isDeleted: { $ne: true },
        slug: { $nin: existingSlugs },
      })
        .sort({ createdAt: -1 })
        .limit(4 - (relatedDb ? relatedDb.length : 0))
        .lean();
      relatedDb = [...(relatedDb || []), ...(fallbackRelated || [])];
    }

    if (relatedDb && relatedDb.length > 0) {
      relatedProducts = JSON.parse(JSON.stringify(relatedDb)).map((p) => ({
        ...p,
        id: p._id ? String(p._id) : p.slug,
      }));
    }
  } catch (e) {}

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
    <div className="py-4 sm:py-8 lg:py-10 bg-[#FDFBF7]">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#4B5563]">
          <Link href="/" className="hover:text-[#016831] transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8E2D5]" />
          <Link href="/shop" className="hover:text-[#016831] transition-colors">
            সব পণ্য
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8E2D5]" />
          <Link
            href={`/shop?cat=${encodeURIComponent(product.category || product.categoryName || 'all')}`}
            className="text-[#B45309] hover:text-[#016831] font-semibold transition-colors"
          >
            {product.categoryName || product.category}
          </Link>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E8E2D5]" />
          <span className="text-[#016831] font-bold line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 lg:gap-10 bg-white p-3.5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-xs">
          {/* Gallery Column */}
          <div className="lg:col-span-6">
            <ProductGallery
              images={[
                ...(product.image ? [product.image] : []),
                ...(Array.isArray(product.images) ? product.images : []),
              ].filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx)}
              mainImage={product.image}
              name={product.name}
            />
          </div>

          {/* Details & Purchase Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              {/* Category & Stock Status */}
              <div className="flex items-center justify-between gap-2">
                <Link
                  href={`/shop?cat=${encodeURIComponent(product.category || 'all')}`}
                  className="text-[11px] sm:text-xs font-bold text-[#B45309] uppercase tracking-wider bg-[#FEF3C7] hover:bg-[#FDE68A] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-[#FDE68A] transition-colors"
                >
                  {product.categoryName}
                </Link>
                {product.stock !== undefined && Number(product.stock) <= 0 ? (
                  <span className="text-[11px] sm:text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    স্টক শেষ (আপাতত অনুপলব্ধ)
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    স্টকে আছে ({product.stock !== undefined ? product.stock : 25} টি অবশিষ্ট)
                  </span>
                )}
              </div>

              {/* Title & English Subtitle */}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#016831] leading-snug">
                  {product.name}
                </h1>
                {product.nameEn && (
                  <p className="text-xs text-[#4B5563] mt-0.5 font-medium">
                    {product.nameEn}
                  </p>
                )}
              </div>

              {/* Rating & Review (Live Synced with Real Reviews - No Hardcoded Counts) */}
              <div className="flex items-center gap-2 sm:gap-3 pb-2 border-b border-[#E8E2D5]">
                {reviewSummary.count > 0 ? (
                  <>
                    <div className="flex items-center text-[#F59E0B]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
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

              {/* Short Summary & Quick Jump to Details */}
              <div className="space-y-2">
                {product.shortDescription && (
                  <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}
                <a
                  href="#product-details-card"
                  className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#016831] hover:text-[#B45309] bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors w-fit"
                >
                  <span>📋 বিস্তারিত বিবরণ ও বৈশিষ্ট্য দেখুন</span>
                  <span className="text-[10px]">↓</span>
                </a>
              </div>

              {/* Origin & Harvest Info: Rendered only if values exist (Zero Empty Boxes) */}
              {(hasOrigin || hasHarvestDate) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  {hasOrigin && (
                    <div className="flex items-center gap-2 p-2.5 bg-[#FDFBF7] rounded-xl border border-[#E8E2D5]">
                      <MapPin className="w-3.5 h-3.5 text-[#016831] flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-stone-500 font-medium">উৎস স্থল:</span>
                        <span className="font-bold text-[#016831]">{product.origin}</span>
                      </div>
                    </div>
                  )}
                  {hasHarvestDate && (
                    <div className="flex items-center gap-2 p-2.5 bg-[#FDFBF7] rounded-xl border border-[#E8E2D5]">
                      <Calendar className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
                      <div>
                        <span className="block text-[10px] text-stone-500 font-medium">সংগ্রহ কাল:</span>
                        <span className="font-bold text-[#016831]">{product.harvestDate}</span>
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
                <span>{product.paymentTerms || 'সারাদেশে ক্যাশ অন ডেলিভারি'}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>{product.purityGuarantee || '১০০% খাঁটি ও বিশুদ্ধ নিশ্চয়তা'}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#D97706]" />
                <span>সহজ রিটার্ন সুবিধা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact, Screen-Friendly Product Details & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          <div className="lg:col-span-8">
            <ProductDetailsCard product={product} />
          </div>

          {/* Right Trust, Delivery & Support Sidebar */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#016831] uppercase tracking-wide flex items-center gap-1.5 pb-2 border-b border-[#E8E2D5]">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>সাতক্ষীরা ঘর স্পেশাল কেয়ার</span>
              </h3>
              <ul className="space-y-2 text-xs text-stone-600">
                {Array.isArray(product.specialFeatures) && product.specialFeatures.length > 0 ? (
                  product.specialFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span>সরাসরি সুন্দরবনের প্রান্তিক মৌয়াল ও চাষীদের থেকে সংগৃহীত</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span>কোনো প্রকার রাসায়নিক, সুগার বা কৃত্রিম প্রিজারভেটিভ নেই</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span>ডেলিভারি ম্যানের সামনে পণ্য দেখে মূল্য পরিশোধের সুবিধা</span>
                    </li>
                  </>
                )}
              </ul>

              <div className="pt-2 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-[#016831] font-semibold bg-[#FAF8F5] p-2.5 rounded-xl">
                <span>📞 সরাসরি অর্ডারে সহায়তার জন্য:</span>
                <a href="tel:01700000000" className="font-bold text-[#B45309] hover:underline">
                  কল করুন
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FEF3C7] text-[#92400E] text-xs leading-relaxed border border-[#FDE68A] flex items-start gap-2">
              <span className="text-base flex-shrink-0 leading-none">💡</span>
              <div>
                <strong>সংরক্ষণ টিপস:</strong> {product.storageTips || 'আর্দ্রতামুক্ত ও সাধারণ তাপমাত্রায় বায়ুরোধী পাত্রে রাখুন।'}
              </div>
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
