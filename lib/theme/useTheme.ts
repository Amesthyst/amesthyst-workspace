"use client";

import { useEffect } from "react";

export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme(theme: Theme) {
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}