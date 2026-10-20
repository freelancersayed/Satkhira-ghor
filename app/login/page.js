'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Phone,
  User as UserIcon,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  });

  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? formData
      : { identifier: formData.phone, password: formData.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'একটি সমস্যা হয়েছে');
      }

      setUser(data.user);
      setSuccess(data.message);

      // Auto redirect based on role
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin');
        } else if (redirect && redirect !== '/') {
          router.push(redirect);
        } else {
          router.push('/my-orders');
        }
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminFill = () => {
    setFormData((prev) => ({
      ...prev,
      phone: '01700000000',
      password: 'admin123',
    }));
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 bg-[#FAF8F4] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#1B4D3E] flex items-center justify-center text-[#E5A93C] shadow-md group-hover:scale-105 transition-transform">
              <span className="font-serif text-2xl font-bold">স</span>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B4D3E]">
            {isRegister ? 'নতুন অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5B53]">
            সাতক্ষীরা ঘর • খাঁটি ও প্রাকৃতিক পণ্যের বিশ্বস্ত ঠিকানা
          </p>
        </div>

        {/* Demo Admin Card for quick testing */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">টেস্টিং ডেমো অ্যাডমিন তথ্য:</p>
              <p className="text-[11px] text-amber-800">
                মোবাইল: <code className="font-mono font-bold">01700000000</code> | পাসওয়ার্ড: <code className="font-mono font-bold">admin123</code>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoAdminFill}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
          >
            অটো পূরণ করুন
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9DC] shadow-xl space-y-6">
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#F7F4ED] p-1 border border-[#EFE9DC]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                !isRegister
                  ? 'bg-white text-[#1B4D3E] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E]'
              }`}
            >
              লগইন
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                isRegister
                  ? 'bg-white text-[#1B4D3E] shadow-sm'
                  : 'text-[#4A5B53] hover:text-[#1B4D3E]'
              }`}
            >
              নতুন রেজিস্ট্রেশন
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-[#1B4D3E] mb-1.5">
                  আপনার পূর্ণ নাম <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8C9C93] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="যেমন: মোঃ সাকিব হোসেন"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DC] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none text-xs text-[#102E25]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1B4D3E] mb-1.5">
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C9C93] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="017XXXXXXXX"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DC] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none text-xs text-[#102E25]"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-[#1B4D3E] mb-1.5">
                  ইমেইল (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8C9C93] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DC] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none text-xs text-[#102E25]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#1B4D3E] mb-1.5">
                পাসওয়ার্ড <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C9C93] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DC] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none text-xs text-[#102E25]"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-[#1B4D3E] mb-1.5">
                  ডেলিভারি ঠিকানা (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="বাড়ি, রোড নং, এলাকা, জেলা"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EFE9DC] focus:border-[#1B4D3E] focus:ring-1 focus:ring-[#1B4D3E] outline-none text-xs text-[#102E25]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1B4D3E] hover:bg-[#153D31] text-[#FAF0D4] rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Checkout reminder */}
          <div className="border-t border-[#EFE9DC] pt-4 text-center">
            <p className="text-xs text-[#4A5B53]">
              পণ্য কেনার জন্য লগইন বাধ্যতামূলক নয়!{' '}
              <Link
                href="/shop"
                className="text-[#C86D3B] font-bold hover:underline"
              >
                সরাসরি অর্ডার করতে এখানে ক্লিক করুন →
              </Link>
            </p>
          </div>
        </div>

        {/* Live Track order quick link */}
        <div className="text-center">
          <Link
            href="/track-order"
            className="text-xs font-bold text-[#1B4D3E] hover:underline inline-flex items-center gap-1"
          >
            <span>পূর্ববর্তী অর্ডার ট্র্যাক করতে চান? এখানে যান</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
          <div className="w-10 h-10 border-4 border-[#1B4D3E] border-t-[#E5A93C] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
