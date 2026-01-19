import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera } from "lucide-react";
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

const formSchema = z.object({
  fullName: z
    .string()
    .min(1, "الاسم الثلاثي مطلوب")
    .refine((name) => {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 3;
    }, "يجب إدخال ثلاثة أسماء (الاسم الأول + اسم الأب + اسم العائلة)"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("يرجى إدخال بريد إلكتروني صالح")
    .refine((email) => email.endsWith("@gmail.com"), "يجب أن يكون البريد الإلكتروني من Gmail فقط (@gmail.com)"),
  documentType: z.string().min(1, "نوع المستند مطلوب"),
  document: z.instanceof(File, { message: "يرجى تحميل المستند" }),
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormData) => {
    toast({
      title: "جاري مسح المستند",
      description: "سيتم تنفيذ تحليل المستند باستخدام محرك ذكاء اصطناعي",
    });
    
    setTimeout(() => {
      navigate("/results", { 
        state: { 
          formData: data,
          fileName: selectedFile?.name 
        } 
      });
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("document", file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            الماسح القانوني الذكي
          </h1>
          <p className="text-muted-foreground text-lg">
            قم بتحميل مستندك لفحص التزوير بواسطة الذكاء الاصطناعي
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* الاسم الثلاثي */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">
                الاسم الثلاثي *
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="أدخل الاسم الأول + اسم الأب + اسم العائلة"
                className="h-14 text-base text-right"
                dir="rtl"
              />
              {errors.fullName && (
                <p className="text-destructive text-sm">{errors.fullName.message}</p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                البريد الإلكتروني *
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="example@gmail.com"
                className="h-14 text-base text-left"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                يُقبل فقط البريد الإلكتروني من Gmail
              </p>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* نوع المستند */}
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-base font-semibold">
                نوع المستند *
              </Label>
              <Select
                onValueChange={(value) => setValue("documentType", value)}
              >
                <SelectTrigger className="h-14 text-base bg-background">
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="contract">عقد</SelectItem>
                  <SelectItem value="document">مستند</SelectItem>
                  <SelectItem value="cheque">شيك</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-destructive text-sm">{errors.documentType.message}</p>
              )}
            </div>

            {/* تحميل المستند */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-base font-semibold">
                تحميل المستند *
              </Label>
              <div className="relative">
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="h-14 text-base cursor-pointer file:ml-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground pointer-events-none" />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  الملف المحدد: {selectedFile.name}
                </p>
              )}
              {errors.document && (
                <p className="text-destructive text-sm">{errors.document.message}</p>
              )}
            </div>

            {/* زر المسح */}
            <Button
              type="submit"
              className="w-full h-16 text-lg font-semibold"
              size="lg"
            >
              🔍 مسح ضوئي
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              سيتم تنفيذ تحليل المستند باستخدام محرك ذكاء اصطناعي
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
