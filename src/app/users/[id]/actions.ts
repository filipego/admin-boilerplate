"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminUpdateUserResult = { success?: boolean; error?: string };

export async function adminUpdateUserAction(
  _: AdminUpdateUserResult,
  formData: FormData
): Promise<AdminUpdateUserResult> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: me, error: meErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (meErr) return { error: meErr.message };
  if (me?.role !== "admin") return { error: "Forbidden" };

  const targetId = String(formData.get("id") || "");
  if (!targetId) return { error: "Missing target id" };

  const usernameRaw = formData.get("username");
  const avatarUrlRaw = formData.get("avatar_url");
  const roleRaw = formData.get("role");
  const username = typeof usernameRaw === "string" ? usernameRaw.trim() || null : null;
  const avatar_url = typeof avatarUrlRaw === "string" ? avatarUrlRaw.trim() || null : null;
  const role = typeof roleRaw === "string" && (roleRaw === "admin" || roleRaw === "client") ? roleRaw : undefined;

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ username, avatar_url, role }).eq("id", targetId);
  if (error) return { error: error.message };
  return { success: true };
}


