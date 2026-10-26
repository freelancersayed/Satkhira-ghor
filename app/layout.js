import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CartDrawer from '@/components/common/CartDrawer';

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
    <html lang="bn" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#14241E] antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
      </body>
    </html>
  );
}
