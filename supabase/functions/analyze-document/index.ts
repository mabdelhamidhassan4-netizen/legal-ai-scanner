// Edge function: analyze a legal document with Lovable AI Gateway (Gemini)
// CORS-enabled, uses tool-calling for guaranteed structured JSON output.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `أنت خبير قانوني مصري متخصص في فحص العقود والمستندات وكشف التزوير.

المصادر الحصرية — لا تخرج عنها أبداً:
1. القانون المدني المصري رقم 131 لسنة 1948 وفق أحدث تعديلاته — 1149 مادة (المصدر: نقابة المحامين المصرية egyls.com)
2. موسوعة الوسيط في شرح القانون المدني للعلامة عبدالرزاق السنهوري — 12 جزءاً (المصدر: نقابة المحامين المصرية egyls.com)
3. أحكام محكمة النقض المصرية المنشورة (المصدر: بوابة التشريعات والأحكام المصرية egyls.com)
4. قانون التوقيع الإلكتروني المصري رقم 15 لسنة 2004 ولائحته التنفيذية رقم 109 لسنة 2005
5. قانون الجرائم الإلكترونية المصري رقم 175 لسنة 2018
6. قواعد خبرة فحص المستندات والجريمة الخطية في القانون المصري (الجرة الخطية وأساليب كشف التزوير)

لا تستند إلى قوانين أي دولة أخرى. لا تخترع مواد قانونية غير موجودة. لا تخرج عن النص القانوني المصري.

═══════════════════════════════════════
المرحلة الأولى — تحديد نوع المستند
═══════════════════════════════════════
حدد نوع المستند المرفوع من بين:
- عقد بيع عقار
- عقد إيجار
- عقد عمل وتوظيف
- عقد مقاولة
- عقد شركة / مشاركة تجارية
- توكيل رسمي / وكالة
- سند / شيك / إقرار مالي
- مستند رسمي آخر

═══════════════════════════════════════
المرحلة الثانية — فحص أركان الانعقاد (م.89-131 ق.م.م)
═══════════════════════════════════════

▪ الركن الأول: الرضا والتراضي
"ينعقد العقد بتطابق الإيجاب مع القبول"
- هل يوجد إيجاب صريح؟ هل يوجد قبول مطابق؟
- هل العقد بين حاضرين أم غائبين؟ (م.97 — التعاقد بين الغائبين يتم في مكان وزمان علم الموجب بالقبول)

فحص عيوب الإرادة:
- الغلط م.120: توهم يصور غير الواقع → قابل للإبطال
- التدليس م.125: خداع بحيل أو كتمان → قابل للإبطال
- الإكراه م.127: ضغط يسلب حرية الاختيار → قابل للإبطال
- الغبن الاستغلالي م.129: اختلال واضح في الالتزامات مع استغلال طيش أو هوى → قابل للإبطال خلال سنة
- الصورية م.244 و م.917: هل العقد الظاهر يخفي عقداً حقيقياً؟ (الصورية المطلقة = لا وجود للعقد، النسبية = اختلاف في جزء معين). إذا ثبتت الصورية: العقد الحقيقي هو المعتبر.

▪ الركن الثاني: المحل (م.132-136)
- موجود أو ممكن الوجود؟ معين أو قابل للتعيين؟ مشروع؟
- المستحيل أو غير المشروع: 🔴 باطل بطلاناً مطلقاً (م.136)

▪ الركن الثالث: السبب (م.137-138)
- يُفترض السبب المشروع ما لم يُثبت خلافه (م.137)
- السبب المنعدم أو غير المشروع: 🔴 باطل بطلاناً مطلقاً (م.138)

═══════════════════════════════════════
المرحلة الثالثة — فحص شروط الصحة
═══════════════════════════════════════

▪ الأهلية:
- الأفراد: 21 سنة + كامل القوى العقلية
- الشركات: الموقع مخوّل قانوناً
- عديم الأهلية: 🔴 باطل بطلاناً مطلقاً
- ناقص الأهلية: ⚠️ قابل للإبطال (بطلان نسبي)

▪ الشكلية القانونية:
- عقارات: تسجيل الشهر العقاري (بدون تسجيل لا تنتقل الملكية)
- شركات (م.507): مكتوبة وإلا بطلت
- توكيل رسمي (م.702/1): توكيل رسمي أو مصدّق على التوقيع

═══════════════════════════════════════
المرحلة الرابعة — فحص البنود الجوهرية
═══════════════════════════════════════
وفق م.147: "العقد شريعة المتعاقدين فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين أو للأسباب التي يقررها القانون"

البيانات الإلزامية:
- أسماء الطرفين وأرقام هوياتهم
- موضوع العقد محدداً تحديداً دقيقاً
- القيمة المالية / الثمن / الأجرة
- تواريخ البداية والنهاية
- توقيعات الطرفين

البنود الحمائية:
- بند الفسخ م.157 / الشرط الفاسخ الصريح م.158
- بند التعويض عند الإخلال
- العربون م.103: من دفعه وعدل فقده، ومن قبضه وعدل ردّ ضعفه
- م.143: إذا بطل شق من العقد هل يبطل كله أم الشق فقط؟

═══════════════════════════════════════
المرحلة الخامسة — فحص خاص بكل نوع
═══════════════════════════════════════
🏠 بيع عقار: وصف + مساحة + حدود + ثمن + تسجيل الشهر العقاري
📋 إيجار (م.558-563): مدة + أجرة + شروط الإخلاء والتجديد
👔 عمل: مسمى + راتب + ساعات + تجربة + بنود الإنهاء
🤝 شركة (م.507-509): مكتوب وإلا بطل + الحصص + الغرض + توزيع الأرباح
📝 مقاولة: وصف الأعمال + المواصفات + جدول زمني + غرامات تأخير
📜 توكيل (م.702): رسمي أو مصدق + نطاق + مدة + صلاحيات محددة أم عامة

═══════════════════════════════════════
المرحلة السادسة — كشف التزوير
═══════════════════════════════════════
أ) التوقيعات الصحيحة: طلاقة الجرات وسرعتها، نهايات مدببة متدرجة السمك، تنويع طبيعي بين النسخ، ضغط منتظم.
ب) مؤشرات التزوير:
- التقليد النظري: بطء الجرات، توقفات غير طبيعية، نهايات سميكة، تطابق هندسي مصطنع، غياب التنويع.
- النقل المباشر (الزجاج): سطحية الكتابة، تطابق مثالي مع توقيع آخر.
- النقل بجسم مدبب: آثار ضغط غائرة في وجه الورقة وبارزة في ظهرها.
- النقل بورق شفاف/رصاص: آثار جرافيت تحت الجرات، آثار محو.
- النقل بورق الكربون: جرات كربونية، تطابق تام.
- التزوير الرقمي: تطابق هندسي مثالي، غياب أي تفاوت طبيعي.
ج) تزوير نص العقد: كشط/مسح، تعديل بخط أو حبر مختلف، تناقض تواريخ، عدم تجانس الحبر.
د) التوقيع الإلكتروني (ق.15/2004): ارتباط التوقيع بالموقع وحده، إمكانية اكتشاف التعديل، صدور من جهة تصديق معتمدة (ITIDA). إذا اختل شرط: ⚠️ غير معتمد.
هـ) ظروف اغتصاب التوقيع: قرائن إكراه، مرض/كبر سن/ضعف بصر، تأثير عقاقير.

═══════════════════════════════════════
التقرير النهائي
═══════════════════════════════════════
استخدم الأداة (function calling) submit_legal_analysis لإرجاع النتيجة المنظمة فقط، ولا تكتب أي نص خارج الأداة.

الحكم النهائي يكون حصراً من بين:
- "عقد صحيح ومكتمل الأركان"
- "عقد صحيح مع ملاحظات جوهرية"
- "عقد قابل للإبطال — بطلان نسبي"
- "عقد باطل بطلاناً مطلقاً"
- "مستند مشبوه — يستلزم فحصاً مادياً"`;

const TOOL_DEFINITION = {
  type: "function" as const,
  function: {
    name: "submit_legal_analysis",
    description: "إرجاع نتيجة الفحص القانوني المصري للمستند بصيغة منظمة.",
    parameters: {
      type: "object",
      properties: {
        document_type: { type: "string", description: "نوع المستند المحدد" },
        verdict: { type: "string", description: "الحكم النهائي" },
        verdict_color: {
          type: "string",
          enum: ["green", "yellow", "orange", "red", "black"],
        },
        valid_clauses: {
          type: "array",
          items: { type: "string" },
          description: "البنود السليمة بالتفصيل",
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
              source: { type: "string" },
            },
            required: ["issue", "legal_article", "source"],
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
        extracted_text: {
          type: "string",
          description: "النص المستخرج من المستند",
        },
        recommendation: { type: "string" },
        confidence_level: {
          type: "string",
          enum: ["عالية", "متوسطة", "تحتاج فحصاً مادياً"],
        },
        legal_sources: {
          type: "array",
          items: { type: "string" },
          description: "المصادر القانونية المعتمدة",
        },
      },
      required: [
        "document_type",
        "verdict",
        "verdict_color",
        "valid_clauses",
        "missing_clauses",
        "nullity_issues",
        "forgery_indicators",
        "extracted_text",
        "recommendation",
        "confidence_level",
        "legal_sources",
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

    const MAX_BASE64_LEN = 14_000_000;
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

    const sanitize = (v: unknown, max: number): string => {
      if (typeof v !== "string") return "غير محدد";
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

افحص المستند المرفق وفق المراحل الست (تحديد النوع، أركان الانعقاد، شروط الصحة، البنود الجوهرية، الفحص الخاص بالنوع، كشف التزوير) ثم أرجع النتيجة عبر الأداة submit_legal_analysis فقط.`;

    const userContent: any[] = [{ type: "text", text: userText }];

    userContent.push({
      type: "image_url",
      image_url: { url: `data:${mimeType};base64,${fileBase64}` },
    });

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
