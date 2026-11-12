// ─────────────────────────────────────────────────────────────
// Halum Mama Universal Multi-Lingual & Banglish Intent Engine
// Supports Bengali, Banglish (Transliteration), and English (0ms Response)
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

/**
 * Normalizes input: removes punctuation, multiple spaces, and standardizes lower-case text
 */
function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[?!.,;:()[\]{}"'`~@#$%^&*_\-+=<>/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if input contains any keyword or regex pattern
 */
function hasAny(text, list) {
  return list.some((item) => {
    if (item instanceof RegExp) return item.test(text);
    return text.includes(item);
  });
}

export function matchLocalHalumIntent(message = '', context = {}) {
  const rawText = (message || '').trim();
  const text = normalizeText(rawText);
  if (!text) return null;

  // ─────────────────────────────────────────────────────────────
  // 1. Direct Order Tracking Input (11-digit Phone or Order ID)
  // ─────────────────────────────────────────────────────────────
  const phoneMatch = rawText.match(/\b(01[3-9]\d{8})\b/);
  const orderIdMatch = rawText.match(/\b(ORD-[A-Z0-9]+)\b/i) || rawText.match(/#([A-Z0-9]{4,10})\b/i);

  if (phoneMatch || orderIdMatch) {
    const trackQuery = phoneMatch ? phoneMatch[1] : (orderIdMatch[1] || orderIdMatch[0]);
    return {
      type: 'track_order_query',
      query: trackQuery,
      reply: 'হালুম! আমি আপনার অর্ডারের তথ্য ডেটাবেজে খুঁজছি... 🔍',
      characterState: 'thinking',
      quickReplies: ['📦 নতুন অর্ডার করব', '📞 কাস্টমার কেয়ার', '🍯 সেরা মধু'],
    };
  }

  // User asking to track order -> Show interactive In-Chat Tracking Form Card
  if (
    hasAny(text, [
      'অর্ডার ট্র্যাক',
      'ট্র্যাক করব',
      'ট্র্যাকিং',
      'পার্সেল কোথায়',
      'আমার অর্ডার কোথায়',
      'অর্ডার স্ট্যাটাস',
      'অর্ডার দেখতে চাই',
      'পার্সেল কবে পাব',
      'track order',
      'track my order',
      'where is my order',
      'order status',
      'parcel kothay',
      'amar order kothay',
      'order track',
      'tracking',
      'order tracking',
    ])
  ) {
    return {
      type: 'show_track_form',
      reply: 'হালুম! নিচের কার্ডে আপনার মোবাইল নম্বর বা অর্ডার আইডি লিখে "ট্র্যাক করুন" বাটনে চাপ দিন, আমি লাইভ স্ট্যাটাস বের করে দিচ্ছি! 📦🐾',
      showTrackForm: true,
      characterState: 'thinking',
      quickReplies: ['📞 হেল্পলাইনে কথা বলব', '🚚 ডেলিভারি চার্জ কত?', '🛒 আমার কার্ট দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Small Talk & Greetings (বাংলা, বাংলিশ, ইংরেজি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'কেমন আছো',
      'কেমন আছেন',
      'কি খবর',
      'কী খবর',
      'কেমন চলছে',
      'ভালো আছো',
      'ভাল আছো',
      'হালুম কেমন',
      'kemon acho',
      'kemon asen',
      'kemon আছেন',
      'ki khobor',
      'ki obostha',
      'bhalo acho',
      'valoo achen',
      'how are you',
      'whats up',
      'what up',
    ])
  ) {
    return {
      reply: 'হালুম! সুন্দরবনের বাতাসে আর খাঁটি মধুর ঘ্রাণে একদম ফুরফুরে আছি! তোমার দিন কেমন যাচ্ছে? 🐯',
      characterState: 'greeting',
      quickReplies: ['🍯 কোন মধু ভালো হবে?', '🧈 খাঁটি বিলোনা ঘি', '🎁 আজকের ডিসকাউন্ট'],
    };
  }

  if (
    hasAny(text, [
      'হ্যালো',
      'হাই',
      'হালুম',
      'সালাম',
      'আসসালামু',
      'নমস্কার',
      'আদাব',
      'শুভ সকাল',
      'শুভ সন্ধ্যা',
      'hello',
      'hi',
      'hey',
      'salam',
      'assalamu alaikum',
      'shuvo sokal',
      'good morning',
      'greetings',
    ])
  ) {
    return {
      reply: 'হালুম! সুন্দরবনের খাঁটি মধুর দুনিয়ায় স্বাগতম! আমি হালুম মামা—আজকের আপনার শপিং গাইড! বলুন, আজ কোন খাঁটি খাবারটা চেখে দেখতে চান? 🐯',
      characterState: 'greeting',
      quickReplies: ['🍯 খাঁটি মধু দেখাও', '🧈 বিলোনা গাওয়া ঘি', '🎁 মেগা কম্বো প্যাক'],
    };
  }

  if (
    hasAny(text, [
      'কি করো',
      'কী করছো',
      'কি করছ',
      'কী কাজ',
      'ki koro',
      'ki korso',
      'what are you doing',
      'what do you do',
    ])
  ) {
    return {
      reply: 'এই তো শ্যামনগরের মৌয়াল ভাইদের সাথে নতুন মধুর জার চেক করছি আর তোমাদের জন্য খাঁটি খাবার পাহারা দিচ্ছি! 🍯',
      characterState: 'proud',
      quickReplies: ['🍯 খাঁটি মধু দেখব', '🎁 মেগা কম্বো অফার', '🚚 ফ্রি ডেলিভারি সীমা'],
    };
  }

  // Fixed Typo: "🎁 আজকের ডিসকাউন্ট"
  if (
    hasAny(text, [
      'তোমার নাম',
      'তুমি কে',
      'কে তুমি',
      'নাম কি',
      'নাম কী',
      'আপনার নাম',
      'পরিচয়',
      'who are you',
      'what is your name',
      'your name',
      'who r u',
      'tomar nam',
      'tomar naam',
      'apnar nam',
      'apnar naam',
      'nam ki',
      'naam ki',
      'tumi k',
      'tumi ke',
      'halum mama ke',
      'halum ke',
    ])
  ) {
    return {
      reply: 'আমি হালুম মামা! সুন্দরবনের বাঘ আর সাতক্ষীরা ঘরের চিফ টেস্ট অফিসার ও শপিং গাইড 🐯',
      characterState: 'proud',
      quickReplies: ['🍯 সুন্দরবনের মধু দেখাও', '🧈 বিলোনা ঘি কেমন?', '🎁 আজকের ডিসকাউন্ট'],
    };
  }

  if (
    hasAny(text, [
      'মন খারাপ',
      'ভালো লাগছে না',
      'ভাল লাগে না',
      'বিরক্ত',
      'টেনশন',
      'ক্লান্ত',
      'অসুস্থ',
      'mood off',
      'sad',
      'depressed',
      'bad mood',
      'mon kharap',
      'valo lage na',
    ])
  ) {
    return {
      reply: 'আরে মন খারাপ করো না! এক চামচ খাঁটি কালোজিরা মধু বা গরম ভাতে গাওয়া ঘি খেয়ে দেখো, মুড একদম চাঙা হয়ে যাবে! 🍯✨',
      characterState: 'happy',
      quickReplies: ['🍯 কালোজিরা মধু দেখাও', '🧈 খাঁটি গাওয়া ঘি', '🥛 ক্ষীর সন্দেশ খাব'],
    };
  }

  if (
    hasAny(text, [
      'মানুষ',
      'বট',
      'রোবট',
      'ai',
      'robot',
      'bot',
      'are you human',
      'are you ai',
      'manush naki robot',
      'tumi robot',
    ])
  ) {
    return {
      reply: 'হালুম! আমি পুরোদস্তুর সুন্দরবনের ডিজিটাল বাঘ—মানুষ না হলেও খাঁটি জিনিসের খবর মানুষের চেয়ে কম রাখি না! 🐾',
      characterState: 'proud',
      quickReplies: ['🍯 মধুর খাঁটি মান', '🚚 ডেলিভারি কবে পাব?', '🛒 পণ্য তালিকা দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Trust, Purity & Sourcing (খাঁটি মান, ল্যাব টেস্ট, উৎস)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'অরিজিনাল',
      'খাঁটি',
      'ভেজাল',
      'আসল',
      'নকল',
      'গ্যারান্টি',
      'ল্যাব টেস্ট',
      'চিনি মেশানো',
      'প্রিজারভেটিভ',
      'pure',
      'original',
      'authentic',
      'guarantee',
      'lab test',
      'lab tested',
      'test report',
      'khati naki',
      'khati to',
      'asol naki',
      'asol to',
      'vejal ache',
      'bhejal ache',
      'bhejal naki',
      'vejal naki',
      'pure naki',
    ])
  ) {
    return {
      reply: 'বাঘের জবান! কোনো চিনি বা প্রিজারভেটিভ নেই—সরাসরি শ্যামনগর ও সাতক্ষীরার মৌয়াল-খামারিদের থেকে সংগৃহীত এবং ল্যাব টেস্টে পরীক্ষিত। 🌿',
      characterState: 'proud',
      quickReplies: ['🍯 খলসী মধু দেখব', '🧈 বিলোনা ঘি এর দাম', '🚚 ক্যাশ অন ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'মধু কিভাবে',
      'কোথা থেকে',
      'সংগ্রহ',
      'মৌয়াল',
      'উৎস',
      'কখন সংগ্রহ',
      'source',
      'origin',
      'how honey is collected',
      'kothay theke anen',
      'kivabe banan',
      'mowal',
      'sundarbaner naki',
    ])
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

  // ─────────────────────────────────────────────────────────────
  // 4. Pricing, Offers & Discounts (দাম কত, অফার, ছাড়)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'দাম বেশি',
      'কম হবে',
      'ডিসকাউন্ট',
      'ছাড়',
      'কুপন',
      'অফার',
      'আজকের ডিসকাউন্ট',
      'discount',
      'offer',
      'coupon',
      'promo',
      'dam beshi',
      'kom hobe',
      'discount ache',
      'cheap price',
    ])
  ) {
    return {
      reply: 'খাঁটি জিনিসের মান ধরে রাখতে একটু খরচ পড়ে, তবে ফ্ল্যাশ সেল ও কম্বো প্যাকে এখনই ১০%–১৫% ছাড় চলছে! দেখাবো? 🎁',
      characterState: 'happy',
      products: [formatCard('satkhira-sundarbans-mega-family-combo')].filter(Boolean),
      quickReplies: ['🎁 মেগা কম্বো প্যাক', '⚡ ফ্ল্যাশ সেল অফার', '🚚 ফ্রি ডেলিভারি কীভাবে পাব?'],
    };
  }

  if (
    hasAny(text, [
      'দাম কত',
      'প্রাইজ কত',
      'টাকা কত',
      'রেট কত',
      'কত টাকা',
      'price koto',
      'dam koto',
      'daam koto',
      'koto taka',
      'how much',
      'cost',
    ])
  ) {
    return {
      reply: 'সুন্দরবনের খলসী মধু ৳১২৫০/কেজি, বিলোনা ঘি ৳১৮৫০/কেজি আর কাঠের ঘানি সরিষার তেল মাত্র ৳৩২০! কোনটির দাম বিস্তারিত দেখতে চান? 🌾',
      characterState: 'pointing',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('traditional-bilona-pure-cow-ghee'),
      ].filter(Boolean),
      quickReplies: ['🍯 মধুর দাম', '🧈 ঘি এর দাম', '🌿 সরিষার তেলের দাম', '🎁 কম্বো প্যাক'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Delivery, Shipping Fees & Free Shipping Policy
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'ডেলিভারি চার্জ',
      'ফ্রি ডেলিভারি',
      'শিপিং চার্জ',
      'ডেলিভারি কত',
      'কবে পাব',
      'কত দিনে পাব',
      'কুরিয়ার',
      'ক্যাশ অন ডেলিভারি',
      'delivery charge',
      'delivery fee',
      'shipping cost',
      'shipping fee',
      'free delivery',
      'home delivery',
      'cod',
      'koto dine pabo',
      'kobe pabo',
      'delivery koto',
      'delivery fee koto',
      'delivery charge koto',
    ])
  ) {
    return {
      reply: `সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা আছে! আর মাত্র ৳${deliveryConfig.freeDeliveryThreshold} টাকার পণ্য নিলেই ডেলিভারি চার্জ একদম ফ্রি! 🚚💨`,
      characterState: 'happy',
      quickReplies: ['🎁 মেগা কম্বো নিলে ফ্রি', '🛒 আমার কার্ট দেখাও', '🍯 মধু দেখতে চাই'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. How to Order & Checkout Guidance (অর্ডার পদ্ধতি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'অর্ডার কিভাবে করব',
      'অর্ডার করতে চাই',
      'কিনব কিভাবে',
      'কিভাবে নেব',
      'অর্ডার প্রসেস',
      'অর্ডার করব',
      'order kivabe korbo',
      'order korte chai',
      'how to order',
      'how to buy',
      'kinte chai',
    ])
  ) {
    return {
      reply: 'পছন্দের পণ্যে "এখনই অর্ডার করুন" বাটনে ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিন! কোনো অগ্রিম টাকা লাগবে না—পণ্য হাতে পেয়ে টাকা দেবেন! 🐾👇',
      characterState: 'pointing',
      products: [formatCard('sundarbans-pure-khalsi-honey')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🎁 মেগা কম্বো প্যাক', '📞 ফোনে অর্ডার করব'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Payment Methods & bKash (পেমেন্ট পদ্ধতি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'পেমেন্ট',
      'বিকাশ',
      'নগদ',
      'রকেট',
      'অগ্রিম',
      'টাকা কিভাবে',
      'টাকা কেমনে',
      'টাকা দেব',
      'টাকা দিব',
      'টাকা দিতে হবে',
      'টাকা কিভাবে দেব',
      'টাকা কিভাবে দিব',
      'payment',
      'bkash',
      'bikash',
      'nagad',
      'nogod',
      'rocket',
      'advance payment',
      'cash on',
      'taka kivabe dibo',
      'taka kivabe debo',
      'taka kemne dibo',
      'payment kivabe',
      'bkash kora jabe',
      'bkash ache',
      'nogod ache',
    ])
  ) {
    return {
      reply: 'আমাদের ১০০% ক্যাশ অন ডেলিভারি সুবিধা রয়েছে! পার্সেল দেখে তারপর টাকা দিন। চাইলে বিকাশ বা নগদেও পেমেন্ট করতে পারবেন। 💳',
      characterState: 'proud',
      quickReplies: ['🚚 ফ্রি ডেলিভারি সীমা', '🛒 কার্ট দেখাও', '🍯 মধু অর্ডার করব'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Return, Refund & Safety (ভেঙে গেলে, রিটার্ন)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'ভেঙে গেলে',
      'ভেঙ্গে গেলে',
      'নষ্ট হলে',
      'নষ্ট হলে কি',
      'খারাপ লাগলে',
      'রিটার্ন',
      'টাকা ফেরত',
      'অভিযোগ',
      'রিপ্লেসমেন্ট',
      'ফেরত',
      'ক্ষতিগ্রস্ত',
      'return policy',
      'refund',
      'damaged product',
      'replacement',
      'noshto hole',
      'nosto hole',
      'nosto hole ki',
      'nosto hole ki korben',
      'taka ferot',
      'bhenge gele',
      'vange gele',
      'bhenge gele ki hobe',
      'damage hole',
      'broken',
      'damaged',
      'ferot pabo',
    ])
  ) {
    return {
      reply: 'পার্সেল পাওয়ার সময় জারের কোনো ক্ষতি হলে আমরা সাথে সাথে ফ্রি রিপ্লেসমেন্ট পাঠাই অথবা ১০০% টাকা রিফান্ড দিই! সম্পূর্ণ বাঘের নিশ্চয়তা! 🛡️',
      characterState: 'proud',
      quickReplies: ['📞 হেল্পলাইন নম্বর', '🍯 খাঁটি মধু দেখব', '🛒 কার্ট দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. Contact, Phone & Customer Care (যোগাযোগ)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'কাস্টমার কেয়ার',
      'ফোন নম্বর',
      'মোবাইল নম্বর',
      'কথা বলতে চাই',
      'মানুষের সাথে কথা',
      'হোয়াটসঅ্যাপ',
      'অফিস কোথায়',
      'হেল্পলাইন',
      'customer care',
      'helpline',
      'phone number',
      'contact',
      'call',
      'whatsapp',
      'kotha bolbo',
      'hotline',
    ])
  ) {
    return {
      reply: `আমাদের সরাসরি হেল্পলাইন: ${deliveryConfig.supportPhone}। সকাল ৯টা থেকে রাত ১০টা পর্যন্ত যেকোনো সময় কল বা হোয়াটসঅ্যাপে কথা বলতে পারেন! 📞`,
      characterState: 'saluting',
      isFallback: true,
      quickReplies: ['📦 অর্ডার ট্র্যাক করব', '🍯 খাঁটি মধু দেখাও', '🎁 কম্বো অফার'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. Specific Product Searches (মধু, ঘি, তেল, সন্দেশ, আচার, ইত্যাদি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'মধু',
      'খলসী',
      'কালোজিরা',
      'গরান',
      'কেওড়া',
      'honey',
      'raw honey',
      'modhu',
      'khalisha',
      'khalshi',
      'kalojira',
    ])
  ) {
    return {
      reply: 'সুন্দরবনের ১০০% কাঁচা অপরিশোধিত খলসী ও কালোজিরা মধু! এক চামচেই মুখের সুবাস আর শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়বে 🍯',
      characterState: 'praising',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('sundarbans-kalojira-flower-honey'),
      ].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🍯 কালোজিরা মধুর গুণ', '🎁 কম্বো প্যাক'],
    };
  }

  if (
    hasAny(text, [
      'ঘি',
      'গাওয়া ঘি',
      'বিলোনা ঘি',
      'ghee',
      'bilona ghee',
      'gawa ghee',
      'cow ghee',
      'danadar ghee',
    ])
  ) {
    return {
      reply: 'সাতক্ষীরার দেশি গরুর দই মন্থন করে শত বছরের প্রাচীন বিলোনা পদ্ধতিতে তৈরি দানাদার খাঁটি গাওয়া ঘি! 🧈 গরম ভাতে স্বাদ অতুলনীয়!',
      characterState: 'praising',
      products: [formatCard('traditional-bilona-pure-cow-ghee')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🍯 মধুর সাথে কম্বো', '🚚 ফ্রি ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'সরিষার তেল',
      'তেল',
      'ঘানি',
      'mustard oil',
      'sorishar tel',
      'ghani vanga tel',
      'cooking oil',
    ])
  ) {
    return {
      reply: 'কাঠের ঘানি ভাঙা মাঘী সরিষার তেল 🌿 ঝাঁজালো প্রাকৃতিক ঘ্রাণ আর খাঁটি পুষ্টিতে ভর্তা-খিচুড়ির স্বাদ দশগুণ বাড়বে!',
      characterState: 'praising',
      products: [formatCard('cold-pressed-mustard-oil-ghani')].filter(Boolean),
      quickReplies: ['👉 তেল কার্টে যোগ করব', '🧈 গাওয়া ঘি', '🎁 মেগা কম্বো'],
    };
  }

  if (
    hasAny(text, [
      'সন্দেশ',
      'মিষ্টি',
      'ক্ষীর সন্দেশ',
      'sandesh',
      'kheer sandesh',
      'sweet',
      'mishti',
      'misti',
    ])
  ) {
    return {
      reply: 'সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ 🥛 খাঁটি ছানা ও গাঢ় ক্ষীরে তৈরি, মুখে দিলেই মাখনের মতো মিলিয়ে যাবে!',
      characterState: 'praising',
      products: [formatCard('satkhira-heritage-kheer-sandesh')].filter(Boolean),
      quickReplies: ['👉 সন্দেশ কার্টে নেব', '🍯 সুন্দরবনের মধু', '🛒 কার্ট দেখাও'],
    };
  }

  if (
    hasAny(text, [
      'আচার',
      'চুইঝাল',
      'আমের আচার',
      'রসুন আচার',
      'pickle',
      'achar',
      'aachar',
      'chui jhal',
      'chuijhal',
    ])
  ) {
    return {
      reply: 'খাঁটি সরিষার তেলে সংরক্ষিত জিভে জল আনা দেশি ঘরোয়া আচার ও চুইঝাল 🌶️ মুখের স্বাদ ও রুচি ফেরাতে সেরা!',
      characterState: 'happy',
      products: [formatCard('sundarbans-plum-mango-pickle')].filter(Boolean),
      quickReplies: ['👉 আচার কার্টে নেব', '🌿 সরিষার তেল', '🎁 কম্বো অফার'],
    };
  }

  if (
    hasAny(text, [
      'কম্বো',
      'প্যাক',
      'ফ্যামিলি কম্বো',
      'মেগা কম্বো',
      'combo',
      'mega combo',
      'family pack',
      'bundle',
    ])
  ) {
    return {
      reply: 'সবচেয়ে জনপ্রিয় মেগা ফ্যামিলি কম্বো 🎁 মধু + ঘি + সরিষার তেল একসাথে নিয়ে ২০০ টাকা সাশ্রয় আর সারা দেশে ফ্রি ডেলিভারি উপভোগ করুন!',
      characterState: 'happy',
      products: [formatCard('satkhira-sundarbans-mega-family-combo')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🚚 ফ্রি ডেলিভারি পাব?', 'ক্যাশ অন ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'চিয়া সিড',
      'মরিঙ্গা',
      'সুপারফুড',
      'বীজ',
      'chia',
      'moringa',
      'superfood',
      'seed',
    ])
  ) {
    return {
      reply: 'আমদানিকৃত প্রিমিয়াম অর্গানিক চিয়া সিড ও খাঁটি মরিঙ্গা পাউডার 🌱 ওজন নিয়ন্ত্রণ ও সার্বিক ফিটনেসে সেরা সমাধান!',
      characterState: 'praising',
      products: [
        formatCard('premium-organic-chia-seeds'),
        formatCard('organic-moringa-leaf-powder-premium'),
      ].filter(Boolean),
      quickReplies: ['👉 চিয়া সিড নেব', '🌿 মরিঙ্গা পাউডার', 'ডেলিভারি চার্জ'],
    };
  }

  if (
    hasAny(text, [
      'কি কি প্রডাক্ট',
      'কী কী পণ্য',
      'পণ্য তালিকা',
      'তালিকা',
      'সব পণ্য',
      'মেনু',
      'ক্যাটালগ',
      'সব খাবার',
      'product list',
      'all products',
      'menu',
      'catalog',
      'ki ki ache',
    ])
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

  // Not matched locally -> delegate to backend / LLM
  return null;
}
