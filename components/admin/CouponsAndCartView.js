'use client';

import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  ShoppingCart,
  Percent,
} from 'lucide-react';

export default function CouponsAndCartView() {
  const [coupons, setCoupons] = useState([]);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [subTab, setSubTab] = useState('coupons'); // 'coupons' | 'abandoned'
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingCarts, setLoadingCarts] = useState(false);

  // New Coupon Form
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'fixed',
    discountAmount: '',
    minOrderAmount: '',
    expiryDate: '',
    usageLimit: 100,
  });
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchCoupons();
    fetchAbandonedCarts();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch (e) {
      console.error('Fetch coupons failed:', e);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchAbandonedCarts = async () => {
    try {
      setLoadingCarts(true);
      const res = await fetch('/api/admin/abandoned-carts');
      if (res.ok) {
        const data = await res.json();
        setAbandonedCarts(data.carts || []);
      }
    } catch (e) {
      console.error('Fetch carts failed:', e);
    } finally {
      setLoadingCarts(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setFormMsg({ text: '', type: '' });

    if (!newCoupon.code || !newCoupon.discountAmount) {
      setFormMsg({ text: 'কোড এবং ছাড়ের পরিমাণ দিন', type: 'error' });
      return;
    }

    try {
      setCreatingCoupon(true);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'কুপন তৈরি করতে সমস্যা হয়েছে');

      setFormMsg({ text: 'কুপন সফলভাবে তৈরি হয়েছে!', type: 'success' });
      setNewCoupon({
        code: '',
        description: '',
        discountType: 'fixed',
        discountAmount: '',
        minOrderAmount: '',
        expiryDate: '',
        usageLimit: 100,
      });
      fetchCoupons();
    } catch (err) {
      setFormMsg({ text: err.message, type: 'error' });
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত যে কুপনটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCoupons();
      }
    } catch (e) {
      alert('কুপন মুছতে ব্যর্থ হয়েছে');
    }
  };

  const handleUpdateCartStatus = async (id, recoveryStatus) => {
    try {
      await fetch('/api/admin/abandoned-carts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, recoveryStatus }),
      });
      fetchAbandonedCarts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Switch */}
      <div className="flex gap-2 border-b border-[#E8E2D5] pb-3">
        <button
          onClick={() => setSubTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'coupons'
              ? 'bg-[#0F3D2E] text-white'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>কুপন ও ডিসকাউন্ট ভাউচার ({coupons.length})</span>
        </button>

        <button
          onClick={() => setSubTab('abandoned')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            subTab === 'abandoned'
              ? 'bg-[#0F3D2E] text-white'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>অসম্পূর্ণ কার্ট রিকভারি (Abandoned Carts)</span>
        </button>
      </div>

      {/* ================= TAB: COUPONS ================= */}
      {subTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coupon Form */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E8E2D5] shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#0F3D2E] flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>নতুন কুপন কোড তৈরি করুন</span>
            </h4>

            {formMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  formMsg.type === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">কুপন কোড *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: EID50 বা SATKHIRA100"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] uppercase font-mono font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ছাড়ের ধরন</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                  >
                    <option value="fixed">নির্দিষ্ট টাকা (Fixed BDT)</option>
                    <option value="percentage">শতকরা হার (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ছাড়ের পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    placeholder={newCoupon.discountType === 'percentage' ? '10' : '100'}
                    value={newCoupon.discountAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ন্যূনতম অর্ডার (৳)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ব্যবহারের সীমা</label>
                  <input
                    type="number"
                    value={newCoupon.usageLimit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">মেয়াদ উত্তীর্ণের তারিখ</label>
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={creatingCoupon}
                className="w-full py-2.5 bg-[#0F3D2E] hover:bg-[#15533f] text-white font-bold rounded-xl shadow-sm transition-all text-xs"
              >
                {creatingCoupon ? 'তৈরি হচ্ছে...' : 'কুপন সক্রিয় করুন'}
              </button>
            </form>
          </div>

          {/* Coupons List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#E8E2D5] flex justify-between items-center">
              <h4 className="font-bold text-xs text-[#0F3D2E]">সক্রিয় কুপন তালিকা</h4>
              <span className="text-[11px] text-slate-400">মোট {coupons.length} টি</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FDFBF7] text-slate-700 font-bold border-b border-[#E8E2D5]">
                  <tr>
                    <th className="p-3">কুপন কোড</th>
                    <th className="p-3">ছাড়</th>
                    <th className="p-3">ন্যূনতম অর্ডার</th>
                    <th className="p-3">ব্যবহার</th>
                    <th className="p-3">মেয়াদ</th>
                    <th className="p-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D5]">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-400">
                        কোনো কুপন তৈরি করা হয়নি
                      </td>
                    </tr>
                  ) : (
                    coupons.map((c) => (
                      <tr key={c._id} className="hover:bg-emerald-50/20">
                        <td className="p-3">
                          <span className="font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            {c.code}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#0F3D2E]">
                          {c.discountType === 'percentage' ? `${c.discountAmount}%` : `৳${c.discountAmount}`}
                        </td>
                        <td className="p-3 text-slate-600">
                          {c.minOrderAmount ? `৳${c.minOrderAmount}` : 'কোনো শর্ত নেই'}
                        </td>
                        <td className="p-3 text-slate-500">
                          {c.usedCount} / {c.usageLimit}
                        </td>
                        <td className="p-3 text-slate-400">
                          {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('bn-BD') : 'আজীবন'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: ABANDONED CARTS ================= */}
      {subTab === 'abandoned' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E8E2D5] flex justify-between items-center">
            <div>
              <h4 className="font-bold text-xs text-[#0F3D2E]">
                অসম্পূর্ণ কার্ট ও ড্রপ-অফ ক্রেতা তালিকা (Abandoned Cart Logs)
              </h4>
              <p className="text-[11px] text-slate-400">
                যেসব ক্রেতা তথ্য দিয়েও চেকআউট সম্পন্ন করেননি তাদের ফলো-আপ করুন
              </p>
            </div>
            <button
              onClick={fetchAbandonedCarts}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              রিফ্রেশ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FDFBF7] text-slate-700 font-bold border-b border-[#E8E2D5]">
                <tr>
                  <th className="p-3">ক্রেতার নাম ও ফোন</th>
                  <th className="p-3">আইটেম সংখ্যা</th>
                  <th className="p-3">কার্ট মোট</th>
                  <th className="p-3">ড্রপ-অফ ধাপ</th>
                  <th className="p-3">রিকভারি স্ট্যাটাস</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {abandonedCarts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      কোনো অসম্পূর্ণ কার্ট নেই
                    </td>
                  </tr>
                ) : (
                  abandonedCarts.map((cart) => (
                    <tr key={cart._id} className="hover:bg-emerald-50/20">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{cart.customer?.name}</div>
                        <a href={`tel:${cart.customer?.phone}`} className="text-amber-700 font-mono text-[11px] hover:underline">
                          {cart.customer?.phone}
                        </a>
                      </td>
                      <td className="p-3">{cart.items?.length || 1} টি</td>
                      <td className="p-3 font-bold text-[#0F3D2E]">৳{cart.cartTotal}</td>
                      <td className="p-3 text-slate-500 capitalize">{cart.step}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            cart.recoveryStatus === 'recovered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : cart.recoveryStatus === 'contacted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {cart.recoveryStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => handleUpdateCartStatus(cart._id, 'contacted')}
                          className="px-2 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px]"
                        >
                          যোগাযোগ করা হয়েছে
                        </button>
                        <button
                          onClick={() => handleUpdateCartStatus(cart._id, 'recovered')}
                          className="px-2 py-1 bg-emerald-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          রিকভার্ড
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
