import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'আমাদের গল্প | সাতক্ষীরা ঘর - সুন্দরবনের খাঁটি খাদ্য সম্ভার',
  description:
    'সাতক্ষীরা ঘর-এর উৎপত্তি, সুন্দরবনের ঐতিহ্যবাহী মৌয়াল ও খামারিদের খাঁটি পণ্য সরাসরি আপনার খাবার টেবিলে পৌঁছে দেওয়ার আমাদের অঙ্গীকার।',
};

export default function AboutUsPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FAF0D4] text-[#7E4E18] text-xs font-bold border border-[#F5DE9F]">
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            আমাদের আত্মপ্রকাশ ও অঙ্গীকার
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#1B4D3E] tracking-tight">
            প্রকৃতির খাঁটি স্বাদ ঘরে ঘরে পৌঁছে দেওয়ার গল্প
          </h1>
          <p className="text-sm sm:text-base text-[#4A5B53] leading-relaxed">
            ‘সাতক্ষীরা ঘর’ সুন্দরবনের কোল ঘেঁষে গড়ে ওঠা একটি বিশ্বস্ত অর্গানিক কৃষি ও খাদ্য প্ল্যাটফর্ম। যেখানে ভেজালমুক্ত বিশুদ্ধতাই আমাদের একমাত্র পরিচয়।
          </p>
        </div>

        {/* Story Section with Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=800"
                alt="Sundarbans Mouyal Honey Harvesting"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-[#1B4D3E] text-white p-6 rounded-3xl shadow-xl max-w-xs hidden sm:block border-2 border-[#E5A93C]">
              <span className="text-2xl font-black text-[#E5A93C]">২০০+</span>
              <p className="text-xs text-[#FAF0D4] mt-1 font-medium">
                সুন্দরবনের স্থানীয় মৌয়াল ও সাতক্ষীরার দেশি গাভী খামারি আমাদের সাথে যুক্ত।
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-widest">
              আমাদের সূচনা
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E]">
              কেন গড়ে তুললাম ‘সাতক্ষীরা ঘর’?
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed">
              আজকের দিনে বাজারে ভেজালহীন খাঁটি খাবার খুঁজে পাওয়া এক বড় চ্যালেঞ্জ। সুন্দরবনের প্রাকৃতিক খাঁটি মধু কিংবা মা-দাদিদের আমলের বিলোনা পদ্ধতিতে তৈরি গাওয়া ঘির যে অপার্থিব সুবাস ও পুষ্টিগুণ, তা শহুরে জীবনে প্রায় হারিয়ে যেতে বসেছিল।
            </p>
            <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed">
              সাতক্ষীরার সন্তান হিসেবে আমরা সিদ্ধান্ত নিই—উপকূলবর্তী শ্যামনগর, আশাশুনি ও কলারোয়ার ঐতিহ্যবাহী বিশুদ্ধ খাদ্যপণ্য সরাসরি কোনো মধ্যস্বত্বভোগী ছাড়া ভোক্তার দোরগোড়ায় পৌঁছে দেব। এভাবে একদিকে যেমন ভোক্তা পাচ্ছেন শতভাগ খাঁটি পণ্য, অন্যদিকে সুন্দরবনের মৌয়াল ও খামারিরা পাচ্ছেন তাদের ঘামের ন্যায্য পারিশ্রমিক।
            </p>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#1B4D3E]" />
                <span className="text-xs font-bold text-[#1B4D3E]">জিরো ভেজাল নীতি</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#1B4D3E]" />
                <span className="text-xs font-bold text-[#1B4D3E]">কাচের জারে নিরাপদ সংরক্ষণ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#1B4D3E]" />
                <span className="text-xs font-bold text-[#1B4D3E]">কোল্ড-প্রেসড তেল নিষ্কাশন</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#1B4D3E]" />
                <span className="text-xs font-bold text-[#1B4D3E]">শতভাগ মানিব্যাক গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars of Purity */}
        <div className="bg-[#FAF8F4] p-8 sm:p-14 rounded-3xl border border-[#EFE9DC] space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-widest">
              আমাদের মূল স্তম্ভ
            </span>
            <h3 className="text-2xl font-black text-[#1B4D3E] mt-1">
              যে ৪টি মূলনীতির ওপর দাঁড়িয়ে সাতক্ষীরা ঘর
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EFE9DC] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7F4] text-[#1B4D3E] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1B4D3E]">১. খাঁটি হওয়ার নিশ্চয়তা</h4>
              <p className="text-xs text-[#4A5B53] mt-2 leading-relaxed">
                কোনো চিনি বা সিরাপ মেশানো হয় না। সম্পূর্ণ কাঁচা ও অপরিশোধিত অবস্থায় বোতলজাত করা হয়।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EFE9DC] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#FAF0D4] text-[#E5A93C] flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1B4D3E]">২. কৃষকের ন্যায্যমূল্য</h4>
              <p className="text-xs text-[#4A5B53] mt-2 leading-relaxed">
                উপকূলীয় প্রান্তিক মৌয়াল ও খামারিদের জীবনমান উন্নয়নে আমরা ন্যায্যমূল্য নিশ্চিত করি।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EFE9DC] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#F6E7DE] text-[#C86D3B] flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1B4D3E]">৩. ঐতিহ্যবাহী পদ্ধতি</h4>
              <p className="text-xs text-[#4A5B53] mt-2 leading-relaxed">
                বিলোনা দই মন্থন করে ঘি এবং কাঠের ঘানিতে ধীর গতিতে সরিষার তেল তৈরির খাঁটি ঐতিহ্য।
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EFE9DC] shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#EDE7DA] text-[#153D31] flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-[#1B4D3E]">৪. প্রিমিয়াম সেবা</h4>
              <p className="text-xs text-[#4A5B53] mt-2 leading-relaxed">
                প্যাকেজিং থেকে শুরু করে ডেলিভারি—গ্রাহকের পূর্ণ সন্তুষ্টিই আমাদের চূড়ান্ত লক্ষ্য।
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Location Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE9DC] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="p-3 bg-[#FAF8F4] text-[#1B4D3E] rounded-2xl border border-[#EFE9DC]">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#1B4D3E]">প্রধান কার্যালয় ও সংগ্রহ কেন্দ্র</h4>
            <p className="text-xs text-[#4A5B53]">
              সুন্দরবন ইকো পার্ক রোড, শ্যামনগর, সাতক্ষীরা-৯৪৫৮
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="p-3 bg-[#FAF0D4] text-[#E5A93C] rounded-2xl border border-[#F5DE9F]">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#1B4D3E]">সরাসরি হেল্পলাইন ও হোয়াটসঅ্যাপ</h4>
            <p className="text-xs text-[#4A5B53]">
              +৮৮০ ১৭১২-৩৪৫৬৭৮ (সকাল ৯টা - রাত ১০টা)
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="p-3 bg-[#F6E7DE] text-[#C86D3B] rounded-2xl border border-[#EDCDBD]">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[#1B4D3E]">ইমেইল ও কর্পোরেট অর্ডার</h4>
            <p className="text-xs text-[#4A5B53]">
              satkhiraghor@gmail.com
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] font-bold rounded-2xl shadow-lg transition-all"
          >
            <span>আমাদের অর্গানিক পণ্যগুলো দেখুন</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
