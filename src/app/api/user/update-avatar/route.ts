import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { userId, url } = await req.json();
    if (!userId || !url) return NextResponse.json({ error: "Missing userId or url" }, { status: 400 });

    // Auth
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    const me = auth.user;
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getSupabaseAdminClient();
    const { data: meProfile } = await admin.from("profiles").select("role").eq("id", me.id).maybeSingle();
    const isAdmin = meProfile?.role === "admin";

    if (!isAdmin && me.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await admin.from("profiles").update({ avatar_url: url }).eq("id", userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}



