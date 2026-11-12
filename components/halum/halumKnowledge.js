// ─────────────────────────────────────────────────────────────
// Halum Mama Context-Aware Knowledge & Route Intelligence
// ─────────────────────────────────────────────────────────────
import { products } from '@/data/products';
import { deliveryConfig } from '@/lib/deliveryConfig';

export const PRODUCT_PRAISES = {
  'sundarbans-pure-khalsi-honey': {
    title: 'খাঁটি খলসী মধু',
    origin: 'গভীর সুন্দরবন, শ্যামনগর, সাতক্ষীরা',
    dialogue:
      'হালুম! এই খলসী মধু সুন্দরবনের আসল সোনা 🍯 শ্যামনগরের মৌয়ালরা গভীর জঙ্গল থেকে পেরে এনেছে। এক চামচেই বাঘের মতো শক্তি পাবেন! অর্ডার করতে নিচে থাবা বসাও! 🐾👇',
    funTip: 'মধু খেয়ে বাঘের মতো গর্জন দিন! ১০০% কাঁচা ও প্রাকৃতিক!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🍯 ১ কেজি কার্টে নেব', '🧈 বিলোনা ঘি এর দাম'],
  },
  'traditional-bilona-pure-cow-ghee': {
    title: 'বিলোনা গাওয়া ঘি',
    origin: 'তালা ও কলারোয়া উপজেলা, সাতক্ষীরা',
    dialogue:
      'আহা! শত বছরের প্রাচীন বিলোনা গাওয়া ঘি 🧈 দেশি গরুর দই মন্থন করে তৈরি। গরম ভাতে একটু পড়লেই সারা ঘর সুঘ্রাণে মেতে উঠবে! খাঁটি দানাদার স্বাদ নিতে থাবা দিন!',
    funTip: 'ঘি আর গরম ভাত—জিভে জল চলে না এসে যায় কোথায়!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🧈 ঘি কার্টে নেব', '🍯 মধুর সাথে কম্বো'],
  },
  'cold-pressed-mustard-oil-ghani': {
    title: 'ঘানি ভাঙা সরিষার তেল',
    origin: 'আশাশুনি ও দেবহাটা, সাতক্ষীরা',
    dialogue:
      'হালুম! কাঠের ঘানি ভাঙা খাঁটি মাঘী সরিষার তেল 🌿 এই তেলের আসল ঝাঁজেই জাত চেনা যায়! ভর্তা-খিচুড়িতে খাঁটি স্বাদ পেতে এখনি থাবা বসান!',
    funTip: 'কোনো কেমিক্যাল রিফাইনিং নেই—কোল্ড প্রেসড ঝাঁজালো পুষ্টি!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🌿 তেল কার্টে নেব', '🎁 মেগা কম্বো প্যাক'],
  },
  'satkhira-heritage-kheer-sandesh': {
    title: 'ঐতিহ্যবাহী ক্ষীর সন্দেশ',
    origin: 'সাতক্ষীরা সদর ও তালা',
    dialogue:
      'সাতক্ষীরার খাঁটি ক্ষীর সন্দেশ 🥛 মুখে দেওয়া মাত্রই মাখনের মতো গলে যাবে! গরুর খাঁটি ছানা ও গাঢ় ক্ষীরে তৈরি। টাটকা খেতে এখনি অর্ডার করুন!',
    funTip: 'আজই বানিয়ে আজই পাঠানো হয়—টাটকা মিষ্টির কোনো বিকল্প নেই!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🥛 সন্দেশ কার্টে নেব', '🍯 মধু দেখতে চাই'],
  },
  'sundarbans-kalojira-flower-honey': {
    title: 'কালোজিরা ফুলের মধু',
    origin: 'সুন্দরবন ও সাতক্ষীরা কৃষি বলয়',
    dialogue:
      'হালুম! কালোজিরা ফুলের মধু মানেই দ্বিগুণ রোগ প্রতিরোধ ক্ষমতা! 🍯 কালোজিরার মহাঔষধি গুণ আর প্রাকৃতিক মধুর মিশেল। সুস্থ থাকতে এখনই থাবা দিন!',
    funTip: 'কালোজিরা মধু আর গরম পানি—সকালের সেরা এনার্জি ড্রিংক!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🍯 কালোজিরা মধু নেব', 'কার্ট দেখতে চাই'],
  },
  'satkhira-sundarbans-mega-family-combo': {
    title: 'মেগা ফ্যামিলি কম্বো',
    origin: 'সাতক্ষীরা ঘর স্পেশাল কালেকশন',
    dialogue:
      `হালুম! সব চেয়ে বুদ্ধিমানের সেরা চয়েস 🎁 মধু + ঘি + সরিষার তেল একসাথে পাচ্ছেন! ২০০ টাকা সাশ্রয় আর সারা দেশে ফ্রি ডেলিভারি! এখনই থাবা বসান!`,
    funTip: 'আলাদা কেনার চেয়ে কম্বো নিলে পকেট ও পেট দুটোই খুশি!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🎁 কম্বো কার্টে যোগ', 'ক্যাশ অন ডেলিভারি'],
  },
  'premium-organic-chia-seeds': {
    title: 'অর্গানিক চিয়া সিড',
    origin: 'আমদানিকৃত প্রিমিয়াম গ্রেড',
    dialogue:
      'হালুম! ফিটনেস ও ওজনের সচেতনতায় সেরা বন্ধু চিয়া সিড 🌱 ওমেগা-৩ আর ফাইবারে ভরপুর। শরীর চনমনে রাখতে এখনই নিয়ে নিন!',
    funTip: 'সুপারফুড দিয়ে দিন শুরু করুন, শরীর রাখবে চনমনে!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🌱 চিয়া সিড কার্টে নেব', 'মরিঙ্গা পাউডার'],
  },
  'sundarbans-natural-goran-raw-honey': {
    title: 'গরান ফুলের মধু',
    origin: 'গভীর সুন্দরবনের গহিন অরণ্য',
    dialogue:
      'গভীর সুন্দরবনের গরান ফুলের লালচে প্রাকৃতিক মধু 🍯 অ্যান্টিঅক্সিডেন্টে ভরপুর ও তীব্র সুবাস। আসল বুনো স্বাদ নিতে এখনই থাবা দিন!',
    funTip: '১০০% কাঁচা অপরিশোধিত মধু—প্রাকৃতিক এনজাইমে ভরপুর!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🍯 গরান মধু নেব', 'খলসী মধু কেমন?'],
  },
  'homemade-garlic-mustard-pickle': {
    title: 'ঘরোয়া রসুন আচার',
    origin: 'ঘরোয়া খামার, সাতক্ষীরা',
    dialogue:
      'হালুম! খাঁটি সরিষার তেলে জাড়ানো দেশি রসুনের ঝাঁজালো আচার 🌶️ মুখের রুচি ফিরিয়ে আনবে নিমেষেই! ঝটপট নিয়ে নিন!',
    funTip: 'কোনো প্রিজারভেটিভ নেই—ঘরোয়া খাঁটি রেসিপি!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🌶️ আচার কার্টে যোগ', 'সরিষার তেল'],
  },
  'sundarbans-plum-mango-pickle': {
    title: 'টক-ঝাল-মিষ্টি বরই ও আমের আচার',
    origin: 'কালিগঞ্জ, সাতক্ষীরা',
    dialogue:
      'জিভে জল আনা টক-ঝাল-মিষ্টি দেশি কুল ও কাঁচা আমের আচার 🌶️ খাঁটি সরিষার তেলে মাখানো ঘরোয়া স্বাদ! ডাল-ভাতের সাথে এক চামচেই শান্তি!',
    funTip: 'কোনো প্রিজারভেটিভ নেই—১০০% খাঁটি ঘরোয়া রেসিপি!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🌶️ আচার কার্টে যোগ', 'ঘানি ভাঙা সরিষার তেল'],
  },
  'organic-moringa-leaf-powder-premium': {
    title: 'অর্গানিক মরিঙ্গা পাউডার',
    origin: 'সাতক্ষীরার দেশি সজিনা বাগান',
    dialogue:
      'সবুজের মহাঔষধ সজিনা পাতার প্রিমিয়াম মরিঙ্গা পাউডার 🌿 ৩০০+ রোগের প্রাকৃতিক প্রতিরোধক! প্রতিদিনের সুস্থতায় এখনি অর্ডার করুন!',
    funTip: 'প্রতিদিন এক চামচ মরিঙ্গা—সুস্থ জীবনের সহজ গোপন সূত্র!',
    state: 'pointing',
    chips: ['👉 এখনই অর্ডার করুন', '🌿 মরিঙ্গা নেব', 'চিয়া সিড কেমন?'],
  },
};

/**
 * Omniscient Dynamic Product Pitch Engine
 * Resolves product details by slug, ID, or fallback
 */
export function getHalumProductKnowledge(slugOrId) {
  if (!slugOrId) return null;

  // 1. Direct match in static praises
  if (PRODUCT_PRAISES[slugOrId]) {
    const praise = PRODUCT_PRAISES[slugOrId];
    const catalogItem = products.find(
      (p) => p.slug === slugOrId || p.id === slugOrId
    );
    if (catalogItem) {
      const savings = catalogItem.originalPrice
        ? Number(catalogItem.originalPrice) - Number(catalogItem.price)
        : 0;
      return {
        ...praise,
        productId: catalogItem.id,
        slug: catalogItem.slug,
        price: catalogItem.price,
        originalPrice: catalogItem.originalPrice,
        savings,
        unit: catalogItem.unit,
        origin: catalogItem.origin || praise.origin,
      };
    }
    return praise;
  }

  // 2. Search by slug or ID in global products list
  const p = products.find(
    (item) => item.slug === slugOrId || item.id === slugOrId
  );
  if (p) {
    const savings = p.originalPrice ? Number(p.originalPrice) - Number(p.price) : 0;
    const originText = p.origin ? `সরাসরি ${p.origin} থেকে সংগৃহীত। ` : '';
    const savingsText = savings > 0 ? ` (সাশ্রয় ৳${savings}!)` : '';

    return {
      title: p.name,
      origin: p.origin || 'সাতক্ষীরা ও সুন্দরবন',
      productId: p.id,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      savings,
      unit: p.unit,
      dialogue: `হালুম! এই খাঁটি ${p.name} তো আসল প্রাকৃতিক রত্ন! ${originText}মাত্র ৳${p.price} মূল্যে পাচ্ছেন${savingsText}। বাঘের মতো বল পেতে নিচে থাবা বসাও! 🐾👇`,
      funTip: `${p.shortDescription || '১০০% খাঁটি ও প্রাকৃতিক উপাদানে তৈরি!'}`,
      state: 'pointing',
      chips: ['👉 এখনই অর্ডার করুন', `🍯 ${p.unit} কার্টে নেব`, 'ডেলিভারি চার্জ কত?'],
    };
  }

  return null;
}

export const ROUTE_INTELLIGENCE = {
  '/': {
    greeting:
      'হালুম! সুন্দরবনের খাঁটি মধুর দুনিয়ায় আপনাকে স্বাগতম! আমি হালুম মামা—বনের রাজা ও আপনার শপিং গাইড! আজ কোন খাঁটি খাবারটা চেখে দেখবেন? 🐯',
    funTip: 'সাতক্ষীরা ঘরে কোনো ভেজালের কারবার নেই—সবই ১০০% প্রাকৃতিক!',
    state: 'greeting',
    chips: ['🍯 সুন্দরবনের মধু', '🧈 খাঁটি গাওয়া ঘি', '🎁 মেগা কম্বো অফার', '🚚 ডেলিভারি চার্জ কত?'],
  },
  '/shop': {
    greeting:
      'হালুম! সাতক্ষীরা ঘরের পুরো খাঁটি ভাণ্ডার আপনার সামনে 🌿 মধু, বিলোনা ঘি ও ক্ষীর সন্দেশ—যা খুঁজছেন আমাকে বলুন, ঝটপট এনে দিচ্ছি!',
    funTip: `৳${deliveryConfig.freeDeliveryThreshold} টাকার পণ্য নিলেই ডেলিভারি একদম ফ্রি!`,
    state: 'listening',
    chips: ['🍯 মধু দেখতে চাই', '🧈 ঘি এর দাম', '🎁 কম্বো প্যাক', '🌱 সুপারফুড'],
  },
  '/cart': {
    greeting:
      'বাহ! দারুণ সব খাঁটি খাবার বেছে নিয়েছেন 🐾 এখন ঝটপট নিচের ফর্মটিতে ঠিকানা দিন আর অর্ডার কনফার্ম করুন! বাঘের গতিতে পৌঁছে যাবে! 🐾👇',
    funTip: 'ক্যাশ অন ডেলিভারি আছে—পণ্য হাতে পেয়ে টাকা পরিশোধ করুন!',
    state: 'pointing',
    chips: ['👉 অর্ডার নিশ্চিত করুন (থাবা বসান 🐾)', 'ক্যাশ অন ডেলিভারি নিয়ম', 'আরও কিছু কিনব'],
  },
  '/track-order': {
    greeting:
      'পার্সেল ট্র্যাক করছেন? একদম নিশ্চিন্ত থাকুন! সুন্দরবন থেকে খাঁটি খাবার বাঘের গতিতে আপনার ঠিকানায় ছুটে আসছে! 🚚💨',
    funTip: 'আমাদের ডেলিভারি টিম খুব যত্ন সহকারে কাঁচের জার প্যাক করে!',
    state: 'saluting',
    chips: ['লাইভ স্ট্যাটাস', 'কাস্টমার কেয়ার নম্বর', 'নতুন অর্ডার করব'],
  },
  '/about': {
    greeting:
      'আমাদের গল্প শুনছেন? আমরা সরাসরি সাতক্ষীরার কৃষক ও মৌয়ালদের হাত থেকে সেরা প্রাকৃতিক খাদ্য সম্ভার আপনার পরিবারের জন্য সংগ্রহ করি! 🌿',
    funTip: 'খাদ্যে ভেজালমুক্ত বাংলাদেশ গড়তেই আমাদের এই অঙ্গীকার!',
    state: 'greeting',
    chips: ['পণ্য দেখতে চাই', 'মধু কীভাবে সংগ্রহ হয়?', 'যোগাযোগ করুন'],
  },
  '/about-us': {
    greeting:
      'আমাদের গল্প শুনছেন? আমরা সরাসরি সাতক্ষীরার কৃষক ও মৌয়ালদের হাত থেকে সেরা প্রাকৃতিক খাদ্য সম্ভার আপনার পরিবারের জন্য সংগ্রহ করি! 🌿',
    funTip: 'খাদ্যে ভেজালমুক্ত বাংলাদেশ গড়তেই আমাদের এই অঙ্গীকার!',
    state: 'greeting',
    chips: ['পণ্য দেখতে চাই', 'মধু কীভাবে সংগ্রহ হয়?', 'যোগাযোগ করুন'],
  },
};

// Fun Tiger Jokes & Witty Bangla Quips to Delight Shoppers
export const TIGER_WITTY_QUIPS = [
  'বাঘের পেটে যেমন ক্ষুধা, সাতক্ষীরার মধুতে তেমন সুধা! 🍯',
  'ভেজাল খাবার খেলে পেটের গর্জন, খাঁটি খাবারে বাঘের মতো অর্জন! 🐯',
  `৳${deliveryConfig.freeDeliveryThreshold} টাকার অর্ডার করলেই ডেলিভারি চার্জ একদম জিরো! 🚚`,
  'বিলোনা ঘিয়ের ঘ্রাণে বাঘও বনের রাজা ছেড়ে ডাইনিং টেবিলে বসে যায়! 🧈',
  'ঝাঁজালো সরিষার তেলে ভর্তা বানালে প্রতিবেশীর জিভেও জল আসবে! 🌿',
];
