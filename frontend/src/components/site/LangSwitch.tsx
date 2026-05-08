import { useLang } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  // Configuration des langues pour éviter la répétition de code
  const languages = [
    { code: "fr", label: "FR", flag: "https://flagcdn.com/w40/fr.png", alt: "Français" },
    { code: "en", label: "EN", flag: "https://flagcdn.com/w40/gb.png", alt: "English" }
  ] as const;

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {languages.map((l, index) => (
        <div key={l.code} className="flex items-center gap-2">
          <button
            onClick={() => setLang(l.code)}
            aria-label={l.alt}
            className={cn(
              "group flex items-center gap-2 px-1 py-1 transition-all duration-300",
              lang === l.code 
                ? "opacity-100" 
                : "opacity-40 hover:opacity-100"
            )}
          >
            <img 
              src={l.flag} 
              alt="" 
              className={cn(
                "w-4 h-4 object-cover rounded-full grayscale-[20%] border border-border/50",
                lang === l.code && "grayscale-0 scale-110"
              )}
            />
            <span className={cn(
              "text-[10px] tracking-[0.2em] font-medium",
              lang === l.code ? "font-semibold" : ""
            )}>
              {l.label}
            </span>
          </button>
          
          {/* Séparateur discret entre les deux langues */}
          {index === 0 && (
            <span className="w-px h-3 bg-border/40" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}