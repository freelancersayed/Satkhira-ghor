'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { categories as fallbackCategories, products } from '@/data/products';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';
import CategoryEditModal from '@/components/home/CategoryEditModal';

export default function CategorySection() {
  const { content } = useSiteContentStore();
  const catContent = content?.categorySection || {};

  // Extract dynamic categories from database, fallback to initial categories
  const categoriesList = useMemo(() => {
    if (Array.isArray(content?.categories) && content.categories.length > 0) {
      return content.categories;
    }
    return fallbackCategories;
  }, [content?.categories]);

  const displayCategories = categoriesList.filter((c) => c.id !== 'all' && c.slug !== 'all');

  // Dynamically compute product counts per category
  const getCategoryCount = (slug) => {
    return products.filter((p) => p.category === slug).length;
  };

  const toBanglaNum = (num) => {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bnDigits[d]);
  };

  const editFields = [
    { name: 'subtitle', label: 'সাবটাইটেল / টপ ট্যাগ', placeholder: 'পণ্য ক্যাটাগরি' },
    { name: 'title', label: 'প্রধান শিরোনাম', placeholder: 'উপকূল ও সুন্দরবনের সেরা ক্যাটাগরি' },
    { name: 'description', label: 'সংক্ষিপ্ত বিবরণ', type: 'textarea', rows: 2 },
  ];

  return (
    <section className="py-8 sm:py-14 bg-[#FCFBF7] relative border-b border-[#E8E2D5]/70">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                {catContent.subtitle || 'পণ্য ক্যাটাগরি'}
              </span>

              {/* Admin Section Title Editor */}
              <AdminSectionEditModal
                sectionKey="categorySection"
                sectionTitle="ক্যাটাগরি সেকশন এডিট করুন"
                fields={editFields}
              />

              {/* Admin Dynamic Category Manager & Logo/Image Uploader */}
              <CategoryEditModal />
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-[#016831] tracking-tight">
              {catContent.title || 'উপকূল ও সুন্দরবনের প্রাকৃতিক খাদ্য সম্ভার'}
            </h2>
            <p className="text-xs sm:text-sm text-[#56625D] mt-1 max-w-xl">
              {catContent.description ||
                'খাঁটি মধু, দানাদার ঘি, কাঠের ঘানি ভাঙা তেল ও ঐতিহ্যবাহী সন্দেশ—সরাসরি মূল কারিগর থেকে'}
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#016831] hover:text-[#D97706] transition-colors group"
          >
            <span>সব পণ্য একসাথে দেখুন</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ── Category Cards Grid (Responsive: Horizontal scroll on small mobile, grid on md/lg) ── */}
        <div className="flex sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 sm:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0">
          {displayCategories.map((cat) => {
            const count = getCategoryCount(cat.slug);
            return (
              <Link
                key={cat.id || cat.slug}
                href={`/shop?cat=${cat.slug}`}
                className="group flex-shrink-0 w-32 xs:w-36 sm:w-auto bg-white rounded-2xl p-2.5 sm:p-3.5 border border-[#E8E2D5] hover:border-[#016831]/50 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Visual Category Thumbnail with Rounded Container */}
                <div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#FAF8F5] mb-2 sm:mb-3 border border-[#E8E2D5]/70 group-hover:scale-105 transition-transform duration-300">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 120px, 150px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {cat.icon || '🌿'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <span className="absolute bottom-1 right-1 text-base sm:text-lg select-none">
                    {cat.icon}
                  </span>
                </div>

                {/* Category Name */}
                <h3 className="text-xs sm:text-sm font-extrabold text-[#016831] group-hover:text-[#D97706] transition-colors line-clamp-1">
                  {cat.name}
                </h3>

                {/* English Subtitle */}
                <p className="text-[10px] text-[#8E9C96] mt-0.5 line-clamp-1">
                  {cat.nameEn}
                </p>

                {/* Item Count Badge */}
                <div className="mt-2 text-[10px] font-bold text-[#016831] bg-[#F0FDF4] px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {count > 0 ? `${toBanglaNum(count)} টি পণ্য` : 'উপলব্ধ'}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All Link */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#016831] bg-white px-4 py-2 rounded-xl border border-[#E8E2D5] shadow-xs"
          >
            <span>সব পণ্য ব্রাউজ করুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
