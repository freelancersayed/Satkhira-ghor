'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQ) {
      performSearch(initialQ);
    }
  }, [initialQ]);

  const performSearch = async (searchTerm) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'অর্ডারটি খুঁজে পাওয়া যায়নি');
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    performSearch(query);
  };

  const steps = [
    { key: 'pending', title: 'অর্ডার গৃহীত', desc: 'অর্ডারটি যাচাই করা হচ্ছে' },
    { key: 'processing', title: 'প্রস্তুত হচ্ছে', desc: 'প্যাকেজিং সম্পন্ন হচ্ছে' },
    { key: 'shipped', title: 'শিপড / ট্রানজিট', desc: 'কুরিয়ারে হস্তান্তর করা হয়েছে' },
    { key: 'delivered', title: 'ডেলিভার্ড', desc: 'সফলভাবে গ্রাহকের হাতে পৌঁছেছে' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
        return 3;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#FDFBF7] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            লাইভ অর্ডার ট্র্যাকিং
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">
            আপনার পার্সেলের বর্তমান অবস্থান জানুন
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            অর্ডার করার সময় প্রাপ্ত অর্ডার আইডি (যেমন: <strong>SKG-123456</strong>) অথবা আপনার মোবাইল নম্বরটি নিচে লিখুন
          </p>
        </div>

        {/* Search Bar Form */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl border border-[#E8E2D5] shadow-md flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="অর্ডার নম্বর (SKG-...) বা মোবাইল নম্বর"
              className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>ট্র্যাক করুন</span>
            )}
          </button>
        </form>

        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results */}
        {searched && !loading && orders.length > 0 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-600 font-bold">
              পাওয়া গেছে: {orders.length} টি অর্ডার
            </p>

            {orders.map((order) => {
              const currentStep = getStepIndex(order.orderStatus);

              return (
                <div
                  key={order._id || order.orderNumber}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-md space-y-6"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-[#E8E2D5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">অর্ডার নম্বর:</span>
                        <span className="font-mono font-bold text-[#0F3D2E] text-base">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        গ্রাহক: {order.customer?.name} ({order.customer?.phone})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500">সর্বমোট টাকা:</div>
                      <div className="text-base font-black text-[#0F3D2E]">
                        ৳{order.totalAmount}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Timeline */}
                  {order.orderStatus === 'cancelled' ? (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                      এই অর্ডারটি বাতিল করা হয়েছে। বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                        {steps.map((st, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div
                              key={st.key}
                              className={`p-4 rounded-2xl border text-center transition-all ${
                                isCurrent
                                  ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-md'
                                  : isDone
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : 'bg-[#FDFBF7] border-[#E8E2D5] text-slate-400'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold ${
                                  isCurrent
                                    ? 'bg-[#F59E0B] text-slate-950 font-black'
                                    : isDone
                                    ? 'bg-[#0F3D2E] text-white'
                                    : 'bg-[#E8E2D5] text-slate-600'
                                }`}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <h4 className="text-xs font-bold">{st.title}</h4>
                              <p
                                className={`text-[10px] mt-0.5 ${
                                  isCurrent ? 'text-emerald-100/90' : 'text-slate-500'
                                }`}
                              >
                                {st.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items Ordered */}
                  <div className="bg-[#FDFBF7] rounded-2xl p-4 border border-[#E8E2D5] space-y-3">
                    <h4 className="text-xs font-bold text-[#0F3D2E]">
                      অর্ডারের পণ্যসমূহ ({order.items?.length}):
                    </h4>
                    <div className="divide-y divide-[#E8E2D5]">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-[#0F3D2E]">
                            {it.name} <span className="text-slate-500">× {it.quantity}</span>
                          </span>
                          <span className="font-bold text-[#0F3D2E]">
                            ৳{it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-[#E8E2D5] flex justify-between text-xs text-slate-600">
                      <span>ডেলিভারি ঠিকানা: {order.customer?.address}, {order.customer?.city}</span>
                      <span className="font-bold text-[#0F3D2E]">
                        পেমেন্ট: {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'অনলাইন'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
          <div className="w-10 h-10 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
