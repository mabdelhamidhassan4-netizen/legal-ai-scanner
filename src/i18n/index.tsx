import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Lang = "ar" | "en";

const STORAGE_KEY = "legalai_lang";

export const translations = {
  ar: {
    appName: { pre: "Legal", post: "AI Scanner" },
    tagline: "أداة مساعدة بالذكاء الاصطناعي للفحص المبدئي للمستندات",
    langLabel: "اللغة",
    arabic: "العربية",
    english: "English",

    // Form
    fullName: "الاسم الثلاثي *",
    fullNamePlaceholder: "مثال: محمد أحمد السيد",
    fullNameHint: "يرجى إدخال الاسم الأول + اسم الأب + اسم العائلة",
    fullNameError: "يرجى إدخال الاسم الثلاثي كاملاً",
    email: "البريد الإلكتروني *",
    emailPlaceholder: "example@email.com",
    emailError: "يرجى إدخال بريد إلكتروني صحيح",
    documentType: "نوع المستند *",
    documentTypePlaceholder: "اختر نوع المستند",
    documentTypeError: "يرجى اختيار نوع المستند",
    upload: "تحميل المستند *",
    uploadCta: "اختر ملفاً أو التقط صورة",
    uploadHint: "PDF, JPG, PNG, JPEG — الحد الأقصى 10MB",
    uploadSelected: "تم اختيار",
    uploadRequired: "يرجى تحميل المستند المراد فحصه",
    uploadFormat: "الصيغة غير مدعومة (PDF, JPG, PNG)",
    uploadSize: "الحد الأقصى للحجم 10MB",
    submit: "بحث",
    submitting: "جارٍ التجهيز...",
    prepError: "حدث خطأ",
    prepErrorDesc: "تعذّر تجهيز الملف للتحليل",

    docTypes: [
      "عقد بيع عقار",
      "عقد إيجار",
      "عقد عمل وتوظيف",
      "عقد مقاولة",
      "عقد شركة / مشاركة تجارية",
      "توكيل رسمي / وكالة",
      "سند / شيك / إقرار مالي",
      "مستند رسمي آخر",
    ],

    // Results
    back: "العودة إلى صفحة المسح الضوئي",
    reportTitle: "تقرير الفحص المبدئي",
    loadingTitle: "جارٍ تحليل المستند",
    loadingDesc: "يجري الفحص المبدئي وفق القانون المدني المصري — قد يستغرق ذلك بضع ثوانٍ",
    errorTitle: "تعذّر إكمال التحليل",
    retry: "المحاولة مرة أخرى",
    summary: "ملخص الوثيقة",
    applicant: "اسم مقدم الطلب",
    analysisDate: "تاريخ التحليل",
    verdictLabel: "نتيجة الفحص المبدئي",
    confidence: "مستوى الثقة",
    validClauses: "البنود السليمة",
    noValidClauses: "لا توجد بنود سليمة موثّقة.",
    missingClauses: "البنود الناقصة أو المعيبة",
    noMissingClauses: "لا توجد بنود ناقصة.",
    nullity: "مواطن البطلان المحتملة",
    noNullity: "لا توجد مواطن بطلان ظاهرة.",
    forgery: "مؤشرات تستدعي التحقق",
    noForgery: "لم يتم رصد مؤشرات تستدعي التحقق.",
    recommendation: "التوصية القانونية",
    disclaimer:
      "هذا التقرير فحص مبدئي بمساعدة الذكاء الاصطناعي للاسترشاد فقط، ولا يغني عن استشارة محامٍ مختص ولا يُعد إثباتاً لصحة المستند أو تزويره.",
    downloadPdf: "تحميل التقرير PDF",
    newScan: "فحص مستند جديد",
    print: "طباعة التقرير",
    downloadToast: "تحميل التقرير",
    downloadToastDesc: "اختر 'حفظ بصيغة PDF' من نافذة الطباعة",
    invalidAnalysis: "لم يتم استلام تحليل صالح",
    unknownError: "خطأ غير معروف",
  },
  en: {
    appName: { pre: "Legal", post: "AI Scanner" },
    tagline: "AI-assisted preliminary screening for legal documents",
    langLabel: "Language",
    arabic: "العربية",
    english: "English",

    fullName: "Full name (three parts) *",
    fullNamePlaceholder: "e.g. Mohamed Ahmed El-Sayed",
    fullNameHint: "Please enter first name + father's name + family name",
    fullNameError: "Please enter your full three-part name",
    email: "Email *",
    emailPlaceholder: "example@email.com",
    emailError: "Please enter a valid email address",
    documentType: "Document type *",
    documentTypePlaceholder: "Select a document type",
    documentTypeError: "Please select a document type",
    upload: "Upload document *",
    uploadCta: "Choose a file or take a photo",
    uploadHint: "PDF, JPG, PNG, JPEG — max 10MB",
    uploadSelected: "Selected",
    uploadRequired: "Please upload the document to be reviewed",
    uploadFormat: "Unsupported format (PDF, JPG, PNG)",
    uploadSize: "Maximum file size is 10MB",
    submit: "Search",
    submitting: "Preparing...",
    prepError: "Something went wrong",
    prepErrorDesc: "The file could not be prepared for analysis",

    docTypes: [
      "Property sale contract",
      "Lease contract",
      "Employment contract",
      "Construction contract",
      "Company / partnership agreement",
      "Power of attorney",
      "Promissory note / cheque / financial acknowledgement",
      "Other official document",
    ],

    back: "Back to scan page",
    reportTitle: "Preliminary screening report",
    loadingTitle: "Analyzing the document",
    loadingDesc:
      "Running the preliminary screening under the Egyptian Civil Code — this may take a few seconds",
    errorTitle: "The analysis could not be completed",
    retry: "Try again",
    summary: "Document summary",
    applicant: "Applicant name",
    analysisDate: "Analysis date",
    verdictLabel: "Preliminary screening result",
    confidence: "Confidence level",
    validClauses: "Sound clauses",
    noValidClauses: "No sound clauses were identified.",
    missingClauses: "Missing or defective clauses",
    noMissingClauses: "No missing clauses were identified.",
    nullity: "Potential nullity issues",
    noNullity: "No apparent nullity issues.",
    forgery: "Indicators requiring verification",
    noForgery: "No indicators requiring verification were detected.",
    recommendation: "Legal recommendation",
    disclaimer:
      "This is an AI-assisted preliminary screening for guidance only. It does not replace advice from a qualified lawyer and does not prove that a document is genuine or forged.",
    downloadPdf: "Download PDF report",
    newScan: "Scan a new document",
    print: "Print report",
    downloadToast: "Download report",
    downloadToastDesc: "Choose 'Save as PDF' in the print dialog",
    invalidAnalysis: "No valid analysis was received",
    unknownError: "Unknown error",
  },
} as const;

export type Dict = (typeof translations)["ar"];

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  dir: "rtl" | "ltr";
}

const LangContext = createContext<LangContextValue | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return stored === "en" ? "en" : "ar";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: translations[lang] as unknown as Dict,
      dir,
    }),
    [lang, dir],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
};
