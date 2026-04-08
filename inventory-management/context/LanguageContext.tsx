"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import en from "../locale/en.json";
import pl from "../locale/pl.json";

type Language = "en" | "pl";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries = {
  en,
  pl,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("app-lang") as Language;
    if (saved && ["en", "pl"].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app-lang", lang);
  };

  const t = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (dictionaries[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
