import { ShieldCheck, HeartHandshake, Leaf, Truck } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      icon: <Leaf className="w-6 h-6 text-[#0F3D2E]" />,
      title: '১০০% প্রাকৃতিক ও খাঁটি',
      description: 'কোনো প্রকার চিনি, ডালডা, রঙ বা ক্ষতিকর রাসায়নিক প্রিজারভেটিভ ব্যতীত সরাসরি প্রকৃতি থেকে প্রাপ্ত।',
      bgColor: 'bg-[#F0FDF4]',
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#D97706]" />,
      title: 'সরাসরি মৌয়াল ও খামারি',
      description: 'সুন্দরবনের অভিজ্ঞ মৌয়াল এবং সাতক্ষীরার প্রান্তিক গাভী খামারিদের থেকে সরাসরি ন্যায্যমূল্যে সংগৃহীত।',
      bgColor: 'bg-[#FEF3C7]',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#C25E2E]" />,
      title: 'ল্যাব টেস্ট ও মান নিশ্চয়তা',
      description: 'প্রতিটি ব্যাচ বিএসটিআই ও ফুড ল্যাব গ্রেড মানদণ্ডে পরীক্ষিত। কোয়ালিটিতে আমরা কখনো আপস করি না।',
      bgColor: 'bg-[#FDF4EF]',
    },
    {
      icon: <Truck className="w-6 h-6 text-[#0F3D2E]" />,
      title: 'নিরাপদ প্যাকেজিং ও ডেলিভারি',
      description: 'ফুড-গ্রেড কাচের জার ও বিশেষ বাবল র‌্যাপিংয়ে পণ্য পৌঁছে যায় অক্ষত ও ফ্রেশ অবস্থায়।',
      bgColor: 'bg-[#EBF5F0]',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FDFBF7] border-y border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-widest">
            কেন সাতক্ষীরা ঘর
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E] mt-1">
            ভেজালমুক্ত খাঁটি খাবারের বিশ্বস্ত নাম
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-2">
            আমাদের লক্ষ্য আপনার ও আপনার পরিবারের সুস্বাস্থ্য নিশ্চিত করা
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-[#E8E2D5] shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${pt.bgColor}`}
              >
                {pt.icon}
              </div>
              <h3 className="text-base font-bold text-[#0F3D2E] mb-2">{pt.title}</h3>
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
