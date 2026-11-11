'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Leaf,
  RotateCcw,
  Award,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';
import HeroBannerEditModal from '@/components/home/HeroBannerEditModal';

// ─────────────────────────────────────────────────────────────
// Default fallback slides (used only if database slides are empty)
// ─────────────────────────────────────────────────────────────
const DEFAULT_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=90&w=1920',
    link: '/products/sundarbans-pure-khalsi-honey',
    label: 'সুন্দরবনের খাঁটি মধু',
  },
  {
    url: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=90&w=1920',
    link: '/products/traditional-bilona-pure-cow-ghee',
    label: 'খাঁটি গাওয়া ঘি',
  },
  {
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=90&w=1920',
    link: '/products/cold-pressed-mustard-oil-ghani',
    label: 'ঘানি ভাঙা সরিষার তেল',
  },
];

const DEFAULT_SIDE_BANNER = {
  url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=90&w=1200',
  link: '/products/satkhira-sundarbans-mega-family-combo',
  label: 'মধু স্পেশাল কম্বোপ্যাক অফার',
};

const SLIDE_INTERVAL_MS = 4500;

export default function HeroBanner() {
  const { content, fetchContent } = useSiteContentStore();
  const hero = content?.hero || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Extract and normalize slides dynamically from database
  const slides = useMemo(() => {
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      const dbSlides = hero.slides
        .map((item) => {
          if (typeof item === 'string' && item.trim()) {
            return { url: item.trim(), link: '/shop', label: 'ব্যানার' };
          }
          if (item && typeof item === 'object' && item.url) {
            return {
              url: item.url,
              link: item.link || '/shop',
              label: item.label || 'ব্যানার',
            };
          }
          return null;
        })
        .filter(Boolean);

      if (dbSlides.length > 0) {
        return dbSlides;
      }
    }
    return DEFAULT_SLIDES;
  }, [hero.slides]);

  // 2nd side banner (small banner next to main slider - Polli Bazar style)
  const sideBanner = useMemo(() => {
    if (hero.sideBanner && typeof hero.sideBanner === 'object' && hero.sideBanner.url) {
      return {
        url: hero.sideBanner.url,
        link: hero.sideBanner.link || '/shop?cat=combos',
        label: hero.sideBanner.label || 'স্পেশাল অফার',
      };
    }
    if (typeof hero.sideBanner === 'string' && hero.sideBanner.trim()) {
      return {
        url: hero.sideBanner.trim(),
        link: '/shop?cat=combos',
        label: 'স্পেশাল অফার',
      };
    }
    // If database slides has extra slide, use the last one for side banner
    if (slides.length > 3) {
      return slides[slides.length - 1];
    }
    return DEFAULT_SIDE_BANNER;
  }, [hero.sideBanner, slides]);

  // Auto slide timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Wrap around index safely
  useEffect(() => {
    if (currentIdx >= slides.length) {
      setCurrentIdx(0);
    }
  }, [slides.length, currentIdx]);

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <section className="py-2.5 sm:py-4 bg-[#FCFBF7]">
      {/* ── Max Width 1600px (Polli Bazar Container Width) ── */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* ── Dual Banner Layout (Polli Bazar Style: 1st Large + 2nd Small) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 items-stretch">
          
          {/* ═════════════════════════════════════════════════════════════════
              ১ম ব্যানার (বড় স্লাইডার - ~৭২% / Col Span 8/9)
              ═════════════════════════════════════════════════════════════════ */}
          <div
            className="lg:col-span-8 xl:col-span-8 relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E8E2D5] shadow-xs group h-[200px] xs:h-[240px] sm:h-[320px] md:h-[380px] lg:h-[440px] xl:h-[480px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Admin Edit Modal Trigger (visible only to admin) */}
            <div className="absolute top-3 right-3 z-30">
              <HeroBannerEditModal />
            </div>

            {/* Slides (Pure Dynamic Graphics, Zero Text Overlay) */}
            {slides.map((slide, i) => {
              const isActive = i === currentIdx;
              const slideContent = (
                <div
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={slide.url}
                    alt={slide.label || `সাতক্ষীরা ঘর প্রধান ব্যানার ${i + 1}`}
                    fill
                    priority={i === 0}
                    className="object-cover object-center w-full h-full select-none"
                    sizes="(max-width: 1024px) 100vw, 72vw"
                    quality={90}
                  />
                </div>
              );

              return slide.link ? (
                <Link
                  key={`${slide.url}-${i}`}
                  href={slide.link}
                  aria-label={slide.label || `ব্যানার লিংক ${i + 1}`}
                  className="block w-full h-full"
                >
                  {slideContent}
                </Link>
              ) : (
                <div key={`${slide.url}-${i}`}>{slideContent}</div>
              );
            })}

            {/* Navigation Arrows (Clean white buttons on edges, matching reference image) */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Previous Banner"
                  className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/95 hover:bg-white text-[#016831] hover:text-[#D97706] shadow-md border border-[#E8E2D5] flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Next Banner"
                  className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/95 hover:bg-white text-[#016831] hover:text-[#D97706] shadow-md border border-[#E8E2D5] flex items-center justify-center transition-all duration-200 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Bottom-Left Dot Indicators (Matching reference image) */}
            {slides.length > 1 && (
              <div className="absolute bottom-3 left-4 sm:left-6 z-20 flex items-center gap-1.5 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIdx ? 'w-6 bg-[#FAB116]' : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`স্লাইড ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ২য় ব্যানার (ছোট সাইড ব্যানার - শুধু ডেস্কটপ/বড় স্ক্রিনে দৃশ্যমান)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-4 lg:h-[440px] xl:h-[480px]">
            <Link
              href={sideBanner.link || '/shop?cat=combos'}
              aria-label={sideBanner.label || 'সাইড ব্যানার'}
              className="group/side relative block w-full h-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FAF8F5] border border-[#E8E2D5] shadow-xs hover:shadow-md transition-shadow"
            >
              <Image
                src={sideBanner.url}
                alt={sideBanner.label || 'সাতক্ষীরা ঘর স্পেশাল অফার'}
                fill
                className="object-cover object-center w-full h-full select-none transition-transform duration-500 group-hover/side:scale-105"
                sizes="(max-width: 1024px) 100vw, 28vw"
                quality={90}
              />
            </Link>
          </div>

        </div>

        {/* ── 4-Pillar Trust Feature Strip (Polli Bazar Style) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-4">
          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-[#E8E2D5] shadow-xs flex items-center gap-2.5 sm:gap-3 hover:border-[#016831]/40 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#016831]/10 flex items-center justify-center text-[#016831] flex-shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#016831]">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-[10px] sm:text-xs text-[#8E9C96]">সারাদেশে দ্রুত হোম ডেলিভারি</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-[#E8E2D5] shadow-xs flex items-center gap-2.5 sm:gap-3 hover:border-[#016831]/40 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#016831]">১০০% অর্গানিক</h4>
              <p className="text-[10px] sm:text-xs text-[#8E9C96]">প্রকৃতি থেকে সরাসরি খাঁটি</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-[#E8E2D5] shadow-xs flex items-center gap-2.5 sm:gap-3 hover:border-[#016831]/40 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center text-[#D97706] flex-shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#016831]">ল্যাব টেস্ট সার্টিফাইড</h4>
              <p className="text-[10px] sm:text-xs text-[#8E9C96]">গুণগত মানের শতভাগ নিশ্চয়তা</p>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-[#E8E2D5] shadow-xs flex items-center gap-2.5 sm:gap-3 hover:border-[#016831]/40 transition-colors">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700 flex-shrink-0">
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#016831]">হ্যাপি রিটার্ন গ্যারান্টি</h4>
              <p className="text-[10px] sm:text-xs text-[#8E9C96]">সহজ পরিবর্তন ও রিফান্ড সুবিধা</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
