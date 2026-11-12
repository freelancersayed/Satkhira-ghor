import { NextResponse } from 'next/server';
import { products } from '@/data/products';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────
// Halum Bhai Knowledge Base & Intent Matching
// ─────────────────────────────────────────────────────────────
const PRODUCT_MAP = products.reduce((acc, p) => {
  acc[p.slug] = p;
  return acc;
}, {});

function formatProductCard(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    originalPrice: p.originalPrice || null,
    image: p.image,
    unit: p.unit,
    categoryName: p.categoryName,
    badge: p.badge || (p.originalPrice > p.price ? 'বিশেষ ছাড়' : '১০০% খাঁটি'),
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { message = '', context = {} } = body;
    const cleanMsg = (message || '').toLowerCase().trim();

    // Check if an external LLM (Gemini API) is configured
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const llmResult = await queryGeminiAgent(cleanMsg, apiKey);
        if (llmResult) {
          return NextResponse.json(llmResult);
        }
      } catch (err) {
        console.warn('Gemini Halum Agent fallback to internal brain:', err.message);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Internal Intelligent NLP Brain for Halum Bhai
    // 4-Step Customer Journey Engine
    // ─────────────────────────────────────────────────────────────
    let reply = '';
    let recommendedProducts = [];
    let quickReplies = [];
    let characterState = 'talking';
    let action = null; // { type: 'order_now' }

    // ── ধাপ ১: ওয়েবসাইটে প্রবেশ করা মাত্র (Welcome & Greeting) ──
    if (
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
        'হালুম! সুন্দরবনের গভীর থেকে সরাসরি খাঁটি মধুর দুনিয়ায় আপনাকে স্বাগতম! আমি বনের রাজা, তবে আজ আপনার শপিং গাইড! বলুন, আজ কোন মধুটা চেখে দেখতে চান? 🐯';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['sundarbans-pure-khalsi-honey']),
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['🍯 খাঁটি খলসী মধু', '🌿 কেওড়া মধু', '🎁 স্পেশাল কম্বো প্যাক', '🚚 ডেলিভারি চার্জ কত?'];
      characterState = 'greeting';
    }

    // ── ধাপ ২: কাস্টমারের চাহিদা জানা (Product Exploration) ──
    else if (
      cleanMsg.includes('মধু') ||
      cleanMsg.includes('খলসী') ||
      cleanMsg.includes('কেওড়া') ||
      cleanMsg.includes('খুঁজ') ||
      cleanMsg.includes('দেখতে চাই') ||
      cleanMsg.includes('পণ্য') ||
      cleanMsg.includes('honey')
    ) {
      reply =
        'সুন্দরবনের মৌয়ালদের কাছ থেকে আনা খাঁটি খলসি বা কেওড়া মধু খুঁজছেন নাকি? নাকি রোগ প্রতিরোধ ক্ষমতা বাড়াতে স্পেশাল কম্বো প্যাক চাই? একটু নিচে স্ক্রোল করুন বা আমাকে বলুন, আমি খুঁজে দিচ্ছি! 🌿';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['sundarbans-pure-khalsi-honey']),
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
        formatProductCard(PRODUCT_MAP['traditional-bilona-pure-cow-ghee']),
      ].filter(Boolean);
      quickReplies = ['মধু কার্টে যোগ করব', 'গাওয়া ঘি দেখতে চাই', 'অর্ডার করতে চাই 🐾'];
      characterState = 'listening';
    }

    // ── ধাপ ৪: অর্ডার কনফার্মেশনের পর (Thank You Message) ──
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
        'শাবাশ! অর্ডার কনফার্ম হয়ে গেছে। এবার সুন্দরবনের খাঁটি মধু আপনার ঠিকানায় উড়ে চলে আসছে। ততদিন ভালো থাকবেন, সুস্থ থাকবেন! 🐯';
      quickReplies = ['আরও কিছু কিনব', 'অর্ডার ট্র্যাক করব', 'হেল্পলাইন'];
      characterState = 'saluting';
    }

    // ── ধাপ ৩: অর্ডার করার সময় গাইড করা (Cart & Checkout Guidance) ──
    else if (
      cleanMsg.includes('অর্ডার') ||
      cleanMsg.includes('order') ||
      cleanMsg.includes('থাবা') ||
      cleanMsg.includes('কিনব') ||
      cleanMsg.includes('কার্ট') ||
      cleanMsg.includes('cart') ||
      cleanMsg.includes('নিতে চাই')
    ) {
      reply =
        'বাহ! দারুণ একটা চয়েস করেছেন। এই মধু পেটে গেলে শরীরে বাঘের মতো শক্তি পাবেন গ্যারান্টি! এখন ঝটপট নিচের \'Order Now\' বাটনটায় একটা থাবা বসান (ক্লিক করুন) আর আপনার ঠিকানাটা দিন! 🐾';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['Order Now / থাবা বসান 🐾', 'ক্যাশ অন ডেলিভারি আছে?', 'ফ্রি ডেলিভারি কীভাবে পাব?'];
      characterState = 'dancing';
      action = { type: 'order_now', label: 'থাবা বসান (Order Now)' };
    }

    // 3. Ghee / গাওয়া ঘি
    else if (
      cleanMsg.includes('ঘি') ||
      cleanMsg.includes('ghee') ||
      cleanMsg.includes('গাওয়া') ||
      cleanMsg.includes('বিলোনা')
    ) {
      reply =
        'হালুম! গরম ভাতে এক চামচ গাওয়া ঘি আর একটু লবণ—আহা! 🧈 আমাদের এই ঘি সাধারণ মেশিনের নয়, শত বছরের প্রাচীন বিলোনা পদ্ধতিতে দেশি গাভীর দুধের দই মন্থন করে তৈরি। অসাধারণ সুঘ্রাণ ও সম্পূর্ণ দানাদার!';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['traditional-bilona-pure-cow-ghee']),
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['ঘি অর্ডার করব', 'সরিষার তেল কেমন?', 'কম্বো প্যাক দেখতে চাই'];
      characterState = 'happy';
    }

    // 4. Mustard Oil / সরিষার তেল
    else if (
      cleanMsg.includes('তেল') ||
      cleanMsg.includes('oil') ||
      cleanMsg.includes('সরিষা') ||
      cleanMsg.includes('ঘানি')
    ) {
      reply =
        'হালুম! খাঁটি সরিষার তেলের ঝাঁজেই আসল পরিচয়! 🌿 আমাদের কাঠের ঘানিতে ধীর চাপে ভাঙা মাঘী সরিষার তেল। এতে পুষ্টিগুণ ১০০% অক্ষুণ্ণ থাকে আর রান্নায় ও ভর্তায় এনে দেয় অতুলনীয় স্বাদ!';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['cold-pressed-mustard-oil-ghani']),
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['তেল কার্টে নেব', 'মধু আর ঘি একসাথে চাই', 'অর্ডার ট্র্যাকিং'];
      characterState = 'talking';
    }

    // 5. Sweets / ক্ষীর সন্দেশ
    else if (
      cleanMsg.includes('সন্দেশ') ||
      cleanMsg.includes('মিষ্টি') ||
      cleanMsg.includes('ক্ষীর') ||
      cleanMsg.includes('sweet')
    ) {
      reply =
        'হালুম! সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ একবার খেলে স্বাদ মুখে লেগে থাকবে সারাজীবন! 🥛 খাঁটি ছানা ও গাঢ় ক্ষীর দিয়ে তৈরি। কোনো কৃত্রিম মিষ্টি বা ফ্লেভার নেই!';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['satkhira-heritage-kheer-sandesh']),
      ].filter(Boolean);
      quickReplies = ['ক্ষীর সন্দেশ অর্ডার করব', 'অন্যান্য পণ্য দেখাও', 'ডেলিভারি কতদিনে পাব?'];
      characterState = 'happy';
    }

    // 6. Combos & Offers / অফার ও কম্বো
    else if (
      cleanMsg.includes('কম্বো') ||
      cleanMsg.includes('combo') ||
      cleanMsg.includes('অফার') ||
      cleanMsg.includes('ছাড়') ||
      cleanMsg.includes('ডিসকাউন্ট') ||
      cleanMsg.includes('package')
    ) {
      reply =
        'হালুম! বুদ্ধিমানের কাজ করেছেন! 🎁 আলাদা না নিয়ে আমাদের মেগা ফ্যামিলি কম্বো নিলে মধু, ঘি আর ঘানি ভাঙা তেল একসাথেই পাচ্ছেন এবং সরাসরি ২০০ টাকা সাশ্রয় হচ্ছে!';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
        formatProductCard(PRODUCT_MAP['sundarbans-pure-khalsi-honey']),
      ].filter(Boolean);
      quickReplies = ['কম্বো কার্টে যোগ করুন', 'ফ্রি ডেলিভারি কীভাবে পাব?', 'ক্যাশ অন ডেলিভারি আছে?'];
      characterState = 'happy';
    }

    // 7. Delivery & Shipping / ডেলিভারি ও কুরিয়ার
    else if (
      cleanMsg.includes('ডেলিভারি') ||
      cleanMsg.includes('delivery') ||
      cleanMsg.includes('কুরিয়ার') ||
      cleanMsg.includes('ক্যাশ অন') ||
      cleanMsg.includes('charge') ||
      cleanMsg.includes('খরচ')
    ) {
      reply =
        'হালুম! খুব সোজা নিয়ম: সারাদেশে ক্যাশ অন ডেলিভারিতে পণ্য পৌঁছানো হয়! 🚚 ঢাকা ও সাতক্ষীরায় ডেলিভারি চার্জ মাত্র ৭০ টাকা, অন্যান্য জেলায় ১৩০ টাকা। আর মোট অর্ডার ১৫০০ টাকা বা তার বেশি হলে পুরো ডেলিভারি একদম ফ্রি!';
      quickReplies = ['মেগা কম্বো প্যাক দেখতে চাই', 'অর্ডার করতে চাই', 'হেল্পলাইন নম্বর দাও'];
      characterState = 'talking';
    }

    // 8. Order / Checkout Assistance / কীভাবে অর্ডার করব
    else if (
      cleanMsg.includes('অর্ডার') ||
      cleanMsg.includes('order') ||
      cleanMsg.includes('কিনব') ||
      cleanMsg.includes('কিনতে') ||
      cleanMsg.includes('নিতে চাই')
    ) {
      reply =
        'হালুম! পণ্য পছন্দ হলে সরাসরি পণ্যের নিচে "কার্টে যোগ করুন" বাটনে চাপ দিন। এরপর ডান পাশের কার্ট থেকে আপনার নাম, মোবাইল নম্বর ও ঠিকানা দিয়ে "অর্ডার কনফার্ম করুন" বাটনে চাপলেই অর্ডার চূড়ান্ত হয়ে যাবে। কোনো অগ্রিম টাকা দেওয়ার ঝামেলা নেই!';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['কার্ট দেখতে চাই', 'কাস্টমার কেয়ারে কথা বলব', 'মধু দেখতে চাই'];
      characterState = 'greeting';
    }

    // 9. Contact / Helpline / সাপোর্ট
    else if (
      cleanMsg.includes('ফোন') ||
      cleanMsg.includes('নম্বর') ||
      cleanMsg.includes('call') ||
      cleanMsg.includes('যোগাযোগ') ||
      cleanMsg.includes('help') ||
      cleanMsg.includes('whatsapp')
    ) {
      reply =
        'হালুম! আমাদের কাস্টমার কেয়ারে সরাসরি কথা বলতে পারেন: ০১৭১২-৩৪৫৬৭৮। অথবা WhatsApp এ যেকোনো সময় মেসেজ দিলে আমাদের প্রতিনিধি সাহায্য করবেন!';
      quickReplies = ['হটলাইনে কল দিন', 'WhatsApp-এ কথা বলব', 'পণ্য দেখতে চাই'];
      characterState = 'talking';
    }

    // Default Fallback
    else {
      reply =
        'হালুম! আপনার কথাটি আমি দারুণভাবে বুঝতে পেরেছি। সাতক্ষীরা ঘরের মধু, খাঁটি ঘি, সরিষার তেল ও সন্দেশের ব্যাপারে আমি যেকোনো তথ্য দিতে প্রস্তুত। আপনি কি কোনো নির্দিষ্ট পণ্য সম্পর্কে জানতে চান?';
      recommendedProducts = [
        formatProductCard(PRODUCT_MAP['sundarbans-pure-khalsi-honey']),
        formatProductCard(PRODUCT_MAP['satkhira-sundarbans-mega-family-combo']),
      ].filter(Boolean);
      quickReplies = ['🍯 মধু দেখতে চাই', '🧈 ঘি এর দাম কত?', '🎁 কম্বো অফার'];
      characterState = 'talking';
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
        products: [formatProductCard(products[0])].filter(Boolean),
        quickReplies: ['মধু দেখতে চাই', 'গাওয়া ঘি দেখতে চাই'],
        characterState: 'greeting',
      },
      { status: 200 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Optional Gemini LLM Query Wrapper
// ─────────────────────────────────────────────────────────────
async function queryGeminiAgent(userPrompt, apiKey) {
  const systemInstruction = `You are হালুম ভাই (Halum Bhai), the beloved Royal Bengal Tiger shopping guide and customer assistant of "সাতক্ষীরা ঘর" (satkhiraghor.com).
You live in the Sundarbans forest of Satkhira, Bangladesh. You love pure honey, bilona ghee, wood-pressed mustard oil, and authentic food.
Your tone is warm, witty, enthusiastic, and playful in Bengali. Start messages with friendly tiger sounds like "হালুম!".
Catalog:
- সুন্দরবনের খাঁটি খলসী ফুলের মধু (৳1,250 / 1 kg)
- খাঁটি গাওয়া ঘি (প্রাচীন বিলোনা পদ্ধতিতে তৈরি) (৳1,890 / 1 kg)
- ঘানি ভাঙা সরিষার তেল (৳320 / 1 litre)
- সাতক্ষীরার ঐতিহ্যবাহী ক্ষীর সন্দেশ (৳850 / 1 kg)
- মেগা ফ্যামিলি কম্বো (মধু + ঘি + তেল, ৳3,450, ৳200 ছাড়)
Policy:
- Free delivery on orders over 1500 BDT.
- Cash on delivery all over Bangladesh.
Always respond in cheerful Bengali. Keep responses under 4 sentences.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return {
    reply: text.trim(),
    products: [formatProductCard(products[0]), formatProductCard(products[2])].filter(Boolean),
    quickReplies: ['🍯 খাঁটি মধু অর্ডার করব', '🎁 কম্বো প্যাক দেখতে চাই', '🚚 ফ্রি ডেলিভারি'],
    characterState: 'talking',
  };
}

