"use client";

import { createContext, useContext } from "react";
import type { GrandPrix, GPThemeColors } from "./calendar";

export interface GPThemeContextValue {
  gp: GrandPrix | null;
  theme: GPThemeColors;
  status: string | null;
}

export const GPThemeContext = createContext<GPThemeContextValue>({
  gp: null,
  theme: { primary: "#E10600", secondary: "#FFFFFF", accent: "#15151E", bg: "#111111" },
  status: null,
});

export function useGPTheme() {
  return useContext(GPThemeContext);
}
