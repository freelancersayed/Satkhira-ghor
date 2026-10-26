import Link from 'next/link';
import { ShieldCheck, Truck, Sparkles, MapPin, Phone, Mail, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A2B20] text-[#FDFBF7] pt-16 pb-10 border-t border-[#0F3D2E]">
      {/* Organic Value Proposition Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#0F3D2E]/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#0F3D2E] text-[#F59E0B] rounded-2xl shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">১০০% প্রাকৃতিক ও খাঁটি</h4>
              <p className="text-xs text-[#FDFBF7]/70 mt-1">
                কোনো কেমিক্যাল, প্রিজারভেটিভ বা ভেজাল নেই। ল্যাব টেস্টে পরীক্ষিত।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#0F3D2E] text-[#F59E0B] rounded-2xl shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">সরাসরি সুন্দরবনের উৎস</h4>
              <p className="text-xs text-[#FDFBF7]/70 mt-1">
                শ্যামনগর ও সাতক্ষীরার বিশ্বস্ত মৌয়াল ও খামারিদের থেকে সরাসরি সংগৃহীত।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#0F3D2E] text-[#F59E0B] rounded-2xl shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">ক্যাশ অন ডেলিভারি</h4>
              <p className="text-xs text-[#FDFBF7]/70 mt-1">
                পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা। ঢাকা ও সারাদেশে দ্রুত ডেলিভারি।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-[#0F3D2E] text-[#F59E0B] rounded-2xl shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">রিটার্ন ও মান নিশ্চয়তা</h4>
              <p className="text-xs text-[#FDFBF7]/70 mt-1">
                পণ্য অপছন্দ হলে কিংবা মানের সামান্য ত্রুটি পেলে শতভাগ মানিব্যাক গ্যারান্টি।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B] flex items-center justify-center text-[#111827] font-bold text-xl shadow-md">
                স
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                সাতক্ষীরা ঘর
              </span>
            </div>
            <p className="text-xs text-[#FDFBF7]/80 leading-relaxed max-w-sm">
              ‘সাতক্ষীরা ঘর’ সুন্দরবন উপকূলের সমৃদ্ধ প্রকৃতি, খাঁটি মৌচাকের মধু, দেশি গাওয়া ঘি এবং সাতক্ষীরার ঐতিহ্যবাহী মিষ্টান্ন ও অর্গানিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান। আমাদের লক্ষ্য প্রতিটি ঘরে পৌঁছে দেওয়া রাসায়নিকমুক্ত খাঁটি খাবার।
            </p>
            <div className="pt-2 text-xs text-[#F59E0B] font-semibold">
              🌿 প্রকৃতি থেকে সোজা আপনার ঘরে
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="font-bold text-[#F59E0B] text-sm uppercase tracking-wider">
              প্রয়োজনীয় লিংক
            </h5>
            <ul className="space-y-2 text-xs text-[#FDFBF7]/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">হোম পেজ</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">সকল পণ্য তালিকা</Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">আমাদের গল্প ও মিশন</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">শপিং ব্যাগ</Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="space-y-3">
            <h5 className="font-bold text-[#F59E0B] text-sm uppercase tracking-wider">
              জনপ্রিয় ক্যাটাগরি
            </h5>
            <ul className="space-y-2 text-xs text-[#FDFBF7]/80">
              <li>
                <Link href="/shop?cat=honey" className="hover:text-white transition-colors">সুন্দরবনের খাঁটি মধু</Link>
              </li>
              <li>
                <Link href="/shop?cat=ghee" className="hover:text-white transition-colors">বিলোনা খাঁটি গাওয়া ঘি</Link>
              </li>
              <li>
                <Link href="/shop?cat=oil" className="hover:text-white transition-colors">ঘানি ভাঙা সরিষার তেল</Link>
              </li>
              <li>
                <Link href="/shop?cat=sweets" className="hover:text-white transition-colors">সাতক্ষীরার ক্ষীর সন্দেশ</Link>
              </li>
              <li>
                <Link href="/shop?cat=pickles" className="hover:text-white transition-colors">ঘরোয়া কুল ও আমের আচার</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h5 className="font-bold text-[#F59E0B] text-sm uppercase tracking-wider">
              যোগাযোগ
            </h5>
            <ul className="space-y-2.5 text-xs text-[#FDFBF7]/80">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <span>শ্যামনগর রোড, সাতক্ষীরা সদর, খুলনা বিভাগ, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <span>+৮৮০ ১৭১২-৩৪৫৬৭৮</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                <span>support@satkhiraghor.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-[#0F3D2E] text-center text-xs text-[#FDFBF7]/60">
        <p>© {new Date().getFullYear()} সাতক্ষীরা ঘর (Satkhira Ghor). সর্বস্বত্ব সংরক্ষিত। Organic & Pure Agro Platform.</p>
      </div>
    </footer>
  );
}
