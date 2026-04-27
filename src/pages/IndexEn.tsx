import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Camera } from "lucide-react";
import LanguageToggle from "@/components/LanguageToggle";
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
    .min(1, "Full name is required")
    .refine((name) => {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 3;
    }, "Please enter three names (First + Middle + Last name)"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine((email) => email.endsWith("@gmail.com"), "Only Gmail addresses (@gmail.com) are accepted"),
  documentType: z.string().min(1, "Document type is required"),
  document: z.instanceof(File, { message: "Please upload a document" }),
});

type FormData = z.infer<typeof formSchema>;

const IndexEn = () => {
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
      title: "Scanning Document",
      description: "Document analysis will be performed using an AI engine",
    });
    
    setTimeout(() => {
      navigate("/en/results", { 
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="ltr">
      <LanguageToggle />
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
            Smart Legal Scanner
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your document to check for forgery using AI
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">
                Full Name *
              </Label>
              <Input
                id="fullName"
                {...register("fullName")}
                placeholder="Enter First + Middle + Last name"
                className="h-14 text-base text-left"
                dir="ltr"
              />
              {errors.fullName && (
                <p className="text-destructive text-sm">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address *
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
                Only Gmail addresses are accepted
              </p>
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType" className="text-base font-semibold">
                Document Type *
              </Label>
              <Select
                onValueChange={(value) => setValue("documentType", value)}
              >
                <SelectTrigger className="h-14 text-base bg-background">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-destructive text-sm">{errors.documentType.message}</p>
              )}
            </div>

            {/* Upload Document */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-base font-semibold">
                Upload Document *
              </Label>
              <div className="relative">
                <Input
                  id="document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="h-14 text-base cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Camera className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground pointer-events-none" />
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {selectedFile.name}
                </p>
              )}
              {errors.document && (
                <p className="text-destructive text-sm">{errors.document.message}</p>
              )}
            </div>

            {/* Scan Button */}
            <Button
              type="submit"
              className="w-full h-16 text-lg font-semibold"
              size="lg"
            >
              🔍 Scan Document
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Document analysis will be performed using an AI engine
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IndexEn;
