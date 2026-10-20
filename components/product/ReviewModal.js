'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, X, Upload, Check, Loader2, Sparkles, Smartphone, ShieldCheck, LogIn } from 'lucide-react';
import ImageUploadInput from '@/components/common/ImageUploadInput';
import { useAuthStore } from '@/store/authStore';

const ratingLabels = {
  1: '১ - অত্যন্ত অসন্তুষ্ট 😞',
  2: '২ - সন্তুষ্ট নই 😐',
  3: '৩ - মোটামুটি ভালো 🙂',
  4: '৪ - খুব ভালো পণ্য 😊',
  5: '৫ - অসাধারণ খাঁটি পণ্য! 🌟',
};

export default function ReviewModal({
  isOpen,
  onClose,
  product = null,
  orderId = '',
  existingReview = null,
  onSuccess,
}) {
  const { user } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [productsList, setProductsList] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
    } else if (isOpen && productsList.length === 0) {
      // Fetch products list for selector if none provided
      fetch('/api/products?limit=50')
        .then((res) => res.json())
        .then((data) => {
          if (data.products && data.products.length > 0) {
            setProductsList(data.products);
            if (!selectedProduct) setSelectedProduct(data.products[0]);
          }
        })
        .catch(() => {});
    }
  }, [product, isOpen, productsList.length, selectedProduct]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
      setImageUrl(existingReview.images?.[0] || '');
    } else {
      setRating(5);
      setComment('');
      setImageUrl('');
    }
    setError('');
  }, [existingReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('দয়া করে একটি পণ্য নির্বাচন করুন');
      return;
    }

    if (!comment.trim()) {
      setError('দয়া করে আপনার মতামত বা অভিজ্ঞতা লিখুন');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct._id || selectedProduct.id,
          productSlug: selectedProduct.slug,
          productName: selectedProduct.name,
          productImage: selectedProduct.image,
          rating,
          comment: comment.trim(),
          images: imageUrl ? [imageUrl] : [],
          orderId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'রিভিউ সাবমিট ব্যর্থ হয়েছে');
      }

      if (onSuccess) {
        onSuccess(data.review);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'রিভিউ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#EFE9DC] shadow-2xl my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DC]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF0D4] text-[#E5A93C] flex items-center justify-center">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1B4D3E]">
                {existingReview ? 'রিভিউ সম্পাদনা করুন' : 'পণ্য সম্পর্কে লাইভ রিভিউ দিন'}
              </h3>
              <p className="text-[11px] text-[#4A5B53]">
                আপনার খাঁটি অভিজ্ঞতা ও মতামত প্রকাশ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#4A5B53] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In Warning */}
        {!user && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">রিভিউ দিতে লগইন করুন</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                লাইভ রিভিউ জমা দিতে আপনার অ্যাকাউন্টে লগইন থাকা আবশ্যক।
              </p>
            </div>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-[#1B4D3E] text-[#FAF0D4] rounded-xl font-bold flex items-center gap-1 flex-shrink-0 hover:bg-[#153D31]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>লগইন</span>
            </Link>
          </div>
        )}

        {/* Product selector or info */}
        {product ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F4] border border-[#EFE9DC]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF0D4] flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-base">🍯</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1B4D3E] truncate">{product.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>যাচাইকৃত পণ্য রিভিউ</span>
              </div>
            </div>
          </div>
        ) : productsList.length > 0 ? (
          <div>
            <label className="block text-xs font-bold text-[#1B4D3E] mb-1">
              কোন পণ্যের রিভিউ দিতে চান? <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedProduct?._id || selectedProduct?.id || ''}
              onChange={(e) => {
                const found = productsList.find((p) => (p._id || p.id) === e.target.value);
                setSelectedProduct(found);
              }}
              className="w-full px-3 py-2 rounded-xl border border-[#EFE9DC] bg-[#FAF8F4] text-xs font-bold text-[#102E25] outline-none focus:border-[#1B4D3E]"
            >
              {productsList.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name} ({p.categoryName || p.category})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selection */}
          <div className="text-center py-2 bg-[#FAF8F4] rounded-2xl border border-[#EFE9DC] space-y-2">
            <span className="text-xs font-bold text-[#1B4D3E] block">
              আপনার রেটিং নির্বাচন করুন:
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const currentRating = hoverRating || rating;
                const isFilled = star <= currentRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-[#E5A93C] fill-[#E5A93C]'
                          : 'text-gray-300 hover:text-[#E5A93C]/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-[#C86D3B]">
              {ratingLabels[hoverRating || rating]}
            </p>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-xs font-bold text-[#1B4D3E] mb-1">
              আপনার মতামত ও পর্যালোচনা <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="পণ্যটি আপনার কেমন লেগেছে? খাঁটি স্বাদ, ঘ্রাণ, প্যাকেজিং ও ডেলিভারি সম্পর্কে লিখুন..."
              className="w-full px-3 py-2.5 rounded-2xl border border-[#EFE9DC] bg-[#FAF8F4] text-xs text-[#102E25] focus:outline-none focus:border-[#1B4D3E] resize-none"
            />
          </div>

          {/* Photo upload from Folder / Phone gallery */}
          <ImageUploadInput
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            label="পণ্যের ছবি যুক্ত করুন (ঐচ্ছিক)"
            helpText="ফোনের গ্যালারি বা ফোল্ডার থেকে ডেলিভারি পাওয়া পণ্যের ছবি আপলোড করতে পারেন"
            allowUrlPaste={false}
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFE9DC]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-[#EFE9DC] text-xs font-bold text-[#4A5B53] hover:bg-gray-100 transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] rounded-xl text-xs font-extrabold transition-all shadow-md disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>জমা দেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E5A93C]" />
                  <span>{existingReview ? 'রিভিউ আপডেট করুন' : 'রিভিউ প্রকাশ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
