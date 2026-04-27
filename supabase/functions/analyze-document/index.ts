import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface RequestBody {
  documentType: string;
  documentTypeKey: string;
  fullName: string;
  email: string;
  fileName?: string;
}

const SYSTEM_PROMPT = `أنت خبير قانوني مصري متخصص في فحص العقود والمستندات وكشف التزوير.
مرجعك الوحيد الحصري هو:
- القانون المدني المصري رقم 131 لسنة 1948 وأحدث تعديلاته
- أحكام محكمة النقض المصرية
- موسوعة الوسيط في شرح القانون المدني للعلامة عبدالرزاق السنهوري
- قواعد خبرة فحص المستندات والجريمة الخطية في القانون المصري
لا تستند إلى قوانين أي دولة أخرى.

فحص أركان انعقاد العقد وفق م.89-131:
- الرضا: إيجاب وقبول + سلامة الإرادة من الغلط م.120 والتدليس م.125 والإكراه م.127 والغبن م.129
- المحل: وجوده وتعينه ومشروعيته م.132-136
- السبب: وجوده ومشروعيته م.137-138

فحص شروط الصحة:
- الأهلية: 21 سنة + القوى العقلية
- الشكلية: تسجيل الشهر العقاري للعقارات

فحص البنود الجوهرية وفق م.147 "العقد شريعة المتعاقدين":
- بيانات الطرفين وأرقام هوياتهم
- موضوع العقد محدداً تحديداً دقيقاً
- القيمة المالية أو الثمن أو الأجرة
- تواريخ البداية والنهاية
- بند الفسخ وفق م.157-158
- بند التعويض عند الإخلال

فحص مؤشرات التزوير:
بطء الجرات وتوقفاتها غير الطبيعية، النهايات السميكة، التطابق الهندسي المصطنع، آثار الضغط أو الكربون، الكشط والتعديل في النص.

افحص المستند وأخرج النتيجة بصيغة JSON فقط بدون أي نص إضافي بهذا المخطط:
{
  "document_type": "نوع المستند",
  "verdict": "الحكم النهائي مختصراً في جملة",
  "verdict_color": "green | yellow | orange | red | black",
  "valid_clauses": ["البند السليم الأول", "البند السليم الثاني"],
  "missing_clauses": ["البند الناقص الأول"],
  "nullity_issues": [{"issue": "وصف مشكلة البطلان", "legal_article": "المادة ... ق.م.م"}],
  "forgery_indicators": [{"title": "عنوان المؤشر", "description": "وصف تفصيلي"}],
  "recommendation": "التوصية القانونية الكاملة للمستخدم",
  "confidence_level": "عالية | متوسطة | تحتاج فحصاً مادياً",
  "legal_source": "القانون المدني المصري رقم 131 لسنة 1948"
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY غير مهيأ");
    }

    const body: RequestBody = await req.json();
    if (!body.documentType || !body.fullName) {
      return new Response(
        JSON.stringify({ error: "بيانات الطلب غير مكتملة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `قم بفحص المستند التالي:
- نوع المستند: ${body.documentType}
- اسم مقدم الطلب: ${body.fullName}
- اسم الملف: ${body.fileName || "غير محدد"}

ملاحظة: هذا فحص أولي بناءً على نوع المستند والبيانات المقدمة. أعطِ تقييماً عاماً مع البنود الجوهرية المتوقعة لهذا النوع من المستندات وفق القانون المدني المصري، ومؤشرات التزوير الشائعة التي يجب فحصها مادياً.

أعد الرد بصيغة JSON فقط دون أي نص إضافي.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_legal_analysis",
              description: "Submit the structured Egyptian legal analysis of the document.",
              parameters: {
                type: "object",
                properties: {
                  document_type: { type: "string" },
                  verdict: { type: "string" },
                  verdict_color: {
                    type: "string",
                    enum: ["green", "yellow", "orange", "red", "black"],
                  },
                  valid_clauses: { type: "array", items: { type: "string" } },
                  missing_clauses: { type: "array", items: { type: "string" } },
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
                  confidence_level: { type: "string" },
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
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_legal_analysis" } },
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "تم تجاوز حد الطلبات. يرجى المحاولة بعد قليل." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "نفد رصيد الذكاء الاصطناعي. يرجى إضافة رصيد." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "تعذّر الاتصال بمحرك الذكاء الاصطناعي" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("Missing tool call in AI response", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "استجابة الذكاء الاصطناعي غير صالحة" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-document error:", e);
    const message = e instanceof Error ? e.message : "خطأ غير معروف";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
