'use client';

import { useState } from 'react';
import { ShoppingBag, Zap, Check, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    openCart();
  };

  return (
    <div className="space-y-4">
      {/* Quantity Stepper */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider">
          পরিমাণ:
        </span>
        <div className="flex items-center border border-[#EFE9DC] bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-3 text-[#4A5B53] hover:bg-[#F7F4ED] hover:text-[#1B4D3E] transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-5 font-bold text-sm text-[#1B4D3E]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-3 text-[#4A5B53] hover:bg-[#F7F4ED] hover:text-[#1B4D3E] transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-[#4A5B53]">
          (মোট মূল্য: <strong>৳{product.price * quantity}</strong>)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
            isAdded
              ? 'bg-emerald-700 text-white'
              : 'bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-[#E5A93C]" />
              <span>কার্টে যোগ হয়েছে!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#E5A93C]" />
              <span>কার্টে যোগ করুন</span>
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          className="py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[#E5A93C] hover:bg-[#C98A23] text-[#102E25] transition-all shadow-md active:scale-95"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
}
