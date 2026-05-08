import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <button
        onClick={() => setLang("fr")}
        aria-label="Français"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-sm transition-opacity",
          lang === "fr" ? "opacity-100" : "opacity-40 hover:opacity-70"
        )}
      >
        <span aria-hidden className="text-base leading-none">🇫🇷</span>
        <span className="tracking-wider">FR</span>
      </button>
      <span className="text-muted-foreground">·</span>
      <button
        onClick={() => setLang("en")}
        aria-label="English"
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-sm transition-opacity",
          lang === "en" ? "opacity-100" : "opacity-40 hover:opacity-70"
        )}
      >
        <span aria-hidden className="text-base leading-none">🇬🇧</span>
        <span className="tracking-wider">EN</span>
      </button>
    </div>
  );
}
