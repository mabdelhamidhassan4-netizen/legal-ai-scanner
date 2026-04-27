import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera, Upload, Search, ScrollText, Shield } from "lucide-react";
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
import { validateTripleName } from "@/lib/nameValidation";

const DOCUMENT_TYPES = [
  { value: "real_estate_sale", label: "عقد بيع عقار" },
  { value: "lease", label: "عقد إيجار" },
  { value: "employment", label: "عقد عمل وتوظيف" },
  { value: "construction", label: "عقد مقاولة" },
  { value: "company", label: "عقد شركة / مشاركة تجارية" },
  { value: "power_of_attorney", label: "توكيل رسمي / وكالة" },
  { value: "financial", label: "سند / شيك / إقرار مالي" },
  { value: "other", label: "مستند رسمي آخر" },
];

const formSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "يرجى إدخال الاسم الثلاثي كاملاً")
    .max(120, "الاسم طويل جداً")
    .refine(validateTripleName, "يرجى إدخال الاسم الثلاثي كاملاً"),
  email: z
    .string()
    .trim()
    .min(1, "يرجى إدخال بريد إلكتروني صحيح")
    .email("يرجى إدخال بريد إلكتروني صحيح")
    .max(255),
  documentType: z.string().min(1, "يرجى اختيار نوع المستند"),
  document: z
    .instanceof(File, { message: "يرجى تحميل المستند المراد فحصه" })
    .refine((f) => f.size <= 10 * 1024 * 1024, "الحد الأقصى لحجم الملف 10MB")
    .refine(
      (f) => ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(f.type),
      "الصيغ المقبولة: PDF, JPG, PNG, JPEG"
    ),
});

type FormData = z.infer<typeof formSchema>;

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    const docTypeLabel =
      DOCUMENT_TYPES.find((d) => d.value === data.documentType)?.label || data.documentType;

    navigate("/results", {
      state: {
        formData: {
          fullName: data.fullName,
          email: data.email,
          documentType: data.documentType,
          documentTypeLabel: docTypeLabel,
        },
        fileName: selectedFile?.name,
      },
    });
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
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground shadow-elegant">
        <div className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="bg-gold rounded-full p-2.5 shadow-gold">
              <Shield className="h-7 w-7 text-gold-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              legalAI Scanner
            </h1>
          </div>
          <p className="text-center text-sm md:text-base text-primary-foreground/85 leading-relaxed max-w-xl mx-auto">
            فحص العقود والمستندات بالذكاء الاصطناعي وفق أحكام القانون المدني المصري رقم
            <span className="font-bold text-gold mx-1">131</span>
            لسنة 1948
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-card rounded-2xl shadow-card border border-border p-6 md:p-10">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
            <ScrollText className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-bold text-foreground">بيانات طلب الفحص</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* الاسم الثلاثي */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold text-foreground">
                الاسم الثلاثي <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="مثال: محمد أحمد السيد"
                className="h-14 text-base text-right bg-background"
                dir="rtl"
                autoComplete="name"
              />
              <p className="text-xs text-muted-foreground">
                يرجى إدخال الاسم الأول + اسم الأب + اسم العائلة
              </p>
              {errors.fullName && (
                <p className="text-destructive text-sm font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-foreground">
                البريد الإلكتروني <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@email.com"
                className="h-14 text-base text-left bg-background"
                dir="ltr"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-destructive text-sm font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* نوع المستند */}
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-base font-semibold text-foreground">
                نوع المستند <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("documentType", value, { shouldValidate: true })}>
                <SelectTrigger className="h-14 text-base bg-background">
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-base py-3">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-destructive text-sm font-medium">{errors.documentType.message}</p>
              )}
            </div>

            {/* تحميل المستند */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-base font-semibold text-foreground">
                تحميل المستند <span className="text-destructive">*</span>
              </Label>

              <label
                htmlFor="document"
                className="relative flex items-center gap-3 h-16 px-4 rounded-xl border-2 border-dashed border-border bg-background hover:border-gold hover:bg-gold-soft/30 transition-colors cursor-pointer"
              >
                <div className="bg-primary/10 rounded-lg p-2">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {selectedFile ? selectedFile.name : "اختر ملفاً أو التقط صورة"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    يمكنك رفع صورة أو ملف PDF
                  </p>
                </div>
                <Upload className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <input
                  id="document"
                  type="file"
                  accept="application/pdf,image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              <p className="text-xs text-muted-foreground">
                الصيغ المقبولة: PDF, JPG, JPEG, PNG — الحد الأقصى 10MB
              </p>
              {errors.document && (
                <p className="text-destructive text-sm font-medium">
                  {errors.document.message as string}
                </p>
              )}
            </div>

            {/* زر البحث */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-elegant transition-all"
              size="lg"
            >
              <Search className="ml-2 h-5 w-5" />
              بحث
            </Button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          نقابة المحامين المصرية · القانون المدني المصري رقم 131 لسنة 1948
        </p>
      </main>
    </div>
  );
};

export default Index;
