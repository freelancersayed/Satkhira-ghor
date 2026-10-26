'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { categories } from '@/data/products';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';

export default function CategorySection() {
  const displayCategories = categories.filter((c) => c.id !== 'all');
  const { content } = useSiteContentStore();
  const catContent = content?.categorySection || {};

  // Duplicate items 4 times to ensure seamless infinite looping
  const loopedCategories = [
    ...displayCategories,
    ...displayCategories,
    ...displayCategories,
    ...displayCategories,
  ];

  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-swipe right-to-left every 1 second (1000ms delay)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const firstItem = container.firstElementChild;
      const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 180; // 16px gap
      const singleCycleWidth = container.scrollWidth / 4;

      // Seamless wrap-around without visual jump
      if (container.scrollLeft >= singleCycleWidth * 2) {
        container.scrollLeft -= singleCycleWidth;
      }

      container.scrollBy({
        left: stepWidth,
        behavior: 'smooth',
      });
    }, 2000); // 1-second delay

    return () => clearInterval(interval);
  }, [isPaused, displayCategories.length]);

  const handlePrev = () => {
    const container = scrollRef.current;
    if (!container) return;
    const firstItem = container.firstElementChild;
    const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 180;
    container.scrollBy({ left: -stepWidth, behavior: 'smooth' });
  };

  const handleNext = () => {
    const container = scrollRef.current;
    if (!container) return;
    const firstItem = container.firstElementChild;
    const stepWidth = firstItem ? firstItem.offsetWidth + 16 : 180;
    container.scrollBy({ left: stepWidth, behavior: 'smooth' });
  };

  const editFields = [
    { name: 'subtitle', label: 'সাবটাইটেল / টপ ট্যাগ', placeholder: 'ক্যাটাগরি সমূহ' },
    { name: 'title', label: 'প্রধান শিরোনাম', placeholder: 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ' },
    { name: 'description', label: 'সংক্ষিপ্ত বিবরণ', type: 'textarea', rows: 2 },
  ];

  return (
    <section className="py-10 sm:py-14 bg-[#FDFBF7] relative border-b border-[#E8E2D5]/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              {catContent.subtitle || 'ক্যাটাগরি সমূহ'}
            </span>
            <AdminSectionEditModal
              sectionKey="categorySection"
              sectionTitle="ক্যাটাগরি সেকশন এডিট করুন"
              fields={editFields}
            />
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-[#0F3D2E] mt-1">
            {catContent.title || 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1.5">
            {catContent.description ||
              'প্রতিটি পণ্য নিজস্ব তদারকিতে প্রস্তুত ও শতভাগ খাঁটি হওয়ার নিশ্চয়তা'}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Edge Fade Overlays */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10" />

          {/* Left / Right Navigation Buttons (visible on md+) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Category"
            className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-md border border-[#E8E2D5] text-[#0F3D2E] hover:bg-[#0F3D2E] hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Category"
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-white shadow-md border border-[#E8E2D5] text-[#0F3D2E] hover:bg-[#0F3D2E] hover:text-white transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Single-Line Auto-Swiping List */}
          <div
            ref={scrollRef}
            className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto py-2 px-2 scroll-smooth cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {loopedCategories.map((cat, index) => (
              <Link
                key={`${cat.id}-${index}`}
                href={`/shop?cat=${cat.id}`}
                className="flex-shrink-0 w-[130px] sm:w-[170px] md:w-[195px] bg-white rounded-2xl p-3 sm:p-5 text-center border border-[#E8E2D5] shadow-xs hover:shadow-lg hover:border-[#0F3D2E]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center group/card"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-2xl sm:text-3xl mb-2 group-hover/card:scale-110 group-hover/card:bg-[#FDE68A] transition-all">
                  {cat.icon}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0F3D2E] group-hover/card:text-[#D97706] transition-colors line-clamp-1 w-full text-center">
                  {cat.name.split(' (')[0]}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#6B7280] group-hover/card:text-[#0F3D2E] mt-0.5 sm:mt-1 font-medium transition-colors">
                  পণ্য দেখুন →
                </span>
              </Link>
            ))}
          </div>

          {/* Auto-Slide Indicator Bar / Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="text-[11px] font-medium text-[#78716C]">
              স্বয়ংক্রিয়ভাবে পরিবর্তিত হচ্ছে (হোভার বা স্পর্শ করলে থামবে)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
