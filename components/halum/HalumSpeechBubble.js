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
  Plus,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import {
  getHalumProductKnowledge,
  ROUTE_INTELLIGENCE,
  TIGER_WITTY_QUIPS,
} from './halumKnowledge';
import { deliveryConfig } from '@/lib/deliveryConfig';
import { products } from '@/data/products';

export default function HalumSpeechBubble({
  onOpenChat,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onToggleSide,
  onMinimize,
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  targetType = 'add-to-cart',
}) {
  const [visible, setVisible] = useState(false);
  const [quipIndex, setQuipIndex] = useState(0);

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const addItem = useCartStore((state) => state.addItem);

  const subtotal = getTotalPrice();
  const hasCartItem = items && items.length > 0;

  // Smart Cart Watcher: Calculate if close to Free Delivery (e.g. 1100 to 1499 BDT)
  const isNearFreeDelivery =
    subtotal >= deliveryConfig.upsellNearThresholdMin &&
    subtotal < deliveryConfig.freeDeliveryThreshold;
  const remainingForFree = deliveryConfig.freeDeliveryThreshold - subtotal;

  // Add-on product for 1-click upsell (Pickle / Chui Jhal)
  const upsellProduct = useMemo(() => {
    return (
      products.find((p) => p.slug === 'sundarbans-plum-mango-pickle') ||
      products.find((p) => p.category === 'pickles') ||
      products[products.length - 1]
    );
  }, []);

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

  const currentRouteInfo = ROUTE_INTELLIGENCE[pathname] || ROUTE_INTELLIGENCE['/'];

  // ── Non-Intrusive Welcome Trigger (3–5 seconds delay, respects sessionStorage) ──
  useEffect(() => {
    // If on a specific product detail page or cart page, show after brief 1s delay
    if (productKnowledge || pathname === '/cart' || isNearFreeDelivery) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }

    // On home/general pages: check if user already dismissed welcome in this session
    try {
      const isDismissed = sessionStorage.getItem('halum_welcome_dismissed');
      if (isDismissed === 'true') {
        setVisible(false);
        return;
      }
    } catch (e) {}

    // Wait 3.5 seconds before showing non-intrusive welcome toast
    const welcomeTimer = setTimeout(() => {
      setVisible(true);
    }, 3500);

    return () => clearTimeout(welcomeTimer);
  }, [pathname, productKnowledge, isNearFreeDelivery]);

  // Periodic quip rotation when idle
  useEffect(() => {
    if (isOpen || productKnowledge || isNearFreeDelivery) return;
    const timer = setInterval(() => {
      setQuipIndex((prev) => (prev + 1) % TIGER_WITTY_QUIPS.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [isOpen, productKnowledge, isNearFreeDelivery]);

  // Dismiss handler saving to sessionStorage
  const handleDismiss = (e) => {
    e.stopPropagation();
    setVisible(false);
    try {
      sessionStorage.setItem('halum_welcome_dismissed', 'true');
    } catch (e) {}
  };

  // 1-Click Upsell Add to Cart
  const handleAddUpsell = (e) => {
    e.stopPropagation();
    if (upsellProduct) {
      addItem(upsellProduct, 1, false);
      setVisible(false);
    }
  };

  // Determine active text & badge
  let currentText = currentRouteInfo.greeting;
  let badgeTitle = 'হালুম মামা';
  let badgeIcon = '🐯';

  if (isNearFreeDelivery) {
    badgeTitle = 'ফ্রি ডেলিভারি টিপ 🚚';
    badgeIcon = '🎁';
    currentText = `আর মাত্র ৳${remainingForFree} টাকার আচার বা চুইঝাল নিলেই ডেলিভারি চার্জ একদম ফ্রি! 🚚✨`;
  } else if (productKnowledge) {
    currentText = productKnowledge.dialogue;
    badgeTitle = productKnowledge.title;
    badgeIcon = '🍯';
  } else if (hasCartItem && pathname !== '/cart') {
    currentText =
      'বাহ! খাঁটি খাবার তো কার্টে যুক্ত হয়েছে। বাঘের মতো শক্তি পেতে নিচে বাটনটায় একটা থাবা বসান আর অর্ডার কনফার্ম করুন! 🐾';
    badgeTitle = 'অর্ডার গাইড';
    badgeIcon = '🐾';
  } else if (quipIndex > 0 && pathname === '/') {
    currentText = TIGER_WITTY_QUIPS[quipIndex % TIGER_WITTY_QUIPS.length];
    badgeTitle = 'বাঘের রসিকতা';
    badgeIcon = '✨';
  }

  // Voice synthesis
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

            {/* Close button (Dismisses for session) */}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-md text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="বন্ধ করুন (এই সেশনে আর দেখাবে না)"
              aria-label="বন্ধ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bubble Message */}
        <div className="flex items-start gap-1.5">
          {isNearFreeDelivery ? (
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
          ) : productKnowledge ? (
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

        {/* 1-Click Free Delivery Upsell Add-Button */}
        {isNearFreeDelivery && upsellProduct && (
          <div className="mt-2 pt-1.5 border-t border-emerald-100">
            <button
              type="button"
              onClick={handleAddUpsell}
              className="w-full py-1.5 px-3 rounded-xl bg-[#016831] hover:bg-[#02833E] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
              <span>{upsellProduct.name} (+৳{upsellProduct.price})</span>
            </button>
          </div>
        )}

        {/* Direct Action 1-Tap Trigger Button */}
        {!isNearFreeDelivery && (hasTargetOnScreen || productKnowledge || pathname === '/cart') && (
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
        {!isNearFreeDelivery && productKnowledge && productKnowledge.chips && (
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
          <span>হালুম মামার সাথে চ্যাট করতে ক্লিক করুন</span>
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
