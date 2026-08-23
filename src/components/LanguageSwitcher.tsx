import { useLang } from "@/i18n";
import { cn } from "@/lib/utils";

const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { lang, setLang, t } = useLang();

  const base =
    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <div
      role="group"
      aria-label={t.langLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 p-0.5",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLang("ar")}
        aria-pressed={lang === "ar"}
        className={cn(
          base,
          lang === "ar"
            ? "bg-primary-foreground/90 text-primary"
            : "text-primary-foreground/80 hover:text-primary-foreground",
        )}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={cn(
          base,
          lang === "en"
            ? "bg-primary-foreground/90 text-primary"
            : "text-primary-foreground/80 hover:text-primary-foreground",
        )}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSwitcher;
