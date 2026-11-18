import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'গোপনীয়তা নীতি (Privacy Policy) | সাতক্ষীরা ঘর',
  description: 'সাতক্ষীরা ঘর গ্রাহকের ব্যক্তিগত তথ্য সুরক্ষা ও গোপনীয়তা রক্ষার অঙ্গীকার করে।',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-6">
          <Link href="/" className="hover:text-[#016831]">হোম</Link>
          <span>/</span>
          <span className="text-[#016831] font-bold">গোপনীয়তা নীতি</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#016831]/10 text-[#016831] flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#016831] mb-2">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6B64] leading-relaxed">
            আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তা রক্ষা করা ‘সাতক্ষীরা ঘর’-এর সর্বোচ্চ অগ্রাধিকার।
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs text-xs sm:text-sm text-[#3E4A44] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">১. আমরা কী তথ্য সংগ্রহ করি?</h2>
            <p>
              অর্ডার প্রক্রিয়া সম্পন্ন করার জন্য আমরা গ্রাহকের নাম, মোবাইল নম্বর, ডেলিভারি ঠিকানা এবং ঐচ্ছিক ইমেইল সংগ্রহ করি। আমরা কোনো ব্যাংক পাসওয়ার্ড বা গোপন পিন সংরক্ষণ করি না।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">২. সংগৃহীত তথ্যের ব্যবহার</h2>
            <p>
              আপনার তথ্য শুধুমাত্র পণ্য ডেলিভারি, পার্সেল ট্র্যাকিং সংক্রান্ত নোটিফিকেশন প্রদান এবং কাস্টমার সার্ভিসের প্রয়োজনে ব্যবহৃত হয়।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">৩. তথ্য সুরক্ষা ও গোপনীয়তা</h2>
            <p>
              আমরা কোনো তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বা ফোন নম্বর বিক্রি বা অপব্যবহার করি না। শুধুমাত্র পার্সেল প্রেরণের জন্য অনুমোদিত কুরিয়ার পার্টনারের সাথে প্রয়োজনীয় ডেলিভারি তথ্য শেয়ার করা হয়।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
