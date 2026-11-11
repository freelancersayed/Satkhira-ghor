import './globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

import { Hind_Siliguri } from 'next/font/google';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CartDrawer from '@/components/common/CartDrawer';
import MobileBottomNav from '@/components/common/MobileBottomNav';
import AddToCartToast from '@/components/common/AddToCartToast';

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali'],
  display: 'swap',
  variable: '--font-hind-siliguri',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#016831',
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://satkhir-ghor.vercel.app'),
  title: 'সাতক্ষীরা ঘর | Satkhira Ghor - খাঁটি ও প্রাকৃতিক পণ্যের ঠিকানা',
  description:
    'সুন্দরবনের খাঁটি মধু, প্রাচীন বিলোনা পদ্ধতির খাঁটি গাওয়া ঘি, ঘানি ভাঙা সরিষার তেল এবং সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ। ১০০% নিরাপদ ও কেমিক্যালমুক্ত প্রাকৃতিক খাদ্য সম্ভার।',
  keywords: [
    'সুন্দরবনের মধু',
    'খাঁটি গাওয়া ঘি',
    'সাতক্ষীরার সন্দেশ',
    'ঘানি ভাঙা সরিষার তেল',
    'Satkhira Ghor',
    'Sundarbans Honey',
    'Organic Bangladesh',
    'সাতক্ষীরা ঘর',
  ],
  authors: [{ name: 'Satkhira Ghor' }],
  openGraph: {
    title: 'সাতক্ষীরা ঘর | Satkhira Ghor - Authentic Organic Agro',
    description:
      'সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি ও প্রাকৃতিক খাদ্য সম্ভার সারাদেশে ক্যাশ অন ডেলিভারিতে।',
    siteName: 'Satkhira Ghor',
    locale: 'bn_BD',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={`scroll-smooth ${hindSiliguri.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#14241E] antialiased font-sans pb-20 md:pb-0 overflow-x-hidden w-full">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <AddToCartToast />
        <MobileBottomNav />
      </body>
    </html>
  );
}
