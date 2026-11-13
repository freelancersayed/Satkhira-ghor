// ─────────────────────────────────────────────────────────────
// Halum Mama Centralized Route & Persona Configuration
// Single source of truth for mascot positioning, dialogues & states
// ─────────────────────────────────────────────────────────────

export const halumRouteConfig = {
  defaultSide: 'left', // Halum docks on the LEFT side across all routes by default
  routes: {
    '/': {
      side: 'left',
      line1: 'সাতক্ষীরা ঘরে',
      line2: 'আপনাকে স্বাগতম! 🐯✨',
      defaultState: 'idle',
    },
    '/about': {
      side: 'left',
      line1: 'শ্যামনগর ও সুন্দরবনের',
      line2: 'মৌয়ালদের আসল গল্পটা জেনে নাও! 🌿🍯',
      defaultState: 'proud',
    },
    '/about-us': {
      side: 'left',
      line1: 'শ্যামনগর ও সুন্দরবনের',
      line2: 'মৌয়ালদের আসল গল্পটা জেনে নাও! 🌿🍯',
      defaultState: 'proud',
    },
    '/shop': {
      side: 'left',
      line1: 'খাঁটি খাবারের ভাণ্ডার!',
      line2: 'পছন্দের খাবারে ক্লিক করে দেখো! 🌿',
      defaultState: 'idle',
    },
    '/cart': {
      side: 'left',
      line1: 'ঠিকানা দিয়ে থাবা বসাও!',
      line2: 'বাঘের গতিতে পার্সেল যাবে! 🚚💨',
      defaultState: 'pointing',
    },
    '/track': {
      side: 'left',
      line1: 'পার্সেল কোথায় আছে জানতে',
      line2: '১১ ডিজিটের ফোন নম্বর দাও! 📦',
      defaultState: 'searching',
    },
    '/track-order': {
      side: 'left',
      line1: 'পার্সেল কোথায় আছে জানতে',
      line2: '১১ ডিজিটের ফোন নম্বর দাও! 📦',
      defaultState: 'searching',
    },
  },
};

/**
 * Returns the centralized Halum configuration for any route
 */
export function getHalumConfigForRoute(pathname = '/') {
  if (!pathname) return { side: halumRouteConfig.defaultSide, defaultState: 'idle' };

  if (pathname.startsWith('/products/')) {
    return {
      side: 'left',
      line1: 'এত কী চিন্তা করছো?',
      line2: 'আগে পণ্যটা কার্টে রেখে দাও! 🛒🐾',
      defaultState: 'pointing',
    };
  }

  const clean = pathname.split('?')[0].replace(/\/+$/, '') || '/';
  const match = halumRouteConfig.routes[clean];
  if (match) return match;

  return {
    side: halumRouteConfig.defaultSide,
    line1: 'খাঁটি খাবার দেখতে',
    line2: 'নিচে একটু স্ক্রল করো! 👇',
    defaultState: 'idle',
  };
}
