import { create } from 'zustand';

const defaultContent = {
  hero: {
    badgeText: 'সুন্দরবন ও সাতক্ষীরার খাঁটি খাদ্য সম্ভার',
    title: 'প্রকৃতির সেরা উপহার, \nসরাসরি আপনার খাবার টেবিলে',
    description:
      'সাতক্ষীরার গভীর সুন্দরবনের খাঁটি খলসী ফুলের মধু, প্রাচীন বিলোনা পদ্ধতির দেশি গাওয়া ঘি এবং খাঁটি ঘানি ভাঙা সরিষার তেল। ১০০% বিশুদ্ধ ও কেমিক্যালমুক্ত।',
    image:
      'https://i.ibb.co.com/Tx5L564j/YVPTD.jpg',
    // High‑definition slideshow images (0.5 s interval)
    slides: [
      'https://i.ibb.co.com/Tx5L564j/YVPTD.jpg', // মৌবী লবণযুক্ত মধু
      'https://i.ibb.co.com/abc1234/fish.jpg',   // জেলেরা মাছ ধরছে
      'https://i.ibb.co.com/def5678/shrimp.jpg', // চিংড়ি
      'https://i.ibb.co.com/ghi9012/mango.jpg', // হিমশাগর আম
      'https://i.ibb.co.com/jkl3456/kakar.jpg', // কাকড়ার ছবি
    ],
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

  fetchContent: async () => {
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
