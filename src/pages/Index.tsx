import { useMemo, useState } from "react";
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
import { useLang } from "@/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];

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
  const { t, dir, lang } = useLang();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const formSchema = useMemo(
    () =>
      z.object({
        fullName: z
          .string()
          .min(1, t.fullNameError)
          .refine((n) => countNameUnits(n) >= 3, t.fullNameError),
        email: z.string().min(1, t.emailError).email(t.emailError),
        documentType: z.string().min(1, t.documentTypeError),
        document: z
          .instanceof(File, { message: t.uploadRequired })
          .refine((f) => ACCEPTED_TYPES.includes(f.type), t.uploadFormat)
          .refine((f) => f.size <= MAX_SIZE, t.uploadSize),
      }),
    [t],
  );

  type FormData = z.infer<typeof formSchema>;

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
        title: t.prepError,
        description: t.prepErrorDesc,
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
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-7 md:pt-4 md:pb-9">
          <div className="flex justify-end">
            <LanguageSwitcher />
          </div>
          <div className="text-center -mt-6">
            <div className="inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-accent mb-2">
              <ShieldCheck className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
              <span className="text-accent">{t.appName.pre}</span>
              {t.appName.post}
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-primary-foreground/75 leading-relaxed">
              {t.tagline}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 -mt-4 pb-12">
        <div className="bg-card rounded-2xl shadow-soft border border-border p-5 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-semibold text-foreground">
                {t.fullName}
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder={t.fullNamePlaceholder}
                className="h-12 md:h-13 text-sm md:text-base"
                dir={dir}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.fullNameHint}
              </p>
              {errors.fullName && (
                <p className="text-destructive text-xs font-medium">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                {t.email}
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder={t.emailPlaceholder}
                className="h-12 md:h-13 text-sm md:text-base"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-destructive text-xs font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Document type */}
            <div className="space-y-1.5">
              <Label htmlFor="documentType" className="text-sm font-semibold text-foreground">
                {t.documentType}
              </Label>
              <Select
                key={lang}
                onValueChange={(v) => setValue("documentType", v, { shouldValidate: true })}
              >
                <SelectTrigger className="h-12 md:h-13 text-sm md:text-base bg-background">
                  <SelectValue placeholder={t.documentTypePlaceholder} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {t.docTypes.map((d) => (
                    <SelectItem key={d} value={d} className="text-sm md:text-base">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-destructive text-xs font-medium">
                  {errors.documentType.message}
                </p>
              )}
            </div>

            {/* Document upload */}
            <div className="space-y-1.5">
              <Label htmlFor="document" className="text-sm font-semibold text-foreground">
                {t.upload}
              </Label>
              <label
                htmlFor="document"
                className="relative flex flex-col items-center justify-center gap-2 p-5 md:p-6 border-2 border-dashed border-border rounded-xl bg-muted/30 hover:bg-muted/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 text-primary">
                  <Camera className="h-6 w-6" />
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground text-center">
                  {t.uploadCta}
                </p>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {t.uploadHint}
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
                <p className="text-xs text-success font-medium truncate">
                  ✓ {t.uploadSelected}: {selectedFile.name}
                </p>
              )}
              {errors.document && (
                <p className="text-destructive text-xs font-medium">
                  {errors.document.message as string}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-13 md:h-14 text-base font-semibold"
              size="lg"
            >
              {submitting ? (
                <>
                  <ScanLine className="me-2 h-5 w-5 animate-pulse" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Search className="me-2 h-5 w-5" />
                  {t.submit}
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Index;
