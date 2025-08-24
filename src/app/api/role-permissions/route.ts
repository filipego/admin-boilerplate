import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkOrigin, rateLimit } from "@/lib/utils";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data } = await admin.from('role_permissions').select('role, permission_key');
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(req: Request) {
  if (!rateLimit(req, 20, 60_000)) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  if (!checkOrigin(req)) return NextResponse.json({ error: "Bad Origin" }, { status: 400 });
  const supabase = getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const admin = getSupabaseAdminClient();
  const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (me?.role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { rows } = (await req.json()) as { rows?: { role: string; permission_key: string }[] };
  if (!Array.isArray(rows)) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  await admin.from('role_permissions').delete().in('role', ['admin', 'client']);
  if (rows.length) await admin.from('role_permissions').insert(rows);
  return NextResponse.json({ ok: true });
}


