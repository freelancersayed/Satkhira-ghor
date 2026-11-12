'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

// Exact 4-Step User Journey Dialogue Suite
const STEP_DIALOGUES = {
  // ধাপ ১: ওয়েবসাইটে প্রবেশ করা মাত্র (Welcome & Greeting)
  welcome: 'হালুম! সুন্দরবনের গভীর থেকে সরাসরি খাঁটি মধুর দুনিয়ায় আপনাকে স্বাগতম! আমি বনের রাজা, তবে আজ আপনার শপিং গাইড! বলুন, আজ কোন মধুটা চেখে দেখতে চান? 🍯',
  // ধাপ ২: কাস্টমারের চাহিদা জানা (Product Exploration)
  explore: 'সুন্দরবনের মৌয়ালদের কাছ থেকে আনা খাঁটি খলসি বা কেওড়া মধু খুঁজছেন নাকি? নাকি রোগ প্রতিরোধ ক্ষমতা বাড়াতে স্পেশাল কম্বো প্যাক চাই? আমাকে বলুন, আমি খুঁজে দিচ্ছি! 🌿',
  // ধাপ ৩: অর্ডার করার সময় গাইড করা (Cart & Checkout Guidance)
  checkout: 'বাহ! দারুণ একটা চয়েস করেছেন। এই মধু পেটে গেলে শরীরে বাঘের মতো শক্তি পাবেন গ্যারান্টি! এখন ঝটপট নিচের \'Order Now\' বাটনটায় একটা থাবা বসান! 🐾',
  // ধাপ ৪: অর্ডার কনফার্মেশনের পর (Thank You Message)
  thanks: 'শাবাশ! অর্ডার কনফার্ম হয়ে গেছে। এবার সুন্দরবনের খাঁটি মধু আপনার ঠিকানায় উড়ে চলে আসছে। ততদিন ভালো থাকবেন, সুস্থ থাকবেন! 🐯',
};

const ROTATING_TIPS = [
  STEP_DIALOGUES.welcome,
  STEP_DIALOGUES.explore,
  '১৫০০ টাকার অর্ডারে সারাদেশে ফ্রি হোম ডেলিভারি! 🚚',
  'আজকে মেগা ফ্যামিলি কম্বো প্যাকে ২০০ টাকা সরাসরি ছাড়! 🎁',
];

export default function HalumSpeechBubble({ onOpenChat, isOpen = false }) {
  const [visible, setVisible] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);

  const items = useCartStore((state) => state.items);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  // If user just added an item, prioritize Step 3 dialog
  const hasCartItem = items && items.length > 0;

  // Proactive periodic tip rotation every 8 seconds when cart is empty
  useEffect(() => {
    if (isOpen) return;
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!visible || isOpen) {
    return null;
  }

  // Active dialogue text
  const currentText = hasCartItem ? STEP_DIALOGUES.checkout : ROTATING_TIPS[tipIndex];

  return (
    <div className="relative mb-2.5 max-w-[220px] sm:max-w-[270px] animate-slideUp select-none">
      <div
        onClick={onOpenChat}
        className="bg-white/95 backdrop-blur-md text-stone-900 p-2.5 sm:p-3 rounded-2xl shadow-xl border border-amber-300/90 hover:border-[#016831] cursor-pointer transition-all hover:scale-[1.02] relative group"
      >
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center shadow-xs border border-stone-200 transition-colors"
          title="বন্ধ করুন"
          aria-label="বার্তা বন্ধ করুন"
        >
          <X className="w-3 h-3" />
        </button>

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
          <span>{hasCartItem ? 'থাবা বসাতে ট্যাপ করুন 🐾' : 'হালুম ভাইয়ের সাথে কথা বলুন'}</span>
          <span>খুলুন &rarr;</span>
        </div>

        {/* Speech Bubble Arrow Tail pointing down */}
        <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white drop-shadow-xs" />
      </div>
    </div>
  );
}

