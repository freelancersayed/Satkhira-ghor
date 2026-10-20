'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';

// ──────────────────────────────────────────────
// HD Sundarbans background slides (Unsplash)
// Admin can override via DB "hero.slides" field
// ──────────────────────────────────────────────
const DEFAULT_BG_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=90&w=1920',
    label: 'সুন্দরবনের খাঁটি মধু',
  },
  {
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=90&w=1920',
    label: 'জেলেরা মাছ ধরছেন',
  },
  {
    url: 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?auto=format&fit=crop&q=90&w=1920',
    label: 'তাজা চিংড়ি',
  },
  {
    url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=90&w=1920',
    label: 'হিমশাগর আম',
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=90&w=1920',
    label: 'সুন্দরবনের কাকড়া',
  },
];

// Crossfade every 3 seconds
const SLIDE_INTERVAL_MS = 3000;

export default function HeroBanner() {
  const { content, fetchContent } = useSiteContentStore();
  const hero = content?.hero || {};

  const [currentIdx, setCurrentIdx] = useState(0);

  // Build slides from DB or use defaults
  const slides =
    Array.isArray(hero.slides) && hero.slides.length > 0
      ? hero.slides.map((url) => ({ url, label: '' }))
      : DEFAULT_BG_SLIDES;

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const editFields = [
    { name: 'badgeText', label: 'টপ ব্যাজ লেখা', placeholder: 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার' },
    { name: 'title', label: 'প্রধান শিরোনাম', type: 'textarea', rows: 2 },
    { name: 'description', label: 'বিস্তারিত বিবরণ', type: 'textarea', rows: 3 },
    { name: 'floatingBadge1Title', label: 'বাম ব্যাজ শিরোনাম', placeholder: 'ল্যাব টেস্টে পরীক্ষিত' },
    { name: 'floatingBadge1Sub', label: 'বাম ব্যাজ সাবটাইটেল', placeholder: 'শূন্য ভেজাল গ্যারান্টি' },
    { name: 'floatingBadge2Title', label: 'ডান ব্যাজ শিরোনাম', placeholder: 'খাঁটি গাওয়া ঘি' },
    { name: 'floatingBadge2Sub', label: 'ডান ব্যাজ সাবটাইটেল', placeholder: 'দেশি গরুর দুধের ননী' },
    {
      name: 'slides',
      label: 'ব্যাকগ্রাউন্ড স্লাইড লিংক (প্রতি লাইনে একটি ImgBB/HD URL)',
      type: 'textarea',
      rows: 6,
    },
  ];

  return (
    <section className="relative overflow-hidden text-white py-20 sm:py-28 max-h-[500px]  min-h-[200px] sm:min-h-[200px]  flex items-center">

      {/* ── Full-background HD Slideshow ── */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === currentIdx ? 1 : 0 }}
          >
            <Image
              src={slide.url}
              alt={slide.label || `Slide ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover object-center"
              sizes="100vw"
              quality={90}
            />
          </div>
        ))}

        {/* Dark gradient overlay so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIdx ? 'w-8 bg-[#E5A93C]' : 'w-2 bg-white/40'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Admin Edit Button ── */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <AdminSectionEditModal
          sectionKey="hero"
          sectionTitle="হিরো ব্যানার এডিট করুন"
          fields={editFields}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#FAF0D4] text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#E5A93C]" />
              <span>{hero.badgeText || 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার'}</span>
            </div>

            {/* Current slide label */}
            {slides[currentIdx]?.label && (
              <p className="text-xs text-[#E5A93C] font-semibold tracking-widest uppercase animate-pulse">
                📍 {slides[currentIdx].label}
              </p>
            )}

            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight whitespace-pre-line drop-shadow-lg">
              {hero.title || (
                <>
                  প্রকৃতির সেরা উপহার,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAF0D4] via-[#E5A93C] to-[#FAF0D4]">
                    সরাসরি আপনার খাবার টেবিলে
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed drop-shadow">
              {hero.description ||
                'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-[#E5A93C] hover:bg-[#C98A23] text-[#102E25] font-black rounded-2xl shadow-lg hover:shadow-[#E5A93C]/40 transition-all flex items-center justify-center gap-2 group"
              >
                <span>পণ্য কিনুন</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about-us"
                className="w-full sm:w-auto px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-2xl backdrop-blur-md transition-all flex items-center justify-center gap-2"
              >
                <span>আমাদের গল্প শুনুন</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#E5A93C] drop-shadow">১০০%</div>
                <div className="text-[11px] text-white/70">প্রাকৃতিক ও খাঁটি</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#E5A93C] drop-shadow">১২,৫০০+</div>
                <div className="text-[11px] text-white/70">সন্তুষ্ট পরিবার</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-[#E5A93C] drop-shadow">২৪-৪৮ ঘণ্টা</div>
                <div className="text-[11px] text-white/70">সারাদেশে ডেলিভারি</div>
              </div>
            </div>
          </div>

          {/* Right: Floating Trust Cards */}
          <div className="lg:col-span-5 hidden lg:flex flex-col gap-4 items-end">

            {/* Trust Card 1 */}
            <div className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 w-64 animate-float">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/20 flex items-center justify-center text-[#E5A93C] flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">
                  {hero.floatingBadge1Title || 'ল্যাব টেস্টে পরীক্ষিত'}
                </div>
                <div className="text-[10px] text-white/70">
                  {hero.floatingBadge1Sub || 'শূন্য ভেজাল গ্যারান্টি'}
                </div>
              </div>
            </div>

            {/* Trust Card 2 */}
            <div className="bg-white/10 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 w-64">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-xs font-bold">
                  {hero.floatingBadge2Title || 'খাঁটি গাওয়া ঘি'}
                </div>
                <div className="text-[10px] text-white/70">
                  {hero.floatingBadge2Sub || 'দেশি গরুর দুধের ননী'}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
