'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ShoppingBag, Zap, Check, Plus, Minus, Layers } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export function getProductVariants(product) {
  if (product.variations && Array.isArray(product.variations) && product.variations.length > 0) {
    return product.variations;
  }
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }

  const basePrice = Number(product.price) || 1000;
  const baseOrig = Number(product.originalPrice) || Math.round(basePrice * 1.15);
  const slug = product.slug || '';
  const unit = product.unit || '';

  // Honey variants: 250g, 500g, 1kg (default)
  if (slug.includes('honey') || (unit.includes('কেজি') && (slug.includes('khalsi') || slug.includes('kalojira')))) {
    const p1kg = basePrice;
    const p500g = Math.round((basePrice * 0.54) / 10) * 10;
    const p250g = Math.round((basePrice * 0.29) / 10) * 10;
    return [
      { size: '২৫০ গ্রাম', price: p250g, originalPrice: Math.round((p250g * 1.15) / 10) * 10, sku: '250g' },
      { size: '৫০০ গ্রাম', price: p500g, originalPrice: Math.round((p500g * 1.15) / 10) * 10, sku: '500g' },
      { size: '১ কেজি (1 kg)', price: p1kg, originalPrice: baseOrig, sku: '1kg', default: true },
    ];
  }

  // Ghee variants: 250g, 500g, 1kg (default)
  if (slug.includes('ghee')) {
    const p1kg = basePrice;
    const p500g = Math.round((basePrice * 0.52) / 10) * 10;
    const p250g = Math.round((basePrice * 0.28) / 10) * 10;
    return [
      { size: '২৫০ গ্রাম', price: p250g, originalPrice: Math.round((p250g * 1.15) / 10) * 10, sku: '250g' },
      { size: '৫০০ গ্রাম', price: p500g, originalPrice: Math.round((p500g * 1.15) / 10) * 10, sku: '500g' },
      { size: '১ কেজি (1 kg)', price: p1kg, originalPrice: baseOrig, sku: '1kg', default: true },
    ];
  }

  // Oil variants: 500ml, 1 Liter (default), 5 Liter
  if (slug.includes('oil') || slug.includes('mustard')) {
    const p1L = basePrice;
    const p500ml = Math.round((basePrice * 0.54) / 10) * 10;
    const p5L = Math.round((basePrice * 4.8) / 10) * 10;
    return [
      { size: '৫০০ মি.লি.', price: p500ml, originalPrice: Math.round((p500ml * 1.15) / 10) * 10, sku: '500ml' },
      { size: '১ লিটার (1 L)', price: p1L, originalPrice: baseOrig, sku: '1L', default: true },
      { size: '৫ লিটার ক্যান', price: p5L, originalPrice: Math.round((p5L * 1.12) / 10) * 10, sku: '5L' },
    ];
  }

  // Sandesh variants: 500g, 1kg (default)
  if (slug.includes('sandesh') || slug.includes('sondes')) {
    const p1kg = basePrice;
    const p500g = Math.round((basePrice * 0.54) / 10) * 10;
    return [
      { size: '৫০০ গ্রাম বক্স', price: p500g, originalPrice: Math.round((p500g * 1.15) / 10) * 10, sku: '500g' },
      { size: '১ কেজি বক্স', price: p1kg, originalPrice: baseOrig, sku: '1kg', default: true },
    ];
  }

  // Seeds / Superfood: 250g, 500g (default), 1kg
  if (slug.includes('chia') || slug.includes('moringa') || slug.includes('seeds')) {
    const p500g = basePrice;
    const p250g = Math.round((basePrice * 0.56) / 10) * 10;
    const p1kg = Math.round((basePrice * 1.9) / 10) * 10;
    return [
      { size: '২৫০ গ্রাম জার', price: p250g, originalPrice: Math.round((p250g * 1.15) / 10) * 10, sku: '250g' },
      { size: product.unit || '৫০০ গ্রাম জার', price: p500g, originalPrice: baseOrig, sku: '500g', default: true },
      { size: '১ কেজি ফ্যামিলি প্যাক', price: p1kg, originalPrice: Math.round((p1kg * 1.15) / 10) * 10, sku: '1kg' },
    ];
  }

  // Fallback single variant
  return [
    {
      size: product.unit || '১ প্যাকেট',
      price: basePrice,
      originalPrice: baseOrig,
      sku: 'default',
      default: true,
    },
  ];
}

export default function AddToCartButton({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const mainActionsRef = useRef(null);

  const variants = useMemo(() => getProductVariants(product), [product]);
  const defaultIdx = useMemo(() => {
    const idx = variants.findIndex((v) => v.default);
    return idx >= 0 ? idx : variants.length - 1;
  }, [variants]);

  const [selectedVarIndex, setSelectedVarIndex] = useState(defaultIdx);

  const selectedVar = variants[selectedVarIndex] || variants[0];
  const currentPrice = Number(selectedVar.price) || Number(product.price);
  const currentOrigPrice = Number(selectedVar.originalPrice) || Number(product.originalPrice) || Math.round(currentPrice * 1.15);
  const currentUnit = selectedVar.size || selectedVar.weight || product.unit;

  const discountPercentage = currentOrigPrice > currentPrice
    ? Math.round(((currentOrigPrice - currentPrice) / currentOrigPrice) * 100)
    : null;

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Monitor scroll to reveal mobile sticky buy bar
  useEffect(() => {
    const handleScroll = () => {
      if (!mainActionsRef.current) return;
      const r = mainActionsRef.current.getBoundingClientRect();
      // Show sticky CTA when the main buttons are scrolled above viewport
      setShowStickyBar(r.bottom < 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductForCart = () => {
    return {
      ...product,
      id: `${product.id || product._id}-${selectedVar.sku || selectedVarIndex}`,
      name: `${product.name} (${currentUnit})`,
      price: currentPrice,
      unit: currentUnit,
      variation: selectedVar,
    };
  };

  const handleAddToCart = () => {
    addItem(getProductForCart(), quantity, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(getProductForCart(), quantity, false);
    openCart();
  };

  return (
    <div
      id="halum-add-to-cart-container"
      data-halum-product-id={product.id || product._id || product.slug}
      data-halum-product-name={product.name}
      data-halum-price={currentPrice}
      className="space-y-4"
    >
      {/* ── 1. Dynamic Real-Time Price Row ── */}
      <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-4 pb-2 border-b border-[#E8E2D5]">
        <span className="text-2xl sm:text-3xl font-black text-[#016831]">
          ৳{currentPrice}
        </span>
        {currentOrigPrice > currentPrice && (
          <span className="text-sm sm:text-base text-[#4B5563]/70 line-through font-normal">
            ৳{currentOrigPrice}
          </span>
        )}
        {discountPercentage && (
          <span className="text-xs font-black text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg border border-[#FDE68A]">
            {discountPercentage}% ছাড়!
          </span>
        )}
        <span className="text-xs font-semibold text-[#016831] bg-[#F0FDF4] px-2.5 py-1 rounded-lg border border-[#DCFCE7]">
          নির্বাচিত: {currentUnit}
        </span>
      </div>

      {/* ── 2. Clickable Dynamic Weight / Variant Selector Pills ── */}
      {variants.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#016831] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>ওজন / সাইজ নির্বাচন করুন:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = selectedVarIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedVarIndex(idx)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? 'bg-[#016831] text-white border-[#016831] shadow-md scale-102 ring-2 ring-[#FAB116]/40'
                      : 'bg-white text-slate-800 border-[#E8E2D5] hover:border-[#016831]/50 hover:bg-[#FDFBF7]'
                  }`}
                >
                  <span>{v.size}</span>
                  <span
                    className={
                      isSelected ? 'text-[#FAB116] font-black' : 'text-[#016831]'
                    }
                  >
                    ৳{v.price}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. Quantity Stepper & Subtotal ── */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1">
        <span className="text-xs font-bold text-[#016831] uppercase tracking-wider">
          পরিমাণ:
        </span>
        <div className="flex items-center border border-[#E8E2D5] bg-white rounded-2xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-[#4B5563] hover:bg-[#F7F5F0] hover:text-[#016831] transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 font-bold text-sm text-[#016831] min-w-[2.5rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2.5 text-[#4B5563] hover:bg-[#F7F5F0] hover:text-[#016831] transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-[#4B5563]">
          (মোট: <strong className="text-[#016831] font-bold">৳{currentPrice * quantity}</strong> • {currentUnit})
        </span>
      </div>

      {/* ── 4. Main Action Buttons ── */}
      <div ref={mainActionsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          id="halum-add-to-cart-btn"
          data-halum-target="add-to-cart"
          onClick={handleAddToCart}
          className={`py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] ${
            isAdded
              ? 'bg-emerald-800 text-white'
              : 'bg-[#016831] hover:bg-[#014D24] text-white border border-[#016831]'
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
          id="halum-buy-now-btn"
          data-halum-target="buy-now"
          onClick={handleBuyNow}
          className="py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-current text-slate-950" />
          <span>এখনই অর্ডার করুন</span>
        </button>
      </div>

      {/* ── 5. Mobile Slim Sticky Bottom Bar (< 640px) ── */}
      {/* Slides up smoothly when user scrolls past main action buttons */}
      {showStickyBar && (
        <aside
          role="region"
          aria-label="Mobile Quick Order Bar"
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D5] px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-6px_25px_rgba(0,0,0,0.14)] flex items-center justify-between gap-2.5 animate-slideUp"
        >
          {/* Price & Selected Unit */}
          <div className="flex flex-col min-w-0 pr-1">
            <span className="text-[10px] text-[#78716C] truncate font-medium">
              {currentUnit}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#016831]">
                ৳{currentPrice * quantity}
              </span>
              {currentOrigPrice > currentPrice && (
                <span className="text-[10px] text-[#9CA3AF] line-through">
                  ৳{currentOrigPrice * quantity}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all active:scale-95 ${
                isAdded
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-[#016831] text-white hover:bg-[#014D24] shadow-xs'
              }`}
              aria-label="কার্টে যোগ করুন"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>যুক্ত ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>কার্ট</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 active:scale-95 text-slate-950 shadow-md"
              aria-label="এখনই অর্ডার করুন"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
              <span>অর্ডার করুন</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
