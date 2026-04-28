import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Download,
  Printer,
  RotateCcw,
  Loader2,
  FileText,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NullityIssue {
  issue: string;
  legal_article: string;
}
interface ForgeryIndicator {
  title: string;
  description: string;
}
interface Analysis {
  document_type: string;
  verdict: string;
  verdict_color: "green" | "yellow" | "orange" | "red" | "black";
  valid_clauses: string[];
  missing_clauses: string[];
  nullity_issues: NullityIssue[];
  forgery_indicators: ForgeryIndicator[];
  recommendation: string;
  confidence_level: string;
  legal_source: string;
}

const VERDICT_STYLES: Record<
  Analysis["verdict_color"],
  { bg: string; text: string; ring: string; emoji: string; defaultLabel: string }
> = {
  green: {
    bg: "bg-success",
    text: "text-success-foreground",
    ring: "ring-success/30",
    emoji: "🟢",
    defaultLabel: "عقد صحيح ومكتمل الأركان",
  },
  yellow: {
    bg: "bg-warning",
    text: "text-warning-foreground",
    ring: "ring-warning/30",
    emoji: "🟡",
    defaultLabel: "عقد صحيح مع ملاحظات جوهرية",
  },
  orange: {
    bg: "bg-orange-status",
    text: "text-orange-status-foreground",
    ring: "ring-orange-status/30",
    emoji: "🟠",
    defaultLabel: "عقد قابل للإبطال — بطلان نسبي",
  },
  red: {
    bg: "bg-destructive",
    text: "text-destructive-foreground",
    ring: "ring-destructive/30",
    emoji: "🔴",
    defaultLabel: "عقد باطل بطلاناً مطلقاً",
  },
  black: {
    bg: "bg-neutral-status",
    text: "text-neutral-status-foreground",
    ring: "ring-neutral-status/30",
    emoji: "⚫",
    defaultLabel: "مستند مشبوه — يستلزم فحصاً مادياً",
  },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, fileName, fileBase64, mimeType } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!formData || !fileBase64) {
      navigate("/");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "analyze-document",
          {
            body: {
              fullName: formData.fullName,
              email: formData.email,
              documentType: formData.documentType,
              fileName,
              fileBase64,
              mimeType,
            },
          },
        );

        if (fnError) {
          throw new Error(fnError.message || "فشل تحليل المستند");
        }
        if (data?.error) {
          throw new Error(data.error);
        }
        if (!data?.analysis) {
          throw new Error("لم يتم استلام تحليل صالح");
        }
        setAnalysis(data.analysis as Analysis);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "خطأ غير معروف";
        setError(msg);
        toast({
          title: "تعذّر إكمال التحليل",
          description: msg,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [formData, fileBase64, fileName, mimeType, navigate, toast]);

  if (!formData) return null;

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    // Use the browser's print-to-PDF as a built-in option
    window.print();
    toast({
      title: "تحميل التقرير",
      description: "اختر 'حفظ بصيغة PDF' من نافذة الطباعة",
    });
  };

  const verdictStyle = analysis ? VERDICT_STYLES[analysis.verdict_color] : null;

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground no-print">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى صفحة المسح الضوئي
          </Button>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            <span className="text-accent">legal</span>AI Scanner
          </h1>
          <p className="text-sm opacity-80 mt-1">تقرير الفحص القانوني</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* Loading */}
        {loading && (
          <Card className="border-2 shadow-elegant">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <Loader2 className="h-14 w-14 text-primary animate-spin" />
              <h2 className="text-xl font-bold">⏳ جارٍ تحليل المستند</h2>
              <p className="text-muted-foreground max-w-md">
                نقوم بفحص المستند وفق القانون المدني المصري — قد يستغرق ذلك بضع ثوانٍ
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="border-2 border-destructive shadow-elegant">
            <CardContent className="py-12 text-center space-y-4">
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-bold text-destructive">تعذّر إكمال التحليل</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/")} className="gradient-primary">
                المحاولة مرة أخرى
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && analysis && verdictStyle && (
          <>
            {/* 1. Document summary */}
            <Card className="border-2 shadow-soft">
              <CardHeader className="bg-muted/40">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileText className="h-5 w-5" />
                  ملخص الوثيقة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      اسم مقدم الطلب
                    </p>
                    <p className="text-base font-medium">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      نوع المستند
                    </p>
                    <p className="text-base font-medium">{formData.documentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      تاريخ التحليل
                    </p>
                    <p className="text-base font-medium">
                      {new Date().toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Final verdict badge */}
            <Card className={`border-2 shadow-elegant ring-4 ${verdictStyle.ring}`}>
              <CardContent className="py-8 text-center">
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  الحكم النهائي
                </p>
                <div
                  className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl ${verdictStyle.bg} ${verdictStyle.text} text-lg md:text-xl font-bold shadow-lg`}
                >
                  <span className="text-2xl">{verdictStyle.emoji}</span>
                  <span>{analysis.verdict || verdictStyle.defaultLabel}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  مستوى الثقة:{" "}
                  <span className="font-semibold text-foreground">
                    {analysis.confidence_level}
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* 3. Legal inspection — 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valid clauses — green */}
              <Card className="border-2 border-success/40 shadow-soft">
                <CardHeader className="bg-success/10">
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    البنود السليمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.valid_clauses.length ? (
                    <ul className="space-y-2 text-sm">
                      {analysis.valid_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-success font-bold">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد بنود سليمة موثّقة.</p>
                  )}
                </CardContent>
              </Card>

              {/* Missing/defective — yellow */}
              <Card className="border-2 border-warning/40 shadow-soft">
                <CardHeader className="bg-warning/10">
                  <CardTitle className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    البنود الناقصة أو المعيبة
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.missing_clauses.length ? (
                    <ul className="space-y-2 text-sm">
                      {analysis.missing_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning font-bold">!</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد بنود ناقصة.</p>
                  )}
                </CardContent>
              </Card>

              {/* Nullity issues — red */}
              <Card className="border-2 border-destructive/40 shadow-soft">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Scale className="h-5 w-5" />
                    مواطن البطلان
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.nullity_issues.length ? (
                    <ul className="space-y-3 text-sm">
                      {analysis.nullity_issues.map((n, i) => (
                        <li key={i} className="border-r-4 border-destructive pr-3">
                          <p className="font-medium">{n.issue}</p>
                          <p className="text-xs text-destructive font-semibold mt-1">
                            {n.legal_article}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">لا توجد مواطن بطلان.</p>
                  )}
                </CardContent>
              </Card>

              {/* Forgery indicators — gray */}
              <Card className="border-2 border-neutral-status/30 shadow-soft">
                <CardHeader className="bg-neutral-status/10">
                  <CardTitle className="flex items-center gap-2 text-neutral-status">
                    <ShieldAlert className="h-5 w-5" />
                    مؤشرات التزوير
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.forgery_indicators.length ? (
                    <ul className="space-y-3 text-sm">
                      {analysis.forgery_indicators.map((f, i) => (
                        <li key={i} className="border-r-4 border-neutral-status pr-3">
                          <p className="font-semibold">{f.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {f.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      لم يتم رصد مؤشرات تزوير ظاهرة.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 4. Legal recommendation */}
            <Card className="border-2 gradient-primary text-primary-foreground shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Search className="h-5 w-5" />
                  التوصية القانونية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base leading-relaxed">{analysis.recommendation}</p>
                {analysis.legal_source && (
                  <p className="text-xs opacity-80 border-r-2 border-accent pr-3">
                    {analysis.legal_source}
                  </p>
                )}
                <div className="bg-accent/20 border border-accent/40 rounded-lg p-4 text-sm">
                  ⚠️ هذا التقرير للاسترشاد فقط ولا يغني عن استشارة محامٍ
                </div>
              </CardContent>
            </Card>

            {/* 5. Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
              <Button
                onClick={handleDownloadPdf}
                className="h-12 gradient-primary text-primary-foreground font-semibold"
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل التقرير PDF
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="h-12 font-semibold"
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                فحص مستند جديد
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="h-12 font-semibold bg-card"
              >
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="h-12 font-semibold"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة إلى صفحة المسح الضوئي
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Results;
