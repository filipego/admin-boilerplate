"use server";
import { assertHasPermission } from "@/lib/permissions.server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminUpdateUserResult = { success?: boolean; error?: string };

export async function adminUpdateUserAction(
  _: AdminUpdateUserResult,
  formData: FormData
): Promise<AdminUpdateUserResult> {
  const supabase = getSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { error: "Not authenticated" };

  // Permission check: users.edit
  try {
    await assertHasPermission(user.id, 'users.edit');
  } catch {
    return { error: 'Forbidden' };
  }

  const targetId = String(formData.get("id") || "");
  if (!targetId) return { error: "Missing target id" };

  const usernameRaw = formData.get("username");
  const avatarUrlRaw = formData.get("avatar_url");
  const roleRaw = formData.get("role");
  const username = typeof usernameRaw === "string" ? usernameRaw.trim() || null : null;
  const avatar_url = typeof avatarUrlRaw === "string" ? avatarUrlRaw.trim() || null : null;
  const role = typeof roleRaw === "string" && (roleRaw === "admin" || roleRaw === "client") ? roleRaw : undefined;

  const update: Record<string, unknown> = {};
  if (username !== null) update.username = username;
  if (avatar_url !== null) update.avatar_url = avatar_url;
  if (role) update.role = role;
  if (Object.keys(update).length === 0) return { success: true };

  const admin = getSupabaseAdminClient();
  const { error } = await admin.from("profiles").update(update).eq("id", targetId);
  if (error) return { error: error.message };
  return { success: true };
}


