"use client";

interface ShareCardProps {
  username: string;
  avatarUrl: string;
  carColor: string;
  carNumber: number;
  position: number;
  points: number;
  raceName: string;
  speed: number;
}

export function ShareCard({
  username,
  avatarUrl,
  carColor,
  carNumber,
  position,
  points,
  raceName,
  speed,
}: ShareCardProps) {
  return (
    <div className="w-[600px] h-[315px] bg-neutral-950 relative overflow-hidden rounded-xl border border-neutral-800">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${carColor}, transparent 60%)`,
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Top: Race info */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest">
              Race Result
            </p>
            <p className="text-white font-bold text-lg mt-1">{raceName}</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-white">
              P{position}
            </p>
          </div>
        </div>

        {/* Bottom: Driver info */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt={username}
              className="w-14 h-14 rounded-full border-2"
              style={{ borderColor: carColor }}
            />
            <div>
              <p className="text-white font-bold text-xl">{username}</p>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <span className="font-mono">#{carNumber}</span>
                <span>{points} pts</span>
                <span>Speed: {speed.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-600 text-xs">
            <span className="font-bold text-sm text-white">GitRace</span>
          </div>
        </div>
      </div>

      {/* Color bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: carColor }}
      />
    </div>
  );
}
