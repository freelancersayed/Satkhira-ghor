import Link from 'next/link';
import { RotateCcw, ShieldCheck, Truck, CheckCircle2, Phone, Mail } from 'lucide-react';

export const metadata = {
  title: 'রিটার্ন ও রিফান্ড পলিসি | সাতক্ষীরা ঘর (Satkhira Ghor)',
  description: 'সাতক্ষীরা ঘরের ১০০% খাঁটি পণ্যের নিশ্চয়তা ও সহজ রিটার্ন/রিফান্ড নীতি। পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধের সুবিধা।',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-6">
          <Link href="/" className="hover:text-[#016831]">হোম</Link>
          <span>/</span>
          <span className="text-[#016831] font-bold">রিটার্ন ও রিফান্ড পলিসি</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#016831]/10 text-[#016831] flex items-center justify-center mb-4">
            <RotateCcw className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#016831] mb-2">
            রিটার্ন ও রিফান্ড পলিসি (Return & Refund Policy)
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6B64] leading-relaxed">
            ‘সাতক্ষীরা ঘর’-এ আমরা প্রতিটি পণ্যের শতভাগ বিশুদ্ধতা ও গুণগত মান নিশ্চিত করি। তবে যেকোনো অনাকাঙ্ক্ষিত পরিস্থিতিতে আপনার স্বার্থ সুরক্ষায় আমাদের রয়েছে সহজ ও গ্রাহকবান্ধব রিটার্ন সুবিধা।
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs text-xs sm:text-sm text-[#3E4A44] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#FAB116]" />
              ১. ডেলিভারির সময় পার্সেল যাচাই (Check in front of Delivery Rider)
            </h2>
            <p>
              ডেলিভারি ম্যানের উপস্থিতিতে পার্সেল খুলে পণ্যের জার, বোতল বা প্যাকেট অক্ষত আছে কি না এবং সঠিক পণ্য পেয়েছেন কি না তা দেখে নিন। কোনো ত্রুটি পরিলক্ষিত হলে ডেলিভারি ম্যানের কাছেই পণ্যটি ফেরত দিতে পারবেন।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FAB116]" />
              ২. গুণগত মানের ত্রুটি বা ভেজাল সংক্রান্ত নিশ্চয়তা
            </h2>
            <p>
              আমাদের সুন্দরবনের মধু, গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল বা ক্ষীর সন্দেশে যদি কোনো কৃত্রিম রাসায়নিক বা ভেজাল প্রমাণিত হয়, তবে আমরা <strong>১০০% অর্থ ফেরত (Full Refund)</strong> দেওয়ার নিশ্চয়তা প্রদান করি।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FAB116]" />
              ৩. রিটার্ন বা পরিবর্তনের সময়সীমা (Replacement Timeline)
            </h2>
            <p>
              পণ্য গ্রহণের সর্বোচ্চ <strong>৭ দিনের মধ্যে</strong> যেকোনো সমস্যা আমাদের হেল্পলাইনে জানিয়ে ছবি বা ভিডিও পাঠালে আমরা বিনামূল্যে নতুন পণ্য পাঠিয়ে দেব অথবা আপনার পেমেন্ট ফেরত দেব।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#FAB116]" />
              ৪. রিফান্ড পাওয়ার নিয়মাবলী (Refund Method)
            </h2>
            <p>
              রিফান্ড অনুমোদনের পর ৩ থেকে ৫ কার্যদিবসের মধ্যে বিকাশ, নগদ বা ব্যাংক ট্রান্সফারের মাধ্যমে গ্রাহকের দেওয়া একাউন্টে সম্পূর্ণ টাকা ফেরত পাঠিয়ে দেওয়া হবে।
            </p>
          </section>

          {/* Contact Box */}
          <div className="pt-6 border-t border-[#E8E2D5] bg-[#FAF8F5] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-[#016831]">রিটার্ন সংক্রান্ত যেকোনো প্রয়োজনে যোগাযোগ করুন</h3>
              <p className="text-xs text-[#78716C] mt-0.5">আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনাকে তাৎক্ষণিক সহায়তা করবেন</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/cart"
                className="px-4 py-2 bg-[#016831] text-white rounded-xl text-xs font-bold hover:bg-[#014D24] transition-colors"
              >
                পণ্য কিনতে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
