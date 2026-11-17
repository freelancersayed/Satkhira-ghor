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
  MapPin,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
  Phone,
  MessageCircle,
  Sparkles,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { deliveryConfig } from '@/lib/deliveryConfig';

const toBanglaNum = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[d]);
};

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [showOrderSummaryMobile, setShowOrderSummaryMobile] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const { user } = useAuthStore();

  // Form states with Dhaka as default delivery region
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
        city: user.city || prev.city || 'ঢাকা',
      }));
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="py-20 text-center bg-[#FDFBF7] min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-9 h-9 border-3 border-[#016831] border-t-[#F59E0B] rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-600 font-medium">চেকআউট পেজ লোড হচ্ছে...</p>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const isFreeDelivery = subtotal >= deliveryConfig.freeDeliveryThreshold && subtotal > 0;
  const isDhaka = formData.city === 'ঢাকা';
  const deliveryCharge = isFreeDelivery
    ? 0
    : isDhaka
      ? deliveryConfig.insideDhaka
      : deliveryConfig.outsideDhaka;
  const total = Math.max(0, subtotal - discount + deliveryCharge);
  const remainingForFree = Math.max(0, deliveryConfig.freeDeliveryThreshold - subtotal);

  // Apply Coupon Logic
  const handleApplyCoupon = async (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : couponCode).trim();
    if (!code) return;

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscount(data.discount || 0);
        setCouponMessage(data.message || 'কুপন সফলভাবে প্রযোজ্য হয়েছে!');
      } else {
        // Fallback for demo coupons
        if (code.toUpperCase() === 'SATKHIRA100') {
          setDiscount(100);
          setCouponMessage('অভিনন্দন! ১০০ টাকা ছাড় প্রযোজ্য হয়েছে।');
        } else if (code.toUpperCase() === 'SUNDARBAN') {
          const disc = Math.round(subtotal * 0.1);
          setDiscount(disc);
          setCouponMessage(`অভিনন্দন! ১০% (৳${disc}) বিশেষ ছাড় প্রযোজ্য হয়েছে।`);
        } else {
          setDiscount(0);
          setCouponMessage(data.message || 'দুঃখিত, কুপন কোডটি সঠিক নয়।');
        }
      }
    } catch (err) {
      if (code.toUpperCase() === 'SATKHIRA100') {
        setDiscount(100);
        setCouponMessage('অভিনন্দন! ১০০ টাকা ছাড় প্রযোজ্য হয়েছে।');
      } else if (code.toUpperCase() === 'SUNDARBAN') {
        const disc = Math.round(subtotal * 0.1);
        setDiscount(disc);
        setCouponMessage(`অভিনন্দন! ১০% (৳${disc}) বিশেষ ছাড় প্রযোজ্য হয়েছে।`);
      } else {
        setCouponMessage('দুঃখিত, কুপন কোডটি সঠিক নয়।');
      }
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setOrderError('অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং সম্পূর্ণ ডেলিভারি ঠিকানা প্রদান করুন।');
      return;
    }

    // Basic Bangladeshi phone number validation
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11) {
      setOrderError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            ...formData,
            city: formData.city || 'ঢাকা',
          },
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
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.dispatchEvent(new CustomEvent('halum:order-confirmed'));
      }
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success State Screen (Compact & Screen-Friendly Main Screen Section) ──
  if (orderPlaced && confirmedOrder) {
    return (
      <div className="py-6 sm:py-12 bg-[#FDFBF7] min-h-[85vh] flex flex-col justify-center items-center">
        <div className="w-full max-w-lg mx-auto px-3.5 text-center bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#E8E2D5] shadow-xs space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#016831]">
              অর্ডার সফলভাবে গৃহীত হয়েছে!
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              সাতক্ষীরা ঘর থেকে কেনাকাটা করার জন্য ধন্যবাদ
            </p>
          </div>

          {/* হালুম ভাইয়ের স্যালুট কার্ড */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border border-[#FAB116] flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-full bg-white border border-[#016831] flex-shrink-0 flex items-center justify-center shadow-xs text-xl">
              🐯
            </div>
            <div>
              <div className="flex items-center gap-1 text-[11px] font-black text-[#016831]">
                <span>হালুম ভাইয়ের শুভেচ্ছা</span>
                <span>🫡</span>
              </div>
              <p className="text-xs font-bold text-stone-800 leading-snug mt-0.5">
                "শাবাশ! আপনার অর্ডারটি নিশ্চিত করা হয়েছে। খাঁটি পণ্য খুব দ্রুতই পৌঁছে যাবে আপনার ঠিকানায়।"
              </p>
            </div>
          </div>

          {/* Tracking ID Pill */}
          <div className="inline-block bg-[#FEF3C7] px-3.5 py-1 rounded-full text-xs font-bold text-[#016831] border border-[#FCD34D]">
            অর্ডার ট্র্যাকিং আইডি: #{confirmedOrder.orderNumber}
          </div>

          {/* Order Details Brief Box */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl text-xs text-stone-700 text-left space-y-1.5 border border-[#E8E2D5]">
            <div className="flex justify-between">
              <span className="text-stone-500">গ্রাহকের নাম:</span>
              <strong className="text-stone-800">{formData.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">মোবাইল নম্বর:</span>
              <strong className="text-stone-800">{formData.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">ডেলিভারি ঠিকানা:</span>
              <span className="text-right text-stone-800 line-clamp-1 max-w-[200px]">
                {formData.address}, {formData.city}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">পেমেন্ট মাধ্যম:</span>
              <span className="font-bold text-[#016831]">
                {formData.paymentMethod === 'cod'
                  ? 'ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা)'
                  : 'bKash / Nagad'}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-[#E8E2D5] font-black text-sm text-[#016831]">
              <span>সর্বমোট প্রদেয়:</span>
              <span className="text-[#B45309]">৳{toBanglaNum(confirmedOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              href={`/track-order?q=${confirmedOrder.orderNumber}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>লাইভ ট্র্যাক করুন</span>
            </Link>
            <Link
              href="/shop"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#016831] hover:bg-[#014D24] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>আরও কেনাকাটা করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Support callout */}
          <div className="text-[11px] text-stone-500 pt-1">
            যেকোনো প্রয়োজনে কল করুন:{' '}
            <a
              href={`tel:${deliveryConfig.supportPhoneRaw}`}
              className="font-bold text-[#016831] hover:underline"
            >
              {deliveryConfig.supportPhone}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Checkout View ──
  return (
    <div className="py-4 sm:py-6 lg:py-8 bg-[#FDFBF7] min-h-[85vh]">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
        {/* Header Breadcrumb & Micro-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E2D5]">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#016831] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D97706]" />
              <span>চেকআউট ও অর্ডার কনফার্ম</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              সহজ ১-পেজ অর্ডার ফর্ম—মাত্র ৩০ সেকেন্ডে অর্ডার সম্পন্ন করুন
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-[#016831]">
            <span className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ১০০% ক্যাশ অন ডেলিভারি
            </span>
            <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[#B45309]">
              <RotateCcw className="w-3.5 h-3.5" />
              দেখে নেয়ার সুযোগ
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-[#E8E2D5] max-w-md mx-auto space-y-3.5 shadow-xs">
            <div className="w-16 h-16 bg-[#FEF3C7] rounded-full flex items-center justify-center text-[#D97706] mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-[#016831]">আপনার শপিং ব্যাগ খালি</h2>
            <p className="text-xs text-stone-500">
              সুন্দরবনের খাঁটি মধু, গাওয়া ঘি বা খাঁটি সরিষার তেল নির্বাচন করে ঝুড়িতে যোগ করুন।
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <span>পণ্য দেখতে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div>
            {/* ── Mobile Collapsible Order Summary Bar (< 1024px) ── */}
            <div className="lg:hidden mb-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowOrderSummaryMobile(!showOrderSummaryMobile)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left bg-[#FAF8F5] hover:bg-stone-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#016831] flex items-center justify-center font-bold text-xs">
                    {items.length}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#016831] flex items-center gap-1">
                      <span>অর্ডার সারসংক্ষেপ</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${showOrderSummaryMobile ? 'rotate-180' : ''
                          }`}
                      />
                    </span>
                    <span className="text-[10px] text-stone-500 block">
                      {showOrderSummaryMobile ? 'আইটেম সংক্ষেপ করুন' : 'পণ্য ও পরিমাণ দেখতে ট্যাপ করুন'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">মোট প্রদেয়</span>
                  <span className="text-xs font-black text-[#B45309]">৳{toBanglaNum(total)}</span>
                </div>
              </button>

              {/* Collapsed Items & Coupon for Mobile */}
              {showOrderSummaryMobile && (
                <div className="p-3.5 border-t border-[#E8E2D5] space-y-3 animate-fadeIn">
                  <div className="divide-y divide-[#E8E2D5] max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center gap-2.5">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF8F5] flex-shrink-0 border border-[#E8E2D5]">
                          <Image
                            src={item.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
                            alt={item.name}
                            fill
                            unoptimized={Boolean(item.image?.startsWith('data:') || item.image?.startsWith('blob:') || /\.(svg|jfif|bmp|heic|heif)(\?.*)?$/i.test(item.image))}
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#016831] truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 block">{item.unit}</span>
                          <span className="text-xs font-bold text-[#B45309]">
                            ৳{toBanglaNum(item.price)}
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-[#E8E2D5] rounded-lg bg-white overflow-hidden scale-90">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#016831]">
                            {toBanglaNum(item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 text-xs"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Free Delivery Nudge */}
                  {!isFreeDelivery && remainingForFree > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-[#B45309] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        আর মাত্র <strong>৳{toBanglaNum(remainingForFree)}</strong> টাকার অর্ডার করলেই <strong>ফ্রি ডেলিভারি!</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Main 2-Column Responsive Layout ── */}
            <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
              {/* ── LEFT COLUMN (7 Cols): Shipping & Payment ── */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Customer Shipping Details Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E2D5] p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E2D5]">
                    <h2 className="text-sm sm:text-base font-bold text-[#016831] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#D97706]" />
                      <span>১. ডেলিভারির তথ্য দিন</span>
                    </h2>
                    <span className="text-[10px] text-stone-500 font-medium">
                      * চিহ্নিত ঘরগুলো আবশ্যক
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
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
                        className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#016831] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        মোবাইল নম্বর <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="যেমন: 01712345678"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#016831] focus:bg-white transition-all"
                        />
                        <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">
                        অর্ডার কনফার্মেশনের জন্য এই নম্বরে কল বা মেসেজ দেওয়া হবে।
                      </p>
                    </div>

                    {/* Delivery Area Selection (Inside vs Outside Dhaka) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        ডেলিভারি এরিয়া নির্বাচন করুন <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {/* Inside Dhaka */}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, city: 'ঢাকা' })}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative ${isDhaka
                              ? 'border-[#016831] bg-emerald-50/80 ring-1 ring-[#016831]'
                              : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800">ঢাকার ভেতরে</span>
                            {isDhaka && <Check className="w-3.5 h-3.5 text-[#016831]" />}
                          </div>
                          <div className="text-[11px] font-semibold text-[#016831] mt-0.5">
                            {isFreeDelivery ? 'ফ্রি ডেলিভারি' : `চার্জ: ৳${toBanglaNum(deliveryConfig.insideDhaka)}`}
                          </div>
                          <span className="text-[10px] text-stone-500 block">২৪-৪৮ ঘণ্টার মধ্যে</span>
                        </button>

                        {/* Outside Dhaka */}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, city: 'ঢাকার বাইরে' })}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative ${!isDhaka
                              ? 'border-[#016831] bg-emerald-50/80 ring-1 ring-[#016831]'
                              : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-800">ঢাকার বাইরে</span>
                            {!isDhaka && <Check className="w-3.5 h-3.5 text-[#016831]" />}
                          </div>
                          <div className="text-[11px] font-semibold text-[#016831] mt-0.5">
                            {isFreeDelivery ? 'ফ্রি ডেলিভারি' : `চার্জ: ৳${toBanglaNum(deliveryConfig.outsideDhaka)}`}
                          </div>
                          <span className="text-[10px] text-stone-500 block">২-৩ দিনের মধ্যে</span>
                        </button>
                      </div>
                    </div>

                    {/* Full Address */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        সম্পূর্ণ ডেলিভারি ঠিকানা <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="বাসা/রোড নং, এলাকা/গ্রাম, থানা ও জেলা..."
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs sm:text-sm text-stone-800 focus:outline-none focus:border-[#016831] focus:bg-white transition-all resize-none"
                      />
                    </div>

                    {/* Optional Note / Instruction Toggle */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowNotes(!showNotes)}
                        className="text-[11px] font-bold text-[#016831] hover:text-[#B45309] flex items-center gap-1 transition-colors"
                      >
                        <span>{showNotes ? '− অতিরিক্ত নির্দেশনা বাদ দিন' : '+ অতিরিক্ত কোনো নির্দেশনা থাকলে লিখুন (ঐচ্ছিক)'}</span>
                      </button>

                      {showNotes && (
                        <div className="mt-2 space-y-2 animate-fadeIn">
                          <input
                            type="email"
                            placeholder="আপনার ইমেইল (ঐচ্ছিক - ইনভয়েসের জন্য)"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs text-stone-800 focus:outline-none focus:border-[#016831]"
                          />
                          <input
                            type="text"
                            placeholder="ডেলিভারি ম্যানের জন্য কোনো বিশেষ বার্তা..."
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs text-stone-800 focus:outline-none focus:border-[#016831]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Payment Method Selector Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E2D5] p-4 sm:p-6 shadow-xs space-y-3">
                  <h2 className="text-sm sm:text-base font-bold text-[#016831] flex items-center gap-2 pb-2.5 border-b border-[#E8E2D5]">
                    <CreditCard className="w-4 h-4 text-[#D97706]" />
                    <span>২. পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Cash on Delivery (COD) */}
                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${formData.paymentMethod === 'cod'
                          ? 'border-[#016831] bg-emerald-50/80 ring-1 ring-[#016831]'
                          : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="mt-0.5 accent-[#016831]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-800">ক্যাশ অন ডেলিভারি</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-[#016831]">
                            জনপ্রিয়
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                          পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন
                        </p>
                      </div>
                    </div>

                    {/* bKash / Nagad */}
                    <div
                      onClick={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${formData.paymentMethod === 'bkash'
                          ? 'border-[#016831] bg-emerald-50/80 ring-1 ring-[#016831]'
                          : 'border-[#E8E2D5] bg-white hover:bg-[#FAF8F5]'
                        }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bkash"
                        checked={formData.paymentMethod === 'bkash'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                        className="mt-0.5 accent-[#016831]"
                      />
                      <div>
                        <span className="text-xs font-bold text-stone-800">বিকাশ / নগদ (bKash/Nagad)</span>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                          মোবাইল ব্যাংকিংয়ের মাধ্যমে পেমেন্ট
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* bKash Instructions if selected */}
                  {formData.paymentMethod === 'bkash' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#92400E] space-y-1 animate-fadeIn">
                      <div className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>বিকাশ/নগদ পেমেন্ট নির্দেশনা:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        আমাদের মার্চেন্ট নম্বর: <strong>{deliveryConfig.supportPhone}</strong> (Send Money / Payment)। অর্ডার প্লেস করার পর আমাদের প্রতিনিধি আপনাকে কল করে নিশ্চিত করবেন।
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN (5 Cols): Order Summary & Place Order CTA ── */}
              <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E2D5] p-4 sm:p-5 shadow-xs space-y-4">
                  {/* Desktop Item List Header */}
                  <div className="hidden lg:flex items-center justify-between pb-2.5 border-b border-[#E8E2D5]">
                    <h3 className="text-sm font-bold text-[#016831] flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>আপনার অর্ডার ({items.length}টি পণ্য)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>খালি করুন</span>
                    </button>
                  </div>

                  {/* Desktop Item List */}
                  <div className="hidden lg:block divide-y divide-[#E8E2D5] max-h-56 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center gap-2.5">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#FAF8F5] flex-shrink-0 border border-[#E8E2D5]">
                          <Image
                            src={item.image || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38'}
                            alt={item.name}
                            fill
                            unoptimized={Boolean(item.image?.startsWith('data:') || item.image?.startsWith('blob:') || /\.(svg|jfif|bmp|heic|heif)(\?.*)?$/i.test(item.image))}
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#016831] truncate">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 block">{item.unit}</span>
                          <span className="text-xs font-bold text-[#B45309]">
                            ৳{toBanglaNum(item.price)}
                          </span>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center border border-[#E8E2D5] rounded-lg bg-white overflow-hidden scale-90">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#016831]">
                            {toBanglaNum(item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-stone-100 text-stone-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-400 hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Code Section */}
                  <div className="pt-2 border-t border-[#E8E2D5]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#016831]" />
                      <span className="text-xs font-bold text-stone-700">কুপন কোড (প্রমোশন)</span>
                    </div>

                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="কুপন কোড লিখুন..."
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[#E8E2D5] bg-[#FAF8F5] text-xs font-bold uppercase text-[#016831] focus:outline-none focus:border-[#016831]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 bg-[#016831] hover:bg-[#014D24] text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                      >
                        প্রয়োগ
                      </button>
                    </div>

                    {/* Quick 1-Tap Coupon Suggestions */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-stone-500">ট্রাই করুন:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode('SUNDARBAN');
                          handleApplyCoupon('SUNDARBAN');
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-[#B45309] border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        SUNDARBAN (১০%)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponCode('SATKHIRA100');
                          handleApplyCoupon('SATKHIRA100');
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#016831] border border-emerald-200 hover:bg-emerald-100 transition-colors"
                      >
                        SATKHIRA100 (৳১০০)
                      </button>
                    </div>

                    {couponMessage && (
                      <p className="text-[11px] mt-1.5 text-[#B45309] font-medium leading-snug">
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-[#E8E2D5] space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>পণ্যের মোট মূল্য:</span>
                      <span className="font-semibold text-stone-800">৳{toBanglaNum(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>কুপন ছাড়:</span>
                        <span>-৳{toBanglaNum(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600">
                      <span>ডেলিভারি চার্জ ({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'}):</span>
                      <span>
                        {isFreeDelivery ? (
                          <strong className="text-emerald-700 font-bold">ফ্রি</strong>
                        ) : (
                          `৳${toBanglaNum(deliveryCharge)}`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-black text-[#016831] pt-2 border-t border-[#E8E2D5]">
                      <span>সর্বমোট প্রদেয়:</span>
                      <span className="text-[#B45309] text-lg font-black">
                        ৳{toBanglaNum(total)}
                      </span>
                    </div>
                  </div>

                  {orderError && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 leading-snug">
                      {orderError}
                    </div>
                  )}

                  {/* Place Order CTA Button */}
                  <button
                    id="halum-checkout-btn"
                    data-halum-target="checkout"
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>অর্ডার নিশ্চিত করুন • ৳{toBanglaNum(total)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Guarantee Pills */}
                  <div className="pt-2 border-t border-[#E8E2D5] grid grid-cols-3 gap-1 text-[10px] text-stone-500 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Lock className="w-3.5 h-3.5 text-[#016831]" />
                      <span>১০০% নিরাপদ</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Truck className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>ক্যাশ অন ডেলিভারি</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <RotateCcw className="w-3.5 h-3.5 text-[#016831]" />
                      <span>সহজ রিটার্ন</span>
                    </div>
                  </div>
                </div>

                {/* Direct Phone / WhatsApp Assistance */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#016831]" />
                    <span className="text-stone-700 font-medium">ফোনে অর্ডার করতে চান?</span>
                  </div>
                  <a
                    href={`tel:${deliveryConfig.supportPhoneRaw}`}
                    className="font-bold text-[#016831] hover:underline"
                  >
                    {deliveryConfig.supportPhone}
                  </a>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
