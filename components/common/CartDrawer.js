'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    getTotalPrice,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const totalPrice = getTotalPrice();
  const freeShippingThreshold = 1500;
  const progressToFreeShipping = Math.min(
    100,
    (totalPrice / freeShippingThreshold) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full w-full sm:w-[420px] bg-[#FCFBF7] z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#EFE9DC] flex items-center justify-between bg-[#F7F4ED]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1B4D3E] text-[#E5A93C] rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#1B4D3E] text-base">আপনার শপিং ব্যাগ</h3>
              <p className="text-xs text-[#4A5B53]">
                {items.length} টি পণ্য কার্টে রয়েছে
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            id="close-cart-btn"
            className="p-2 text-[#4A5B53] hover:text-[#1B4D3E] hover:bg-[#EFE9DC] rounded-xl transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="bg-[#F0F7F4] px-5 py-3 border-b border-[#DCEEE6]">
          {remainingForFreeShipping > 0 ? (
            <p className="text-xs text-[#153D31]">
              আর মাত্র <strong className="text-[#C86D3B]">৳{remainingForFreeShipping}</strong> টাকার পণ্য অর্ডার করলেই পাচ্ছেন <strong className="text-[#1B4D3E]">ফ্রি ডেলিভারি!</strong>
            </p>
          ) : (
            <p className="text-xs font-semibold text-[#1B4D3E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#E5A93C]" />
              অভিনন্দন! আপনি পাচ্ছেন ফ্রি হোম ডেলিভারি!
            </p>
          )}
          <div className="w-full bg-[#DCEEE6] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#E5A93C] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#EFE9DC]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#FAF0D4] flex items-center justify-center text-[#E5A93C]">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#1B4D3E]">কার্ট সম্পূর্ণ খালি</h4>
                <p className="text-xs text-[#4A5B53] mt-1">
                  সাতক্ষীরার খাঁটি মধু বা গাওয়া ঘি যোগ করুন
                </p>
              </div>
              <Link
                href="/shop"
                onClick={closeCart}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl font-bold text-xs hover:bg-[#153D31] transition-colors"
              >
                পণ্য দেখুন <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#FAF0D4] flex-shrink-0 border border-[#EFE9DC]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="text-xs font-bold text-[#1B4D3E] hover:text-[#C86D3B] line-clamp-1 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[11px] text-[#4A5B53] mt-0.5">{item.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#EFE9DC] bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#F7F4ED] text-[#4A5B53] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-[#1B4D3E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#F7F4ED] text-[#4A5B53] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-[#C86D3B]">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Subtotal & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#EFE9DC] bg-[#F7F4ED] space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#4A5B53]">
                <span>সাবটোটাল</span>
                <span className="font-semibold text-[#1B4D3E]">৳{totalPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-[#4A5B53]">
                <span>ডেলিভারি চার্জ</span>
                <span>
                  {remainingForFreeShipping === 0 ? (
                    <strong className="text-emerald-700">ফ্রি</strong>
                  ) : (
                    '৳৭০ (সারাদেশে)'
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1B4D3E] pt-2 border-t border-[#EFE9DC]">
                <span>সর্বমোট</span>
                <span className="text-[#C86D3B] text-base">
                  ৳{totalPrice + (remainingForFreeShipping === 0 ? 0 : 70)}
                </span>
              </div>
            </div>

            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full py-3 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] font-bold rounded-xl text-center text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>অর্ডার সম্পন্ন করুন (Checkout)</span>
              <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-[#4A5B53] hover:text-[#1B4D3E] py-1 transition-colors"
            >
              আরো পণ্য বাছাই করুন
            </button>
          </div>
        )}
      </div>
    </>
  );
}
