'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Check, ShoppingBag, X, ArrowRight, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function AddToCartToast() {
  const [mounted, setMounted] = useState(false);
  const showToast = useCartStore((state) => state.showToast);
  const hideToast = useCartStore((state) => state.hideToast);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);
  const openCart = useCartStore((state) => state.openCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Automatically dismiss toast after 3.8 seconds
  useEffect(() => {
    if (!showToast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3800);
    return () => clearTimeout(timer);
  }, [showToast, lastAddedItem, hideToast]);

  if (!mounted || !showToast || !lastAddedItem) {
    return null;
  }

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleViewCart = () => {
    hideToast();
    openCart();
  };

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[99999] w-[94vw] max-w-md pointer-events-auto animate-slideDown"
    >
      <div className="bg-white/98 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-[0_12px_40px_rgba(1,104,49,0.22)] border border-[#016831]/25 border-l-4 border-l-[#016831] flex items-center gap-3">
        {/* Product Thumbnail with Success Badge */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
          {lastAddedItem.image ? (
            <Image
              src={lastAddedItem.image}
              alt={lastAddedItem.name || 'পণ্য'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#016831]">
              <ShoppingBag className="w-6 h-6" />
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-[#016831] text-white p-0.5 rounded-tl-md">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-[#016831] uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FAB116]" />
              <span>কার্টে যোগ হয়েছে!</span>
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-0.5">
            {lastAddedItem.name}
          </h4>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-stone-500 mt-0.5">
            <span>পরিমাণ: {lastAddedItem.quantity || 1}</span>
            <span>•</span>
            <span className="font-bold text-[#016831]">
              কার্টে মোট: {totalItems} টি (৳{totalPrice.toLocaleString('bn-BD')})
            </span>
          </div>
        </div>

        {/* Actions: View Cart button & Close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleViewCart}
            className="px-3 py-2 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
          >
            <span>কার্ট</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={hideToast}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="বিজ্ঞপ্তি বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

