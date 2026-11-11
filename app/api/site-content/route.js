import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/lib/mongodb';
import SiteContent from '@/models/SiteContent';
import { requireAdmin } from '@/lib/auth';
import { saveThemeToFile } from '@/lib/themeServer';

export const dynamic = 'force-dynamic';

// Default initial content fallback
export const defaultSiteContent = {
  hero: {
    badgeText: 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার',
    title: 'প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে',
    description:
      'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।',
    image:
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    slides: [
      {
        url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=90&w=1920',
        label: 'সুন্দরবনের খাঁটি মধু',
      },
      {
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=90&w=1920',
        label: 'জেলেদের তাজা মাছ আহরণ',
      },
      {
        url: 'https://images.unsplash.com/photo-1565031491910-e57fac031c41?auto=format&fit=crop&q=90&w=1920',
        label: 'উপকূলের তাজা চিংড়ি',
      },
      {
        url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=90&w=1920',
        label: 'সাতক্ষীরার বিখ্যাত হিমসাগর আম',
      },
      {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=90&w=1920',
        label: 'খাঁটি দেশি খাদ্য সম্ভার',
      },
    ],
    primaryBtnText: 'পণ্য কিনুন',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'আমাদের গল্প শুনুন',
    secondaryBtnLink: '/about-us',
    stat1Number: '১০০%',
    stat1Label: 'প্রাকৃতিক ও খাঁটি',
    stat2Number: '১২,৫০০+',
    stat2Label: 'সন্তুষ্ট পরিবার',
    stat3Number: '২৪-৪৮ ঘণ্টা',
    stat3Label: 'সারাদেশে ডেলিভারি',
    floatingBadge1Title: 'ল্যাব টেস্টে পরীক্ষিত',
    floatingBadge1Sub: 'শূন্য ভেজাল গ্যারান্টি',
    floatingBadge2Title: 'খাঁটি গাওয়া ঘি',
    floatingBadge2Sub: 'দেশি গরুর দুধের ননী',
    topNotice:
      'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)',
    helpline: '০১৭১২-৩৪৫৬৭৮',
  },
  specialBanner: {
    badgeText: 'সরাসরি মৌয়ালদের থেকে সংগৃহীত',
    title: 'খাঁটি সুন্দরবনের কাঁচা মধু চেখে দেখেছেন কি?',
    description:
      'কোনো হিটিং বা পাস্তুরাইজেশন ছাড়া মৌচাকের অক্ষুণ্ণ এনজাইম ও প্রাকৃতিক পরাগরেণু সহ আমরা আপনাদের হাতে তুলে দিচ্ছি শতভাগ খাঁটি মধু।',
    buttonText: 'খলসী মধু অর্ডার করুন',
    buttonLink: '/products/sundarbans-pure-khalsi-honey',
  },
  categorySection: {
    subtitle: 'ক্যাটাগরি সমূহ',
    title: 'উপকূলের তাজা ও ঐতিহ্যবাহী স্বাদ',
    description: 'প্রতিটি পণ্য নিজস্ব তদারকিতে প্রস্তুত ও শতভাগ খাঁটি হওয়ার নিশ্চয়তা',
  },
  flashSale: {
    enabled: true,
    badgeText: 'ফ্ল্যাশ সেল',
    title: 'আজকের ধামাকা অফার',
    durationHours: 12,
    endTime: null,
    productSlugs: [
      'sundarbans-pure-khalsi-honey',
      'traditional-bilona-pure-cow-ghee',
      'satkhira-sundarbans-mega-family-combo',
      'cold-pressed-mustard-oil-ghani',
      'satkhira-heritage-kheer-sandesh',
      'premium-organic-chia-seeds',
    ],
    customOffers: {},
  },
  categories: [
    {
      id: 'all',
      name: 'সব পণ্য',
      nameEn: 'All Products',
      slug: 'all',
      icon: '🌾',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      description: 'সাতক্ষীরা ও সুন্দরবনের সকল খাঁটি প্রাকৃতিক খাদ্য সম্ভার'
    },
    {
      id: 'honey',
      name: 'সুন্দরবনের মধু',
      nameEn: 'Sundarbans Honey',
      slug: 'honey',
      icon: '🍯',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
      description: 'মৌয়ালদের দ্বারা গভীর সুন্দরবন থেকে সংগৃহীত অপরিশোধিত কাঁচা মধু'
    },
    {
      id: 'ghee',
      name: 'খাঁটি গাওয়া ঘি',
      nameEn: 'Pure Bilona Ghee',
      slug: 'ghee',
      icon: '🧈',
      image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=400',
      description: 'দেশি গাভীর দুধের দই মন্থন করে প্রাচীন বিলোনা পদ্ধতিতে প্রস্তুত দানাদার ঘি'
    },
    {
      id: 'oil',
      name: 'সরিষার তেল',
      nameEn: 'Mustard Oil',
      slug: 'oil',
      icon: '🌿',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
      description: 'দেশি মাঘী সরিষা থেকে কাঠের ঘানিতে ধীর চাপে ভাঙা ঝাঁজালো তেল'
    },
    {
      id: 'sweets',
      name: 'সাতক্ষীরার সন্দেশ',
      nameEn: 'Heritage Sweets',
      slug: 'sweets',
      icon: '🥛',
      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=400',
      description: 'খাঁটি ছানা ও ক্ষীর দিয়ে শতবর্ষের ঐতিহ্যবাহী রেসিপিতে তৈরি ক্ষীর সন্দেশ'
    },
    {
      id: 'seeds',
      name: 'সুপারফুড ও বীজ',
      nameEn: 'Seeds & Superfoods',
      slug: 'seeds',
      icon: '🌱',
      image: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=400',
      description: 'চিয়া সিড, কুমড়ার বীজ, সূর্যমুখী বীজ ও খাঁটি অর্গানিক মরিঙ্গা পাউডার'
    },
    {
      id: 'combos',
      name: 'স্পেশাল কম্বো অফার',
      nameEn: 'Mega Combo Deals',
      slug: 'combos',
      icon: '🎁',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
      description: 'একক প্যাকেজে প্রয়োজনীয় খাঁটি খাবার সাশ্রয়ী মূল্যে পান'
    },
    {
      id: 'pickles',
      name: 'ঘরোয়া আচার ও মশলা',
      nameEn: 'Pickles & Spices',
      slug: 'pickles',
      icon: '🌶️',
      image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=400',
      description: 'ঘানি ভাঙা তেলে তৈরি ঘরোয়া সুস্বাদু আচার ও বাছাইকৃত দেশি মশলা'
    },
  ],
  brand: {
    name: 'সাতক্ষীরা ঘর',
    tagline: 'Satkhira Ghor • Pure & Organic',
    logoChar: 'স',
  },
  theme: {
    primary: '#016831',
    secondary: '#FAB116',
    buttonBg: '#016831',
    buttonText: '#FFFFFF',
    textColor: '#14241E',
    textHover: '#02833E',
    buttonHoverBg: '#014D24',
  },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    await connectToDatabase();

    if (key) {
      const item = await SiteContent.findOne({ key });
      return NextResponse.json({
        data: item ? item.data : defaultSiteContent[key] || {},
      });
    }

    const allItems = await SiteContent.find();
    const result = { ...defaultSiteContent };

    allItems.forEach((doc) => {
      result[doc.key] = { ...result[doc.key], ...doc.data };
    });

    return NextResponse.json({ content: result });
  } catch (error) {
    console.warn('Site content fetch fallback:', error.message);
    return NextResponse.json({ content: defaultSiteContent });
  }
}

export async function PUT(request) {
  try {
    const adminCheck = await requireAdmin(request);
    if (adminCheck.error) {
      return NextResponse.json(
        { message: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { key, data } = await request.json();

    if (!key || !data) {
      return NextResponse.json(
        { message: 'সেকশন কী (key) এবং ডাটা প্রদান করুন' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await SiteContent.findOneAndUpdate(
      { key },
      { key, data, updatedBy: adminCheck.user.phone || 'admin' },
      { upsert: true, new: true }
    );

    if (key === 'theme') {
      saveThemeToFile(data);
      try {
        revalidatePath('/', 'layout');
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'সেকশনের লেখা ও ছবি সফলভাবে আপডেট করা হয়েছে',
      content: updated,
    });
  } catch (error) {
    console.error('Site content update error:', error);
    return NextResponse.json(
      { message: 'আপডেট করা সম্ভব হয়নি: ' + error.message },
      { status: 500 }
    );
  }
}
