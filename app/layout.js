import './globals.css';
import { Hind_Siliguri } from 'next/font/google';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import CartDrawer from '@/components/common/CartDrawer';
import MobileBottomNav from '@/components/common/MobileBottomNav';
import AddToCartToast from '@/components/common/AddToCartToast';
import DynamicThemeInjector from '@/components/common/DynamicThemeInjector';
import CustomerAIAssistantWidget from '@/components/ai/CustomerAIAssistantWidget';
import { getSavedTheme, generateThemeCSS } from '@/lib/themeServer';

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

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://satkhir-ghor.vercel.app').replace(/\/$/, '');

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'সাতক্ষীরা ঘর | Satkhira Ghor - খাঁটি ও প্রাকৃতিক পণ্যের ঠিকানা',
    template: '%s | সাতক্ষীরা ঘর',
  },
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
    'খাঁটি প্রাকৃতিক খাদ্য',
    'সুন্দরবনের খলসী মধু',
    'ঘি এর দাম বাংলাদেশ',
  ],
  authors: [{ name: 'Satkhira Ghor', url: baseUrl }],
  creator: 'Satkhira Ghor',
  publisher: 'Satkhira Ghor',
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: '0gnjB0QzI8of3TgV_Xt7q-XoRf8EbQNYmMBD5c3HO_o',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/logo-1.png',
    shortcut: '/assets/logo-1.png',
    apple: '/assets/logo-1.png',
  },
  openGraph: {
    title: 'সাতক্ষীরা ঘর | Satkhira Ghor - Authentic Organic Agro',
    description:
      'সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি ও প্রাকৃতিক খাদ্য সম্ভার সারাদেশে ক্যাশ অন ডেলিভারিতে।',
    url: baseUrl,
    siteName: 'Satkhira Ghor',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/assets/logo-1.png',
        width: 800,
        height: 800,
        alt: 'সাতক্ষীরা ঘর লোগো',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সাতক্ষীরা ঘর | Satkhira Ghor - খাঁটি ও প্রাকৃতিক পণ্যের ঠিকানা',
    description:
      'সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি ও প্রাকৃতিক খাদ্য সম্ভার সারাদেশে ক্যাশ অন ডেলিভারিতে।',
    images: ['/assets/logo-1.png'],
  },
};

export default async function RootLayout({ children }) {
  const savedTheme = await getSavedTheme();
  const themeCSS = generateThemeCSS(savedTheme);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'সাতক্ষীরা ঘর',
        alternateName: 'Satkhira Ghor',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/assets/logo-1.png`,
          width: 800,
          height: 800,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+8801700000000',
          contactType: 'customer service',
          areaServed: 'BD',
          availableLanguage: ['bn', 'en'],
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Satkhira',
          addressRegion: 'Khulna',
          addressCountry: 'BD',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'সাতক্ষীরা ঘর',
        description:
          'সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি ও প্রাকৃতিক খাদ্য সম্ভার সারাদেশে ক্যাশ অন ডেলিভারিতে।',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <html lang="bn" className={`scroll-smooth ${hindSiliguri.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="0gnjB0QzI8of3TgV_Xt7q-XoRf8EbQNYmMBD5c3HO_o"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <style
          id="satkhira-ghor-dynamic-theme-ssr"
          dangerouslySetInnerHTML={{ __html: themeCSS }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#14241E] antialiased font-sans pb-20 md:pb-0 overflow-x-hidden w-full">
        <DynamicThemeInjector initialTheme={savedTheme} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <AddToCartToast />
        <MobileBottomNav />
        <CustomerAIAssistantWidget />
      </body>
    </html>
  );
}
