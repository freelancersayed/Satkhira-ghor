'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Menu,
  X,
  Sparkles,
  PhoneCall,
  User,
  ShieldCheck,
  LogOut,
  Package,
  Truck,
  Flame,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';
import SearchBar from '@/components/common/SearchBar';
import { categories } from '@/data/products';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);
  const [badgeBounce, setBadgeBounce] = useState(false);

  useEffect(() => {
    if (lastAddedItem) {
      setBadgeBounce(true);
      const timer = setTimeout(() => setBadgeBounce(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  const { user, logout, checkAuth } = useAuthStore();
  const { content } = useSiteContentStore();
  const hero = content?.hero || {};

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Listen for custom events from MobileBottomNav & other components
  useEffect(() => {
    const handleToggle = () => setMobileMenuOpen((prev) => !prev);
    const handleOpen = () => setMobileMenuOpen(true);
    const handleClose = () => setMobileMenuOpen(false);

    window.addEventListener('toggle-mobile-menu', handleToggle);
    window.addEventListener('open-mobile-menu', handleOpen);
    window.addEventListener('close-mobile-menu', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      window.removeEventListener('open-mobile-menu', handleOpen);
      window.removeEventListener('close-mobile-menu', handleClose);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const totalItems = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const navLinks = [
    { name: 'হোম', href: '/' },
    { name: 'সব পণ্য', href: '/shop' },
    { name: 'অর্ডার ট্র্যাক', href: '/track-order' },
    { name: 'আমাদের গল্প', href: '/about-us' },
  ];

  const headerEditFields = [
    {
      name: 'topNotice',
      label: 'টপ নোটিশ বার বার্তা',
      placeholder:
        'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)',
    },
    { name: 'helpline', label: 'হেল্পলাইন মোবাইল নম্বর', placeholder: '০১৭১২-৩৪৫৬৭৮' },
  ];

  const allCategories = Array.isArray(content?.categories) && content.categories.length > 0
    ? content.categories
    : categories;
  const displayCategories = allCategories.filter((c) => c.id !== 'all' && c.slug !== 'all').slice(0, 7);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 shadow-xs">
      {/* ── Top Notification Bar (Polli Bazar Style) ── */}
      {/* <div className="bg-[#014D24] text-[#FEF3C7] text-xs py-1.5 px-3 sm:px-4 border-b border-[#016831]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse flex-shrink-0" />
            <span className="truncate max-w-xs sm:max-w-xl text-[11px] sm:text-xs">
              {hero.topNotice ||
                'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)'}
            </span>
            {user?.role === 'admin' && (
              <AdminSectionEditModal
                sectionKey="hero"
                sectionTitle="টপ নোটিশ ও হেল্পলাইন এডিট করুন"
                fields={headerEditFields}
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs font-medium">
            <Link
              href="/track-order"
              className="hover:text-[#F59E0B] transition-colors flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>অর্ডার ট্র্যাক</span>
            </Link>
            <a
              href={`tel:${hero.helpline || '+8801712345678'}`}
              className="flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors font-bold text-[#F59E0B]"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>হেল্পলাইন: {hero.helpline || '০১৭১২-৩৪৫৬৭৮'}</span>
            </a>
          </div>
        </div>
      </div> */}

      {/* ── Main Navigation Bar ── */}
      <nav className="bg-[#FAF9F5]/98 backdrop-blur-md border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* ═════════════════════════════════════════════════════════════════
              ১. মোবাইল হেডার বার (< md): বামে মেনু | মাঝে লোগো ও নাম | ডানে কার্ট
              ═════════════════════════════════════════════════════════════════ */}
          <div className="flex md:hidden items-center justify-between h-15 xs:h-16">
            {/* বাম পাশে: মোবাইল মেনু বাটন */}
            <div className="flex-shrink-0 w-11 flex justify-start">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-1 rounded-xl text-[#016831] hover:bg-stone-200/50 active:scale-95 transition-all focus:outline-none"
                aria-label="মোবাইল মেনু খুলুন"
              >
                <Menu className="w-6 h-6 stroke-[2.2]" />
              </button>
            </div>

            {/* সেন্টারে: ব্র্যান্ড লোগো ও নাম */}
            <div className="flex-1 flex justify-center items-center min-w-0 px-1">
              <Link href="/" className="flex items-center gap-2 group max-w-full">
                <div className="w-9 h-9 relative flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <Image
                    src="/assets/logo-1.png"
                    alt="সাতক্ষীরা ঘর"
                    fill
                    priority
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col text-left truncate">
                  <span className="text-base font-extrabold tracking-tight text-[#016831] flex items-center leading-tight truncate">
                    সাতক্ষীরা <span className="text-[#FAB116] ml-1">ঘর</span>
                  </span>
                  <span className="text-[7.5px] font-bold tracking-wider uppercase text-[#E08E00] leading-none mt-0.5">
                    Pure & Organic
                  </span>
                </div>
              </Link>
            </div>

            {/* ডান পাশে: শপিং কার্ট বাটন */}
            <div className="flex-shrink-0 w-11 flex justify-end">
              <button
                type="button"
                onClick={openCart}
                id="cart-drawer-toggle-btn-mobile"
                aria-label="শপিং কার্ট"
                className="relative p-2 -mr-1 rounded-xl bg-[#016831] text-white hover:bg-[#014D24] active:scale-95 transition-all shadow-xs flex items-center justify-center group"
              >
                <ShoppingBag
                  className={`w-5 h-5 text-[#FEF9E7] transition-transform ${
                    badgeBounce ? 'scale-115 text-[#FAB116]' : 'group-hover:scale-110'
                  }`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 bg-[#FAB116] text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all ${
                      badgeBounce ? 'scale-125 ring-2 ring-white animate-bounce' : 'animate-pulse'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ২. ডেস্কটপ হেডার বার (>= md স্ক্রিন): বামে লোগো | মাঝে সার্চ | ডানে ইউজার ও কার্ট
              ═════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex items-center justify-between gap-4 h-18 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="w-14 h-14 flex items-center justify-center text-[#FAB116] group-hover:scale-105 transition-transform duration-200 overflow-hidden relative flex-shrink-0">
                  <Image
                    src="/assets/logo-1.png"
                    alt="সাতক্ষীরা ঘর লোগো"
                    fill
                    priority
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="font-serif text-xl sm:text-2xl font-bold select-none text-[#FAB116]">
                    স
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#016831] flex items-center gap-1">
                    সাতক্ষীরা <span className="text-[#FAB116]">ঘর</span>
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase text-[#E08E00]">
                    Pure & Organic
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Center: Prominent Search Bar */}
            <div className="flex-1 max-w-md lg:max-w-lg mx-auto">
              <SearchBar />
            </div>

            {/* Desktop Right Action Buttons: User, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* User Account Dropdown */}
              <div className="relative">
                {mounted && user ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FEF3C7] text-[#016831] hover:bg-[#FDE68A] transition-colors border border-[#FCD34D]/60 text-xs font-bold"
                  >
                    <User className="w-4 h-4 text-[#016831]" />
                    <span className="hidden sm:inline max-w-[85px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#016831]" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F7F5F0] text-[#016831] hover:bg-[#EFE9DC] transition-colors border border-[#E8E2D5] text-xs font-bold"
                  >
                    <User className="w-4 h-4 text-[#016831]" />
                    <span>লগইন</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {userDropdownOpen && user && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8E2D5] py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E8E2D5]">
                      <p className="text-xs font-bold text-[#016831] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#6B7280] truncate">{user.phone}</p>
                    </div>

                    {['admin', 'manager', 'staff'].includes(user.role) && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>এডমিন ড্যাশবোর্ড</span>
                      </Link>
                    )}

                    <Link
                      href="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#016831] hover:bg-[#FAF9F5] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#E08E00]" />
                      <span>আমার অর্ডারসমূহ</span>
                    </Link>

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Shopping Bag Button (Desktop) */}
              <button
                onClick={openCart}
                id="cart-drawer-toggle-btn"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-xl bg-[#016831] text-white hover:bg-[#014D24] transition-colors shadow-sm flex items-center justify-center group"
              >
                <ShoppingBag
                  className={`w-5 h-5 text-[#FEF9E7] transition-transform ${
                    badgeBounce ? 'scale-115 text-[#FAB116]' : 'group-hover:scale-110'
                  }`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 bg-[#FAB116] text-slate-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all ${
                      badgeBounce ? 'scale-125 ring-2 ring-white animate-bounce' : 'animate-pulse'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              ৩. মোবাইল সার্চবার রো (মোবাইলে টপ বারের নিচে সার্বক্ষণিক দৃশ্যমান)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="md:hidden pb-2.5 pt-0.5">
            <SearchBar isMobile onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>

        {/* ── Sub Navigation: Desktop Category Bar (Polli Bazar Style) ── */}
        <div className="hidden md:block bg-[#FAF8F5] border-t border-[#E8E2D5]/70 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
              <Link
                href="/shop"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#016831] text-[#FEF3C7] hover:bg-[#014D24] transition-colors font-bold whitespace-nowrap shadow-xs"
              >
                <span>সব পণ্য</span>
              </Link>
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  href={`/shop?cat=${cat.slug}`}
                  className="px-2.5 py-1.5 rounded-lg text-[#14241E] hover:text-[#016831] hover:bg-white transition-all whitespace-nowrap flex items-center gap-1 border border-transparent hover:border-[#E8E2D5]"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-4 text-xs font-bold text-[#E08E00]">
              <Link
                href="/shop?cat=combos"
                className="flex items-center gap-1 hover:text-[#016831] transition-colors bg-[#FEF3C7] px-2.5 py-1 rounded-md"
              >
                <Flame className="w-3.5 h-3.5 text-[#FAB116]" />
                <span>কম্বো অফার</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════
            ৪. বাম দিক থেকে স্লাইড হওয়া আধুনিক মোবাইল নেভিগেশন ড্রয়ার (Drawer)
            (Rendered via Portal to document.body to ensure 100% overlay over banners)
            ═════════════════════════════════════════════════════════════════ */}
        {mounted && mobileMenuOpen && createPortal(
          <div className="md:hidden fixed inset-0 z-[9999] flex" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn z-[9999]"
              aria-hidden="true"
            />

            {/* Slide-in Drawer from Left */}
            <div className="relative w-[300px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-[10000] animate-slideRight overflow-y-auto border-r border-[#E8E2D5]">
              {/* Drawer Header */}
              <div className="p-4 bg-[#FAF9F5] border-b border-[#E8E2D5] flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-10 h-10 relative flex-shrink-0">
                    <Image
                      src="/assets/logo-1.png"
                      alt="সাতক্ষীরা ঘর"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-[#016831] leading-tight">
                      সাতক্ষীরা <span className="text-[#FAB116]">ঘর</span>
                    </div>
                    <div className="text-[8px] font-bold text-[#E08E00] uppercase tracking-wider">
                      Pure & Organic
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 active:scale-95 transition-all"
                  aria-label="মেনু বন্ধ করুন"
                >
                  <X className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="p-4 space-y-5 flex-1">
                {/* User Session Box */}
                {user ? (
                  <div className="p-3 bg-[#FEF9E7] rounded-2xl border border-[#FDE68A] space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#016831] text-[#FAB116] flex items-center justify-center font-bold text-sm shadow-xs">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#016831] truncate">{user.name}</div>
                        <div className="text-[10px] text-[#4A5B52] truncate">{user.phone}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#FDE68A]/70 flex flex-col gap-1.5">
                      {['admin', 'manager', 'staff'].includes(user.role) && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#016831] text-white shadow-xs"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#FAB116]" />
                          <span>এডমিন ড্যাশবোর্ড</span>
                        </Link>
                      )}
                      <Link
                        href="/my-orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#016831] hover:bg-amber-100/60 transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#E08E00]" />
                        <span>আমার অর্ডারসমূহ</span>
                      </Link>
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          await logout();
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>লগআউট</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 bg-[#016831] hover:bg-[#014D24] text-white py-3 rounded-2xl font-bold text-xs shadow-sm transition-all active:scale-95"
                  >
                    <User className="w-4 h-4 text-[#FAB116]" />
                    <span>লগইন / নতুন অ্যাকাউন্ট</span>
                  </Link>
                )}

                {/* Primary Nav Links */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-[#829289] uppercase tracking-wider px-2 mb-1.5">
                    মূল নেভিগেশন
                  </p>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        pathname === link.href
                          ? 'bg-[#016831] text-white shadow-xs'
                          : 'text-[#122118] hover:bg-[#FAF9F5] hover:text-[#016831]'
                      }`}
                    >
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Categories Grid */}
                <div className="space-y-2 pt-3 border-t border-[#E8E2D5]">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-bold text-[#829289] uppercase tracking-wider">
                      পণ্য ক্যাটাগরি
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[10px] font-bold text-[#016831] hover:underline"
                    >
                      সব দেখুন →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {displayCategories.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/shop?cat=${cat.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-1.5 p-2 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] text-[11px] font-bold text-[#122118] hover:border-[#016831] hover:text-[#016831] transition-all"
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name.split(' (')[0]}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Quick Call Helpline */}
                <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
                  <a
                    href={`tel:${hero.helpline || '+8801712345678'}`}
                    className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#EBF7F0] text-[#016831] border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-[#016831]" />
                    <span>হেল্পলাইন: {hero.helpline || '০১৭১২-৩৪৫৬৭৮'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </nav>
    </header>
  );
}
