import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await params;
  const admin = createAdminClient();

  const { data: card } = await admin
    .from("share_cards")
    .select("*, profiles(*), races(*)")
    .eq("id", cardId)
    .single();

  if (!card) {
    return new Response("Not found", { status: 404 });
  }

  const profile = card.profiles as unknown as {
    github_username: string;
    avatar_url: string;
    car_color: string;
    car_number: number;
  };

  const race = card.races as unknown as { name: string } | null;
  const meta = (card.metadata || {}) as {
    position?: number;
    points?: number;
    speed?: number;
  };

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
          fontFamily: "system-ui",
          position: "relative",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle at center, ${profile.car_color}22, transparent)`,
            display: "flex",
          }}
        />

        {/* Color bar at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: profile.car_color,
            display: "flex",
          }}
        />

        {/* Top section */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#666",
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "4px",
              }}
            >
              Race Result
            </span>
            <span
              style={{
                color: "#fff",
                fontSize: "36px",
                fontWeight: "bold",
                marginTop: "8px",
              }}
            >
              {race?.name || "GitRace"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span
              style={{
                color: "#fff",
                fontSize: "120px",
                fontWeight: "900",
                lineHeight: "1",
              }}
            >
              P{meta.position || "?"}
            </span>
          </div>
        </div>

        {/* Bottom section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <img
              src={profile.avatar_url}
              width="80"
              height="80"
              style={{
                borderRadius: "50%",
                border: `3px solid ${profile.car_color}`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  color: "#fff",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                {profile.github_username}
              </span>
              <div style={{ display: "flex", gap: "20px", color: "#888", fontSize: "18px" }}>
                <span>#{profile.car_number}</span>
                <span>{meta.points || 0} pts</span>
                <span>Speed: {(meta.speed || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>

          <span
            style={{
              color: "#fff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            GitRace
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
