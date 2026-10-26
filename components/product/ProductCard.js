'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, Eye, Zap, Check, ShieldCheck, Flame } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function ProductCard({ product, showProgress = false }) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const hasDiscount = Boolean(
    product.originalPrice && Number(product.originalPrice) > Number(product.price)
  );
  const discountPercent = hasDiscount
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : null;
  const savings = hasDiscount ? Number(product.originalPrice) - Number(product.price) : 0;

  // Realistic sales metrics for clean social proof
  const soldCount = product.reviewCount ? product.reviewCount * 2 + 18 : 38;
  const stockAvailable = product.stock || 25;
  const progressPercent = Math.min(94, Math.max(40, Math.round((soldCount / (soldCount + stockAvailable)) * 100)));

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    openCart();
  };

  const badgeColorMap = {
    forest: 'bg-[#0F3D2E] text-white',
    honey: 'bg-[#F59E0B] text-[#111827]',
    ochre: 'bg-[#C25E2E] text-white',
  };

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border border-[#E8E2D5] hover:border-[#0F3D2E]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full relative">
      {/* Framed Image Container (Image does not touch outer border) */}
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

        {/* Top-Left Trust Badge */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col gap-1 items-start">
          {product.badge ? (
            <span
              className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs ${
                badgeColorMap[product.badgeType] || 'bg-[#0F3D2E] text-white'
              }`}
            >
              {product.badge}
            </span>
          ) : (
            <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0F3D2E] text-white shadow-xs flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
              <span>১০০% খাঁটি</span>
            </span>
          )}
        </div>

        {/* Top-Right Daraz-Style Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
            <span className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-xs">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-1.5 pointer-events-none">
          <Link
            href={`/products/${product.slug}`}
            className="pointer-events-auto p-2 bg-white text-[#0F3D2E] rounded-full shadow hover:bg-[#0F3D2E] hover:text-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
            aria-label="View Product"
          >
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Card Content - Clean & Standard Proportions */}
      <div className="pt-2 sm:pt-2.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Category & Unit Strip */}
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-[#4B5563] font-medium mb-1">
            <span className="text-[#B45309] font-bold truncate max-w-[65%]">
              {/* {product.categoryName || 'খাঁটি পণ্য'} */}
            </span>
            <span className="bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded font-bold text-[8px] sm:text-[9px] whitespace-nowrap">
              {/* {product.unit} */}
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-[12px] sm:text-[13px] text-[#0F3D2E] group-hover:text-[#D97706] line-clamp-2 transition-colors min-h-[2rem] sm:min-h-[2.2rem] leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Sold count */}
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-dashed border-[#E8E2D5]/70">
            <div className="flex items-center gap-0.5 text-[#F59E0B]">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold text-[#0F3D2E] ml-0.5">{product.rating}</span>
              <span className="text-[9px] text-[#4B5563]/70">({product.reviewCount || 45})</span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#D97706] flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 text-red-500 fill-current" />
              <span>{soldCount}+ বিক্রি</span>
            </span>
          </div>

          {/* Optional Daraz-Style Stock Progress Bar */}
          {showProgress && (
            <div className="mt-1.5 space-y-1">
              <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[8px] sm:text-[9px] text-[#78716C] font-medium">
                <span>স্টক সীমিত</span>
                <span className="text-red-600 font-bold">{progressPercent}% বিক্রিত</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-1.5 border-t border-[#E8E2D5]/80 space-y-1.5">
          {/* Price & Savings */}
          <div className="flex items-baseline justify-between gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-base font-black text-[#0F3D2E]">
                ৳{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] line-through font-normal">
                  ৳{product.originalPrice}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[8px] sm:text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                সাশ্রয় ৳{savings}
              </span>
            )}
          </div>

          {/* Dual Action Buttons: Standard Compact Size */}
          <div className="grid grid-cols-2 gap-1 pt-0.5">
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-[#0F3D2E] hover:bg-[#185340] text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-xs active:scale-95"
              aria-label="Direct Buy"
            >
              <Zap className="w-3 h-3 text-amber-400 fill-current" />
              <span>অর্ডার</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all border active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#FDE68A]'
              }`}
              aria-label="Add to cart"
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>যুক্ত</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  <span>কার্ট</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  
    </div>
  );
}
