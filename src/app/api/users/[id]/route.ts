import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = params;
  const { data } = await admin
    .from('profiles')
    .select('id, email, username, avatar_url, role')
    .eq('id', id)
    .maybeSingle();
  return NextResponse.json({ user: data ?? null });
}


