"use client";

import Link from "next/link";
import { useState } from "react";
import { useGPTheme } from "@/lib/f1/theme-context";

export function Nav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { gp, status } = useGPTheme();

  const statusLabel =
    status === "qualifying" ? "Qualifying Live" :
    status === "sprint" ? "Sprint Day" :
    status === "race_day" ? "Race Day" :
    gp ? gp.name : null;

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg text-white">
          GitRace
        </Link>
        {statusLabel && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
            {(status === "qualifying" || status === "sprint" || status === "race_day") && (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--gp-primary)" }} />
            )}
            <span className="text-neutral-300">{statusLabel}</span>
          </span>
        )}
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-5">
        <Link href="/calendar" className="text-neutral-400 text-sm hover:text-white transition-colors">Calendar</Link>
        <Link href="/leaderboard" className="text-neutral-400 text-sm hover:text-white transition-colors">Standings</Link>
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-neutral-400 text-sm hover:text-white transition-colors">Dashboard</Link>
            <Link href="/achievements" className="text-neutral-400 text-sm hover:text-white transition-colors">Achievements</Link>
          </>
        ) : (
          <Link href="/login" className="bg-white text-black font-medium px-4 py-1.5 rounded-lg text-sm hover:bg-neutral-200 transition-colors">
            Sign in
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-neutral-400 hover:text-white p-1"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          {menuOpen ? (
            <path d="M6 6l12 12M6 18L18 6" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-neutral-950 border-b border-neutral-800 p-4 flex flex-col gap-3 md:hidden">
          <Link href="/calendar" className="text-neutral-300 py-2" onClick={() => setMenuOpen(false)}>Calendar</Link>
          <Link href="/leaderboard" className="text-neutral-300 py-2" onClick={() => setMenuOpen(false)}>Standings</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-neutral-300 py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/achievements" className="text-neutral-300 py-2" onClick={() => setMenuOpen(false)}>Achievements</Link>
            </>
          ) : (
            <Link href="/login" className="bg-white text-black font-medium px-4 py-2 rounded-lg text-sm text-center" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
