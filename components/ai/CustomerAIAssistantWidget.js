'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, ArrowRight, MessageCircle } from 'lucide-react';
import CustomerAIChatWindow from './CustomerAIChatWindow';
import AgentAvatar from './AgentAvatar';

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

  const autoDismissTimerRef = useRef(null);
  const scrollStartYRef = useRef(0);

  useEffect(() => {
    setMounted(true);

    // If on admin or sensitive checkout pages, do not trigger speech bubbles
    if (
      pathname &&
      (pathname.startsWith('/admin') ||
        pathname === '/checkout' ||
        pathname === '/order-success')
    ) {
      setShowSpeechBubble(false);
      return;
    }

    // Check if user has already dismissed proactive bubble in this browsing session
    let isSessionDismissed = false;
    try {
      if (typeof window !== 'undefined') {
        isSessionDismissed =
          sessionStorage.getItem('satkhiraghor_ai_bubble_dismissed') === 'true';
      }
    } catch (e) {}

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
        'সাতক্ষীরা ঘরে আপনাকে স্বাগতম! আমি আপনার ডিজিটাল এআই শপিং গাইড। খাঁটি খাবার নির্বাচনে সাহায্য করতে পারি।'
      );
      setBubbleQuickChips([
        '🍯 সেরা মধু কোনটি?',
        '🧈 গাওয়া ঘি এর দাম',
        '🚚 ফ্রি ডেলিভারি তথ্য',
      ]);
      setBubbleChipQuery('সুন্দরবনের খাঁটি খাবার সম্পর্কে জানতে চাই');

      // Proactively greet first-time user after 1.2 seconds if not dismissed
      if (!isSessionDismissed) {
        bubbleTimer = setTimeout(() => {
          setShowSpeechBubble(true);
          try {
            localStorage.setItem('satkhiraghor_ai_welcomed', 'true');
          } catch (e) {}
        }, 1200);
      }
    } else if (!isSessionDismissed) {
      // ── ROUTE-SPECIFIC ASSISTANCE (Returning Visitors) ──
      if (pathname && pathname.startsWith('/products/')) {
        setSpeechBubbleTitle('খাঁটি পণ্যের গাইড ✨');
        setSpeechBubbleText('এই পণ্যটির স্বাস্থ্য উপকারিতা ও আসল কাঁচা মধু নিশ্চিতকরণ জানতে চান?');
        setBubbleChipQuery('এই পণ্যটির উপকারিতা ও খাওয়ার নিয়ম কী?');
        setBubbleQuickChips(['উপকারিতা জানুন', 'স্টকে কয়টি আছে?']);
      } else if (pathname === '/cart') {
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

      // Slightly delay for returning visitors so page renders smoothly
      bubbleTimer = setTimeout(() => {
        setShowSpeechBubble(true);
      }, 2800);
    }

    return () => {
      if (bubbleTimer) clearTimeout(bubbleTimer);
    };
  }, [pathname]);

  // ── SCROLL-TO-HIDE (স্ক্রল করলেই বাবল স্বয়ংক্রিয়ভাবে লুকিয়ে ফেলা) ──
  useEffect(() => {
    if (!showSpeechBubble) return;

    scrollStartYRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // If user scrolls up or down by more than 20px, hide bubble immediately
      if (Math.abs(currentScrollY - scrollStartYRef.current) > 20) {
        setShowSpeechBubble(false);
        try {
          sessionStorage.setItem('satkhiraghor_ai_bubble_dismissed', 'true');
        } catch (e) {}
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showSpeechBubble]);

  // ── AUTO-DISMISS TIMER (মোবাইলে ৪.২ সেকেন্ড, ডেস্কটপে ৬.৫ সেকেন্ড পর ফেড আউট) ──
  useEffect(() => {
    if (!showSpeechBubble) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const dismissDuration = isMobile ? 4200 : 6500;

    autoDismissTimerRef.current = setTimeout(() => {
      setShowSpeechBubble(false);
      try {
        sessionStorage.setItem('satkhiraghor_ai_bubble_dismissed', 'true');
      } catch (e) {}
    }, dismissDuration);

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [showSpeechBubble]);

  // Desktop Hover Handlers to pause auto-dismiss if user is reading
  const handleBubbleMouseEnter = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
    }
  };

  const handleBubbleMouseLeave = () => {
    autoDismissTimerRef.current = setTimeout(() => {
      setShowSpeechBubble(false);
    }, 2000);
  };

  // Explicit close handler
  const handleDismissBubble = (e) => {
    e?.stopPropagation();
    setShowSpeechBubble(false);
    try {
      sessionStorage.setItem('satkhiraghor_ai_bubble_dismissed', 'true');
    } catch (e) {}
  };

  // Open chat with predefined prompt
  const handleOpenChatWithQuery = (query) => {
    handleDismissBubble();
    setBubbleChipQuery(query);
    setIsChatOpen(true);
  };

  // NEVER render on admin pages or before mount
  if (!mounted) return null;
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* 
        ═══════════════════════════════════════════════════════════════════════
        Floating Trigger Badge & Contextual Speech Bubble
        Position:
        - Mobile: bottom-[68px] right-3 (Cleanly sits right above MobileBottomNav, hugging corner)
        - Desktop: bottom-6 right-6
        ═══════════════════════════════════════════════════════════════════════
      */}
      <div className="fixed bottom-[68px] sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
        {/* Floating Contextual / First-Time Speech Bubble with Smooth Fade/Slide */}
        {showSpeechBubble && !isChatOpen && (
          <div
            onMouseEnter={handleBubbleMouseEnter}
            onMouseLeave={handleBubbleMouseLeave}
            className="pointer-events-auto mb-2 max-w-[280px] sm:max-w-[310px] w-auto bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-emerald-500/30 text-xs text-slate-800 transition-all duration-300 ease-out transform animate-slideUp relative"
          >
            {/* Close Bubble Button */}
            <button
              type="button"
              onClick={handleDismissBubble}
              className="absolute -top-2 -right-2 sm:-left-2 sm:right-auto w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shadow-md border border-slate-200 z-10"
              title="পপআপ বন্ধ করুন"
              aria-label="পপআপ বন্ধ করুন"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Bubble Header */}
            {speechBubbleTitle && (
              <div className="flex items-center gap-1.5 font-bold text-[#016831] text-[11px] mb-1 pr-4 sm:pr-0">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>{speechBubbleTitle}</span>
              </div>
            )}

            <p className="font-medium text-[11px] leading-relaxed text-slate-700">
              {speechBubbleText}
            </p>

            {/* Quick Action Chips inside the bubble */}
            {bubbleQuickChips && bubbleQuickChips.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {bubbleQuickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOpenChatWithQuery(chip)}
                    className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#016831] border border-emerald-200/80 text-[10px] font-bold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
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
              className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#014D24] to-[#016831] hover:from-emerald-900 hover:to-[#014D24] text-white font-bold text-[10px] flex items-center justify-between transition-all cursor-pointer shadow-xs active:scale-98"
            >
              <span>এআই শপিং গাইড শুরু করুন</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FAB116]" />
            </button>

            {/* Bubble Tail pointing down to agent avatar */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white/95 border-r border-b border-emerald-500/30 transform rotate-45" />
          </div>
        )}

        {/* 
          ═════════════════════════════════════════════════════════════════════
          AI AGENT CAPSULE TRIGGER (স্পষ্ট এজেন্ট আকৃতি ও ফ্রেন্ডলি মাইক্রো-টেক্সট)
          - Headset Agent Avatar + Glowing Online Indicator
          - Mobile: "কোন হেল্প লাগলে বলো 👋" (কমপ্যাক্ট, মাত্র ৪২px হাইট, নো অবস্ট্রাকশন)
          - Desktop: "কীভাবে সহযোগিতা করতে পারি? 🌿" (প্রিমিয়াম কনসালট্যান্ট লুক)
          ═════════════════════════════════════════════════════════════════════
        */}
        {!isChatOpen && (
          <button
            type="button"
            onClick={() => {
              handleDismissBubble();
              setIsChatOpen(true);
            }}
            className="pointer-events-auto relative group flex items-center gap-2 pl-2 pr-3 sm:pl-2.5 sm:pr-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#014D24] via-[#016831] to-[#014D24] text-white shadow-xl hover:shadow-2xl active:scale-95 sm:hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-[#FAB116]/80 hover:border-[#FAB116] ring-2 ring-emerald-500/20"
            title="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট - হেল্প নিন"
            aria-label="সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট খুলুন"
          >
            {/* Subtle Aura Pulse */}
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-30" />

            {/* Agent Avatar with Headset & Glowing Online Indicator */}
            <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-800 to-[#014D24] border border-amber-300/40 flex items-center justify-center shadow-inner">
              <AgentAvatar className="w-6 h-6 sm:w-6.5 sm:h-6.5" glow={true} />
            </div>

            {/* ── Mobile Microcopy: "কোন হেল্প লাগলে বলো 👋" ── */}
            <div className="flex sm:hidden flex-col items-start text-left leading-none">
              <span className="text-[11px] font-black tracking-tight text-white flex items-center gap-1">
                <span>কোন হেল্প লাগলে বলো</span>
                <span className="text-xs">👋</span>
              </span>
              <span className="text-[8.5px] text-[#FAB116] font-bold mt-0.5 flex items-center gap-1">
                <span>এআই এজেন্ট</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-200/90 font-medium">অনলাইন</span>
              </span>
            </div>

            {/* ── Desktop Microcopy: "কীভাবে সহযোগিতা করতে পারি? 🌿" ── */}
            <div className="hidden sm:flex flex-col items-start text-left leading-none">
              <span className="text-xs font-black tracking-wide text-white flex items-center gap-1.5 drop-shadow-xs">
                <span>কীভাবে সহযোগিতা করতে পারি?</span>
                <span className="text-xs">🌿</span>
              </span>
              <span className="text-[9.5px] text-[#FAB116] font-bold mt-0.5 flex items-center gap-1.5">
                <span>সাতক্ষীরা ঘর এআই শপিং গাইড</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-200/90 font-medium">২৪/৭ লাইভ</span>
              </span>
            </div>

            {/* Desktop Sparkle Indicator */}
            <div className="hidden sm:flex items-center justify-center pl-1 text-[#FAB116] group-hover:translate-x-0.5 transition-transform">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </button>
        )}
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
