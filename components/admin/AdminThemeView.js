'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Palette,
  Check,
  RotateCcw,
  Save,
  Sparkles,
  Eye,
  ShoppingBag,
  Star,
  CheckCircle2,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';

export const DEFAULT_THEME = {
  primary: '#016831',
  secondary: '#FAB116',
  buttonBg: '#016831',
  buttonText: '#FFFFFF',
  textColor: '#14241E',
  textHover: '#02833E',
  buttonHoverBg: '#014D24',
};

// ─────────────────────────────────────────────────────────────
// জনপ্রিয় শীর্ষস্থানীয় ই-কমার্স ভিত্তিক রেডিমেড থিম প্রিসেট
// ─────────────────────────────────────────────────────────────
const POPULAR_ECOMMERCE_PRESETS = [
  {
    id: 'satkhira-default',
    name: 'সাতক্ষীরা ঘর (অফিসিয়াল)',
    tag: 'Official',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    theme: {
      primary: '#016831',
      secondary: '#FAB116',
      buttonBg: '#016831',
      buttonText: '#FFFFFF',
      textColor: '#14241E',
      textHover: '#02833E',
      buttonHoverBg: '#014D24',
    },
  },
  {
    id: 'pollibazar-ghorerbazar',
    name: 'পল্লী বাজার / ঘরের বাজার',
    tag: 'Trending',
    badgeBg: 'bg-amber-100 text-amber-800',
    theme: {
      primary: '#E86A1E',
      secondary: '#016831',
      buttonBg: '#E86A1E',
      buttonText: '#FFFFFF',
      textColor: '#1F2937',
      textHover: '#C05621',
      buttonHoverBg: '#C05621',
    },
  },
  {
    id: 'daraz-bd',
    name: 'দারাজ (Daraz BD)',
    tag: 'Daraz',
    badgeBg: 'bg-orange-100 text-orange-800',
    theme: {
      primary: '#F85606',
      secondary: '#002F6C',
      buttonBg: '#F85606',
      buttonText: '#FFFFFF',
      textColor: '#212121',
      textHover: '#F85606',
      buttonHoverBg: '#D94500',
    },
  },
  {
    id: 'chaldal-organic',
    name: 'চালডাল (Chaldal)',
    tag: 'Grocery',
    badgeBg: 'bg-teal-100 text-teal-800',
    theme: {
      primary: '#008060',
      secondary: '#FF6B00',
      buttonBg: '#008060',
      buttonText: '#FFFFFF',
      textColor: '#1E293B',
      textHover: '#00664D',
      buttonHoverBg: '#00664D',
    },
  },
  {
    id: 'shwapno-super',
    name: 'স্বপ্ন (Shwapno)',
    tag: 'Super Shop',
    badgeBg: 'bg-green-100 text-green-800',
    theme: {
      primary: '#00843D',
      secondary: '#E50019',
      buttonBg: '#00843D',
      buttonText: '#FFFFFF',
      textColor: '#111827',
      textHover: '#00632E',
      buttonHoverBg: '#00632E',
    },
  },
  {
    id: 'aarong-heritage',
    name: 'আড়ং (Aarong Heritage)',
    tag: 'Premium',
    badgeBg: 'bg-rose-100 text-rose-800',
    theme: {
      primary: '#881337',
      secondary: '#F59E0B',
      buttonBg: '#881337',
      buttonText: '#FFFFFF',
      textColor: '#1C1917',
      textHover: '#9F1239',
      buttonHoverBg: '#6F0D2B',
    },
  },
  {
    id: 'amazon-prime',
    name: 'আমাজন (Amazon Prime)',
    tag: 'Global',
    badgeBg: 'bg-slate-200 text-slate-800',
    theme: {
      primary: '#232F3E',
      secondary: '#FF9900',
      buttonBg: '#FF9900',
      buttonText: '#111827',
      textColor: '#0F1111',
      textHover: '#C7511F',
      buttonHoverBg: '#E68A00',
    },
  },
  {
    id: 'deep-sundarbans',
    name: 'খাঁটি সুন্দরবন ফরেস্ট',
    tag: 'Raw Organic',
    badgeBg: 'bg-emerald-100 text-emerald-900',
    theme: {
      primary: '#0A3A2A',
      secondary: '#F59E0B',
      buttonBg: '#0A3A2A',
      buttonText: '#FFFFFF',
      textColor: '#0B2017',
      textHover: '#135E44',
      buttonHoverBg: '#06251A',
    },
  },
];

export default function AdminThemeView({ showNotification }) {
  const { content, updateSection, fetchContent } = useSiteContentStore();
  const [themeState, setThemeState] = useState(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  // ── Brand Logo State & Handlers ──
  const [brandState, setBrandState] = useState({
    name: 'সাতক্ষীরা ঘর',
    tagline: 'Satkhira Ghor • Pure & Organic',
    logoChar: 'স',
    logo: '/uploads/upload_1795353755877_oioatm.png',
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (content?.theme) {
      setThemeState({
        ...DEFAULT_THEME,
        ...content.theme,
      });
    }
    if (content?.brand) {
      setBrandState((prev) => ({
        ...prev,
        ...content.brand,
      }));
    }
  }, [content?.theme, content?.brand]);

  // Handle uploading logo file from browser/phone
  const handleFileUpload = async (file) => {
    if (!file) return;

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|jfif|svg)$/i.test(file.name || '');

    if (!isImage) {
      if (showNotification) {
        showNotification('শুধুমাত্র ছবি (PNG, JPG, WEBP, SVG) ফাইল সমর্থনযোগ্য', 'error');
      }
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      if (showNotification) {
        showNotification('ছবির সাইজ সর্বোচ্চ ২০MB হতে পারবে', 'error');
      }
      return;
    }

    try {
      setLogoUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ হয়েছে');

      const newUrl = data.url;
      const updatedBrand = { ...brandState, logo: newUrl };
      setBrandState(updatedBrand);

      // Auto-save brand to database immediately
      await updateSection('brand', updatedBrand);
      if (showNotification) {
        showNotification('নতুন লোগো সফলভাবে আপলোড ও সেভ করা হয়েছে! ওয়েবসাইটে এখন লাইভ 🎉', 'success');
      }
    } catch (err) {
      if (showNotification) {
        showNotification('লোগো আপলোড ব্যর্থ: ' + err.message, 'error');
      }
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyCustomUrl = async () => {
    const url = customLogoUrl.trim();
    if (!url) return;
    try {
      setSavingBrand(true);
      const updatedBrand = { ...brandState, logo: url };
      setBrandState(updatedBrand);
      await updateSection('brand', updatedBrand);
      setCustomLogoUrl('');
      if (showNotification) {
        showNotification('লোগো লিংক সফলভাবে সেভ করা হয়েছে! 🎉', 'success');
      }
    } catch (err) {
      if (showNotification) {
        showNotification('সেভ ব্যর্থ: ' + err.message, 'error');
      }
    } finally {
      setSavingBrand(false);
    }
  };

  const handleResetLogo = async () => {
    if (!confirm('লোগোটি পূর্বের ডিফল্ট লোগোতে রিস্টোর করতে চান?')) return;
    try {
      setSavingBrand(true);
      const defaultLogo = '/uploads/upload_1795353755877_oioatm.png';
      const updatedBrand = { ...brandState, logo: defaultLogo };
      setBrandState(updatedBrand);
      await updateSection('brand', updatedBrand);
      if (showNotification) {
        showNotification('ডিফল্ট লোগো সফলভাবে রিস্টোর হয়েছে!', 'success');
      }
    } catch (err) {
      if (showNotification) {
        showNotification('রিস্টোর ব্যর্থ: ' + err.message, 'error');
      }
    } finally {
      setSavingBrand(false);
    }
  };

  const handleColorChange = (key, value) => {
    setThemeState((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'buttonBg' && !prev.buttonHoverBg) {
        updated.buttonHoverBg = value;
      }
      return updated;
    });
    setActivePreset(null);
  };

  const handleApplyPreset = (preset) => {
    setThemeState(preset.theme);
    setActivePreset(preset.id);
    if (showNotification) {
      showNotification(`"${preset.name}" থিমটি নির্বাচন করা হয়েছে। সেভ বাটনে চাপ দিন।`, 'success');
    }
  };

  const handleResetDefault = () => {
    if (confirm('অফিসিয়াল সাতক্ষীরা ঘর ডিফল্ট কালারে রিসেট করতে চান?')) {
      setThemeState(DEFAULT_THEME);
      setActivePreset('satkhira-default');
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      await updateSection('theme', themeState);
      if (showNotification) {
        showNotification('ওয়েবসাইটের কালার থিম সফলভাবে অনলাইন ও সবার জন্য সেভ হয়েছে! 🎉', 'success');
      }
    } catch (err) {
      if (showNotification) {
        showNotification('সেভ করতে সমস্যা হয়েছে: ' + err.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Compact color items definition for mobile grid
  const colorItems = [
    {
      key: 'primary',
      title: 'প্রাইমারি কালার',
      sub: 'হেডার, ফুটার, বটম বার',
      fallback: '#016831',
    },
    {
      key: 'secondary',
      title: 'সেকেন্ডারি / হানি',
      sub: 'ব্যাজ, অফার, স্টার',
      fallback: '#FAB116',
    },
    {
      key: 'buttonBg',
      title: 'বাটন ব্যাকগ্রাউন্ড',
      sub: 'অর্ডার ও কার্ট বাটন',
      fallback: '#016831',
    },
    {
      key: 'buttonText',
      title: 'বাটন টেক্সট',
      sub: 'বাটনের লেখার রঙ',
      fallback: '#FFFFFF',
    },
    {
      key: 'buttonHoverBg',
      title: 'বাটন হোভার',
      sub: 'বাটনে মাউস নিলে',
      fallback: '#014D24',
    },
    {
      key: 'textColor',
      title: 'মূল টেক্সট',
      sub: 'টাইটেল ও সাধারণ লেখা',
      fallback: '#14241E',
    },
    {
      key: 'textHover',
      title: 'টেক্সট হোভার',
      sub: 'লিংকে মাউস নিলে',
      fallback: '#02833E',
    },
  ];

  return (
    <div className="space-y-4 pb-20 sm:pb-6 animate-fadeIn">
      {/* ── ১. কমপ্যাক্ট মোবাইল-ফ্রেন্ডলি হেডার (Ultra-Compact Header) ── */}
      <div className="bg-white px-3.5 py-3 sm:p-5 rounded-2xl border border-[#E8E2D5] shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#016831] text-[#FAB116] flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-base font-black text-stone-900 leading-tight">
              কালার, থিম ও লোগো কন্ট্রোল
            </h2>
            <p className="text-[10px] text-stone-500 leading-none mt-0.5">
              লাইভ ব্র্যান্ডিং কাস্টমাইজেশন ও প্রিভিউ
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefault}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 active:scale-95 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>ডিফল্ট থিম</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white text-xs font-black shadow-xs transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#FAB116]" />
            )}
            <span>{saving ? 'সেভ হচ্ছে...' : 'থিম সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* ── ১.৫. ব্র্যান্ড লোগো ব্যবস্থাপনা ও ফাইল আপলোডার (Brand Logo Manager) ── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#014D24] to-[#016831] text-[#FAB116] flex items-center justify-center font-bold shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-stone-900 leading-tight flex items-center gap-2">
                <span>ব্র্যান্ড লোগো আপলোড ও পরিবর্তন</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  হেডার ও ফুটার
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                কম্পিউটার বা মোবাইল গ্যালারি থেকে সরাসরি নতুন লোগো আপলোড করুন
              </p>
            </div>
          </div>

          {brandState.logo !== '/uploads/upload_1795353755877_oioatm.png' && (
            <button
              type="button"
              onClick={handleResetLogo}
              disabled={savingBrand}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs font-bold transition-all active:scale-95"
              title="ডিফল্ট লোগো রিস্টোর করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ডিফল্ট লোগো রিস্টোর</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: Active Logo Previews (5 cols) */}
          <div className="lg:col-span-5 bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[11px] font-bold text-stone-700 block mb-2">
                বর্তমান লোগো প্রিভিউ:
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Header Dark Green Background Simulation */}
                <div
                  className="rounded-xl p-3 flex flex-col items-center justify-center text-center border border-[#016831] relative overflow-hidden shadow-xs min-h-[105px]"
                  style={{ backgroundColor: themeState.primary || '#014D24' }}
                >
                  <span className="text-[9px] font-bold text-emerald-200/90 mb-1.5">
                    হেডার প্রিভিউ
                  </span>
                  <div className="w-14 h-14 relative flex-shrink-0">
                    <Image
                      src={brandState.logo || '/uploads/upload_1795353755877_oioatm.png'}
                      alt="লোগো প্রিভিউ"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* 2. Light Theme Background Simulation */}
                <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center text-center border border-stone-200 relative overflow-hidden shadow-xs min-h-[105px]">
                  <span className="text-[9px] font-bold text-stone-500 mb-1.5">
                    সাদা ব্যাকগ্রাউন্ড
                  </span>
                  <div className="w-14 h-14 relative flex-shrink-0">
                    <Image
                      src={brandState.logo || '/uploads/upload_1795353755877_oioatm.png'}
                      alt="লোগো প্রিভিউ"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between text-[10px] text-stone-500">
              <span className="truncate max-w-[200px]" title={brandState.logo}>
                উৎস: {brandState.logo}
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                সক্রিয়
              </span>
            </div>
          </div>

          {/* Right: Upload Dropzone & Action Controls (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp, image/svg+xml, image/avif"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files?.[0])}
            />

            {/* Clickable Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${
                logoUploading
                  ? 'border-emerald-500 bg-emerald-50/50 cursor-wait'
                  : 'border-emerald-300 hover:border-[#016831] bg-[#FAF9F5] hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 shadow-xs flex items-center justify-center text-[#016831] group-hover:scale-110 transition-transform mb-2">
                {logoUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#016831]" />
                ) : (
                  <Upload className="w-6 h-6 text-[#016831]" />
                )}
              </div>

              <div className="font-bold text-xs sm:text-sm text-stone-800">
                {logoUploading ? (
                  <span className="text-[#016831] animate-pulse">
                    লোগো আপলোড ও সাইটে সেট হচ্ছে...
                  </span>
                ) : (
                  <span>নতুন লোগো ছবি নির্বাচন করুন</span>
                )}
              </div>
              <p className="text-[10px] text-stone-500 mt-1 max-w-xs">
                ক্লিক করে মোবাইল বা পিসি থেকে ছবি সিলেক্ট করুন (PNG, JPG, WEBP, SVG)
              </p>
              <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-amber-900 border border-amber-300/60">
                💡 সেরা লুকের জন্য স্বচ্ছ (Transparent PNG) ব্যাকগ্রাউন্ড ব্যবহার করুন
              </span>
            </div>

            {/* Direct URL Input Option */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="অথবা সরাসরি ছবির লিংক (URL) পেস্ট করুন..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-stone-300 focus:border-[#016831] outline-hidden pr-8 text-stone-800"
                />
                <LinkIcon className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customLogoUrl.trim() || savingBrand}
                className="px-3 py-2 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap"
              >
                প্রয়োগ করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ২. জনপ্রিয় শীর্ষস্থানীয় ইকমার্স ওয়েবসাইট প্রিসেটস (E-commerce Presets Carousel / Grid) ── */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-800">
            <Sparkles className="w-3.5 h-3.5 text-[#FAB116]" />
            <span>জনপ্রিয় ইকমার্স থিম সমূহ (১-ক্লিক প্রিসেট)</span>
          </div>
          <span className="text-[9px] text-stone-400 font-bold hidden sm:inline">
            ক্লিক করলেই কালার সেট হবে
          </span>
        </div>

        {/* Mobile Horizontal Swipeable + Desktop Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {POPULAR_ECOMMERCE_PRESETS.map((preset) => {
            const isSelected =
              activePreset === preset.id ||
              (themeState.primary === preset.theme.primary &&
                themeState.secondary === preset.theme.secondary &&
                themeState.buttonBg === preset.theme.buttonBg);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-2 rounded-xl border transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/80 border-[#016831] shadow-xs ring-1 ring-[#016831]'
                    : 'bg-[#FAF9F5] border-stone-200/90 hover:border-stone-300 active:scale-98'
                }`}
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-[11px] font-black text-stone-800 truncate leading-tight">
                    {preset.name}
                  </span>
                  {isSelected && (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#016831] text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Color Swatch Dots Bar */}
                <div className="flex items-center gap-1 pt-0.5">
                  <span
                    className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.primary }}
                    title="Primary"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.secondary }}
                    title="Secondary"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.buttonBg }}
                    title="Button"
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-2xs"
                    style={{ backgroundColor: preset.theme.textColor }}
                    title="Text"
                  />
                  <span className="text-[9px] text-stone-400 font-mono ml-auto">
                    {preset.theme.primary}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ৩. লাইভ আল্ট্রা-কমপ্যাক্ট প্রিভিউ বার (Live Compact Preview) ── */}
      <div className="bg-white p-3 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-extrabold text-stone-800">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#016831]" />
            <span>লাইভ প্রিভিউ (রিয়েল-টাইম লুক)</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
            লাইভ
          </span>
        </div>

        {/* Compact Sample Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          {/* Mini Header Preview (4 Cols) */}
          <div
            className="sm:col-span-4 p-2 rounded-xl text-white flex items-center justify-between transition-colors shadow-2xs"
            style={{ backgroundColor: themeState.primary }}
          >
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px]"
                style={{ backgroundColor: themeState.secondary, color: '#000' }}
              >
                স
              </div>
              <span className="text-xs font-black truncate">
                সাতক্ষীরা <span style={{ color: themeState.secondary }}>ঘর</span>
              </span>
            </div>
            <div
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: themeState.secondary, color: '#000' }}
            >
              কার্ট ৩
            </div>
          </div>

          {/* Mini Card & Action Button Preview (8 Cols) */}
          <div className="sm:col-span-8 p-2 rounded-xl bg-[#FAF9F5] border border-stone-200 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[8px] font-black px-1 rounded-sm"
                  style={{ backgroundColor: themeState.secondary, color: '#000' }}
                >
                  অফার
                </span>
                <span
                  className="text-xs font-bold truncate block transition-colors"
                  style={{ color: themeState.textColor }}
                >
                  সুন্দরবনের খাঁটি মধু
                </span>
              </div>
              <div className="text-[10px] font-black mt-0.5" style={{ color: themeState.primary }}>
                ৳১,২৫০
              </div>
            </div>

            {/* Live Button Preview */}
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-black shadow-xs flex items-center gap-1 flex-shrink-0 transition-colors"
              style={{
                backgroundColor: themeState.buttonBg,
                color: themeState.buttonText,
              }}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>অর্ডার</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ৪. আল্ট্রা-কমপ্যাক্ট কালার পিকার গ্রিড (মোবাইলে স্ক্রোল কমানোর জন্য ২-কলাম গ্রিড) ── */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-stone-800">
            <Palette className="w-3.5 h-3.5 text-[#016831]" />
            <span>কালার পিকার ও হেক্স কোড (Custom Colors)</span>
          </div>
          <span className="text-[10px] text-stone-400 font-bold">৭ টি কালার</span>
        </div>

        {/* 2-Columns on Mobile, 3-4 Columns on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {colorItems.map((item) => {
            const currentColor = themeState[item.key] || item.fallback;
            return (
              <div
                key={item.key}
                className="p-2 sm:p-2.5 rounded-xl bg-[#FAF9F5] border border-stone-200/80 hover:border-stone-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <label className="text-[11px] font-bold text-stone-900 block truncate leading-tight">
                    {item.title}
                  </label>
                  <p className="text-[9px] text-stone-500 truncate leading-none mt-0.5 mb-1.5">
                    {item.sub}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Native Color Picker Swatch */}
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden border border-stone-300 shadow-2xs flex-shrink-0 cursor-pointer">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => handleColorChange(item.key, e.target.value)}
                      className="absolute -top-3 -left-3 w-14 h-14 cursor-pointer border-0 p-0"
                      title="কালার পছন্দ করুন"
                    />
                  </div>

                  {/* Compact Hex Input */}
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleColorChange(item.key, e.target.value)}
                    placeholder="#000000"
                    maxLength={7}
                    className="w-full min-w-0 px-1.5 py-1 rounded-md bg-white border border-stone-300 focus:border-[#016831] outline-hidden font-mono text-[11px] font-bold uppercase text-stone-800 shadow-2xs text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ৫. মোবাইলের জন্য স্টিকি বটম অ্যাকশন বার (Sticky Mobile Save Bar) ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 px-3 flex items-center justify-between gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleResetDefault}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 active:scale-95 text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ডিফল্ট</span>
        </button>

        <button
          type="button"
          onClick={handleSaveTheme}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: themeState.buttonBg,
            color: themeState.buttonText,
          }}
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'এই থিম সক্রিয় করুন'}</span>
        </button>
      </div>
    </div>
  );
}
