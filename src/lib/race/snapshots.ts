import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface QualifyingSnapshot {
  position: number;
  name: string;
  profileId: string;
  isBot: boolean;
  avatarUrl: string;
  q1Time: number;
  q2Time: number | null;
  q3Time: number | null;
  eliminatedIn: string | null;
}

export interface RaceResultSnapshot {
  position: number;
  name: string;
  profileId: string;
  isBot: boolean;
  avatarUrl: string;
  gridPosition: number;
  points: number;
  fastestLap: boolean;
  dnf: boolean;
  dnfReason: string | null;
  gap: number;
}

export interface RaceDataSnapshot {
  results: RaceResultSnapshot[];
  events: Array<{ lap: number; type: string; description: string }>;
  hadRain: boolean;
  safetyCars: number;
}

export interface RaceSnapshot {
  gp_slug: string;
  qualifying_data: QualifyingSnapshot[] | null;
  race_data: RaceDataSnapshot | null;
  simulated_at: string;
}

/**
 * Load a race snapshot from the database (using the anon/user client for page reads).
 * Uses cookies-based server client — only call from pages/server components.
 */
export async function loadSnapshot(gpSlug: string): Promise<RaceSnapshot | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("race_snapshots")
    .select("gp_slug, qualifying_data, race_data, simulated_at")
    .eq("gp_slug", gpSlug)
    .single();

  return data as RaceSnapshot | null;
}

/**
 * Load a race snapshot using the admin client (no cookies needed).
 * Use this from cron routes and API routes that lack cookie context.
 */
export async function loadSnapshotAdmin(gpSlug: string): Promise<RaceSnapshot | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("race_snapshots")
    .select("gp_slug, qualifying_data, race_data, simulated_at")
    .eq("gp_slug", gpSlug)
    .single();

  return data as RaceSnapshot | null;
}

/**
 * Save qualifying + race data to race_snapshots using the admin client.
 * Upserts by gp_slug.
 */
export async function saveSnapshot(
  gpSlug: string,
  qualifyingData: QualifyingSnapshot[] | null,
  raceData: RaceDataSnapshot | null
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("race_snapshots").upsert(
    {
      gp_slug: gpSlug,
      qualifying_data: qualifyingData,
      race_data: raceData,
      simulated_at: new Date().toISOString(),
    },
    { onConflict: "gp_slug" }
  );
}
