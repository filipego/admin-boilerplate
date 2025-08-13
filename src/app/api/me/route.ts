import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const admin = getSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, username, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


