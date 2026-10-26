'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';
import HeroBannerEditModal from '@/components/home/HeroBannerEditModal';

// ──────────────────────────────────────────────
// Default Sundarbans HD background slides
// ──────────────────────────────────────────────
const DEFAULT_BG_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=1280',
    label: 'সুন্দরবনের খাঁটি মধু',
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1280',
    label: 'জেলেদের তাজা মাছ আহরণ',
  },
  {
    url: 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?auto=format&fit=crop&q=80&w=1280',
    label: 'উপকূলের তাজা চিংড়ি',
  },
  {
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=1280',
    label: 'সাতক্ষীরার বিখ্যাত হিমসাগর আম',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1280',
    label: 'খাঁটি দেশি খাদ্য সম্ভার',
  },
];

// Auto-advance interval
const SLIDE_INTERVAL_MS = 4500;

export default function HeroBanner() {
  const { content, fetchContent } = useSiteContentStore();
  const hero = content?.hero || {};

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Normalize slides from database or use defaults
  const slides =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides
          .map((item) => {
            if (typeof item === 'string') return { url: item, label: '' };
            if (item && typeof item === 'object') return { url: item.url || '', label: item.label || '' };
            return null;
          })
          .filter((item) => item && item.url)
      : DEFAULT_BG_SLIDES;

  const validSlides = slides.length > 0 ? slides : DEFAULT_BG_SLIDES;

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Handle slide wrap-around if slides array changes
  useEffect(() => {
    if (currentIdx >= validSlides.length) {
      setCurrentIdx(0);
    }
  }, [validSlides.length, currentIdx]);

  // Auto-play slideshow
  useEffect(() => {
    if (validSlides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % validSlides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [validSlides.length, isPaused]);

  // Slide navigation
  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev === 0 ? validSlides.length - 1 : prev - 1));
  }, [validSlides.length]);

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % validSlides.length);
  }, [validSlides.length]);

  // Convert numbers to Bengali digits
  const toBanglaNum = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  return (
    <section className="py-3 sm:py-6 lg:py-8 bg-[#FDFBF7]">
      {/* ── Width aligned container with other sections ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Framed Hero Card ── */}
        <div
          className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-[#0F3D2E]/25 border border-[#0F3D2E]/15 min-h-[480px] sm:min-h-[520px] lg:min-h-[570px] flex items-center group bg-[#0F3D2E]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >

          {/* ── Background Slideshow ── */}
          <div className="absolute inset-0 z-0">
            {validSlides.map((slide, i) => (
              <div
                key={`${slide.url}-${i}`}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: i === currentIdx ? 1 : 0,
                  pointerEvents: i === currentIdx ? 'auto' : 'none',
                }}
              >
                <Image
                  src={slide.url}
                  alt={slide.label || `সাতক্ষীরা ঘর ব্যানার স্লাইড ${i + 1}`}
                  fill
                  priority={i === 0}
                  className="object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out group-hover:scale-100"
                  sizes="(max-w-7xl) 100vw, 1280px"
                  quality={80}
                />
              </div>
            ))}

            {/* Premium Multi-layer Contrast Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />
            <div className="absolute inset-0 bg-[#0F3D2E]/20 mix-blend-multiply" />
          </div>

          {/* ── Slide Navigation Arrows (Glassmorphic) ── */}
          {validSlides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#F59E0B] text-white hover:text-slate-950 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-[#F59E0B] text-white hover:text-slate-950 backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 shadow-xl"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* ── Bottom Slide Indicators & Counter ── */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
            {validSlides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIdx ? 'w-7 sm:w-8 bg-[#F59E0B]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`স্লাইড ${i + 1}`}
              />
            ))}
            {validSlides.length > 1 && (
              <span className="text-[10px] sm:text-[11px] font-bold text-white/80 border-l border-white/30 pl-2 ml-1">
                {toBanglaNum(currentIdx + 1)} / {toBanglaNum(validSlides.length)}
              </span>
            )}
          </div>

          {/* ── Admin Edit Modal Button (Only visible to admin) ── */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
            <HeroBannerEditModal />
          </div>

          {/* ── Main Content Container ── */}
          <div className="relative z-10 w-full px-5 sm:px-10 lg:px-14 py-12 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left Column: Headings & Action CTAs */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">

                {/* Top Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-[#FEF3C7] text-xs font-bold shadow-lg">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <span>{hero.badgeText || 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার'}</span>
                </div>

                {/* Optional slide location caption */}
                {validSlides[currentIdx]?.label && (
                  <p className="text-xs text-[#F59E0B] font-bold tracking-wider uppercase flex items-center justify-center lg:justify-start gap-1.5 animate-fadeIn">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                    <span>📍 {validSlides[currentIdx].label}</span>
                  </p>
                )}

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.25] sm:leading-[1.2] whitespace-pre-line drop-shadow-xl text-white">
                  {hero.title ? (
                    hero.title
                  ) : (
                    <>
                      প্রকৃতির সেরা উপহার,{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FEF3C7] via-[#F59E0B] to-[#FEF3C7]">
                        সরাসরি আপনার খাবার টেবিলে
                      </span>
                    </>
                  )}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm lg:text-base text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed drop-shadow">
                  {hero.description ||
                    'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।'}
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                  <Link
                    href={hero.primaryBtnLink || '/shop'}
                    className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 group text-xs sm:text-sm"
                  >
                    <span>{hero.primaryBtnText || 'পণ্য কিনুন'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={hero.secondaryBtnLink || '/about-us'}
                    className="w-full sm:w-auto px-6 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-2xl backdrop-blur-md transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <span>{hero.secondaryBtnText || 'আমাদের গল্প শুনুন'}</span>
                  </Link>
                </div>

                {/* Quick Statistics Bar */}
                <div className="pt-4 border-t border-white/20 grid grid-cols-3 gap-3 sm:gap-6 text-center lg:text-left">
                  <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-white/10">
                    <div className="text-base sm:text-xl font-black text-[#F59E0B] drop-shadow">
                      {hero.stat1Number || '১০০%'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-medium">
                      {hero.stat1Label || 'প্রাকৃতিক ও খাঁটি'}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-white/10">
                    <div className="text-base sm:text-xl font-black text-[#F59E0B] drop-shadow">
                      {hero.stat2Number || '১২,৫০০+'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-medium">
                      {hero.stat2Label || 'সন্তুষ্ট পরিবার'}
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm p-2 sm:p-2.5 rounded-xl border border-white/10">
                    <div className="text-base sm:text-xl font-black text-[#F59E0B] drop-shadow">
                      {hero.stat3Number || '২৪-৪৮ ঘণ্টা'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-white/80 font-medium">
                      {hero.stat3Label || 'সারাদেশে ডেলিভারি'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Floating Trust Cards (Desktop Only) */}
              <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 items-end">

                {/* Trust Card 1 */}
                <div className="bg-black/35 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3.5 w-72 transform hover:-translate-y-1 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] flex-shrink-0 shadow-inner">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {hero.floatingBadge1Title || 'ল্যাব টেস্টে পরীক্ষিত'}
                    </div>
                    <div className="text-[11px] text-white/75 mt-0.5">
                      {hero.floatingBadge1Sub || 'শূন্য ভেজাল গ্যারান্টি'}
                    </div>
                  </div>
                </div>

                {/* Trust Card 2 */}
                <div className="bg-black/35 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3.5 w-72 transform hover:-translate-y-1 transition-all mr-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-inner">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {hero.floatingBadge2Title || 'খাঁটি গাওয়া ঘি'}
                    </div>
                    <div className="text-[11px] text-white/75 mt-0.5">
                      {hero.floatingBadge2Sub || 'দেশি গরুর দুধের ননী'}
                    </div>
                  </div>
                </div>

                {/* Trust Card 3 (Additional Quality Guarantee) */}
                <div className="bg-black/35 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 w-64 mr-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-white/90">
                    ক্যাশ অন ডেলিভারি সুবিধা
                  </span>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
