'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ZoomIn,
  Sparkles,
} from 'lucide-react';

const toBanglaNum = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[d]);
};

const isUnoptimizedSrc = (src) => {
  if (!src || typeof src !== 'string') return false;
  return (
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('/uploads/') ||
    /\.(svg|jfif|bmp|heic|heif)(\?.*)?$/i.test(src)
  );
};

const DYNAMIC_FALLBACK_LOGO = '/uploads/upload_1795353755877_oioatm.png';

export default function ProductGallery({ images = [], mainImage = '', name = 'Product Image' }) {
  // Combine primary image and additional gallery images, ensuring primary mainImage is always first
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(Array.isArray(images) ? images : []),
  ].filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const handleImageError = (imgSrc) => {
    if (imgSrc) {
      setFailedImages((prev) => ({ ...prev, [imgSrc]: true }));
    }
  };

  const getSafeSrc = (src) => (failedImages[src] ? DYNAMIC_FALLBACK_LOGO : (src || DYNAMIC_FALLBACK_LOGO));

  // Sync index if images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [mainImage, images.length]);

  const rawSelectedImage = allImages[currentIndex] || mainImage || '';
  const selectedImage = getSafeSrc(rawSelectedImage);

  const handlePrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    },
    [allImages.length]
  );

  const handleNext = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    },
    [allImages.length]
  );

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className="space-y-3.5 select-none">
      {/* ── 1. Main Interactive Image Stage ── */}
      <div
        onClick={() => selectedImage && setIsLightboxOpen(true)}
        className="group relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D5] shadow-xs hover:shadow-md transition-all duration-300 cursor-zoom-in"
      >
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={`${name} - ছবি ${currentIndex + 1}`}
            fill
            priority
            quality={85}
            unoptimized={isUnoptimizedSrc(selectedImage)}
            onError={() => handleImageError(rawSelectedImage)}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
            🌾
          </div>
        )}

        {/* Quality Guarantee Badge */}
        <div className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-[#016831] shadow-xs border border-[#E8E2D5]/80 pointer-events-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>শতভাগ প্রাকৃতিক ও খাঁটি</span>
        </div>

        {/* Image Counter Badge (when multiple images) */}
        {allImages.length > 1 && (
          <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-xs pointer-events-none">
            {toBanglaNum(currentIndex + 1)} / {toBanglaNum(allImages.length)}
          </div>
        )}

        {/* Zoom Overlay Indicator */}
        <div className="absolute bottom-3.5 right-3.5 bg-white/90 backdrop-blur-md p-2 rounded-xl text-stone-700 shadow-sm border border-[#E8E2D5] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold">
          <Maximize2 className="w-3.5 h-3.5 text-[#016831]" />
          <span className="hidden sm:inline">বড় করে দেখুন</span>
        </div>

        {/* Prev / Next Navigation Arrows (Hover / Touch) */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-stone-800 shadow-md border border-[#E8E2D5] flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-[#016831]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-stone-800 shadow-md border border-[#E8E2D5] flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-[#016831]" />
            </button>
          </>
        )}
      </div>

      {/* ── 2. Side-by-Side Thumbnails Gallery Strip ── */}
      {allImages.length > 1 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1 text-[11px] text-[#56625D]">
            <span className="font-semibold flex items-center gap-1 text-[#016831]">
              <Sparkles className="w-3 h-3 text-[#D97706]" />
              <span>পণ্যের অন্যান্য দৃশ্য ({toBanglaNum(allImages.length)}টি ছবি)</span>
            </span>
            <span className="text-[10px] text-stone-400">ছবিতে ট্যাপ করে পরিবর্তন করুন</span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
            {allImages.map((img, idx) => {
              const isSelected = currentIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`group/thumb relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-200 border-2 ${
                    isSelected
                      ? 'border-[#016831] ring-2 ring-[#016831]/25 scale-102 shadow-sm'
                      : 'border-[#E8E2D5] opacity-75 hover:opacity-100 hover:border-[#016831]/50'
                  }`}
                  aria-label={`Show image ${idx + 1}`}
                >
                  <Image
                    src={getSafeSrc(img)}
                    alt={`${name} thumbnail ${idx + 1}`}
                    fill
                    quality={75}
                    unoptimized={isUnoptimizedSrc(img)}
                    onError={() => handleImageError(img)}
                    className="object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                    sizes="80px"
                  />

                  {/* Primary Cover Badge on First Thumbnail */}
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#016831]/85 text-white text-[8px] sm:text-[9px] font-bold py-0.5 text-center leading-none">
                      কভার
                    </span>
                  )}

                  {/* Active Indicator Overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-[#016831] rounded-xl sm:rounded-2xl pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Professional Full-Screen Lightbox Modal ── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-fadeIn"
        >
          {/* Top Bar with Title, Counter and Close */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between text-white pb-3 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-emerald-400 line-clamp-1">{name}</span>
              {allImages.length > 1 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-white font-mono">
                  {toBanglaNum(currentIndex + 1)} / {toBanglaNum(allImages.length)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Center Stage Large Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex-1 flex items-center justify-center my-3 max-h-[75vh]"
          >
            {selectedImage && (
              <div className="relative w-full h-full max-w-4xl max-h-[75vh]">
                <Image
                  src={selectedImage}
                  alt={name}
                  fill
                  quality={85}
                  unoptimized={isUnoptimizedSrc(selectedImage)}
                  onError={() => handleImageError(rawSelectedImage)}
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            )}

            {/* Lightbox Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all hover:scale-110"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {allImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex justify-center items-center gap-2 overflow-x-auto py-2 no-scrollbar"
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    currentIndex === idx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-105'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    unoptimized={isUnoptimizedSrc(img)}
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
