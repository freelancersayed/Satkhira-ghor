'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Volume2,
  ArrowLeftRight,
  Minus,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  getHalumProductKnowledge,
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
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  targetType = 'add-to-cart', // 'add-to-cart' | 'checkout' | 'general'
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

  // Retrieve omniscient product knowledge
  const productKnowledge = useMemo(() => {
    return productSlug ? getHalumProductKnowledge(productSlug) : null;
  }, [productSlug]);

  const currentRouteInfo = ROUTE_INTELLIGENCE[pathname] || ROUTE_INTELLIGENCE['/'];

  // Whenever user navigates to a new page or product, reopen bubble with the new context!
  useEffect(() => {
    setVisible(true);
  }, [pathname, hasCartItem]);

  // Rotate fun quips periodically when idle on general routes
  useEffect(() => {
    if (isOpen || productKnowledge) return;
    const timer = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % TIGER_WITTY_QUIPS.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [isOpen, productKnowledge]);

  // Determine current active dialogue & badges
  let currentText = currentRouteInfo.greeting;
  let badgeTitle = 'হালুম ভাই (বনের রাজা)';
  let badgeIcon = '🐯';

  if (productKnowledge) {
    currentText = productKnowledge.dialogue;
    badgeTitle = productKnowledge.title;
    badgeIcon = '🍯';
  } else if (hasCartItem && pathname !== '/cart') {
    currentText =
      'বাহ! খাঁটি খাবারগুলো তো কার্টে যুক্ত হয়েছে। বাঘের মতো শক্তি পেতে এখন ঝটপট নিচের বাটনটায় একটা থাবা বসান আর অর্ডার কনফার্ম করুন! 🐾';
    badgeTitle = 'অর্ডার গাইড';
    badgeIcon = '🐾';
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
      const utterance = new SpeechSynthesisUtterance(
        currentText.replace(/[🐯🍯🧈🌿🥛🎁🌱🌶️✨🐾👉👇👈]/g, '')
      );
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onTriggerTargetAction) {
      onTriggerTargetAction();
    } else {
      onOpenChat();
    }
  };

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-2 max-w-[240px] sm:max-w-[290px] animate-slideUp select-none">
      <div
        onClick={onOpenChat}
        className="bg-white/95 backdrop-blur-md text-stone-900 p-2.5 sm:p-3 rounded-2xl shadow-2xl border-2 border-amber-300/90 hover:border-[#016831] cursor-pointer transition-all hover:scale-[1.01] relative group"
      >
        {/* Top Control Bar: Title Badge, Voice, Swap Side, Minimize, Close */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-100 text-[10px] text-stone-500 font-bold">
          <div className="flex items-center gap-1 text-[#016831] truncate">
            <span>{badgeIcon}</span>
            <span className="truncate max-w-[130px] font-black">{badgeTitle}</span>
          </div>

          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            {/* Audio Voice button */}
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/70 transition-colors"
              title="মুখে শুনুন 🔊"
              aria-label="শুনুন"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Swap Side button */}
            {onToggleSide && (
              <button
                type="button"
                onClick={onToggleSide}
                className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/70 transition-colors"
                title={isLeftSide ? 'ডান পাশে নিন' : 'বাম পাশে নিন'}
                aria-label="পজিশন পরিবর্তন"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Minimize button */}
            {onMinimize && (
              <button
                type="button"
                onClick={onMinimize}
                className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100/70 transition-colors"
                title="ছোট করুন"
                aria-label="মিনিমাইজ"
              >
                <Minus className="w-3.5 h-3.5" />
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
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bubble Message */}
        <div className="flex items-start gap-1.5">
          {productKnowledge ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
          ) : hasCartItem ? (
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5 animate-bounce" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#FAB116] flex-shrink-0 mt-0.5" />
          )}
          <p className="text-[11px] sm:text-xs font-bold leading-relaxed text-stone-800">
            {currentText}
          </p>
        </div>

        {/* Direct Action 1-Tap Trigger Button (Requirement: Pointing & Action Guidance) */}
        {(hasTargetOnScreen || productKnowledge || pathname === '/cart') && (
          <div className="mt-2 pt-1.5 border-t border-amber-100">
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#FAB116] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span>
                {pathname === '/cart'
                  ? '👉 অর্ডার নিশ্চিত করুন (থাবা বসান 🐾)'
                  : '👉 এখনই অর্ডার করুন (এখানে থাবা দিন 🐾)'}
              </span>
            </button>
          </div>
        )}

        {/* Quick Click Chips on Bubble */}
        {productKnowledge && productKnowledge.chips && (
          <div className="mt-1.5 pt-1.5 border-t border-amber-100/70 flex flex-wrap gap-1">
            {productKnowledge.chips.slice(0, 2).map((chip, idx) => (
              <span
                key={idx}
                className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#016831] border border-amber-200"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {/* Action callout bottom */}
        <div className="mt-1.5 pt-1 flex items-center justify-between text-[9px] font-black text-[#016831]">
          <span>হালুম ভাইয়ের সাথে চ্যাট করতে ক্লিক করুন</span>
          <span>খুলুন &rarr;</span>
        </div>

        {/* Speech Bubble Arrow Tail pointing down (adaptive left/right) */}
        <div
          className={`absolute -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs ${
            isLeftSide ? 'left-10' : 'right-10'
          }`}
        />
      </div>
    </div>
  );
}
