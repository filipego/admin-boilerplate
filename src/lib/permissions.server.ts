import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function assertHasPermission(userId: string, permissionKey: string) {
  const admin = getSupabaseAdminClient();
  // get role of current user
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (meErr) throw new Error(meErr.message);
  const role = me?.role as string | undefined;
  if (!role) throw new Error("Forbidden");
  // check role_permissions
  const { data: has } = await admin
    .from("role_permissions")
    .select("permission_key")
    .eq("role", role)
    .eq("permission_key", permissionKey)
    .limit(1);
  if (!has || has.length === 0) throw new Error("Forbidden");
}


