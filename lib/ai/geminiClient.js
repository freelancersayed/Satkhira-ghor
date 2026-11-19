/**
 * Gemini AI Core Client for Satkhira Ghor
 * Powered by Google Gemini API (gemini-3.5-flash-lite)
 * Supports Autonomous Tool Calling, Multi-turn History, and System Instructions
 */

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Execute a single prompt or multi-turn tool-calling loop with Gemini
 * @param {Object} options
 * @param {string} options.systemInstruction - Persona & instructions
 * @param {string} options.userMessage - Current user prompt
 * @param {Array} [options.history=[]] - Past messages [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {Array} [options.tools=[]] - Declarations for tool calling
 * @param {Function} [options.toolDispatcher] - Async executor for tools: async (toolName, toolArgs) => result
 * @param {number} [options.maxTurns=3] - Max recursion turns for tool resolution
 */
export async function executeGeminiWithTools({
  systemInstruction,
  userMessage,
  userMedia = null,
  history = [],
  tools = [],
  toolDispatcher = null,
  maxTurns = 3,
}) {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY পাওয়া যায়নি! অনুগ্রহ করে Vercel ড্যাশবোর্ডের Settings -> Environment Variables এ GEMINI_API_KEY যুক্ত করুন।');
  }

  const endpoint = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // Build request conversation contents
  const contents = [...history];
  if (userMessage || userMedia) {
    const parts = [];
    if (userMessage) {
      parts.push({ text: userMessage });
    }
    if (userMedia && userMedia.data) {
      parts.push({
        inlineData: {
          mimeType: userMedia.mimeType || 'image/jpeg',
          data: userMedia.data,
        },
      });
    }
    contents.push({
      role: 'user',
      parts,
    });
  }

  const executedToolsRecord = [];
  let turn = 0;

  while (turn < maxTurns) {
    turn++;

    const payload = {
      contents,
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    if (tools && tools.length > 0) {
      payload.tools = [
        {
          function_declarations: tools,
        },
      ];
    }

    const controller = new AbortController();
    // 60-second timeout for robust multimodal vision & tool calling processing
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (netErr) {
      clearTimeout(timeoutId);
      if (controller.signal.aborted) {
        throw new Error('Gemini এআই সার্ভারে প্রসেসিংয়ের সময়সীমা (Timeout) অতিক্রম করেছে। অনুগ্রহ করে ছোট সাইজের ছবি ব্যবহার করুন বা পুনরায় চেষ্টা করুন।');
      }
      throw new Error(`Gemini নেটওয়ার্ক এরর: ${netErr.message}`);
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error [${res.status}]: ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];

    if (!candidate || !candidate.content) {
      throw new Error('Gemini কোনো বৈধ রেসপন্স প্রদান করেনি।');
    }

    const parts = candidate.content.parts || [];
    const functionCallPart = parts.find((p) => p.functionCall);

    // If Gemini decided to call a function/tool
    if (functionCallPart && functionCallPart.functionCall && toolDispatcher) {
      const { name: toolName, args: toolArgs } = functionCallPart.functionCall;

      // Add model's tool call turn to contents (keep all parts including thoughtSignature)
      contents.push({
        role: 'model',
        parts: candidate.content.parts,
      });

      // Execute the tool locally
      let toolResult;
      try {
        toolResult = await toolDispatcher(toolName, toolArgs || {});
      } catch (err) {
        toolResult = { error: `টুল এক্সিকিউশনে সমস্যা: ${err.message}` };
      }

      executedToolsRecord.push({
        name: toolName,
        args: toolArgs,
        result: toolResult,
      });

      // Provide tool output back to Gemini (Gemini requires role: 'user' for functionResponse)
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: toolName,
              response: toolResult,
            },
          },
        ],
      });

      // Continue to next turn so Gemini can form the final text using the tool output
      continue;
    }

    // No function call: Extract final text response
    const textPart = parts.find((p) => p.text);
    const finalText = textPart ? textPart.text.trim() : '';

    return {
      text: finalText,
      executedTools: executedToolsRecord,
      model: GEMINI_MODEL,
    };
  }

  return {
    text: 'তথ্য সংগ্রহ সম্পন্ন হয়েছে।',
    executedTools: executedToolsRecord,
    model: GEMINI_MODEL,
  };
}
