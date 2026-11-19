'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Send,
  ShoppingBag,
  Sparkles,
  Check,
  Phone,
  MessageCircle,
  Package,
  Truck,
  ExternalLink,
  ChevronRight,
  Loader2,
  Bot,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { deliveryConfig } from '@/lib/deliveryConfig';
import AgentAvatar from './AgentAvatar';

export default function CustomerAIChatWindow({
  isOpen,
  onClose,
  pathname = '/',
  initialQuery = null,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-storefront-ai',
      sender: 'ai',
      text: 'সালামু আলাইকুম! আমি সাতক্ষীরা ঘরের অফিসিয়াল এআই শপিং অ্যাসিস্ট্যান্ট (AI Shopping Consultant)।\n\nআমি সরাসরি আমাদের রিয়েল-টাইম ডাটাবেসের সাথে সংযুক্ত। সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি, ঘানি ভাঙা তেল, বিভিন্ন স্বাস্থ্য উপকারিতা বা আপনার অর্ডার ট্র্যাকিং সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন!',
      products: [],
      orders: [],
      quickReplies: [
        '🍯 সুন্দরবনের সেরা মধু কোনটা?',
        '🧈 গাওয়া ঘির দাম ও স্টক',
        '📦 অর্ডার ট্র্যাক করতে চাই',
        '🚚 ফ্রি ডেলিভারি অফার',
      ],
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemSlug, setAddedItemSlug] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const lastInitialQueryRef = useRef(null);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  // Trigger initial query if passed from floating speech bubble
  useEffect(() => {
    if (isOpen && initialQuery && lastInitialQueryRef.current !== initialQuery) {
      lastInitialQueryRef.current = initialQuery;
      setTimeout(() => {
        handleSendMessage(initialQuery);
      }, 200);
    }
  }, [isOpen, initialQuery]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai/storefront', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          context: { pathname },
        }),
      });

      const data = await res.json();

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'আমি তথ্যটি সংগ্রহ করেছি।',
        products: Array.isArray(data.products) ? data.products : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        quickReplies: Array.isArray(data.quickReplies) ? data.quickReplies : [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Customer AI error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `একটু নেটওয়ার্ক জ্যাম হয়েছে! সরাসরি কথা বলতে আমাদের হটলাইন ${deliveryConfig.supportPhone}-এ কল বা হোয়াটসঅ্যাপ করতে পারেন।`,
          isFallback: true,
          quickReplies: ['🍯 খাঁটি মধু দেখান', '🧈 গাওয়া ঘি', '📞 হেল্পলাইন'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product) return;

    addItem({
      id: product.id || product.slug,
      slug: product.slug,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image || '/assets/logo-1.png',
      unit: product.unit || '১ কেজি',
      quantity: 1,
      stock: product.stock ?? 10,
    });

    setAddedItemSlug(product.slug || product.id);
    setTimeout(() => {
      setAddedItemSlug(null);
    }, 2200);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay (Tap Outside to Close) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 sm:hidden animate-fadeIn"
        aria-hidden="true"
      />

      {/* Main Chat Drawer / Popover Window */}
      <div
        className={`fixed z-50 flex flex-col bg-white overflow-hidden shadow-2xl transition-all duration-300
          /* Mobile Bottom-Sheet: w-[calc(100vw-16px)], bottom-0 */
          bottom-0 left-2 right-2 w-[calc(100vw-16px)] max-h-[80dvh] h-[76dvh] rounded-t-3xl border-t-2 border-x-2 border-emerald-600/30 animate-slideUp
          /* Desktop Floating Popover */
          sm:bottom-6 sm:right-6 sm:w-[410px] sm:h-[580px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-emerald-600/30 sm:animate-scaleUp
        `}
      >
        {/* Mobile Top Drag Indicator */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto my-1.5 sm:hidden flex-shrink-0" />

        {/* ── Header ── */}
        <div className="px-4 py-3 sm:py-3.5 bg-gradient-to-r from-[#014D24] via-[#016831] to-[#014D24] text-white flex items-center justify-between shadow-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-xs">
              <AgentAvatar className="w-7 h-7" glow={true} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white leading-tight">
                  সাতক্ষীরা ঘর এআই
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#FAB116] text-slate-950 font-mono">
                  Smart AI
                </span>
              </div>
              <p className="text-[10px] text-emerald-200/90 leading-tight">
                ডিজিটাল শপিং কনসালট্যান্ট ও লাইভ গাইড
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Handoff Button */}
            <a
              href={deliveryConfig.supportWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all shadow-2xs"
              title="হোয়াটসঅ্যাপে সরাসরি কথা বলুন"
            >
              <MessageCircle className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="চ্যাট বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Chat Messages Feed ── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-[#FAF8F5]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#016831] text-white rounded-br-xs'
                    : m.isFallback
                    ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-[#E8E2D5] rounded-bl-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-70 font-semibold">
                  {m.sender === 'user' ? (
                    <>
                      <span>আপনি</span>
                      <User className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <AgentAvatar className="w-4 h-4" glow={false} />
                      <span>এআই শপিং অ্যাসিস্ট্যান্ট</span>
                    </>
                  )}
                </div>

                <div className="whitespace-pre-line font-medium">{m.text}</div>

                {/* ── Interactive Live Product Cards ── */}
                {Array.isArray(m.products) && m.products.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      সুপারিশকৃত খাঁটি পণ্য:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {m.products.map((prod) => {
                        const isAdded = addedItemSlug === (prod.slug || prod.id);
                        return (
                          <div
                            key={prod.id || prod.slug}
                            className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D5] flex items-center justify-between gap-2.5 hover:border-emerald-300 transition-all shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={prod.image || '/assets/logo-1.png'}
                                alt={prod.name}
                                className="w-12 h-12 rounded-lg object-cover border border-[#E8E2D5] flex-shrink-0 bg-white"
                              />
                              <div className="min-w-0 truncate">
                                <Link
                                  href={`/products/${prod.slug}`}
                                  className="font-bold text-slate-900 hover:text-[#016831] truncate block text-xs"
                                >
                                  {prod.name}
                                </Link>
                                <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                  <span className="font-bold text-[#016831]">
                                    ৳{prod.price}
                                  </span>
                                  {prod.originalPrice && prod.originalPrice > prod.price && (
                                    <span className="line-through text-slate-400 text-[10px]">
                                      ৳{prod.originalPrice}
                                    </span>
                                  )}
                                  <span className="text-slate-400">•</span>
                                  <span className="text-[10px] text-slate-500">
                                    {prod.unit}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-xs ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#016831] hover:bg-[#014D24] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>যুক্ত হয়েছে</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                  <span>+কার্ট</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Order Tracking Cards ── */}
                {Array.isArray(m.orders) && m.orders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      লাইভ পার্সেল ট্র্যাকিং তথ্য:
                    </p>
                    {m.orders.map((ord, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>অর্ডার #{ord.orderNumber}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold uppercase">
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          মোট বিল: <strong className="text-[#016831]">৳{ord.totalAmount}</strong> • তারিখ: {ord.date}
                        </div>
                        {ord.courier && (
                          <div className="p-2 bg-white rounded-lg border border-emerald-100 text-[11px] space-y-0.5">
                            <div>কুরিয়ার: <strong>{ord.courier.provider || 'Steadfast Courier'}</strong></div>
                            {ord.courier.trackingCode && (
                              <div>ট্র্যাকিং কোড: <strong className="font-mono text-amber-700">{ord.courier.trackingCode}</strong></div>
                            )}
                            <div>অবস্থা: <strong className="text-emerald-700">{ord.courier.status}</strong></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Suggested Quick Follow-Up Chips ── */}
                {Array.isArray(m.quickReplies) && m.quickReplies.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100/70 flex flex-wrap gap-1.5">
                    {m.quickReplies.map((chip, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleSendMessage(chip)}
                        className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#016831] border border-emerald-200/80 text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-[#E8E2D5] text-xs text-slate-600 w-fit">
              <Loader2 className="w-4 h-4 text-[#016831] animate-spin" />
              <span>এআই অ্যাসিস্ট্যান্ট ডাটাবেস যাচাই করে উত্তর তৈরি করছে...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="p-3 bg-white border-t border-[#E8E2D5] flex items-center gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="খাঁটি পণ্য, স্বাস্থ্য পরামর্শ বা অর্ডার সম্পর্কে লিখুন..."
            className="flex-1 py-2.5 px-3.5 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831] bg-[#FAF8F5] focus:bg-white transition-colors"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputMessage.trim()}
            className="p-2.5 bg-[#016831] hover:bg-[#014D24] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex-shrink-0"
            title="মেসেজ পাঠান"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
