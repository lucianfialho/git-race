import { NextResponse } from "next/server";
import { syncAllProfiles } from "@/lib/github/sync";
import { getMostRelevantGP, getNow } from "@/lib/f1/calendar";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = getNow();
    const gp = getMostRelevantGP(now);

    let periodStart: Date;
    let periodEnd: Date;

    if (gp) {
      periodStart = new Date(gp.dates.qualiStart);
      periodEnd = new Date(gp.dates.raceDate);
    } else {
      // Fallback: current week
      const d = new Date(now);
      const day = d.getUTCDay();
      const diff = day === 0 ? -6 : 1 - day;
      periodStart = new Date(d);
      periodStart.setUTCDate(d.getUTCDate() + diff);
      periodStart.setUTCHours(0, 0, 0, 0);
      periodEnd = new Date(periodStart);
      periodEnd.setUTCDate(periodStart.getUTCDate() + 6);
      periodEnd.setUTCHours(23, 59, 59, 999);
    }

    const result = await syncAllProfiles(periodStart, periodEnd);

    return NextResponse.json({
      success: true,
      gp: gp?.name ?? "Current week",
      ...result,
    });
  } catch (error) {
    console.error("Cron sync failed:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
