import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products } from '@/data/products';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
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
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProductBySlug(slug) {
  try {
    await connectToDatabase();
    const dbProduct = await Product.findOne({ slug }).lean();
    if (dbProduct) {
      if (dbProduct.isDeleted) {
        return null; // Explicitly deleted by admin
      }
      return {
        ...dbProduct,
        id: dbProduct._id ? dbProduct._id.toString() : dbProduct.id,
      };
    }
  } catch (e) {
    // fallback
  }
  return products.find((p) => p.slug === slug) || null;
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

  // Related products from other items
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  return (
    <div className="py-10 sm:py-16 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#4A5B53]">
          <Link href="/" className="hover:text-[#1B4D3E] transition-colors">
            হোম
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#EFE9DC]" />
          <Link href="/shop" className="hover:text-[#1B4D3E] transition-colors">
            সব পণ্য
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#EFE9DC]" />
          <span className="text-[#C86D3B] font-semibold">{product.categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#EFE9DC]" />
          <span className="text-[#1B4D3E] font-bold line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product Main Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-[#EFE9DC] shadow-sm">
          {/* Gallery Column */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          {/* Details & Purchase Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-wider bg-[#F6E7DE] px-3 py-1 rounded-full">
                  {product.categoryName}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  স্টকে আছে ({product.stock} টি অবশিষ্ট)
                </span>
              </div>

              {/* Title & English Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B4D3E] leading-snug">
                  {product.name}
                </h1>
                <p className="text-xs text-[#4A5B53] mt-1 font-medium">
                  {product.nameEn}
                </p>
              </div>

              {/* Rating & Review */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#EFE9DC]">
                <div className="flex items-center text-[#E5A93C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1B4D3E]">
                  {product.rating} / ৫.০
                </span>
                <span className="text-xs text-[#4A5B53]">
                  ({product.reviewCount} জন সন্তুষ্ট গ্রাহকের রিভিউ)
                </span>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-3xl font-black text-[#1B4D3E]">
                  ৳{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-[#4A5B53]/70 line-through">
                    ৳{product.originalPrice}
                  </span>
                )}
                {discountPercentage && (
                  <span className="text-xs font-black text-[#C86D3B] bg-[#F6E7DE] px-2.5 py-1 rounded-lg">
                    {discountPercentage}% ছাড়!
                  </span>
                )}
                <span className="text-xs font-semibold text-[#4A5B53] bg-[#FAF8F4] px-2.5 py-1 rounded-lg border border-[#EFE9DC]">
                  পরিমাণ: {product.unit}
                </span>
              </div>

              {/* Short Summary */}
              <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Origin & Harvest Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 p-3 bg-[#FAF8F4] rounded-2xl border border-[#EFE9DC]">
                  <MapPin className="w-4 h-4 text-[#1B4D3E] flex-shrink-0" />
                  <div>
                    <span className="block font-bold text-[#1B4D3E]">উৎস স্থল:</span>
                    <span className="text-[#4A5B53]">{product.origin}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-[#FAF8F4] rounded-2xl border border-[#EFE9DC]">
                  <Calendar className="w-4 h-4 text-[#E5A93C] flex-shrink-0" />
                  <div>
                    <span className="block font-bold text-[#1B4D3E]">সংগ্রহ কাল:</span>
                    <span className="text-[#4A5B53]">{product.harvestDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Add to Cart & Buy Now Button */}
            <div className="pt-4 border-t border-[#EFE9DC]">
              <AddToCartButton product={product} />
            </div>

            {/* Delivery Guarantees */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#EFE9DC] text-[11px] text-[#4A5B53] text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#1B4D3E]" />
                <span>সারাদেশে ক্যাশ অন ডেলিভারি</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
                <span>১০০% খাঁটি ও বিশুদ্ধ নিশ্চয়তা</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#C86D3B]" />
                <span>সহজ রিটার্ন সুবিধা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs / Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Detailed Description & Benefits */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1B4D3E] border-b border-[#EFE9DC] pb-3 mb-4">
                পণ্যের বিস্তারিত বিবরণ
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Health Benefits */}
            {product.benefits && (
              <div>
                <h3 className="text-sm font-bold text-[#1B4D3E] mb-3">
                  মূল স্বাস্থ্য উপকারিতা ও বিশেষত্ব:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F0F7F4] border border-[#DCEEE6]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#1B4D3E] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#153D31] font-medium">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nutritional Facts Sidebar */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#1B4D3E] border-b border-[#EFE9DC] pb-3">
              পুষ্টি উপাদান (Nutrition Facts)
            </h2>
            {product.nutritionalInfo ? (
              <div className="divide-y divide-[#EFE9DC] text-xs">
                {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex justify-between">
                    <span className="text-[#4A5B53]">{key}</span>
                    <span className="font-bold text-[#1B4D3E]">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#4A5B53]">
                প্রাকৃতিক উপাদানে প্রস্তুত, কোনো কৃত্রিম সংযোজন নেই।
              </p>
            )}

            <div className="mt-4 p-4 rounded-2xl bg-[#FAF0D4] text-[#7E4E18] text-xs leading-relaxed">
              💡 <strong>সংরক্ষণ পদ্ধতি:</strong> আর্দ্রতামুক্ত ও শীতল স্থানে বায়ুরোধী পাত্রে সংরক্ষণ করুন। সরাসরি সূর্যালোক থেকে দূরে রাখুন।
            </div>
          </div>
        </div>

        {/* Live Customer Reviews & Ratings Section */}
        <ProductReviewsSection product={product} />

        {/* Related Products */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B4D3E]">
              আপনার আরও পছন্দ হতে পারে
            </h2>
            <Link
              href="/shop"
              className="text-xs font-bold text-[#C86D3B] hover:text-[#1B4D3E] transition-colors"
            >
              সব পণ্য দেখুন →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
