'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Flame,
  Clock,
  Plus,
  Trash2,
  Save,
  Search,
  Sparkles,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Percent,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function AdminFlashSaleView({ allProducts = [] }) {
  const { content, fetchContent, updateSection } = useSiteContentStore();
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

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const fs = content?.flashSale || {};
    setEnabled(fs.enabled !== false);
    setTitle(fs.title || 'আজকের ধামাকা অফার');
    setBadgeText(fs.badgeText || 'ফ্ল্যাশ সেল');
    setDurationHours(fs.durationHours || 12);
    setEndTime(fs.endTime || '');

    let slugs = Array.isArray(fs.productSlugs) && fs.productSlugs.length > 0
      ? fs.productSlugs
      : allProducts.filter((p) => p.originalPrice > p.price).map((p) => p.slug);

    setSelectedSlugs(slugs);
    setCustomOffers(fs.customOffers || {});
  }, [content?.flashSale, allProducts]);

  // Add product to flash sale
  const handleAddProduct = (slug) => {
    if (!selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
      const prod = allProducts.find((p) => p.slug === slug);
      if (prod) {
        const defaultOfferPrice = prod.price || prod.originalPrice;
        const original = prod.originalPrice || prod.price;
        const discount = original > defaultOfferPrice
          ? Math.round(((original - defaultOfferPrice) / original) * 100)
          : 0;
        setCustomOffers({
          ...customOffers,
          [slug]: {
            offerPrice: defaultOfferPrice,
            discountPercent: discount,
          },
        });
      }
    }
  };

  // Remove product from flash sale
  const handleRemoveProduct = (slug) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    const nextOffers = { ...customOffers };
    delete nextOffers[slug];
    setCustomOffers(nextOffers);
  };

  // Update offer price
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
    if (e) e.preventDefault();
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
      setNotification('ধামাকা অফার সফলভাবে সেভ করা হয়েছে!');
      setTimeout(() => setNotification(''), 3500);
    } catch (err) {
      setErrorMsg(err.message || 'সেভ করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const availableToAdd = allProducts.filter((p) => {
    const matchesSearch =
      !searchProduct ||
      p.name?.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchProduct.toLowerCase());
    return matchesSearch && !selectedSlugs.includes(p.slug);
  });

  return (
    <div className="space-y-6">
      {/* ── Notification Banner ── */}
      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#016831] px-4 py-3 rounded-2xl flex items-center justify-between text-sm font-bold shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Section Header & Actions ── */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-white flex items-center justify-center shadow-md">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#016831] flex items-center gap-2">
              <span>ফ্ল্যাশ সেল ও ধামাকা অফার নিয়ন্ত্রণ</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                enabled ? 'bg-emerald-100 text-[#016831]' : 'bg-stone-200 text-stone-600'
              }`}>
                {enabled ? 'সক্রিয় (Active)' : 'বন্ধ (Disabled)'}
              </span>
            </h2>
            <p className="text-xs text-[#4A5B52] mt-0.5">
              হোমপেজের আকর্ষণীয় ফ্ল্যাশ সেল ব্যানার, কাউন্টডাউন টাইমার ও স্পেশাল ছাড় মূল্য নির্ধারণ করুন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            className={`flex-1 md:flex-initial px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              enabled
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-emerald-100 text-[#016831] hover:bg-emerald-200'
            }`}
          >
            {enabled ? (
              <>
                <EyeOff className="w-4 h-4 text-amber-700" />
                <span>অফার হাইড করুন</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-[#016831]" />
                <span>অফার চালু করুন</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 md:flex-initial px-6 py-2.5 bg-gradient-to-r from-[#016831] to-[#02833E] hover:from-[#02833E] hover:to-[#016831] text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#FAB116]" />
            <span>{loading ? 'সংরক্ষণ হচ্ছে...' : 'সেভ ও প্রকাশ করুন'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Settings Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-5">
          <h3 className="text-sm font-black text-[#016831] flex items-center gap-2 pb-3 border-b border-[#E8E2D5]">
            <Clock className="w-4 h-4 text-[#FAB116]" />
            <span>টাইমার ও শিরোনাম সেটিংস</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#016831] mb-1.5">
                প্রধান শিরোনাম (Title)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="আজকের ধামাকা অফার"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-xs font-semibold focus:outline-none focus:border-[#016831] focus:ring-1 focus:ring-[#016831]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#016831] mb-1.5">
                ব্যাজ টেক্সট (Badge)
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="ফ্ল্যাশ সেল"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-xs font-semibold focus:outline-none focus:border-[#016831] focus:ring-1 focus:ring-[#016831]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#016831] mb-1.5">
                অফারের সময়সীমা (ঘন্টায়)
              </label>
              <input
                type="number"
                min="1"
                max="72"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-xs font-semibold focus:outline-none focus:border-[#016831] focus:ring-1 focus:ring-[#016831]"
              />
              <p className="text-[11px] text-[#829289] mt-1">
                নির্দিষ্ট তারিখ না দিলে এই সময় চক্রাকারে চলবে (যেমন: ১২ ঘণ্টা)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#016831] mb-1.5">
                নির্দিষ্ট শেষ সময় (ঐচ্ছিক)
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] text-xs font-semibold focus:outline-none focus:border-[#016831] focus:ring-1 focus:ring-[#016831]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FEF9E7] border border-[#FDE68A] text-xs text-[#78350F] space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-[#FAB116]" />
                <span>লাইভ প্রিভিউ সারসংক্ষেপ</span>
              </div>
              <p>বর্তমানে মোট <strong>{selectedSlugs.length} টি</strong> পণ্য অফার তালিকায় যুক্ত আছে।</p>
            </div>
          </div>
        </div>

        {/* Right Column (Span 2): Products In Flash Sale & Product Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Products in Flash Sale with Custom Price Modifier */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <h3 className="text-sm font-black text-[#016831] flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-500 fill-current" />
                <span>অফারভুক্ত পণ্যসমূহ ({selectedSlugs.length} টি)</span>
              </h3>
              <span className="text-xs text-[#829289]">
                প্রতিটি পণ্যের জন্য স্পেশাল অফার মূল্য সেট করতে পারেন
              </span>
            </div>

            {selectedSlugs.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[#E8E2D5] rounded-2xl">
                <Flame className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-500">
                  এখনো কোনো পণ্য অফারে যোগ করা হয়নি
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  নিচের তালিকা থেকে পণ্য নির্বাচন করে &quot;অফারে যোগ করুন&quot; বাটনে ক্লিক করুন
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {selectedSlugs.map((slug) => {
                  const prod = allProducts.find((p) => p.slug === slug);
                  if (!prod) return null;

                  const custom = customOffers[slug];
                  const currentPrice = custom && custom.offerPrice ? custom.offerPrice : prod.price;
                  const original = prod.originalPrice || prod.price;
                  const discount = original > currentPrice
                    ? Math.round(((original - currentPrice) / original) * 100)
                    : 0;

                  return (
                    <div
                      key={slug}
                      className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#E8E2D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#016831]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-[#E8E2D5] flex-shrink-0">
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#016831] line-clamp-1">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-[#4A5B52] mt-0.5">
                            <span>মূল দাম: ৳{original}</span>
                            {discount > 0 && (
                              <span className="text-red-600 font-bold bg-red-100 px-1.5 py-0.2 rounded text-[10px]">
                                -{discount}% ছাড়
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Offer Price Input & Delete Button */}
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-[#016831]">অফার মূল্য ৳</span>
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => handleOfferPriceChange(slug, e.target.value)}
                            className="w-24 px-2 py-1.5 bg-white rounded-lg border border-[#E8E2D5] text-xs font-bold text-[#016831] focus:outline-none focus:border-[#016831]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(slug)}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="অফার থেকে বাদ দিন"
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

          {/* Product Catalog Picker */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E2D5]">
              <h3 className="text-sm font-black text-[#016831] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FAB116]" />
                <span>ক্যাটালগ থেকে নতুন পণ্য যোগ করুন</span>
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="পণ্য খুঁজুন..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5] text-xs font-semibold focus:outline-none focus:border-[#016831]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {availableToAdd.map((prod) => (
                <div
                  key={prod.slug}
                  className="p-2.5 bg-white rounded-2xl border border-[#E8E2D5] flex items-center justify-between gap-2 hover:border-[#016831]/50 hover:bg-[#FAF9F5] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </h5>
                      <p className="text-[11px] text-[#016831] font-bold">
                        ৳{prod.price} {prod.originalPrice > prod.price && <span className="line-through text-stone-400 font-normal text-[10px]">৳{prod.originalPrice}</span>}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddProduct(prod.slug)}
                    className="p-1.5 bg-[#016831] text-white hover:bg-[#02833E] rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 flex-shrink-0"
                    title="ধামাকা অফারে যুক্ত করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="text-[11px] pr-1">যোগ</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

