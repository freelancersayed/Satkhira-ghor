// ─────────────────────────────────────────────────────────────
// Halum Mama Instant Local Intent & Keyword Matcher (0ms Response)
// Reduces Server Latency & Provides Contextual Intelligence
// ─────────────────────────────────────────────────────────────

import { products } from '../../data/products.js';
import { deliveryConfig } from '../../lib/deliveryConfig.js';

// Format product for in-chat card
function formatCard(slugOrId) {
  const p = products.find((item) => item.slug === slugOrId || item.id === slugOrId);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice || null,
    image: p.image,
    unit: p.unit,
    badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
  };
}

export function matchLocalHalumIntent(message = '', context = {}) {
  const text = (message || '').toLowerCase().trim();
  if (!text) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. Order Tracking by Phone (11 digits e.g. 017XXXXXXXX) or Order ID (ORD-XXXX)
  // ─────────────────────────────────────────────────────────────
  const phoneMatch = text.match(/\b(01[3-9]\d{8})\b/);
  const orderIdMatch = text.match(/\b(ORD-[A-Z0-9]+)\b/i) || text.match(/#?([0-9]{5,8})\b/);

  if (phoneMatch || orderIdMatch) {
    const trackQuery = phoneMatch ? phoneMatch[1] : orderIdMatch[1];
    return {
      type: 'track_order',
      query: trackQuery,
      reply: `হালুম! আমি অর্ডার ডেটাবেজে খুঁজছি... 🔍`,
      characterState: 'thinking',
      quickReplies: ['🛒 নতুন পণ্য দেখব', '📞 কাস্টমার কেয়ার', '🍯 সেরা মধু'],
    };
  }

  if (
    text.includes('অর্ডার ট্র্যাক') ||
    text.includes('ট্র্যাক করব') ||
    text.includes('ট্র্যাকিং') ||
    text.includes('পার্সেল কোথায়') ||
    text.includes('অর্ডার স্ট্যাটাস') ||
    text.includes('track order')
  ) {
    return {
      type: 'prompt_track',
      reply: 'আপনার ১১ ডিজিটের মোবাইল নম্বর অথবা অর্ডার নম্বরটি (যেমন ORD-XXXXX) লিখুন, আমি এখনই পার্সেলের লাইভ স্ট্যাটাস বের করে দিচ্ছি! 📦🐾',
      characterState: 'thinking',
      quickReplies: ['📞 কাস্টমার কেয়ার নম্বর', '🚚 ডেলিভারি চার্জ কত?', '🛒 আমার কার্ট দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Small Talk & Psychological Queries (ক্যাজুয়াল প্রশ্ন)
  // ─────────────────────────────────────────────────────────────
  if (
    text.includes('কেমন আছো') ||
    text.includes('কেমন আছেন') ||
    text.includes('কি খবর') ||
    text.includes('কী খবর') ||
    text.includes('kemon acho') ||
    text.includes('ki khobor')
  ) {
    return {
      reply: 'হালুম! সুন্দরবনের বাতাসে আর খাঁটি মধুর ঘ্রাণে একদম ফুরফুরে আছি! তোমার দিন কেমন যাচ্ছে? 🐯',
      characterState: 'greeting',
      quickReplies: ['🍯 কোন মধু ভালো হবে?', '🧈 খাঁটি গাওয়া ঘি', '🎁 আজকের সেরা অফার'],
    };
  }

  if (
    text.includes('কি করো') ||
    text.includes('কী করছো') ||
    text.includes('কি করছ') ||
    text.includes('ki koro') ||
    text.includes('কী কাজ')
  ) {
    return {
      reply: 'এই তো শ্যামনগরের মৌয়াল ভাইদের সাথে নতুন মধুর জার চেক করছি আর তোমাদের জন্য খাঁটি খাবার পাহারা দিচ্ছি! 🍯',
      characterState: 'proud',
      quickReplies: ['🍯 খাঁটি মধু দেখব', '🎁 মেগা কম্বো অফার', '🚚 ফ্রি ডেলিভারি সীমা'],
    };
  }

  if (
    text.includes('তোমার নাম') ||
    text.includes('তুমি কে') ||
    text.includes('who are you') ||
    text.includes('নাম কি') ||
    text.includes('পরিচয়')
  ) {
    return {
      reply: 'আমি হালুম মামা! সুন্দরবনের বাঘ আর সাতক্ষীরা ঘরের চিফ টেস্ট অফিসার ও শপিং গাইড 🐯',
      characterState: 'proud',
      quickReplies: ['🍯 সুন্দরবনের মধু দেখাও', '🧈 বিলোনা ঘি কেমন?', '🎁 আজকের ডিসকাউন্ট'],
    };
  }

  if (
    text.includes('মন খারাপ') ||
    text.includes('ভালো লাগছে না') ||
    text.includes('বিরক্ত') ||
    text.includes('টেনশন') ||
    text.includes('mood off') ||
    text.includes('ক্লান্ত') ||
    text.includes('অসুস্থ')
  ) {
    return {
      reply: 'আরে মন খারাপ করো না! এক চামচ খাঁটি কালোজিরা মধু বা গরম ভাতে গাওয়া ঘি খেয়ে দেখো, মুড একদম চাঙা হয়ে যাবে! 🍯✨',
      characterState: 'happy',
      quickReplies: ['🍯 কালোজিরা মধু দেখাও', '🧈 খাঁটি গাওয়া ঘি', '🥛 ক্ষীর সন্দেশ খাব'],
    };
  }

  if (
    text.includes('মানুষ') ||
    text.includes('বট') ||
    text.includes('রোবট') ||
    text.includes('ai') ||
    text.includes('robot') ||
    text.includes('রোবট নাকি')
  ) {
    return {
      reply: 'হালুম! আমি পুরোদস্তুর সুন্দরবনের ডিজিটাল বাঘ—মানুষ না হলেও খাঁটি জিনিসের খবর মানুষের চেয়ে কম রাখি না! 🐾',
      characterState: 'proud',
      quickReplies: ['🍯 মধুর খাঁটি মান', '🚚 ডেলিভারি কবে পাব?', '🛒 পণ্য তালিকা দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Trust & Purity Verification (বিশ্বাস ও মান যাচাই)
  // ─────────────────────────────────────────────────────────────
  if (
    text.includes('অরিজিনাল') ||
    text.includes('খাঁটি') ||
    text.includes('ভেজাল') ||
    text.includes('আসল') ||
    text.includes('নকল') ||
    text.includes('গ্যারান্টি') ||
    text.includes('pure') ||
    text.includes('authentic')
  ) {
    return {
      reply: 'বাঘের জবান! কোনো চিনি বা প্রিজারভেটিভ নেই—সরাসরি শ্যামনগর ও সাতক্ষীরার মৌয়াল-খামারিদের থেকে সংগৃহীত এবং ল্যাব টেস্টে পরীক্ষিত। 🌿',
      characterState: 'proud',
      quickReplies: ['🍯 খলসী মধু দেখব', '🧈 বিলোনা ঘি এর দাম', '🚚 ক্যাশ অন ডেলিভারি'],
    };
  }

  if (
    text.includes('মধু কিভাবে') ||
    text.includes('কোথা থেকে') ||
    text.includes('সংগ্রহ') ||
    text.includes('মৌয়াল') ||
    text.includes('উৎস') ||
    text.includes('source')
  ) {
    return {
      reply: 'সুন্দরবনের অভিজ্ঞ মৌয়ালরা গভীর বন থেকে খলসী ও গরান ফুলের মৌচাক ভেঙে কোনো হিটিং ছাড়াই কাঁচা মধু সংগ্রহ করেন। 🍯',
      characterState: 'proud',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('sundarbans-natural-goran-raw-honey'),
      ].filter(Boolean),
      quickReplies: ['🍯 খলসী মধু কার্টে নেব', '🍯 কালোজিরা মধু', '🎁 ফ্যামিলি কম্বো'],
    };
  }

  if (
    text.includes('দাম বেশি') ||
    text.includes('কম হবে') ||
    text.includes('ডিসকাউন্ট') ||
    text.includes('ছাড়') ||
    text.includes('discount') ||
    text.includes('offer') ||
    text.includes('কুপন')
  ) {
    return {
      reply: 'খাঁটি জিনিসের মান ধরে রাখতে একটু খরচ পড়ে, তবে ফ্ল্যাশ সেল ও কম্বো প্যাকে এখনই ১০%–১৫% ছাড় চলছে! দেখাবো? 🎁',
      characterState: 'happy',
      products: [formatCard('satkhira-sundarbans-mega-family-combo')].filter(Boolean),
      quickReplies: ['🎁 মেগা কম্বো প্যাক', '⚡ ফ্ল্যাশ সেল অফার', '🚚 ফ্রি ডেলিভারি কীভাবে পাব?'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Delivery & Free Shipping Threshold
  // ─────────────────────────────────────────────────────────────
  if (
    text.includes('ডেলিভারি চার্জ') ||
    text.includes('ফ্রি ডেলিভারি') ||
    text.includes('শিপিং') ||
    text.includes('ডেলিভারি কত') ||
    text.includes('কবে পাব') ||
    text.includes('ক্যাশ অন ডেলিভারি')
  ) {
    return {
      reply: `সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা আছে! আর মাত্র ৳${deliveryConfig.freeDeliveryThreshold} টাকার পণ্য নিলেই ডেলিভারি চার্জ একদম ফ্রি! 🚚💨`,
      characterState: 'happy',
      quickReplies: ['🎁 মেগা কম্বো নিলে ফ্রি', '🛒 আমার কার্ট দেখাও', '🍯 মধু দেখতে চাই'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Product Exploration & Catalog (পণ্য ও কেনাকাটা)
  // ─────────────────────────────────────────────────────────────
  if (
    text.includes('কি কি প্রডাক্ট') ||
    text.includes('কী কী পণ্য') ||
    text.includes('পণ্য তালিকা') ||
    text.includes('তালিকা') ||
    text.includes('সব পণ্য') ||
    text.includes('মেনু') ||
    text.includes('catalog')
  ) {
    return {
      reply: 'সাতক্ষীরা ঘরের সব সেরা উপহার রেডি আছে! সুন্দরবনের মধু, বিলোনা ঘি, ঘানি ভাঙা তেল, ক্ষীর সন্দেশ ও ঘরোয়া আচার—কোনটি দেখতে চান? 🌾',
      characterState: 'greeting',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('traditional-bilona-pure-cow-ghee'),
        formatCard('satkhira-heritage-kheer-sandesh'),
      ].filter(Boolean),
      quickReplies: ['🍯 সুন্দরবনের মধু', '🧈 খাঁটি গাওয়া ঘি', '🌿 সরিষার তেল', '🥛 ক্ষীর সন্দেশ', '🌶️ আচার ও চুইঝাল'],
    };
  }

  // Category specific matches
  if (text.includes('মধু') || text.includes('honey')) {
    return {
      reply: 'সুন্দরবনের ১০০% কাঁচা অপরিশোধিত খলসী ও কালোজিরা মধু! এক চামচেই রোগ প্রতিরোধ ক্ষমতা বাড়বে 🍯',
      characterState: 'praising',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('sundarbans-kalojira-flower-honey'),
      ].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🍯 কালোজিরা মধুর গুণ', '🎁 কম্বো প্যাক'],
    };
  }

  if (text.includes('ঘি') || text.includes('ghee')) {
    return {
      reply: 'সাতক্ষীরার দেশি গরুর দই মন্থন করে শত বছরের প্রাচীন বিলোনা পদ্ধতিতে তৈরি দানাদার খাঁটি গাওয়া ঘি! 🧈 গরম ভাতে স্বাদ অতুলনীয়!',
      characterState: 'praising',
      products: [formatCard('traditional-bilona-pure-cow-ghee')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🍯 মধুর সাথে কম্বো', '🚚 ফ্রি ডেলিভারি'],
    };
  }

  if (text.includes('সরিষার তেল') || text.includes('তেল') || text.includes('oil')) {
    return {
      reply: 'কাঠের ঘানি ভাঙা মাঘী সরিষার তেল 🌿 ঝাঁজালো প্রাকৃতিক ঘ্রাণ আর খাঁটি পুষ্টিতে ভর্তা-খিচুড়ির স্বাদ দশগুণ বাড়বে!',
      characterState: 'praising',
      products: [formatCard('cold-pressed-mustard-oil-ghani')].filter(Boolean),
      quickReplies: ['👉 তেল কার্টে যোগ করব', '🧈 গাওয়া ঘি', '🎁 মেগা কম্বো'],
    };
  }

  if (text.includes('সন্দেশ') || text.includes('মিষ্টি') || text.includes('sandesh')) {
    return {
      reply: 'সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ 🥛 খাঁটি ছানা ও গাঢ় ক্ষীরে তৈরি, মুখে দিলেই মাখনের মতো মিলিয়ে যাবে!',
      characterState: 'praising',
      products: [formatCard('satkhira-heritage-kheer-sandesh')].filter(Boolean),
      quickReplies: ['👉 সন্দেশ কার্টে নেব', '🍯 সুন্দরবনের মধু', '🛒 কার্ট দেখাও'],
    };
  }

  if (text.includes('আচার') || text.includes('চুইঝাল') || text.includes('pickle')) {
    return {
      reply: 'খাঁটি সরিষার তেলে সংরক্ষিত জিভে জল আনা দেশি ঘরোয়া আচার ও চুইঝাল 🌶️ মুখের স্বাদ ও রুচি ফেরাতে সেরা!',
      characterState: 'happy',
      products: [formatCard('sundarbans-plum-mango-pickle')].filter(Boolean),
      quickReplies: ['👉 আচার কার্টে নেব', '🌿 সরিষার তেল', '🎁 কম্বো অফার'],
    };
  }

  if (text.includes('কম্বো') || text.includes('প্যাক') || text.includes('combo')) {
    return {
      reply: 'সবচেয়ে জনপ্রিয় মেগা ফ্যামিলি কম্বো 🎁 মধু + ঘি + সরিষার তেল একসাথে নিয়ে ২০০ টাকা সাশ্রয় আর সারা দেশে ফ্রি ডেলিভারি উপভোগ করুন!',
      characterState: 'happy',
      products: [formatCard('satkhira-sundarbans-mega-family-combo')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🚚 ফ্রি ডেলিভারি পাব?', 'ক্যাশ অন ডেলিভারি'],
    };
  }

  // Not matched locally -> delegate to backend / LLM
  return null;
}
