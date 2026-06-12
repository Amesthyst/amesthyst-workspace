"use client";

import { useEffect, useState } from "react";

export type Language = "en" | "id";

export function useLanguage() {
  const [language, setLanguage] =
    useState<Language>("en");

  useEffect(() => {
    const saved =
      localStorage.getItem("language");

    if (
      saved === "en" ||
      saved === "id"
    ) {
      setLanguage(saved);
    }
  }, []);

  function changeLanguage(
    language: Language
  ) {
    localStorage.setItem(
      "language",
      language
    );

    setLanguage(language);
  }

  return {
    language,
    changeLanguage,
  };
}