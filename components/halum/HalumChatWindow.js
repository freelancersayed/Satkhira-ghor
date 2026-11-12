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
  RotateCcw,
  ExternalLink,
  Check,
  Flame,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function HalumChatWindow({
  isOpen,
  onClose,
  onStateChange,
  currentState = 'idle',
}) {
  const [messages, setMessages] = useState([
    {
      id: 'step-1-welcome',
      sender: 'halum',
      text: 'হালুম! সুন্দরবনের গভীর থেকে সরাসরি খাঁটি মধুর দুনিয়ায় আপনাকে স্বাগতম! আমি বনের রাজা, তবে আজ আপনার শপিং গাইড! বলুন, আজ কোন মধুটা চেখে দেখতে চান? 🐯',
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
      quickReplies: ['🍯 খাঁটি খলসী মধু', '🌿 কেওড়া মধু', '🎁 স্পেশাল কম্বো প্যাক', '🚚 ডেলিভারি চার্জ কত?'],
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemSlug, setAddedItemSlug] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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

  // Handle sending a message
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

    if (onStateChange) onStateChange('talking');

    try {
      const res = await fetch('/api/halum-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      const botMsg = {
        id: `halum-${Date.now()}`,
        sender: 'halum',
        text: data.reply || 'হালুম! আমি আপনার কথাটি বুঝতে পেরেছি।',
        products: data.products || [],
        quickReplies: data.quickReplies || [],
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
      setMessages((prev) => [
        ...prev,
        {
          id: `halum-${Date.now()}`,
          sender: 'halum',
          text: 'হালুম! একটু নেটওয়ার্কের সমস্যা হয়েছে বন্ধু। নিচে বাটন থেকে পণ্য দেখতে পারেন।',
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
    if (onStateChange) onStateChange('dancing');

    // Halum provides joyful Step 3 guidance
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `step-3-${Date.now()}`,
          sender: 'halum',
          text: "বাহ! দারুণ একটা চয়েস করেছেন। এই মধু পেটে গেলে শরীরে বাঘের মতো শক্তি পাবেন গ্যারান্টি! এখন ঝটপট নিচের 'Order Now' বাটনটায় একটা থাবা বসান (ক্লিক করুন) আর আপনার ঠিকানাটা দিন! 🐾",
          action: { type: 'order_now', label: 'থাবা বসান (Order Now)' },
          quickReplies: ['🚚 ফ্রি ডেলিভারি কীভাবে পাব?', 'ক্যাশ অন ডেলিভারি আছে?'],
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
    <div className="fixed bottom-24 sm:bottom-6 right-3 sm:right-6 z-50 w-[94vw] sm:w-[380px] max-h-[82vh] h-[540px] bg-white rounded-3xl shadow-2xl border-2 border-[#FAB116] flex flex-col overflow-hidden animate-slideUp">
      {/* ── Chat Header ── */}
      <div className="p-3.5 bg-gradient-to-r from-[#016831] via-[#015829] to-[#014D24] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] p-0.5 border-2 border-[#FAB116] flex items-center justify-center flex-shrink-0 shadow-xs">
            <span className="text-xl">🐯</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black text-white leading-tight">
                হালুম ভাই
              </h3>
              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[#FAB116] text-black">
                AI Agent
              </span>
            </div>
            <p className="text-[10px] text-emerald-200 leading-tight">
              সুন্দরবনের খাঁটি বন্ধু ও শপিং গাইড
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          aria-label="চ্যাট বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Scrollable Messages Area ── */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 bg-[#FCFBF7]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* Sender Label & Avatar */}
            {msg.sender === 'halum' && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#016831] mb-1">
                <span>🐯</span>
                <span>হালুম ভাই</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#016831] text-white rounded-br-xs font-medium'
                  : 'bg-white text-stone-800 rounded-bl-xs border border-amber-200/80 font-normal'
              }`}
            >
              <p>{msg.text}</p>

              {/* Embedded Product Cards recommended by Agent */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2 pt-2 border-t border-amber-100">
                  <div className="text-[10px] font-bold text-[#016831] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#FAB116]" />
                    <span>প্রস্তাবিত খাঁটি খাবার:</span>
                  </div>

                  <div className="space-y-2">
                    {msg.products.map((prod) => (
                      <div
                        key={prod.id || prod.slug}
                        className="p-2 rounded-xl bg-[#FAF9F5] border border-amber-200/90 hover:border-[#016831]/50 transition-all flex items-center gap-2.5"
                      >
                        <Link
                          href={`/products/${prod.slug}`}
                          className="w-12 h-12 relative rounded-lg overflow-hidden bg-stone-100 flex-shrink-0"
                        >
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${prod.slug}`}
                            className="text-xs font-bold text-stone-900 hover:text-[#016831] truncate block"
                          >
                            {prod.name}
                          </Link>
                          <div className="text-[10px] text-stone-500 truncate">
                            {prod.unit}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-[#016831]">
                              ৳{prod.price}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-[9px] text-stone-400 line-through">
                                ৳{prod.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action: Direct Add to Cart Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToCartFromAgent(prod)}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-90 flex-shrink-0 shadow-xs ${
                            addedItemSlug === prod.slug
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#016831] hover:bg-[#02833E] text-white'
                          }`}
                          title="কার্টে যোগ করুন"
                        >
                          {addedItemSlug === prod.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span className="text-[10px]">যুক্ত ✓</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-[#FAB116]" />
                              <span className="text-[10px]">কার্ট</span>
                            </>
                          )}
                        </button>
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
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#016831] via-[#02833E] to-[#FAB116] text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all group"
                  >
                    <span className="text-sm group-hover:scale-125 transition-transform">🐾</span>
                    <span>থাবা বসান (Order Now)</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Quick Reply Chips attached to the message */}
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-amber-100 flex flex-wrap gap-1.5">
                  {msg.quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(qr)}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-[#FEF9E7] text-[#016831] border border-amber-200 transition-colors active:scale-95"
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
            <span>হালুম ভাই ভাবছেন...</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#016831] animate-bounce delay-200" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Categories Shortcut Strip ── */}
      <div className="px-3 py-1.5 bg-[#FAF9F5] border-t border-amber-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-bold">
        <button
          onClick={() => handleSendMessage('মধু দেখতে চাই')}
          className="whitespace-nowrap px-2 py-1 rounded-md bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831]"
        >
          🍯 মধু
        </button>
        <button
          onClick={() => handleSendMessage('গাওয়া ঘি দেখতে চাই')}
          className="whitespace-nowrap px-2 py-1 rounded-md bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831]"
        >
          🧈 গাওয়া ঘি
        </button>
        <button
          onClick={() => handleSendMessage('সরিষার তেল কেমন?')}
          className="whitespace-nowrap px-2 py-1 rounded-md bg-white border border-stone-200 text-stone-700 hover:text-[#016831] hover:border-[#016831]"
        >
          🌿 ঘানি ভাঙা তেল
        </button>
        <button
          onClick={() => handleSendMessage('কম্বো অফার দেখাও')}
          className="whitespace-nowrap px-2 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5"
        >
          <Flame className="w-2.5 h-2.5 text-amber-600" />
          <span>মেগা কম্বো</span>
        </button>
      </div>

      {/* ── Input Bar ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="হালুম ভাইকে যেকোনো প্রশ্ন করুন..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#FAF9F5] border border-stone-200 focus:border-[#016831] focus:ring-1 focus:ring-[#016831] outline-hidden text-xs text-stone-800 placeholder-stone-400"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 rounded-xl bg-[#016831] hover:bg-[#02833E] active:scale-95 text-white shadow-xs disabled:opacity-40 transition-all flex items-center justify-center flex-shrink-0"
          aria-label="বার্তা পাঠান"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

