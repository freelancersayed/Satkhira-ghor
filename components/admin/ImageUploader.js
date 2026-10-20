'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Copy, Check, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';

export default function ImageUploader({ onInsert, label = 'ছবি আপলোড করুন' }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]); // { url, name }
  const [copied, setCopied] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    const isImage =
      (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|jfif)$/i.test(file.name || '');

    if (!isImage) {
      setError('শুধুমাত্র ছবি (JPG, PNG, WEBP, GIF ইত্যাদি) ফাইল সমর্থনযোগ্য।');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ফাইলের আকার সর্বোচ্চ ১০MB হতে হবে।');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'আপলোড ব্যর্থ হয়েছে');

      setUploaded((prev) => [{ url: data.url, name: file.name }, ...prev]);
      if (onInsert) onInsert(data.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onInsert]);

  const handleFiles = (files) => {
    Array.from(files).forEach(uploadFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${dragOver
            ? 'border-[#E5A93C] bg-[#FAF0D4]/50 scale-[1.02]'
            : 'border-[#C8D8D0] bg-[#FAF8F4] hover:border-[#1B4D3E] hover:bg-[#F0F5F2]'
          }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-[#1B4D3E] animate-spin" />
            <p className="text-sm font-semibold text-[#1B4D3E]">আপলোড হচ্ছে…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#1B4D3E]/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-[#1B4D3E]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1B4D3E]">{label}</p>
              <p className="text-xs text-[#8C9C93] mt-1">
                ক্লিক করুন অথবা ছবি টেনে এখানে ছাড়ুন
              </p>
              <p className="text-[11px] text-[#8C9C93] mt-0.5">
                JPG · PNG · WEBP · সর্বোচ্চ ৮MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Images */}
      {uploaded.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#1B4D3E]">আপলোড করা ছবি</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploaded.map((img, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-[#EFE9DC] bg-gray-50">
                {/* Preview */}
                <div className="aspect-video relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* URL bar */}
                <div className="p-2 bg-white flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#8C9C93] flex-shrink-0" />
                  <p className="text-[10px] text-[#4A5B53] truncate flex-1 font-mono">
                    {img.url}
                  </p>
                  <button
                    onClick={() => copyUrl(img.url)}
                    title="URL কপি করুন"
                    className="p-1 rounded-lg hover:bg-[#FAF0D4] transition-colors flex-shrink-0"
                  >
                    {copied === img.url ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#8C9C93]" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
