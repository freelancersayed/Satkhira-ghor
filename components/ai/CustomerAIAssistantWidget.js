'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, MessageSquare, ChevronRight, Bot, ArrowRight, ShoppingBag } from 'lucide-react';
import CustomerAIChatWindow from './CustomerAIChatWindow';

export default function CustomerAIAssistantWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState('');
  const [speechBubbleTitle, setSpeechBubbleTitle] = useState('');
  const [bubbleChipQuery, setBubbleChipQuery] = useState(null);
  const [bubbleQuickChips, setBubbleQuickChips] = useState([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If on admin routes, do not run anything
    if (pathname && pathname.startsWith('/admin')) {
      return;
    }

    // Check first-time visitor status via localStorage
    let isFirstTime = false;
    try {
      if (typeof window !== 'undefined') {
        const hasVisited = localStorage.getItem('satkhiraghor_ai_welcomed');
        if (!hasVisited) {
          isFirstTime = true;
          setIsFirstVisit(true);
        }
      }
    } catch (e) {}

    let bubbleTimer;

    if (isFirstTime) {
      // ── FIRST-TIME PROACTIVE WELCOME GREETING ──
      setSpeechBubbleTitle('সালামু আলাইকুম! স্বাগতম 🌿');
      setSpeechBubbleText(
        'সাতক্ষীরা ঘরে আপনাকে স্বাগতম! আমি আপনার ডিজিটাল এআই শপিং গাইড। সুন্দরবনের খাঁটি খাবার নির্বাচনে আমি সাহায্য করতে পারি।'
      );
      setBubbleQuickChips([
        '🍯 সেরা মধু কোনটি?',
        '🧈 গাওয়া ঘি এর দাম',
        '🚚 ফ্রি ডেলিভারি অফার',
      ]);
      setBubbleChipQuery('সুন্দরবনের খাঁটি খাবার সম্পর্কে জানতে চাই');

      // Proactively greet first-time user after 1.4 seconds
      bubbleTimer = setTimeout(() => {
        setShowSpeechBubble(true);
        try {
          localStorage.setItem('satkhiraghor_ai_welcomed', 'true');
        } catch (e) {}
      }, 1400);
    } else {
      // ── ROUTE-SPECIFIC ASSISTANCE (Returning Visitors) ──
      if (pathname && pathname.startsWith('/products/')) {
        setSpeechBubbleTitle('খাঁটি পণ্যের গাইড ✨');
        setSpeechBubbleText('এই পণ্যটির স্বাস্থ্য উপকারিতা ও আসল কাঁচা মধু নিশ্চিতকরণ জানতে চান?');
        setBubbleChipQuery('এই পণ্যটির উপকারিতা ও খাওয়ার নিয়ম কী?');
        setBubbleQuickChips(['উপকারিতা জানুন', 'স্টকে কয়টি আছে?']);
      } else if (pathname === '/cart' || pathname === '/checkout') {
        setSpeechBubbleTitle('অর্ডার অ্যাসিস্ট্যান্ট 🚚');
        setSpeechBubbleText('ফ্রি ডেলিভারি পেতে কত টাকার পণ্য লাগবে বা অর্ডারে সাহায্য লাগবে?');
        setBubbleChipQuery('ফ্রি ডেলিভারি পেতে কত টাকার পণ্য লাগবে?');
        setBubbleQuickChips(['ফ্রি ডেলিভারি তথ্য', 'বিকাশ পেমেন্ট নিয়ম']);
      } else {
        setSpeechBubbleTitle('এআই শপিং সহকারী 🌿');
        setSpeechBubbleText('খাঁটি মধু বা গাওয়া ঘি নির্বাচনে এআই পরামর্শ প্রয়োজন? যেকোনো প্রশ্ন করুন!');
        setBubbleChipQuery('ডায়াবেটিস ও সর্দি-কাশির জন্য সেরা মধু কোনটি?');
        setBubbleQuickChips(['🍯 সেরা মধু', '🧈 গাওয়া ঘি']);
      }

      bubbleTimer = setTimeout(() => {
        setShowSpeechBubble(true);
      }, 3000);
    }

    return () => clearTimeout(bubbleTimer);
  }, [pathname]);

  // NEVER render on admin pages
  if (!mounted) return null;
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleOpenChatWithQuery = (query) => {
    setShowSpeechBubble(false);
    setBubbleChipQuery(query);
    setIsChatOpen(true);
  };

  return (
    <>
      {/* Floating Trigger Badge & Contextual Speech Bubble */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
        {/* Floating Contextual / First-Time Speech Bubble */}
        {showSpeechBubble && !isChatOpen && (
          <div className="pointer-events-auto mb-2.5 max-w-[270px] sm:max-w-[310px] bg-white p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-500/30 text-xs text-slate-800 animate-slideUp relative">
            {/* Close Bubble Button */}
            <button
              onClick={() => setShowSpeechBubble(false)}
              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              title="বন্ধ করুন"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Bubble Header */}
            {speechBubbleTitle && (
              <div className="flex items-center gap-1.5 font-bold text-[#016831] text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{speechBubbleTitle}</span>
              </div>
            )}

            <p className="font-medium text-[11px] leading-relaxed text-slate-700">
              {speechBubbleText}
            </p>

            {/* Quick Action Chips inside the bubble */}
            {bubbleQuickChips && bubbleQuickChips.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {bubbleQuickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOpenChatWithQuery(chip)}
                    className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#016831] border border-emerald-200/80 text-[10px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* View/Open Button */}
            <button
              type="button"
              onClick={() => handleOpenChatWithQuery(bubbleChipQuery)}
              className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#014D24] to-[#016831] hover:from-emerald-900 hover:to-[#014D24] text-white font-bold text-[10px] flex items-center justify-between transition-all cursor-pointer shadow-xs"
            >
              <span>এআই শপিং গাইড শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FAB116]" />
            </button>

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
          className="pointer-events-auto relative group flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-[#014D24] via-[#016831] to-[#014D24] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-emerald-400/40"
          title="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট"
          aria-label="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট খুলুন"
        >
          {/* Glowing Aura Ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-60" />

          {/* AI Icon with Pulse */}
          <div className="relative">
            <Sparkles className="w-5 h-5 text-[#F59E0B] animate-pulse" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#016831]" />
          </div>

          <div className="hidden sm:flex flex-col items-start text-left pr-1">
            <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>এআই অ্যাসিস্ট্যান্ট</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FAB116] animate-pulse" />
            </span>
            <span className="text-[9px] text-emerald-200/90 font-medium">
              লাইভ শপিং কনসালট্যান্ট
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
