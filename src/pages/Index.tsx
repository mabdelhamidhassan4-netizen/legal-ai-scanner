import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Search, ScanLine, Upload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Compound name prefixes that should be treated as a single naming unit
const COMPOUND_PREFIXES = [
  "عبد",
  "نور",
  "سيف",
  "أبو",
  "ابو",
  "ابن",
  "بن",
  "ام",
  "أم",
];

/**
 * Counts naming units in a full name, treating compound names like
 * "عبدالرحمن" or "عبد الرحمن" or "نور الدين" as a single unit.
 */
function countNameUnits(name: string): number {
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  let units = 0;
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    // Case 1: token already contains the compound joined (عبدالرحمن)
    const isJoinedCompound = COMPOUND_PREFIXES.some(
      (p) => tok.startsWith(p) && tok.length > p.length + 1,
    );
    // Case 2: separated compound (عبد الرحمن) — combine with next token
    const isSeparatedPrefix =
      COMPOUND_PREFIXES.includes(tok) && i + 1 < tokens.length;

    if (isSeparatedPrefix) {
      units += 1;
      i += 2;
    } else if (isJoinedCompound) {
      units += 1;
      i += 1;
    } else {
      units += 1;
      i += 1;
    }
  }
  return units;
}

const DOCUMENT_TYPES = [
  "عقد بيع عقار",
  "عقد إيجار",
  "عقد عمل وتوظيف",
  "عقد مقاولة",
  "عقد شركة / مشاركة تجارية",
  "توكيل رسمي / وكالة",
  "سند / شيك / إقرار مالي",
  "مستند رسمي آخر",
];

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

const formSchema = z.object({
  fullName: z
    .string()
    .min(1, "يرجى إدخال الاسم الثلاثي كاملاً")
    .refine((n) => countNameUnits(n) >= 3, "يرجى إدخال الاسم الثلاثي كاملاً"),
  email: z
    .string()
    .min(1, "يرجى إدخال بريد إلكتروني صحيح")
    .email("يرجى إدخال بريد إلكتروني صحيح"),
  documentType: z.string().min(1, "يرجى اختيار نوع المستند"),
  document: z
    .instanceof(File, { message: "يرجى تحميل المستند المراد فحصه" })
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "الصيغة غير مدعومة (PDF, JPG, PNG)")
    .refine((f) => f.size <= MAX_SIZE, "الحد الأقصى للحجم 10MB"),
});

type FormData = z.infer<typeof formSchema>;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const fileBase64 = await fileToBase64(data.document);
      navigate("/results", {
        state: {
          formData: {
            fullName: data.fullName,
            email: data.email,
            documentType: data.documentType,
          },
          fileName: data.document.name,
          fileBase64,
          mimeType: data.document.type,
        },
      });
    } catch (e) {
      toast({
        title: "حدث خطأ",
        description: "تعذّر تجهيز الملف للتحليل",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("document", file, { shouldValidate: true });
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero header */}
      <header className="gradient-hero text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4 shadow-gold">
            <ShieldCheck className="w-9 h-9 text-accent-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-accent">legal</span>AI Scanner
          </h1>
          <p className="mt-3 text-base md:text-lg opacity-90 leading-relaxed">
            فحص العقود والمستندات بالذكاء الاصطناعي
          </p>
          <p className="mt-1 text-sm opacity-70">
            وفق القانون المدني المصري وأحكام محكمة النقض
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-8 pb-12">
        <div className="bg-card rounded-2xl shadow-elegant border border-border p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-bold text-foreground">
                الاسم الثلاثي *
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="مثال: محمد أحمد السيد"
                className="h-14 text-base"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">
                يرجى إدخال الاسم الأول + اسم الأب + اسم العائلة
              </p>
              {errors.fullName && (
                <p className="text-destructive text-sm font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-bold text-foreground">
                البريد الإلكتروني *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className="h-14 text-base"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-destructive text-sm font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Document type */}
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-base font-bold text-foreground">
                نوع المستند *
              </Label>
              <Select onValueChange={(v) => setValue("documentType", v, { shouldValidate: true })}>
                <SelectTrigger className="h-14 text-base bg-background">
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-base">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-destructive text-sm font-medium">
                  {errors.documentType.message}
                </p>
              )}
            </div>

            {/* Document upload */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-base font-bold text-foreground">
                تحميل المستند *
              </Label>
              <label
                htmlFor="document"
                className="relative flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 text-primary">
                  <Camera className="h-7 w-7" />
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-base font-semibold text-foreground">
                  اختر ملفاً أو التقط صورة
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  PDF, JPG, PNG, JPEG — الحد الأقصى 10MB
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  يمكنك رفع صورة أو ملف PDF
                </p>
                <Input
                  id="document"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/jpg"
                  capture="environment"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {selectedFile && (
                <p className="text-sm text-success font-medium">
                  ✓ تم اختيار: {selectedFile.name}
                </p>
              )}
              {errors.document && (
                <p className="text-destructive text-sm font-medium">
                  {errors.document.message as string}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-16 text-lg font-bold gradient-primary hover:opacity-95 shadow-elegant"
              size="lg"
            >
              {submitting ? (
                <>
                  <ScanLine className="ml-2 h-5 w-5 animate-pulse" />
                  جارٍ التجهيز...
                </>
              ) : (
                <>
                  <Search className="ml-2 h-5 w-5" />
                  بحث
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground leading-relaxed">
              يتم التحليل وفق القانون المدني المصري رقم 131 لسنة 1948 وأحكام محكمة النقض
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Index;
