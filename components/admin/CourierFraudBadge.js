'use client';

import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function CourierFraudBadge({ fraudRisk, successRate, cancelledDeliveries, compact = false }) {
  const risk = fraudRisk || (successRate !== undefined ? (successRate >= 80 ? 'low' : successRate >= 50 ? 'medium' : 'high') : 'low');

  if (risk === 'high') {
    return (
      <span
        title={`উচ্চ ঝুঁকি! ডেলিভারি সাকসেস রেট: ${successRate ?? 0}%, বাতিল: ${cancelledDeliveries ?? 0} টি।`}
        className={`inline-flex items-center gap-1 font-bold rounded-lg border bg-red-100 text-red-800 border-red-300 animate-pulse ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertOctagon className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
        <span>🔴 উচ্চ ঝুঁকি ({successRate !== undefined ? `${successRate}%` : 'Hold'})</span>
      </span>
    );
  }

  if (risk === 'medium') {
    return (
      <span
        title={`সতর্কতা: ডেলিভারি সাকসেস রেট: ${successRate ?? 0}%, বাতিল: ${cancelledDeliveries ?? 0} টি। কল দিয়ে নিশ্চিত করুন।`}
        className={`inline-flex items-center gap-1 font-bold rounded-lg border bg-amber-100 text-amber-900 border-amber-300 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>🟡 মধ্যম ঝুঁকি ({successRate !== undefined ? `${successRate}%` : 'কল আবশ্যক'})</span>
      </span>
    );
  }

  return (
    <span
      title={`নিরাপদ গ্রাহক! সাকসেস রেট: ${successRate ?? 100}%`}
      className={`inline-flex items-center gap-1 font-bold rounded-lg border bg-emerald-50 text-emerald-800 border-emerald-300 ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      <span>🟢 নিরাপদ গ্রাহক ({successRate !== undefined ? `${successRate}%` : '১০০%'})</span>
    </span>
  );
}
