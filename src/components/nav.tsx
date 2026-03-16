"use client";

import Link from "next/link";
import { useState } from "react";
import { useGPTheme } from "@/lib/f1/theme-context";

export function Nav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { gp, status } = useGPTheme();

  const statusLabel =
    status === "qualifying" ? "Qualifying" :
    status === "sprint" ? "Sprint" :
    status === "race_day" ? "Race Day" : null;

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-[#e5e5e5]">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg tracking-tight text-[#0a0a0a]">
          GITRACE
        </Link>
        {statusLabel && gp && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e10600] animate-pulse" />
            <span className="text-[#525252]">{gp.name} — {statusLabel}</span>
          </span>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/calendar" className="text-[#525252] text-sm font-medium hover:text-[#0a0a0a] transition-colors">Calendar</Link>
        <Link href="/leaderboard" className="text-[#525252] text-sm font-medium hover:text-[#0a0a0a] transition-colors">Standings</Link>
        {isAuthenticated ? (
          <>
            <Link href="/dashboard" className="text-[#525252] text-sm font-medium hover:text-[#0a0a0a] transition-colors">Dashboard</Link>
            <Link href="/achievements" className="text-[#525252] text-sm font-medium hover:text-[#0a0a0a] transition-colors">Achievements</Link>
          </>
        ) : (
          <Link href="/login" className="f1-btn-primary text-sm px-4 py-2 rounded-lg font-semibold">
            Sign in with GitHub
          </Link>
        )}
      </div>

      {/* Mobile */}
      <button
        className="md:hidden text-[#525252] hover:text-[#0a0a0a] p-1"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-[#e5e5e5] p-4 flex flex-col gap-3 md:hidden z-50">
          <Link href="/calendar" className="text-[#0a0a0a] py-2 font-medium" onClick={() => setMenuOpen(false)}>Calendar</Link>
          <Link href="/leaderboard" className="text-[#0a0a0a] py-2 font-medium" onClick={() => setMenuOpen(false)}>Standings</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-[#0a0a0a] py-2 font-medium" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/achievements" className="text-[#0a0a0a] py-2 font-medium" onClick={() => setMenuOpen(false)}>Achievements</Link>
            </>
          ) : (
            <Link href="/login" className="f1-btn-primary text-sm px-4 py-2 rounded-lg text-center font-semibold" onClick={() => setMenuOpen(false)}>
              Sign in with GitHub
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
