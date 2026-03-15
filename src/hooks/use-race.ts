"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface RaceDriver {
  id: string;
  profileId: string;
  username: string;
  avatarUrl: string;
  carColor: string;
  carNumber: number;
  position: number;
  lapProgress: number;
  speed: number;
  pitStops: number;
  fastestLap: boolean;
  dnf: boolean;
  pointsEarned: number;
}

export interface RaceData {
  id: string;
  name: string;
  slug: string;
  status: "upcoming" | "active" | "finished";
  trackConfig: { name: string };
  periodStart: string;
  periodEnd: string;
  drivers: RaceDriver[];
}

export function useRace(raceId?: string) {
  const [race, setRace] = useState<RaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRace = useCallback(async () => {
    const supabase = createClient();

    try {
      let raceQuery;

      if (raceId) {
        raceQuery = supabase
          .from("races")
          .select("*")
          .eq("id", raceId)
          .single();
      } else {
        // Get current active race
        raceQuery = supabase
          .from("races")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
      }

      const { data: raceData, error: raceError } = await raceQuery;

      if (raceError) {
        // Try latest finished race if no active
        if (!raceId) {
          const { data: finishedRace } = await supabase
            .from("races")
            .select("*")
            .eq("status", "finished")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!finishedRace) {
            setError("No races found");
            setLoading(false);
            return;
          }

          Object.assign(raceData ?? {}, finishedRace);
        } else {
          throw raceError;
        }
      }

      const targetRace = raceData;
      if (!targetRace) {
        setError("No races found");
        setLoading(false);
        return;
      }

      // Fetch race entries with profiles
      const { data: entries } = await supabase
        .from("race_entries")
        .select("*, profiles(github_username, avatar_url, car_color, car_number)")
        .eq("race_id", targetRace.id)
        .order("current_position", { ascending: true });

      const drivers: RaceDriver[] = (entries || []).map((entry) => {
        const profile = entry.profiles as unknown as {
          github_username: string;
          avatar_url: string;
          car_color: string;
          car_number: number;
        };
        return {
          id: entry.id,
          profileId: entry.profile_id,
          username: profile?.github_username || "Unknown",
          avatarUrl: profile?.avatar_url || "",
          carColor: profile?.car_color || "#ff0000",
          carNumber: profile?.car_number || 0,
          position: entry.current_position || 0,
          lapProgress: entry.lap_progress || 0,
          speed: entry.speed || 0,
          pitStops: entry.pit_stops || 0,
          fastestLap: entry.fastest_lap || false,
          dnf: entry.dnf || false,
          pointsEarned: entry.points_earned || 0,
        };
      });

      setRace({
        id: targetRace.id,
        name: targetRace.name,
        slug: targetRace.slug,
        status: targetRace.status,
        trackConfig: targetRace.track_config,
        periodStart: targetRace.period_start,
        periodEnd: targetRace.period_end,
        drivers,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load race");
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    fetchRace();
  }, [fetchRace]);

  return { race, loading, error, refetch: fetchRace };
}
