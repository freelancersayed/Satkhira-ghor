'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';

export default function SpecialBanner() {
  const { content } = useSiteContentStore();
  const banner = content?.specialBanner || {};

  const editFields = [
    { name: 'badgeText', label: 'টপ ব্যাজ লেখা', placeholder: 'সরাসরি মৌয়ালদের থেকে সংগৃহীত' },
    { name: 'title', label: 'ব্যানার শিরোনাম', placeholder: 'খাঁটি সুন্দরবনের কাঁচা মধু চেখে দেখেছেন কি?' },
    { name: 'description', label: 'বিস্তারিত বিবরণ', type: 'textarea', rows: 3 },
    { name: 'buttonText', label: 'বাটন টেক্সট', placeholder: 'খলসী মধু অর্ডার করুন' },
    { name: 'buttonLink', label: 'বাটন লিংক', placeholder: '/products/sundarbans-pure-khalsi-honey' },
  ];

  return (
    <section className="py-12 bg-[#0F3D2E] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0F3D2E] via-[#0D3528] to-[#0A2B20] rounded-3xl p-8 sm:p-12 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Admin Edit Trigger */}
          <div className="absolute top-4 right-4 z-20">
            <AdminSectionEditModal
              sectionKey="specialBanner"
              sectionTitle="স্পেশাল অফার ব্যানার এডিট করুন"
              fields={editFields}
            />
          </div>

          <div className="space-y-3 text-center md:text-left z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{banner.badgeText || 'সরাসরি মৌয়ালদের থেকে সংগৃহীত'}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {banner.title || 'খাঁটি সুন্দরবনের কাঁচা মধু চেখে দেখেছেন কি?'}
            </h2>
            <p className="text-xs sm:text-sm text-[#FEF3C7]/90 max-w-xl leading-relaxed">
              {banner.description ||
                'কোনো হিটিং বা পাস্তুরাইজেশন ছাড়া মৌচাকের অক্ষুণ্ণ এনজাইম ও প্রাকৃতিক পরাগরেণু সহ আমরা আপনাদের হাতে তুলে দিচ্ছি শতভাগ খাঁটি মধু।'}
            </p>
          </div>

          <div className="z-10 flex-shrink-0">
            <Link
              href={banner.buttonLink || '/products/sundarbans-pure-khalsi-honey'}
              className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg flex items-center gap-2 group"
            >
              <span>{banner.buttonText || 'খলসী মধু অর্ডার করুন'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
