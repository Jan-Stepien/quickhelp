"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  // Initialize from DOM — the no-flash inline script has already set the correct class
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("qh-theme") as Theme | null;
    const t = (stored === "light" || stored === "dark" || stored === "system") ? stored : "system";
    // Read actual DOM state set by the no-flash script rather than re-computing from matchMedia
    const r: "light" | "dark" = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState(t);
    setResolvedTheme(r);
  }, []);

  const setTheme = (t: Theme) => {
    const r: "light" | "dark" =
      t === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        : t;
    setThemeState(t);
    setResolvedTheme(r);
    localStorage.setItem("qh-theme", t);
    document.documentElement.classList.toggle("dark", r === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
