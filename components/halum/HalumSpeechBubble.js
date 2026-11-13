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
  tailPosition = null,
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
    // 0. High-Priority Autonomous Button Guidance (User Request: "এখানে ক্লিক কর")
    if (hasTargetOnScreen) {
      if (pathname.startsWith('/products/')) {
        return {
          line1: 'এখানে ক্লিক করো! 👉',
          line2: 'পণ্যটা কার্টে রেখে দাও! 🛒🐾',
          isActionTarget: true,
        };
      }
      if (pathname === '/cart') {
        return {
          line1: 'এখানে ক্লিক করো! 👉',
          line2: 'এবার অর্ডার করে ফেলো! ⚡📦',
          isActionTarget: true,
        };
      }
      if (pathname === '/track' || pathname === '/track-order') {
        return {
          line1: 'এখানে ক্লিক করো! 👉',
          line2: 'লাইভ পার্সেল ট্র্যাক করো! 🚚💨',
          isActionTarget: true,
        };
      }
      return {
        line1: 'এখানে ক্লিক করো! 👉',
        line2: 'খাঁটি খাবারের সেরা স্বাদ নাও! 🍯✨',
        isActionTarget: true,
      };
    }

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

    // 7. About Us Page (/about-us or /about) - Requirement 1
    if (pathname === '/about-us' || pathname === '/about') {
      return {
        line1: 'শ্যামনগর ও সুন্দরবনের',
        line2: 'মৌয়ালদের আসল গল্পটা জেনে নাও! 🌿🍯',
      };
    }

    // 8. Track Order Page (/track or /track-order) - Requirement 1
    if (pathname === '/track' || pathname === '/track-order') {
      return {
        line1: 'পার্সেল কোথায় আছে জানতে',
        line2: '১১ ডিজিটের ফোন নম্বর দাও! 📦',
      };
    }

    // 9. Scrolling / Search Help
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

  const resolvedTailPos = tailPosition || (isLeftSide ? 'left' : 'right');

  return (
    <div
      className={`relative mb-2.5 w-max max-w-[calc(100vw-96px)] sm:max-w-[280px] select-none animate-slideUp flex flex-col ${
        resolvedTailPos === 'left' ? 'items-start' : 'items-end'
      }`}
    >
      {/* ── Stitched Comic Speech Bubble (Matching User's Uploaded Screenshot Exactly) ── */}
      <div
        onClick={handleClickBubble}
        className="bg-white p-1 rounded-2xl shadow-[0_10px_25px_-4px_rgba(0,0,0,0.22),0_4px_10px_-2px_rgba(0,0,0,0.12)] border border-stone-200/90 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 relative group max-w-full"
        title="ক্লিক করে চ্যাট করুন বা নির্দেশ দেখুন"
      >
        {/* Inner Stitched Dashed Frame (User's Screenshot Style: Dark Charcoal Stitched Line) */}
        <div className="border-[1.5px] border-dashed border-stone-600/80 sm:border-stone-700/85 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center gap-2 bg-white">
          <span className="text-sm flex-shrink-0 animate-bounce">🐯</span>

          {/* 2 Highlighted Lines with break-words */}
          <div className="flex flex-col text-left min-w-0 pr-0.5 break-words">
            {guide.isActionTarget ? (
              <span className="text-[10px] sm:text-[10.5px] font-black text-amber-900 flex items-center gap-1 leading-tight">
                <span className="text-xs animate-pulse">👉</span>
                <span className="bg-[#FAB116] text-black px-1.5 py-0.2 rounded-md shadow-2xs font-black">
                  {guide.line1}
                </span>
              </span>
            ) : (
              <span className="text-[10.5px] sm:text-[11px] font-black text-amber-900 leading-tight">
                {guide.line1}
              </span>
            )}
            <span className="text-[11px] sm:text-[12px] font-black text-[#016831] leading-tight drop-shadow-[0_1px_1px_rgba(1,104,49,0.15)] mt-0.5">
              {guide.line2}
            </span>
          </div>

          {/* 44x44px Touch Target Close Button for Mobile Thumbs */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVisible(false);
            }}
            className="min-w-[44px] min-h-[44px] -my-2 -mr-2 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 flex-shrink-0 transition-colors"
            title="লুকান"
            aria-label="লুকান"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Curved Comic Swoop Tail (Matching User's Screenshot Exactly) ── */}
        <svg
          viewBox="0 0 32 24"
          className={`absolute -bottom-[19px] w-8 h-6 fill-white filter drop-shadow(0 3px 2px rgba(0,0,0,0.16)) pointer-events-none ${
            resolvedTailPos === 'left' ? 'left-6' : 'right-6 -scale-x-100'
          }`}
        >
          <path
            d="M4 0 C4 8, 2 15, 0 24 C9 18, 20 12, 28 0 Z"
            fill="white"
          />
          <path
            d="M4 0 C4 8, 2 15, 0 24 C9 18, 20 12, 28 0"
            stroke="#E5E7EB"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
