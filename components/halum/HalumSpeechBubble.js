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
  Search,
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
  onSendMessage,
  isOpen = false,
  pathname = '/',
  isLeftSide = false,
  onToggleSide,
  onMinimize,
  onTriggerTargetAction,
  hasTargetOnScreen = false,
  targetType = 'add-to-cart',
  isScrollAsking = false,
}) {
  const [visible, setVisible] = useState(true);
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

  // Proactive visibility: Always keep visible on mobile & desktop
  // When scrolling triggers isScrollAsking, ensure bubble is visible!
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
    }, 12000);
    return () => clearInterval(timer);
  }, [isOpen, productKnowledge, isNearFreeDelivery, isScrollAsking]);

  // Dismiss handler (soft dismiss: hides briefly, reappears when scrolling resumes)
  const handleDismiss = (e) => {
    e.stopPropagation();
    setVisible(false);
  };

  const handleOpenChat = (query = null) => {
    if (query && onSendMessage) {
      onSendMessage(query);
    } else if (onOpenChat) {
      onOpenChat();
    }
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
  let currentText = 'হালুম! কি লাগবে আমাকে বলুন, এখনই খুঁজে দিচ্ছি! 🐯🔍';
  let badgeTitle = 'হালুম মামা';
  let badgeIcon = '🐯';

  if (isScrollAsking) {
    currentText = 'কি লাগবে আমাকে বলুন, খুঁজে দিচ্ছি! 🐯🔍';
    badgeTitle = 'হালুম মামা সাহায্যকারী';
    badgeIcon = '🔍';
  } else if (isNearFreeDelivery) {
    badgeTitle = 'ফ্রি ডেলিভারি টিপ 🚚';
    badgeIcon = '🎁';
    currentText = `আর মাত্র ৳${remainingForFree} টাকার পণ্য নিলেই ডেলিভারি চার্জ একদম ফ্রি! 🚚✨`;
  } else if (productKnowledge) {
    currentText = productKnowledge.dialogue;
    badgeTitle = productKnowledge.title;
    badgeIcon = '🍯';
  } else if (hasCartItem && pathname !== '/cart') {
    currentText =
      'বাহ! খাঁটি খাবার কার্টে যোগ হয়েছে। বাঘের মতো শক্তি পেতে নিচে থাবা বসান আর অর্ডার কনফার্ম করুন! 🐾';
    badgeTitle = 'অর্ডার গাইড';
    badgeIcon = '🐾';
  } else if (quipIndex > 0 && pathname === '/') {
    currentText = TIGER_WITTY_QUIPS[quipIndex % TIGER_WITTY_QUIPS.length];
    badgeTitle = 'বাঘের রসিকতা';
    badgeIcon = '✨';
  } else if (currentRouteInfo && currentRouteInfo.greeting) {
    currentText = currentRouteInfo.greeting;
  }

  // Voice synthesis
  const handleSpeak = (e) => {
    e.stopPropagation();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        currentText.replace(/[🐯🍯🧈🌿🥛🎁🌱🌶️✨🐾👉👇👈🔍]/g, '')
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
      handleOpenChat();
    }
  };

  if (!visible || isOpen) {
    return null;
  }

  return (
    <div className="relative mb-2 w-full max-w-[270px] select-none animate-slideUp">
      {/* ── Premium Glassmorphic Card Container ── */}
      <div
        onClick={() => handleOpenChat()}
        className="bg-gradient-to-b from-white/98 via-[#FEFBF2]/95 to-white/98 backdrop-blur-md text-stone-900 p-3 sm:p-3.5 rounded-3xl shadow-[0_12px_36px_-6px_rgba(250,177,22,0.35),0_4px_16px_rgba(1,104,49,0.12)] border-2 border-[#FAB116] cursor-pointer transition-all hover:scale-[1.01] relative group"
      >
        {/* Top Header Bar: Title Badge, Voice, Swap Side, Minimize, Touch-Friendly Close */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/70 text-[10px] text-stone-600 font-bold">
          <div className="flex items-center gap-1.5 text-[#016831] truncate">
            <span className="text-sm">{badgeIcon}</span>
            <span className="truncate max-w-[130px] font-black tracking-tight">{badgeTitle}</span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Audio Voice button */}
            <button
              type="button"
              onClick={handleSpeak}
              className="min-w-[34px] min-h-[34px] flex items-center justify-center p-1 rounded-xl text-stone-600 hover:text-[#016831] hover:bg-amber-100/70 active:scale-95 transition-all"
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
                className="min-w-[34px] min-h-[34px] flex items-center justify-center p-1 rounded-xl text-stone-600 hover:text-[#016831] hover:bg-amber-100/70 active:scale-95 transition-all"
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
                className="min-w-[34px] min-h-[34px] flex items-center justify-center p-1 rounded-xl text-stone-600 hover:text-[#016831] hover:bg-amber-100/70 active:scale-95 transition-all"
                title="ছোট করুন"
                aria-label="মিনিমাইজ"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Close button with 44px Touch Area */}
            <button
              type="button"
              onClick={handleDismiss}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -my-2 text-stone-400 hover:text-stone-800 hover:bg-amber-100 active:scale-95 transition-all rounded-full"
              title="বন্ধ করুন"
              aria-label="বন্ধ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bubble Message Text */}
        <div className="flex items-start gap-1.5 my-1">
          {isNearFreeDelivery ? (
            <ShoppingBag className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5 animate-bounce" />
          ) : productKnowledge ? (
            <Sparkles className="w-4 h-4 text-[#FAB116] flex-shrink-0 mt-0.5 animate-pulse" />
          ) : hasCartItem ? (
            <ShoppingBag className="w-4 h-4 text-[#FAB116] flex-shrink-0 mt-0.5 animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#FAB116] flex-shrink-0 mt-0.5 animate-pulse" />
          )}
          <p className="text-xs sm:text-[13px] font-black leading-snug text-stone-900 break-words">
            {currentText}
          </p>
        </div>

        {/* ── Quick Action Search Chips (When asking "কি লাগবে আমাকে বলুন") ── */}
        {isScrollAsking && (
          <div
            className="mt-2 pt-2 border-t border-amber-200/80 flex flex-wrap gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: '🍯 মধু', query: 'খাঁটি মধু দেখতে চাই' },
              { label: '🧈 গাওয়া ঘি', query: 'বিলোনা গাওয়া ঘি' },
              { label: '🌿 ঘানি তেল', query: 'সরিষার তেল' },
              { label: '🥛 সন্দেশ', query: 'ক্ষীর সন্দেশ' },
              { label: '🎁 অফার', query: 'আজকের অফার কি আছে' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenChat(chip.query)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-[#016831] border border-amber-300 text-[10px] font-bold shadow-2xs active:scale-95 transition-all flex items-center gap-1"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 1-Click Free Delivery Upsell Add-Button */}
        {isNearFreeDelivery && upsellProduct && (
          <div className="mt-2 pt-1.5 border-t border-emerald-100">
            <button
              type="button"
              onClick={handleAddUpsell}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-[#016831] hover:bg-[#02833E] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-amber-300 stroke-[3]" />
              <span>{upsellProduct.name} (+৳{upsellProduct.price})</span>
            </button>
          </div>
        )}

        {/* Direct Action 1-Tap Trigger Button */}
        {!isNearFreeDelivery && !isScrollAsking && (hasTargetOnScreen || productKnowledge || pathname === '/cart') && (
          <div className="mt-2 pt-1.5 border-t border-amber-100">
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-[#FAB116] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 animate-pulse"
            >
              <Zap className="w-4 h-4 fill-current text-slate-950" />
              <span>
                {pathname === '/cart'
                  ? '👉 অর্ডার নিশ্চিত করুন (থাবা বসান 🐾)'
                  : '👉 এখনই অর্ডার করুন (এখানে থাবা দিন 🐾)'}
              </span>
            </button>
          </div>
        )}

        {/* Callout Bottom Clickable Hint */}
        <div className="mt-1.5 pt-1 flex items-center justify-between text-[10px] font-black text-[#016831]">
          <span className="flex items-center gap-1">
            <Search className="w-3 h-3 text-[#FAB116]" />
            <span>খুঁজতে এখানে চাপ দিন</span>
          </span>
          <span className="text-amber-700 font-bold">চ্যাট খুলুন &rarr;</span>
        </div>

        {/* ── Speech Bubble Tail pointing down towards Halum (Left or Right) ── */}
        <div
          className={`absolute -bottom-2.5 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-[#FAB116] drop-shadow-xs transition-all ${
            isLeftSide ? 'left-8' : 'right-8'
          }`}
        >
          <div className="absolute -top-[9px] -left-[8px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      </div>
    </div>
  );
}
