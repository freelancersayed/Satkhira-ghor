'use client';

import { useState } from 'react';
import {
  FileText,
  Sparkles,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Info,
} from 'lucide-react';

export default function ProductDetailsCard({ product }) {
  const [activeTab, setActiveTab] = useState('description');
  const [isExpanded, setIsExpanded] = useState(false);

  const rawDescription =
    product.description ||
    product.shortDescription ||
    'সাতক্ষীরা ঘরের প্রতিটি পণ্য ১০০% প্রাকৃতিক ও ঐতিহ্যবাহী উপায়ে সংগৃহীত। এতে কোনো কৃত্রিম রঙ, কেমিক্যাল বা প্রিজারভেটিভ ব্যবহার করা হয় না। বিশুদ্ধতা ও মানের নিশ্চয়তা সহ সরাসরি আপনার ঠিকানায় পৌঁছে দেওয়া হয়।';

  const hasBenefits = Array.isArray(product.benefits) && product.benefits.length > 0;
  const hasNutrition =
    product.nutritionalInfo &&
    typeof product.nutritionalInfo === 'object' &&
    Object.keys(product.nutritionalInfo).length > 0;

  // Decide if description is long enough to warrant an expand/collapse toggle (>280 chars)
  const isLongDescription = rawDescription.length > 280;
  const displayedDescription =
    isLongDescription && !isExpanded
      ? rawDescription.slice(0, 260) + '...'
      : rawDescription;

  // Quick specs for at-a-glance info
  const specs = [
    {
      label: 'ক্যাটাগরি',
      value: product.categoryName || 'খাঁটি খাদ্যপণ্য',
      icon: Layers,
      color: 'text-[#B45309]',
      bg: 'bg-amber-50',
    },
    {
      label: 'উৎস স্থল',
      value: product.origin || 'সাতক্ষীরা সুন্দরবন',
      icon: MapPin,
      color: 'text-[#016831]',
      bg: 'bg-emerald-50',
    },
    {
      label: 'সংগ্রহ কাল',
      value: product.harvestDate || 'তাজা সংগ্রহ',
      icon: Calendar,
      color: 'text-[#D97706]',
      bg: 'bg-orange-50',
    },
    {
      label: 'মান ও বিশুদ্ধতা',
      value: product.purityGuarantee || '১০০% প্রাকৃতিক ও খাঁটি',
      icon: ShieldCheck,
      color: 'text-[#016831]',
      bg: 'bg-emerald-50',
    },
    {
      label: 'প্যাকেজিং',
      value: product.packaging || 'ফুড-গ্রেড এয়ারটাইট জার',
      icon: Package,
      color: 'text-stone-700',
      bg: 'bg-stone-50',
    },
    {
      label: 'পেমেন্ট সুবিধা',
      value: product.paymentTerms || 'ক্যাশ অন ডেলিভারি',
      icon: Truck,
      color: 'text-[#016831]',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div
      id="product-details-card"
      className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden transition-all scroll-mt-20"
    >
      {/* ── 1. Compact, Screen-Friendly Interactive Tab Bar ── */}
      <div className="flex items-center border-b border-[#E8E2D5] bg-[#FAF8F5] p-1.5 sm:p-2 gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          className={`flex-1 min-w-[110px] py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
            activeTab === 'description'
              ? 'bg-[#016831] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#016831] hover:bg-white/80'
          }`}
        >
          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>পণ্যের বিবরণ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('benefits')}
          className={`flex-1 min-w-[110px] py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
            activeTab === 'benefits'
              ? 'bg-[#016831] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#016831] hover:bg-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-amber-500" />
          <span>উপকারিতা ও পুষ্টি</span>
          {hasBenefits && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                activeTab === 'benefits'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-[#016831]'
              }`}
            >
              {product.benefits.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivery')}
          className={`flex-1 min-w-[110px] py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all select-none ${
            activeTab === 'delivery'
              ? 'bg-[#016831] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#016831] hover:bg-white/80'
          }`}
        >
          <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>ডেলিভারি ও সংরক্ষণ</span>
        </button>
      </div>

      {/* ── 2. Tab Content Panels ── */}
      <div className="p-3.5 sm:p-5 lg:p-6">
        {/* ── TAB 1: Detailed Description & Quick Specs ── */}
        {activeTab === 'description' && (
          <div className="space-y-4 sm:space-y-5 animate-fadeIn">
            {/* Quick Specs Micro-Grid (এক নজরে স্পেসিফিকেশন) */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Info className="w-3.5 h-3.5 text-[#016831]" />
                <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  এক নজরে তথ্যাবলী
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {specs.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8E2D5] flex items-center gap-2 hover:border-[#016831]/40 transition-colors"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] text-stone-500 font-medium truncate">
                          {item.label}
                        </span>
                        <span className="block text-xs font-bold text-[#016831] truncate">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Body */}
            <div className="pt-3 border-t border-[#E8E2D5]/80 space-y-2">
              <h3 className="text-xs font-bold text-[#016831] uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                <span>বিস্তারিত বিবরণ</span>
              </h3>

              <div className="text-xs sm:text-[13px] text-stone-700 leading-relaxed whitespace-pre-line space-y-2 font-normal">
                {displayedDescription}
              </div>

              {/* Expand / Collapse Toggle for Long Descriptions */}
              {isLongDescription && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#016831] hover:text-[#B45309] pt-1 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <span>সংক্ষেপ করুন</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>আরও বিস্তারিত পড়ুন</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Quality Commitment Trust Strip */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#016831] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-emerald-950 font-medium leading-relaxed">
                <strong>সাতক্ষীরা ঘর নিশ্চয়তা:</strong> প্রতিটি পণ্য কঠোর মান নিয়ন্ত্রণ ও শতভাগ বিশুদ্ধতা বজায় রেখে সংগ্রহ ও প্যাকেজিং করা হয়। কোনো প্রকার ভেজাল বা কৃত্রিম কেমিক্যাল মুক্ত।
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 2: Benefits & Nutritional Information ── */}
        {activeTab === 'benefits' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Benefits List */}
            {hasBenefits ? (
              <div>
                <h3 className="text-xs font-bold text-[#016831] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#016831]" />
                  <span>মূল স্বাস্থ্য উপকারিতা ও বিশেষত্ব</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#016831] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#014D24] font-medium leading-snug">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-xs text-[#014D24] leading-relaxed">
                🌿 <strong>প্রাকৃতিক গুণাগুণ:</strong> নিয়মিত স্বাস্থ্যসম্মত খাঁটি খাদ্যপণ্য গ্রহণে শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়ে, হজম শক্তি বৃদ্ধি পায় এবং প্রাকৃতিক শক্তি জোগায়।
              </div>
            )}

            {/* Nutrition Facts */}
            {hasNutrition && (
              <div className="pt-3 border-t border-[#E8E2D5]">
                <h3 className="text-xs font-bold text-[#016831] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>পুষ্টি উপাদান (Nutrition Facts)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(product.nutritionalInfo).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] flex flex-col justify-center"
                    >
                      <span className="text-[10px] text-stone-500 truncate">{key}</span>
                      <span className="text-xs font-bold text-[#016831]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Delivery, Returns & Storage Advice ── */}
        {activeTab === 'delivery' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Storage Advice */}
            <div className="p-3 rounded-xl bg-[#FEF3C7] text-[#92400E] text-xs leading-relaxed border border-[#FDE68A] flex items-start gap-2">
              <span className="text-base flex-shrink-0 leading-none">💡</span>
              <div>
                <strong>সংরক্ষণ পদ্ধতি:</strong> {product.storageTips || 'আর্দ্রতামুক্ত ও শীতল স্থানে বায়ুরোধী পাত্রে সংরক্ষণ করুন। সরাসরি সূর্যালোক ও অতিরিক্ত তাপ থেকে দূরে রাখুন।'}
              </div>
            </div>

            {/* Delivery Timeline Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8E2D5] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#016831]">
                  <Truck className="w-3.5 h-3.5 text-[#016831]" />
                  <span>ডেলিভারি সময়সীমা</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-line">
                  {product.deliveryTimeline || '• ঢাকা সিটির ভেতর: ২৪-৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি।\n• সমগ্র বাংলাদেশ: ২-৩ কার্যদিবসের মধ্যে কুরিয়ার ডেলিভারি।'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FDFBF7] border border-[#E8E2D5] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#016831]">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>সহজ রিটার্ন ও চেক সুবিধা</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed whitespace-pre-line">
                  {product.returnPolicy || 'পার্সেল রিসিভ করার সময় চেক করে মূল্য পরিশোধ করতে পারবেন। কোনো অসঙ্গতি থাকলে তাত্ক্ষণিক রিটার্ন করতে পারবেন।'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
