import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/nav";
import { getCurrentGP, getNextGP, getGPStatus, getCurrentTheme } from "@/lib/f1/calendar";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitRace Manager - F1 Meets GitHub",
  description:
    "Your GitHub contributions power your F1 car. Qualify during the week, race on weekends. Follow the real F1 calendar.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const gp = getCurrentGP(now) ?? getNextGP(now);
  const theme = getCurrentTheme(now);
  const status = gp ? getGPStatus(gp, now) : null;

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-white`}
      >
        <ThemeProvider value={{ gp, theme, status }}>
          <Nav isAuthenticated={!!user} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
