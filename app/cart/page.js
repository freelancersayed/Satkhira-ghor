'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

import { useAuthStore } from '@/store/authStore';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  const { user } = useAuthStore();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'ঢাকা',
    paymentMethod: 'cod',
    notes: '',
  });

  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        address: user.address || prev.address,
        city: user.city || prev.city,
      }));
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-[#1B4D3E] border-t-[#E5A93C] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#4A5B53]">কার্ট লোড হচ্ছে...</p>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const deliveryCharge = subtotal >= 1500 || subtotal === 0 ? 0 : 70;
  const total = Math.max(0, subtotal - discount + deliveryCharge);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SATKHIRA100') {
      setDiscount(100);
      setCouponMessage('অভিনন্দন! ১০০ টাকা ছাড় প্রযোজ্য হয়েছে।');
    } else if (couponCode.toUpperCase() === 'SUNDARBAN') {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      setCouponMessage(`অভিনন্দন! ১০% (৳${disc}) বিশেষ ছাড় প্রযোজ্য হয়েছে।`);
    } else {
      setCouponMessage('দুঃখিত, কুপন কোডটি সঠিক নয়। (ট্রাই করুন: SUNDARBAN বা SATKHIRA100)');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!formData.name || !formData.phone || !formData.address) {
      alert('অনুগ্রহ করে নাম, মোবাইল নম্বর এবং সম্পূর্ণ ঠিকানা প্রদান করুন।');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          items,
          subtotal: Math.max(0, subtotal - discount),
          deliveryFee: deliveryCharge,
          paymentMethod: formData.paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে');
      }

      setConfirmedOrder(data.order);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced && confirmedOrder) {
    return (
      <div className="py-20 bg-[#FCFBF7]">
        <div className="max-w-xl mx-auto px-4 text-center bg-white p-10 rounded-3xl border border-[#EFE9DC] shadow-lg space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B4D3E]">
            অর্ডার সফলভাবে গৃহীত হয়েছে!
          </h1>
          <div className="inline-block bg-[#FAF0D4] px-4 py-1.5 rounded-full text-xs font-bold text-[#1B4D3E]">
            অর্ডার ট্র্যাকিং আইডি: #{confirmedOrder.orderNumber}
          </div>
          <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed">
            ধন্যবাদ <strong>{formData.name}</strong>! আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই আমাদের প্রতিনিধি <strong>{formData.phone}</strong> নম্বরে কল করে অর্ডার নিশ্চিত করবেন।
          </p>
          <div className="bg-[#FAF8F4] p-4 rounded-2xl text-xs text-[#153D31] text-left space-y-1.5 border border-[#EFE9DC]">
            <div><strong>ডেলিভারি ঠিকানা:</strong> {formData.address}, {formData.city}</div>
            <div><strong>পেমেন্ট মাধ্যম:</strong> {formData.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)' : 'মোবাইল ব্যাংকিং (bKash/Nagad)'}</div>
            <div><strong>সর্বমোট প্রদেয় টাকা:</strong> ৳{confirmedOrder.totalAmount}</div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/track-order?q=${confirmedOrder.orderNumber}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E5A93C] text-[#102E25] rounded-xl text-xs font-bold hover:bg-[#d6982b] transition-colors shadow-sm"
            >
              <span>লাইভ অর্ডার ট্র্যাক করুন</span>
              <Truck className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl text-xs font-bold hover:bg-[#153D31] transition-colors"
            >
              <span>আরও কেনাকাটা করুন</span>
              <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B4D3E]">
            আপনার শপিং ব্যাগ ও চেকআউট
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5B53] mt-1">
            অর্ডারের বিবরণ যাচাই করুন এবং ডেলিভারির তথ্য দিন
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#EFE9DC] max-w-lg mx-auto space-y-4">
            <div className="w-20 h-20 bg-[#FAF0D4] rounded-full flex items-center justify-center text-[#E5A93C] mx-auto">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-[#1B4D3E]">আপনার কার্টে কোনো পণ্য নেই</h2>
            <p className="text-xs text-[#4A5B53]">
              সুন্দরবনের খাঁটি মধু ও গাওয়া ঘি দিয়ে আপনার ঝুড়ি ভরুন।
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl text-xs font-bold hover:bg-[#153D31] transition-colors"
            >
              <span>পণ্য দেখতে যান</span>
              <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Cart Items & Coupon */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-[#EFE9DC] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DC]">
                  <h2 className="font-bold text-[#1B4D3E] text-base">
                    ব্যাগে থাকা পণ্যসমূহ ({items.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>সব খালি করুন</span>
                  </button>
                </div>

                <div className="divide-y divide-[#EFE9DC]">
                  {items.map((item) => (
                    <div key={item.id} className="py-4 flex gap-4 items-center">
                      <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF8F4] flex-shrink-0 border border-[#EFE9DC]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="text-xs sm:text-sm font-bold text-[#1B4D3E] hover:text-[#C86D3B] line-clamp-1 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-[#4A5B53] mt-0.5">{item.unit}</p>
                        <p className="text-xs font-black text-[#C86D3B] mt-1">
                          ৳{item.price}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#EFE9DC] bg-white rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-[#F7F4ED] text-[#4A5B53] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#1B4D3E]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-[#F7F4ED] text-[#4A5B53] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-black text-[#1B4D3E]">
                          ৳{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="block ml-auto mt-1 text-xs text-red-500 hover:text-red-700"
                          aria-label="Remove item"
                        >
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Code Box */}
              <div className="bg-white rounded-3xl border border-[#EFE9DC] p-6 shadow-sm">
                <h3 className="text-xs font-bold text-[#1B4D3E] uppercase tracking-wider mb-2">
                  ডিসকাউন্ট বা প্রমো কোড
                </h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুপন কোড লিখুন (যেমন: SUNDARBAN)..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FCFBF7] border border-[#EFE9DC] text-xs uppercase font-bold text-[#1B4D3E] focus:outline-none focus:border-[#1B4D3E]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] font-bold text-xs rounded-xl transition-colors"
                  >
                    প্রয়োগ করুন
                  </button>
                </form>
                {couponMessage && (
                  <p className="text-xs mt-2 text-[#C86D3B] font-medium">
                    {couponMessage}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Checkout Shipping Form & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-[#EFE9DC] p-6 sm:p-7 shadow-sm space-y-5">
                <h2 className="font-bold text-base text-[#1B4D3E] pb-3 border-b border-[#EFE9DC]">
                  ডেলিভারি ঠিকানা ও তথ্য
                </h2>

                <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ জাহিদ হাসান"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DC] bg-[#FCFBF7] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 017XXXXXXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DC] bg-[#FCFBF7] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      ইমেইল (ঐচ্ছিক - অর্ডার আপডেটের জন্য)
                    </label>
                    <input
                      type="email"
                      placeholder="যেমন: yourname@gmail.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DC] bg-[#FCFBF7] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="বাসা নং, রোড নং, এলাকা/গ্রাম, থানা ও জেলা..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DC] bg-[#FCFBF7] focus:outline-none focus:border-[#1B4D3E]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1B4D3E] mb-1">
                      পেমেন্ট পদ্ধতি
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'cod'
                          ? 'border-[#1B4D3E] bg-[#F0F7F4] text-[#1B4D3E] font-bold'
                          : 'border-[#EFE9DC] bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={() =>
                            setFormData({ ...formData, paymentMethod: 'cod' })
                          }
                          className="accent-[#1B4D3E]"
                        />
                        <span>ক্যাশ অন ডেলিভারি</span>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        formData.paymentMethod === 'bkash'
                          ? 'border-[#1B4D3E] bg-[#F0F7F4] text-[#1B4D3E] font-bold'
                          : 'border-[#EFE9DC] bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bkash"
                          checked={formData.paymentMethod === 'bkash'}
                          onChange={() =>
                            setFormData({ ...formData, paymentMethod: 'bkash' })
                          }
                          className="accent-[#1B4D3E]"
                        />
                        <span>bKash / Nagad</span>
                      </label>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-4 border-t border-[#EFE9DC] space-y-2 text-xs">
                    <div className="flex justify-between text-[#4A5B53]">
                      <span>পণ্যের মোট মূল্য:</span>
                      <span className="font-semibold text-[#1B4D3E]">৳{subtotal}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>কুপন ছাড়:</span>
                        <span>-৳{discount}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#4A5B53]">
                      <span>ডেলিভারি চার্জ:</span>
                      <span>
                        {deliveryCharge === 0 ? (
                          <strong className="text-emerald-700 font-bold">ফ্রি</strong>
                        ) : (
                          `৳${deliveryCharge}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-black text-[#1B4D3E] pt-2 border-t border-[#EFE9DC]">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-[#C86D3B] text-lg">৳{total}</span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                      {orderError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] font-black rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-[#FAF0D4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>অর্ডার নিশ্চিত করুন (Place Order)</span>
                        <ArrowRight className="w-4 h-4 text-[#E5A93C]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
