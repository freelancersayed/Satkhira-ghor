'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Image as ImageIcon, X, Loader2, Link as LinkIcon, Smartphone, Check } from 'lucide-react';

export default function ImageUploadInput({
  value = '',
  onChange,
  label = 'ছবি নির্বাচন করুন',
  required = false,
  helpText = 'কম্পিউটার ফোল্ডার বা ফোন গ্যালারি থেকে যেকোনো ছবি আপলোড করুন',
  allowUrlPaste = true,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUrlMode, setShowUrlMode] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check if image
    if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|avif|heic|heif|jfif)$/i.test(file.name)) {
      setError('দয়া করে একটি সঠিক ছবি (JPG, PNG, WEBP ইত্যাদি) নির্বাচন করুন');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('ছবির আকার সর্বোচ্চ ১০ MB হতে পারবে');
      return;
    }

    setError('');
    setUploading(true);

    try {
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

      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      setError(err.message || 'ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#1B4D3E]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {allowUrlPaste && (
          <button
            type="button"
            onClick={() => setShowUrlMode(!showUrlMode)}
            className="text-[11px] font-bold text-[#C86D3B] hover:text-[#1B4D3E] transition-colors flex items-center gap-1"
          >
            {showUrlMode ? (
              <>
                <Smartphone className="w-3 h-3" />
                <span>ফাইল আপলোড মোড</span>
              </>
            ) : (
              <>
                <LinkIcon className="w-3 h-3" />
                <span>URL লিংক মোড</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden Native File Input (accepts camera & phone gallery) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* ── Mode 1: URL input mode ──────────────────────────────── */}
      {showUrlMode ? (
        <div className="space-y-2">
          <input
            type="url"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... (ছবির সরাসরি ওয়েব লিংক)"
            className="w-full px-3 py-2.5 rounded-xl border border-[#EFE9DC] bg-[#FAF8F4] text-xs font-mono text-[#102E25] focus:outline-none focus:border-[#1B4D3E]"
          />
        </div>
      ) : (
        /* ── Mode 2: Direct Folder / Phone Gallery Upload Zone ──── */
        <div>
          {value ? (
            /* Uploaded Preview State */
            <div className="relative border border-[#EFE9DC] rounded-2xl p-3 bg-white shadow-sm flex items-center gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF0D4] border border-[#EFE9DC] flex-shrink-0">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
                  <Check className="w-4 h-4" />
                  <span>ছবি সংযুক্ত হয়েছে</span>
                </div>
                <p className="text-[11px] text-[#8C9C93] truncate font-mono">
                  {value}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF0D4] text-[#1B4D3E] text-[11px] font-bold hover:bg-[#ebdcb4] transition-colors flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>ছবি পরিবর্তন করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    disabled={uploading}
                    className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Upload Zone */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 sm:p-6 text-center cursor-pointer transition-all duration-200 select-none ${
                dragActive
                  ? 'border-[#E5A93C] bg-[#FAF0D4]/60 scale-[1.01]'
                  : 'border-[#C8D8D0] bg-[#FAF8F4] hover:border-[#1B4D3E] hover:bg-[#F0F5F2]'
              } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center py-2 gap-2">
                  <Loader2 className="w-7 h-7 text-[#1B4D3E] animate-spin" />
                  <span className="text-xs font-bold text-[#1B4D3E]">
                    ছবি আপলোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E]/10 text-[#1B4D3E] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1B4D3E]">
                      ক্লিক করে ছবি নির্বাচন করুন
                    </p>
                    <p className="text-[11px] text-[#4A5B53] mt-0.5">
                      অথবা ফাইল টেনে এখানে ছেড়ে দিন
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF0D4] text-[#7E4E18] text-[10px] font-bold">
                    <Smartphone className="w-3 h-3" />
                    <span>ফোন গ্যালারি / ফোল্ডার সমর্থনযোগ্য</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <X className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {helpText && !error && (
        <p className="text-[10px] text-[#8C9C93]">{helpText}</p>
      )}
    </div>
  );
}
