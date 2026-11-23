import { create } from 'zustand';

const defaultContent = {
  hero: {
    badgeText: 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার',
    title: 'প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে',
    description:
      'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।',
    image: '',
    slides: [],
    sideBanner: {
      url: '',
      link: '/shop?cat=combos',
      label: 'স্পেশাল অফার',
      showOnMobile: true,
    },
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
  categories: [],
  brand: {
    name: 'সাতক্ষীরা ঘর',
    tagline: 'Satkhira Ghor • Pure & Organic',
    logoChar: 'স',
    logo: '/uploads/upload_1795353755877_oioatm.png',
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
  settings: {
    // Payment Numbers
    bkashNumber: '০১৯০৮-৯৪৫১৪৫',
    bkashType: 'Send Money (Personal)',
    nagadNumber: '০১৯০৮-৯৪৫১৪৫',
    nagadType: 'Send Money (Personal)',
    rocketNumber: '',

    // Contact & Helpline
    helpline: '০১৯০৮-৯৪৫১৪৫',
    whatsapp: '01908945145',
    email: 'satkhiraghor@gmail.com',
    supportTime: 'সকাল ৯:০০ - রাত ১০:০০',

    // Delivery & Free Shipping Offer
    freeDeliveryThreshold: 1500,
    insideSatkhiraCharge: 70,
    outsideSatkhiraCharge: 120,

    // Store Info & Social
    storeAddress: 'শ্যামনগর রোড, সাতক্ষীরা সদর, খুলনা বিভাগ, বাংলাদেশ',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',

    // Announcement
    topNotice:
      'সুন্দরবনের খাঁটি মধু ও সাতক্ষীরার খাঁটি গাওয়া ঘিয়ে সারাদেশে ফ্রি ক্যাশ অন ডেলিভারি (১৫০০ টাকার অর্ডারে)',
  },
};

// Preload cached content and theme from storage if in browser
let initialContent = { ...defaultContent };
if (typeof window !== 'undefined') {
  try {
    const cached = sessionStorage.getItem('satkhira_site_content');
    if (cached) {
      initialContent = { ...defaultContent, ...JSON.parse(cached) };
    }
    const cachedTheme = localStorage.getItem('satkhira_theme');
    if (cachedTheme) {
      initialContent.theme = { ...defaultContent.theme, ...JSON.parse(cachedTheme) };
    }
  } catch (e) { }
}

export const useSiteContentStore = create((set, get) => ({
  content: initialContent,
  loaded: false,
  loading: false,

  fetchContent: async (force = false) => {
    if (get().loaded && !force) return;
    if (get().loading) return;
    try {
      set({ loading: true });
      const res = await fetch('/api/site-content');
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          // Normalize categories if received as object
          if (data.content.categories && !Array.isArray(data.content.categories) && typeof data.content.categories === 'object') {
            data.content.categories = Object.values(data.content.categories);
          }
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('satkhira_site_content', JSON.stringify(data.content));
              if (data.content.theme) {
                localStorage.setItem('satkhira_theme', JSON.stringify(data.content.theme));
              }
            } catch (e) { }
          }
          set({ content: data.content, loaded: true, loading: false });
        }
      }
    } catch (e) {
      console.warn('Could not load site content from server, using default:', e);
      set({ loaded: true, loading: false });
    }
  },

  updateSection: async (sectionKey, sectionData) => {
    try {
      // Optimistic update
      const current = get().content;
      const updatedValue = Array.isArray(sectionData)
        ? sectionData
        : (typeof sectionData === 'object' && sectionData !== null && !Array.isArray(current[sectionKey]))
          ? { ...current[sectionKey], ...sectionData }
          : sectionData;

      set({
        content: {
          ...current,
          [sectionKey]: updatedValue,
        },
      });

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('satkhira_site_content', JSON.stringify(get().content));
          if (sectionKey === 'theme') {
            localStorage.setItem('satkhira_theme', JSON.stringify(sectionData));
          }
        } catch (e) { }
      }

      const res = await fetch('/api/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: sectionKey, data: sectionData }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'আপডেট ব্যর্থ হয়েছে');
      }

      return { success: true, message: result.message };
    } catch (error) {
      // Re-fetch to sync
      get().fetchContent();
      throw error;
    }
  },
}));
