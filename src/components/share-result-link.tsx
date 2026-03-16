"use client";

import Link from "next/link";

interface ShareResultLinkProps {
  slug: string;
  username: string;
  accentColor?: string;
}

export function ShareResultLink({
  slug,
  username,
  accentColor = "#e10600",
}: ShareResultLinkProps) {
  return (
    <Link
      href={`/gp/${slug}/result/${username}`}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-sm transition-opacity hover:opacity-90"
      style={{ backgroundColor: accentColor }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
      Share My Result
    </Link>
  );
}
