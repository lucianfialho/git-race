import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { getGPBySlug } from "@/lib/f1/calendar";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; username: string }> }
) {
  const { slug, username } = await params;
  const gp = getGPBySlug(slug);

  if (!gp) {
    return new Response("GP not found", { status: 404 });
  }

  const admin = createAdminClient();

  // Get profile
  const { data: profile } = await admin
    .from("profiles")
    .select("id, github_username, avatar_url, car_color, car_number")
    .eq("github_username", username)
    .single();

  if (!profile) {
    return new Response("Driver not found", { status: 404 });
  }

  // Get GP record from DB
  const { data: gpRecord } = await admin
    .from("grand_prix")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!gpRecord) {
    return new Response("GP not found in database", { status: 404 });
  }

  // Get race result
  const { data: raceResult } = await admin
    .from("race_results")
    .select("*")
    .eq("gp_id", gpRecord.id)
    .eq("profile_id", profile.id)
    .eq("is_sprint", false)
    .single();

  const position = raceResult?.final_position ?? null;
  const gridPosition = raceResult?.grid_position ?? null;
  const points = raceResult?.points_earned ?? 0;
  const fastestLap = raceResult?.fastest_lap ?? false;
  const dnf = raceResult?.dnf ?? false;

  const positionChange = gridPosition != null && position != null ? gridPosition - position : 0;
  const accentColor = gp.themeColors.primary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: `radial-gradient(circle at center, ${accentColor}20, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Accent bar at top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: accentColor,
            display: "flex",
          }}
        />

        {/* Top section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: accentColor,
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "4px",
              }}
            >
              Race Result
            </span>
            <span
              style={{
                color: "#fff",
                fontSize: "32px",
                fontWeight: 700,
                marginTop: "8px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {gp.name}
            </span>
            <span
              style={{
                color: "#666",
                fontSize: "16px",
                marginTop: "4px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {gp.circuit}
            </span>
          </div>

          {/* Position - big number */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            {dnf ? (
              <span
                style={{
                  color: "#dc2626",
                  fontSize: "120px",
                  fontWeight: 900,
                  lineHeight: "1",
                  letterSpacing: "-4px",
                }}
              >
                DNF
              </span>
            ) : (
              <span
                style={{
                  color: "#fff",
                  fontSize: "140px",
                  fontWeight: 900,
                  lineHeight: "1",
                  letterSpacing: "-6px",
                }}
              >
                P{position ?? "?"}
              </span>
            )}
          </div>
        </div>

        {/* Middle stats row */}
        <div style={{ display: "flex", gap: "40px", marginTop: "auto", marginBottom: "auto" }}>
          {/* Grid change */}
          {gridPosition != null && position != null && !dnf && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#666", fontSize: "12px", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 700 }}>
                Grid
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                <span style={{ color: "#888", fontSize: "28px", fontWeight: 700 }}>
                  P{gridPosition}
                </span>
                <span style={{ color: "#555", fontSize: "24px" }}>
                  →
                </span>
                <span style={{ color: "#fff", fontSize: "28px", fontWeight: 700 }}>
                  P{position}
                </span>
                {positionChange !== 0 && (
                  <span
                    style={{
                      color: positionChange > 0 ? "#16a34a" : "#dc2626",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    {positionChange > 0 ? `+${positionChange}` : positionChange}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Points */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#666", fontSize: "12px", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 700 }}>
              Points
            </span>
            <span style={{ color: "#fff", fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>
              +{points}
            </span>
          </div>

          {/* Fastest Lap */}
          {fastestLap && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#666", fontSize: "12px", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 700 }}>
                Fastest Lap
              </span>
              <span style={{ color: "#7c3aed", fontSize: "28px", fontWeight: 700, marginTop: "4px" }}>
                Yes
              </span>
            </div>
          )}
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img
              src={profile.avatar_url || `https://github.com/${profile.github_username}.png`}
              width="64"
              height="64"
              style={{
                borderRadius: "50%",
                border: `3px solid ${accentColor}`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#fff",
                  fontSize: "28px",
                  fontWeight: 700,
                }}
              >
                {profile.github_username}
              </span>
              <span style={{ color: "#666", fontSize: "16px" }}>
                #{profile.car_number}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "2px",
              }}
            >
              GITRACE
            </span>
            <span style={{ color: "#555", fontSize: "12px", letterSpacing: "1px" }}>
              gitrace.dev
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
