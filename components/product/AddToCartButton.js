'use client';

import { useState } from 'react';
import { ShoppingBag, Zap, Check, Plus, Minus, Layers } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Variations selector
  const hasVars = product.hasVariations && product.variations && product.variations.length > 0;
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);

  const selectedVar = hasVars ? product.variations[selectedVarIndex] : null;
  const currentPrice = selectedVar ? selectedVar.price : product.price;
  const currentUnit = selectedVar ? selectedVar.size || selectedVar.weight || product.unit : product.unit;

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const getProductForCart = () => {
    if (selectedVar) {
      return {
        ...product,
        id: `${product.id || product._id}-${selectedVar.sku || selectedVarIndex}`,
        name: `${product.name} (${selectedVar.size || selectedVar.weight || selectedVar.sku})`,
        price: selectedVar.price,
        unit: selectedVar.size || selectedVar.weight || product.unit,
        variation: selectedVar,
      };
    }
    return product;
  };

  const handleAddToCart = () => {
    addItem(getProductForCart(), quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(getProductForCart(), quantity);
    openCart();
  };

  return (
    <div className="space-y-4">
      {/* Variations Selection Matrix (Requirement 5) */}
      {hasVars && (
        <div className="space-y-2 pb-2">
          <label className="text-xs font-bold text-[#0F3D2E] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>সাইজ / পরিমাপ নির্বাচন করুন:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variations.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedVarIndex(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  selectedVarIndex === idx
                    ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-sm scale-105'
                    : 'bg-white text-slate-800 border-[#E8E2D5] hover:border-[#0F3D2E]'
                }`}
              >
                <span>{v.size || v.weight || `প্যাক ${idx + 1}`}</span>
                <span className={selectedVarIndex === idx ? 'text-[#F59E0B]' : 'text-[#0F3D2E]'}>
                  ৳{v.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Stepper */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-[#0F3D2E] uppercase tracking-wider">
          পরিমাণ:
        </span>
        <div className="flex items-center border border-[#E8E2D5] bg-white rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-3 text-[#4B5563] hover:bg-[#F7F5F0] hover:text-[#0F3D2E] transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-5 font-bold text-sm text-[#0F3D2E]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-3 text-[#4B5563] hover:bg-[#F7F5F0] hover:text-[#0F3D2E] transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-[#4B5563]">
          (মোট: <strong className="text-[#0F3D2E]">৳{currentPrice * quantity}</strong> • {currentUnit})
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${
            isAdded
              ? 'bg-emerald-800 text-white'
              : 'bg-[#0F3D2E] hover:bg-[#0A2B20] text-white border border-[#0F3D2E]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 text-[#F59E0B]" />
              <span>কার্টে যোগ হয়েছে!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
              <span>কার্টে যোগ করুন</span>
            </>
          )}
        </button>

        <button
          onClick={handleBuyNow}
          className="py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-current text-slate-950" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
}
