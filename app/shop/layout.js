const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://satkhir-ghor.vercel.app').replace(/\/$/, '');

export const metadata = {
  title: 'সব পণ্য | প্রাকৃতিক খাদ্য সম্ভার | সাতক্ষীরা ঘর',
  description:
    'সুন্দরবনের খাঁটি মধু, প্রাচীন বিলোনা গাওয়া ঘি, কাঠের ঘানি ভাঙা সরিষার তেল ও ঐতিহ্যবাহী মিষ্টি। শতভাগ কেমিক্যালমুক্ত ও প্রাকৃতিক খাদ্য সামগ্রী সারাদেশে ক্যাশ অন ডেলিভারিতে।',
  keywords: [
    'সব পণ্য',
    'সুন্দরবনের মধু',
    'খাঁটি গাওয়া ঘি',
    'সাতক্ষীরার সন্দেশ',
    'ঘানি ভাঙা সরিষার তেল',
    'সাতক্ষীরা ঘর শপ',
    'organic products bangladesh',
  ],
  alternates: {
    canonical: `${baseUrl}/shop`,
  },
  openGraph: {
    title: 'সব পণ্য | সাতক্ষীরা ঘর - খাঁটি খাদ্য সম্ভার',
    description:
      'সুন্দরবনের খাঁটি মধু, প্রাচীন বিলোনা ঘি, খাঁটি সরিষার তেল ও ঐতিহ্যবাহী মিষ্টি ক্যাশ অন ডেলিভারিতে।',
    url: `${baseUrl}/shop`,
    siteName: 'Satkhira Ghor',
    locale: 'bn_BD',
    type: 'website',
    images: [
      {
        url: '/assets/logo-1.png',
        width: 800,
        height: 800,
        alt: 'সাতক্ষীরা ঘর পণ্য সম্ভার',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'সব পণ্য | সাতক্ষীরা ঘর',
    description:
      'সুন্দরবনের খাঁটি মধু, বিলোনা গাওয়া ঘি ও প্রাকৃতিক খাদ্য সম্ভার সারাদেশে ক্যাশ অন ডেলিভারিতে।',
    images: ['/assets/logo-1.png'],
  },
};

export default function ShopLayout({ children }) {
  return <>{children}</>;
}
