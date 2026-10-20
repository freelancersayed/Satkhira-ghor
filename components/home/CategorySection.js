'use client';

import Link from 'next/link';
import { categories } from '@/data/products';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';

export default function CategorySection() {
  const displayCategories = categories.filter((c) => c.id !== 'all');
  const { content } = useSiteContentStore();
  const catContent = content?.categorySection || {};

  const editFields = [
    { name: 'subtitle', label: 'সাবটাইটেল / টপ ট্যাগ', placeholder: 'ক্যাটাগরি সমূহ' },
    { name: 'title', label: 'প্রধান শিরোনাম', placeholder: 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ' },
    { name: 'description', label: 'সংক্ষিপ্ত বিবরণ', type: 'textarea', rows: 2 },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#FAF8F4] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 relative">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-widest">
              {catContent.subtitle || 'ক্যাটাগরি সমূহ'}
            </span>
            <AdminSectionEditModal
              sectionKey="categorySection"
              sectionTitle="ক্যাটাগরি সেকশন এডিট করুন"
              fields={editFields}
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E] mt-1">
            {catContent.title || 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5B53] mt-2">
            {catContent.description ||
              'প্রতিটি পণ্য নিজস্ব তদারকিতে প্রস্তুত ও শতভাগ খাঁটি হওয়ার নিশ্চয়তা'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {displayCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?cat=${cat.id}`}
              className="group bg-white rounded-2xl p-6 text-center border border-[#EFE9DC] shadow-sm hover:shadow-lg hover:border-[#1B4D3E]/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FAF0D4] flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <h3 className="text-sm font-bold text-[#1B4D3E] group-hover:text-[#C86D3B] transition-colors">
                {cat.name.split(' (')[0]}
              </h3>
              <span className="text-[11px] text-[#4A5B53] mt-1">
                পণ্য দেখুন →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
