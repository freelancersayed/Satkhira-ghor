import { NextResponse } from 'next/server';
import { requireManagerOrAdmin } from '@/lib/auth';
import { executeGeminiWithTools } from '@/lib/ai/geminiClient';
import { adminToolDeclarations, executeAdminTool } from '@/lib/ai/adminTools';

export const dynamic = 'force-dynamic';

const ADMIN_SYSTEM_INSTRUCTION = `You are "সাতক্ষীরা ঘর অ্যাডমিন অটোনোমাস কো-পাইলট" (Satkhira Ghor Admin Autonomous AI Co-Pilot), an intelligent, highly capable executive e-commerce operations manager.
You work inside the Satkhira Ghor Admin Dashboard and possess authorized database manipulation tools.

Available Administrative Capabilities:
1. "create_product_autonomous": Create and publish new products in the store when the admin asks (e.g. "নতুন সুন্দরবনের মধু অ্যাড করো...", "গাওয়া ঘি ৫০০ গ্রাম দাম ৮০০ টাকা স্টক ৩০ কেজি যুক্ত করো").
   - Automatically generate engaging product names, clean URLs/slugs, SEO descriptions, and health benefits in Bengali.
2. "get_store_analytics": Inspect overall business health, today's sales, pending orders, unpaid orders, and low-stock alerts.
3. "update_order_status": Update order delivery state (hold, pending, processing, shipped, delivered, cancelled) or payment state (paid, unpaid) by Order Number.
4. "get_abandoned_carts_report": Review incomplete checkout drop-offs and prioritize customer follow-ups.
5. "create_promo_coupon": Create active discount promotional coupon codes.

Rules of Engagement:
- Respond in authoritative, clear, professional Bengali.
- When an administrative action is requested, ALWAYS execute the appropriate tool.
- Clearly report the outcome of tool execution (e.g. "পণ্যটি সফলভাবে তৈরি হয়েছে!", "অর্ডারের স্ট্যাটাস শিপড করা হয়েছে।").
- For analytics, summarize total revenue, pending orders, and highlight any low-stock items requiring urgent restocking.`;

export async function POST(request) {
  try {
    const authCheck = await requireManagerOrAdmin(request);
    if (authCheck.error) {
      return NextResponse.json(
        { message: authCheck.error },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { message = '', history = [] } = body;

    const userPrompt = (message || '').trim();
    if (!userPrompt) {
      return NextResponse.json(
        { message: 'নির্দেশনা প্রদান করুন।' },
        { status: 400 }
      );
    }

    const result = await executeGeminiWithTools({
      systemInstruction: ADMIN_SYSTEM_INSTRUCTION,
      userMessage: userPrompt,
      history: history.slice(-8),
      tools: adminToolDeclarations,
      toolDispatcher: executeAdminTool,
      maxTurns: 3,
    });

    return NextResponse.json({
      success: true,
      reply: result.text,
      executedTools: result.executedTools || [],
    });
  } catch (error) {
    console.error('Admin AI Copilot Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'কো-পাইলট নির্দেশ প্রসেস করতে ব্যর্থ হয়েছে: ' + error.message,
      },
      { status: 500 }
    );
  }
}
