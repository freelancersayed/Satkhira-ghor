import Link from 'next/link';
import { FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'ব্যবহারের শর্তাবলি (Terms & Conditions) | সাতক্ষীরা ঘর',
  description: 'সাতক্ষীরা ঘর প্ল্যাটফর্মের ওয়েবসাইট ব্যবহার, অনলাইন অর্ডার ও ডেলিভারি সম্পর্কিত নিয়ম ও শর্তাবলি।',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF7] py-8 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#78716C] mb-6">
          <Link href="/" className="hover:text-[#016831]">হোম</Link>
          <span>/</span>
          <span className="text-[#016831] font-bold">শর্তাবলি</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#016831]/10 text-[#016831] flex items-center justify-center mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#016831] mb-2">
            ব্যবহারের শর্তাবলি (Terms & Conditions)
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6B64] leading-relaxed">
            ‘সাতক্ষীরা ঘর’ ওয়েবসাইটে প্রবেশ ও অনলাইন অর্ডারের মাধ্যমে আপনি নিচের শর্তাবলি মেনে নিতে সম্মত হচ্ছেন।
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-xs text-xs sm:text-sm text-[#3E4A44] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">১. পণ্য ও মূল্য সংক্রান্ত তথ্য</h2>
            <p>
              আমরা আমাদের সকল প্রাকৃতিক ও অর্গানিক পণ্যের ওজন, গুণমান এবং মূল্যের সঠিক বিবরণ তুলে ধরতে সচেষ্ট। তবে বাজারের কাঁচামালের প্রাপ্যতা ও মৌসুমের ওপর ভিত্তি করে পণ্যের মূল্য সমন্বিত হতে পারে।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">২. অনলাইন অর্ডার ও ডেলিভারি</h2>
            <p>
              ঢাকা সিটির ভেতর ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ২-৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ার সার্ভিসের মাধ্যমে হোম ডেলিভারি সম্পন্ন করা হয়। গ্রাহকের প্রদত্ত সঠিক নাম ও মোবাইল নম্বর অর্ডার সম্পন্ন হওয়ার পূর্বশর্ত।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">৩. পেমেন্ট পদ্ধতি</h2>
            <p>
              আমরা ক্যাশ অন ডেলিভারি (Cash on Delivery) প্রদান করি। এছাড়া বিকাশ বা সরাসরি ব্যাংক পেমেন্ট অনুমোদিত।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#016831]">৪. অর্ডার বাতিল বা পরিবর্তন</h2>
            <p>
              পার্সেল কুরিয়ারে বুকিং হওয়ার পূর্ব পর্যন্ত গ্রাহক হেল্পলাইনে যোগাযোগ করে বিনা চার্জে অর্ডার বাতিল বা পরিবর্তন করতে পারবেন।
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
