'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  ShoppingBag,
  Volume2,
  Zap,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  getHalumProductKnowledge,
  ROUTE_INTELLIGENCE,
  TIGER_WITTY_QUIPS,
} from './halumKnowledge';
import { deliveryConfig } from '@/lib/deliveryConfig';

export default function HalumSpeechBubble({
  onOpenChat,
  onSendMessage,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  isScrollAsking = false,
}) {
  const [visible, setVisible] = useState(true);
  const [quipIndex, setQuipIndex] = useState(0);

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const subtotal = getTotalPrice();
  const hasCartItem = items && items.length > 0;

  // Free delivery proximity
  const isNearFreeDelivery =
    subtotal >= deliveryConfig.upsellNearThresholdMin &&
    subtotal < deliveryConfig.freeDeliveryThreshold;
  const remainingForFree = deliveryConfig.freeDeliveryThreshold - subtotal;

  // Extract product slug if on product detail page
  const productSlug = useMemo(() => {
    if (pathname && pathname.startsWith('/products/')) {
      return pathname.replace('/products/', '').split('?')[0].split('/')[0];
    }
    return null;
  }, [pathname]);

  const productKnowledge = useMemo(() => {
    return productSlug ? getHalumProductKnowledge(productSlug) : null;
  }, [productSlug]);

  // When scrolling triggers isScrollAsking, ensure bubble shows up gently
  useEffect(() => {
    if (isScrollAsking) {
      setVisible(true);
    }
  }, [isScrollAsking]);

  // Periodic quip rotation when idle
  useEffect(() => {
    if (isOpen || productKnowledge || isNearFreeDelivery || isScrollAsking) return;
    const timer = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % TIGER_WITTY_QUIPS.length);
    }, 14000);
    return () => clearInterval(timer);
  }, [isOpen, productKnowledge, isNearFreeDelivery, isScrollAsking]);

  // Concise, smart, non-intrusive short dialogues (1-2 lines max)
  let shortText = 'কি লাগবে বলুন, খুঁজে দিচ্ছি! 🐯';
  let badgeIcon = '🐯';

  if (isScrollAsking) {
    shortText = 'কি লাগবে বলুন, খুঁজে দিচ্ছি! 🔍';
    badgeIcon = '🔍';
  } else if (isNearFreeDelivery) {
    shortText = `আর মাত্র ৳${remainingForFree} নিলেই ফ্রি ডেলিভারি! 🚚`;
    badgeIcon = '🎁';
  } else if (productKnowledge) {
    shortText = '১০০% খাঁটি ও তাজা! অর্ডার করতে থাবা দিন 🐾';
    badgeIcon = '🍯';
  } else if (hasCartItem && pathname !== '/cart') {
    shortText = 'খাবার কার্টে যুক্ত হয়েছে! অর্ডার করবেন? 🐾';
    badgeIcon = '🛒';
  } else if (quipIndex > 0 && pathname === '/') {
    shortText = TIGER_WITTY_QUIPS[quipIndex % TIGER_WITTY_QUIPS.length];
    badgeIcon = '✨';
  } else if (pathname === '/cart') {
    shortText = 'নিচের ফর্ম পূরণ করে অর্ডার কনফার্ম করুন! 🐾';
    badgeIcon = '📦';
  }

  // Voice synthesis
  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        shortText.replace(/[🐯🍯🧈🌿🥛🎁🌱🌶️✨🐾👉👇👈🔍]/g, '')
      );
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
    if (onTriggerTargetAction) {
      onTriggerTargetAction();
    } else {
      if (onOpenChat) onOpenChat();
    }
  };

  const handleChipClick = (query, e) => {
    e.stopPropagation();
    if (onSendMessage) {
      onSendMessage(query);
    } else if (onOpenChat) {
      onOpenChat();
    }
  };

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-1.5 w-max max-w-[210px] sm:max-w-[240px] select-none animate-slideUp">
      {/* ── Smart Compact Comic Speech Bubble ── */}
      <div
        onClick={() => {
          if (onOpenChat) onOpenChat();
        }}
        className="bg-white/95 backdrop-blur-md text-stone-900 p-2 sm:p-2.5 rounded-2xl shadow-lg shadow-amber-500/15 border-2 border-[#FAB116] cursor-pointer transition-all hover:scale-[1.02] relative"
      >
        {/* Top Mini Header: Badge & Quick Controls */}
        <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-amber-100 text-[9px] font-black">
          <div className="flex items-center gap-1 text-[#016831] truncate">
            <span>{badgeIcon}</span>
            <span className="truncate">হালুম মামা</span>
          </div>

          <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleSpeak}
              className="p-1 rounded-md text-stone-500 hover:text-[#016831] hover:bg-amber-100 transition-colors"
              title="শুনুন"
              aria-label="শুনুন"
            >
              <Volume2 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="বন্ধ করুন"
              aria-label="বন্ধ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Short & Smart Message */}
        <div className="text-[11px] sm:text-xs font-bold leading-snug text-stone-800 break-words my-0.5">
          {shortText}
        </div>

        {/* 1-Tap Action Button when on Product Page */}
        {(hasTargetOnScreen || productKnowledge) && (
          <div className="mt-1 pt-1 border-t border-amber-100">
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-[#FAB116] text-slate-950 font-black text-[10px] flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-all animate-pulse"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>এখানে থাবা বসান 🐾</span>
            </button>
          </div>
        )}

        {/* ── Smart Micro-Chips: 1-Tap Quick Helps ── */}
        {!productKnowledge && (
          <div
            className="mt-1.5 pt-1 border-t border-amber-100 flex flex-wrap gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: '🍯 মধু', q: 'খাঁটি মধু দেখতে চাই' },
              { label: '🧈 ঘি', q: 'গাওয়া ঘি এর দাম' },
              { label: '🌿 তেল', q: 'সরিষার তেল কেমন?' },
              { label: '🎁 অফার', q: 'আজকের অফার কি আছে' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleChipClick(chip.q, e)}
                className="px-1.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-[#016831] border border-amber-200 text-[9px] font-bold active:scale-95 transition-all"
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Cute Comic Tail Pointing Down to Halum's Head ── */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#FAB116]">
          <div className="absolute -top-[6px] -left-[5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white" />
        </div>
      </div>
    </div>
  );
}
