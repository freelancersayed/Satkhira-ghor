'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, MessageSquare, ThumbsUp, Sparkles, Image as ImageIcon, Camera } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ReviewModal from '@/components/product/ReviewModal';

export default function ProductReviewsSection({ product }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReviews = async () => {
    if (!product?.slug && !product?._id) return;
    try {
      setLoading(true);
      const url = product._id
        ? `/api/reviews?productId=${product._id}`
        : `/api/reviews?slug=${product.slug}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?.slug, product?._id]);

  const handleReviewSuccess = (newReview) => {
    fetchReviews();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFE9DC] shadow-sm space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EFE9DC]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B4D3E]">
              গ্রাহকদের লাইভ মতামত ও রিভিউ
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF0D4] text-[#7E4E18]">
              {stats.totalReviews} টি রিভিউ
            </span>
          </div>
          <p className="text-xs text-[#4A5B53] mt-1">
            সরাসরি ক্রেতাদের খাঁটি অভিজ্ঞতা ও মতামত
          </p>
        </div>

        {user ? (
          <button
            onClick={() => setIsModalOpen(true)}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] rounded-2xl text-xs font-bold transition-all shadow-md hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            <span>একটি রিভিউ দিন</span>
          </button>
        ) : (
          <Link
            href={`/login?redirect=/products/${product.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FAF0D4] hover:bg-[#ebdcb4] text-[#1B4D3E] rounded-2xl text-xs font-bold transition-all border border-[#E5A93C]/40"
          >
            <Sparkles className="w-4 h-4 text-[#E5A93C]" />
            <span>রিভিউ দিতে লগইন করুন</span>
          </Link>
        )}
      </div>

      {/* Rating Score Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-[#FAF8F4] border border-[#EFE9DC]">
        {/* Big Average Score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-[#EFE9DC]">
          <span className="text-5xl font-black text-[#1B4D3E]">
            {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '৫.০'}
          </span>
          <div className="flex items-center gap-1 text-[#E5A93C] my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating || 5)
                    ? 'fill-[#E5A93C] text-[#E5A93C]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-bold text-[#4A5B53]">
            {stats.totalReviews > 0
              ? `${stats.totalReviews} জন ক্রেতার রেটিং এর ভিত্তিতে`
              : '১০০% খাঁটি ও সন্তুষ্ট গ্রাহক'}
          </p>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = stats.distribution?.[stars] || 0;
            const percent = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#1B4D3E] flex items-center gap-1">
                  {stars} <Star className="w-3.5 h-3.5 fill-[#E5A93C] text-[#E5A93C]" />
                </span>
                <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-[#E5A93C] rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] font-bold text-[#8C9C93]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-3 border-[#1B4D3E] border-t-[#E5A93C] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#8C9C93]">রিভিউ লোড হচ্ছে...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-[#FCFBF7] border border-dashed border-[#C8D8D0] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0D4] text-[#1B4D3E] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#1B4D3E]">
              এখনো কোনো গ্রাহক রিভিউ দেননি
            </h4>
            <p className="text-xs text-[#4A5B53] max-w-sm mx-auto">
              আপনি কি এই পণ্যটি ব্যবহার করেছেন? আপনার মূল্যবান রিভিউ অন্যদের পণ্যটি চিনতে সাহায্য করবে।
            </p>
            {user ? (
              <button
                onClick={() => setIsModalOpen(true)}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl text-xs font-bold hover:bg-[#153D31] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>প্রথম রিভিউটি দিন</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-[#EFE9DC]">
            {reviews.map((rev) => (
              <div key={rev._id} className="py-5 space-y-3">
                {/* User & Rating Meta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#1B4D3E] text-[#FAF0D4] flex items-center justify-center font-bold text-sm shadow-sm">
                      {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1B4D3E]">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3" />
                            যাচাইকৃত ক্রেতা
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8C9C93] mt-0.5">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : 'সাম্প্রতিক'}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-[#E5A93C]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-[#4A5B53] leading-relaxed pl-13">
                  {rev.comment}
                </p>

                {/* Customer Uploaded Photos */}
                {rev.images && rev.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pl-13">
                    {rev.images.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setPreviewImage(img)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#EFE9DC] cursor-pointer hover:opacity-90 hover:scale-105 transition-all shadow-sm"
                      >
                        <img
                          src={img}
                          alt="Customer review photo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
        onSuccess={handleReviewSuccess}
      />

      {/* Photo Zoom Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={previewImage}
              alt="Zoomed Review Photo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
