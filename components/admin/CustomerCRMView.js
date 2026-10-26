'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Star,
  Award,
  TrendingUp,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  X,
  ShieldCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import CourierFraudBadge from './CourierFraudBadge';

export default function CustomerCRMView({ isManagerOrAdmin }) {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [tierFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/crm/customers?tier=${tierFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Fetch CRM error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.phone?.includes(s) || c.city?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Top CRM KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">মোট স্বতন্ত্র ক্রেতা</div>
            <div className="text-2xl font-black text-[#0F3D2E]">
              {summary?.totalUniqueCustomers || customers.length} জন
            </div>
            <div className="text-[11px] text-slate-400">অনন্য ফোন নম্বর ভিত্তিক ডাটাবেজ</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0F3D2E] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">কাস্টমার লাইফটাইম ভ্যালু (LTV)</div>
            <div className="text-2xl font-black text-amber-600">
              ৳{summary?.totalLtv ? summary.totalLtv.toLocaleString('bn-BD') : 0}
            </div>
            <div className="text-[11px] text-slate-400">মোট সক্রিয় ক্রয় মূল্য</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E8E2D5] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">ভিআইপি (VIP) লয়ালটি ক্রেতা</div>
            <div className="text-2xl font-black text-purple-700">
              {summary?.vipCount || customers.filter((c) => c.tier === 'VIP').length} জন
            </div>
            <div className="text-[11px] text-slate-400">৫+ অর্ডার অথবা ৫,০০০+ টাকার বিক্রয়</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="গ্রাহকের নাম, মোবাইল নম্বর বা শহর দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#0F3D2E]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none"
          >
            <option value="all">সকল লয়ালটি টিয়ার</option>
            <option value="vip">ভিআইপি (VIP Customers)</option>
            <option value="regular">রেগুলার (Regular)</option>
            <option value="new">নতুন ক্রেতা (New)</option>
          </select>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FDFBF7] text-slate-700 font-bold border-b border-[#E8E2D5]">
              <tr>
                <th className="py-3.5 px-4">গ্রাহক ও মোবাইল</th>
                <th className="py-3.5 px-4">টিয়ার (Tier)</th>
                <th className="py-3.5 px-4">অবস্থান</th>
                <th className="py-3.5 px-4">মোট অর্ডার</th>
                <th className="py-3.5 px-4">লাইফটাইম স্পেন্ড (LTV)</th>
                <th className="py-3.5 px-4">ডেলিভারি রেকর্ড</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    কাস্টমার ডিরেক্টরি লোড হচ্ছে...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    কোনো গ্রাহক পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <a href={`tel:${c.phone}`} className="text-amber-700 font-mono text-[11px] hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                          c.tier === 'VIP'
                            ? 'bg-purple-100 text-purple-900 border border-purple-300'
                            : c.tier === 'Regular'
                            ? 'bg-blue-100 text-blue-900 border border-blue-300'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.city}</div>
                      <div className="text-[10px] text-slate-400 max-w-xs truncate">{c.address}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.totalOrders} টি
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#0F3D2E] text-sm">
                      ৳{c.totalSpent?.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3.5 px-4">
                      <CourierFraudBadge
                        fraudRisk={c.fraudRisk}
                        successRate={c.successRate}
                        cancelledDeliveries={c.cancelledCount}
                        compact={true}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 bg-[#0F3D2E] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 ml-auto hover:bg-emerald-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>হিস্টোরি</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E8E2D5] shadow-2xl space-y-4 my-6">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E2D5]">
              <div>
                <h3 className="text-base font-bold text-[#0F3D2E]">
                  ক্রেতার প্রোফাইল: {selectedCustomer.name}
                </h3>
                <span className="text-xs text-amber-700 font-mono">
                  {selectedCustomer.phone}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Stats Cards */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8E2D5]">
                <div className="text-[10px] text-slate-500">মোট অর্ডার</div>
                <div className="text-base font-black text-slate-900">
                  {selectedCustomer.totalOrders} টি
                </div>
              </div>
              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8E2D5]">
                <div className="text-[10px] text-slate-500">লাইফটাইম স্পেন্ড</div>
                <div className="text-base font-black text-[#0F3D2E]">
                  ৳{selectedCustomer.totalSpent}
                </div>
              </div>
              <div className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E8E2D5]">
                <div className="text-[10px] text-slate-500">গড় অর্ডার ভ্যালু</div>
                <div className="text-base font-black text-amber-700">
                  ৳{selectedCustomer.averageOrderValue}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <div><strong>ঠিকানা:</strong> {selectedCustomer.address}, {selectedCustomer.city}</div>
              {selectedCustomer.email && <div><strong>ইমেইল:</strong> {selectedCustomer.email}</div>}
              <div><strong>প্রথম ক্রয়ের তারিখ:</strong> {new Date(selectedCustomer.firstOrderDate).toLocaleDateString('bn-BD')}</div>
            </div>

            {/* Orders List */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#0F3D2E]">সাম্প্রতিক অর্ডার তালিকা:</h4>
              <div className="divide-y divide-[#E8E2D5] max-h-48 overflow-y-auto">
                {selectedCustomer.recentOrders?.map((ord, i) => (
                  <div key={i} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-mono font-bold text-slate-900">#{ord.orderNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString('bn-BD')} • {ord.itemsCount} টি আইটেম
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0F3D2E]">৳{ord.totalAmount}</div>
                      <span className="text-[10px] font-bold capitalize text-slate-500">{ord.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
