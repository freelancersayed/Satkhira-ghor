'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Edit3,
  Check,
  X,
  Save,
  Upload,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Smartphone,
  Sparkles,
  ShieldCheck,
  BarChart2,
  Type,
  Layers,
  RefreshCw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';
import { DEFAULT_SIDE_BANNER } from '@/components/home/HeroBanner';

export default function HeroBannerEditModal({
  defaultTab = 'slides',
  triggerText = 'ব্যানার এডিট করুন',
}) {
  const { user } = useAuthStore();
  const { content, updateSection } = useSiteContentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab); // 'slides' | 'sideBanner' | 'text' | 'badges'
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [notification, setNotification] = useState('');

  // 1st Banner URL modal state
  const [urlInput, setUrlInput] = useState('');
  const [showUrlAdd, setShowUrlAdd] = useState(false);

  // 2nd Banner URL input state
  const [sideBannerUrlInput, setSideBannerUrlInput] = useState('');
  const [showSideBannerUrlInput, setShowSideBannerUrlInput] = useState(false);

  // File input refs
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);
  const sideBannerFileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    badgeText: '',
    title: '',
    description: '',
    primaryBtnText: '',
    primaryBtnLink: '',
    secondaryBtnText: '',
    secondaryBtnLink: '',
    stat1Number: '',
    stat1Label: '',
    stat2Number: '',
    stat2Label: '',
    stat3Number: '',
    stat3Label: '',
    floatingBadge1Title: '',
    floatingBadge1Sub: '',
    floatingBadge2Title: '',
    floatingBadge2Sub: '',
    slides: [],
    sideBanner: {
      url: DEFAULT_SIDE_BANNER?.url || '',
      link: DEFAULT_SIDE_BANNER?.link || '/shop?cat=combos',
      label: DEFAULT_SIDE_BANNER?.label || 'স্পেশাল অফার',
      showOnMobile: true,
    },
  });

  // Only admins can see and edit
  if (!user || user.role !== 'admin') return null;

  const handleOpen = () => {
    const hero = content?.hero || {};

    // Normalize slides array to [{ url, label }]
    let initialSlides = [];
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      initialSlides = hero.slides
        .map((s) => {
          if (typeof s === 'string') return { url: s, label: '' };
          if (s && typeof s === 'object') return { url: s.url || '', label: s.label || '' };
          return { url: '', label: '' };
        })
        .filter((s) => s.url);
    }

    // Normalize side banner
    let initialSideBanner = {
      url: DEFAULT_SIDE_BANNER?.url || '',
      link: DEFAULT_SIDE_BANNER?.link || '/shop?cat=combos',
      label: DEFAULT_SIDE_BANNER?.label || 'স্পেশাল অফার',
      showOnMobile: true,
    };

    if (hero.sideBanner && typeof hero.sideBanner === 'object') {
      initialSideBanner = {
        url: hero.sideBanner.url || DEFAULT_SIDE_BANNER?.url || '',
        link: hero.sideBanner.link || DEFAULT_SIDE_BANNER?.link || '/shop?cat=combos',
        label: hero.sideBanner.label || DEFAULT_SIDE_BANNER?.label || 'স্পেশাল অফার',
        showOnMobile: hero.sideBanner.showOnMobile !== false,
      };
    } else if (typeof hero.sideBanner === 'string' && hero.sideBanner.trim()) {
      initialSideBanner = {
        url: hero.sideBanner.trim(),
        link: DEFAULT_SIDE_BANNER?.link || '/shop?cat=combos',
        label: DEFAULT_SIDE_BANNER?.label || 'স্পেশাল অফার',
        showOnMobile: true,
      };
    }

    setFormData({
      badgeText: hero.badgeText || 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার',
      title: hero.title || 'প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে',
      description:
        hero.description ||
        'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।',
      primaryBtnText: hero.primaryBtnText || 'পণ্য কিনুন',
      primaryBtnLink: hero.primaryBtnLink || '/shop',
      secondaryBtnText: hero.secondaryBtnText || 'আমাদের গল্প শুনুন',
      secondaryBtnLink: hero.secondaryBtnLink || '/about-us',
      stat1Number: hero.stat1Number || '১০০%',
      stat1Label: hero.stat1Label || 'প্রাকৃতিক ও খাঁটি',
      stat2Number: hero.stat2Number || 'সরাসরি',
      stat2Label: hero.stat2Label || 'শ্যামনগর ও সাতক্ষীরা থেকে সংগ্রহ',
      stat3Number: hero.stat3Number || 'ক্যাশ অন ডেলিভারি',
      stat3Label: hero.stat3Label || 'সারাদেশে হোম ডেলিভারি',
      floatingBadge1Title: hero.floatingBadge1Title || 'ল্যাব টেস্টে পরীক্ষিত',
      floatingBadge1Sub: hero.floatingBadge1Sub || 'শূন্য ভেজাল গ্যারান্টি',
      floatingBadge2Title: hero.floatingBadge2Title || 'খাঁটি গাওয়া ঘি',
      floatingBadge2Sub: hero.floatingBadge2Sub || 'দেশি গরুর দুধের ননী',
      slides: initialSlides,
      sideBanner: initialSideBanner,
    });

    setActiveTab(defaultTab || 'slides');
    setNotification('');
    setShowUrlAdd(false);
    setUrlInput('');
    setShowSideBannerUrlInput(false);
    setSideBannerUrlInput('');
    setIsOpen(true);
  };

  // Upload single file helper (Gallery / Camera / PC)
  const uploadSingleFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ');
    return data.url;
  };

  // ─────────────────────────────────────────────────────────────
  // 1st BANNER (SLIDER) ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      const newUploadedSlides = [];

      for (let i = 0; i < files.length; i++) {
        setUploadProgressText(`স্লাইড ছবি (${i + 1}/${files.length}) আপলোড হচ্ছে...`);
        const url = await uploadSingleFile(files[i]);
        if (url) {
          const rawName = files[i].name ? files[i].name.replace(/\.[^/.]+$/, '') : '';
          newUploadedSlides.push({
            url,
            label: rawName.length <= 25 ? rawName : '',
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        slides: [...prev.slides, ...newUploadedSlides],
      }));
      setNotification(`সফলভাবে ${newUploadedSlides.length}টি স্লাইড যুক্ত হয়েছে!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplaceUpload = async (e) => {
    const file = e.target.files?.[0];
    const index = replaceIndexRef.current;
    if (!file || index === null || index === undefined) return;

    try {
      setUploading(true);
      setUploadProgressText('ছবি প্রতিস্থাপন হচ্ছে...');
      const url = await uploadSingleFile(file);
      if (url) {
        setFormData((prev) => {
          const updated = [...prev.slides];
          updated[index] = { ...updated[index], url };
          return { ...prev, slides: updated };
        });
        setNotification('ছবি প্রতিস্থাপিত হয়েছে!');
        setTimeout(() => setNotification(''), 2500);
      }
    } catch (err) {
      alert('ছবি আপলোড ব্যর্থ: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgressText('');
      replaceIndexRef.current = null;
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      slides: [...prev.slides, { url: urlInput.trim(), label: '' }],
    }));
    setUrlInput('');
    setShowUrlAdd(false);
    setNotification('স্লাইড লিংক যুক্ত হয়েছে!');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleRemoveSlide = (index) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setFormData((prev) => {
      const updated = [...prev.slides];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return { ...prev, slides: updated };
    });
  };

  const handleMoveDown = (index) => {
    if (index === formData.slides.length - 1) return;
    setFormData((prev) => {
      const updated = [...prev.slides];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return { ...prev, slides: updated };
    });
  };

  const handleSlideLabelChange = (index, label) => {
    setFormData((prev) => {
      const updated = [...prev.slides];
      updated[index] = { ...updated[index], label };
      return { ...prev, slides: updated };
    });
  };

  // ─────────────────────────────────────────────────────────────
  // 2nd BANNER (SIDE BANNER) DIRECT GALLERY UPLOAD & ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleSideBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgressText('২নং ব্যানার ছবি আপলোড হচ্ছে...');
      const url = await uploadSingleFile(file);
      if (url) {
        const rawName = file.name ? file.name.replace(/\.[^/.]+$/, '') : '';
        setFormData((prev) => ({
          ...prev,
          sideBanner: {
            ...prev.sideBanner,
            url,
            label: prev.sideBanner?.label || (rawName.length <= 30 ? rawName : '২নং স্পেশাল ব্যানার'),
          },
        }));
        setNotification('২নং ব্যানার সফলভাবে গ্যালারি থেকে আপলোড হয়েছে! পরিবর্তন স্থায়ী করতে সেভ করুন।');
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert('২নং ব্যানার ছবি আপলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (sideBannerFileInputRef.current) sideBannerFileInputRef.current.value = '';
    }
  };

  const handleApplySideBannerUrl = (e) => {
    if (e) e.preventDefault();
    if (!sideBannerUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      sideBanner: {
        ...prev.sideBanner,
        url: sideBannerUrlInput.trim(),
      },
    }));
    setSideBannerUrlInput('');
    setShowSideBannerUrlInput(false);
    setNotification('২নং ব্যানার ছবির ওয়েব লিংক সফলভাবে যুক্ত হয়েছে!');
    setTimeout(() => setNotification(''), 2500);
  };

  const handleResetSideBanner = () => {
    if (!confirm('আপনি কি ২নং ব্যানার ডিফল্ট ছবিতে রিসেট করতে চান?')) return;
    setFormData((prev) => ({
      ...prev,
      sideBanner: {
        url: DEFAULT_SIDE_BANNER?.url || '',
        link: DEFAULT_SIDE_BANNER?.link || '/shop?cat=combos',
        label: DEFAULT_SIDE_BANNER?.label || 'স্পেশাল অফার',
        showOnMobile: true,
      },
    }));
    setNotification('২নং ব্যানার ডিফল্টে রিসেট করা হয়েছে!');
    setTimeout(() => setNotification(''), 2500);
  };

  // ─────────────────────────────────────────────────────────────
  // SAVE TO DATABASE
  // ─────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateSection('hero', formData);
      setNotification('ব্যানার সফলভাবে ডাটাবেসে সংরক্ষিত হয়েছে!');
      setTimeout(() => {
        setIsOpen(false);
        setNotification('');
      }, 900);
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* ── Trigger Button (Admin Only) ── */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpen();
        }}
        type="button"
        title="ব্যানারের ছবি ও লেখা পরিবর্তন করুন"
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-black/70 hover:bg-black/90 text-white rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black shadow-2xl border border-white/30 backdrop-blur-md transition-all duration-200 hover:scale-105 group"
      >
        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
        <span>{triggerText}</span>
        <span className="bg-[#F59E0B] text-slate-950 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black">
          Admin
        </span>
      </button>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*, .jpg, .jpeg, .png, .webp, .avif, .gif, .jfif, .svg, .bmp, .heic, .heif"
        multiple
        className="hidden"
        onChange={handleGalleryUpload}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*, .jpg, .jpeg, .png, .webp, .avif, .gif, .jfif, .svg, .bmp, .heic, .heif"
        className="hidden"
        onChange={handleReplaceUpload}
      />
      <input
        ref={sideBannerFileInputRef}
        type="file"
        accept="image/*, .jpg, .jpeg, .png, .webp, .avif, .gif, .jfif, .svg, .bmp, .heic, .heif"
        className="hidden"
        onChange={handleSideBannerUpload}
      />

      {/* ── Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
          <div className="bg-[#FCFAF7] rounded-[2rem] p-4 sm:p-7 max-w-3xl w-full border border-[#E8E2D5] shadow-2xl my-4 sm:my-6 space-y-4 max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#016831] text-[#F59E0B] flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#016831]">
                    হিরো ব্যানার ম্যানেজার
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    ১ম ও ২নং উভয় ব্যানার গ্যালারি থেকে সরাসরি আপলোড ও পরিবর্তন করুন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success / Status Notification */}
            {notification && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-fadeIn flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{notification}</span>
              </div>
            )}

            {/* Tab Navigation (4 Tabs) */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#EFE9DF] p-1.5 rounded-2xl flex-shrink-0 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('slides')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-1 ${
                  activeTab === 'slides'
                    ? 'bg-[#016831] text-white shadow-md'
                    : 'text-[#016831] hover:bg-white/60'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#F59E0B]" />
                <span>১ম স্লাইডার ({formData.slides?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sideBanner')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-1 ${
                  activeTab === 'sideBanner'
                    ? 'bg-[#016831] text-white shadow-md'
                    : 'text-[#016831] hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>২নং ব্যানার</span>
                <span className="hidden sm:inline-block text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                  গ্যালারি
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-1 ${
                  activeTab === 'text'
                    ? 'bg-[#016831] text-white shadow-md'
                    : 'text-[#016831] hover:bg-white/60'
                }`}
              >
                <Type className="w-4 h-4 text-[#F59E0B]" />
                <span>শিরোনাম ও বাটন</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap flex-1 ${
                  activeTab === 'badges'
                    ? 'bg-[#016831] text-white shadow-md'
                    : 'text-[#016831] hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>ব্যাজ ও ট্রাস্ট</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4">

              {/* ─── TAB 1: 1ST BANNER SLIDES & GALLERY UPLOAD ─────────── */}
              {activeTab === 'slides' && (
                <div className="space-y-4">
                  {/* Action Bar: Upload from phone/PC gallery */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#016831] flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#D97706]" />
                        <span>১ম ব্যানার স্লাইডার - ডিভাইস গ্যালারি থেকে ছবি যোগ</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        একসাথে এক বা একাধিক স্লাইড ছবি নির্বাচন করতে পারবেন
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgressText || 'আপলোড হচ্ছে...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>+ গ্যালারি থেকে ছবি যোগ করুন</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlAdd(!showUrlAdd)}
                        className="px-3 py-2.5 bg-[#FEF3C7] text-[#016831] hover:bg-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>URL লিংক</span>
                      </button>
                    </div>
                  </div>

                  {/* Add via URL mode */}
                  {showUrlAdd && (
                    <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center gap-2">
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/... অথবা ছবির সরাসরি লিংক পেস্ট করুন"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="px-4 py-2 bg-[#016831] text-white rounded-xl text-xs font-bold hover:bg-[#0D3528]"
                      >
                        যোগ করুন
                      </button>
                    </div>
                  )}

                  {/* Slides List */}
                  {formData.slides?.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-[#E8E2D5] p-6 space-y-2">
                      <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="text-xs sm:text-sm font-bold text-slate-600">
                        এখনও কোনো কাস্টম স্লাইড ছবি আপলোড করা হয়নি
                      </p>
                      <p className="text-[11px] text-slate-400">
                        উপরে &quot;+ গ্যালারি থেকে ছবি যোগ করুন&quot; বাটনে ক্লিক করে ব্যানার ছবি নির্বাচন করুন
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-500 flex items-center justify-between px-1">
                        <span>সক্রিয় স্লাইড তালিকা ({formData.slides.length}টি)</span>
                        <span className="text-[11px] text-amber-700">
                          স্বয়ংক্রিয়ভাবে একটির পর একটি প্রদর্শিত হবে
                        </span>
                      </div>

                      {formData.slides.map((slide, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-2xl p-3 border border-[#E8E2D5] shadow-xs flex items-center gap-3 sm:gap-4 hover:border-[#016831]/40 transition-all group"
                        >
                          {/* Slide Index Badge */}
                          <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#016831] text-xs font-black flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div className="relative w-16 h-12 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-[#E8E2D5] flex-shrink-0">
                            <img
                              src={slide.url}
                              alt={slide.label || `Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80';
                              }}
                            />
                          </div>

                          {/* Slide Title / Caption */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={slide.label || ''}
                              onChange={(e) => handleSlideLabelChange(index, e.target.value)}
                              placeholder="স্লাইড ক্যাপশন / লোকেশন (যেমন: সুন্দরবনের খাঁটি মধু)"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                            />
                            <p className="text-[10px] text-slate-400 truncate font-mono">
                              {slide.url}
                            </p>
                          </div>

                          {/* Actions: Reorder / Replace / Delete */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              title="উপরে নিন"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === formData.slides.length - 1}
                              title="নিচে নিন"
                              className="w-7 h-7 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                replaceIndexRef.current = index;
                                replaceFileInputRef.current?.click();
                              }}
                              title="ছবি প্রতিস্থাপন করুন"
                              className="w-7 h-7 rounded-lg text-amber-700 hover:bg-amber-100 flex items-center justify-center"
                            >
                              <Upload className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSlide(index)}
                              title="মুছে ফেলুন"
                              className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB 2: 2ND BANNER (SIDE BANNER) DIRECT GALLERY UPLOAD ── */}
              {activeTab === 'sideBanner' && (
                <div className="space-y-4">
                  {/* Action Bar: Direct Device Gallery Upload */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#016831] flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#D97706]" />
                        <span>২নং ব্যানার - ডিভাইস গ্যালারি থেকে সরাসরি আপলোড</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        মোবাইল গ্যালারি বা কম্পিউটার ফোল্ডার থেকে ছবি নির্বাচন করে সরাসরি পরিবর্তন করুন
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => sideBannerFileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgressText || 'আপলোড হচ্ছে...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>+ গ্যালারি থেকে নতুন ছবি আপলোড</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSideBannerUrlInput(!showSideBannerUrlInput)}
                        className="px-3 py-2.5 bg-[#FEF3C7] text-[#016831] hover:bg-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>URL লিংক</span>
                      </button>
                    </div>
                  </div>

                  {/* Add via URL mode */}
                  {showSideBannerUrlInput && (
                    <div className="p-3 bg-white rounded-2xl border border-amber-300 flex items-center gap-2 animate-fadeIn">
                      <input
                        type="url"
                        value={sideBannerUrlInput}
                        onChange={(e) => setSideBannerUrlInput(e.target.value)}
                        placeholder="https://... ছবির সরাসরি ওয়েব লিংক পেস্ট করুন"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <button
                        type="button"
                        onClick={handleApplySideBannerUrl}
                        className="px-4 py-2 bg-[#016831] text-white rounded-xl text-xs font-bold hover:bg-[#0D3528]"
                      >
                        প্রয়োগ করুন
                      </button>
                    </div>
                  )}

                  {/* Live Visual Preview Card */}
                  <div className="bg-white rounded-2xl p-4 border border-[#E8E2D5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="text-xs sm:text-sm font-bold text-[#016831]">
                          ২নং ব্যানারের লাইভ প্রিভিউ (বর্তমান রূপ)
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                        সাইড ব্যানার (Col 4)
                      </span>
                    </div>

                    <div className="relative w-full max-w-xs sm:max-w-sm mx-auto h-[240px] sm:h-[300px] rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-[#E8E2D5] group/preview">
                      {formData.sideBanner?.url ? (
                        <>
                          <img
                            src={formData.sideBanner.url}
                            alt={formData.sideBanner.label || '২নং ব্যানার'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-105"
                          />
                          {/* Hover Overlay with Action Buttons */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => sideBannerFileInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white/95 text-slate-900 hover:bg-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#016831]" />
                                <span>ছবি পরিবর্তন</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleResetSideBanner}
                                className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                                title="ডিফল্ট ব্যানারে ফেরত যান"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="text-white text-xs space-y-0.5">
                              <p className="font-bold truncate">
                                {formData.sideBanner.label || 'সাতক্ষীরা ঘর স্পেশাল অফার'}
                              </p>
                              <p className="text-[10px] text-amber-300 truncate font-mono">
                                {formData.sideBanner.link || '/shop?cat=combos'}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                          <ImageIcon className="w-12 h-12 text-slate-300" />
                          <p className="text-xs font-bold text-slate-600">কোনো ব্যানার ছবি নেই</p>
                          <button
                            type="button"
                            onClick={() => sideBannerFileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-[#016831] text-white rounded-xl text-xs font-bold"
                          >
                            গ্যালারি থেকে যোগ করুন
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image URL info */}
                    {formData.sideBanner?.url && (
                      <p className="text-[10px] text-slate-400 font-mono text-center truncate px-2">
                        {formData.sideBanner.url}
                      </p>
                    )}
                  </div>

                  {/* Banner Configuration Fields */}
                  <div className="p-4 bg-white rounded-2xl border border-[#E8E2D5] space-y-3.5">
                    {/* Banner Label / Alt Text */}
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ২নং ব্যানার ক্যাপশন / নাম (ALT Text)
                      </label>
                      <input
                        type="text"
                        value={formData.sideBanner?.label || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sideBanner: { ...prev.sideBanner, label: e.target.value },
                          }))
                        }
                        placeholder="যেমন: মধু স্পেশাল কম্বোপ্যাক অফার"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    {/* Redirect Link */}
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ব্যানার ক্লিক লিংক (ভিজিটর ক্লিক করলে যে পেজে যাবে)
                      </label>
                      <input
                        type="text"
                        value={formData.sideBanner?.link || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sideBanner: { ...prev.sideBanner, link: e.target.value },
                          }))
                        }
                        placeholder="/shop?cat=combos অথবা /products/product-name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-[#FCFAF7] text-xs text-slate-900 font-mono focus:outline-none focus:border-[#016831]"
                      />

                      {/* Quick Link Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-3 h-3 text-amber-500" /> দ্রুত লিংক বসান:
                        </span>
                        {[
                          { label: 'কম্বো অফার', link: '/shop?cat=combos' },
                          { label: 'সকল পণ্য', link: '/shop' },
                          { label: 'সুন্দরবনের মধু', link: '/products/sundarbans-pure-khalsi-honey' },
                          { label: 'দেশি গাওয়া ঘি', link: '/products/traditional-bilona-pure-cow-ghee' },
                          { label: 'সরিষার তেল', link: '/products/cold-pressed-mustard-oil-ghani' },
                        ].map((item) => (
                          <button
                            key={item.link}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                sideBanner: { ...prev.sideBanner, link: item.link },
                              }))
                            }
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                              formData.sideBanner?.link === item.link
                                ? 'bg-[#016831] text-white border-[#016831] font-bold shadow-xs'
                                : 'bg-[#FCFAF7] text-slate-700 border-slate-200 hover:border-[#016831] hover:text-[#016831]'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Visibility Option */}
                    <label className="flex items-center gap-3 p-3 bg-[#FCFAF7] rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.sideBanner?.showOnMobile !== false}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sideBanner: { ...prev.sideBanner, showOnMobile: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 accent-[#016831] rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#016831] block">
                          মোবাইল ফোনেও ২নং ব্যানার প্রদর্শন করুন
                        </span>
                        <span className="text-[10px] text-slate-500">
                          চালু থাকলে কম্পিউটার এবং মোবাইল উভয় ডিভাইসেই ১ম স্লাইডারের নিচে ২নং ব্যানার সুন্দরভাবে দৃশ্যমান থাকবে
                        </span>
                      </div>
                    </label>

                    {/* Pro Tip */}
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">টিপস / সাইজ পরামর্শ:</span>
                        <span>
                          ২নং সাইড ব্যানারের জন্য পোর্ট্রেট বা খাড়া সাইজের ছবি সবচেয়ে ভালো দেখায় (অনুমোদিত সাইজ: ৮০০ x ১০৫০ পিক্সেল অথবা ৩:৪ অনুপাত)।
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: TEXT & BUTTONS ─────────────────────────────── */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      টপ ব্যাজ লেখা
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      placeholder="সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  {/* Main Title */}
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      প্রধান শিরোনাম (Enter দিয়ে নতুন লাইন দিতে পারবেন)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#016831] mb-1">
                      বিস্তারিত বিবরণ
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                    />
                  </div>

                  {/* Primary CTA Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-[#E8E2D5]">
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ১ম বাটন টেক্সট (Primary CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.primaryBtnText}
                        onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                        placeholder="পণ্য কিনুন"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ১ম বাটন লিংক
                      </label>
                      <input
                        type="text"
                        value={formData.primaryBtnLink}
                        onChange={(e) => setFormData({ ...formData, primaryBtnLink: e.target.value })}
                        placeholder="/shop"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>

                  {/* Secondary CTA Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-[#E8E2D5]">
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ২য় বাটন টেক্সট (Secondary CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryBtnText}
                        onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                        placeholder="আমাদের গল্প শুনুন"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#016831] mb-1">
                        ২য় বাটন লিংক
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryBtnLink}
                        onChange={(e) => setFormData({ ...formData, secondaryBtnLink: e.target.value })}
                        placeholder="/about-us"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 4: TRUST BADGES & STATS ───────────────────────── */}
              {activeTab === 'badges' && (
                <div className="space-y-4">
                  {/* Floating Trust Badges */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                    <h4 className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                      <span>ডানপাশের ফ্লোটিং ট্রাস্ট ব্যাজ (ডেস্কটপ)</span>
                    </h4>

                    {/* Badge 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.floatingBadge1Title}
                        onChange={(e) => setFormData({ ...formData, floatingBadge1Title: e.target.value })}
                        placeholder="১ম ব্যাজ শিরোনাম (যেমন: ল্যাব টেস্টে পরীক্ষিত)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <input
                        type="text"
                        value={formData.floatingBadge1Sub}
                        onChange={(e) => setFormData({ ...formData, floatingBadge1Sub: e.target.value })}
                        placeholder="১ম ব্যাজ সাবটাইটেল (যেমন: শূন্য ভেজাল গ্যারান্টি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    {/* Badge 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.floatingBadge2Title}
                        onChange={(e) => setFormData({ ...formData, floatingBadge2Title: e.target.value })}
                        placeholder="২য় ব্যাজ শিরোনাম (যেমন: খাঁটি গাওয়া ঘি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <input
                        type="text"
                        value={formData.floatingBadge2Sub}
                        onChange={(e) => setFormData({ ...formData, floatingBadge2Sub: e.target.value })}
                        placeholder="২য় ব্যাজ সাবটাইটেল (যেমন: দেশি গরুর দুধের ননী)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>

                  {/* 3 Quick Stats */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                    <h4 className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-[#D97706]" />
                      <span>৩টি কুইক স্ট্যাটাস (Quick Statistics)</span>
                    </h4>

                    {/* Stat 1 */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.stat1Number}
                        onChange={(e) => setFormData({ ...formData, stat1Number: e.target.value })}
                        placeholder="স্ট্যাট ১ মান (১০০%)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <input
                        type="text"
                        value={formData.stat1Label}
                        onChange={(e) => setFormData({ ...formData, stat1Label: e.target.value })}
                        placeholder="স্ট্যাট ১ লেবেল (প্রাকৃতিক ও খাঁটি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.stat2Number}
                        onChange={(e) => setFormData({ ...formData, stat2Number: e.target.value })}
                        placeholder="স্ট্যাট ২ মান (সরাসরি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <input
                        type="text"
                        value={formData.stat2Label}
                        onChange={(e) => setFormData({ ...formData, stat2Label: e.target.value })}
                        placeholder="স্ট্যাট ২ লেবেল (শ্যামনগর ও সাতক্ষীরা থেকে সংগ্রহ)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                    </div>

                    {/* Stat 3 */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.stat3Number}
                        onChange={(e) => setFormData({ ...formData, stat3Number: e.target.value })}
                        placeholder="স্ট্যাট ৩ মান (২৪-৪৮ ঘণ্টা)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                      <input
                        type="text"
                        value={formData.stat3Label}
                        onChange={(e) => setFormData({ ...formData, stat3Label: e.target.value })}
                        placeholder="স্ট্যাট ৩ লেবেল (সারাদেশে ডেলিভারি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#016831]"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-[#E8E2D5] flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E8E2D5] text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>পরিবর্তন ডাটাবেসে সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
