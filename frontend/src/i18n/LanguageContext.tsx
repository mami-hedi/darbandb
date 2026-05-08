import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Lang } from "./translations";

type Translations = typeof dict["fr"];
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Translations };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("bnb-lang") as Lang | null;
    if (saved === "fr" || saved === "en") setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("bnb-lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dict[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
