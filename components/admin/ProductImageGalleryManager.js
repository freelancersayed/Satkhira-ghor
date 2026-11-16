'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Plus,
  Trash2,
  Star,
  Check,
  Loader2,
  Smartphone,
  ImageIcon,
  Sparkles,
  Layers,
} from 'lucide-react';

const toBanglaNum = (num) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[d]);
};

export default function ProductImageGalleryManager({
  primaryImage = '',
  galleryImages = [],
  onChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Normalize image list ensuring primaryImage is at index 0 if it exists
  const allImages = [
    ...(primaryImage ? [primaryImage] : []),
    ...(Array.isArray(galleryImages) ? galleryImages : []),
  ].filter((img, idx, arr) => img && typeof img === 'string' && arr.indexOf(img) === idx);

  // Helper to upload a single file to /api/upload
  const uploadSingleFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'ছবি আপলোড ব্যর্থ হয়েছে');
    }
    return data.url;
  };

  // Handle multi-file or single-file upload from native file picker / camera
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorMsg('');
    setUploading(true);

    try {
      const newUrls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`${toBanglaNum(i + 1)} / ${toBanglaNum(files.length)} টি ছবি আপলোড হচ্ছে...`);
        const url = await uploadSingleFile(files[i]);
        if (url) newUrls.push(url);
      }

      // Combine existing images with newly uploaded images
      const updatedList = [...allImages, ...newUrls].filter(
        (img, idx, arr) => img && arr.indexOf(img) === idx
      );

      const newPrimary = updatedList[0] || '';
      onChange({
        primaryImage: newPrimary,
        galleryImages: updatedList,
      });
    } catch (err) {
      setErrorMsg(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Set any image as primary cover photo
  const handleSetPrimary = (targetImg) => {
    const reordered = [
      targetImg,
      ...allImages.filter((img) => img !== targetImg),
    ];
    onChange({
      primaryImage: targetImg,
      galleryImages: reordered,
    });
  };

  // Remove an image from gallery
  const handleRemoveImage = (targetImg) => {
    const filtered = allImages.filter((img) => img !== targetImg);
    const newPrimary = filtered[0] || '';
    onChange({
      primaryImage: newPrimary,
      galleryImages: filtered,
    });
  };

  return (
    <div className="space-y-3 bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#E8E2D5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[#E8E2D5]">
        <div>
          <label className="text-xs font-bold text-[#016831] flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#D97706]" />
            <span>পণ্যের ছবি ও সাইড-বাই-সাইড গ্যালারি *</span>
          </label>
          <p className="text-[11px] text-stone-500 mt-0.5">
            প্রথম ছবিটি হোমপেজে <strong>প্রধান কভার ছবি</strong> হবে। বাকি ছবিগুলো ডিটেইলস পেজে <strong>সাইড-বাই-সাইড থাম্বনেইল</strong> হিসেবে থাকবে।
          </p>
        </div>

        {allImages.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#016831] border border-emerald-200 self-start sm:self-auto">
            মোট {toBanglaNum(allImages.length)}টি ছবি
          </span>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Hidden File Input (supports multiple file selection & camera) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Uploaded Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
        {allImages.map((img, idx) => {
          const isPrimary = idx === 0;
          return (
            <div
              key={idx}
              className={`group/card relative aspect-square rounded-2xl overflow-hidden border-2 bg-white flex flex-col justify-between transition-all ${
                isPrimary
                  ? 'border-[#016831] shadow-sm ring-2 ring-[#016831]/20'
                  : 'border-[#E8E2D5] hover:border-stone-400'
              }`}
            >
              <Image
                src={img}
                alt={`Product image ${idx + 1}`}
                fill
                unoptimized={Boolean(img?.startsWith('data:'))}
                className="object-cover"
                sizes="120px"
              />

              {/* Badges Overlay */}
              <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between z-10 pointer-events-none">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                  #{toBanglaNum(idx + 1)}
                </span>
                {isPrimary && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#016831] text-white flex items-center gap-0.5 shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    <span>কভার</span>
                  </span>
                )}
              </div>

              {/* Action Buttons Overlay on Hover / Touch */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5 z-20">
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img)}
                    className="w-full py-1 px-1.5 bg-[#016831] hover:bg-[#015629] text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                    title="এই ছবিটিকে প্রধান কভার ছবি বানান"
                  >
                    <Star className="w-3 h-3 text-amber-300" />
                    <span>কভার বানান</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRemoveImage(img)}
                  className="w-full py-1 px-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                  title="এই ছবিটি মুছে ফেলুন"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>মুছুন</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Add More Images Button Card */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative aspect-square rounded-2xl border-2 border-dashed border-[#016831]/40 hover:border-[#016831] hover:bg-[#016831]/5 bg-white flex flex-col items-center justify-center text-center p-2 transition-all group/add cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-5 h-5 text-[#016831] animate-spin" />
              <span className="text-[10px] font-bold text-[#016831]">
                {uploadProgress || 'আপলোড হচ্ছে...'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#016831] group-hover/add:scale-110 transition-transform">
                <Plus className="w-4 h-4 text-[#016831]" />
              </div>
              <span className="text-[11px] font-bold text-[#016831]">
                {allImages.length === 0 ? 'ছবি আপলোড করুন' : '+ ছবি যোগ করুন'}
              </span>
              <span className="text-[9px] text-stone-400">গ্যালারি / ফোল্ডার</span>
            </div>
          )}
        </button>
      </div>

      {/* Pro Tip */}
      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 pt-1">
        <Sparkles className="w-3.5 h-3.5 text-[#D97706] flex-shrink-0" />
        <span>
          টিপস: আপনি একসাথে কয়েকটি ছবি নির্বাচন করতে পারবেন (প্যাকেটের সামনে, পেছনের উপাদান ও আসল মধু/ঘিয়ের টেক্সচার)।
        </span>
      </div>
    </div>
  );
}
