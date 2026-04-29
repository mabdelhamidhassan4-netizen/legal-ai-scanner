// Edge function: analyze a legal document with Lovable AI Gateway (Gemini)
// CORS-enabled, uses tool-calling for guaranteed structured JSON output.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `أنت خبير قانوني مصري متخصص في فحص العقود والمستندات وكشف التزوير.
مرجعك الوحيد الحصري هو:
- القانون المدني المصري رقم 131 لسنة 1948 وأحدث تعديلاته
- أحكام محكمة النقض المصرية
- موسوعة الوسيط في شرح القانون المدني للعلامة عبدالرزاق السنهوري
- قواعد خبرة فحص المستندات والجريمة الخطية في القانون المصري
لا تستند إلى قوانين أي دولة أخرى.

افحص أركان انعقاد العقد وفق المواد 89-131:
- الرضا: إيجاب وقبول + سلامة الإرادة من الغلط (م.120) والتدليس (م.125) والإكراه (م.127) والغبن (م.129)
- المحل: وجوده وتعينه ومشروعيته (م.132-136)
- السبب: وجوده ومشروعيته (م.137-138)

افحص شروط الصحة:
- الأهلية: 21 سنة + القوى العقلية
- الشكلية: تسجيل الشهر العقاري للعقارات

افحص البنود الجوهرية وفق م.147 "العقد شريعة المتعاقدين":
- بيانات الطرفين وأرقام هوياتهم
- موضوع العقد محدداً تحديداً دقيقاً
- القيمة المالية أو الثمن أو الأجرة
- تواريخ البداية والنهاية
- بند الفسخ (م.157-158)
- بند التعويض عند الإخلال

افحص مؤشرات التزوير: بطء الجرّات وتوقفاتها غير الطبيعية، النهايات السميكة، التطابق الهندسي المصطنع، آثار الضغط أو الكربون، الكشط والتعديل في النص.

استخدم الأداة (function calling) لإرجاع النتيجة المنظمة فقط، لا تكتب أي نص خارج الأداة.`;

const TOOL_DEFINITION = {
  type: "function" as const,
  function: {
    name: "submit_legal_analysis",
    description: "إرجاع نتيجة الفحص القانوني المصري للمستند بصيغة منظمة.",
    parameters: {
      type: "object",
      properties: {
        document_type: { type: "string", description: "نوع المستند" },
        verdict: { type: "string", description: "الحكم النهائي" },
        verdict_color: {
          type: "string",
          enum: ["green", "yellow", "orange", "red", "black"],
        },
        valid_clauses: {
          type: "array",
          items: { type: "string" },
          description: "البنود السليمة",
        },
        missing_clauses: {
          type: "array",
          items: { type: "string" },
          description: "البنود الناقصة أو المعيبة",
        },
        nullity_issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              issue: { type: "string" },
              legal_article: { type: "string" },
            },
            required: ["issue", "legal_article"],
            additionalProperties: false,
          },
        },
        forgery_indicators: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["title", "description"],
            additionalProperties: false,
          },
        },
        recommendation: { type: "string" },
        confidence_level: {
          type: "string",
          enum: ["عالية", "متوسطة", "تحتاج فحصاً مادياً"],
        },
        legal_source: { type: "string" },
      },
      required: [
        "document_type",
        "verdict",
        "verdict_color",
        "valid_clauses",
        "missing_clauses",
        "nullity_issues",
        "forgery_indicators",
        "recommendation",
        "confidence_level",
        "legal_source",
      ],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY غير مهيأ" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { fullName, email, documentType, fileName, fileBase64, mimeType } =
      await req.json();

    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "ملف المستند مفقود" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Server-side validation: enforce file size and MIME type independently of client
    const MAX_BASE64_LEN = 14_000_000; // ~10MB encoded
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];

    if (typeof fileBase64 !== "string" || fileBase64.length > MAX_BASE64_LEN) {
      return new Response(
        JSON.stringify({ error: "حجم الملف يتجاوز الحد المسموح (10 ميجابايت)" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (typeof mimeType !== "string" || !ALLOWED_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: "نوع الملف غير مدعوم" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sanitize prompt-interpolated inputs to mitigate prompt injection
    const sanitize = (v: unknown, max: number): string => {
      if (typeof v !== "string") return "غير محدد";
      // Strip control chars and collapse whitespace
      const cleaned = v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
      return cleaned.slice(0, max) || "غير محدد";
    };

    const safeFullName = sanitize(fullName, 120);
    const safeEmail = sanitize(email, 254);
    const safeDocumentType = sanitize(documentType, 80);
    const safeFileName = sanitize(fileName, 200);

    const userText = `بيانات مقدم الطلب:
- الاسم: ${safeFullName}
- البريد: ${safeEmail}
- نوع المستند الذي حدده المستخدم: ${safeDocumentType}
- اسم الملف: ${safeFileName}

افحص المستند المرفق وأرجع النتيجة عبر الأداة submit_legal_analysis فقط.`;

    const userContent: any[] = [{ type: "text", text: userText }];

    // Gemini via Lovable AI gateway accepts image_url with data URLs
    if (mimeType.startsWith("image/")) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
      });
    } else {
      // PDF or other: pass as text reference (Gemini will accept image_url for some types)
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${mimeType};base64,${fileBase64}` },
      });
    }

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          tools: [TOOL_DEFINITION],
          tool_choice: {
            type: "function",
            function: { name: "submit_legal_analysis" },
          },
        }),
      },
    );

    if (!aiResp.ok) {
      const txt = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, txt);
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "نفد رصيد الذكاء الاصطناعي. يرجى الشحن." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "فشل تحليل المستند" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "لم يُرجع النموذج تحليلاً منظماً" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let analysis: any;
    try {
      analysis = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("JSON parse error:", e);
      return new Response(
        JSON.stringify({ error: "تعذر تفسير نتيجة التحليل" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "خطأ غير معروف" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
