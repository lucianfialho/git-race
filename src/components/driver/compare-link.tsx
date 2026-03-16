"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CompareLink({ username }: { username: string }) {
  const [opponent, setOpponent] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = opponent.trim();
    if (trimmed && trimmed !== username) {
      router.push(`/compare/${username}/${trimmed}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-6">
      <input
        type="text"
        value={opponent}
        onChange={(e) => setOpponent(e.target.value)}
        placeholder="Enter GitHub username..."
        className="flex-1 px-4 py-2.5 rounded-lg border border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] transition-colors"
      />
      <button type="submit" className="f1-btn f1-btn-primary text-sm">
        Compare
      </button>
    </form>
  );
}
