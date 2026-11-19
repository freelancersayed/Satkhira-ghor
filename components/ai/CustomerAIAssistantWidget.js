'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, MessageSquare, ChevronRight, Bot } from 'lucide-react';
import CustomerAIChatWindow from './CustomerAIChatWindow';

export default function CustomerAIAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [bubbleChipQuery, setBubbleChipQuery] = useState(null);

  useEffect(() => {
    setMounted(true);

    // Contextual greeting based on current page
    let bubbleTimer;
    if (pathname && pathname.startsWith('/products/')) {
      setSpeechBubbleText('এই খাঁটি পণ্যটির স্বাস্থ্য উপকারিতা ও খাঁটি নিশ্চিতকরণ জানতে চান? ট্যাপ করুন ✨');
      setBubbleChipQuery('এই পণ্যটির উপকারিতা ও খাওয়ার নিয়ম কী?');
    } else if (pathname === '/cart' || pathname === '/checkout') {
      setSpeechBubbleText('অর্ডারে কোনো সমস্যা বা ফ্রি ডেলিভারি অফার জানতে চান? 🚚');
      setBubbleChipQuery('ফ্রি ডেলিভারি পেতে কত টাকার পণ্য লাগবে?');
    } else {
      setSpeechBubbleText('সালামু আলাইকুম! খাঁটি মধু বা গাওয়া ঘি নির্বাচনে এআই পরামর্শ প্রয়োজন? 🌿');
      setBubbleChipQuery('ডায়াবেটিস ও সর্দি-কাশির জন্য সেরা মধু কোনটি?');
    }

    bubbleTimer = setTimeout(() => {
      setShowSpeechBubble(true);
    }, 2500);

    return () => clearTimeout(bubbleTimer);
  }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Floating Trigger Badge & Contextual Speech Bubble */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
        {/* Floating Contextual Speech Bubble */}
        {showSpeechBubble && !isChatOpen && (
          <div className="pointer-events-auto mb-2.5 max-w-[260px] sm:max-w-[290px] bg-white p-3 rounded-2xl shadow-xl border border-emerald-500/30 text-xs text-slate-800 animate-slideUp relative">
            <button
              onClick={() => setShowSpeechBubble(false)}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="বন্ধ করুন"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">✨</span>
              <p className="font-semibold text-[11px] leading-snug">
                {speechBubbleText}
              </p>
            </div>

            {bubbleChipQuery && (
              <button
                onClick={() => {
                  setShowSpeechBubble(false);
                  setIsChatOpen(true);
                }}
                className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/70 hover:from-emerald-100 hover:to-emerald-200 text-[#016831] font-bold text-[10px] flex items-center justify-between transition-all cursor-pointer border border-emerald-200/80"
              >
                <span className="truncate">{bubbleChipQuery}</span>
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
              </button>
            )}

            {/* Bubble Tail pointing down to trigger button */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-emerald-500/30 transform rotate-45" />
          </div>
        )}

        {/* Floating Action Button */}
        <button
          type="button"
          onClick={() => {
            setShowSpeechBubble(false);
            setIsChatOpen((prev) => !prev);
          }}
          className="pointer-events-auto relative group flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#014D24] via-[#016831] to-[#014D24] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-emerald-400/40"
          title="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট"
          aria-label="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট খুলুন"
        >
          {/* Glowing Aura Ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />

          {/* AI Icon with Pulse */}
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#F59E0B] animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#016831]" />
          </div>

          <div className="hidden sm:flex flex-col items-start text-left pr-1">
            <span className="text-xs font-black tracking-wide flex items-center gap-1">
              <span>এআই অ্যাসিস্ট্যান্ট</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAB116] animate-pulse" />
            </span>
            <span className="text-[9px] text-emerald-200/90 font-medium">
              লাইভ শপিং গাইড
            </span>
          </div>
        </button>
      </div>

      {/* Interactive AI Chat Window */}
      <CustomerAIChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        pathname={pathname}
        initialQuery={bubbleChipQuery}
      />
    </>
  );
}
