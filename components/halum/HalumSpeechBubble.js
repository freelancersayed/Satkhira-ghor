'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Volume2,
  ArrowLeftRight,
  Minus,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  PRODUCT_PRAISES,
  ROUTE_INTELLIGENCE,
  TIGER_WITTY_QUIPS,
} from './halumKnowledge';

export default function HalumSpeechBubble({
  onOpenChat,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onToggleSide,
  onMinimize,
}) {
  const [visible, setVisible] = useState(true);
  const [quipIndex, setQuipIndex] = useState(0);

  const items = useCartStore((state) => state.items);
  const hasCartItem = items && items.length > 0;

  // Extract product slug if on product detail page
  const productSlug = useMemo(() => {
    if (pathname && pathname.startsWith('/products/')) {
      return pathname.replace('/products/', '').split('?')[0].split('/')[0];
    }
    return null;
  }, [pathname]);

  const currentProductPraise = productSlug ? PRODUCT_PRAISES[productSlug] : null;
  const currentRouteInfo = ROUTE_INTELLIGENCE[pathname] || ROUTE_INTELLIGENCE['/'];

  // Rotate fun quips periodically when idle on general routes
  useEffect(() => {
    if (isOpen || currentProductPraise) return;
    const timer = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % TIGER_WITTY_QUIPS.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isOpen, currentProductPraise]);

  // Determine current active dialogue
  let currentText = currentRouteInfo.greeting;
  let badgeTitle = 'হালুম ভাই';
  let badgeIcon = '🐯';

  if (hasCartItem && pathname !== '/cart') {
    currentText =
      'বাহ! দারুণ একটা চয়েস করেছেন। এই মধু পেটে গেলে শরীরে বাঘের মতো শক্তি পাবেন গ্যারান্টি! এখন ঝটপট নিচের \'Order Now\' বাটনটায় একটা থাবা বসান! 🐾';
    badgeTitle = 'অর্ডার গাইড';
    badgeIcon = '🐾';
  } else if (currentProductPraise) {
    currentText = currentProductPraise.dialogue;
    badgeTitle = currentProductPraise.title;
    badgeIcon = '🍯';
  } else if (quipIndex > 0 && pathname === '/') {
    currentText = TIGER_WITTY_QUIPS[quipIndex % TIGER_WITTY_QUIPS.length];
    badgeTitle = 'বাঘের রসিকতা';
    badgeIcon = '✨';
  }

  // Voice synthesis (Web Speech API)
  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentText.replace(/[🐯🍯🧈🌿🥛🎁🌱🌶️✨🐾]/g, ''));
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-2.5 max-w-[230px] sm:max-w-[280px] animate-slideUp select-none">
      <div
        onClick={onOpenChat}
        className="bg-white/95 backdrop-blur-md text-stone-900 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-amber-300/90 hover:border-[#016831] cursor-pointer transition-all hover:scale-[1.02] relative group"
      >
        {/* Top Control Bar: Side Swap, Voice, Minimize, Close */}
        <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-amber-100/80 text-[10px] text-stone-500 font-bold">
          <div className="flex items-center gap-1 text-[#016831]">
            <span>{badgeIcon}</span>
            <span className="truncate max-w-[120px] font-black">{badgeTitle}</span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Audio Voice button */}
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/60 transition-colors"
              title="মুখে শুনুন 🔊"
              aria-label="শুনুন"
            >
              <Volume2 className="w-3 h-3" />
            </button>

            {/* Swap Side button */}
            {onToggleSide && (
              <button
                type="button"
                onClick={onToggleSide}
                className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/60 transition-colors"
                title={isLeftSide ? 'ডান পাশে নিন' : 'বাম পাশে নিন'}
                aria-label="পজিশন পরিবর্তন"
              >
                <ArrowLeftRight className="w-3 h-3" />
              </button>
            )}

            {/* Minimize button */}
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/60 transition-colors"
                title="ছোট করুন"
                aria-label="মিনিমাইজ"
              >
                <Minus className="w-3 h-3" />
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="বন্ধ করুন"
              aria-label="বন্ধ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bubble Message */}
        <div className="flex items-start gap-1.5">
          {hasCartItem ? (
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#FAB116] flex-shrink-0 mt-0.5" />
          )}
          <p className="text-[11px] sm:text-xs font-bold leading-snug text-stone-800">
            {currentText}
          </p>
        </div>

        {/* Action callout */}
        <div className="mt-1.5 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[9px] font-black text-[#016831]">
          <span>{hasCartItem ? 'থাবা বসাতে ট্যাপ করুন 🐾' : 'কথা বলতে ট্যাপ করুন'}</span>
          <span>চ্যাট খুলুন &rarr;</span>
        </div>

        {/* Speech Bubble Arrow Tail pointing down (adaptive left/right) */}
        <div
          className={`absolute -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs ${
            isLeftSide ? 'left-8' : 'right-8'
          }`}
        />
      </div>
    </div>
  );
}

