'use client';

import {
  ShieldCheck,
  Globe,
  MapPin,
  Server,
  AlertTriangle,
  AlertOctagon,
  PhoneCall,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function CustomerSecurityCard({ securityInfo, courierHistory, fraudRisk, fraudReason }) {
  const history = courierHistory || {
    totalOrders: 0,
    successfulDeliveries: 0,
    cancelledDeliveries: 0,
    successRate: 100,
  };

  const risk = fraudRisk || (history.successRate >= 80 ? 'low' : history.successRate >= 50 ? 'medium' : 'high');

  return (
    <div className="space-y-4">
      {/* 1. Customer Security Info (IP & Geolocation Log) */}
      <div className="bg-[#F8F9FA] border border-[#E8E2D5] rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2">
          <div className="flex items-center gap-2 font-bold text-[#0F3D2E]">
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>গ্রাহক আইপি ও সিকিউরিটি লগ (Customer Security Info)</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            ভেরিফাইড কানেকশন
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold block">আইপি অ্যাড্রেস (IP Address):</span>
            <div className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-[#E8E2D5] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-slate-500" />
              <span>{securityInfo?.ipAddress || '127.0.0.1 (Local/Proxy)'}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold block">অবস্থান ও শহর (Location / City):</span>
            <div className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-[#E8E2D5] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {securityInfo?.city || 'ঢাকা'}, {securityInfo?.country || 'বাংলাদেশ'}
              </span>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold block">ইন্টারনেট সার্ভিস প্রোভাইডার (ISP Gateway):</span>
            <div className="text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-[#E8E2D5]">
              {securityInfo?.isp || 'Broadband / Telecom Internet Service Provider'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated Courier History Check & Anti-Fraud Engine */}
      <div
        className={`border rounded-2xl p-4 text-xs space-y-3 ${
          risk === 'high'
            ? 'bg-red-50/70 border-red-300'
            : risk === 'medium'
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-emerald-50/50 border-emerald-300'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            {risk === 'high' ? (
              <AlertOctagon className="w-4 h-4 text-red-600" />
            ) : risk === 'medium' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span>কুরিয়ার ডেলিভারি হিস্টোরি ও ফ্রড রিক্স স্কোর</span>
          </div>

          <span
            className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
              risk === 'high'
                ? 'bg-red-600 text-white'
                : risk === 'medium'
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-700 text-white'
            }`}
          >
            {risk === 'high' ? 'উচ্চ ঝুঁকি (Hold)' : risk === 'medium' ? 'মধ্যম ঝুঁকি (Verify)' : 'নিরাপদ কাস্টমার'}
          </span>
        </div>

        {/* Courier Success Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-xl border border-black/10 shadow-2xs">
            <div className="text-[10px] text-slate-500 font-bold">মোট পার্সেল</div>
            <div className="text-base font-black text-slate-900">
              {history.totalOrders} টি
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-black/10 shadow-2xs">
            <div className="text-[10px] text-emerald-700 font-bold">সফল ডেলিভারি</div>
            <div className="text-base font-black text-emerald-700">
              {history.successfulDeliveries} টি
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl border border-black/10 shadow-2xs">
            <div className="text-[10px] text-red-600 font-bold">রিটার্ন / বাতিল</div>
            <div className="text-base font-black text-red-600">
              {history.cancelledDeliveries} টি
            </div>
          </div>
        </div>

        {/* Success Rate Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="text-slate-600">ডেলিভারি সাফল্যের হার (Success Rate):</span>
            <span className={risk === 'high' ? 'text-red-700 font-black' : risk === 'medium' ? 'text-amber-800 font-black' : 'text-emerald-800 font-black'}>
              {history.successRate}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                risk === 'high'
                  ? 'bg-red-600'
                  : risk === 'medium'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.max(5, history.successRate)}%` }}
            />
          </div>
        </div>

        {/* Assessment Reason / Guidance for Admin */}
        <div className="text-[11px] text-slate-800 bg-white/80 p-2.5 rounded-xl border border-black/10 flex items-start gap-2">
          {risk === 'high' ? (
            <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          ) : risk === 'medium' ? (
            <PhoneCall className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <strong>সুপারিশ: </strong>
            {fraudReason || (
              risk === 'high'
                ? 'পূর্বে একাধিক পার্সেল রিটার্ন করেছে। অগ্রিম ডেলিভারি চার্জ ছাড়া পার্সেল পাঠানো ঝুঁকিপূর্ণ হতে পারে।'
                : risk === 'medium'
                ? 'পার্সেল পাঠানোর পূর্বে কাস্টমারকে ফোন করে ঠিকানা ও প্রাপ্যতা নিশ্চিত করুন।'
                : 'গ্রাহকের পার্সেল রিসিভ করার রেকর্ড শতভাগ ভালো। অর্ডারটি সরাসরি প্রসেস করতে পারেন।'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
