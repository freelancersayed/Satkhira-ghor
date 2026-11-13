'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Flame,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { categories as fallbackCategories } from '@/data/products';
import { useSiteContentStore } from '@/store/siteContentStore';
import FlashSaleEditModal from '@/components/home/FlashSaleEditModal';

export default function ModernProductShowcase({ initialProducts = [] }) {
  const { content } = useSiteContentStore();
  const flashSale = content?.flashSale || {};
  const isFlashSaleEnabled = flashSale.enabled !== false;

  // Active Category Tab
  const [activeTab, setActiveTab] = useState('all');

  // Dynamic Categories from database
  const activeCategories = useMemo(() => {
    if (Array.isArray(content?.categories) && content.categories.length > 0) {
      return content.categories;
    }
    return fallbackCategories;
  }, [content?.categories]);

  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({
    hours: flashSale.durationHours || 12,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    // If specific endTime is configured
    if (flashSale.endTime) {
      const updateFromEndTime = () => {
        const diff = new Date(flashSale.endTime).getTime() - new Date().getTime();
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      };
      updateFromEndTime();
      const interval = setInterval(updateFromEndTime, 1000);
      return () => clearInterval(interval);
    }

    // Standard timer loop
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: flashSale.durationHours || 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSale.endTime, flashSale.durationHours]);

  // Dynamically prepare Flash Sale Products from admin selected slugs or fallbacks
  const flashSaleProducts = useMemo(() => {
    if (Array.isArray(flashSale.productSlugs) && flashSale.productSlugs.length > 0) {
      const selected = flashSale.productSlugs
        .map((slug) => {
          const prod = initialProducts.find((p) => p.slug === slug);
          if (!prod) return null;

          // Apply custom offer price if configured by admin
          const custom = flashSale.customOffers?.[slug];
          if (custom && custom.offerPrice && Number(custom.offerPrice) > 0) {
            return {
              ...prod,
              originalPrice: prod.originalPrice || prod.price,
              price: Number(custom.offerPrice),
            };
          }
          return prod;
        })
        .filter(Boolean);

      if (selected.length > 0) {
        return selected;
      }
    }

    // Fallback: products with discount
    const discounted = initialProducts.filter(
      (p) => p.originalPrice && Number(p.originalPrice) > Number(p.price)
    );
    return discounted.length >= 3 ? discounted : initialProducts.slice(0, 6);
  }, [flashSale.productSlugs, flashSale.customOffers, initialProducts]);

  // Duplicate flash sale products for seamless right-to-left auto-swipe carousel
  const loopedFlashProducts = useMemo(() => {
    return [
      ...flashSaleProducts,
      ...flashSaleProducts,
      ...flashSaleProducts,
      ...flashSaleProducts,
    ];
  }, [flashSaleProducts]);

  const flashScrollRef = useRef(null);
  const [isFlashPaused, setIsFlashPaused] = useState(false);

  // Auto-swipe Flash Deals right-to-left with smooth delay (2.5s)
  useEffect(() => {
    if (isFlashPaused || loopedFlashProducts.length === 0) return;

    const interval = setInterval(() => {
      const container = flashScrollRef.current;
      if (!container) return;

      const firstItem = container.firstElementChild;
      const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 280;
      const singleCycleWidth = container.scrollWidth / 4;

      if (container.scrollLeft >= singleCycleWidth * 2) {
        container.scrollLeft -= singleCycleWidth;
      }

      container.scrollBy({
        left: stepWidth,
        behavior: 'smooth',
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isFlashPaused, loopedFlashProducts.length]);

  const handleFlashPrev = () => {
    const container = flashScrollRef.current;
    if (!container) return;
    const firstItem = container.firstElementChild;
    const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 280;
    container.scrollBy({ left: -stepWidth, behavior: 'smooth' });
  };

  const handleFlashNext = () => {
    const container = flashScrollRef.current;
    if (!container) return;
    const firstItem = container.firstElementChild;
    const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 280;
    container.scrollBy({ left: stepWidth, behavior: 'smooth' });
  };

  // Filter products by selected Category Tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return initialProducts;
    return initialProducts.filter(
      (p) =>
        p.category === activeTab ||
        (p.categoryName && p.categoryName.toLowerCase().includes(activeTab.toLowerCase()))
    );
  }, [activeTab, initialProducts]);

  const format2Digits = (num) => String(num).padStart(2, '0');

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* =========================================================================
          SECTION 1: DARAZ-STYLE FLASH SALE / আজকের ধামাকা অফার (Auto-Swipe Carousel)
          (Only shown if enabled by admin; admin can edit/customize/delete)
      ========================================================================= */}
      {isFlashSaleEnabled && (
        <div className="bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7]/40 to-white rounded-3xl p-4 sm:p-7 border border-[#FDE68A]/80 shadow-sm relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-300/10 rounded-full blur-3xl pointer-events-none" />

          {/* Flash Sale Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 border-b border-[#FDE68A]/70 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Fire Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-md animate-pulse">
                <Flame className="w-4 h-4 fill-current" />
                <span>{flashSale.badgeText || 'ফ্ল্যাশ সেল'}</span>
              </div>

              <h3 className="text-base sm:text-xl font-black text-[#016831]">
                {flashSale.title || 'আজকের ধামাকা অফার'}
              </h3>

              {/* Live Real-time Countdown Timer */}
              <div className="flex items-center gap-1.5 ml-0 sm:ml-2 text-xs font-bold text-[#78350F] bg-white/90 px-3 py-1 rounded-xl border border-amber-200 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-red-500 animate-spin-slow" />
                <span className="hidden xs:inline">শেষ হতে বাকি:</span>
                <div className="flex items-center gap-1 font-mono">
                  <span className="bg-[#016831] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                    {format2Digits(timeLeft.hours)}
                  </span>
                  <span>:</span>
                  <span className="bg-[#016831] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                    {format2Digits(timeLeft.minutes)}
                  </span>
                  <span>:</span>
                  <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                    {format2Digits(timeLeft.seconds)}
                  </span>
                </div>
              </div>

              {/* Admin Flash Sale Edit Modal Trigger */}
              <FlashSaleEditModal allProducts={initialProducts} />
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B45309] hover:text-[#016831] group transition-colors self-end sm:self-auto"
            >
              <span>সব অফার দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Auto-Swiping Product Carousel */}
          <div
            className="relative group/carousel"
            onMouseEnter={() => setIsFlashPaused(true)}
            onMouseLeave={() => setIsFlashPaused(false)}
            onTouchStart={() => setIsFlashPaused(true)}
            onTouchEnd={() => setIsFlashPaused(false)}
          >
            {/* Arrow Buttons for Desktop */}
            <button
              type="button"
              onClick={handleFlashPrev}
              aria-label="Previous Flash Deal"
              className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-lg border border-[#E8E2D5] text-[#016831] hover:bg-[#016831] hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleFlashNext}
              aria-label="Next Flash Deal"
              className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-lg border border-[#E8E2D5] text-[#016831] hover:bg-[#016831] hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Track */}
            <div
              ref={flashScrollRef}
              className="flex flex-nowrap gap-2.5 sm:gap-3.5 overflow-x-auto py-2 scroll-smooth cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {loopedFlashProducts.map((product, idx) => (
                <div
                  key={`flash-${product.id || product.slug}-${idx}`}
                  className="flex-shrink-0 w-[150px] sm:w-[170px] md:w-[195px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#78716C] mt-3 px-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                স্বয়ংক্রিয়ভাবে ডান থেকে বামে স্ক্রল হচ্ছে
              </span>
              <span className="hidden sm:inline font-semibold text-[#016831]">
                পছন্দের পণ্যে দ্রুত অর্ডার নিশ্চিত করুন
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: DYNAMIC CATEGORY TABS & PRODUCT GRID
      ========================================================================= */}
      <div className="space-y-6 sm:space-y-8">
        {/* Section Title & Subheading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              আপনার পছন্দের জন্য প্রস্তাবিত
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[#016831] mt-1">
              আমাদের সকল সেরা পণ্যসমূহ
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#016831] hover:text-[#D97706] group transition-colors"
          >
            <span>সব পণ্য একসাথে দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D97706]" />
          </Link>
        </div>

        {/* Dynamic Category Segment Tabs (Pills Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeCategories.map((cat) => {
            const isActive = activeTab === cat.slug || activeTab === cat.id;
            return (
              <button
                key={cat.id || cat.slug}
                type="button"
                onClick={() => setActiveTab(cat.slug || cat.id)}
                className={`flex-shrink-0 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#016831] text-white border-[#016831] shadow-md scale-102'
                    : 'bg-white text-[#4B5563] border-[#E8E2D5] hover:bg-[#FDFBF7] hover:border-[#016831]/30'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name.split(' (')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E8E2D5]">
            <p className="text-sm text-[#6B7280] font-medium">
              এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই।
            </p>
            <button
              onClick={() => setActiveTab('all')}
              className="mt-3 px-4 py-2 bg-[#016831] text-white text-xs font-bold rounded-xl"
            >
              সকল পণ্য দেখুন
            </button>
          </div>
        )}

        {/* Bottom CTA Button */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#016831] to-[#02833E] hover:from-[#02833E] hover:to-[#016831] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>সম্পূর্ণ স্টোর ঘুরে দেখুন (সকল ক্যাটাগরি)</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </Link>
        </div>
      </div>
    </div>
  );
}
