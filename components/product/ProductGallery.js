'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function ProductGallery({ images = [], mainImage = '', name = 'Product Image' }) {
  // Combine primary image and additional gallery images, ensuring primary mainImage is always first
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(Array.isArray(images) ? images : []),
  ].filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx);

  const primaryImage = allImages[0] || mainImage || '';
  const [selectedImage, setSelectedImage] = useState(primaryImage);

  // Sync selectedImage if primaryImage changes (e.g. dynamic updates or navigation)
  useEffect(() => {
    if (primaryImage) {
      setSelectedImage(primaryImage);
    }
  }, [primaryImage]);

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FDFBF7] border border-[#E8E2D5] shadow-sm">
        {selectedImage ? (
          <Image
            src={selectedImage}
            alt={name}
            fill
            priority
            unoptimized={Boolean(selectedImage?.startsWith('data:'))}
            className="object-cover transition-all duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-stone-300">
            🌾
          </div>
        )}

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[#016831] shadow-sm border border-[#E8E2D5]">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          <span>খাঁটি ও প্রাকৃতিক গুণমান</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                selectedImage === img
                  ? 'border-[#016831] ring-2 ring-[#016831]/20 scale-105'
                  : 'border-[#E8E2D5] hover:border-[#016831]/50'
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
                unoptimized={Boolean(img?.startsWith('data:'))}
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
