'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

export default function ProductGallery({ images = [], name = 'Product Image' }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#FDFBF7] border border-[#E8E2D5] shadow-sm">
        <Image
          src={selectedImage}
          alt={name}
          fill
          priority
          className="object-cover transition-all duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold text-[#0F3D2E] shadow-sm border border-[#E8E2D5]">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
          <span>খাঁটি ও প্রাকৃতিক গুণমান</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                selectedImage === img
                  ? 'border-[#0F3D2E] ring-2 ring-[#0F3D2E]/20 scale-105'
                  : 'border-[#E8E2D5] hover:border-[#0F3D2E]/50'
              }`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${idx + 1}`}
                fill
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
