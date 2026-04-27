import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Printer,
  RotateCcw,
  Loader2,
  ShieldAlert,
  ScrollText,
  Scale,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type VerdictColor = "green" | "yellow" | "orange" | "red" | "black";

interface AnalysisResult {
  document_type: string;
  verdict: string;
  verdict_color: VerdictColor;
  valid_clauses: string[];
  missing_clauses: string[];
  nullity_issues: { issue: string; legal_article: string }[];
  forgery_indicators: { title: string; description: string }[];
  recommendation: string;
  confidence_level: string;
  legal_source: string;
}

const VERDICT_STYLES: Record<VerdictColor, { bg: string; text: string; border: string; emoji: string; label: string }> = {
  green: {
    bg: "bg-success-soft",
    text: "text-success",
    border: "border-success",
    emoji: "🟢",
    label: "عقد صحيح ومكتمل الأركان",
  },
  yellow: {
    bg: "bg-warning-soft",
    text: "text-warning-foreground",
    border: "border-warning",
    emoji: "🟡",
    label: "عقد صحيح مع ملاحظات جوهرية",
  },
  orange: {
    bg: "bg-orange-status-soft",
    text: "text-orange-status",
    border: "border-orange-status",
    emoji: "🟠",
    label: "عقد قابل للإبطال — بطلان نسبي",
  },
  red: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive",
    emoji: "🔴",
    label: "عقد باطل بطلاناً مطلقاً",
  },
  black: {
    bg: "bg-muted",
    text: "text-foreground",
    border: "border-neutral-dark",
    emoji: "⚫",
    label: "مستند مشبوه — يستلزم فحصاً مادياً",
  },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { formData, fileName } = (location.state as any) || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!formData) {
      navigate("/");
      return;
    }

    const runAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fnError } = await supabase.functions.invoke("analyze-document", {
          body: {
            documentType: formData.documentTypeLabel,
            documentTypeKey: formData.documentType,
            fullName: formData.fullName,
            email: formData.email,
            fileName,
          },
        });

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        setResult(data as AnalysisResult);
      } catch (e: any) {
        console.error("Analysis error:", e);
        setError(e?.message || "تعذّر إجراء التحليل");
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!formData) return null;

  const verdict = result ? VERDICT_STYLES[result.verdict_color] || VERDICT_STYLES.black : null;

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    toast({
      title: "تنزيل التقرير",
      description: "سيتم تجهيز نسخة PDF — استخدم زر الطباعة وحفظ كـ PDF حالياً.",
    });
    setTimeout(() => window.print(), 400);
  };

  return (
    <div className="min-h-screen bg-background pb-12" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground shadow-elegant no-print">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-white/10"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-gold" />
              <h1 className="text-xl md:text-2xl font-extrabold">legalAI Scanner</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* Loading state */}
        {loading && (
          <div className="bg-card rounded-2xl border border-border shadow-card p-12 text-center">
            <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-foreground mb-2">⏳ جارٍ تحليل المستند</h2>
            <p className="text-muted-foreground">
              يقوم الذكاء الاصطناعي بفحص المستند وفق أحكام القانون المدني المصري...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="bg-card rounded-2xl border-2 border-destructive/30 shadow-card p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">تعذّر إجراء التحليل</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} className="bg-primary text-primary-foreground">
              <RotateCcw className="ml-2 h-4 w-4" />
              العودة لصفحة المسح
            </Button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && result && verdict && (
          <>
            {/* Section 1: Document Summary */}
            <Card className="border-2 border-border shadow-card overflow-hidden">
              <CardHeader className="bg-gradient-primary text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ScrollText className="h-5 w-5 text-gold" />
                  ملخص الوثيقة
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">اسم مقدم الطلب</p>
                    <p className="text-base font-semibold text-foreground">{formData.fullName}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">نوع المستند</p>
                    <p className="text-base font-semibold text-foreground">{formData.documentTypeLabel}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">تاريخ التحليل</p>
                    <p className="text-base font-semibold text-foreground">
                      {new Date().toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">اسم الملف</p>
                    <p className="text-base font-semibold text-foreground truncate" dir="ltr">
                      {fileName || "—"}
                    </p>
                  </div>
                </div>
                <div className="bg-gold-soft border-r-4 border-gold rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    <span className="font-bold text-primary">المصدر القانوني:</span>{" "}
                    وفق القانون المدني المصري رقم 131 لسنة 1948 — نقابة المحامين المصرية
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Final Verdict */}
            <Card className={`border-4 ${verdict.border} shadow-elegant overflow-hidden`}>
              <CardHeader className={`${verdict.bg}`}>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className={`h-5 w-5 ${verdict.text}`} />
                  الحكم النهائي
                </CardTitle>
              </CardHeader>
              <CardContent className={`${verdict.bg} py-8 text-center`}>
                <div className="text-6xl mb-4">{verdict.emoji}</div>
                <h2 className={`text-2xl md:text-3xl font-extrabold ${verdict.text} mb-3`}>
                  {result.verdict || verdict.label}
                </h2>
                <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur rounded-full px-4 py-2 border border-border">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    مستوى الثقة: {result.confidence_level}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Legal Inspection Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valid clauses */}
              <Card className="border-2 border-success/40 shadow-card">
                <CardHeader className="bg-success-soft">
                  <CardTitle className="flex items-center gap-2 text-base text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    البنود السليمة
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  {result.valid_clauses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد بنود سليمة مكتشفة.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {result.valid_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed">
                          <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Missing clauses */}
              <Card className="border-2 border-warning/40 shadow-card">
                <CardHeader className="bg-warning-soft">
                  <CardTitle className="flex items-center gap-2 text-base text-warning-foreground">
                    <AlertTriangle className="h-5 w-5" />
                    البنود الناقصة أو المعيبة
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  {result.missing_clauses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد بنود ناقصة.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {result.missing_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed">
                          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{c}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Nullity issues */}
              <Card className="border-2 border-destructive/40 shadow-card">
                <CardHeader className="bg-destructive/10">
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <ShieldAlert className="h-5 w-5" />
                    مواطن البطلان
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  {result.nullity_issues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لا توجد مواطن بطلان.</p>
                  ) : (
                    <ul className="space-y-3">
                      {result.nullity_issues.map((n, i) => (
                        <li
                          key={i}
                          className="bg-destructive/5 border border-destructive/20 rounded-lg p-3"
                        >
                          <p className="text-sm text-foreground leading-relaxed mb-1.5">{n.issue}</p>
                          <span className="inline-block text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                            {n.legal_article}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Forgery indicators */}
              <Card className="border-2 border-neutral-dark/30 shadow-card">
                <CardHeader className="bg-muted">
                  <CardTitle className="flex items-center gap-2 text-base text-foreground">
                    <Search className="h-5 w-5" />
                    مؤشرات التزوير
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  {result.forgery_indicators.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لم تُرصد مؤشرات تزوير.</p>
                  ) : (
                    <ul className="space-y-3">
                      {result.forgery_indicators.map((f, i) => (
                        <li key={i} className="bg-muted/50 border border-border rounded-lg p-3">
                          <p className="font-bold text-sm text-foreground mb-1">{f.title}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {f.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section 4: Legal Recommendation */}
            <Card className="border-2 border-primary shadow-elegant overflow-hidden">
              <CardHeader className="bg-gradient-primary text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-gold" />
                  التوصية القانونية
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-primary/5 pt-6 space-y-4">
                <p className="text-base leading-loose text-foreground whitespace-pre-line">
                  {result.recommendation}
                </p>
                <div className="bg-warning-soft border-r-4 border-warning rounded-lg p-4">
                  <p className="text-sm font-semibold text-foreground leading-relaxed">
                    ⚠️ هذا التقرير للاسترشاد فقط ولا يغني عن استشارة محامٍ متخصص معتمد
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
              <Button
                onClick={handleDownloadPdf}
                className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل التقرير PDF
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="h-14 font-semibold"
              >
                <RotateCcw className="ml-2 h-4 w-4" />
                فحص مستند جديد
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="h-14 bg-card font-semibold"
              >
                <Printer className="ml-2 h-4 w-4" />
                طباعة التقرير
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="h-14 font-semibold"
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                العودة لصفحة المسح
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Results;
