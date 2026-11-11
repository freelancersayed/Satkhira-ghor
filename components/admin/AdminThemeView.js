'use client';

import { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  RotateCcw,
  Save,
  Sparkles,
  Eye,
  ShoppingBag,
  Star,
  Flame,
  ArrowRight,
  ShieldCheck,
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

const PRESET_THEMES = [
  {
    id: 'satkhira-default',
    name: '১. অফিসিয়াল সাতক্ষীরা ঘর (সবুজ ও মধু)',
    description: 'খাঁটি লিফ গ্রিন এবং মিষ্টি মধুর সোনালী রঙের ঐতিহ্যবাহী ব্র্যান্ড থিম।',
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
    id: 'royal-honey-amber',
    name: '২. রয়্যাল হানি অ্যাম্বার (পল্লীবাজার ভাইব)',
    description: 'উষ্ণ মধু ও জাফরানের সোনালী অ্যাম্বার এবং গাঢ় টেক্সট কম্বিনেশন।',
    theme: {
      primary: '#E08E00',
      secondary: '#FAB116',
      buttonBg: '#E08E00',
      buttonText: '#FFFFFF',
      textColor: '#1F2937',
      textHover: '#B45309',
      buttonHoverBg: '#D97706',
    },
  },
  {
    id: 'deep-sundarbans',
    name: '৩. খাঁটি সুন্দরবন ফরেস্ট (ডিপ এভারগ্রিন)',
    description: 'সুন্দরবনের গভীর ম্যানগ্রোভ অরণ্যের শান্ত ও রাজকীয় ডার্ক গ্রিন রূপ।',
    theme: {
      primary: '#0F3D2E',
      secondary: '#F59E0B',
      buttonBg: '#0F3D2E',
      buttonText: '#FFFFFF',
      textColor: '#0D231B',
      textHover: '#1B5E43',
      buttonHoverBg: '#0A2B20',
    },
  },
  {
    id: 'heritage-maroon',
    name: '৪. হেরিটেজ রাজকীয় মেরুন ও গোল্ড',
    description: 'অভিজাত ক্ষীর সন্দেশ ও ঐতিহ্যবাহী উৎসবের জন্য প্রিমিয়াম মেরুন লুক।',
    theme: {
      primary: '#7F1D1D',
      secondary: '#F59E0B',
      buttonBg: '#7F1D1D',
      buttonText: '#FFFFFF',
      textColor: '#1E1B4B',
      textHover: '#991B1B',
      buttonHoverBg: '#991B1B',
    },
  },
  {
    id: 'fresh-emerald',
    name: '৫. ফ্রেশ অর্গানিক এগ্রো (টিটল গ্রিন)',
    description: 'আধুনিক ই-কমার্স ও প্রাকৃতিক খাবারের সতেজ টিল এবং গোল্ডেন কম্বো।',
    theme: {
      primary: '#0D9488',
      secondary: '#FBBF24',
      buttonBg: '#0D9488',
      buttonText: '#FFFFFF',
      textColor: '#0F172A',
      textHover: '#0F766E',
      buttonHoverBg: '#0F766E',
    },
  },
];

export default function AdminThemeView({ showNotification }) {
  const { content, updateSection, fetchContent } = useSiteContentStore();
  const [themeState, setThemeState] = useState(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

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
  }, [content?.theme]);

  const handleColorChange = (key, value) => {
    setThemeState((prev) => {
      const updated = { ...prev, [key]: value };
      // Auto-compute button hover if changing buttonBg and no explicit hover set
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
      showNotification(`"${preset.name}" থিম নির্বাচন করা হয়েছে। সেভ করতে ভুলবেন না!`, 'success');
    }
  };

  const handleResetDefault = () => {
    if (confirm('আপনি কি পূর্বনির্ধারিত অফিসিয়াল ব্র্যান্ড কালারে ফিরে যেতে চান?')) {
      setThemeState(DEFAULT_THEME);
      setActivePreset('satkhira-default');
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      await updateSection('theme', themeState);
      if (showNotification) {
        showNotification('ওয়েবসাইটের কালার ও থিম সফলভাবে সেভ ও লাইভ আপডেট হয়েছে! 🎉', 'success');
      }
    } catch (err) {
      if (showNotification) {
        showNotification('থিম সেভ করতে সমস্যা হয়েছে: ' + err.message, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const colorFields = [
    {
      key: 'primary',
      label: '১. প্রাইমারি কালার (Primary Color)',
      description: 'হেডার, ফুটার, বটম শর্টকাট বার ও মূল ব্র্যান্ডিং উপাদানে প্রযোজ্য।',
      fallback: '#016831',
    },
    {
      key: 'secondary',
      label: '২. সেকেন্ডারি কালার (Secondary / Honey Accent)',
      description: 'লোগোর "ঘর", রেটিং স্টার, ছাড়ের ব্যাজ ও হাইলাইট টেক্সটে প্রযোজ্য।',
      fallback: '#FAB116',
    },
    {
      key: 'buttonBg',
      label: '৩. বাটন ব্যাকগ্রাউন্ড কালার (Button Background)',
      description: 'অর্ডার করুন, কার্টে যোগ করুন এবং প্রধান অ্যাকশন বাটনের ব্যাকগ্রাউন্ড।',
      fallback: '#016831',
    },
    {
      key: 'buttonText',
      label: '৪. বাটন টেক্সট কালার (Button Text Color)',
      description: 'বাটনের ভেতরের লেখার রঙ (যেমন সাদা #FFFFFF বা কালচে রঙ)।',
      fallback: '#FFFFFF',
    },
    {
      key: 'buttonHoverBg',
      label: '৫. বাটন হোভার কালার (Button Hover State)',
      description: 'বাটনের উপর মাউস পয়েন্টার নিলে যে রঙে পরিবর্তিত হবে।',
      fallback: '#014D24',
    },
    {
      key: 'textColor',
      label: '৬. মূল টেক্সট ও শিরোনাম কালার (Text & Headings)',
      description: 'হেডিং, পণ্যের নাম, বর্ণনা ও সাধারণ লেখার প্রাথমিক রঙ।',
      fallback: '#14241E',
    },
    {
      key: 'textHover',
      label: '৭. টেক্সট হোভার কালার (Text & Link Hover)',
      description: 'মেনু লিংক ও পণ্য টাইটেলে হোভার করলে যে রঙ দেখাবে।',
      fallback: '#02833E',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ── */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#016831] uppercase tracking-wider mb-1">
            <Palette className="w-4 h-4 text-[#FAB116]" />
            <span>ডায়নামিক ব্র্যান্ড থিম ইঞ্জিন</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            ওয়েবসাইট কালার ও থিম কাস্টমাইজেশন
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            এখান থেকে কোনো কোডিং ছাড়াই পুরো ওয়েবসাইটের প্রাইমারি, সেকেন্ডারি, বাটন এবং টেক্সট কালার ডায়নামিক ভাবে পরিবর্তন ও লাইভ সেভ করতে পারেন।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 active:scale-95 text-xs font-bold transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্টে রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white text-xs font-black shadow-md shadow-[#016831]/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-[#FAB116]" />
            )}
            <span>{saving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}</span>
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Layout (Pickers + Live Mockup Preview) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Color Pickers (Col Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
              <Sparkles className="w-4 h-4 text-[#FAB116]" />
              <span>কালার প্যালেট নির্ধারণ করুন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {colorFields.map((field) => {
                const currentColor = themeState[field.key] || field.fallback;
                return (
                  <div
                    key={field.key}
                    className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200/80 hover:border-[#016831]/40 transition-all space-y-2"
                  >
                    <div>
                      <label className="text-xs font-bold text-stone-800 block">
                        {field.label}
                      </label>
                      <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                        {field.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      {/* Native HTML5 Color Picker with rounded container */}
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-stone-300 flex-shrink-0 cursor-pointer">
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleColorChange(field.key, e.target.value)}
                          className="absolute -top-3 -left-3 w-16 h-16 cursor-pointer border-0 p-0"
                          title="কালার পিকার খুলুন"
                        />
                      </div>

                      {/* Hex Value Text Input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={currentColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleColorChange(field.key, val);
                          }}
                          placeholder="#000000"
                          maxLength={7}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 focus:border-[#016831] focus:ring-2 focus:ring-[#016831]/20 outline-hidden font-mono text-xs font-bold uppercase text-stone-800 shadow-2xs"
                        />
                      </div>

                      {/* Swatch Pill preview */}
                      <div
                        className="w-7 h-7 rounded-lg border border-black/10 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: currentColor }}
                        title={currentColor}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preset Themes Section */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#016831]" />
                <span>এক-ক্লিকে রেডিমেড থিম প্যালেট (Presets)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                নিচের যেকোনো পছন্দসই থিমে ক্লিক করে পুরো সাইটের কালার কম্বিনেশন নিমিষে সেট করুন:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_THEMES.map((preset) => {
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
                    className={`text-left p-3.5 rounded-2xl border transition-all relative group ${
                      isSelected
                        ? 'bg-emerald-50/60 border-[#016831] shadow-xs'
                        : 'bg-[#FAF9F5] border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#016831] text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}

                    <div className="font-extrabold text-xs text-stone-900 pr-5">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-stone-500 leading-tight mt-1 mb-2.5">
                      {preset.description}
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.theme.primary }}
                        title={`Primary: ${preset.theme.primary}`}
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.theme.secondary }}
                        title={`Secondary: ${preset.theme.secondary}`}
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.theme.buttonBg }}
                        title={`Button: ${preset.theme.buttonBg}`}
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.theme.textColor }}
                        title={`Text: ${preset.theme.textColor}`}
                      />
                      <span
                        className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                        style={{ backgroundColor: preset.theme.textHover }}
                        title={`Hover: ${preset.theme.textHover}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Box (Col Span 5) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#016831]" />
                <h3 className="text-sm font-black text-stone-900">
                  লাইভ প্রিভিউ (Live UI Preview)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                তাৎক্ষণিক পরিবর্তন
              </span>
            </div>

            {/* Mockup Header Bar */}
            <div
              className="p-3 rounded-2xl text-white shadow-xs transition-colors duration-300"
              style={{ backgroundColor: themeState.primary }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: themeState.secondary,
                      color: '#000000',
                    }}
                  >
                    স
                  </div>
                  <div>
                    <div className="text-xs font-black leading-tight">
                      সাতক্ষীরা{' '}
                      <span style={{ color: themeState.secondary }}>ঘর</span>
                    </div>
                    <div className="text-[7px] uppercase tracking-wider opacity-90">
                      Pure & Organic
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px]">
                  <span className="opacity-80">হোম</span>
                  <span className="opacity-80">সব পণ্য</span>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      backgroundColor: themeState.secondary,
                      color: '#000000',
                    }}
                  >
                    ৩
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup Product Card */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/80 shadow-xs space-y-3">
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-stone-200 flex items-center justify-center text-stone-400">
                <span className="text-xs font-bold">পণ্যের ছবি</span>
                <span
                  className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded shadow-xs"
                  style={{
                    backgroundColor: themeState.secondary,
                    color: '#000000',
                  }}
                >
                  ধামাকা অফার -২০%
                </span>
              </div>

              <div>
                <a
                  href="#preview"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs sm:text-sm font-extrabold transition-colors block"
                  style={{ color: themeState.textColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = themeState.textHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = themeState.textColor;
                  }}
                >
                  সুন্দরবনের খাঁটি খলসী ফুলের মধু (১ কেজি)
                </a>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  ১০০% খাঁটি ও অপ্রক্রিয়াজাত কাঁচা মধু
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-sm font-black"
                    style={{ color: themeState.primary }}
                  >
                    ৳১,২৫০
                  </span>
                  <span className="text-[10px] text-stone-400 line-through">
                    ৳১,৪৫০
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-xs">
                  <Star
                    className="w-3.5 h-3.5 fill-current"
                    style={{ color: themeState.secondary }}
                  />
                  <span className="text-[10px] font-bold text-stone-600">
                    ৪.৯ (১৪৮)
                  </span>
                </div>
              </div>

              {/* Sample Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="py-2 px-3 rounded-xl font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95"
                  style={{
                    backgroundColor: themeState.buttonBg,
                    color: themeState.buttonText,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      themeState.buttonHoverBg || themeState.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = themeState.buttonBg;
                  }}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>অর্ডার করুন</span>
                </button>

                <button
                  type="button"
                  className="py-2 px-3 rounded-xl font-bold text-xs transition-all border flex items-center justify-center gap-1 active:scale-95"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: themeState.primary,
                    borderColor: themeState.primary,
                  }}
                >
                  <span>কার্ট</span>
                </button>
              </div>
            </div>

            {/* Bottom Nav Mockup Preview */}
            <div>
              <div className="text-[10px] font-bold text-stone-500 mb-1.5">
                মোবাইল বটম নেভিগেশন ভিউ:
              </div>
              <div
                className="p-2.5 rounded-xl text-white flex items-center justify-around text-center"
                style={{ backgroundColor: themeState.primary }}
              >
                <div
                  className="text-[9px] font-extrabold"
                  style={{ color: themeState.secondary }}
                >
                  HOME
                </div>
                <div className="text-[9px] font-extrabold opacity-80">MENU</div>
                <div className="text-[9px] font-extrabold opacity-80">CART</div>
                <div className="text-[9px] font-extrabold opacity-80">SEARCH</div>
                <div className="text-[9px] font-extrabold opacity-80">ACCOUNT</div>
              </div>
            </div>

            {/* Save Button in Sticky Box */}
            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={saving}
              className="w-full py-3 rounded-2xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              style={{
                backgroundColor: themeState.buttonBg,
                color: themeState.buttonText,
              }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'সংরক্ষণ করা হচ্ছে...' : 'এই কালার থিম সক্রিয় করুন'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

