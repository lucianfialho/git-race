"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface RaceTabsProps {
  slug: string;
  accentColor: string;
}

export function RaceTabs({ slug, accentColor }: RaceTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "race";

  function handleTabChange(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "race") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.push(`/gp/${slug}/race${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex gap-1 bg-[#f5f5f5] p-1 rounded-sm w-fit">
      {(["sprint", "race"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] rounded-sm transition-colors"
            style={{
              backgroundColor: isActive ? accentColor : "transparent",
              color: isActive ? "#ffffff" : "#737373",
            }}
          >
            {tab === "sprint" ? "Sprint" : "Race"}
          </button>
        );
      })}
    </div>
  );
}
