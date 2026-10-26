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
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';

export default function HeroBannerEditModal() {
  const { user } = useAuthStore();
  const { content, updateSection } = useSiteContentStore();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' | 'text' | 'badges'
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [notification, setNotification] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlAdd, setShowUrlAdd] = useState(false);

  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const replaceIndexRef = useRef(null);

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
  });

  // Only admins can see and edit
  if (!user || user.role !== 'admin') return null;

  const handleOpen = () => {
    const hero = content?.hero || {};

    // Normalize slides array to [{ url, label }]
    let initialSlides = [];
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      initialSlides = hero.slides.map((s) => {
        if (typeof s === 'string') return { url: s, label: '' };
        if (s && typeof s === 'object') return { url: s.url || '', label: s.label || '' };
        return { url: '', label: '' };
      }).filter((s) => s.url);
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
      stat2Number: hero.stat2Number || '১২,৫০০+',
      stat2Label: hero.stat2Label || 'সন্তুষ্ট পরিবার',
      stat3Number: hero.stat3Number || '২৪-৪৮ ঘণ্টা',
      stat3Label: hero.stat3Label || 'সারাদেশে ডেলিভারি',
      floatingBadge1Title: hero.floatingBadge1Title || 'ল্যাব টেস্টে পরীক্ষিত',
      floatingBadge1Sub: hero.floatingBadge1Sub || 'শূন্য ভেজাল গ্যারান্টি',
      floatingBadge2Title: hero.floatingBadge2Title || 'খাঁটি গাওয়া ঘি',
      floatingBadge2Sub: hero.floatingBadge2Sub || 'দেশি গরুর দুধের ননী',
      slides: initialSlides,
    });

    setActiveTab('slides');
    setNotification('');
    setShowUrlAdd(false);
    setUrlInput('');
    setIsOpen(true);
  };

  // Upload single file helper
  const uploadSingleFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ');
    return data.url;
  };

  // Direct Gallery Upload (multiple files supported)
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);
      const newUploadedSlides = [];

      for (let i = 0; i < files.length; i++) {
        setUploadProgressText(`ছবি (${i + 1}/${files.length}) আপলোড হচ্ছে...`);
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
      setNotification(`সফলভাবে ${newUploadedSlides.length}টি ছবি যুক্ত হয়েছে!`);
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      alert('ছবি আপলোড করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Replace a specific slide image from gallery
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

  // Add slide via direct URL
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

  // Remove slide
  const handleRemoveSlide = (index) => {
    setFormData((prev) => ({
      ...prev,
      slides: prev.slides.filter((_, i) => i !== index),
    }));
  };

  // Move slide up
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

  // Move slide down
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

  // Update slide label
  const handleSlideLabelChange = (index, label) => {
    setFormData((prev) => {
      const updated = [...prev.slides];
      updated[index] = { ...updated[index], label };
      return { ...prev, slides: updated };
    });
  };

  // Save changes to database
  const handleSave = async (e) => {
    e.preventDefault();
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
      {/* ── Trigger Button ── */}
      <button
        onClick={handleOpen}
        type="button"
        title="ব্যানারের ছবি ও লেখা পরিবর্তন করুন"
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-black/60 hover:bg-black/80 text-white rounded-2xl text-xs font-black shadow-2xl border border-white/30 backdrop-blur-md transition-all duration-200 hover:scale-105 group"
      >
        <Edit3 className="w-4 h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
        <span>ব্যানার এডিট করুন</span>
        <span className="bg-[#F59E0B] text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
          Admin
        </span>
      </button>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleGalleryUpload}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceUpload}
      />

      {/* ── Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#FCFAF7] rounded-[2rem] p-5 sm:p-8 max-w-3xl w-full border border-[#E8E2D5] shadow-2xl my-6 space-y-5 max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#E8E2D5] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0F3D2E] text-[#F59E0B] flex items-center justify-center shadow-md">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0F3D2E]">
                    হিরো ব্যানার ম্যানেজার
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    গ্যালারি থেকে সরাসরি ছবি আপলোড এবং সকল টেক্সট ডাইনামিক ভাবে পরিবর্তন করুন
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

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-[#EFE9DF] p-1.5 rounded-2xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('slides')}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'slides'
                    ? 'bg-[#0F3D2E] text-white shadow-md'
                    : 'text-[#0F3D2E] hover:bg-white/60'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#F59E0B]" />
                <span>ছবি ও স্লাইডার ({formData.slides?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'text'
                    ? 'bg-[#0F3D2E] text-white shadow-md'
                    : 'text-[#0F3D2E] hover:bg-white/60'
                }`}
              >
                <Type className="w-4 h-4 text-[#F59E0B]" />
                <span>শিরোনাম ও বাটন</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('badges')}
                className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'badges'
                    ? 'bg-[#0F3D2E] text-white shadow-md'
                    : 'text-[#0F3D2E] hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>ব্যাজ ও স্ট্যাটাস</span>
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="overflow-y-auto pr-1 flex-1 space-y-4">

              {/* ─── TAB 1: SLIDES & GALLERY UPLOAD ─────────────────────── */}
              {activeTab === 'slides' && (
                <div className="space-y-4">
                  {/* Action Bar: Upload from phone/PC gallery */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E8E2D5] shadow-xs">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#0F3D2E] flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#D97706]" />
                        <span>ডিভাইস গ্যালারি / ফোল্ডার থেকে ছবি আপলোড</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        একসাথে এক বা একাধিক ছবি নির্বাচন করতে পারবেন
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
                        className="px-3 py-2.5 bg-[#FEF3C7] text-[#0F3D2E] hover:bg-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
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
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <button
                        type="button"
                        onClick={handleAddUrl}
                        className="px-4 py-2 bg-[#0F3D2E] text-white rounded-xl text-xs font-bold hover:bg-[#0D3528]"
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
                        এখনও কোনো কাস্টম ব্যানার ছবি আপলোড করা হয়নি
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
                          className="bg-white rounded-2xl p-3 border border-[#E8E2D5] shadow-xs flex items-center gap-3 sm:gap-4 hover:border-[#0F3D2E]/40 transition-all group"
                        >
                          {/* Slide Index Badge */}
                          <div className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#0F3D2E] text-xs font-black flex items-center justify-center flex-shrink-0">
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
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
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

              {/* ─── TAB 2: TEXT & BUTTONS ─────────────────────────────── */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                      টপ ব্যাজ লেখা
                    </label>
                    <input
                      type="text"
                      value={formData.badgeText}
                      onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                      placeholder="সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </div>

                  {/* Main Title */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                      প্রধান শিরোনাম (Enter দিয়ে নতুন লাইন দিতে পারবেন)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                      বিস্তারিত বিবরণ
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                    />
                  </div>

                  {/* Primary CTA Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-[#E8E2D5]">
                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        ১ম বাটন টেক্সট (Primary CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.primaryBtnText}
                        onChange={(e) => setFormData({ ...formData, primaryBtnText: e.target.value })}
                        placeholder="পণ্য কিনুন"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        ১ম বাটন লিংক
                      </label>
                      <input
                        type="text"
                        value={formData.primaryBtnLink}
                        onChange={(e) => setFormData({ ...formData, primaryBtnLink: e.target.value })}
                        placeholder="/shop"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>
                  </div>

                  {/* Secondary CTA Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-2xl border border-[#E8E2D5]">
                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        ২য় বাটন টেক্সট (Secondary CTA)
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryBtnText}
                        onChange={(e) => setFormData({ ...formData, secondaryBtnText: e.target.value })}
                        placeholder="আমাদের গল্প শুনুন"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F3D2E] mb-1">
                        ২য় বাটন লিংক
                      </label>
                      <input
                        type="text"
                        value={formData.secondaryBtnLink}
                        onChange={(e) => setFormData({ ...formData, secondaryBtnLink: e.target.value })}
                        placeholder="/about-us"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-[#FCFAF7] text-xs text-slate-900 focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── TAB 3: TRUST BADGES & STATS ───────────────────────── */}
              {activeTab === 'badges' && (
                <div className="space-y-4">
                  {/* Floating Trust Badges */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                    <h4 className="text-xs font-bold text-[#0F3D2E] flex items-center gap-1.5">
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
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        type="text"
                        value={formData.floatingBadge1Sub}
                        onChange={(e) => setFormData({ ...formData, floatingBadge1Sub: e.target.value })}
                        placeholder="১ম ব্যাজ সাবটাইটেল (যেমন: শূন্য ভেজাল গ্যারান্টি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>

                    {/* Badge 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.floatingBadge2Title}
                        onChange={(e) => setFormData({ ...formData, floatingBadge2Title: e.target.value })}
                        placeholder="২য় ব্যাজ শিরোনাম (যেমন: খাঁটি গাওয়া ঘি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        type="text"
                        value={formData.floatingBadge2Sub}
                        onChange={(e) => setFormData({ ...formData, floatingBadge2Sub: e.target.value })}
                        placeholder="২য় ব্যাজ সাবটাইটেল (যেমন: দেশি গরুর দুধের ননী)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>
                  </div>

                  {/* 3 Quick Stats */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E8E2D5] space-y-3">
                    <h4 className="text-xs font-bold text-[#0F3D2E] flex items-center gap-1.5">
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
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        type="text"
                        value={formData.stat1Label}
                        onChange={(e) => setFormData({ ...formData, stat1Label: e.target.value })}
                        placeholder="স্ট্যাট ১ লেবেল (প্রাকৃতিক ও খাঁটি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>

                    {/* Stat 2 */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.stat2Number}
                        onChange={(e) => setFormData({ ...formData, stat2Number: e.target.value })}
                        placeholder="স্ট্যাট ২ মান (১২,৫০০+)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        type="text"
                        value={formData.stat2Label}
                        onChange={(e) => setFormData({ ...formData, stat2Label: e.target.value })}
                        placeholder="স্ট্যাট ২ লেবেল (সন্তুষ্ট পরিবার)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                    </div>

                    {/* Stat 3 */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.stat3Number}
                        onChange={(e) => setFormData({ ...formData, stat3Number: e.target.value })}
                        placeholder="স্ট্যাট ৩ মান (২৪-৪৮ ঘণ্টা)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        type="text"
                        value={formData.stat3Label}
                        onChange={(e) => setFormData({ ...formData, stat3Label: e.target.value })}
                        placeholder="স্ট্যাট ৩ লেবেল (সারাদেশে ডেলিভারি)"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-[#FCFAF7] focus:outline-none focus:border-[#0F3D2E]"
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
