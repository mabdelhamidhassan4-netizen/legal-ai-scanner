import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
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
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  { bg: string; text: string; ring: string; defaultLabel: string }
> = {
  green: {
    bg: "bg-success",
    text: "text-success-foreground",
    ring: "ring-success/20",
    defaultLabel: "عقد صحيح ومكتمل الأركان",
  },
  yellow: {
    bg: "bg-warning",
    text: "text-warning-foreground",
    ring: "ring-warning/20",
    defaultLabel: "عقد صحيح مع ملاحظات جوهرية",
  },
  orange: {
    bg: "bg-orange-status",
    text: "text-orange-status-foreground",
    ring: "ring-orange-status/20",
    defaultLabel: "عقد قابل للإبطال — بطلان نسبي",
  },
  red: {
    bg: "bg-destructive",
    text: "text-destructive-foreground",
    ring: "ring-destructive/20",
    defaultLabel: "عقد باطل بطلاناً مطلقاً",
  },
  black: {
    bg: "bg-neutral-status",
    text: "text-neutral-status-foreground",
    ring: "ring-neutral-status/20",
    defaultLabel: "مستند مشبوه — يستلزم فحصاً مادياً",
  },
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, dir, lang } = useLang();
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
          throw new Error(fnError.message);
        }
        if (data?.error) {
          throw new Error(data.error);
        }
        if (!data?.analysis) {
          throw new Error(t.invalidAnalysis);
        }
        setAnalysis(data.analysis as Analysis);
      } catch (e) {
        const msg = e instanceof Error ? e.message : t.unknownError;
        setError(msg);
        toast({
          title: t.errorTitle,
          description: msg,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, fileBase64, fileName, mimeType, navigate, toast]);

  if (!formData) return null;

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    window.print();
    toast({ title: t.downloadToast, description: t.downloadToastDesc });
  };

  const verdictStyle = analysis ? VERDICT_STYLES[analysis.verdict_color] : null;

  return (
    <div className="min-h-screen bg-background pb-12" dir={dir}>
      {/* Header */}
      <header className="bg-primary text-primary-foreground no-print">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground px-2"
            >
              <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
              <span className="text-xs md:text-sm">{t.back}</span>
            </Button>
            <LanguageSwitcher />
          </div>
          <h1 className="mt-3 text-xl md:text-2xl font-bold">
            <span className="text-accent">{t.appName.pre}</span>
            {t.appName.post}
          </h1>
          <p className="text-xs md:text-sm text-primary-foreground/75 mt-1">
            {t.reportTitle}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-5">
        {/* Loading */}
        {loading && (
          <Card className="shadow-soft">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <h2 className="text-lg font-semibold">{t.loadingTitle}</h2>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                {t.loadingDesc}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="border-destructive/40 shadow-soft">
            <CardContent className="py-12 text-center space-y-4">
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <h2 className="text-lg font-semibold text-destructive">{t.errorTitle}</h2>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => navigate("/")}>{t.retry}</Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!loading && analysis && verdictStyle && (
          <>
            {/* 1. Document summary */}
            <Card className="shadow-soft">
              <CardHeader className="bg-muted/40 border-b border-border">
                <CardTitle className="flex items-center gap-2 text-base text-primary">
                  <FileText className="h-5 w-5" />
                  {t.summary}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.applicant}
                    </p>
                    <p className="text-sm font-medium">{formData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.documentType.replace(" *", "")}
                    </p>
                    <p className="text-sm font-medium">{formData.documentType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t.analysisDate}
                    </p>
                    <p className="text-sm font-medium">
                      {new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Final verdict */}
            <Card className={`shadow-soft ring-2 ${verdictStyle.ring}`}>
              <CardContent className="py-8 text-center">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  {t.verdictLabel}
                </p>
                <div
                  className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl ${verdictStyle.bg} ${verdictStyle.text} text-base md:text-lg font-semibold`}
                >
                  <span>{analysis.verdict || verdictStyle.defaultLabel}</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {t.confidence}:{" "}
                  <span className="font-medium text-foreground">
                    {analysis.confidence_level}
                  </span>
                </p>
              </CardContent>
            </Card>

            {/* 3. Legal inspection — 4 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valid clauses */}
              <Card className="shadow-soft">
                <CardHeader className="bg-success/10 border-b border-success/20">
                  <CardTitle className="flex items-center gap-2 text-base text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    {t.validClauses}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.valid_clauses.length ? (
                    <ul className="space-y-2 text-sm leading-relaxed">
                      {analysis.valid_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-success font-semibold">✓</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noValidClauses}</p>
                  )}
                </CardContent>
              </Card>

              {/* Missing/defective */}
              <Card className="shadow-soft">
                <CardHeader className="bg-warning/10 border-b border-warning/20">
                  <CardTitle className="flex items-center gap-2 text-base text-warning">
                    <AlertTriangle className="h-5 w-5" />
                    {t.missingClauses}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.missing_clauses.length ? (
                    <ul className="space-y-2 text-sm leading-relaxed">
                      {analysis.missing_clauses.map((c, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-warning font-semibold">!</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noMissingClauses}</p>
                  )}
                </CardContent>
              </Card>

              {/* Nullity issues */}
              <Card className="shadow-soft">
                <CardHeader className="bg-destructive/10 border-b border-destructive/20">
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <Scale className="h-5 w-5" />
                    {t.nullity}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.nullity_issues.length ? (
                    <ul className="space-y-3 text-sm leading-relaxed">
                      {analysis.nullity_issues.map((n, i) => (
                        <li key={i} className="border-s-2 border-destructive/60 ps-3">
                          <p className="font-medium">{n.issue}</p>
                          <p className="text-xs text-destructive font-medium mt-1">
                            {n.legal_article}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noNullity}</p>
                  )}
                </CardContent>
              </Card>

              {/* Verification indicators */}
              <Card className="shadow-soft">
                <CardHeader className="bg-neutral-status/10 border-b border-neutral-status/20">
                  <CardTitle className="flex items-center gap-2 text-base text-neutral-status">
                    <ShieldAlert className="h-5 w-5" />
                    {t.forgery}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {analysis.forgery_indicators.length ? (
                    <ul className="space-y-3 text-sm leading-relaxed">
                      {analysis.forgery_indicators.map((f, i) => (
                        <li key={i} className="border-s-2 border-neutral-status/60 ps-3">
                          <p className="font-medium">{f.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {f.description}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noForgery}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 4. Legal recommendation */}
            <Card className="bg-primary text-primary-foreground shadow-soft border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-accent">
                  <Search className="h-5 w-5" />
                  {t.recommendation}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm md:text-base leading-relaxed">
                  {analysis.recommendation}
                </p>
                {analysis.legal_source && (
                  <p className="text-xs text-primary-foreground/75 border-s-2 border-accent ps-3">
                    {analysis.legal_source}
                  </p>
                )}
                <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg p-4 text-xs md:text-sm leading-relaxed">
                  {t.disclaimer}
                </div>
              </CardContent>
            </Card>

            {/* 5. Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 no-print">
              <Button onClick={handleDownloadPdf} className="h-12 font-medium">
                <Download className="me-2 h-4 w-4" />
                {t.downloadPdf}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="h-12 font-medium"
              >
                <RotateCcw className="me-2 h-4 w-4" />
                {t.newScan}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="h-12 font-medium bg-card">
                <Printer className="me-2 h-4 w-4" />
                {t.print}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="h-12 font-medium bg-card"
              >
                <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
                {t.back}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Results;
