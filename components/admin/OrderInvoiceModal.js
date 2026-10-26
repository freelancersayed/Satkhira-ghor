'use client';

import { useState } from 'react';
import {
  Printer,
  X,
  Phone,
  MapPin,
  Calendar,
  Package,
  FileText,
  Tag,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from 'lucide-react';

export default function OrderInvoiceModal({ order, onClose }) {
  const [printMode, setPrintMode] = useState('invoice'); // 'invoice' | 'shipping_label'

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'আজ';

  const trackingNumber =
    order.courierBooking?.trackingCode ||
    `STDF-${order.orderNumber.replace(/[^0-9]/g, '') || '849201'}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container - Printable Sheet */}
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 border border-[#E8E2D5] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Action Header (Hidden during print) */}
        <div className="no-print bg-[#0A2B20] text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#F59E0B]" />
            <div>
              <h3 className="text-sm font-bold">
                প্রিন্ট সেন্টার: #{order.orderNumber}
              </h3>
              <p className="text-[11px] text-emerald-300">
                ইনভয়েস বা কুরিয়ার পার্সেল স্টিকার নির্বাচন করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout Mode Selector */}
            <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setPrintMode('invoice')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  printMode === 'invoice'
                    ? 'bg-[#F59E0B] text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>ক্যাশ মেমো</span>
              </button>
              <button
                onClick={() => setPrintMode('shipping_label')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  printMode === 'shipping_label'
                    ? 'bg-[#F59E0B] text-slate-950 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>কুরিয়ার লেবেল (৪×৬)</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= OPTION 1: FULL CUSTOMER INVOICE ================= */}
        {printMode === 'invoice' && (
          <div className="p-6 sm:p-8 space-y-6 text-slate-900 print-area bg-white text-xs">
            {/* Brand Header */}
            <div className="flex justify-between items-start border-b-2 border-[#0F3D2E] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#0F3D2E] flex items-center justify-center text-[#F59E0B] font-serif font-black text-3xl shadow-sm">
                  স
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#0F3D2E] tracking-tight">
                    সাতক্ষীরা ঘর
                  </h1>
                  <p className="text-[11px] font-bold text-amber-700 tracking-wider uppercase">
                    Satkhira Ghor • Pure & Organic Heritage
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    সুন্দরবনের খাঁটি মধু ও উপকূলের শতভাগ বিশুদ্ধ খাদ্য সম্ভার
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="inline-block bg-[#0F3D2E] text-white px-3 py-1 rounded-lg text-xs font-black">
                  পার্সেল চালান ও মেমো
                </div>
                <div className="font-mono font-black text-sm text-[#0F3D2E]">
                  #{order.orderNumber}
                </div>
                <div className="text-[10px] text-gray-500">{formattedDate}</div>
              </div>
            </div>

            {/* Shipping Addresses Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Delivery To */}
              <div className="border-2 border-[#0F3D2E] rounded-2xl p-4 bg-[#FDFBF7] space-y-2 relative">
                <div className="absolute top-0 right-0 bg-[#0F3D2E] text-white text-[9px] font-black px-2.5 py-0.5 rounded-bl-xl uppercase">
                  প্রাপক (Delivery To)
                </div>
                <div>
                  <span className="text-[10px] text-gray-500">গ্রাহকের নাম:</span>
                  <h2 className="text-base font-black text-[#0F3D2E]">
                    {order.customer?.name}
                  </h2>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500">মোবাইল নম্বর:</span>
                  <div className="text-sm font-black text-amber-700 font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.customer?.phone}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-500">ডেলিভারি ঠিকানা:</span>
                  <p className="font-semibold text-xs text-gray-800 leading-relaxed">
                    {order.customer?.address}, {order.customer?.city}
                  </p>
                </div>

                {order.customer?.notes && (
                  <div className="pt-1 border-t border-gray-200 text-[10px] text-gray-600">
                    <strong>গ্রাহকের বিশেষ নোট:</strong> {order.customer.notes}
                  </div>
                )}
              </div>

              {/* Sent From */}
              <div className="border border-gray-200 rounded-2xl p-4 space-y-2 bg-gray-50/50">
                <div className="text-[10px] font-black text-[#0F3D2E] uppercase tracking-wider">
                  প্রেরক (Sender / Brand Office)
                </div>
                <div className="font-bold text-sm text-[#0F3D2E]">
                  সাতক্ষীরা ঘর (হেড অফিস)
                </div>
                <p className="text-[11px] text-gray-600">
                  শ্যামনগর ও সাতক্ষীরা সদর, খুলনা বিভাগ।
                </p>
                <div className="text-[11px] text-gray-700 font-semibold space-y-0.5 pt-1">
                  <div>📞 হেল্পলাইন: ০১৭০০-০০০০০০</div>
                  <div>🌐 ওয়েবসাইট: satkhir-ghor.vercel.app</div>
                  <div>📦 কুরিয়ার পার্টনার: Steadfast Courier / Pathao</div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[#0F3D2E] uppercase tracking-wider">
                অর্ডারকৃত পণ্যের বিবরণ (Order Items)
              </h3>
              <table className="w-full text-xs text-left border-collapse border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-[#FDFBF7] text-[#0F3D2E] font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-gray-200">ক্রমিক</th>
                    <th className="py-2.5 px-3 border-r border-gray-200">পণ্যের নাম</th>
                    <th className="py-2.5 px-3 border-r border-gray-200 text-center">পরিমাণ</th>
                    <th className="py-2.5 px-3 border-r border-gray-200 text-right">মূল্য</th>
                    <th className="py-2.5 px-3 text-right">মোট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 border-r border-gray-200 text-center font-bold text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.unit && <div className="text-[10px] text-gray-500">{item.unit}</div>}
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 text-center font-bold">
                        {item.quantity} টি
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200 text-right font-mono">
                        ৳{item.price}
                      </td>
                      <td className="py-2 px-3 text-right font-bold font-mono">
                        ৳{item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Billing Summary */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
              <div className="space-y-1 text-[11px] text-gray-500">
                <div>পেমেন্ট মেথড: {order.paymentMethod?.toUpperCase()}</div>
                <div>পেমেন্ট স্ট্যাটাস: {order.paymentStatus === 'paid' ? 'পরিশোধিত (Paid)' : 'ক্যাশ অন ডেলিভারি (বকেয়া)'}</div>
              </div>
              <div className="text-right space-y-1 text-xs">
                <div>সাবটোটাল: ৳{order.subtotal}</div>
                <div>ডেলিভারি চার্জ: ৳{order.deliveryFee || 0}</div>
                <div className="text-base font-black text-[#0F3D2E] pt-1 border-t border-gray-300">
                  সর্বমোট: ৳{order.totalAmount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= OPTION 2: COMPACT COURIER SHIPPING LABEL ================= */}
        {printMode === 'shipping_label' && (
          <div className="p-6 sm:p-8 bg-white print-area">
            {/* 4x6 Label Box */}
            <div className="border-4 border-slate-950 rounded-2xl p-5 max-w-md mx-auto space-y-4 text-slate-950 font-sans">
              {/* Header */}
              <div className="flex justify-between items-center border-b-2 border-slate-950 pb-3">
                <div>
                  <div className="text-xl font-black tracking-tight text-[#0F3D2E]">
                    সাতক্ষীরা ঘর
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    Eco-Friendly Parcel Dispatch
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black bg-slate-950 text-white px-2 py-0.5 rounded">
                    {order.courierBooking?.courierName || 'STEADFAST COURIER'}
                  </div>
                  <div className="font-mono text-[10px] font-bold mt-0.5">
                    {formattedDate}
                  </div>
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="text-center py-1 bg-slate-100 rounded-lg border border-slate-300 space-y-1">
                <div className="font-mono text-2xl tracking-[0.25em] font-black select-none text-slate-900 leading-none">
                  ||||| | |||| ||| |||| | ||||| ||||
                </div>
                <div className="font-mono text-xs font-black tracking-widest text-[#0F3D2E]">
                  {trackingNumber}
                </div>
              </div>

              {/* COD Amount Banner */}
              <div className="bg-[#0F3D2E] text-white p-3 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                    ক্যাশ অন ডেলিভারি (COD Collect)
                  </div>
                  <div className="text-xl font-black font-mono">
                    ৳{order.totalAmount}
                  </div>
                </div>
                <div className="text-right text-[10px] font-bold bg-white/10 px-2 py-1 rounded">
                  {order.paymentStatus === 'paid' ? 'PREPAID' : 'COLLECT CASH'}
                </div>
              </div>

              {/* Recipient Information */}
              <div className="border-2 border-slate-950 rounded-xl p-3 bg-amber-50/40 space-y-1.5">
                <div className="text-[10px] font-black uppercase text-slate-600">
                  গ্রাহক / প্রাপক (CONSIGNEE):
                </div>
                <div className="text-base font-black text-slate-950">
                  {order.customer?.name}
                </div>
                <div className="text-sm font-black font-mono text-amber-800">
                  📞 {order.customer?.phone}
                </div>
                <div className="text-xs font-semibold text-slate-800 leading-snug">
                  📍 {order.customer?.address}, {order.customer?.city}
                </div>
                {order.customer?.notes && (
                  <div className="text-[10px] text-slate-600 italic pt-1 border-t border-slate-300">
                    নোট: {order.customer.notes}
                  </div>
                )}
              </div>

              {/* Sender Info & Items summary */}
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-300">
                <div>
                  <strong>প্রেরক:</strong> সাতক্ষীরা ঘর<br />
                  শ্যামনগর, সাতক্ষীরা<br />
                  হেল্পলাইন: ০১৭০০-০০০০০০
                </div>
                <div className="text-right">
                  <strong>অর্ডার:</strong> #{order.orderNumber}<br />
                  <strong>পণ্য সংখ্যা:</strong> {order.items?.length || 1} টি আইটেম<br />
                  <strong>ওজন:</strong> ~১-২ কেজি
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
