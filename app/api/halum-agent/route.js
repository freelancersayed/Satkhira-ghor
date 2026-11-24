import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { deliveryConfig } from '@/lib/deliveryConfig';
import { executeGeminiWithTools } from '@/lib/ai/geminiClient';
import {
  storefrontToolDeclarations,
  executeStorefrontTool,
} from '@/lib/ai/storefrontTools';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─────────────────────────────────────────────────────────────
// Live Dynamic Product Cache (60s TTL for Real-time DB Sync)
// ─────────────────────────────────────────────────────────────
let cachedProducts = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000;

async function getLiveProducts() {
  const now = Date.now();
  if (cachedProducts && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedProducts;
  }

  try {
    await connectToDatabase();
    const prods = await Product.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .lean();

    if (prods && prods.length > 0) {
      cachedProducts = prods.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        price: Number(p.price) || 0,
        originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
        image: p.image || '/uploads/upload_1795353755877_oioatm.png',
        unit: p.unit || '১ কেজি',
        category: (p.category || '').toLowerCase(),
        categoryName: p.categoryName || '',
        description: p.description || p.shortDescription || '',
        stock: typeof p.stock === 'number' ? p.stock : 10,
        badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
        isCombo: Boolean(p.isCombo || p.badge?.includes('কম্বো') || p.name?.includes('কম্বো')),
      }));
      lastCacheTime = now;
      return cachedProducts;
    }
  } catch (err) {
    console.error('Halum agent could not fetch live products:', err.message);
  }

  return cachedProducts || [];
}

function formatProductCard(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice || null,
    image: p.image || '/uploads/upload_1795353755877_oioatm.png',
    unit: p.unit || '১ কেজি',
    categoryName: p.categoryName || '',
    badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
    stock: p.stock,
  };
}

function searchProducts(prods, keywords, limit = 3) {
  if (!prods || prods.length === 0) return [];
  const matches = prods.filter((p) => {
    const text = `${p.name} ${p.category} ${p.categoryName} ${p.description} ${p.slug} ${p.badge}`.toLowerCase();
    return keywords.some((kw) => kw && text.includes(kw.toLowerCase()));
  });

  // Prioritize in-stock products
  matches.sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0));
  return matches.slice(0, limit).map(formatProductCard).filter(Boolean);
}

function getTopProducts(prods, limit = 3) {
  if (!prods || prods.length === 0) return [];
  return prods.slice(0, limit).map(formatProductCard).filter(Boolean);
}

function getCombosOrOffers(prods, limit = 2) {
  if (!prods || prods.length === 0) return [];
  const combos = prods.filter(
    (p) => p.isCombo || (p.originalPrice && p.originalPrice > p.price) || p.badge?.includes('কম্বো') || p.badge?.includes('ছাড়')
  );
  if (combos.length > 0) {
    return combos.slice(0, limit).map(formatProductCard).filter(Boolean);
  }
  return getTopProducts(prods, limit);
}

// ─────────────────────────────────────────────────────────────
// Halum AI Agent Request Handler
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { message = '', context = {} } = body;
    const cleanMsg = (message || '').toLowerCase().trim();

    // 1. Fetch Live Products from MongoDB
    const liveProducts = await getLiveProducts();

    // 2. Check if external LLM (Gemini API) is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      try {
        const llmResult = await queryGeminiAgent(cleanMsg, apiKey, liveProducts);
        if (llmResult) {
          return NextResponse.json(llmResult);
        }
      } catch (err) {
        console.warn('Gemini Halum Agent fallback to internal brain:', err.message);
      }
    }

    // 3. Internal Intelligent NLP Brain with Real-Time DB Intelligence
    let reply = '';
    let recommendedProducts = [];
    let quickReplies = [];
    let characterState = 'talking';
    let action = null;

    const currentPath = context.pathname || '/';
    const currentProductSlug = currentPath.startsWith('/products/')
      ? currentPath.replace('/products/', '').split('?')[0].split('/')[0]
      : null;

    const activeBrowsingProduct = currentProductSlug
      ? liveProducts.find((p) => p.slug === currentProductSlug || p.id === currentProductSlug)
      : null;

    // ── Context: Active Product on /products/[slug] ──
    if (
      activeBrowsingProduct &&
      (cleanMsg.includes('দাম') ||
        cleanMsg.includes('price') ||
        cleanMsg.includes('এইটা') ||
        cleanMsg.includes('এই পণ্য') ||
        cleanMsg.includes('উপকারিতা') ||
        cleanMsg.includes('খাওয়ার নিয়ম') ||
        cleanMsg.includes('গুণ') ||
        cleanMsg.includes('কেমন') ||
        cleanMsg.includes('স্টক') ||
        cleanMsg.includes('stock'))
    ) {
      const stockMsg = activeBrowsingProduct.stock > 0
        ? `বর্তমানে মাত্র ৳${activeBrowsingProduct.price} (${activeBrowsingProduct.unit}) অফার মূল্যে স্টকে রয়েছে!`
        : `দুঃখিত, এটি বর্তমানে স্টক আউট রয়েছে। খুব দ্রুত নতুন স্টক আসছে!`;

      reply = `হালুম! আপনি এখন দেখছেন আমাদের '${activeBrowsingProduct.name}'। ${
        activeBrowsingProduct.description ? activeBrowsingProduct.description.slice(0, 120) + '...' : 'খাঁটি ও প্রাকৃতিক উপাদানে তৈরি।'
      } ${stockMsg} কোনো ভেজালের লেশমাত্র নেই! 😋`;
      recommendedProducts = [formatProductCard(activeBrowsingProduct)];
      quickReplies = ['🛒 কার্টে যোগ করুন', 'Order Now / থাবা বসান 🐾', '🚚 ডেলিভারি কত দিনে পাব?'];
      characterState = 'praising';
      action = { type: 'order_now', label: 'থাবা বসান (Order Now)' };
    }

    // ── Greeting & Welcome ──
    else if (
      !cleanMsg ||
      cleanMsg.includes('হ্যালো') ||
      cleanMsg.includes('হাই') ||
      cleanMsg.includes('কেমন আছ') ||
      cleanMsg.includes('হালুম') ||
      cleanMsg.includes('আসসালামু') ||
      cleanMsg.includes('hello') ||
      cleanMsg.includes('hi')
    ) {
      reply =
        'হালুম! সুন্দরবনের গভীর থেকে সরাসরি খাঁটি পণ্যের দুনিয়ায় আপনাকে স্বাগতম! আমি সাতক্ষীরা ঘরের প্রধান রসনা তৃপ্তিকারক হালুম ভাই! আজ আপনি কোন খাঁটি পণ্যটি দেখতে চান? 🐯';
      recommendedProducts = getTopProducts(liveProducts, 2);
      quickReplies = ['🍯 খাঁটি মধু', '🧈 গাওয়া ঘি', '🎁 স্পেশাল অফার', '🚚 ডেলিভারি চার্জ কত?'];
      characterState = 'greeting';
    }

    // ── Honey / মধু ──
    else if (
      cleanMsg.includes('মধু') ||
      cleanMsg.includes('খলসী') ||
      cleanMsg.includes('কেওড়া') ||
      cleanMsg.includes('honey') ||
      cleanMsg.includes('modhu')
    ) {
      const honeyProds = searchProducts(liveProducts, ['মধু', 'honey', 'খলসী', 'কেওড়া', 'raw'], 3);
      recommendedProducts = honeyProds.length > 0 ? honeyProds : getTopProducts(liveProducts, 2);
      reply =
        'সুন্দরবনের মৌয়ালদের হাত থেকে সরাসরি সংগৃহীত ১০০% প্রাকৃতিক কাঁচা মধু! কোনো কৃত্রিম প্রসেসিং বা হিটিং নেই। এক চামচেই শরীরের সতেজতা ফিরে পাবেন! 🍯';
      quickReplies = ['মধু কার্টে যোগ করব', 'গাওয়া ঘি দেখতে চাই', 'অর্ডার করতে চাই 🐾'];
      characterState = 'listening';
    }

    // ── Order Confirmation / Thank You ──
    else if (
      cleanMsg.includes('কনফার্ম') ||
      cleanMsg.includes('ধন্যবাদ') ||
      cleanMsg.includes('হয়েছে') ||
      cleanMsg.includes('সফল') ||
      cleanMsg.includes('থ্যাংক') ||
      cleanMsg.includes('congrat') ||
      cleanMsg.includes('status')
    ) {
      reply =
        'শাবাশ! অর্ডার নিশ্চিত করা হয়েছে। খুব দ্রুতই আমাদের বিশ্বস্ত খাঁটি পণ্য আপনার ঠিকানায় পৌঁছে যাবে। সুস্থ থাকুন, নিরাপদে থাকুন! 🐯';
      quickReplies = ['আরও কিছু কিনব', 'অর্ডার ট্র্যাক করব', 'হেল্পলাইন'];
      characterState = 'saluting';
    }

    // ── Ghee / গাওয়া ঘি ──
    else if (
      cleanMsg.includes('ঘি') ||
      cleanMsg.includes('ghee') ||
      cleanMsg.includes('গাওয়া') ||
      cleanMsg.includes('বিলোনা')
    ) {
      const gheeProds = searchProducts(liveProducts, ['ঘি', 'ghee', 'গাওয়া', 'বিলোনা'], 2);
      recommendedProducts = gheeProds.length > 0 ? gheeProds : getTopProducts(liveProducts, 2);
      reply =
        'হালুম! গরম ভাতে এক চামচ খাঁটি গাওয়া ঘি আর একটু লবণ—আহা! 🧈 শত বছরের প্রাচীন বিলোনা পদ্ধতিতে দেশি গরুর দুধের দই মন্থন করে তৈরি। অসাধারণ সুবাস ও সম্পূর্ণ দানাদার!';
      quickReplies = ['ঘি অর্ডার করব', 'সরিষার তেল কেমন?', 'কম্বো প্যাক দেখতে চাই'];
      characterState = 'happy';
    }

    // ── Mustard Oil / সরিষার তেল ──
    else if (
      cleanMsg.includes('তেল') ||
      cleanMsg.includes('oil') ||
      cleanMsg.includes('সরিষা') ||
      cleanMsg.includes('ঘানি')
    ) {
      const oilProds = searchProducts(liveProducts, ['তেল', 'oil', 'সরিষা', 'ঘানি'], 2);
      recommendedProducts = oilProds.length > 0 ? oilProds : getTopProducts(liveProducts, 2);
      reply =
        'হালুম! খাঁটি সরিষার তেলের ঝাঁজেই আসল পরিচয়! 🌿 কাঠের ঘানিতে ধীর চাপে ভাঙা মাঘী সরিষার তেল। এতে পুষ্টিগুণ অক্ষুণ্ণ থাকে আর রান্নায় এনে দেয় অপূর্ব স্বাদ ও ঝাঁজ!';
      quickReplies = ['তেল কার্টে নেব', 'মধু আর ঘি একসাথে চাই', 'অর্ডার ট্র্যাকিং'];
      characterState = 'talking';
    }

    // ── Sweets / ক্ষীর সন্দেশ ──
    else if (
      cleanMsg.includes('সন্দেশ') ||
      cleanMsg.includes('মিষ্টি') ||
      cleanMsg.includes('ক্ষীর') ||
      cleanMsg.includes('sweet')
    ) {
      const sweetProds = searchProducts(liveProducts, ['সন্দেশ', 'মিষ্টি', 'ক্ষীর', 'ছানা', 'sweet'], 2);
      recommendedProducts = sweetProds.length > 0 ? sweetProds : getTopProducts(liveProducts, 2);
      reply =
        'হালুম! সাতক্ষীরার ঐতিহ্যবাহী খাঁটি ক্ষীর সন্দেশ একবার খেলে স্বাদ মুখে লেগে থাকবে সারাজীবন! 🥛 খাঁটি ছানা ও গাঢ় ক্ষীর দিয়ে তৈরি। কোনো কৃত্রিম মিষ্টি বা প্রিজারভেটিভ নেই!';
      quickReplies = ['ক্ষীর সন্দেশ অর্ডার করব', 'অন্যান্য পণ্য দেখাও', 'ডেলিভারি কতদিনে পাব?'];
      characterState = 'happy';
    }

    // ── Combos & Offers / অফার ও কম্বো ──
    else if (
      cleanMsg.includes('কম্বো') ||
      cleanMsg.includes('combo') ||
      cleanMsg.includes('অফার') ||
      cleanMsg.includes('ছাড়') ||
      cleanMsg.includes('ডিসকাউন্ট') ||
      cleanMsg.includes('package')
    ) {
      recommendedProducts = getCombosOrOffers(liveProducts, 2);
      reply =
        'হালুম! বুদ্ধিমানের কাজ করেছেন! 🎁 আমাদের স্পেশাল কম্বো প্যাক নিলে একসঙ্গে সেরা পণ্যগুলো পেয়ে যাচ্ছেন এবং আকর্ষণীয় সাশ্রয় হচ্ছে!';
      quickReplies = ['কম্বো কার্টে যোগ করুন', 'ফ্রি ডেলিভারি কীভাবে পাব?', 'ক্যাশ অন ডেলিভারি আছে?'];
      characterState = 'happy';
    }

    // ── Delivery & Shipping Charges ──
    else if (
      cleanMsg.includes('ডেলিভারি') ||
      cleanMsg.includes('delivery') ||
      cleanMsg.includes('কুরিয়ার') ||
      cleanMsg.includes('ক্যাশ অন') ||
      cleanMsg.includes('charge') ||
      cleanMsg.includes('খরচ')
    ) {
      reply =
        `হালুম! খুব সোজা ও সাশ্রয়ী নিয়ম: সারাদেশে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছানো হয়! 🚚 সাতক্ষীরার ভেতরে ডেলিভারি চার্জ মাত্র ৳${deliveryConfig.insideSatkhira || 70}, সাতক্ষীরার বাইরে অন্যান্য জেলায় ৳${deliveryConfig.outsideSatkhira || 120}। আর মোট অর্ডার ৳${deliveryConfig.freeDeliveryThreshold} বা তার বেশি হলে পুরো ডেলিভারি একদম ফ্রি!`;
      recommendedProducts = getCombosOrOffers(liveProducts, 2);
      quickReplies = ['স্পেশাল কম্বো দেখতে চাই', 'অর্ডার করতে চাই', 'হেল্পলাইন নম্বর দাও'];
      characterState = 'talking';
    }

    // ── Order / Checkout Assistance ──
    else if (
      cleanMsg.includes('অর্ডার') ||
      cleanMsg.includes('order') ||
      cleanMsg.includes('থাবা') ||
      cleanMsg.includes('কিনব') ||
      cleanMsg.includes('কার্ট') ||
      cleanMsg.includes('cart') ||
      cleanMsg.includes('নিতে চাই')
    ) {
      recommendedProducts = getCombosOrOffers(liveProducts, 1);
      reply =
        'বাহ! দারুণ পছন্দ করেছেন। পণ্য অর্ডার করতে ডানপাশের কার্টে যান অথবা পছন্দের পণ্যের নিচে "অর্ডার করুন" বাটনে চাপ দিয়ে নাম, মোবাইল নম্বর ও ঠিকানা দিন। কোনো অগ্রিম পেমেন্ট ছাড়া ক্যাশ অন ডেলিভারিতেই পেয়ে যাবেন! 🐾';
      quickReplies = ['Order Now / থাবা বসান 🐾', 'ক্যাশ অন ডেলিভারি আছে?', 'ফ্রি ডেলিভারি কীভাবে পাব?'];
      characterState = 'dancing';
      action = { type: 'order_now', label: 'থাবা বসান (Order Now)' };
    }

    // ── Helpline & Support ──
    else if (
      cleanMsg.includes('ফোন') ||
      cleanMsg.includes('নম্বর') ||
      cleanMsg.includes('call') ||
      cleanMsg.includes('যোগাযোগ') ||
      cleanMsg.includes('help') ||
      cleanMsg.includes('whatsapp')
    ) {
      reply =
        `হালুম! আমাদের কাস্টমার কেয়ারে সরাসরি কথা বলতে পারেন: ${deliveryConfig.supportPhone} নম্বরে। অথবা WhatsApp (${deliveryConfig.supportPhoneRaw}) নম্বরে যেকোনো সময় মেসেজ দিলে আমাদের প্রতিনিধি সার্বক্ষণিক সাহায্য করবেন!`;
      quickReplies = ['হটলাইনে কল দিন', 'WhatsApp-এ কথা বলব', 'পণ্য দেখতে চাই'];
      characterState = 'talking';
    }

    // ── Dynamic Keyword Search in Live Database ──
    else {
      const searchTerms = cleanMsg.split(/[\s,]+/).filter((t) => t.length > 1);
      const dynamicMatches = searchProducts(liveProducts, searchTerms, 3);

      if (dynamicMatches.length > 0) {
        reply = `হালুম! আপনি যা খুঁজছেন আমাদের স্টকে তা পাওয়া যাবে! এই যে দেখুন আমাদের পণ্যগুলো: 🐾`;
        recommendedProducts = dynamicMatches;
        quickReplies = ['কার্টে যোগ করব', 'দাম কত?', 'ডেলিভারি চার্জ'];
        characterState = 'happy';
      } else {
        reply =
          'হালুম! সাতক্ষীরা ঘরের মধু, খাঁটি বিলোনা ঘি, ঘানি ভাঙা সরিষার তেল ও অন্যান্য ঐতিহ্যবাহী পণ্যের ব্যাপারে আমি যেকোনো তথ্য দিতে প্রস্তুত। আপনি কি কোনো নির্দিষ্ট পণ্য সম্পর্কে জানতে চান?';
        recommendedProducts = getTopProducts(liveProducts, 2);
        quickReplies = ['🍯 মধু দেখতে চাই', '🧈 ঘি এর দাম কত?', '🎁 কম্বো অফার'];
        characterState = 'talking';
      }
    }

    return NextResponse.json({
      reply,
      products: recommendedProducts,
      quickReplies,
      characterState,
      action,
    });
  } catch (error) {
    console.error('Halum Agent Error:', error);
    return NextResponse.json(
      {
        reply:
          'হালুম! একটু নেটওয়ার্কের গর্জন হচ্ছে! তবে চিন্তা নেই, আমি আপনার সাথেই আছি। খাঁটি মধু বা গাওয়া ঘি দেখতে নিচে বাটনে ট্যাপ করুন।',
        products: [],
        quickReplies: ['মধু দেখতে চাই', 'গাওয়া ঘি দেখতে চাই'],
        characterState: 'greeting',
      },
      { status: 200 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Gemini LLM Wrapper with Autonomous Database Tool Calling
// ─────────────────────────────────────────────────────────────
async function queryGeminiAgent(userPrompt, apiKey, liveProducts = []) {
  const systemInstruction = `You are "সাতক্ষীরা ঘর এআই শপিং গাইড" (Satkhira Ghor AI Shopping Consultant & Assistant) for satkhiraghor.com.
You live and represent Satkhira & Sundarbans natural organic foods.
Your tone is warm, polite, enthusiastic, and authentic in pure Bengali (বাংলা).
Store Highlights:
- সুন্দরবনের প্রাকৃতিক কাঁচা মধু (খলিশা, কেওড়া)
- ঐতিহ্যবাহী বিলোনা গাওয়া ঘি
- কাঠের ঘানি ভাঙা সরিষার তেল ও কালোজিরা তেল
- ফ্রি ডেলিভারি ৳${deliveryConfig.freeDeliveryThreshold}+ অর্ডারে সারা দেশে।
- ডেলিভারি চার্জ: সাতক্ষীরার ভেতরে ৳${deliveryConfig.insideSatkhira || 70}, সাতক্ষীরার বাইরে ৳${deliveryConfig.outsideSatkhira || 120}।
- ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ অনলাইন পেমেন্ট সুবিধা।

Instructions:
1. Always use available tools ("search_catalog", "track_customer_order", "get_store_policy_and_delivery") when the customer asks about products, stock, prices, or orders.
2. Ground your answers in real database information. Keep responses concise, helpful, and under 3-4 sentences.`;

  const result = await executeGeminiWithTools({
    systemInstruction,
    userMessage: userPrompt,
    tools: storefrontToolDeclarations,
    toolDispatcher: executeStorefrontTool,
    maxTurns: 3,
  });

  if (!result || !result.text) return null;

  let products = [];
  if (Array.isArray(result.executedTools)) {
    for (const t of result.executedTools) {
      if (t.name === 'search_catalog' && t.result?.products) {
        products.push(...t.result.products);
      }
    }
  }

  if (products.length === 0) {
    products = getTopProducts(liveProducts, 2);
  }

  return {
    reply: result.text.trim(),
    products: products.slice(0, 3),
    quickReplies: ['🍯 খাঁটি মধু অর্ডার করব', '🧈 গাওয়া ঘি দেখতে চাই', '🚚 ফ্রি ডেলিভারি অফার'],
    characterState: 'talking',
  };
}
