'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  X,
  Send,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  Flame,
  Phone,
  MessageCircle,
  Package,
  Truck,
  Search,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { products } from '@/data/products';
import { getHalumProductKnowledge } from './halumKnowledge';
import { matchLocalHalumIntent } from './halumLocalMatcher';
import { deliveryConfig } from '@/lib/deliveryConfig';

export default function HalumChatWindow({
  isOpen,
  onClose,
  onStateChange,
  currentState = 'idle',
  pathname = '/',
  isLeftSide = false,
  initialQuery = null,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'step-1-welcome',
      sender: 'halum',
      text: 'হালুম! সুন্দরবনের খাঁটি মধুর দুনিয়ায় আপনাকে স্বাগতম! আমি হালুম মামা—বনের রাজা ও আপনার শপিং গাইড! আজ কোন খাঁটি খাবারটা চেখে দেখবেন? 🐯',
      products: [
        {
          id: 'prod-001',
          name: 'সুন্দরবনের খাঁটি খলসী ফুলের মধু',
          slug: 'sundarbans-pure-khalsi-honey',
          price: 1250,
          originalPrice: 1450,
          image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
          unit: '১ কেজি (1 kg)',
          badge: 'সেরা বিক্রয়',
        },
        {
          id: 'prod-003',
          name: 'সাতক্ষীরা সুন্দরবন মেগা ফ্যামিলি কম্বো',
          slug: 'satkhira-sundarbans-mega-family-combo',
          price: 2450,
          originalPrice: 2880,
          image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
          unit: '৩টি সেরা পণ্য বান্ডেল',
          badge: '২০০৳ সাশ্রয়',
        },
      ],
      quickReplies: ['🍯 খাঁটি খলসী মধু', '🧈 বিলোনা গাওয়া ঘি', '🎁 মেগা কম্বো প্যাক', '📦 অর্ডার ট্র্যাক'],
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemSlug, setAddedItemSlug] = useState(null);
  const [trackingCardInput, setTrackingCardInput] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // Auto-adapt greeting based on the current product route
  useEffect(() => {
    if (pathname && pathname.startsWith('/products/')) {
      const slug = pathname.replace('/products/', '').split('?')[0].split('/')[0];
      const productInfo = getHalumProductKnowledge(slug);
      const catalogItem = products.find((p) => p.slug === slug || p.id === slug);

      if (productInfo) {
        setMessages([
          {
            id: `prod-welcome-${slug}`,
            sender: 'halum',
            text: productInfo.dialogue,
            products: catalogItem ? [catalogItem] : [],
            quickReplies: productInfo.chips || ['👉 এখনই অর্ডার করুন', '🍯 গুনাগুন জানুন', '🚚 ফ্রি ডেলিভারি পাব?'],
            action: { type: 'order_now', label: 'থাবা বসান (Order Now)' },
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [pathname]);

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

  // Trigger initial query if passed from speech bubble chip
  const lastInitialQueryRef = useRef(null);
  useEffect(() => {
    if (isOpen && initialQuery && lastInitialQueryRef.current !== initialQuery) {
      lastInitialQueryRef.current = initialQuery;
      setTimeout(() => {
        handleSendMessage(initialQuery);
      }, 200);
    }
  }, [isOpen, initialQuery]);

  // Direct Live Order Tracker Functionality
  const executeTrackQuery = async (query) => {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) return;

    setTrackingLoading(true);
    if (onStateChange) onStateChange('thinking');

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(cleanQuery)}`);
      const data = await res.json();

      if (res.ok && data.orders && data.orders.length > 0) {
        const botMsg = {
          id: `halum-track-${Date.now()}`,
          sender: 'halum',
          text: `হালুম! "${cleanQuery}"-এর লাইভ পার্সেল স্ট্যাটাস পেয়েছি 📦👇`,
          orders: data.orders,
          characterState: 'saluting',
          quickReplies: ['📦 আরেকটি অর্ডার ট্র্যাক', '📞 কাস্টমার কেয়ার', '🍯 সেরা মধু দেখাও'],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        if (onStateChange) onStateChange('saluting');
      } else {
        const notFoundMsg = {
          id: `halum-track-nf-${Date.now()}`,
          sender: 'halum',
          text: `হালুম! "${cleanQuery}" তথ্যের সাথে কোনো অর্ডার পাওয়া যায়নি। অনুগ্রহ করে ১১ ডিজিটের মোবাইল নম্বর অথবা সঠিক অর্ডার আইডি দিন। যেকোনো সমস্যায় আমাদের সাথে সরাসরি কথা বলুন! 🐯`,
          isFallback: true,
          characterState: 'thinking',
          quickReplies: ['📦 আবার ট্র্যাক করব', '📞 হেল্পলাইন কল', 'নতুন অর্ডার করব'],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, notFoundMsg]);
        if (onStateChange) onStateChange('thinking');
      }
    } catch (err) {
      const errMsg = {
        id: `halum-track-err-${Date.now()}`,
        sender: 'halum',
        text: `একটু নেটওয়ার্ক জ্যাম! সরাসরি কথা বলতে ${deliveryConfig.supportPhone} নম্বরে কল বা হোয়াটসঅ্যাপ করুন 🐯`,
        isFallback: true,
        characterState: 'thinking',
        quickReplies: ['নতুন অর্ডার করব', 'মধুর দাম কত?'],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setTrackingLoading(false);
      setIsLoading(false);
    }
  };

  // Handle sending a message with Instant 0ms Local Intent Engine + In-Chat Tracking + AI fallback
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // 1. Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (onStateChange) onStateChange('thinking');

    // ── Zero-Typing Recommender Quiz Flow (Requirement 4) ──
    const textLower = text.toLowerCase();
    if (
      text.includes('কোনটা আমার জন্য সেরা') ||
      text.includes('কোনটা নেব') ||
      text.includes('সেরা খাবার খুঁজি') ||
      text.includes('কুইজ') ||
      textLower.includes('recommend')
    ) {
      setTimeout(() => {
        const botMsg = {
          id: `quiz-step1-${Date.now()}`,
          sender: 'halum',
          text: 'হালুম! আমি আপনাকে সবচেয়ে সেরা ও খাঁটি খাবারটি বেছে দিচ্ছি 🐯\nপ্রথমে বলুন, খাবারটি মূলত কার জন্য নিচ্ছেন?',
          quickReplies: ['🙋‍♂️ নিজের পরিবারের জন্য', '🎁 উপহার ও বিশেষ কাউকে দিতে'],
          characterState: 'greeting',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        if (onStateChange) onStateChange('greeting');
      }, 180);
      return;
    }

    if (text.includes('নিজের পরিবারের জন্য') || text.includes('উপহার ও বিশেষ কাউকে দিতে')) {
      const isGift = text.includes('উপহার');
      setTimeout(() => {
        const botMsg = {
          id: `quiz-step2-${Date.now()}`,
          sender: 'halum',
          text: isGift
            ? 'উপহারের জন্য সুন্দরবনের খাঁটি খাবার সবসময় সেরা ও আভিজাত্যের প্রতীক! 🎁 এবার বলুন আপনার আনুমানিক বাজেট কেমন?'
            : 'পরিবারের সবার পুষ্টি ও সুস্বাস্থ্যের জন্য খাঁটি খাবার অতুলনীয়! 🍯 এবার বলুন আপনার আনুমানিক বাজেট কেমন?',
          quickReplies: ['💵 ৳১,০০০ এর মধ্যে', '👑 ৳১,৫০০+ মেগা কম্বো ও ফ্রি ডেলিভারি'],
          characterState: 'thinking',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        if (onStateChange) onStateChange('thinking');
      }, 180);
      return;
    }

    if (text.includes('৳১,০০০ এর মধ্যে') || text.includes('১০০০') || text.includes('1000')) {
      const khalsiHoney = products.find((p) => p.slug === 'sundarbans-pure-khalsi-honey') || products[0];
      setTimeout(() => {
        const botMsg = {
          id: `quiz-res-1000-${Date.now()}`,
          sender: 'halum',
          text: 'আপনার বাজেটে সবচেয়ে খাঁটি ও জনপ্রিয় খাবার: সুন্দরবনের খাঁটি খলসী ফুলের মধু! নিচে +কার্ট বাটনে থাবা দিয়ে সহজে অর্ডার করে ফেলুন 🐯🍯',
          products: khalsiHoney ? [khalsiHoney] : [],
          quickReplies: ['👉 এখনই অর্ডার করব', '🧈 গাওয়া ঘিও দেখতে চাই', '🎯 আবার কুইজ দিন'],
          characterState: 'happy',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        if (onStateChange) onStateChange('happy');
      }, 180);
      return;
    }

    if (
      text.includes('৳১,৫০০+ মেগা কম্বো') ||
      text.includes('১,৫০০+') ||
      text.includes('1500+') ||
      text.includes('ফ্রি ডেলিভারি')
    ) {
      const combo = products.find((p) => p.slug === 'satkhira-sundarbans-mega-family-combo') || products[2];
      const ghee = products.find((p) => p.slug === 'bilona-gawa-ghee') || products[1];
      setTimeout(() => {
        const botMsg = {
          id: `quiz-res-1500-${Date.now()}`,
          sender: 'halum',
          text: 'অসাধারণ সিদ্ধান্ত! ৳১,৫০০-র বেশি অর্ডার করলে সারা দেশে হোম ডেলিভারি একদম ফ্রি! আমাদের মেগা ফ্যামিলি কম্বো ও বিলোনা গাওয়া ঘি আপনার জন্য সেরা 🎁🚚',
          products: [combo, ghee].filter(Boolean),
          quickReplies: ['👉 এখনই অর্ডার করব', '🚚 ডেলিভারি কতদিনে পাব?', '🎯 আবার কুইজ দিন'],
          characterState: 'happy',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        if (onStateChange) onStateChange('happy');
      }, 180);
      return;
    }

    // 2. Check Local Intent Engine First (0ms Response Time)
    const localMatch = matchLocalHalumIntent(text, { pathname });

    if (localMatch) {
      // Intent: Direct Phone/ID Tracking Query
      if (localMatch.type === 'track_order_query') {
        executeTrackQuery(localMatch.query);
        return;
      }

      // Intent: Show In-Chat Interactive Tracking Form (Requirement 3)
      if (localMatch.type === 'show_track_form' || localMatch.showTrackForm) {
        setTimeout(() => {
          const botMsg = {
            id: `halum-track-form-${Date.now()}`,
            sender: 'halum',
            text: localMatch.reply,
            showTrackForm: true,
            characterState: 'thinking',
            quickReplies: localMatch.quickReplies || ['📞 কাস্টমার কেয়ার', '🍯 সেরা মধু'],
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMsg]);
          setIsLoading(false);
          if (onStateChange) onStateChange('thinking');
        }, 150);
        return;
      }

      // Standard Local Match: Instant human-like 180ms response
      setTimeout(() => {
        const botMsg = {
          id: `halum-${Date.now()}`,
          sender: 'halum',
          text: localMatch.reply,
          products: localMatch.products || [],
          quickReplies: localMatch.quickReplies || [],
          action: localMatch.action || null,
          isFallback: localMatch.isFallback || false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);

        if (onStateChange && localMatch.characterState) {
          onStateChange(localMatch.characterState);
          setTimeout(() => onStateChange('idle'), 4000);
        }
      }, 180);
      return;
    }

    // 3. Fallback to Server Agent / LLM Brain
    try {
      const res = await fetch('/api/halum-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: { pathname } }),
      });

      const data = await res.json();

      const botMsg = {
        id: `halum-${Date.now()}`,
        sender: 'halum',
        text: data.reply || 'হালুম! আমি আপনার কথাটি বুঝতে পেরেছি।',
        products: data.products || [],
        quickReplies: data.quickReplies || ['🍯 সুন্দরবনের মধু', '🎁 মেগা কম্বো'],
        action: data.action || null,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);

      if (onStateChange && data.characterState) {
        onStateChange(data.characterState);
        setTimeout(() => onStateChange('idle'), 4000);
      }
    } catch (err) {
      console.error('Halum response error:', err);
      // Robust Offline Fallback Card (Requirement 4)
      setMessages((prev) => [
        ...prev,
        {
          id: `halum-fallback-${Date.now()}`,
          sender: 'halum',
          text: `একটু নেটওয়ার্ক জ্যাম! সরাসরি কথা বলতে ${deliveryConfig.supportPhone} নম্বরে কল বা হোয়াটসঅ্যাপ করুন 🐯`,
          isFallback: true,
          quickReplies: ['মধু দেখতে চাই', 'গাওয়া ঘি দেখতে চাই'],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Cart & Checkout Guidance action triggered when item added
  const handleAddToCartFromAgent = (product) => {
    addItem(product, 1, false);
    setAddedItemSlug(product.slug);
    if (onStateChange) onStateChange('happy');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `step-3-${Date.now()}`,
          sender: 'halum',
          text: "বাহ! দারুণ চয়েস 🐾 এই খাবার পেটে গেলে বাঘের মতো শক্তি পাবেন! এখন ঝটপট নিচের 'Order Now' বাটনটায় একটা থাবা বসান আর অর্ডার কনফার্ম করুন!",
          action: { type: 'order_now', label: 'থাবা বসান (Order Now)' },
          quickReplies: [`🚚 ফ্রি ডেলিভারি (৳${deliveryConfig.freeDeliveryThreshold}+)`, 'ক্যাশ অন ডেলিভারি আছে?'],
          timestamp: new Date(),
        },
      ]);
    }, 450);

    setTimeout(() => {
      setAddedItemSlug(null);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ── Mobile Backdrop Overlay (Tap Outside to Close) ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 sm:hidden animate-fadeIn"
        aria-hidden="true"
      />

      {/* ── Mobile Bottom-Sheet (<640px) & Desktop Floating Window (>=640px) ── */}
      <div
        className={`fixed z-50 flex flex-col bg-white overflow-hidden animate-slideUp transition-all duration-300
          /* Mobile Bottom-Sheet: w-[calc(100vw-16px)], max-h-[75dvh], rounded-t-2xl */
          bottom-0 left-2 right-2 w-[calc(100vw-16px)] max-h-[75dvh] h-[72dvh] rounded-t-2xl rounded-b-none border-t-2 border-x-2 border-[#FAB116] shadow-2xl
          /* Desktop Floating Popup: sm:w-[380px], sm:h-[530px], sm:rounded-3xl, sm:border-2 */
          sm:bottom-6 sm:h-[530px] sm:max-h-[82vh] sm:w-[380px] sm:rounded-3xl sm:border-2 ${
            isLeftSide ? 'sm:left-6 sm:right-auto' : 'sm:right-6 sm:left-auto'
          }
        `}
      >
        {/* Mobile Top Drag Handle Indicator */}
        <div className="w-12 h-1 bg-amber-400/80 rounded-full mx-auto my-1.5 sm:hidden flex-shrink-0" />

        {/* ── Chat Header (Touch-Friendly 44px Controls & 1-Tap WhatsApp Handoff) ── */}
        <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#016831] via-[#015829] to-[#014D24] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] p-0.5 border-2 border-[#FAB116] flex items-center justify-center flex-shrink-0 shadow-xs">
              <span className="text-xl">🐯</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white leading-tight">
                  হালুম মামা
                </h3>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#FAB116] text-black">
                  শপিং গাইড
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 leading-tight">
                চিফ টেস্ট অফিসার ও খাঁটি বন্ধু
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* 1-Tap WhatsApp Handoff (Requirement 4) */}
            <a
              href={deliveryConfig.supportWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-95"
              title="হোয়াটসঅ্যাপে সরাসরি কথা বলুন"
              aria-label="হোয়াটসঅ্যাপে সরাসরি কথা বলুন"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </a>

            {/* 44x44px Touch Target Close Button (Requirement 4) */}
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all active:scale-95"
              aria-label="চ্যাট বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

      {/* ── Scrollable Messages Area with pb-8 and overflow-x-hidden (Requirement 1 & 4) ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 pb-8 space-y-3.5 bg-[#FCFBF7]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
          >
            {/* Sender Label & Avatar */}
            {msg.sender === 'halum' && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#016831] mb-1">
                <span>🐯</span>
                <span>হালুম মামা</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[92%] sm:max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs break-words ${msg.sender === 'user'
                ? 'bg-[#016831] text-white rounded-br-xs font-medium'
                : 'bg-white text-stone-800 rounded-bl-xs border border-amber-200/80 font-normal'
                }`}
            >
              <p>{msg.text}</p>

              {/* ── In-Chat Interactive Order Tracking Input Card (Requirement 3) ── */}
              {msg.showTrackForm && (
                <div className="mt-3 p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#016831]">
                    <Package className="w-4 h-4 text-[#FAB116]" />
                    <span>লাইভ পার্সেল ট্র্যাকিং</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    আপনার ১১ ডিজিটের মোবাইল নম্বর বা অর্ডার আইডি দিন:
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (trackingCardInput.trim()) {
                        executeTrackQuery(trackingCardInput);
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-1.5"
                  >
                    <input
                      type="text"
                      value={trackingCardInput}
                      onChange={(e) => setTrackingCardInput(e.target.value)}
                      placeholder="যেমন: 01712345678 বা ORD-12345"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-[#016831] text-stone-800 placeholder-stone-400"
                    />
                    <button
                      type="submit"
                      disabled={!trackingCardInput.trim() || trackingLoading}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{trackingLoading ? 'খোঁজা হচ্ছে...' : 'ট্র্যাক করুন'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* ── Embedded In-Chat Order Status Card (Requirement 3) ── */}
              {msg.orders && msg.orders.length > 0 && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-amber-100">
                  {msg.orders.map((ord, oIdx) => (
                    <div
                      key={ord._id || oIdx}
                      className="p-3 rounded-2xl bg-[#FAF9F5] border-2 border-amber-300 shadow-xs space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
                        <span className="font-black text-xs text-[#016831]">
                          #{ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : ord.status === 'shipped'
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                        >
                          {ord.status === 'delivered'
                            ? 'ডেলিভারি সম্পন্ন ✓'
                            : ord.status === 'processing'
                              ? 'প্যাকিং চলছে 📦'
                              : ord.status === 'shipped'
                                ? 'কুরিয়ারে হস্তান্তর 🚚'
                                : 'অর্ডার গৃহীত'}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="space-y-1 text-[11px] text-stone-700">
                        {ord.items &&
                          ord.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex justify-between items-center gap-2">
                              <span className="line-clamp-1 flex-1 font-semibold">
                                • {item.name} × {item.quantity}
                              </span>
                              <span className="font-bold text-[#016831] flex-shrink-0">
                                ৳{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Total Amount & Estimated Delivery */}
                      <div className="pt-1.5 border-t border-stone-200 flex justify-between items-center text-xs font-black">
                        <span className="text-stone-600">সর্বমোট প্রদেয়:</span>
                        <span className="text-amber-700 text-sm">৳{ord.totalAmount}</span>
                      </div>

                      <div className="text-[10px] bg-amber-50 p-2 rounded-xl text-stone-600 space-y-1 border border-amber-100">
                        <div className="flex items-center gap-1 text-[#016831] font-bold">
                          <Truck className="w-3.5 h-3.5" />
                          <span>ডেলিভারি সময়: ঢাকা সিটিতে ২৪–৪৮ ঘণ্টা, বাইরে ২–৩ দিন</span>
                        </div>
                        {ord.courierBooking?.trackingCode && (
                          <div className="font-semibold text-stone-700">
                            কুরিয়ার ট্র্যাকিং কোড: <strong className="text-amber-800">{ord.courierBooking.trackingCode}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Offline / Contact Fallback Card (Requirement 4) ── */}
              {msg.isFallback && (
                <div className="mt-3 pt-2 border-t border-amber-200 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${deliveryConfig.supportPhoneRaw}`}
                    className="min-h-[44px] p-2 rounded-xl bg-[#016831] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#02833E] active:scale-95 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-300" />
                    <span>কল করুন</span>
                  </a>
                  <a
                    href={deliveryConfig.supportWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] p-2 rounded-xl bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                </div>
              )}

              {/* ── Embedded Product Cards (Compact 2-Cards per row Grid) ── */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 pt-2 border-t border-amber-100">
                  <div className="text-[10px] font-bold text-[#016831] flex items-center gap-1 mb-2">
                    <Sparkles className="w-3 h-3 text-[#FAB116]" />
                    <span>প্রস্তাবিত খাঁটি খাবার:</span>
                  </div>

                  {/* 2-Columns Grid Layout */}
                  <div className="grid grid-cols-2 gap-2">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id || prod.slug}
                        className="p-2 rounded-2xl bg-[#FAF9F5] border border-amber-200/90 hover:border-[#016831]/60 transition-all flex flex-col justify-between overflow-hidden shadow-xs group"
                      >
                        {/* Compact Top Image + Badge */}
                        <Link
                          href={`/products/${prod.slug}`}
                          className="w-full h-20 sm:h-24 relative rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 block mb-1.5 group-hover:scale-[1.02] transition-transform"
                        >
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            sizes="(max-width: 640px) 130px, 160px"
                            className="object-cover"
                          />
                          {prod.badge && (
                            <span className="absolute top-1 left-1 bg-amber-500/95 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded-md shadow-xs">
                              {prod.badge}
                            </span>
                          )}
                        </Link>

                        {/* Title (line-clamp-2) & Unit */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${prod.slug}`}
                            className="text-[11px] font-bold text-stone-900 hover:text-[#016831] line-clamp-2 leading-tight block mb-0.5"
                          >
                            {prod.name}
                          </Link>
                          <div className="text-[9px] text-stone-500 truncate mb-1">
                            {prod.unit}
                          </div>
                        </div>

                        {/* Price & Add to Cart button */}
                        <div className="pt-1.5 border-t border-amber-100 flex items-center justify-between gap-1 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#016831]">
                              ৳{prod.price}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-[9px] text-stone-400 line-through">
                                ৳{prod.originalPrice}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleAddToCartFromAgent(prod)}
                            className={`min-h-[34px] px-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-all active:scale-90 shadow-xs ${addedItemSlug === prod.slug
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#016831] hover:bg-[#02833E] text-white'
                              }`}
                            title="কার্টে যোগ করুন"
                          >
                            {addedItemSlug === prod.slug ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3 text-[#FAB116]" />
                                <span>+কার্ট</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prominent Action Button: Order Now / থাবা বসান 🐾 */}
              {msg.action && msg.action.type === 'order_now' && (
                <div className="mt-3 pt-2.5 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openCart();
                    }}
                    className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#016831] via-[#02833E] to-[#FAB116] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all group"
                  >
                    <span className="text-sm group-hover:scale-125 transition-transform">🐾</span>
                    <span>থাবা বসান (Order Now)</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* 44px Min Touch-Target Quick Reply Chips (Requirement 4) */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-1">
                  {msg.quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(qr)}
                      className="min-h-[44px] text-[11px] font-bold px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-[#FEF9E7] text-[#016831] border border-amber-200 transition-colors active:scale-95 flex items-center justify-center whitespace-nowrap flex-shrink-0 shadow-2xs"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[9px] text-stone-400 mt-1 px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#016831] font-bold bg-white p-2.5 rounded-2xl border border-amber-200 w-fit animate-pulse">
            <span>🐯</span>
            <span>হালুম মামা ভাবছেন...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce delay-200" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Categories Shortcut Strip (Touch-pan-x, overflow-x-auto, 44px touch height) ── */}
      <div className="px-3 py-2 bg-[#FAF9F5] border-t border-amber-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x text-[11px] font-bold">
        {/* Zero-Typing Recommender Button (Requirement 4) */}
        <button
          onClick={() => handleSendMessage('🎯 কোনটা আমার জন্য সেরা?')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-[#FAB116] to-yellow-400 text-slate-950 font-black border border-amber-300 shadow-xs active:scale-95 flex items-center gap-1.5 flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🎯 কোনটা আমার জন্য সেরা?</span>
        </button>

        <button
          onClick={() => handleSendMessage('মধু দেখতে চাই')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831] active:scale-95 flex items-center flex-shrink-0"
        >
          🍯 মধু
        </button>
        <button
          onClick={() => handleSendMessage('গাওয়া ঘি দেখতে চাই')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831] active:scale-95 flex items-center flex-shrink-0"
        >
          🧈 গাওয়া ঘি
        </button>
        <button
          onClick={() => handleSendMessage('সরিষার তেল কেমন?')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831] active:scale-95 flex items-center flex-shrink-0"
        >
          🌿 ঘানি তেল
        </button>
        <button
          onClick={() => handleSendMessage('অর্ডার ট্র্যাক করব')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-[#016831] active:scale-95 flex items-center gap-1 flex-shrink-0"
        >
          <Package className="w-3.5 h-3.5 text-amber-500" />
          <span>অর্ডার ট্র্যাক</span>
        </button>
        <button
          onClick={() => handleSendMessage('কম্বো অফার দেখাও')}
          className="whitespace-nowrap min-h-[44px] px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 active:scale-95 flex items-center gap-1 flex-shrink-0"
        >
          <Flame className="w-3.5 h-3.5 text-amber-600" />
          <span>মেগা কম্বো</span>
        </button>
      </div>

      {/* ── Sticky Bottom Input Bar (Ensures Virtual Keyboard Doesn't Cover It) ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 sm:p-2.5 pb-[calc(8px+env(safe-area-inset-bottom,0px))] bg-white border-t border-stone-200 flex items-center gap-2 sticky bottom-0 z-10"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="হালুম মামাকে যেকোনো প্রশ্ন করুন..."
          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-stone-200 focus:border-[#016831] focus:ring-1 focus:ring-[#016831] outline-hidden text-xs sm:text-sm text-stone-800 placeholder-stone-400"
        />

        {/* 44x44px Touch Target Send Button (Requirement 4) */}
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="min-w-[44px] min-h-[44px] rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white shadow-xs disabled:opacity-40 transition-all flex items-center justify-center flex-shrink-0"
          aria-label="বার্তা পাঠান"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  </>
  );
}
