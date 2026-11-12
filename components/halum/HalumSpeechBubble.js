'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const PROACTIVE_TIPS = [
  'হালুম! আমি সুন্দরবনের হালুম ভাই 🐯 খাঁটি মধু আর গাওয়া ঘি চেখে দেখবেন নাকি?',
  'আজকে কিন্তু ধামাকা কম্বো অফারে ২০০ টাকা ছাড় চলছে! 🎁',
  '১৫০০ টাকার অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি! 🚚',
  'সুন্দরবনের তাজা খলসী কাঁচা মধু চান? আমাকে বলুন! 🍯',
  'কোন খাবারটি খাঁটি কীভাবে চিনবেন? আমি বুঝিয়ে বলছি! ✨',
];

export default function HalumSpeechBubble({ onOpenChat, isOpen = false }) {
  const [visible, setVisible] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  // Proactive periodic tip rotation every 7 seconds
  useEffect(() => {
    if (isOpen) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % PROACTIVE_TIPS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-2.5 max-w-[210px] sm:max-w-[250px] animate-slideUp select-none">
      <div
        onClick={onOpenChat}
        className="bg-white/95 backdrop-blur-md text-stone-900 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-amber-300/80 hover:border-[#016831] cursor-pointer transition-all hover:scale-[1.02] relative group"
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center shadow-xs border border-stone-200 transition-colors"
          title="বন্ধ করুন"
          aria-label="বার্তা বন্ধ করুন"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Bubble Message */}
        <div className="flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FAB116] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs font-bold leading-snug text-stone-800">
            {PROACTIVE_TIPS[tipIndex]}
          </p>
        </div>

        {/* Action callout */}
        <div className="mt-1.5 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[9px] font-black text-[#016831]">
          <span>কথা বলতে ট্যাপ করুন</span>
          <span>চ্যাট খুলুন &rarr;</span>
        </div>

        {/* Speech Bubble Arrow Tail pointing down */}
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
      </div>
    </div>
  );
}
