import { create } from 'zustand';

const defaultContent = {
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
  brand: {
    name: 'সাতক্ষীরা ঘর',
    tagline: 'Satkhira Ghor • Pure & Organic',
    logoChar: 'স',
  },
};

export const useSiteContentStore = create((set, get) => ({
  content: defaultContent,
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
      set({
        content: {
          ...current,
          [sectionKey]: {
            ...current[sectionKey],
            ...sectionData,
          },
        },
      });

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
