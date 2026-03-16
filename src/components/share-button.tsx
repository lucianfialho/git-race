"use client";

import { useState } from "react";

interface ShareButtonProps {
  url: string;
  twitterText: string;
  accentColor?: string;
}

export function ShareButton({ url, twitterText, accentColor = "#e10600" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="flex gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-white rounded-sm transition-colors"
        style={{ backgroundColor: accentColor }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share on X
      </a>
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wider border border-[#e5e5e5] text-[#525252] hover:text-[#0a0a0a] hover:border-[#d4d4d4] rounded-sm transition-colors cursor-pointer"
      >
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}
