'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Volume2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function HalumSpeechBubble({
  onOpenChat,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  isScrollAsking = false,
}) {
  const [visible, setVisible] = useState(true);

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const subtotal = getTotalPrice();
  const hasCartItem = items && items.length > 0;

  // Whenever route changes or scroll trigger fires, ensure bubble gently shows up
  useEffect(() => {
    setVisible(true);
  }, [pathname, isScrollAsking]);

  // ── Dynamic Route-Aware Next-Step Guide Text (চিকন ও স্মার্ট গাইড) ──
  const dynamicGuideText = useMemo(() => {
    if (pathname.startsWith('/products/')) {
      if (hasTargetOnScreen) {
        return "অর্ডার করতে 'এখনই অর্ডার করুন' বাটনে চাপ দিন! 👉";
      }
      return 'খাঁটি গুনাগুণ দেখে নিচে অর্ডার করুন! 👇';
    }

    if (pathname === '/cart') {
      if (hasCartItem) {
        return 'অর্ডার নিশ্চিত করতে নিচে ঠিকানা লিখে ক্লিক করুন! 👇';
      }
      return 'আপনার কার্ট খালি! খাঁটি খাবার বেছে নিন 🍯';
    }

    if (pathname === '/track-order') {
      return '১১ ডিজিটের মোবাইল নম্বর লিখে পার্সেল ট্র্যাক করুন! 📦';
    }

    if (pathname === '/shop') {
      return 'পছন্দের খাবারে ক্লিক করে খাঁটি বিবরণ দেখুন! 🌿';
    }

    if (pathname.startsWith('/about')) {
      return 'আমাদের সরাসরি মৌয়াল ও কৃষক সংগ্রহের গল্প পড়ুন! 🌿';
    }

    // Default Home route ('/')
    if (hasCartItem) {
      return 'অর্ডার সম্পন্ন করতে উপরের কার্ট ব্যাগে ক্লিক করুন! 🛒';
    }

    if (isScrollAsking) {
      return 'খাবার বেছে নিতে ক্লিক করুন বা চ্যাটে বলুন! 🐯';
    }

    return 'খাঁটি খাবার দেখতে নিচে স্ক্রল করুন! 👇';
  }, [pathname, hasTargetOnScreen, hasCartItem, isScrollAsking]);

  // Voice synthesis
  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        dynamicGuideText.replace(/[🐯🍯🧈🌿🥛🎁🌱🌶️✨🐾👉👇👈🔍📦🛒]/g, '')
      );
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClickBubble = (e) => {
    e.stopPropagation();
    if (pathname.startsWith('/products/') && onTriggerTargetAction) {
      onTriggerTargetAction();
    } else if (onOpenChat) {
      onOpenChat();
    }
  };

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-1 w-max max-w-[210px] sm:max-w-[260px] select-none animate-slideUp">
      {/* ── Ultra-Slim Smart Floating Pill (চিকন ও স্মার্ট বাবল) ── */}
      <div
        onClick={handleClickBubble}
        className="bg-white/95 backdrop-blur-md text-stone-900 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md shadow-amber-500/15 border border-amber-400 cursor-pointer transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-1.5 relative group"
        title="ক্লিক করে চ্যাট করুন বা নির্দেশ দেখুন"
      >
        {/* Leading Tiger Emoji */}
        <span className="text-xs flex-shrink-0">🐯</span>

        {/* Dynamic Route-Step Text (Pure, Clean & Slim) */}
        <p className="text-[10px] sm:text-[11px] font-bold text-stone-900 leading-tight truncate">
          {dynamicGuideText}
        </p>

        {/* Action icons: Speaker & Close */}
        <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={handleSpeak}
            className="p-0.5 rounded-full text-stone-400 hover:text-[#016831] transition-colors"
            title="শুনুন"
            aria-label="শুনুন"
          >
            <Volume2 className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
            title="লুকান"
            aria-label="লুকান"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* ── Cute Comic Tail Pointing Down to Halum's Head ── */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-amber-400">
          <div className="absolute -top-[5px] -left-[4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white" />
        </div>
      </div>
    </div>
  );
}
