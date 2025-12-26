import { createContext, useContext, useState, useEffect } from "react";
import en from "@/lib/locales/en.json";
import tr from "@/lib/locales/tr.json";

const translations = { en, tr };

// Translations are loaded from JSON files in src/lib/locales (en.json, tr.json)

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("app-language");
    if (saved) return saved;
    
    // Auto-detect from browser
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith("tr") ? "tr" : "en";
  });

  useEffect(() => {
    localStorage.setItem("app-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
