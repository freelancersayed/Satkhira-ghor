'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Sparkles, PhoneCall, User, ShieldCheck, LogOut, Package, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useSiteContentStore } from '@/store/siteContentStore';
import AdminSectionEditModal from '@/components/common/AdminSectionEditModal';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openCart = useCartStore((state) => state.openCart);
  const items = useCartStore((state) => state.items);

  const { user, logout, checkAuth } = useAuthStore();
  const { content } = useSiteContentStore();
  const hero = content?.hero || {};

  // Avoid hydration mismatch for persisted store & check auth on mount
  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const totalItems = mounted
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const navLinks = [
    { name: 'হোম (Home)', href: '/' },
    { name: 'সব পণ্য (Shop)', href: '/shop' },
    { name: 'অর্ডার ট্র্যাক (Track)', href: '/track-order' },
    { name: 'আমাদের সম্পর্কে (About Us)', href: '/about-us' },
  ];

  const headerEditFields = [
    { name: 'topNotice', label: 'টপ নোটিশ বার বার্তা', placeholder: 'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ডেলিভারি...' },
    { name: 'helpline', label: 'হেল্পলাইন মোবাইল নম্বর', placeholder: '০১৭১২-৩৪৫৬৭৮' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Top Notification Bar */}
      <div className="bg-[#0A2B20] text-[#FEF3C7] text-xs py-2 px-4 border-b border-[#0F3D2E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
            <span>
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
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/track-order"
              className="hover:text-[#F59E0B] transition-colors flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>অর্ডার ট্র্যাক</span>
            </Link>
            <a
              href={`tel:${hero.helpline || '+8801712345678'}`}
              className="flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>হেল্পলাইন: {hero.helpline || '০১৭১২-৩৪৫৬৭৮'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-[#0F3D2E] flex items-center justify-center text-[#F59E0B] shadow-md group-hover:scale-105 transition-transform duration-200 overflow-hidden relative">
                  <span className="font-serif text-2xl font-bold select-none">স</span>
                  <Image
                    src="/assets/logo.png"
                    alt="সাতক্ষীরা ঘর লোগো"
                    fill
                    className="object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F3D2E] flex items-center gap-1.5">
                    সাতক্ষীরা ঘর
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  </span>
                  <span className="text-[9px] font-semibold tracking-widest uppercase text-[#B45309]">
                    Satkhira Ghor • Pure & Organic
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors duration-150 relative py-1 ${
                      isActive
                        ? 'text-[#0F3D2E] font-bold'
                        : 'text-[#4B5563] hover:text-[#0F3D2E]'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D97706] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Action Buttons: Search, Account, Cart, Mobile Menu */}
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="hidden sm:flex items-center gap-2 text-xs text-[#4B5563] bg-[#F7F5F0] hover:bg-[#EFE9DC] px-3.5 py-2 rounded-xl border border-[#E8E2D5] transition-colors"
              >
                <Search className="w-4 h-4 text-[#0F3D2E]" />
                <span>পণ্য খুঁজুন...</span>
              </Link>

              {/* User Account Dropdown */}
              <div className="relative">
                {mounted && user ? (
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FEF3C7] text-[#0F3D2E] hover:bg-[#FDE68A] transition-colors border border-[#FCD34D]/60 text-xs font-bold"
                  >
                    <User className="w-4 h-4 text-[#0F3D2E]" />
                    <span className="hidden sm:inline max-w-[90px] truncate">
                      {user.name?.split(' ')[0]}
                    </span>
                    {['admin', 'manager', 'staff'].includes(user.role) && (
                      <span className="bg-[#0F3D2E] text-[#FEF3C7] text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase">
                        {user.role}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F7F5F0] text-[#0F3D2E] hover:bg-[#EFE9DC] transition-colors border border-[#E8E2D5] text-xs font-bold"
                  >
                    <User className="w-4 h-4 text-[#0F3D2E]" />
                    <span className="hidden sm:inline">লগইন</span>
                  </Link>
                )}

                {/* Dropdown Menu */}
                {userDropdownOpen && user && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E8E2D5] py-2 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#E8E2D5]">
                      <p className="text-xs font-bold text-[#0F3D2E] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#6B7280] truncate">{user.phone} ({user.role})</p>
                    </div>

                    {['admin', 'manager', 'staff'].includes(user.role) && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>
                          {user.role === 'admin'
                            ? 'এডমিন ড্যাশবোর্ড'
                            : user.role === 'manager'
                            ? 'ম্যানেজার ড্যাশবোর্ড'
                            : 'স্টাফ প্যানেল'}
                        </span>
                      </Link>
                    )}

                    <Link
                      href="/my-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0F3D2E] hover:bg-[#FDFBF7] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#D97706]" />
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

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                id="cart-drawer-toggle-btn"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-xl bg-[#0F3D2E] text-white hover:bg-[#0A2B20] transition-colors shadow-sm flex items-center justify-center group"
              >
                <ShoppingBag className="w-5 h-5 text-[#FEF3C7] group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F59E0B] text-[#111827] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[#0F3D2E] hover:bg-[#F7F5F0] transition-colors"
                aria-label="Open mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E8E2D5] bg-[#FDFBF7] px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-base font-semibold text-[#0F3D2E] hover:bg-[#F0FDF4] transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {mounted && user ? (
              <div className="pt-2 border-t border-[#E8E2D5] space-y-2">
                {['admin', 'manager', 'staff'].includes(user.role) && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-[#FEF3C7] text-[#0F3D2E]"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>
                      {user.role === 'admin'
                        ? 'এডমিন ড্যাশবোর্ড'
                        : user.role === 'manager'
                        ? 'ম্যানেজার ড্যাশবোর্ড'
                        : 'স্টাফ প্যানেল'}
                    </span>
                  </Link>
                )}
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F3D2E] hover:bg-[#FDFBF7]"
                >
                  <Package className="w-4 h-4 text-[#D97706]" />
                  <span>আমার অর্ডারসমূহ</span>
                </Link>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট ({user.name})</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#E8E2D5]">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#111827] py-3 rounded-xl font-bold shadow-md transition-all active:scale-95"
                >
                  <User className="w-4 h-4" />
                  <span>লগইন / নতুন অ্যাকাউন্ট</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
