import { ShieldCheck, HeartHandshake, Leaf, Truck } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      icon: <Leaf className="w-6 h-6 text-[#016831]" />,
      title: '১০০% প্রাকৃতিক ও খাঁটি',
      description: 'কোনো প্রকার চিনি, ডালডা, রঙ বা ক্ষতিকর রাসায়নিক প্রিজারভেটিভ ব্যতীত সরাসরি প্রকৃতি থেকে প্রাপ্ত।',
      bgColor: 'bg-[#F0FDF4]',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#D97706]" />,
      title: 'সরাসরি শ্যামনগর ও সাতক্ষীরা থেকে সংগ্রহ',
      description: 'সুন্দরবনের অভিজ্ঞ মৌয়াল এবং সাতক্ষীরার শ্যামনগরের প্রান্তিক খামারিদের থেকে সরাসরি ন্যায্যমূল্যে সংগৃহীত।',
      bgColor: 'bg-[#FEF3C7]',
    },
    {
      icon: <Truck className="w-6 h-6 text-[#016831]" />,
      title: 'পণ্য হাতে পেয়ে টাকা পরিশোধ (Cash on Delivery)',
      description: 'সারাদেশে হোম ডেলিভারি সুবিধা। পার্সেল হাতে পেয়ে গুণগত মান দেখে নিশ্চিন্তে মূল্য পরিশোধের সুযোগ।',
      bgColor: 'bg-[#EBF5F0]',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C25E2E]" />,
      title: 'মান নিয়ে সমস্যা থাকলে সহজ রিটার্ন',
      description: 'পণ্যের বিশুদ্ধতা বা মান নিয়ে বিন্দুমাত্র অসন্তুষ্টি থাকলে সহজ রিটার্ন ও দ্রুত পরিবর্তনের নিশ্চয়তা।',
      bgColor: 'bg-[#FDF4EF]',
    },
  ];

  return (
    <section className="py-10 sm:py-20 bg-[#FDFBF7] border-y border-[#E8E2D5]">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest">
            কেন সাতক্ষীরা ঘর
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#016831] mt-1">
            ভেজালমুক্ত খাঁটি খাবারের বিশ্বস্ত ঠিকানা
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-2">
            আমাদের লক্ষ্য প্রতিটি পরিবারের কাছে সাতক্ষীরার আসল ঐতিহ্যবাহী খাঁটি খাদ্য পৌঁছে দেওয়া
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${pt.bgColor}`}
              >
                {pt.icon}
              </div>
              <h3 className="text-base font-bold text-[#016831] mb-2">{pt.title}</h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                {pt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
