'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
  ExternalLink,
  Tag,
  Bot,
  User,
  Image as ImageIcon,
  Paperclip,
  Trash2,
} from 'lucide-react';

export default function AdminAICopilotModal({ isOpen, onClose, onRefreshData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-copilot',
      sender: 'ai',
      text: 'সালামু আলাইকুম অ্যাডমিন! আমি আপনার অটোনোমাস এআই কো-পাইলট (AI Co-Pilot)।\n\nআপনি চাইলে সরাসরি পণ্যের ছবি সংযুক্ত করে বলতে পারেন: "এই ছবিটির পণ্যটি অ্যাড করো, দাম ৯০০ টাকা, স্টক ২০..."। আমি স্বয়ংক্রিয়ভাবে ছবিটি আপলোড করে পণ্যের সাথে যুক্ত করব এবং বিস্তারিত ডাটাবেসে সেভ করে দেব!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { file, previewUrl, base64, mimeType, name, size }
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen, messages]);

  // Process and auto-compress chosen image file
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('শুধুমাত্র ছবি (JPG, PNG, WEBP ইত্যাদি) ফাইল সমর্থনযোগ্য।');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('ছবির সাইজ সর্বোচ্চ ২৫MB হতে পারবে।');
      return;
    }

    try {
      const compressed = await compressAndPrepareImage(file, 1200, 0.82);
      if (compressed) {
        setSelectedImage(compressed);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      console.warn('Image compression fallback:', err);
    }
  };

  const compressAndPrepareImage = (file, maxDimension = 1200, quality = 0.82) => {
    return new Promise((resolve) => {
      if (!file || typeof window === 'undefined') {
        return resolve(null);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, quality);
          const base64 = dataUrl.split(',')[1];

          canvas.toBlob(
            (blob) => {
              const finalBlob = blob || file;
              const compressedFile = new File(
                [finalBlob],
                (file.name || 'product').replace(/\.[^/.]+$/, '') + '.jpg',
                { type: mimeType, lastModified: Date.now() }
              );

              resolve({
                file: compressedFile,
                previewUrl: dataUrl,
                base64,
                mimeType,
                name: file.name,
                originalSize: file.size,
                compressedSize: finalBlob.size,
              });
            },
            mimeType,
            quality
          );
        };

        img.onerror = () => {
          const rawRes = e.target?.result;
          const base64 = typeof rawRes === 'string' ? rawRes.split(',')[1] : '';
          resolve({
            file,
            previewUrl: URL.createObjectURL(file),
            base64,
            mimeType: file.type || 'image/jpeg',
            name: file.name,
            originalSize: file.size,
            compressedSize: file.size,
          });
        };

        img.src = e.target?.result;
      };

      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so same file can be picked again if needed
    e.target.value = '';
  };

  // Clipboard Paste support (Ctrl+V screenshot or copied photo)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleSend = async (customPrompt) => {
    const text = (customPrompt || input).trim();
    if ((!text && !selectedImage) || loading) return;

    const currentImage = selectedImage;
    setSelectedImage(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text || (currentImage ? 'এই ছবিটির পণ্যটি বিশ্লেষণ করে অ্যাড করো' : ''),
      imageUrl: currentImage?.previewUrl || null,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let permanentImageUrl = '';

      // Step 1: Upload image to server/Cloudinary if attached
      if (currentImage && currentImage.file) {
        setLoadingStatus('ছবিটি সার্ভারে আপলোড হচ্ছে...');
        const formData = new FormData();
        formData.append('file', currentImage.file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            permanentImageUrl = uploadData.url;
          }
        } catch (uploadErr) {
          console.warn('Image upload fallback to preview:', uploadErr.message);
        }
      }

      setLoadingStatus('এআই কো-পাইলট ডাটাবেসে নির্দেশ প্রসেস করছে...');

      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai/admin-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text || 'এই ছবিটির পণ্যটি বিশ্লেষণ ও স্টোরে তৈরি করো।',
          history: historyPayload,
          imageUrl: permanentImageUrl || currentImage?.previewUrl || '',
          imageBase64: currentImage?.base64 || '',
          mimeType: currentImage?.mimeType || 'image/jpeg',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          executedTools: data.executedTools || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // If a product was created or order updated, trigger parent refresh
        if (
          onRefreshData &&
          data.executedTools?.some(
            (t) =>
              t.name === 'create_product_autonomous' ||
              t.name === 'update_order_status' ||
              t.name === 'create_promo_coupon'
          )
        ) {
          onRefreshData();
        }
      } else {
        const errorMsg = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: data.message || 'নির্দেশ প্রসেস করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।',
          isError: true,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'সার্ভার যোগাযোগে সমস্যা হয়েছে: ' + err.message,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        onPaste={handlePaste}
        className="w-full sm:w-[500px] md:w-[560px] h-full bg-white shadow-2xl flex flex-col border-l border-[#E8E2D5] animate-slideLeft"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#014D24] to-[#016831] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">অটোনোমাস এআই কো-পাইলট</h3>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini Vision Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                ছবি দেখে সরাসরি প্রডাক্ট তৈরি ও ডাটাবেস অপারেশন
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#016831] text-white rounded-br-xs'
                    : m.isError
                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-[#E8E2D5] rounded-bl-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-70 font-semibold">
                  {m.sender === 'user' ? (
                    <>
                      <span>অ্যাডমিন</span>
                      <User className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-[#016831]" />
                      <span>এআই কো-পাইলট</span>
                    </>
                  )}
                </div>

                {/* Render attached image in user message */}
                {m.imageUrl && (
                  <div className="mb-2">
                    <img
                      src={m.imageUrl}
                      alt="Uploaded product"
                      className="max-h-48 max-w-full rounded-xl object-contain bg-black/10 border border-white/30 cursor-pointer shadow-xs"
                      onClick={() => window.open(m.imageUrl, '_blank')}
                    />
                  </div>
                )}

                <div className="whitespace-pre-line font-medium">{m.text}</div>

                {/* Render Executed Tool Cards */}
                {Array.isArray(m.executedTools) && m.executedTools.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    {m.executedTools.map((tool, idx) => {
                      // Product Created Card
                      if (tool.name === 'create_product_autonomous' && tool.result?.product) {
                        const prod = tool.result.product;
                        return (
                          <div
                            key={idx}
                            className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-2"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-[#016831]">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>নতুন পণ্য ডাটাবেসে তৈরি ও লাইভ হয়েছে:</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {prod.image && prod.image !== '/assets/logo-1.png' ? (
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-14 h-14 rounded-xl object-cover border border-emerald-200 shadow-2xs"
                                />
                              ) : null}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 truncate">{prod.name}</div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap mt-0.5">
                                  <span className="font-bold text-[#016831]">৳{prod.price}</span>
                                  <span>•</span>
                                  <span>একক: {prod.unit}</span>
                                  <span>•</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                    স্টক: {prod.stock}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {prod.productUrl && (
                              <Link
                                href={prod.productUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#016831] hover:underline pt-1"
                              >
                                <span>স্টোরে পণ্যটি দেখুন</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        );
                      }

                      // Store Analytics Card
                      if (tool.name === 'get_store_analytics' && tool.result?.summary) {
                        const s = tool.result.summary;
                        return (
                          <div
                            key={idx}
                            className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs space-y-2"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-amber-900">
                              <TrendingUp className="w-4 h-4 text-amber-600" />
                              <span>লাইভ বিজনেস অ্যানালিটিক্স রিপোর্ট</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="bg-white p-2 rounded-lg border border-amber-100">
                                <span className="text-slate-500 block">মোট বিক্রয়</span>
                                <span className="font-black text-sm text-[#016831]">
                                  {s.totalRevenue}
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-amber-100">
                                <span className="text-slate-500 block">মোট অর্ডার</span>
                                <span className="font-black text-sm text-slate-900">
                                  {s.totalOrders} টি
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-amber-100">
                                <span className="text-slate-500 block">পেন্ডিং অর্ডার</span>
                                <span className="font-black text-amber-700">
                                  {s.pendingOrders} টি
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-amber-100">
                                <span className="text-slate-500 block">হোল্ডে থাকা</span>
                                <span className="font-black text-red-600">
                                  {s.holdOrders} টি
                                </span>
                              </div>
                            </div>

                            {/* Low Stock Alerts */}
                            {Array.isArray(tool.result.lowStockAlerts) &&
                              tool.result.lowStockAlerts.length > 0 && (
                                <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-[11px] text-red-900 space-y-1">
                                  <div className="font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                    <span>স্টক শেষ হয়ে আসছে (Low Stock Alert):</span>
                                  </div>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {tool.result.lowStockAlerts.map((ls, lIdx) => (
                                      <li key={lIdx}>
                                        <strong>{ls.name}</strong> - মাত্র {ls.stock} টি বাকি
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                          </div>
                        );
                      }

                      // Order Updated Card
                      if (tool.name === 'update_order_status' && tool.result?.order) {
                        const ord = tool.result.order;
                        return (
                          <div
                            key={idx}
                            className="bg-blue-50/80 p-3 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1"
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                              <span>অর্ডার স্ট্যাটাস সফলভাবে আপডেট হয়েছে!</span>
                            </div>
                            <div>
                              অর্ডার নং: <strong>#{ord.orderNumber}</strong> ({ord.customerName})
                            </div>
                            <div className="text-[11px]">
                              নতুন স্ট্যাটাস:{' '}
                              <span className="font-bold uppercase text-blue-700">
                                {ord.orderStatus}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      // Coupon Created Card
                      if (tool.name === 'create_promo_coupon' && tool.result?.coupon) {
                        const coup = tool.result.coupon;
                        return (
                          <div
                            key={idx}
                            className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1"
                          >
                            <div className="font-bold flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-purple-600" />
                              <span>নতুন কুপন সক্রিয় করা হয়েছে:</span>
                            </div>
                            <div className="font-mono font-bold text-sm tracking-wider text-purple-950">
                              {coup.code}
                            </div>
                            <div className="text-[11px]">
                              ছাড়: <strong>{coup.discount}</strong> (নূন্যতম অর্ডার: {coup.minOrder})
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#E8E2D5] text-xs text-slate-600 w-fit">
              <Loader2 className="w-4 h-4 text-[#016831] animate-spin" />
              <span>{loadingStatus || 'কো-পাইলট কাজ করছে এবং ডাটাবেস আপডেট করছে...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="p-2.5 bg-white border-t border-[#E8E2D5] overflow-x-auto">
          <div className="flex items-center gap-2 w-max pb-0.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-[#E2136E] border border-pink-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>📸 ছবি দিয়ে পণ্য যোগ করো</span>
            </button>
            <button
              onClick={() =>
                handleSend(
                  'সুন্দরবনের খাঁটি পদ্ম মধু ৫০০ গ্রাম দাম ৮৫০ টাকা স্টক ৩০ কেজি যুক্ত করো'
                )
              }
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#016831] border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>➕ পদ্ম মধু যোগ করো</span>
            </button>
            <button
              onClick={() => handleSend('আজকের সামগ্রিক সেলস ও স্টক রিপোর্ট দাও')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>📊 সেলস রিপোর্ট</span>
            </button>
            <button
              onClick={() => handleSend('কোন কোন পণ্যের স্টক ফুরিয়ে আসছে?')}
              className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>⚠️ লো-স্টক অ্যালার্ট</span>
            </button>
          </div>
        </div>

        {/* Selected Image Preview Floating Pill */}
        {selectedImage && (
          <div className="mx-3 mt-2 p-2 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between animate-fadeIn shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={selectedImage.previewUrl}
                alt="Selected"
                className="w-11 h-11 rounded-xl object-cover border border-emerald-300 flex-shrink-0"
              />
              <div className="truncate text-xs">
                <p className="font-bold text-slate-900 truncate max-w-[240px]">
                  {selectedImage.name}
                </p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  {(selectedImage.compressedSize ? selectedImage.compressedSize / 1024 : selectedImage.size / 1024).toFixed(0)} KB • ছবির পণ্যটি স্বয়ংক্রিয়ভাবে অপ্টিমাইজড
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="ছবিটি বাদ দিন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E8E2D5] flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Photo Upload Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl border border-[#E8E2D5] hover:border-[#016831] text-slate-500 hover:text-[#016831] hover:bg-emerald-50/50 transition-colors cursor-pointer flex-shrink-0"
            title="পণ্যের ছবি নির্বাচন করুন বা পেস্ট করুন (Ctrl+V)"
          >
            <ImageIcon className="w-4 h-4 text-emerald-700" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedImage
                ? "ছবির পণ্যের দাম ও স্টক লিখুন (যেমন: 'দাম ৯৫০ টাকা, স্টক ৩০ কেজি')..."
                : "কো-পাইলটকে নির্দেশ দিন বা ছবি নির্বাচন করুন..."
            }
            className="flex-1 py-2.5 px-3.5 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831] bg-[#FAF8F5] focus:bg-white transition-colors"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !selectedImage)}
            className="p-2.5 bg-[#016831] hover:bg-[#014D24] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex-shrink-0"
            title="মেসেজ পাঠান"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
