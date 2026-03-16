import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const user = data.session.user;
      const githubToken = data.session.provider_token;
      const metadata = user.user_metadata;

      // Upsert profile with GitHub data
      const admin = createAdminClient();
      const profileData: Record<string, unknown> = {
        id: user.id,
        github_id: metadata.provider_id
          ? parseInt(metadata.provider_id)
          : 0,
        github_username: metadata.user_name || metadata.preferred_username,
        avatar_url: metadata.avatar_url,
      };

      // Only set token if we received one (it's only available on initial OAuth)
      if (githubToken) {
        profileData.github_token = githubToken;
      }

      const { error: upsertError } = await admin.from("profiles").upsert(
        profileData,
        { onConflict: "id", ignoreDuplicates: false }
      );

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);
        // Try insert if upsert fails (might be unique constraint on github_id)
        const { error: insertError } = await admin.from("profiles").insert(profileData);
        if (insertError) {
          console.error("Profile insert also failed:", insertError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth error:", error);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
