'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  ShoppingCart,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  RefreshCw,
  Search,
  ArrowRight,
  TrendingUp,
  DollarSign,
  User,
  MapPin,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function IncompleteOrdersView({ onOrderCreated, showNotification }) {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stepFilter, setStepFilter] = useState('all');
  const [convertingId, setConvertingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/abandoned-carts?limit=200');
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts || []);
      }
    } catch (err) {
      console.error('Fetch incomplete orders failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, recoveryStatus) => {
    try {
      const res = await fetch('/api/admin/abandoned-carts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, recoveryStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        if (showNotification) showNotification('রিকভারি স্ট্যাটাস আপডেট করা হয়েছে', 'success');
        setCarts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, recoveryStatus } : c))
        );
      } else {
        if (showNotification) showNotification(data.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      if (showNotification) showNotification('স্ট্যাটাস আপডেট এরর: ' + err.message, 'error');
    }
  };

  const handleConvertToOrder = async (cart) => {
    if (
      !confirm(
        `আপনি কি নিশ্চিত যে "${cart.customer?.name || cart.customer?.phone}"-এর এই অসম্পূর্ণ কার্টটিকে একটি লাইভ কনফার্মড অর্ডারে রূপান্তর করতে চান?`
      )
    ) {
      return;
    }

    try {
      setConvertingId(cart._id);
      const res = await fetch('/api/admin/abandoned-carts/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartId: cart._id,
          paymentMethod: 'cod',
          customNotes: 'অ্যাডমিন কর্তৃক সরাসরি কনফার্মড অর্ডার',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (showNotification) {
          showNotification(data.message || 'সফলভাবে অর্ডারে রূপান্তর হয়েছে!', 'success');
        }
        // Mark as recovered in local state
        setCarts((prev) =>
          prev.map((c) =>
            c._id === cart._id
              ? {
                  ...c,
                  recoveryStatus: 'recovered',
                  notes: `সফল রিকভারি: #${data.order?.orderNumber} অর্ডারে রূপান্তর`,
                }
              : c
          )
        );
        if (onOrderCreated) {
          onOrderCreated(data.order);
        }
      } else {
        if (showNotification) showNotification(data.message || 'অর্ডারে রূপান্তর ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      if (showNotification) showNotification('রূপান্তর এরর: ' + err.message, 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const handleDeleteCart = async (id, custIdentifier) => {
    if (!confirm(`আপনি কি "${custIdentifier}"-এর এই অসম্পূর্ণ কার্ট রেকর্ডটি মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/admin/abandoned-carts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        if (showNotification) showNotification('অসম্পূর্ণ কার্ট মুছে ফেলা হয়েছে', 'success');
        setCarts((prev) => prev.filter((c) => c._id !== id));
      } else {
        if (showNotification) showNotification(data.message || 'মুছতে ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      if (showNotification) showNotification('মুছতে সমস্যা হয়েছে: ' + err.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const total = carts.length;
    const pending = carts.filter((c) => c.recoveryStatus === 'pending').length;
    const recovered = carts.filter((c) => c.recoveryStatus === 'recovered').length;
    const potentialRevenue = carts
      .filter((c) => c.recoveryStatus !== 'recovered' && c.recoveryStatus !== 'lost')
      .reduce((sum, c) => sum + (Number(c.cartTotal) || 0), 0);

    return { total, pending, recovered, potentialRevenue };
  }, [carts]);

  // Filtered Carts
  const filteredCarts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return carts.filter((c) => {
      const name = (c.customer?.name || '').toLowerCase();
      const phone = (c.customer?.phone || '').toLowerCase();
      const city = (c.customer?.city || '').toLowerCase();
      const itemMatch = c.items?.some((it) => (it.name || '').toLowerCase().includes(q));

      const matchesSearch = !q || name.includes(q) || phone.includes(q) || city.includes(q) || itemMatch;
      const matchesStatus = statusFilter === 'all' || c.recoveryStatus === statusFilter;
      const matchesStep = stepFilter === 'all' || c.step === stepFilter;

      return matchesSearch && matchesStatus && matchesStep;
    });
  }, [carts, searchQuery, statusFilter, stepFilter]);

  return (
    <div className="space-y-4">
      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>মোট অসম্পূর্ণ কার্ট</span>
            <ShoppingCart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total} টি</div>
          <div className="text-[11px] text-slate-400">চেকআউট ড্রপ-অফ রেকর্ড</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>পেন্ডিং ফলো-আপ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{metrics.pending} টি</div>
          <div className="text-[11px] text-amber-700/80 font-medium">যোগাযোগ করা আবশ্যক</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>সফল রিকভারি</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#016831]">{metrics.recovered} টি</div>
          <div className="text-[11px] text-emerald-700/80 font-medium">অর্ডারে রূপান্তরিত</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs space-y-1">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span>সম্ভাব্য রিকভারি রাজস্ব</span>
            <DollarSign className="w-4 h-4 text-[#016831]" />
          </div>
          <div className="text-2xl font-black text-[#016831]">৳{metrics.potentialRevenue}</div>
          <div className="text-[11px] text-slate-400">ড্রপ-অফ কার্টের মোট মূল্য</div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্রেতার নাম, মোবাইল বা পণ্যের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Recovery Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none cursor-pointer"
          >
            <option value="all">সব রিকভারি স্ট্যাটাস</option>
            <option value="pending">পেন্ডিং (Pending)</option>
            <option value="contacted">যোগাযোগ করা হয়েছে (Contacted)</option>
            <option value="recovered">রিকভার্ড (Recovered)</option>
            <option value="lost">বাতিল (Lost)</option>
          </select>

          {/* Step Filter */}
          <select
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[#E8E2D5] text-xs bg-white text-slate-900 outline-none cursor-pointer"
          >
            <option value="all">সব ড্রপ-অফ ধাপ</option>
            <option value="address_entered">ঠিকানা প্রদান করা হয়েছে</option>
            <option value="checkout_initiated">চেকআউট শুরু করেছিল</option>
            <option value="payment_aborted">পেমেন্ট বাতিল হয়েছে</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchCarts}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Incomplete Orders Data Table ── */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FDFBF7] text-slate-600 font-bold border-b border-[#E8E2D5]">
              <tr>
                <th className="py-3 px-4">ক্রেতার তথ্য ও মোবাইল</th>
                <th className="py-3 px-4">কার্টের পণ্যসমূহ</th>
                <th className="py-3 px-4">কার্ট মোট</th>
                <th className="py-3 px-4">ড্রপ-অফ ধাপ</th>
                <th className="py-3 px-4">রিকভারি স্ট্যাটাস</th>
                <th className="py-3 px-4">ড্রপ-অফের সময়</th>
                <th className="py-3 px-4 text-right">ফলো-আপ ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D5]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-3 border-[#016831] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-2" />
                    অসম্পূর্ণ অর্ডার লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    কোনো অসম্পূর্ণ অর্ডার বা ড্রপ-অফ কার্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredCarts.map((cart) => {
                  const cleanPhone = (cart.customer?.phone || '').replace(/[^0-9]/g, '');
                  const itemsListText = (cart.items || []).map((it) => it.name).join(', ');
                  const whatsappMessage = `সালামু আলাইকুম ${cart.customer?.name || ''}! সাতক্ষীরা ঘর (Satkhira Ghor)-এ আপনি ${itemsListText || 'পণ্য'} কার্টে যুক্ত করেছিলেন কিন্তু অর্ডারটি সম্পন্ন হয়নি। আপনি কি অর্ডারটি কনফার্ম করতে চান? আমরা আপনাকে ফ্রি ডেলিভারিতে দ্রুত পণ্য পাঠিয়ে দেব ইনশাআল্লাহ। সাহায্য প্রয়োজন হলে সরাসরি রিপ্লাই দিন।`;

                  return (
                    <tr
                      key={cart._id}
                      className={`transition-colors ${
                        cart.recoveryStatus === 'recovered'
                          ? 'bg-emerald-50/30 hover:bg-emerald-50/50'
                          : 'hover:bg-amber-50/20'
                      }`}
                    >
                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cart.customer?.name || 'অজ্ঞাত ক্রেতা'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`tel:${cart.customer?.phone}`}
                            className="font-mono text-amber-700 hover:underline font-bold"
                          >
                            {cart.customer?.phone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/88${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="WhatsApp-এ মেসেজ পাঠান"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        {cart.customer?.address && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs" title={cart.customer.address}>
                            📍 {cart.customer.address}, {cart.customer.city}
                          </div>
                        )}
                      </td>

                      {/* Items Preview */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={itemsListText}>
                          {cart.items?.length || 1}টি আইটেম ({cart.items?.map((i) => i.name).slice(0, 2).join(', ')}
                          {(cart.items?.length || 0) > 2 ? '...' : ''})
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {cart.items?.map((it) => `${it.quantity}× ৳${it.price}`).join(', ')}
                        </div>
                      </td>

                      {/* Cart Total */}
                      <td className="py-3 px-4 font-bold text-[#016831] whitespace-nowrap">
                        ৳{cart.cartTotal}
                      </td>

                      {/* Drop-off Step */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            cart.step === 'address_entered'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : cart.step === 'payment_aborted'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {cart.step === 'address_entered'
                            ? 'ঠিকানা প্রদান সম্পন্ন'
                            : cart.step === 'payment_aborted'
                            ? 'পেমেন্ট বাতিল'
                            : 'চেকআউট শুরু করেছিল'}
                        </span>
                      </td>

                      {/* Recovery Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <select
                          value={cart.recoveryStatus || 'pending'}
                          onChange={(e) => handleUpdateStatus(cart._id, e.target.value)}
                          className={`py-1 px-2 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                            cart.recoveryStatus === 'recovered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : cart.recoveryStatus === 'contacted'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : cart.recoveryStatus === 'lost'
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          <option value="pending">⏳ পেন্ডিং (Pending)</option>
                          <option value="contacted">📞 যোগাযোগ করা হয়েছে</option>
                          <option value="recovered">✓ সফল রিকভারি (Recovered)</option>
                          <option value="lost">✕ বাতিল (Lost)</option>
                        </select>
                      </td>

                      {/* Last Activity Time */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div>
                          {cart.lastActivityAt
                            ? new Date(cart.lastActivityAt).toLocaleDateString('bn-BD', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : 'আজ'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cart.lastActivityAt
                            ? new Date(cart.lastActivityAt).toLocaleTimeString('bn-BD', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* WhatsApp Follow-up */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/88${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                            title="হোয়াটসঅ্যাপে রিকভারি মেসেজ পাঠান"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Convert to Live Order */}
                        {cart.recoveryStatus !== 'recovered' && (
                          <button
                            type="button"
                            disabled={convertingId === cart._id}
                            onClick={() => handleConvertToOrder(cart)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#016831] hover:bg-[#014D24] text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                            title="১-ক্লিকে নিশ্চিত অর্ডারে রূপান্তর করুন"
                          >
                            <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                            <span>{convertingId === cart._id ? 'অর্ডার তৈরি হচ্ছে...' : 'অর্ডারে রূপান্তর'}</span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={deletingId === cart._id}
                          onClick={() => handleDeleteCart(cart._id, cart.customer?.name || cart.customer?.phone)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="রেকর্ড মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
