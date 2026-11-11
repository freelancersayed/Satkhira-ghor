'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Flame,
  Clock,
  Plus,
  Trash2,
  Save,
  X,
  Sparkles,
  Check,
  Search,
  Eye,
  EyeOff,
  Percent,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function FlashSaleEditModal({ allProducts = [], onUpdated }) {
  const { user } = useAuthStore();
  const { content, updateSection } = useSiteContentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [enabled, setEnabled] = useState(true);
  const [title, setTitle] = useState('আজকের ধামাকা অফার');
  const [badgeText, setBadgeText] = useState('ফ্ল্যাশ সেল');
  const [durationHours, setDurationHours] = useState(12);
  const [endTime, setEndTime] = useState('');
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [customOffers, setCustomOffers] = useState({}); // { [slug]: { offerPrice, discountPercent } }

  // Product Picker state
  const [searchProduct, setSearchProduct] = useState('');

  // Only admins can see and edit
  if (!user || user.role !== 'admin') return null;

  const handleOpen = () => {
    const fs = content?.flashSale || {};
    setEnabled(fs.enabled !== false);
    setTitle(fs.title || 'আজকের ধামাকা অফার');
    setBadgeText(fs.badgeText || 'ফ্ল্যাশ সেল');
    setDurationHours(fs.durationHours || 12);
    setEndTime(fs.endTime || '');

    // Default slugs if none set
    let slugs = Array.isArray(fs.productSlugs) && fs.productSlugs.length > 0
      ? fs.productSlugs
      : allProducts.filter((p) => p.originalPrice > p.price).map((p) => p.slug);

    setSelectedSlugs(slugs);
    setCustomOffers(fs.customOffers || {});
    setNotification('');
    setErrorMsg('');
    setIsOpen(true);
  };

  // Add product to flash sale
  const handleAddProduct = (slug) => {
    if (!selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  // Remove product from flash sale
  const handleRemoveProduct = (slug) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    const nextOffers = { ...customOffers };
    delete nextOffers[slug];
    setCustomOffers(nextOffers);
  };

  // Update custom offer price for a product
  const handleOfferPriceChange = (slug, price) => {
    const numPrice = Number(price);
    const prod = allProducts.find((p) => p.slug === slug);
    const original = prod?.originalPrice || prod?.price || numPrice;
    const discount = original > numPrice ? Math.round(((original - numPrice) / original) * 100) : 0;

    setCustomOffers({
      ...customOffers,
      [slug]: {
        offerPrice: numPrice,
        discountPercent: discount,
      },
    });
  };

  // Save all flash sale settings
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg('');

      const flashSaleData = {
        enabled,
        title,
        badgeText,
        durationHours: Number(durationHours) || 12,
        endTime: endTime || null,
        productSlugs: selectedSlugs,
        customOffers,
      };

      await updateSection('flashSale', flashSaleData);
      if (onUpdated) onUpdated(flashSaleData);

      setNotification('ধামাকা অফার সফলভাবে সেভ করা হয়েছে!');
      setTimeout(() => {
        setNotification('');
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Products available to add (not yet in flash sale)
  const availableToAdd = allProducts.filter((p) => {
    const matchesSearch =
      !searchProduct ||
      p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchProduct.toLowerCase());
    return matchesSearch && !selectedSlugs.includes(p.slug);
  });

  return (
    <>
      {/* ── Trigger Button for Admin ── */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
        title="ধামাকা অফার ও ফ্ল্যাশ সেল এডিট করুন"
      >
        <Flame className="w-3.5 h-3.5 fill-current text-yellow-300" />
        <span>ধামাকা অফার এডিট</span>
      </button>

      {/* ── Admin Flash Sale Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8E2D5] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#016831] to-[#015629] text-white px-5 py-4 flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>ফ্ল্যাশ সেল ও ধামাকা অফার কন্ট্রোল</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-black">
                      এডমিন
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/70">
                    অফার প্রোডাক্ট বাছাই করুন, বিশেষ মূল্য নির্ধারণ ও টাইমার কাস্টমাইজ করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification / Error */}
            {notification && (
              <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{notification}</span>
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-between">
                <span>{errorMsg}</span>
                <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              {/* 1. Visibility & Basic Info */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <span className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    <span>সেকশন স্ট্যাটাস ও শিরোনাম</span>
                  </span>

                  {/* Toggle Enable/Disable */}
                  <button
                    type="button"
                    onClick={() => setEnabled(!enabled)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      enabled
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{enabled ? 'সক্রিয় (Visible)' : 'নিষ্ক্রিয় (Hidden)'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      সেকশন শিরোনাম
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="আজকের ধামাকা অফার"
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      টপ ব্যাজ টেক্সট
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="ফ্ল্যাশ সেল"
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                </div>

                {/* Countdown Timer Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>কাউন্টডাউন সময় (ঘণ্টা)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={durationHours}
                      onChange={(e) => setDurationHours(e.target.value)}
                      placeholder="12"
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      নির্দিষ্ট অফার শেষ হওয়ার তারিখ/সময় (ঐচ্ছিক)
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-xl bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Current Flash Sale Offer Products List */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <span className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500 fill-current" />
                    <span>নির্বাচিত অফার প্রোডাক্ট ({selectedSlugs.length} টি)</span>
                  </span>
                  <span className="text-[11px] text-stone-500">
                    এখানে বিশেষ অফার মূল্য নির্ধারণ করতে পারেন
                  </span>
                </div>

                {selectedSlugs.length === 0 ? (
                  <p className="text-xs text-stone-400 py-4 text-center">
                    বর্তমানে কোনো পণ্য যুক্ত করা নেই। নিচে থেকে পণ্য সিলেক্ট করুন।
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedSlugs.map((slug) => {
                      const prod = allProducts.find((p) => p.slug === slug);
                      if (!prod) return null;
                      const custom = customOffers[slug];
                      const currentOfferPrice = custom?.offerPrice !== undefined ? custom.offerPrice : prod.price;

                      return (
                        <div
                          key={slug}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-[#E8E2D5]">
                              <Image
                                src={prod.image}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-[#016831] truncate">
                                {prod.name}
                              </h5>
                              <p className="text-[10px] text-stone-500">
                                আসল মূল্য: ৳{prod.price} {prod.originalPrice ? `(কাটা: ৳${prod.originalPrice})` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Custom Offer Price Input */}
                            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-[#E8E2D5]">
                              <span className="text-[10px] font-bold text-[#D97706]">অফার: ৳</span>
                              <input
                                type="number"
                                min="0"
                                value={currentOfferPrice}
                                onChange={(e) => handleOfferPriceChange(slug, e.target.value)}
                                className="w-16 text-xs font-black text-[#016831] focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(slug)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="অফার থেকে সরান"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Add Products to Flash Sale Picker */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D5]">
                  <span className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#016831]" />
                    <span>স্টোর থেকে আরও পণ্য যুক্ত করুন</span>
                  </span>

                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      placeholder="পণ্য খুঁজুন..."
                      className="w-full pl-8 pr-2 py-1 text-xs border rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableToAdd.slice(0, 10).map((prod) => (
                    <div
                      key={prod.slug}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D5] hover:border-[#016831]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        </div>
                        <div className="min-w-0">
                          <h6 className="text-[11px] font-bold text-[#14241E] truncate">
                            {prod.name}
                          </h6>
                          <span className="text-[10px] text-[#016831] font-bold">
                            ৳{prod.price}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProduct(prod.slug)}
                        className="px-2.5 py-1 rounded-lg bg-[#016831] text-white hover:bg-[#015629] text-[10px] font-bold flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        <span>যোগ করুন</span>
                      </button>
                    </div>
                  ))}
                  {availableToAdd.length === 0 && (
                    <p className="text-xs text-stone-400 py-3 col-span-2 text-center">
                      আর কোনো পণ্য যুক্ত করার বাকি নেই
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-[#016831] text-white text-xs font-black shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'অফার পরিবর্তন সেভ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
