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
}: {
  targetDate: string;
  liveLabel?: string;
  finishedLabel?: string;
}) {
  const target = new Date(targetDate);
  const [time, setTime] = useState(getTimeRemaining(target));

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeRemaining(target)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (time.isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#e10600]">
        <span className="w-2 h-2 rounded-full animate-pulse bg-[#e10600]" />
        {liveLabel}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      {[
        { value: time.days, label: "DAYS" },
        { value: time.hours, label: "HRS" },
        { value: time.minutes, label: "MIN" },
        { value: time.seconds, label: "SEC" },
      ].filter((b, i, arr) => {
        if (b.label === "SEC") return true;
        if (b.value > 0) return true;
        return arr.slice(0, i).some((x) => x.value > 0);
      }).map((b) => (
        <div key={b.label} className="text-center">
          <div className="text-2xl font-bold text-[#0a0a0a] leading-none">
            {String(b.value).padStart(2, "0")}
          </div>
          <div className="text-[9px] font-semibold text-[#a3a3a3] tracking-widest mt-1">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
