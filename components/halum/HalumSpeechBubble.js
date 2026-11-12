'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { deliveryConfig } from '@/lib/deliveryConfig';

export default function HalumSpeechBubble({
  onOpenChat,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  isScrollAsking = false,
  welcomeStep = 0,
  lastAddedItem = null,
}) {
  const [visible, setVisible] = useState(true);

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const subtotal = getTotalPrice();
  const hasCartItem = items && items.length > 0;

  // Free delivery proximity
  const isNearFreeDelivery =
    subtotal >= deliveryConfig.upsellNearThresholdMin &&
    subtotal < deliveryConfig.freeDeliveryThreshold;
  const remainingForFree = deliveryConfig.freeDeliveryThreshold - subtotal;

  // Re-show bubble on route change, welcome step, or cart update
  useEffect(() => {
    setVisible(true);
  }, [pathname, welcomeStep, isScrollAsking, lastAddedItem]);

  // ── Dynamic 2-Line Highlighted Dialogues (ইউজার জার্নি ও মিষ্টি রসিকতা) ──
  const guide = useMemo(() => {
    // 1. Welcome Sequence on Homepage Entry / Refresh
    if (pathname === '/' && welcomeStep === 1) {
      return {
        line1: 'সাতক্ষীরা ঘরে',
        line2: 'আপনাকে স্বাগতম! 🐯✨',
      };
    }
    if (pathname === '/' && welcomeStep === 2) {
      return {
        line1: 'কীভাবে সহযোগিতা করতে পারি বলো?',
        line2: 'পণ্য খুঁজে পাচ্ছ না? আমাকে বলো! 🐾',
      };
    }

    // 2. When Item Added to Cart (মজার সেলিব্রেশন)
    if (lastAddedItem) {
      return {
        line1: 'বাঘের শিকার খাঁচায় বন্দি! 🐯',
        line2: 'এবার দ্রুত অর্ডার করে ফেলো! ⚡📦',
      };
    }

    // 3. Product Page (/products/[slug])
    if (pathname.startsWith('/products/')) {
      return {
        line1: 'এত কী চিন্তা করছো?',
        line2: 'আগে পণ্যটা কার্টে রেখে দাও! 🛒🐾',
      };
    }

    // 4. Cart / Checkout Page (/cart)
    if (pathname === '/cart') {
      if (hasCartItem) {
        return {
          line1: 'ঠিকানা দিয়ে থাবা বসাও!',
          line2: 'বাঘের গতিতে পার্সেল যাবে! 🚚💨',
        };
      }
      return {
        line1: 'তোমার কার্ট খালি!',
        line2: 'সেরা খাঁটি খাবার বেছে নাও 🍯',
      };
    }

    // 5. Free Delivery Tip
    if (isNearFreeDelivery) {
      return {
        line1: `আর মাত্র ৳${remainingForFree} টাকার পণ্য নিলে`,
        line2: 'সারা দেশে ডেলিভারি একদম ফ্রি! 🎁',
      };
    }

    // 6. Shop Page (/shop)
    if (pathname === '/shop') {
      return {
        line1: 'খাঁটি খাবারের ভাণ্ডার!',
        line2: 'পছন্দের খাবারে ক্লিক করে দেখো! 🌿',
      };
    }

    // 7. Track Order Page (/track-order)
    if (pathname === '/track-order') {
      return {
        line1: 'পার্সেল কোথায় আছে দেখতে',
        line2: '১১ ডিজিটের মোবাইল নম্বর দাও! 📦',
      };
    }

    // 8. Scrolling / Search Help
    if (isScrollAsking) {
      return {
        line1: 'পণ্য পছন্দ করতে সমস্যা?',
        line2: 'আমাকে বলো, আমি খুঁজে দিচ্ছি! 🔍',
      };
    }

    if (hasCartItem) {
      return {
        line1: 'কার্টে খাবার রেডি আছে!',
        line2: 'অর্ডার করতে ব্যাগে ক্লিক করো! 🛒',
      };
    }

    // Default Home
    return {
      line1: 'খাঁটি খাবার দেখতে',
      line2: 'নিচে একটু স্ক্রল করো! 👇',
    };
  }, [
    pathname,
    welcomeStep,
    lastAddedItem,
    hasTargetOnScreen,
    hasCartItem,
    isNearFreeDelivery,
    remainingForFree,
    isScrollAsking,
  ]);

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
    <div
      className={`relative mb-1.5 w-max max-w-[230px] sm:max-w-[270px] select-none animate-slideUp flex flex-col ${
        isLeftSide ? 'items-start' : 'items-end'
      }`}
    >
      {/* ── Ultra-Slim Smart Floating Pill (2 Highlighted Lines) ── */}
      <div
        onClick={handleClickBubble}
        className="bg-white/95 backdrop-blur-md px-3 py-1.5 sm:py-2 rounded-2xl shadow-lg shadow-amber-500/15 border-2 border-[#FAB116] cursor-pointer transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 relative group"
        title="ক্লিক করে চ্যাট করুন"
      >
        <span className="text-sm flex-shrink-0">🐯</span>

        {/* 2 Highlighted Lines */}
        <div className="flex flex-col text-left min-w-0 pr-0.5">
          <span className="text-[10.5px] sm:text-[11px] font-extrabold text-amber-900 leading-tight whitespace-nowrap">
            {guide.line1}
          </span>
          <span className="text-[11px] sm:text-[12px] font-black text-[#016831] leading-tight whitespace-nowrap">
            {guide.line2}
          </span>
        </div>

        {/* Mini close button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          className="p-0.5 rounded-full text-stone-400 hover:text-stone-700 flex-shrink-0 transition-colors"
          title="লুকান"
          aria-label="লুকান"
        >
          <X className="w-2.5 h-2.5" />
        </button>

        {/* Cute Comic Tail Pointing Down to Halum's Head */}
        <div
          className={`absolute -bottom-1.5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-[#FAB116] ${
            isLeftSide ? 'left-7' : 'right-7'
          }`}
        >
          <div className="absolute -top-[5px] -left-[4px] w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-white" />
        </div>
      </div>
    </div>
  );
}
