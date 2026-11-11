'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  ShoppingBag,
  Search,
  User,
  X,
  PhoneCall,
  MessageCircle,
  Truck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Check,
  ExternalLink,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';
import { products, categories } from '@/data/products';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedSearchId, setAddedSearchId] = useState(null);

  const searchInputRef = useRef(null);

  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  const [cartBadgeAnimate, setCartBadgeAnimate] = useState(false);

  // Trigger bounce animation when item is added to cart
  useEffect(() => {
    if (lastAddedItem) {
      setCartBadgeAnimate(true);
      const timer = setTimeout(() => setCartBadgeAnimate(false), 1400);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  const { user, logout, checkAuth } = useAuthStore();
  const { content } = useSiteContentStore();

  const helpline = content?.hero?.helpline || '০১৭১২-৩৪৫৬৭৮';
  // Clean phone number for tel: and wa.me:
  const helplineDigits = helpline.replace(/[^\d+]/g, '');
  const whatsappNumber = helplineDigits.startsWith('0')
    ? '88' + helplineDigits
    : helplineDigits.startsWith('+88')
    ? helplineDigits.replace('+', '')
    : helplineDigits.startsWith('88')
    ? helplineDigits
    : '8801712345678';

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Lock body scroll when modals are open
  useEffect(() => {
    if (searchModalOpen || accountModalOpen || chatModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchModalOpen, accountModalOpen, chatModalOpen]);

  // Auto-focus search input when search modal opens
  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchModalOpen]);

  // Close modals on route change
  useEffect(() => {
    setSearchModalOpen(false);
    setAccountModalOpen(false);
    setChatModalOpen(false);
  }, [pathname]);

  const totalItems = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const totalPrice = mounted
    ? items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  // Search results calculation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        return (
          p.name?.toLowerCase().includes(q) ||
          p.nameEn?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.shortDescription?.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [searchQuery]);

  const popularSearches = [
    'সুন্দরবনের মধু',
    'গাওয়া ঘি',
    'সরিষার তেল',
    'ক্ষীর সন্দেশ',
    'কম্বো অফার',
    'চিয়া সিড',
  ];

  // Don't show bottom nav on admin panel
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const handleOpenMobileMenu = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-mobile-menu'));
    }
  };

  const handleHomeClick = (e) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchModalOpen(false);
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <>
      {/* ═════════════════════════════════════════════════════════════════
          ১. ফ্লোটিং সাইড কার্ট উইজেট (Floating Side Cart Pill on Right Edge)
          (Polli Bazar & Ghorer Bazar স্টাইলে স্ক্রিনের ডান পাশে আটকে থাকে)
          ═════════════════════════════════════════════════════════════════ */}
      <aside
        onClick={openCart}
        aria-label="Open Cart Drawer"
        className={`fixed right-0 top-[52%] -translate-y-1/2 z-40 flex flex-col items-center justify-center bg-[#E08E00] hover:bg-[#D97706] active:scale-95 text-white px-2 sm:px-2.5 py-3 rounded-l-2xl shadow-2xl border-y border-l border-amber-300/40 cursor-pointer transition-all duration-300 group ${
          cartBadgeAnimate ? 'scale-110 shadow-amber-500/60 ring-2 ring-white animate-pulse' : ''
        }`}
      >
        <div className="relative mb-1">
          <ShoppingBag className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-black text-[#FAB116] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
              {totalItems}
            </span>
          )}
        </div>
        <div className="text-[10px] font-black text-white leading-tight">
          {totalItems} Items
        </div>
        <div className="text-[9px] font-extrabold text-[#FEF3C7] leading-tight mt-0.5">
          ৳{totalPrice.toLocaleString('en-US')}
        </div>
      </aside>

      {/* ═════════════════════════════════════════════════════════════════
          ২. ফ্লোটিং চ্যাট / হেল্পলাইন বাটন (Floating Quick Contact at Bottom-Right)
          ═════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-[72px] right-3.5 z-40">
        <button
          type="button"
          onClick={() => setChatModalOpen((prev) => !prev)}
          aria-label="কাস্টমার সাপোর্ট ও চ্যাট"
          className="w-12 h-12 rounded-full bg-[#E08E00] hover:bg-[#D97706] text-white flex items-center justify-center shadow-lg shadow-[#E08E00]/40 border-2 border-white active:scale-90 transition-transform group"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="sr-only">চ্যাট করুন</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════
          ৩. মোবাইলের নিচের প্রিমিয়াম শর্টকাট আইকন বার (Bottom Navigation Bar)
          স্ক্রিনশটের মতো: HOME | MENU | CART | SEARCH | ACCOUNT
          ═════════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#016831] text-white border-t border-[#014D24] shadow-[0_-4px_20px_rgba(0,0,0,0.18)] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 items-center justify-between text-center select-none">
          {/* ১. HOME */}
          <Link
            href="/"
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              pathname === '/' ? 'text-[#FAB116]' : 'text-white/90 hover:text-white'
            }`}
          >
            <Home
              className={`w-5 h-5 ${
                pathname === '/' ? 'stroke-[2.5] scale-105' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] font-extrabold tracking-wider uppercase mt-1">
              HOME
            </span>
          </Link>

          {/* ২. MENU */}
          <button
            type="button"
            onClick={handleOpenMobileMenu}
            className="flex flex-col items-center justify-center py-1 text-white/90 hover:text-[#FAB116] active:scale-90 transition-all"
            aria-label="মেনু খুলুন"
          >
            <LayoutGrid className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase mt-1">
              MENU
            </span>
          </button>

          {/* ৩. CART */}
          <button
            type="button"
            onClick={openCart}
            className="relative flex flex-col items-center justify-center py-1 text-white/90 hover:text-[#FAB116] active:scale-90 transition-all"
            aria-label="কার্ট খুলুন"
          >
            <div className="relative">
              <ShoppingBag
                className={`w-5 h-5 stroke-[1.8] transition-transform ${
                  cartBadgeAnimate ? 'scale-115 text-[#FAB116]' : ''
                }`}
              />
              {/* স্ক্রিনশটের মতো ব্ল্যাক সার্কেল ব্যাজ (অ্যানিমেশন সহ) */}
              <span
                className={`absolute -top-1.5 -right-2 text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-xs transition-all duration-300 ${
                  cartBadgeAnimate
                    ? 'scale-125 bg-[#FAB116] text-black ring-2 ring-white animate-bounce'
                    : 'bg-slate-950 text-white'
                }`}
              >
                {totalItems}
              </span>
            </div>
            <span className="text-[10px] font-extrabold tracking-wider uppercase mt-1">
              CART
            </span>
          </button>

          {/* ৪. SEARCH */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 text-white/90 hover:text-[#FAB116] active:scale-90 transition-all"
            aria-label="পণ্য সার্চ করুন"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-extrabold tracking-wider uppercase mt-1">
              SEARCH
            </span>
          </button>

          {/* ৫. ACCOUNT */}
          <button
            type="button"
            onClick={() => setAccountModalOpen(true)}
            className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
              pathname.startsWith('/admin') || pathname === '/login' || pathname === '/track-order'
                ? 'text-[#FAB116]'
                : 'text-white/90 hover:text-white'
            }`}
            aria-label="একাউন্ট"
          >
            <User
              className={`w-5 h-5 ${
                pathname.startsWith('/admin') || pathname === '/login'
                  ? 'stroke-[2.5] scale-105'
                  : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] font-extrabold tracking-wider uppercase mt-1">
              ACCOUNT
            </span>
          </button>
        </div>
      </nav>

      {/* ═════════════════════════════════════════════════════════════════
          ৪. কাস্টমার সাপোর্ট / চ্যাট ড্রপডাউন পপআপ (Floating Chat Card)
          ═════════════════════════════════════════════════════════════════ */}
      {mounted && chatModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end justify-end p-4 pointer-events-none">
          {/* Backdrop for closing */}
          <div
            onClick={() => setChatModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-2xs pointer-events-auto"
          />

          <div className="relative pointer-events-auto w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-stone-200 p-4 mb-20 animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#016831] text-[#FAB116] flex items-center justify-center font-bold text-sm">
                  স
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#016831]">সাতক্ষীরা ঘর সাপোর্ট</h4>
                  <p className="text-[10px] text-stone-500">আমরা সার্বক্ষণিক আপনার সেবায় আছি</p>
                </div>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {/* WhatsApp direct chat */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  'আসসালামু আলাইকুম, আমি সাতক্ষীরা ঘর থেকে কিছু তথ্য ও পণ্য সম্পর্কে জানতে চাই।'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setChatModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#25D366]/10 text-[#075E54] hover:bg-[#25D366]/20 transition-colors font-bold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <i className="fa-brands fa-whatsapp text-lg text-[#25D366]" />
                  <span>WhatsApp-এ মেসেজ দিন</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </a>

              {/* Call Hotline */}
              <a
                href={`tel:${helplineDigits}`}
                onClick={() => setChatModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#016831]/10 text-[#016831] hover:bg-[#016831]/20 transition-colors font-bold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-[#016831]" />
                  <span>হটলাইনে কল করুন: {helpline}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </a>

              {/* Track Order */}
              <Link
                href="/track-order"
                onClick={() => setChatModalOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-[#E08E00] hover:bg-amber-100 transition-colors font-bold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-[#E08E00]" />
                  <span>অর্ডার ট্র্যাকিং করুন</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════
          ৫. ফুল-স্ক্রিন ইনস্ট্যান্ট সার্চ মোডাল (Instant Mobile Search Modal)
          (SEARCH আইকনে চাপ দিলে কোনো স্ক্রোল ছাড়াই ঝটপট সার্চ করা যায়)
          ═════════════════════════════════════════════════════════════════ */}
      {mounted && searchModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex flex-col bg-white animate-fadeIn" role="dialog" aria-modal="true">
          {/* Search Header Bar */}
          <div className="p-3 bg-[#FAF9F5] border-b border-[#E8E2D5] flex items-center gap-2.5">
            <button
              onClick={() => setSearchModalOpen(false)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
              aria-label="সার্চ বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="সুন্দরবনের মধু, ঘি, তেল খুঁজুন..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-[#016831]/30 focus:border-[#016831] focus:ring-2 focus:ring-[#016831]/20 outline-hidden text-xs sm:text-sm font-medium text-stone-800 placeholder-stone-400 shadow-xs"
              />
              <Search className="w-4 h-4 text-[#016831] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            <button
              onClick={handleSearchSubmit}
              className="px-3 py-2 rounded-xl bg-[#016831] hover:bg-[#02833E] text-white text-xs font-bold shadow-xs flex-shrink-0"
            >
              খুঁজুন
            </button>
          </div>

          {/* Search Modal Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Popular Searches */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FAB116]" />
                <span>জনপ্রিয় সার্চ</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#FEF9E7] text-stone-700 hover:text-[#016831] border border-[#E8E2D5] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Results */}
            {searchQuery.trim() ? (
              <div>
                <div className="text-xs font-bold text-stone-500 mb-2.5 flex items-center justify-between">
                  <span>ফলাফল ({searchResults.length} টি)</span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-[#016831] text-[11px] font-bold hover:underline"
                  >
                    সব দেখুন &rarr;
                  </button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF9F5] border border-stone-200/70 hover:border-[#016831]/40 transition-all"
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          onClick={() => setSearchModalOpen(false)}
                          className="w-14 h-14 relative rounded-lg overflow-hidden flex-shrink-0 bg-stone-100"
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => setSearchModalOpen(false)}
                            className="text-xs font-bold text-stone-900 hover:text-[#016831] line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            {product.unit}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-black text-[#016831]">
                              ৳{product.price.toLocaleString('bn-BD')}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-[10px] text-stone-400 line-through">
                                ৳{product.originalPrice.toLocaleString('bn-BD')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            addItem(product, 1, false);
                            setAddedSearchId(product.id);
                            setTimeout(() => setAddedSearchId(null), 1800);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg active:scale-95 transition-all text-[11px] font-bold shadow-xs flex items-center gap-1 flex-shrink-0 ${
                            addedSearchId === product.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#016831] text-white hover:bg-[#02833E]'
                          }`}
                        >
                          {addedSearchId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>যুক্ত ✓</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5 text-[#FAB116]" />
                              <span>যোগ করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-stone-400">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-500" />
                    <p className="text-xs">দুঃখিত, এই নামে কোনো পণ্য পাওয়া যায়নি।</p>
                  </div>
                )}
              </div>
            ) : (
              /* Quick Category explorer when no query */
              <div className="pt-2">
                <div className="text-xs font-bold text-stone-500 mb-2">ক্যাটাগরি সমূহ</div>
                <div className="grid grid-cols-2 gap-2">
                  {categories
                    .filter((c) => c.id !== 'all')
                    .slice(0, 6)
                    .map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?cat=${cat.id}`}
                        onClick={() => setSearchModalOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-stone-200/80 hover:bg-[#FEF9E7] transition-colors"
                      >
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-xs font-bold text-stone-800 truncate">
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════
          ৬. একাউন্ট বটম শিট / মোডাল (Mobile Account Sheet)
          ═════════════════════════════════════════════════════════════════ */}
      {mounted && accountModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-end justify-center" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            onClick={() => setAccountModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs animate-fadeIn"
          />

          {/* Bottom Sheet */}
          <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-5 z-10 animate-slideUp border-t border-[#E8E2D5] space-y-4">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-stone-300 mx-auto -mt-1" />

            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#016831] text-[#FAB116] flex items-center justify-center font-black text-base shadow-sm">
                  {user?.name?.charAt(0) || 'স'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#016831]">
                    {user ? user.name : 'আমার অ্যাকাউন্ট'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {user ? user.phone : 'স্বাগতম সাতক্ষীরা ঘর-এ'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAccountModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {user ? (
                <>
                  {['admin', 'manager', 'staff'].includes(user.role) && (
                    <Link
                      href="/admin"
                      onClick={() => setAccountModalOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#016831] text-white font-bold text-xs shadow-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-[#FAB116]" />
                        <span>অ্যাডমিন কন্ট্রোল প্যানেল</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    </Link>
                  )}

                  <Link
                    href="/track-order"
                    onClick={() => setAccountModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] text-stone-800 hover:bg-[#FEF9E7] transition-colors font-bold text-xs border border-stone-200/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#016831]" />
                      <span>আমার অর্ডারসমূহ ট্র্যাক করুন</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setAccountModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট করুন</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setAccountModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#016831] text-white font-bold text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[#FAB116]" />
                      <span>লগইন বা সাইন আপ করুন</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/70" />
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={() => setAccountModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] text-stone-800 hover:bg-[#FEF9E7] transition-colors font-bold text-xs border border-stone-200/80"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-[#016831]" />
                      <span>অর্ডার ট্র্যাক করুন (লগইন ছাড়াই)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </Link>

                  <a
                    href={`tel:${helplineDigits}`}
                    onClick={() => setAccountModalOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-50 text-[#E08E00] hover:bg-amber-100 transition-colors font-bold text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <PhoneCall className="w-4 h-4 text-[#E08E00]" />
                      <span>কাস্টমার কেয়ার: {helpline}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
