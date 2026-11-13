'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Check } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product }) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const hasDiscount = Boolean(
    product.originalPrice && Number(product.originalPrice) > Number(product.price)
  );
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl p-2.5 border border-[#E8E2D5] hover:border-[#016831]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full relative">
      {/* ── 1. ছবি (aspect-square / 1:1) + শুধু ডান কোণায় ডিসকাউন্ট ব্যাজ ── */}
      <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#F0EBE1]">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </Link>

        {/* শুধু ডান কোণায় ছোট ডিসকাউন্ট ব্যাজ (যেমন -14%) */}
        {hasDiscount && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}
      </div>

      {/* ── মিডল কন্টেন্ট: নাম, ওজন ও দাম ── */}
      <div className="pt-2 flex-1 flex flex-col justify-between">
        <div>
          {/* ── 2. নাম ও ওজন (সর্বোচ্চ ২ লাইনের টাইটেল + নিচে হালকা রঙে ওজন) ── */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-[#016831] group-hover:text-[#D97706] transition-colors min-h-[2.2rem]">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] text-[#78716C] font-normal mt-0.5">
            {product.unit}
          </p>
        </div>

        {/* ── 3. দাম: শুধু বর্তমান বিক্রয়মূল্য ও কাটা দাম পাশাপাশি ── */}
        <div className="flex items-baseline gap-1.5 mt-1.5 pt-1 border-t border-dashed border-[#E8E2D5]/70">
          <span className="text-sm sm:text-base font-black text-[#016831]">
            ৳{product.price}
          </span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] line-through font-normal">
              ৳{product.originalPrice}
            </span>
          )}
        </div>
      </div>

      {/* ── 4. একটি ফুল-উইডথ বাটন (w-full min-h-[40px] rounded-lg) ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          data-halum-product-card-btn="cart"
          className={`w-full min-h-[40px] py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] ${
            isAdded
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-[#016831] hover:bg-[#014D24] text-white hover:shadow-md'
          }`}
          aria-label="কার্টে যোগ করুন"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-[#F59E0B] stroke-[2.5]" />
              <span>কার্টে যোগ হয়েছে ✓</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
              <span>কার্টে যোগ করুন</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
