'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  LogOut,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Star,
  MessageSquare,
  Sparkles,
  Trash2,
  Edit3,
  Camera,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ReviewModal from '@/components/product/ReviewModal';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading, logout, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'reviews'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [selectedOrderIdForReview, setSelectedOrderIdForReview] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/my-orders');
      return;
    }

    if (user) {
      fetchOrders();
      fetchReviews();
    }
  }, [user, isLoading, router]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch('/api/orders/my-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        const errData = await res.json();
        setError(errData.message || 'অর্ডার লোড করা সম্ভব হয়নি');
      }
    } catch (err) {
      setError('নেটওয়ার্ক সমস্যা: ' + err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await fetch('/api/reviews/my-reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Reviews load error:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOpenReviewModal = (item = null, orderNumber = '') => {
    if (item) {
      setSelectedProductForReview({
        _id: item.productId,
        name: item.name,
        slug: item.productId,
        image: item.image,
      });
      setSelectedOrderIdForReview(orderNumber);
    } else {
      setSelectedProductForReview(null);
      setSelectedOrderIdForReview('');
    }
    setEditingReview(null);
    setReviewModalOpen(true);
  };

  const handleEditReview = (rev) => {
    setSelectedProductForReview({
      _id: rev.product,
      name: rev.productName,
      slug: rev.productSlug,
      image: rev.productImage,
    });
    setEditingReview(rev);
    setReviewModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('আপনি কি সত্যিই এই রিভিউটি মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`/api/reviews/my-reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('রিভিউটি সফলভাবে মুছে ফেলা হয়েছে');
        fetchReviews();
      }
    } catch (e) {
      alert('মুছে ফেলতে সমস্যা হয়েছে');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5" />
            পেন্ডিং (যাচাই চলছে)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Package className="w-3.5 h-3.5" />
            প্রস্তুত হচ্ছে
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3.5 h-3.5" />
            ডেলিভারিতে রয়েছে
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" />
            সফলভাবে ডেলিভার্ড
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
            <XCircle className="w-3.5 h-3.5" />
            বাতিল করা হয়েছে
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (isLoading || (!user && loadingOrders)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 bg-[#FDFBF7]">
        <div className="w-10 h-10 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-600">প্রোফাইল লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-12 sm:py-16 bg-[#FDFBF7] min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F3D2E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-[#F59E0B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* User Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#0F3D2E]">{user.name}</h1>
              {user.role === 'admin' && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0F3D2E] text-white">
                  অ্যাডমিন
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>মোবাইল: {user.phone}</span>
              {user.email && <span>• ইমেইল: {user.email}</span>}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                অ্যাডমিন ড্যাশবোর্ড →
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="flex items-center gap-3 border-b border-[#E8E2D5] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#0F3D2E] text-white shadow-sm'
                : 'text-slate-600 hover:bg-emerald-50/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>আমার অর্ডারসমূহ ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'reviews'
                ? 'bg-[#0F3D2E] text-white shadow-sm'
                : 'text-slate-600 hover:bg-emerald-50/50'
            }`}
          >
            <Star className="w-4 h-4 text-[#F59E0B] fill-current" />
            <span>পণ্য ফিডব্যাক ও রিভিউ ({reviews.length})</span>
          </button>
        </div>

        {/* ── TAB 1: ORDERS SECTION ─────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#F59E0B]" />
                <span>আপনার অর্ডারসমূহ</span>
              </h2>
              <Link
                href="/track-order"
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                লাইভ ট্র্যাকিং পেজ →
              </Link>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loadingOrders ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E2D5]">
                <div className="w-8 h-8 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">অর্ডার তালিকা লোড হচ্ছে...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D5] p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#0F3D2E] flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#0F3D2E]">
                  আপনি এখনো কোনো অর্ডার করেননি
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার ঐতিহ্যবাহী পণ্যের সংগ্রহ দেখতে আমাদের শপে ঘুরে আসুন।
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs shadow-md hover:scale-[1.02] transition-all"
                >
                  <span>পণ্য দেখুন ও অর্ডার করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id || order.orderNumber}
                    className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm hover:border-[#0F3D2E]/30 transition-all space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E2D5]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">অর্ডার আইডি:</span>
                          <span className="font-mono font-bold text-[#0F3D2E] text-sm">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('bn-BD', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : 'সাম্প্রতিক'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.orderStatus)}
                      </div>
                    </div>

                    {/* Items List with Review Action */}
                    <div className="divide-y divide-[#E8E2D5]">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#FEF3C7] flex-shrink-0 border border-[#E8E2D5]">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs">
                                  📦
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#0F3D2E] truncate">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {item.unit && <span>{item.unit} • </span>}
                                পরিমাণ: {item.quantity} টি
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <span className="text-xs font-bold text-[#0F3D2E]">
                              ৳{item.price * item.quantity}
                            </span>
                            {/* LIVE REVIEW BUTTON FOR PRODUCT */}
                            <button
                              type="button"
                              onClick={() => handleOpenReviewModal(item, order.orderNumber)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#FEF3C7] hover:bg-amber-200 text-[#0F3D2E] rounded-lg text-[11px] font-bold border border-amber-300 transition-all hover:scale-105 shadow-sm"
                            >
                              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                              <span>রিভিউ দিন</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer */}
                    <div className="pt-4 border-t border-[#E8E2D5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div className="text-slate-600 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          <span>ঠিকানা: {order.customer?.address}, {order.customer?.city}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          পেমেন্ট পদ্ধতি: {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'মোবাইল ব্যাংকিং'}
                        </div>
                      </div>

                      <div className="text-right font-black text-sm text-[#0F3D2E] bg-[#FDFBF7] px-4 py-2 rounded-xl border border-[#E8E2D5]">
                        মোট পরিশোধযোগ্য: ৳{order.totalAmount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: FEEDBACK & LIVE REVIEWS SECTION ─────────────────── */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#F59E0B] fill-current" />
                  <span>আপনার পণ্য ফিডব্যাক ও মতামত</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  আপনার রিভিউ সরাসরি প্রতিটি পণ্যের পেজে লাইভ দেখানো হয়
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleOpenReviewModal(null)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>+ যেকোনো পণ্যের রিভিউ দিন</span>
              </button>
            </div>

            {loadingReviews ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E2D5]">
                <div className="w-8 h-8 border-4 border-[#0F3D2E] border-t-[#F59E0B] rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">রিভিউ লোড হচ্ছে...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E2D5] p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#0F3D2E] flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#0F3D2E]">
                  আপনি এখনো কোনো পণ্যের রিভিউ দেননি
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  আমাদের অর্ডারের পণ্য ব্যবহার করে আপনার মূল্যবান অভিজ্ঞতা ও ছবি দিয়ে রিভিউ দিন।
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal(null)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md hover:scale-[1.02]"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>প্রথম রিভিউটি লিখুন</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white rounded-3xl p-5 border border-[#E8E2D5] shadow-sm space-y-3 hover:border-[#0F3D2E]/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Product Header */}
                      <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D5]">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FEF3C7] flex-shrink-0 border border-[#E8E2D5]">
                          {rev.productImage ? (
                            <img
                              src={rev.productImage}
                              alt={rev.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">🍯</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${rev.productSlug}`}
                            className="text-xs font-bold text-[#0F3D2E] hover:text-amber-700 truncate block"
                          >
                            {rev.productName}
                          </Link>
                          <div className="flex items-center gap-1 text-[#F59E0B] mt-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating ? 'fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-[10px] font-bold text-[#0F3D2E] ml-1">
                              ({rev.rating}/৫)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{rev.comment}"
                      </p>

                      {/* Photo Attached */}
                      {rev.images && rev.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {rev.images.map((img, i) => (
                            <div
                              key={i}
                              className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E8E2D5]"
                            >
                              <img
                                src={img}
                                alt="Attached review photo"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta & Actions */}
                    <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditReview(rev)}
                          className="p-1.5 rounded-lg text-[#0F3D2E] hover:bg-[#FEF3C7] transition-colors"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={selectedProductForReview}
        orderId={selectedOrderIdForReview}
        existingReview={editingReview}
        onSuccess={() => {
          showToast('আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!');
          fetchReviews();
          setActiveTab('reviews');
        }}
      />
    </div>
  );
}
