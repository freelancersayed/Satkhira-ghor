'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle,
  Truck,
  RotateCcw,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

export default function SalesReportView() {
  const [range, setRange] = useState('weekly'); // 'daily' | 'weekly' | 'monthly' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [range]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/reports?range=${range}`;
      if (range === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (e) {
      console.error('Fetch sales report error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    let url = `/api/admin/reports?range=${range}&format=csv`;
    if (range === 'custom' && startDate && endDate) {
      url += `&startDate=${startDate}&endDate=${endDate}`;
    }
    window.open(url, '_blank');
  };

  const summary = reportData?.summary;
  const orders = reportData?.orders || [];

  return (
    <div className="space-y-6">
      {/* Top Filter and Export Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#0F3D2E] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" />
            <span>আর্থিক ও বিক্রয় রিপোর্ট (Financial & Sales Report)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            নির্দিষ্ট সময়সীমার বিক্রয়, মুনাফা, ডেলিভারি ফি এবং অর্ডারের বিস্তারিত বিশ্লেষণ
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Quick Date Presets */}
          <div className="bg-[#FDFBF7] p-1 rounded-xl border border-[#E8E2D5] flex items-center gap-1 text-xs">
            <button
              onClick={() => setRange('daily')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === 'daily' ? 'bg-[#0F3D2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              আজ (Daily)
            </button>
            <button
              onClick={() => setRange('weekly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === 'weekly' ? 'bg-[#0F3D2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ৭ দিন (Weekly)
            </button>
            <button
              onClick={() => setRange('monthly')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === 'monthly' ? 'bg-[#0F3D2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ৩০ দিন (Monthly)
            </button>
            <button
              onClick={() => setRange('custom')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                range === 'custom' ? 'bg-[#0F3D2E] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              কাস্টম
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers */}
      {range === 'custom' && (
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E8E2D5] flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">শুরুর তারিখ:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E8E2D5] bg-white text-xs outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">শেষ তারিখ:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E8E2D5] bg-white text-xs outline-none"
            />
          </div>
          <button
            onClick={fetchReport}
            className="px-3 py-1.5 bg-[#0F3D2E] text-white rounded-lg font-bold hover:bg-[#15533f]"
          >
            ফিল্টার প্রয়োগ করুন
          </button>
        </div>
      )}

      {/* Financial Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>মোট আদায়যোগ্য বিক্রয়</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F3D2E]">
            ৳{summary?.totalRevenue ? summary.totalRevenue.toLocaleString('bn-BD') : 0}
          </div>
          <div className="text-[11px] text-slate-400">
            পণ্য বিক্রয় + ডেলিভারি চার্জ
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>নিট পণ্য বিক্রয়</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            ৳{summary?.netProductSales ? summary.netProductSales.toLocaleString('bn-BD') : 0}
          </div>
          <div className="text-[11px] text-slate-400">
            শুধুমাত্র পণ্য থেকে আয়
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>মোট অর্ডার সংখ্যা</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {summary?.totalOrders || 0} টি
          </div>
          <div className="text-[11px] text-slate-400">
            ডেলিভার্ড: {summary?.completedOrdersCount || 0} | বাতিল: {summary?.cancelledOrdersCount || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>গড় অর্ডার মূল্য (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">
            ৳{summary?.averageOrderValue ? summary.averageOrderValue.toLocaleString('bn-BD') : 0}
          </div>
          <div className="text-[11px] text-slate-400">
            প্রতি সক্রিয় অর্ডারে গড় বিল
          </div>
        </div>
      </div>

      {/* Orders Breakdown Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E8E2D5] flex justify-between items-center">
          <h4 className="font-bold text-xs text-[#0F3D2E]">
            রিপোর্টের অন্তর্ভুক্ত অর্ডারসমূহ ({orders.length} টি)
          </h4>
          <span className="text-[11px] text-slate-400">
            সময়সীমা: {range.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FDFBF7] text-slate-700 font-bold border-b border-[#E8E2D5]">
              <tr>
                <th className="py-3 px-4">অর্ডার নং</th>
                <th className="py-3 px-4">তারিখ</th>
                <th className="py-3 px-4">গ্রাহক</th>
                <th className="py-3 px-4">পদ্ধতি</th>
                <th className="py-3 px-4">সাবটোটাল</th>
                <th className="py-3 px-4">ডেলিভারি</th>
                <th className="py-3 px-4">মোট টাকা</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    রিপোর্ট ডাটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    এই সময়সীমায় কোনো অর্ডার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-emerald-50/20">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F3D2E]">
                      #{ord.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ord.customer?.name}</div>
                      <div className="text-[10px] text-slate-400">{ord.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-600">
                      {ord.paymentMethod}
                    </td>
                    <td className="py-3 px-4">৳{ord.subtotal}</td>
                    <td className="py-3 px-4">৳{ord.deliveryFee || 0}</td>
                    <td className="py-3 px-4 font-bold text-[#0F3D2E]">
                      ৳{ord.totalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
