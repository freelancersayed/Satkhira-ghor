'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  RefreshCw,
  Layers,
} from 'lucide-react';

export default function AdminAICopilotModal({ isOpen, onClose, onRefreshData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-copilot',
      sender: 'ai',
      text: 'সালামু আলাইকুম অ্যাডমিন! আমি আপনার অটোনোমাস এআই কো-পাইলট (AI Co-Pilot)। আমি সরাসরি স্টোরের ডাটাবেসের সাথে সংযুক্ত। আপনি যেকোনো নির্দেশনা দিলে আমি স্বয়ংক্রিয়ভাবে পণ্য তৈরি, সেলস অডিট, স্টক অ্যানালাইসিস বা অর্ডার আপডেট করে দেব।',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt) => {
    const text = (customPrompt || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const res = await fetch('/api/ai/admin-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
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
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full sm:w-[500px] md:w-[540px] h-full bg-white shadow-2xl flex flex-col border-l border-[#E8E2D5] animate-slideLeft">
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
                  Gemini Live
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                স্বয়ংক্রিয় প্রডাক্ট জেনারেটর ও ডাটাবেস অপারেশনস
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
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
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
                            className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-[#016831]">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>নতুন পণ্য ডাটাবেসে তৈরি ও লাইভ হয়েছে:</span>
                            </div>
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
                              <span className="font-bold text-[#016831]">৳{prod.price}</span>
                              <span>•</span>
                              <span>একক: {prod.unit}</span>
                              <span>•</span>
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                স্টক: {prod.stock}
                              </span>
                            </div>
                            {prod.productUrl && (
                              <Link
                                href={prod.productUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#016831] hover:underline mt-1"
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
              <span>কো-পাইলট কাজ করছে এবং ডাটাবেস আপডেট করছে...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompt Chips */}
        <div className="p-3 bg-white border-t border-[#E8E2D5] overflow-x-auto">
          <div className="flex items-center gap-2 w-max pb-1">
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
            <button
              onClick={() => handleSend('অসম্পূর্ণ অর্ডার বা ড্রপ-অফ কার্টের রিপোর্ট দাও')}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🛒 অসম্পূর্ণ কার্ট রিপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E8E2D5] flex items-center gap-2">
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
            placeholder="কো-পাইলটকে নির্দেশ দিন (যেমন: 'নতুন সরিষার তেল ১ লিটার ৩০০ টাকা স্টক ২০ লিটার যোগ করো')..."
            className="flex-1 py-2.5 px-3.5 rounded-xl border border-[#E8E2D5] text-xs outline-none focus:border-[#016831] bg-[#FAF8F5] focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-[#016831] hover:bg-[#014D24] disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
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
