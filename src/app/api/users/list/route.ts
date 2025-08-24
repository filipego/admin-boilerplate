import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getSupabaseAdminClient();
  const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await admin
    .from('profiles')
    .select('id, email, username, role, avatar_url, created_at')
    .order('created_at', { ascending: false });
  return NextResponse.json({ users: data ?? [] });
}


