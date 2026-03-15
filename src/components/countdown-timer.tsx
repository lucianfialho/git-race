"use client";

import { useState, useEffect } from "react";

function getTimeRemaining(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export function CountdownTimer({
  targetDate,
  liveLabel = "LIVE",
  finishedLabel = "Finished",
}: {
  targetDate: string;
  liveLabel?: string;
  finishedLabel?: string;
}) {
  const target = new Date(targetDate);
  const [time, setTime] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining(target));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--gp-primary)" }}>
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--gp-primary)" }} />
        {liveLabel}
      </span>
    );
  }

  const blocks = [
    { value: time.days, label: "d" },
    { value: time.hours, label: "h" },
    { value: time.minutes, label: "m" },
    { value: time.seconds, label: "s" },
  ].filter((b) => b.value > 0 || b.label === "s");

  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {blocks.map((b) => (
        <span key={b.label} className="text-white">
          {String(b.value).padStart(2, "0")}
          <span className="text-neutral-500">{b.label}</span>
          {b.label !== "s" && <span className="text-neutral-600 mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
}
