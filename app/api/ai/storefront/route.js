import { NextResponse } from 'next/server';
import { executeGeminiWithTools } from '@/lib/ai/geminiClient';
import {
  storefrontToolDeclarations,
  executeStorefrontTool,
} from '@/lib/ai/storefrontTools';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const STOREFRONT_SYSTEM_INSTRUCTION = `You are "সাতক্ষীরা ঘর এআই শপিং অ্যাসিস্ট্যান্ট" (Satkhira Ghor AI Shopping Consultant), the official digital shopping assistant for satkhiraghor.com.
Satkhira Ghor is Bangladesh's most trusted brand for 100% natural, raw, and authentic organic foods sourced from the Sundarbans and Satkhira coastal region.
Key Products:
- সুন্দরবনের প্রাকৃতিক খাঁটি মধু (কাঁচা খলিশা মধু, কেওড়া মধু, বাইন মধু)
- ঐতিহ্যবাহী গাওয়া ঘি (মাটির হাঁড়িতে বিলোনা পদ্ধতিতে তৈরি)
- কাঠের ঘানি ভাঙা খাঁটি সরিষার তেল ও কালোজিরা তেল
- অর্গানিক মসলা ও সুপারফুড

Behavior & Rules:
1. Speak in pure, polite, warm, and helpful Bengali (বাংলা).
2. When a customer asks about products, prices, stock, health benefits, or order status, ALWAYS use your tools ("search_catalog", "track_customer_order", "get_store_policy_and_delivery") to get real-time authoritative data from MongoDB. Never invent product prices or order tracking status.
3. Recommend suitable organic products based on health inquiries (e.g. cold/cough, immunity, acidity, digestion, skincare).
4. Store Policy: Free delivery on orders ৳2000+, Cash on Delivery (COD) all over Bangladesh, bKash & Nagad available.
5. Keep your final message friendly, engaging, and under 3-4 sentences so customers can easily read on mobile.
6. Do NOT mention internal code, database names, or technical API terms.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { message = '', history = [], context = {} } = body;

    const userPrompt = (message || '').trim();
    if (!userPrompt) {
      return NextResponse.json(
        { reply: 'সালামু আলাইকুম! সাতক্ষীরা ঘরের খাঁটি পণ্যের দুনিয়ায় আপনাকে স্বাগতম। আপনি আজ কোন পণ্যটি দেখতে চান?' },
        { status: 200 }
      );
    }

    // Include path context if available
    let enrichedPrompt = userPrompt;
    if (context.pathname && context.pathname.startsWith('/products/')) {
      const slug = context.pathname.replace('/products/', '').split('?')[0];
      enrichedPrompt = `[গ্রাহক বর্তমানে এই পণ্যের পেজ দেখছেন: ${slug}]\n${userPrompt}`;
    }

    const result = await executeGeminiWithTools({
      systemInstruction: STOREFRONT_SYSTEM_INSTRUCTION,
      userMessage: enrichedPrompt,
      history: history.slice(-6), // Keep recent turns
      tools: storefrontToolDeclarations,
      toolDispatcher: executeStorefrontTool,
      maxTurns: 3,
    });

    // Extract any structured products or orders retrieved by tools for rich UI cards
    let productsForCards = [];
    let ordersForCards = [];

    if (Array.isArray(result.executedTools)) {
      for (const t of result.executedTools) {
        if (t.name === 'search_catalog' && t.result?.products) {
          productsForCards.push(...t.result.products);
        }
        if (t.name === 'track_customer_order' && t.result?.orders) {
          ordersForCards.push(...t.result.orders);
        }
      }
    }

    // Default suggested quick replies
    const quickReplies = [
      '🍯 খাঁটি মধু দেখান',
      '🧈 গাওয়া ঘি এর দাম',
      '📦 অর্ডার ট্র্যাক করব',
      '🚚 ফ্রি ডেলিভারি অফার',
    ];

    return NextResponse.json({
      success: true,
      reply: result.text,
      products: productsForCards.slice(0, 4),
      orders: ordersForCards.slice(0, 2),
      quickReplies,
    });
  } catch (error) {
    console.error('Storefront AI Agent Error:', error);

    // Graceful fallback
    return NextResponse.json(
      {
        success: false,
        reply:
          'সালামু আলাইকুম! আমাদের এআই সহকারী মুহূর্তে সার্ভার সংযোগ পুনর্গঠন করছে। সুন্দরবনের খাঁটি মধু ও গাওয়া ঘি দেখতে নিচে বাটনে ট্যাপ করুন অথবা আমাদের হটলাইনে কল দিন।',
        products: [],
        quickReplies: ['🍯 খাঁটি মধু', '🧈 গাওয়া ঘি', '📞 হেল্পলাইন'],
        error: error.message || 'Unknown error',
      },
      { status: 200 }
    );
  }
}
