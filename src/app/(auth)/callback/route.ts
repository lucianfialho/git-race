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
      await admin.from("profiles").upsert(
        {
          id: user.id,
          github_id: metadata.provider_id
            ? parseInt(metadata.provider_id)
            : 0,
          github_username: metadata.user_name || metadata.preferred_username,
          avatar_url: metadata.avatar_url,
          github_token: githubToken,
        },
        { onConflict: "id" }
      );

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
