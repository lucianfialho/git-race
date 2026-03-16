"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback`,
        scopes: "read:user repo",
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Red accent bar */}
      <div className="h-1 w-full bg-[#e10600]" />

      {/* Main content — centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Wordmark */}
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight leading-none text-white">
            GITRACE
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white/30 mt-4">
            Your GitHub. Your Race.
          </p>

          {/* Explanation */}
          <p className="text-white/40 text-sm mt-6 max-w-sm mx-auto leading-relaxed">
            Your commits, PRs, and reviews become car performance.
            Qualify during the week, race on weekends, climb from F3 to F1.
          </p>

          {/* Divider */}
          <div className="w-12 h-[2px] bg-[#e10600] mx-auto mt-10 mb-10" />

          {/* Sign in button */}
          <button
            onClick={handleLogin}
            className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-white text-[#0a0a0a] font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-sm hover:bg-white/90 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Sign in with GitHub
          </button>

          {/* Permissions note */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 mt-6">
            We read your public contribution activity to calculate race performance.
          </p>

          {/* Navigation links */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <Link
              href="/"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
              Home
            </Link>
            <span className="text-white/10">|</span>
            <Link
              href="/leaderboard"
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white/60 transition-colors"
            >
              View Standings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
