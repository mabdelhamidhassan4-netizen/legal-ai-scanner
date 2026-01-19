import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, FileText, AlertTriangle, CheckCircle2, Info } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, fileName } = location.state || {};

  if (!formData) {
    navigate("/");
    return null;
  }

  const getDocumentTypeArabic = (type: string) => {
    const types: Record<string, string> = {
      contract: "عقد",
      document: "مستند",
      cheque: "شيك",
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* الترويسة */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى صفحة المسح الضوئي
          </Button>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              نتائج التحليل
            </h1>
            <p className="text-muted-foreground">
              المستند: <span className="font-medium text-foreground">{fileName}</span>
            </p>
          </div>
        </div>

        {/* شبكة النتائج */}
        <div className="space-y-6">
          {/* ملخص الوثيقة */}
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                ملخص الوثيقة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">الاسم</p>
                  <p className="text-base">{formData.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">البريد الإلكتروني</p>
                  <p className="text-base" dir="ltr">{formData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">نوع المستند</p>
                  <p className="text-base">{getDocumentTypeArabic(formData.documentType)}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">تاريخ التحليل</p>
                  <p className="text-base">{new Date().toLocaleDateString("ar-SA")}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📌 تكامل API: سيعرض هذا القسم البيانات الوصفية المستخرجة من محرك الذكاء الاصطناعي
                </p>
              </div>
            </CardContent>
          </Card>

          {/* النص المستخرج */}
          <Card className="border-2">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                النص المستخرج (معاينة)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-muted p-6 rounded-lg min-h-[200px] text-sm">
                <p className="text-muted-foreground mb-4">
                  [سيظهر النص المستخرج هنا من محرك الذكاء الاصطناعي]
                </p>
                <p className="text-muted-foreground">
                  ستعرض هذه المنطقة المحتوى الكامل المستخرج بتقنية OCR من المستند المحمّل...
                </p>
              </div>
              <div className="mt-4 p-4 bg-accent/10 border border-accent rounded-lg">
                <p className="text-sm text-foreground">
                  💡 <strong>ملاحظة التكامل:</strong> قم بالاتصال بواجهة API لعرض بيانات النص المستخرج هنا.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* المناطق المشبوهة / مؤشرات التزوير */}
          <Card className="border-2 border-destructive/20">
            <CardHeader className="bg-destructive/5">
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                المناطق المشبوهة / مؤشرات التزوير
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">المؤشر 1</p>
                  <p className="text-sm text-muted-foreground">
                    [وصف النمط المشبوه الذي اكتشفه الذكاء الاصطناعي]
                  </p>
                </div>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">المؤشر 2</p>
                  <p className="text-sm text-muted-foreground">
                    [وصف الشذوذ أو التناقض الذي تم العثور عليه]
                  </p>
                </div>
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive mb-2">المؤشر 3</p>
                  <p className="text-sm text-muted-foreground">
                    [نتائج مشبوهة إضافية من تحليل الذكاء الاصطناعي]
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-accent/10 border border-accent rounded-lg">
                <p className="text-sm text-foreground">
                  💡 <strong>ملاحظة التكامل:</strong> سيعرض هذا القسم مصفوفة من مؤشرات التزوير المحددة بواسطة تحليل الذكاء الاصطناعي.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* القرار النهائي للذكاء الاصطناعي */}
          <Card className="border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                القرار النهائي للذكاء الاصطناعي
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">في انتظار التحليل</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  سيتم عرض الحكم النهائي هنا بعد اكتمال تحليل الذكاء الاصطناعي.
                  سيشير هذا إلى ما إذا كان المستند أصليًا أو مزورًا محتملاً.
                </p>
                <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-lg max-w-2xl mx-auto">
                  <p className="text-sm">
                    <strong>المخرجات المتوقعة:</strong> استجابة JSON تحتوي على درجة الثقة ومستوى المخاطر والتفسير التفصيلي من نماذج الذكاء الاصطناعي.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أزرار الإجراءات */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/")}
            className="text-base"
          >
            مسح مستند آخر
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
