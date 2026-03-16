"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type RaceEvent = {
  lap: number;
  type: string;
  description: string;
  involvedDrivers?: string[];
};

type Speed = 1 | 2 | 5;

const BADGE_COLORS: Record<string, string> = {
  safety_car: "bg-yellow-400 text-yellow-950",
  rain: "bg-blue-400 text-blue-950",
  dnf: "bg-red-500 text-white",
  fastest_lap: "bg-purple-500 text-white",
};

const BASE_DELAY_MS = 400;

export function EventTimeline({ events }: { events: RaceEvent[] }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<Speed>(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setVisibleCount((prev) => {
        if (prev >= events.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, BASE_DELAY_MS / speed);
  }, [events.length, speed, clearTimer]);

  useEffect(() => {
    if (isPlaying && visibleCount < events.length) {
      scheduleNext();
    }
    return clearTimer;
  }, [isPlaying, visibleCount, scheduleNext, clearTimer, events.length]);

  // Auto-scroll to latest event
  useEffect(() => {
    if (containerRef.current && visibleCount > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleCount]);

  const handleReplay = () => {
    clearTimer();
    setVisibleCount(0);
    setIsPlaying(true);
  };

  const handleSkip = () => {
    clearTimer();
    setVisibleCount(events.length);
    setIsPlaying(false);
  };

  const badgeClass = (type: string) =>
    BADGE_COLORS[type] ?? "bg-[#f5f5f5] text-[#525252]";

  const finished = visibleCount >= events.length;

  return (
    <div className="rounded-sm border border-[#e5e5e5] p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#0a0a0a] text-sm uppercase tracking-wider">
          Race Timeline
        </h3>
        <div className="flex items-center gap-2">
          {/* Speed controls */}
          <div className="flex rounded-sm border border-[#e5e5e5] overflow-hidden">
            {([1, 2, 5] as Speed[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                  speed === s
                    ? "bg-[#0a0a0a] text-white"
                    : "bg-white text-[#a3a3a3] hover:text-[#525252]"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Skip button */}
          {isPlaying && (
            <button
              onClick={handleSkip}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a3a3a3] hover:text-[#0a0a0a] border border-[#e5e5e5] rounded-sm transition-colors"
            >
              Skip
            </button>
          )}

          {/* Replay button */}
          <button
            onClick={handleReplay}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-colors ${
              finished
                ? "bg-[#0a0a0a] text-white border-[#0a0a0a] hover:bg-[#262626]"
                : "text-[#a3a3a3] hover:text-[#0a0a0a] border-[#e5e5e5]"
            }`}
          >
            Replay
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-[#f5f5f5] rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-[#0a0a0a] transition-all duration-300 ease-out"
          style={{ width: `${events.length > 0 ? (visibleCount / events.length) * 100 : 0}%` }}
        />
      </div>

      {/* Events list */}
      <div ref={containerRef} className="space-y-2 max-h-[300px] overflow-y-auto">
        {events.slice(0, visibleCount).map((e, i) => (
          <div
            key={i}
            className="timeline-event flex gap-3 items-start"
            style={{ animationDelay: "0ms" }}
          >
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm shrink-0 w-10 text-center ${badgeClass(e.type)}`}
            >
              L{e.lap}
            </span>
            <p className="text-[#525252] text-sm">{e.description}</p>
          </div>
        ))}

        {isPlaying && visibleCount < events.length && (
          <div className="flex items-center gap-2 py-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a3a3a3] animate-pulse" />
            <span className="text-[10px] text-[#a3a3a3] font-bold uppercase tracking-wider">
              Live
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
