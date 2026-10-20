import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'ফারহান আহমেদ',
      location: 'উত্তরা, ঢাকা',
      comment:
        'সুন্দরবনের খাঁটি খলসী ফুলের মধুর গন্ধ আর ঘনত্ব অসাধারণ। বাজারের বোতলজাত মধুর সাথে আকাশ পাতাল পার্থক্য। আমার বাচ্চার ঠান্ডা কাশির জন্য সবসময় রাখি।',
      rating: 5,
      product: 'সুন্দরবনের খলসী মধু',
    },
    {
      name: 'ড. নিশাত সুলতানা',
      location: 'ধানমন্ডি, ঢাকা',
      comment:
        'বিলোনা পদ্ধতির গাওয়া ঘিটা গরম ভাতের সাথে খেলে পুরা গ্রাম্য স্বাদ মনে করিয়ে দেয়। সত্যি খাঁটি জিনিস। প্যাকেজিংও খুব চমৎকার কাচের জারে পেয়েছি।',
      rating: 5,
      product: 'বিলোনা খাঁটি গাওয়া ঘি',
    },
    {
      name: 'মো: রফিকুল ইসলাম',
      location: 'জিইসি, চট্টগ্রাম',
      comment:
        'সাতক্ষীরার ক্ষীর সন্দেশ ও ঘানি ভাঙা সরিষার তেল অর্ডার করেছিলাম। ২ দিনের মধ্যে চট্টগ্রামে অক্ষত পেয়েছি। স্বাদ এবং বিশুদ্ধতা সত্যিই প্রশংসনীয়।',
      rating: 5,
      product: 'সাতক্ষীরার ক্ষীর সন্দেশ',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-[#C86D3B] uppercase tracking-widest">
            গ্রাহক পর্যালোচনা
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E] mt-1">
            গ্রাহকদের ভালোবাসায় ‘সাতক্ষীরা ঘর’
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5B53] mt-2">
            হাজারো পরিবারের বিশ্বাস ও আস্থার গল্প
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white p-7 rounded-3xl border border-[#EFE9DC] shadow-sm hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-[#E5A93C]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#FAF0D4]" />
                </div>
                <p className="text-xs sm:text-sm text-[#14241E] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE9DC]/70 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1B4D3E]">{rev.name}</h4>
                  <p className="text-[11px] text-[#4A5B53]">{rev.location}</p>
                </div>
                <span className="text-[10px] bg-[#F0F7F4] text-[#1B4D3E] font-semibold px-2 py-0.5 rounded-full">
                  {rev.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
