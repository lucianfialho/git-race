import { NextResponse } from "next/server";
import { syncAllProfiles } from "@/lib/github/sync";
import { getOrCreateCurrentRace } from "@/lib/race/engine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const race = await getOrCreateCurrentRace();
    const periodStart = new Date(race.period_start);
    const periodEnd = new Date(race.period_end);

    const result = await syncAllProfiles(periodStart, periodEnd);

    return NextResponse.json({
      success: true,
      race: race.name,
      ...result,
    });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
