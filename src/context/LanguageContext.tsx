"use client"; // Required because Context uses React state (client-side)

import React, { createContext, useContext, useState, ReactNode } from "react";
import { en } from "../locales/en";
import { pt } from "../locales/pt";

// Define the available languages and dictionary structure
type Language = "en" | "pt";
type Dictionary = typeof en;

// Define what our context will provide to the rest of the app
interface LanguageContextType {
  language: Language;
  t: Dictionary; // 't' stands for 'translation', a standard naming convention
  toggleLanguage: () => void;
}

// Create the Context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create the Provider Component that will wrap our app
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en"); // Default is English

  // Switch between EN and PT
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  // Select the correct dictionary based on current state
  const t = language === "en" ? en : pt;

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to make it easy to use the context in other files
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}