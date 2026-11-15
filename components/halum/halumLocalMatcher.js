// ─────────────────────────────────────────────────────────────
// Halum Mama Universal Multi-Lingual & Banglish Intent Engine
// Supports Bengali, Banglish (Transliteration), SMS Shortcuts & English (0ms Response)
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
    badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
  };
}

/**
 * Normalizes input: removes punctuation, multiple spaces, zero-width chars,
 * and standardizes lower-case text.
 */
function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[?!.,;:()[\]{}"'`~@#$%^&*_\-+=<>/\\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Smart keyword & pattern matcher:
 * - RegExp: tested directly against normalized text
 * - Pure ASCII words/phrases (e.g. "hi", "ai", "cod", "tnx"): matched with word boundaries (\b)
 *   so "ai" never falsely matches "chai" / "bhai", and "hi" never matches "khati"
 * - Bengali / mixed phrases: matched via padded word boundary or substring
 */
function hasAny(text, list) {
  const padded = ` ${text} `;
  return list.some((item) => {
    if (item instanceof RegExp) return item.test(text);
    const kw = item.toLowerCase().trim();
    if (!kw) return false;
    // If purely ASCII letters/numbers/spaces, enforce word boundaries
    if (/^[a-z0-9\s]+$/.test(kw)) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
      return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
    }
    // For Bengali/Unicode: match exact token or substring for multi-char roots
    if (kw.length <= 2) {
      return padded.includes(` ${kw} `);
    }
    return text.includes(kw);
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
  const orderIdMatch =
    rawText.match(/\b(ORD-[A-Z0-9]+)\b/i) || rawText.match(/#([A-Z0-9]{4,10})\b/i);

  if (phoneMatch || orderIdMatch) {
    const trackQuery = phoneMatch ? phoneMatch[1] : orderIdMatch[1] || orderIdMatch[0];
    return {
      type: 'track_order_query',
      query: trackQuery,
      reply: 'হালুম! আমি আপনার অর্ডারের তথ্য ডেটাবেজে খুঁজছি... 🔍',
      characterState: 'thinking',
      quickReplies: ['📦 নতুন অর্ডার করব', '📞 কাস্টমার কেয়ার', '🍯 সেরা মধু'],
    };
  }

  // User asking to track order -> Show interactive In-Chat Tracking Form Card
  if (
    hasAny(text, [
      'অর্ডার ট্র্যাক',
      'ট্র্যাক করব',
      'ট্র্যাকিং',
      'ট্র্যাক',
      'পার্সেল কোথায়',
      'পার্সেল কই',
      'আমার অর্ডার কোথায়',
      'অর্ডার স্ট্যাটাস',
      'অর্ডার দেখতে চাই',
      'পার্সেল কবে পাব',
      'অর্ডার কই',
      'মাল কবে আসবে',
      'কুরিয়ার স্ট্যাটাস',
      'track order',
      'track my order',
      'where is my order',
      'order status',
      'parcel kothay',
      'amar order kothay',
      'order kothay',
      'order koi',
      'parcel koi',
      'order track',
      'tracking',
      'track',
      'order tracking',
      'kobe asbe amar order',
    ])
  ) {
    return {
      type: 'show_track_form',
      reply:
        'হালুম! নিচের কার্ডে আপনার মোবাইল নম্বর বা অর্ডার আইডি লিখে "ট্র্যাক করুন" বাটনে চাপ দিন, আমি লাইভ স্ট্যাটাস বের করে দিচ্ছি! 📦🐾',
      showTrackForm: true,
      characterState: 'thinking',
      quickReplies: ['📞 হেল্পলাইনে কথা বলব', '🚚 ডেলিভারি চার্জ কত?', '🛒 আমার কার্ট দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. Small Talk, Greetings, Thanks & Goodbye (বাংলা, বাংলিশ, শর্টকাট, ইংরেজি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'কেমন আছো',
      'কেমন আছেন',
      'কেমন আছ',
      'ক্যামন আছো',
      'কি খবর',
      'কী খবর',
      'কেমন চলছে',
      'ভালো আছো',
      'ভাল আছো',
      'হালুম কেমন',
      'কি অবস্থা',
      'কী অবস্থা',
      'kemon acho',
      'kemon aso',
      'kemon asen',
      'kemon achen',
      'kmn acho',
      'kmn aso',
      'kmn',
      'ki khobor',
      'ki khbr',
      'khobor ki',
      'ki obostha',
      'ki obosta',
      'bhalo acho',
      'valo acho',
      'valoo achen',
      'how are you',
      'how r u',
      'hru',
      'whats up',
      'what up',
      'sup',
    ])
  ) {
    return {
      reply:
        'হালুম! সুন্দরবনের বাতাসে আর খাঁটি মধুর ঘ্রাণে একদম ফুরফুরে আছি! তোমার দিন কেমন যাচ্ছে? 🐯',
      characterState: 'greeting',
      quickReplies: ['🍯 কোন মধু ভালো হবে?', '🧈 খাঁটি বিলোনা ঘি', '🎁 আজকের ডিসকাউন্ট'],
    };
  }

  if (
    hasAny(text, [
      'হ্যালো',
      'হালো',
      'হাই',
      'হালুম',
      'হালুম মামা',
      'বাঘ মামা',
      'সালাম',
      'আসসালামু',
      'নমস্কার',
      'আদাব',
      'শুভ সকাল',
      'শুভ সন্ধ্যা',
      'শুভ রাত্রি',
      'hello',
      'hi',
      'hey',
      'hlw',
      'hlo',
      'helo',
      'salam',
      'slm',
      'assalamu alaikum',
      'assalamualaikum',
      'aslm',
      'shuvo sokal',
      'good morning',
      'good evening',
      'good afternoon',
      'greetings',
      'halum',
      'halum mama',
      'bagh mama',
    ])
  ) {
    return {
      reply:
        'হালুম! সুন্দরবনের খাঁটি মধুর দুনিয়ায় স্বাগতম! আমি হালুম মামা—আজকের আপনার শপিং গাইড! বলুন, আজ কোন খাঁটি খাবারটা চেখে দেখতে চান? 🐯',
      characterState: 'greeting',
      quickReplies: ['🍯 খাঁটি মধু দেখাও', '🧈 বিলোনা গাওয়া ঘি', '🎁 মেগা কম্বো প্যাক'],
    };
  }

  if (
    hasAny(text, [
      'কি করো',
      'কী করছো',
      'কি করছ',
      'কী কাজ',
      'কি কর',
      'বসে আছো',
      'ki koro',
      'ki korso',
      'ki korcho',
      'ki koren',
      'koro ki',
      'what are you doing',
      'what do you do',
      'wyd',
    ])
  ) {
    return {
      reply:
        'এই তো শ্যামনগরের মৌয়াল ভাইদের সাথে নতুন মধুর জার চেক করছি আর তোমাদের জন্য খাঁটি খাবার পাহারা দিচ্ছি! 🍯',
      characterState: 'proud',
      quickReplies: ['🍯 খাঁটি মধু দেখব', '🎁 মেগা কম্বো অফার', '🚚 ফ্রি ডেলিভারি সীমা'],
    };
  }

  if (
    hasAny(text, [
      'তোমার নাম',
      'তুমি কে',
      'কে তুমি',
      'নাম কি',
      'নাম কী',
      'আপনার নাম',
      'পরিচয়',
      'who are you',
      'what is your name',
      'whats your name',
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
      'দুর্বল',
      'mood off',
      'sad',
      'depressed',
      'bad mood',
      'mon kharap',
      'valo lage na',
      'bhalo lage na',
      'boring',
      'tired',
    ])
  ) {
    return {
      reply:
        'আরে মন খারাপ করো না! এক চামচ খাঁটি কালোজিরা মধু বা গরম ভাতে গাওয়া ঘি খেয়ে দেখো, মুড একদম চাঙা হয়ে যাবে! 🍯✨',
      characterState: 'happy',
      quickReplies: ['🍯 কালোজিরা মধু দেখাও', '🧈 খাঁটি গাওয়া ঘি', '🥛 ক্ষীর সন্দেশ খাব'],
    };
  }

  if (
    hasAny(text, [
      'মানুষ',
      'বট',
      'রোবট',
      'এআই',
      'ai',
      'robot',
      'bot',
      'chatbot',
      'are you human',
      'are you ai',
      'manush naki robot',
      'tumi robot',
      'tumi ki ai',
    ])
  ) {
    return {
      reply:
        'হালুম! আমি পুরোদস্তুর সুন্দরবনের ডিজিটাল বাঘ—মানুষ না হলেও খাঁটি জিনিসের খবর মানুষের চেয়ে কম রাখি না! 🐾',
      characterState: 'proud',
      quickReplies: ['🍯 মধুর খাঁটি মান', '🚚 ডেলিভারি কবে পাব?', '🛒 পণ্য তালিকা দেখাও'],
    };
  }

  if (
    hasAny(text, [
      'ধন্যবাদ',
      'থ্যাংকস',
      'থ্যাংক ইউ',
      'শুকরিয়া',
      'জোস',
      'দারুণ',
      'অসাধারণ',
      'চমৎকার',
      'খুব সুন্দর',
      'ভালো লাগলো',
      'thanks',
      'thank you',
      'thank u',
      'tnx',
      'thnx',
      'thx',
      'tq',
      'ty',
      'shukriya',
      'dhonnobad',
      'dhonnobad',
      'joss',
      'awesome',
      'nice',
      'great',
      'good job',
    ])
  ) {
    return {
      reply:
        'আরে ধন্যবাদ কিসের! সুন্দরবনের খাঁটি খাবার পৌঁছে দেওয়াই হালুম মামার আনন্দ! আর কোনো সাহায্য লাগলে বলো 🐯💛',
      characterState: 'happy',
      quickReplies: ['🛒 আমার কার্ট দেখাও', '🎁 মেগা কম্বো অফার', '📦 অর্ডার ট্র্যাক করব'],
    };
  }

  if (
    hasAny(text, [
      'বিদায়',
      'আল্লাহ হাফেজ',
      'টাটা',
      'ভালো থেকো',
      'পরে আসবো',
      'পরে কথা হবে',
      'bye',
      'bye bye',
      'tata',
      'allah hafez',
      'khuda hafez',
      'good night',
      'see you',
      'cya',
    ])
  ) {
    return {
      reply:
        'আল্লাহ হাফেজ! সুন্দরবনের খাঁটি স্বাদ নিতে আবার এসো, হালুম মামা সবসময় এখানেই অপেক্ষা করবে! 🐾👋',
      characterState: 'saluting',
      quickReplies: ['🍯 খাঁটি মধু দেখব', '🎁 আজকের ডিসকাউন্ট'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. Trust, Purity, Lab Test, Fake Honey Check & Storage
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'জমে যায়',
      'জমে গেছে',
      'চিনি জমে',
      'দানা বাঁধে',
      'চেনার উপায়',
      'খাঁটি চিনব কিভাবে',
      'আসল চিনব',
      'ফ্রিজে রাখব',
      'সংরক্ষণ',
      'মেয়াদ',
      'কতদিন ভালো থাকে',
      'crystallize',
      'crystallized',
      'frozen',
      'fridge',
      'how to test',
      'how to check purity',
      'pure test',
      'khati chenar upay',
      'jome jay',
      'jome geche',
      'expiry',
      'expire',
      'shelf life',
      'storage',
      'kotodin valo thake',
    ])
  ) {
    return {
      reply:
        'প্রাকৃতিক মধু (বিশেষ করে সরিষা বা শীতের মধু) ঠান্ডায় জমে দানা বাঁধতে পারে—এটিই খাঁটি মধুর স্বাভাবিক ধর্ম! মধু ফ্রিজে না রেখে সাধারণ তাপমাত্রায় কাচের জারে রাখলে বছরখানেক ভালো থাকে। 🍯🔬',
      characterState: 'proud',
      quickReplies: ['🍯 খলসী মধু দেখব', '🌿 আমাদের মানের নিশ্চয়তা', '👉 এখনই অর্ডার করুন'],
    };
  }

  if (
    hasAny(text, [
      'অরিজিনাল',
      'ওরিজিনাল',
      'খাঁটি',
      'খাটি',
      'ভেজাল',
      'আসল',
      'নকল',
      'গ্যারান্টি',
      'ল্যাব টেস্ট',
      'চিনি মেশানো',
      'প্রিজারভেটিভ',
      'কেমিক্যাল',
      'হালাল',
      'pure',
      'original',
      'authentic',
      'guarantee',
      'lab test',
      'lab tested',
      'test report',
      'halal',
      'chemical free',
      'khati naki',
      'khati to',
      'khati hobe',
      'asol naki',
      'asol to',
      'original naki',
      'original to',
      'vejal ache',
      'bhejal ache',
      'bhejal naki',
      'vejal naki',
      'pure naki',
      '100% pure',
    ])
  ) {
    return {
      reply:
        'বাঘের জবান! কোনো চিনি, রঙ বা প্রিজারভেটিভ নেই—সরাসরি শ্যামনগর ও সাতক্ষীরার মৌয়াল-খামারিদের থেকে সংগৃহীত এবং মান যাচাইকৃত। পণ্য হাতে পেয়ে যাচাই করে টাকা দেবেন! 🌿',
      characterState: 'proud',
      quickReplies: ['🍯 খলসী মধু দেখব', '🧈 বিলোনা ঘি এর দাম', '🚚 ক্যাশ অন ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'মধু কিভাবে',
      'মধু কীভাবে',
      'কোথা থেকে',
      'সংগ্রহ',
      'মৌয়াল',
      'উৎস',
      'কখন সংগ্রহ',
      'source',
      'origin',
      'how honey is collected',
      'kothay theke anen',
      'kotha theke',
      'kivabe banan',
      'kivabe songroho',
      'mowal',
      'sundarbaner naki',
      'satkhira',
    ])
  ) {
    return {
      reply:
        'সুন্দরবনের অভিজ্ঞ মৌয়ালরা গভীর বন থেকে খলসী ও গরান ফুলের মৌচাক ভেঙে কোনো হিটিং ছাড়াই প্রাকৃতিকভাবে কাঁচা মধু সংগ্রহ করেন। 🍯',
      characterState: 'proud',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('sundarbans-natural-goran-raw-honey'),
      ].filter(Boolean),
      quickReplies: ['🍯 খলসী মধু কার্টে নেব', '🍯 কালোজিরা মধু', '🎁 ফ্যামিলি কম্বো'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. Health Benefits, Usage, Diabetes & Kids
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'ডায়াবেটিস',
      'সুগার',
      'বাচ্চা',
      'বাচ্চাদের',
      'শিশু',
      'গর্ভবতী',
      'খাওয়ার নিয়ম',
      'কিভাবে খাব',
      'কীভাবে খাব',
      'উপকারিতা',
      'কাজ কি',
      'ঠান্ডা কাশি',
      'ওজন কমানো',
      'ওজন বাড়ে',
      'diabetes',
      'diabetic',
      'sugar',
      'baby',
      'kids',
      'child',
      'pregnant',
      'pregnancy',
      'benefits',
      'how to eat',
      'how to use',
      'kivabe khabo',
      'khawar niyom',
      'upokarita',
      'weight loss',
      'immunity',
    ])
  ) {
    return {
      reply:
        'খাঁটি মধু ও কালোজিরা মধু রোগ প্রতিরোধ ক্ষমতা বাড়ায় এবং ঠান্ডা-কাশিতে দারুণ কাজ করে। ১ বছরের বেশি বয়সী বাচ্চারা সহজেই খেতে পারে; তবে ডায়াবেটিস বা গর্ভাবস্থায় ডাক্তারের পরামর্শ অনুযায়ী পরিমিত খাওয়াই ভালো। 🍯🌱',
      characterState: 'praising',
      products: [
        formatCard('sundarbans-kalojira-flower-honey'),
        formatCard('premium-organic-chia-seeds'),
      ].filter(Boolean),
      quickReplies: ['🍯 কালোজিরা মধু দেখব', '🌱 চিয়া সিড ও মরিঙ্গা', '👉 এখনই অর্ডার করুন'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Recommendation & Comparison (কোনটা ভালো / সেরা)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'কোনটা ভালো',
      'কোনটা সেরা',
      'কোন মধু ভালো',
      'কোন মধু সেরা',
      'খলসী নাকি কালোজিরা',
      'সাজেশন',
      'বেস্ট সেলার',
      'জনপ্রিয়',
      'কি নেওয়া উচিত',
      'suggest',
      'recommend',
      'recommendation',
      'which is best',
      'best honey',
      'best seller',
      'konta valo',
      'konta bhalo',
      'konta sera',
      'kon modhu valo',
      'kon modhu sera',
      'ki nebo',
    ])
  ) {
    return {
      reply:
        'হালুম মামার সেরা পছন্দ: দারুণ স্বাদ ও সুগন্ধের জন্য **খলসী ফুলের মধু** সেরা, আর ঔষধি গুণ ও ঠান্ডা-কাশির জন্য **কালোজিরা ফুলের মধু** অতুলনীয়! সাথে **বিলোনা গাওয়া ঘি** নিলে তো কথাই নেই! 🏆',
      characterState: 'praising',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('sundarbans-kalojira-flower-honey'),
        formatCard('traditional-bilona-pure-cow-ghee'),
      ].filter(Boolean),
      quickReplies: ['🍯 খলসী মধু নেব', '🎁 মেগা কম্বো প্যাক', '🚚 ফ্রি ডেলিভারি সীমা'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. Weight, Size, Packaging & Wholesale/Gift
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      '৫০০ গ্রাম',
      'আধা কেজি',
      '২৫০ গ্রাম',
      '১ কেজি',
      '২ কেজি',
      'কত গ্রাম',
      'কতটুকু',
      'ওজন',
      'প্যাকেজিং',
      'কাচের জার',
      'বোতল',
      '500g',
      '500gm',
      '500 gram',
      'half kg',
      '250g',
      '250gm',
      '1kg',
      '1 kg',
      '2kg',
      'weight',
      'size',
      'packaging',
      'jar',
      'bottle',
      'adha kg',
      'kototuku',
    ])
  ) {
    return {
      reply:
        'আমাদের পণ্যগুলো সাধারণত ৫০০ গ্রাম ও ১ কেজি ফুড-গ্রেড কাচের জার এবং নিরাপদ বোতলে বাবল-র‌্যাপ করে পাঠানো হয়, যেন ডেলিভারিতে একদম অক্ষত থাকে! 📦🫙',
      characterState: 'proud',
      quickReplies: ['🍯 সুন্দরবনের মধু', '🧈 খাঁটি গাওয়া ঘি', '🛡️ ভেঙে গেলে কি হবে?'],
    };
  }

  if (
    hasAny(text, [
      'পাইকারি',
      'হোলসেল',
      'বেশি নিলে',
      'বাল্ক',
      'গিফট',
      'উপহার',
      'কর্পোরেট',
      'wholesale',
      'bulk',
      'reseller',
      'gift',
      'corporate',
      'paikari',
      'beshi nile',
    ])
  ) {
    return {
      reply: `পাইকারি অর্ডার, রিসেলার বা কর্পোরেট গিফট প্যাকের জন্য বিশেষ মূল্য ছাড় রয়েছে! সরাসরি আমাদের হেল্পলাইন ${deliveryConfig.supportPhone}-এ কল বা হোয়াটসঅ্যাপ করুন। 🤝🎁`,
      characterState: 'happy',
      quickReplies: ['🎁 মেগা কম্বো প্যাক', '📞 হেল্পলাইন নম্বর', '🚚 ডেলিভারি চার্জ'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 7. Pricing, Offers & Discounts (দাম কত, অফার, ছাড়)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'দাম বেশি',
      'কম হবে',
      'ডিসকাউন্ট',
      'ছাড়',
      'কুপন',
      'অফার',
      'আজকের ডিসকাউন্ট',
      'ফ্ল্যাশ সেল',
      'সস্তা',
      'discount',
      'offer',
      'coupon',
      'promo',
      'flash sale',
      'dam beshi',
      'kom hobe',
      'kom kora jabe',
      'discount ache',
      'cheap price',
    ])
  ) {
    return {
      reply:
        'খাঁটি জিনিসের মান ধরে রাখতে একটু খরচ পড়ে, তবে ফ্ল্যাশ সেল ও কম্বো প্যাকে এখনই ১০%–১৫% ছাড় চলছে! দেখাবো? 🎁',
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
      'প্রাইস',
      'দাম',
      'price koto',
      'dam koto',
      'daam koto',
      'koto taka',
      'koto tk',
      'tk koto',
      'price',
      'how much',
      'cost',
      'rate',
    ])
  ) {
    return {
      reply:
        'সুন্দরবনের খলসী মধু ৳১২৫০/কেজি, বিলোনা ঘি ৳১৮৫০/কেজি আর কাঠের ঘানি সরিষার তেল মাত্র ৳৩২০! কোনটির দাম বিস্তারিত দেখতে চান? 🌾',
      characterState: 'pointing',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('traditional-bilona-pure-cow-ghee'),
      ].filter(Boolean),
      quickReplies: ['🍯 মধুর দাম', '🧈 ঘি এর দাম', '🌿 সরিষার তেলের দাম', '🎁 কম্বো প্যাক'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 8. Delivery, Location Coverage, Shipping Fees & Free Shipping
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'ডেলিভারি চার্জ',
      'ফ্রি ডেলিভারি',
      'শিপিং চার্জ',
      'ডেলিভারি কত',
      'কবে পাব',
      'কত দিনে পাব',
      'কত দিন লাগে',
      'কুরিয়ার',
      'ক্যাশ অন ডেলিভারি',
      'ঢাকায় ডেলিভারি',
      'চট্টগ্রাম',
      'সিলেট',
      'রাজশাহী',
      'খুলনা',
      'বরিশাল',
      'রংপুর',
      'ময়মনসিংহ',
      'সারাদেশে',
      'গ্রামে যাবে',
      'হোম ডেলিভারি',
      'delivery charge',
      'delivery fee',
      'shipping cost',
      'shipping fee',
      'free delivery',
      'home delivery',
      'cod',
      'courier',
      'steadfast',
      'pathao',
      'redx',
      'dhaka',
      'chittagong',
      'sylhet',
      'rajshahi',
      'khulna',
      'barishal',
      'rangpur',
      'koto dine pabo',
      'kobe pabo',
      'delivery koto',
      'delivery fee koto',
      'delivery charge koto',
      'koto din lage',
    ])
  ) {
    return {
      reply: `ঢাকা ও সাতক্ষীরায় ৳৭০ এবং সারাদেশের যেকোনো জেলা-উপজেলায় ৳১৩০ চার্জে ২৪–৪৮ ঘণ্টায় ক্যাশ অন ডেলিভারি পাবেন! আর মাত্র ৳${deliveryConfig.freeDeliveryThreshold} টাকার পণ্য নিলেই ডেলিভারি চার্জ একদম ফ্রি! 🚚💨`,
      characterState: 'happy',
      quickReplies: ['🎁 মেগা কম্বো নিলে ফ্রি', '🛒 আমার কার্ট দেখাও', '🍯 মধু দেখতে চাই'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 9. How to Order & Checkout Guidance (অর্ডার পদ্ধতি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'অর্ডার কিভাবে করব',
      'অর্ডার করতে চাই',
      'অর্ডার করব',
      'কিনব কিভাবে',
      'কিনতে চাই',
      'কিভাবে নেব',
      'নিতে চাই',
      'অর্ডার প্রসেস',
      'অর্ডার নিয়ম',
      'order kivabe korbo',
      'order korte chai',
      'order korbo',
      'how to order',
      'how to buy',
      'kinte chai',
      'kivabe nibo',
      'nite chai',
      'lagbe',
    ])
  ) {
    return {
      reply:
        'পছন্দের পণ্যে "এখনই অর্ডার করুন" বাটনে ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিন! কোনো অগ্রিম টাকা লাগবে না—পণ্য হাতে পেয়ে টাকা দেবেন! 🐾👇',
      characterState: 'pointing',
      products: [formatCard('sundarbans-pure-khalsi-honey')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🎁 মেগা কম্বো প্যাক', '📞 ফোনে অর্ডার করব'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 10. Payment Methods & bKash (পেমেন্ট পদ্ধতি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'পেমেন্ট',
      'বিকাশ',
      'নগদ',
      'রকেট',
      'অগ্রিম',
      'এডভান্স',
      'টাকা কিভাবে',
      'টাকা কেমনে',
      'টাকা দেব',
      'টাকা দিব',
      'টাকা দিতে হবে',
      'টাকা কিভাবে দেব',
      'টাকা কিভাবে দিব',
      'কার্ড পেমেন্ট',
      'payment',
      'bkash',
      'bikash',
      'nagad',
      'nogod',
      'rocket',
      'advance payment',
      'advance',
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
      reply:
        'আমাদের ১০০% ক্যাশ অন ডেলিভারি সুবিধা রয়েছে! পার্সেল দেখে তারপর টাকা দিন। চাইলে বিকাশ বা নগদেও পেমেন্ট করতে পারবেন। 💳',
      characterState: 'proud',
      quickReplies: ['🚚 ফ্রি ডেলিভারি সীমা', '🛒 কার্ট দেখাও', '🍯 মধু অর্ডার করব'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 11. Return, Refund & Safety (ভেঙে গেলে, রিটার্ন)
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
      'পছন্দ না হলে',
      'return policy',
      'return',
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
      reply:
        'পার্সেল পাওয়ার সময় জারের কোনো ক্ষতি হলে বা মানে ত্রুটি থাকলে আমরা সাথে সাথে ফ্রি রিপ্লেসমেন্ট পাঠাই অথবা ১০০% টাকা রিফান্ড দিই! সম্পূর্ণ বাঘের নিশ্চয়তা! 🛡️',
      characterState: 'proud',
      quickReplies: ['📞 হেল্পলাইন নম্বর', '🍯 খাঁটি মধু দেখব', '🛒 কার্ট দেখাও'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 12. Contact, Phone, Office & Customer Care (যোগাযোগ)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'কাস্টমার কেয়ার',
      'ফোন নম্বর',
      'মোবাইল নম্বর',
      'নাম্বার',
      'কথা বলতে চাই',
      'মানুষের সাথে কথা',
      'হোয়াটসঅ্যাপ',
      'অফিস কোথায়',
      'ঠিকানা',
      'দোকান কোথায়',
      'হেল্পলাইন',
      'customer care',
      'helpline',
      'phone number',
      'number',
      'contact',
      'call',
      'whatsapp',
      'wp',
      'imo',
      'address',
      'location',
      'office',
      'kotha bolbo',
      'hotline',
    ])
  ) {
    return {
      reply: `আমাদের সরাসরি হেল্পলাইন: ${deliveryConfig.supportPhone} (ঠিকানা: শ্যামনগর রোড, সাতক্ষীরা সদর)। সকাল ৯টা থেকে রাত ১০টা পর্যন্ত কল বা হোয়াটসঅ্যাপে কথা বলতে পারেন! 📞`,
      characterState: 'saluting',
      isFallback: true,
      quickReplies: ['📦 অর্ডার ট্র্যাক করব', '🍯 খাঁটি মধু দেখাও', '🎁 কম্বো অফার'],
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 13. Specific Product Searches (মধু, ঘি, তেল, সন্দেশ, আচার, ইত্যাদি)
  // ─────────────────────────────────────────────────────────────
  if (
    hasAny(text, [
      'মধু',
      'মদু',
      'খলসী',
      'খলসি',
      'কালোজিরা',
      'গরান',
      'কেওড়া',
      'বনমধু',
      'সুন্দরবনের মধু',
      'honey',
      'raw honey',
      'modhu',
      'modu',
      'madhu',
      'khalisha',
      'khalshi',
      'khalsi',
      'kalojira',
      'goran',
      'bonmodhu',
    ])
  ) {
    return {
      reply:
        'সুন্দরবনের ১০০% কাঁচা অপরিশোধিত খলসী ও কালোজিরা মধু! এক চামচেই মুখের সুবাস আর শরীরের রোগ প্রতিরোধ ক্ষমতা বাড়বে 🍯',
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
      'ঘী',
      'গাওয়া ঘি',
      'বিলোনা ঘি',
      'গরুর ঘি',
      'দানাদার ঘি',
      'ghee',
      'ghi',
      'bilona ghee',
      'gawa ghee',
      'cow ghee',
      'danadar ghee',
    ])
  ) {
    return {
      reply:
        'সাতক্ষীরার দেশি গরুর দই মন্থন করে শত বছরের প্রাচীন বিলোনা পদ্ধতিতে তৈরি দানাদার খাঁটি গাওয়া ঘি! 🧈 গরম ভাতে স্বাদ অতুলনীয়!',
      characterState: 'praising',
      products: [formatCard('traditional-bilona-pure-cow-ghee')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🍯 মধুর সাথে কম্বো', '🚚 ফ্রি ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'সরিষার তেল',
      'সরিষা',
      'তেল',
      'ঘানি',
      'কাঠের ঘানি',
      'mustard oil',
      'oil',
      'sorishar tel',
      'sorisha',
      'tel',
      'ghani vanga tel',
      'cooking oil',
    ])
  ) {
    return {
      reply:
        'কাঠের ঘানি ভাঙা মাঘী সরিষার তেল 🌿 ঝাঁজালো প্রাকৃতিক ঘ্রাণ আর খাঁটি পুষ্টিতে ভর্তা-খিচুড়ির স্বাদ দশগুণ বাড়বে!',
      characterState: 'praising',
      products: [formatCard('cold-pressed-mustard-oil-ghani')].filter(Boolean),
      quickReplies: ['👉 তেল কার্টে যোগ করব', '🧈 গাওয়া ঘি', '🎁 মেগা কম্বো'],
    };
  }

  if (
    hasAny(text, [
      'সন্দেশ',
      'সন্দেষ',
      'মিষ্টি',
      'ক্ষীর সন্দেশ',
      'ক্ষীর',
      'sandesh',
      'shondesh',
      'sondesh',
      'kheer sandesh',
      'sweet',
      'mishti',
      'misti',
    ])
  ) {
    return {
      reply:
        'সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ 🥛 খাঁটি ছানা ও গাঢ় ক্ষীরে তৈরি, মুখে দিলেই মাখনের মতো মিলিয়ে যাবে!',
      characterState: 'praising',
      products: [formatCard('satkhira-heritage-kheer-sandesh')].filter(Boolean),
      quickReplies: ['👉 সন্দেশ কার্টে নেব', '🍯 সুন্দরবনের মধু', '🛒 কার্ট দেখাও'],
    };
  }

  if (
    hasAny(text, [
      'আচার',
      'চুইঝাল',
      'চুই ঝাল',
      'আমের আচার',
      'বরই আচার',
      'রসুন আচার',
      'মশলা',
      'pickle',
      'achar',
      'aachar',
      'chui jhal',
      'chuijhal',
      'chui',
      'masala',
    ])
  ) {
    return {
      reply:
        'খাঁটি সরিষার তেলে সংরক্ষিত জিভে জল আনা দেশি ঘরোয়া আচার ও চুইঝাল 🌶️ মুখের স্বাদ ও রুচি ফেরাতে সেরা!',
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
      'প্যাকেজ',
      'combo',
      'mega combo',
      'family pack',
      'package',
      'bundle',
      'pack',
    ])
  ) {
    return {
      reply:
        'সবচেয়ে জনপ্রিয় মেগা ফ্যামিলি কম্বো 🎁 মধু + ঘি + সরিষার তেল একসাথে নিয়ে ২০০ টাকা সাশ্রয় আর সারা দেশে ফ্রি ডেলিভারি উপভোগ করুন!',
      characterState: 'happy',
      products: [formatCard('satkhira-sundarbans-mega-family-combo')].filter(Boolean),
      quickReplies: ['👉 এখনই অর্ডার করুন', '🚚 ফ্রি ডেলিভারি পাব?', 'ক্যাশ অন ডেলিভারি'],
    };
  }

  if (
    hasAny(text, [
      'চিয়া সিড',
      'চিয়া',
      'মরিঙ্গা',
      'সুপারফুড',
      'বীজ',
      'সজনে পাতা',
      'chia',
      'chia seed',
      'moringa',
      'superfood',
      'seed',
    ])
  ) {
    return {
      reply:
        'আমদানিকৃত প্রিমিয়াম অর্গানিক চিয়া সিড ও খাঁটি মরিঙ্গা পাউডার 🌱 ওজন নিয়ন্ত্রণ ও সার্বিক ফিটনেসে সেরা সমাধান!',
      characterState: 'praising',
      products: [
        formatCard('premium-organic-chia-seeds'),
        formatCard('organic-moringa-leaf-powder-premium'),
      ].filter(Boolean),
      quickReplies: ['👉 চিয়া সিড নেব', '🌿 মরিঙ্গা পাউডার', 'ডেলিভারি চার্জ'],
    };
  }

  if (
    hasAny(text, [
      'কি কি প্রডাক্ট',
      'কি কি প্রোডাক্ট',
      'কী কী পণ্য',
      'পণ্য তালিকা',
      'তালিকা',
      'সব পণ্য',
      'সব প্রোডাক্ট',
      'মেনু',
      'ক্যাটালগ',
      'সব খাবার',
      'কি কি পাওয়া যায়',
      'কি কি আছে',
      'product list',
      'all products',
      'products',
      'menu',
      'catalog',
      'items',
      'ki ki ache',
      'ki ki ase',
      'ki ki pawa jay',
      'ki pawa jay',
    ])
  ) {
    return {
      reply:
        'সাতক্ষীরা ঘরের সব সেরা উপহার রেডি আছে! সুন্দরবনের মধু, বিলোনা ঘি, ঘানি ভাঙা তেল, ক্ষীর সন্দেশ ও ঘরোয়া আচার—কোনটি দেখতে চান? 🌾',
      characterState: 'greeting',
      products: [
        formatCard('sundarbans-pure-khalsi-honey'),
        formatCard('traditional-bilona-pure-cow-ghee'),
        formatCard('satkhira-heritage-kheer-sandesh'),
      ].filter(Boolean),
      quickReplies: [
        '🍯 সুন্দরবনের মধু',
        '🧈 খাঁটি গাওয়া ঘি',
        '🌿 সরিষার তেল',
        '🥛 ক্ষীর সন্দেশ',
        '🌶️ আচার ও চুইঝাল',
      ],
    };
  }

  // Not matched locally -> delegate to backend / LLM
  return null;
}