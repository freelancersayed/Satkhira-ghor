'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  CreditCard,
  Phone,
  Truck,
  Globe,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Percent,
  Activity,
} from 'lucide-react';
import { useSiteContentStore } from '@/store/siteContentStore';
import { deliveryConfig } from '@/lib/deliveryConfig';

export const DEFAULT_SETTINGS = {
  // Mobile Banking Payment Numbers
  bkashNumber: '০১৯০৮-৯৪৫১৪৫',
  bkashType: 'Send Money (Personal)',
  nagadNumber: '০১৯০৮-৯৪৫১৪৫',
  nagadType: 'Send Money (Personal)',
  rocketNumber: '',

  // Customer Support & Contact
  helpline: '০১৯০৮-৯৪৫১৪৫',
  whatsapp: '01908945145',
  email: 'satkhiraghor@gmail.com',
  supportTime: 'সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)',

  // Delivery & Free Shipping Thresholds
  freeDeliveryThreshold: 1500,
  insideSatkhiraCharge: 70,
  outsideSatkhiraCharge: 120,

  // Physical Location & Social Media Links
  storeAddress: 'শ্যামনগর রোড, সাতক্ষীরা সদর, খুলনা বিভাগ, বাংলাদেশ',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',

  // Top Notice / Announcement Banner
  topNotice:
    'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)',

  // Analytics & Conversion Tracking (LazyOnload Zero-Lag)
  gtmId: '',
  pixelId: '',
  gaMeasurementId: '',
  clarityId: '',
};

const toBanglaNum = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[d]);
};

export default function AdminSettingsView({ showNotification }) {
  const { content, updateSection, fetchContent } = useSiteContentStore();
  const [formState, setFormState] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'payment' | 'support' | 'delivery' | 'store'
  const [copiedTest, setCopiedTest] = useState('');
  const [previewMethod, setPreviewMethod] = useState('bkash');
  const [simCartAmount, setSimCartAmount] = useState(1200);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    if (content?.settings) {
      setFormState((prev) => ({
        ...DEFAULT_SETTINGS,
        ...content.settings,
      }));
    }
  }, [content?.settings]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopy = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedTest(key);
      setTimeout(() => setCopiedTest(''), 2000);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSection('settings', formState);
      if (showNotification) {
        showNotification(
          'ওয়েবসাইটের সমস্ত সেটিংস সফলভাবে সেভ হয়েছে এবং পুরো সাইটে লাইভ কার্যকর হয়েছে! 🎉',
          'success'
        );
      }
    } catch (err) {
      if (showNotification) {
        showNotification('সেটিংস সেভ করতে সমস্যা হয়েছে: ' + err.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'আপনি কি নিশ্চিত যে সকল সেটিংস অফিসিয়াল ডিফল্ট মানে রিসেট করতে চান? আপনার বর্তমান পরিবর্তন মুছে যাবে।'
      )
    ) {
      setFormState(DEFAULT_SETTINGS);
      if (showNotification) {
        showNotification(
          'ডিফল্ট ভ্যালু লোড হয়েছে। স্থায়ীভাবে কার্যকর করতে "সেভ করুন" বাটনে চাপ দিন।',
          'success'
        );
      }
    }
  };

  // Live simulation variables
  const thresholdNum = Number(formState.freeDeliveryThreshold) || 1500;
  const isFreeSim = simCartAmount >= thresholdNum;
  const insideChargeNum = Number(formState.insideSatkhiraCharge) || 70;
  const outsideChargeNum = Number(formState.outsideSatkhiraCharge) || 120;

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-fadeIn">
      {/* ── Top Header Bar ── */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#016831] to-[#014D24] text-[#FAB116] flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span>ওয়েবসাইট ও ব্যবসা সেটিংস</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  সরাসরি লাইভ
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                বিকাশ/নগদ পেমেন্ট নম্বর, হেল্পলাইন, কাস্টমার কেয়ার, ডেলিভারি চার্জ ও ফ্রি-ডেলিভারি অফার পরিবর্তন করুন।
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Desktop) */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            title="সকল ফিল্ড ডিফল্ট মানে ফিরিয়ে নিন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>ডিফল্ট</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#016831] hover:bg-[#014D24] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-[#FAB116]" />
            )}
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
        {[
          { id: 'all', label: 'সকল সেটিংস', icon: Settings },
          { id: 'payment', label: 'বিকাশ ও নগদ পেমেন্ট', icon: CreditCard },
          { id: 'support', label: 'হেল্পলাইন ও সাপোর্ট', icon: Phone },
          { id: 'delivery', label: 'ডেলিভারি চার্জ ও অফার', icon: Truck },
          { id: 'store', label: 'ঠিকানা ও সোশ্যাল লিংক', icon: Globe },
          { id: 'analytics', label: 'ট্র্যাকিং ও অ্যানালিটিক্স', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#016831] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FAB116]' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═════════════════════════════════════════════════════════════════
            বাম ও মাঝে: মূল সেটিংস ফর্ম কার্ডসমূহ
            ═════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── ১. বিকাশ ও নগদ মোবাইল ব্যাংকিং পেমেন্ট নম্বর সেটিংস ── */}
          {(activeTab === 'all' || activeTab === 'payment') && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#E2136E] flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      বিকাশ ও নগদ পেমেন্ট সেটিংস
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      চেকআউট পেজে গ্রাহক এই নম্বরগুলোতে পেমেন্ট পাঠাবে
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200">
                  Checkout Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* bKash Phone */}
                <div className="p-3.5 bg-pink-50/50 rounded-xl border border-pink-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#E2136E] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E2136E]" />
                      <span>বিকাশ নম্বর (bKash)</span>
                    </label>
                    <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                      bKash Personal
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formState.bkashNumber}
                    onChange={(e) => handleChange('bkashNumber', e.target.value)}
                    placeholder="যেমন: 01908945145 বা ০১৯০৮-৯৪৫১৪৫"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-pink-300 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E2136E]/30 focus:border-[#E2136E]"
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      পেমেন্ট অ্যাকাউন্ট ধরন
                    </label>
                    <input
                      type="text"
                      value={formState.bkashType}
                      onChange={(e) => handleChange('bkashType', e.target.value)}
                      placeholder="Send Money (Personal)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-pink-200 text-xs text-stone-700 focus:outline-none focus:border-[#E2136E]"
                    />
                  </div>
                </div>

                {/* Nagad Phone */}
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                      <span>নগদ নম্বর (Nagad)</span>
                    </label>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Nagad Personal
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formState.nagadNumber}
                    onChange={(e) => handleChange('nagadNumber', e.target.value)}
                    placeholder="যেমন: 01908945145 বা ০১৯০৮-৯৪৫১৪৫"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706]"
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-1">
                      পেমেন্ট অ্যাকাউন্ট ধরন
                    </label>
                    <input
                      type="text"
                      value={formState.nagadType}
                      onChange={(e) => handleChange('nagadType', e.target.value)}
                      placeholder="Send Money (Personal)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-200 text-xs text-stone-700 focus:outline-none focus:border-[#D97706]"
                    />
                  </div>
                </div>
              </div>

              {/* Rocket (Optional) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  রকেট নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formState.rocketNumber}
                  onChange={(e) => handleChange('rocketNumber', e.target.value)}
                  placeholder="যেমন: 01908945145-8 (ঐচ্ছিক)"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-800 focus:outline-none focus:border-[#016831]"
                />
              </div>
            </div>
          )}

          {/* ── ২. হেল্পলাইন, হোয়াটসঅ্যাপ ও কাস্টমার সাপোর্ট সেটিংস ── */}
          {(activeTab === 'all' || activeTab === 'support') && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#016831] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      হেল্পলাইন ও কাস্টমার সাপোর্ট
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      হেডার, ফুটার, কাস্টমার এআই চ্যাট ও মোবাইল নেভিগেশনে ব্যবহৃত তথ্য
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  Global Contacts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Helpline Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    হটলাইন / হেল্পলাইন নম্বর <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formState.helpline}
                      onChange={(e) => handleChange('helpline', e.target.value)}
                      placeholder="যেমন: ০১৯০৮-৯৪৫১৪৫"
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:border-[#016831]"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    গ্রাহক এই নম্বরে সরাসরি কল দিয়ে কথা বলতে পারবেন।
                  </p>
                </div>

                {/* WhatsApp Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    হোয়াটসঅ্যাপ নম্বর (WhatsApp) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formState.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      placeholder="যেমন: 01908945145"
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:border-[#016831]"
                    />
                    <MessageCircle className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    সরাসরি হোয়াটসঅ্যাপ চ্যাটের জন্য এই নম্বর স্বয়ংক্রিয় লিংক হিসেবে তৈরি হবে।
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    যোগাযোগের ইমেইল <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="satkhiraghor@gmail.com"
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:border-[#016831]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Support Time */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    সাপোর্ট সময়সূচী
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formState.supportTime}
                      onChange={(e) => handleChange('supportTime', e.target.value)}
                      placeholder="যেমন: সকাল ৯:০০ - রাত ১০:০০ (প্রতিদিন)"
                      className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 font-medium focus:outline-none focus:border-[#016831]"
                    />
                    <Clock className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ৩. ডেলিভারি চার্জ ও ফ্রি-ডেলিভারি অফার সেটিংস ── */}
          {(activeTab === 'all' || activeTab === 'delivery') && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      ডেলিভারি চার্জ ও ফ্রি-ডেলিভারি অফার
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      স্বয়ংক্রিয় ডেলিভারি ফি ক্যালকুলেশন ও ফ্রি শিপিং অফার নিয়ন্ত্রণ
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                  Rate Engine
                </span>
              </div>

              {/* Free Delivery Offer Highlight Box */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-[#016831] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FAB116]" />
                    <span>ফ্রি-ডেলিভারি অফার অ্যামাউন্ট (টাকা)</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    ৳{toBanglaNum(formState.freeDeliveryThreshold)} এর বেশি হলে ফ্রি
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-stone-600">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={formState.freeDeliveryThreshold}
                    onChange={(e) => handleChange('freeDeliveryThreshold', e.target.value)}
                    placeholder="1500"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-300 font-mono text-sm sm:text-base font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#016831]/20 focus:border-[#016831]"
                  />
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  💡 গ্রাহকের কার্টের পণ্যের মোট মূল্য <strong>৳{toBanglaNum(formState.freeDeliveryThreshold)}</strong> বা তার বেশি হলে সিস্টেম স্বয়ংক্রিয়ভাবে ডেলিভারি চার্জ সম্পূর্ণ মাফ (ফ্রি) করে দেবে।
                </p>
              </div>

              {/* 2-Tier Standard Delivery Rates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Inside Satkhira */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1.5">
                  <label className="block text-xs font-bold text-stone-800">
                    সাতক্ষীরার ভেতরে ডেলিভারি চার্জ (টাকা)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={formState.insideSatkhiraCharge}
                      onChange={(e) => handleChange('insideSatkhiraCharge', e.target.value)}
                      placeholder="70"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 font-mono text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    হোম ডেলিভারি (আনুমানিক ২৪ ঘণ্টা)
                  </span>
                </div>

                {/* Outside Satkhira */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1.5">
                  <label className="block text-xs font-bold text-stone-800">
                    সাতক্ষীরার বাইরে সারাদেশে ডেলিভারি চার্জ (টাকা)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={formState.outsideSatkhiraCharge}
                      onChange={(e) => handleChange('outsideSatkhiraCharge', e.target.value)}
                      placeholder="120"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 font-mono text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-[#016831]"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 block">
                    কুরিয়ার ডেলিভারি (২-৩ দিন)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── ৪. ঠিকানা, হেডার নোটিস ও সোশ্যাল মিডিয়া লিংক ── */}
          {(activeTab === 'all' || activeTab === 'store') && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      ঠিকানা, নোটিস ও সোশ্যাল মিডিয়া
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      ফুটার ঠিকানা, হেডার নোটিশ ব্যানার ও ব্র্যান্ড পেজ লিংক
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                  Branding
                </span>
              </div>

              {/* Store Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  স্টোর / অফিসের ঠিকানা (ফুটার ও ইনভয়েস ভাউচারে প্রদর্শিত)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formState.storeAddress}
                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                    placeholder="যেমন: শ্যামনগর রোড, সাতক্ষীরা সদর, খুলনা বিভাগ, বাংলাদেশ"
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                  <MapPin className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Header Announcement / Top Notice */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  হেডার টপ নোটিস ব্যানার টেক্সট
                </label>
                <textarea
                  rows={2}
                  value={formState.topNotice}
                  onChange={(e) => handleChange('topNotice', e.target.value)}
                  placeholder="সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831] resize-none"
                />
              </div>

              {/* Social Media Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ফেসবুক পেজ লিংক (Facebook URL)
                  </label>
                  <input
                    type="url"
                    value={formState.facebookUrl}
                    onChange={(e) => handleChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/satkhiraghor"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    ইউটিউব চ্যানেল লিংক (YouTube URL)
                  </label>
                  <input
                    type="url"
                    value={formState.youtubeUrl}
                    onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/@satkhiraghor"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════
              সেকশন ৫: ট্র্যাকিং ও অ্যানালিটিক্স সেটিংস (GTM, Pixel, GA4, Clarity)
              ═════════════════════════════════════════════════════════════════ */}
          {(activeTab === 'all' || activeTab === 'analytics') && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      অ্যানালিটিক্স ও কনভার্সন ট্র্যাকিং
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      GTM, Meta Pixel, GA4 ও Clarity আইডি দিয়ে বিজ্ঞাপন ও সেলস ট্র্যাক করুন
                    </p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>সুপার ফাস্ট lazyOnload</span>
                </span>
              </div>

              {/* Informative Speed Guarantee Notice */}
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl flex items-start gap-2.5 text-xs text-purple-950">
                <ShieldCheck className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">জিরো-ল্যাগ (Zero-Lag) স্পিড গ্যারান্টি:</span> প্রতিটি স্ক্রিপ্ট Next.js-এর <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-mono border border-purple-200 font-bold">lazyOnload</code> মোডে পেজের সব ইমেজ ও কনটেন্ট শতভাগ লোড হওয়ার পরই কেবল ব্যাকগ্রাউন্ডে রান করবে। ফলে ওয়েবসাইটের লোডিং স্পিডে কোনো প্রভাব পড়বে না।
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* 1. Google Tag Manager (GTM) */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>Google Tag Manager (GTM)</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">GTM-XXXXXXX</span>
                  </div>
                  <input
                    type="text"
                    value={formState.gtmId || ''}
                    onChange={(e) => handleChange('gtmId', e.target.value)}
                    placeholder="যেমন: GTM-ABCD123"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                  <p className="text-[10px] text-stone-500">
                    GTM আইডি দিলে অন্যান্য ট্যাগ সরাসরি GTM ড্যাশবোর্ড থেকে হ্যান্ডেল করতে পারবেন।
                  </p>
                </div>

                {/* 2. Meta (Facebook) Pixel */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Meta (Facebook) Pixel ID</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">Numeric ID</span>
                  </div>
                  <input
                    type="text"
                    value={formState.pixelId || ''}
                    onChange={(e) => handleChange('pixelId', e.target.value)}
                    placeholder="যেমন: 123456789012345"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                  <p className="text-[10px] text-stone-500">
                    ফেসবুক অ্যাডস রিটার্গেটিং ও সেলস কনভার্সন ট্র্যাক করতে মেটা পিক্সেল আইডি দিন।
                  </p>
                </div>

                {/* 3. Google Analytics 4 (GA4) */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Google Analytics 4 (GA4) ID</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">G-XXXXXXXXXX</span>
                  </div>
                  <input
                    type="text"
                    value={formState.gaMeasurementId || ''}
                    onChange={(e) => handleChange('gaMeasurementId', e.target.value)}
                    placeholder="যেমন: G-ABC123XYZ0"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                  <p className="text-[10px] text-stone-500">
                    ভিজিটর ট্রাফিক, পেজভিউ ও ফুল ই-কমার্স ফানেল অ্যানালাইসিস করতে মেজারমেন্ট আইডি দিন।
                  </p>
                </div>

                {/* 4. Microsoft Clarity */}
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>Microsoft Clarity Project ID</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">Project ID</span>
                  </div>
                  <input
                    type="text"
                    value={formState.clarityId || ''}
                    onChange={(e) => handleChange('clarityId', e.target.value)}
                    placeholder="যেমন: n8qabcdefg"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-[#016831]"
                  />
                  <p className="text-[10px] text-stone-500">
                    ভিজিটরদের লাইভ স্ক্রিন ব্রাউজিং ভিডিও রেকর্ডিং ও হিটম্যাপ দেখতে ক্ল্যারিটি আইডি দিন।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ডান পাশে: লাইভ ইন্টারেক্টিভ প্রিভিউ ও সিমুলেশন প্যানেল
            ═════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* লাইভ প্রিভিউ ১: চেকআউট মোবাইল ব্যাংকিং পেমেন্ট উইজেট */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#016831]" />
                <span>চেকআউট পেজে প্রিভিউ</span>
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewMethod('bkash')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    previewMethod === 'bkash'
                      ? 'bg-[#E2136E] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMethod('nagad')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    previewMethod === 'nagad'
                      ? 'bg-[#F7941D] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Nagad
                </button>
              </div>
            </div>

            {/* Checkout Widget Card */}
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                previewMethod === 'bkash'
                  ? 'bg-pink-50/70 border-pink-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {previewMethod === 'bkash'
                      ? 'বিকাশ (bKash) পেমেন্ট'
                      : 'নগদ (Nagad) পেমেন্ট'}
                  </span>
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-stone-200 font-mono">
                  প্রদেয়: ৳১,৫০০
                </span>
              </div>

              {/* Number and copy preview */}
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="text-[9px] font-bold text-stone-500 uppercase block">
                    {previewMethod === 'bkash' ? formState.bkashType : formState.nagadType}:
                  </span>
                  <span className="text-sm font-black font-mono tracking-wider text-stone-900">
                    {previewMethod === 'bkash' ? formState.bkashNumber : formState.nagadNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      previewMethod === 'bkash'
                        ? formState.bkashNumber
                        : formState.nagadNumber,
                      'preview_btn'
                    )
                  }
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 text-white shadow-2xs ${
                    copiedTest === 'preview_btn'
                      ? 'bg-emerald-600'
                      : previewMethod === 'bkash'
                      ? 'bg-[#E2136E] hover:bg-[#C2105C]'
                      : 'bg-[#F7941D] hover:bg-[#D97706]'
                  }`}
                >
                  {copiedTest === 'preview_btn' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedTest === 'preview_btn' ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              <p className="text-[10px] text-stone-500 italic">
                * গ্রাহক চেকআউট পেজে ঠিক এভাবে নম্বর কপি করে পেমেন্ট করতে পারবে।
              </p>
            </div>
          </div>

          {/* লাইভ প্রিভিউ ২: ফ্রি-ডেলিভারি অফার সিমুলেটর */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>ফ্রি ডেলিভারি অফার সিমুলেটর</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                অফার টেস্ট
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-600">কার্ট টেস্ট অ্যামাউন্ট:</span>
                <span className="font-mono font-bold text-[#016831]">
                  ৳{toBanglaNum(simCartAmount)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={simCartAmount}
                onChange={(e) => setSimCartAmount(Number(e.target.value))}
                className="w-full accent-[#016831] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>৳৫০০</span>
                <span>৳১,৫০০</span>
                <span>৳৩,০০০</span>
              </div>
            </div>

            {/* Simulation Status Card */}
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                isFreeSim
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>ডেলিভারি স্ট্যাটাস:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-black ${
                    isFreeSim ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {isFreeSim ? '🎉 সম্পূর্ণ ফ্রি ডেলিভারি!' : 'চার্জ প্রযোজ্য'}
                </span>
              </div>

              {!isFreeSim ? (
                <p className="text-[11px] text-stone-600 pt-1">
                  আরও <strong>৳{toBanglaNum(thresholdNum - simCartAmount)}</strong> টাকার পণ্য কিনলে ডেলিভারি ফ্রি হবে।
                </p>
              ) : (
                <p className="text-[11px] text-emerald-800 pt-1 font-medium">
                  কার্ট ৳{toBanglaNum(thresholdNum)} এর সমান বা বেশি হওয়ায় ডেলিভারি চার্জ ৳০ ধরা হয়েছে।
                </p>
              )}

              <div className="pt-2 border-t border-stone-200/60 grid grid-cols-2 gap-1 text-[10px] text-stone-600">
                <div>
                  সাতক্ষীরা সদর:{' '}
                  <strong className="text-stone-900">
                    {isFreeSim ? 'ফ্রি' : `৳${insideChargeNum}`}
                  </strong>
                </div>
                <div>
                  অন্যান্য জেলা:{' '}
                  <strong className="text-stone-900">
                    {isFreeSim ? 'ফ্রি' : `৳${outsideChargeNum}`}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* লাইভ প্রিভিউ ৩: হেল্পলাইন ও ফুটার যোগাযোগ প্রিভিউ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3">
            <span className="text-xs font-black text-stone-800 flex items-center gap-1.5 pb-2 border-b border-stone-100">
              <Phone className="w-4 h-4 text-blue-600" />
              <span>যোগাযোগ চ্যানেল প্রিভিউ</span>
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-600">কল:</span>
                <span className="font-bold text-stone-900 font-mono ml-auto">
                  {formState.helpline}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800">WhatsApp:</span>
                <span className="font-bold text-emerald-950 font-mono ml-auto">
                  {formState.whatsapp}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                <Mail className="w-3.5 h-3.5 text-stone-500" />
                <span className="text-stone-600">ইমেইল:</span>
                <span className="font-medium text-stone-900 font-mono text-[11px] ml-auto truncate max-w-[140px]">
                  {formState.email}
                </span>
              </div>
            </div>
          </div>

          {/* লাইভ প্রিভিউ ৪: ট্র্যাকিং ও অ্যানালিটিক্স লাইভ স্ট্যাটাস */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs font-black text-stone-800">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>ট্র্যাকিং স্ট্যাটাস প্রিভিউ</span>
              </span>
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                lazyOnload
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { name: 'Google Tag Manager', val: formState.gtmId, placeholder: 'GTM নেই' },
                { name: 'Meta (FB) Pixel', val: formState.pixelId, placeholder: 'Pixel নেই' },
                { name: 'Google Analytics 4', val: formState.gaMeasurementId, placeholder: 'GA4 নেই' },
                { name: 'Microsoft Clarity', val: formState.clarityId, placeholder: 'Clarity নেই' },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 border border-stone-100">
                  <span className="text-stone-700 font-medium text-[11px]">{t.name}</span>
                  {t.val?.trim() ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>সক্রিয়</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                      {t.placeholder}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── মোবাইলের জন্য স্টিকি বটম সেভ বার ── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 p-2.5 px-3 flex items-center justify-between gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-700 active:scale-95 text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ডিফল্ট</span>
        </button>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#016831] text-white text-xs font-black shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 text-[#FAB116]" />
          )}
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
        </button>
      </div>
    </div>
  );
}
