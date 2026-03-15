"use client";

import { GPThemeContext, type GPThemeContextValue } from "@/lib/f1/theme-context";
import type { ReactNode } from "react";

export function ThemeProvider({
  value,
  children,
}: {
  value: GPThemeContextValue;
  children: ReactNode;
}) {
  const { theme } = value;

  return (
    <GPThemeContext.Provider value={value}>
      <div
        style={{
          ["--gp-primary" as string]: theme.primary,
          ["--gp-secondary" as string]: theme.secondary,
          ["--gp-accent" as string]: theme.accent,
          ["--gp-bg" as string]: theme.bg,
        }}
      >
        {children}
      </div>
    </GPThemeContext.Provider>
  );
}
