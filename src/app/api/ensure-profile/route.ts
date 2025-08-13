import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const admin = getSupabaseAdminClient();
    // Ensure row exists
    await admin.from("profiles").upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id" });

    // Sync admin role from env if configured
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      await admin.from("profiles").update({ role: "admin" }).eq("id", user.id);
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("id, email, username, avatar_url, role")
      .eq("id", user.id)
      .maybeSingle();

    const res = NextResponse.json({ profile });
    if (profile?.role) {
      // Cache role in an HttpOnly cookie to avoid repeated DB checks on each page
      res.cookies.set("role", String(profile.role), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 });
    }
    return res;
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


