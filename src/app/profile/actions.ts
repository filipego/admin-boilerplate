"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateProfileResult = { success?: boolean; error?: string };

export async function updateProfileAction(
  _: UpdateProfileResult,
  formData: FormData
): Promise<UpdateProfileResult> {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const usernameRaw = formData.get("username");
  const avatarUrlRaw = formData.get("avatar_url");

  const username = typeof usernameRaw === "string" ? usernameRaw.trim() || null : null;
  const avatarUrl = typeof avatarUrlRaw === "string" ? avatarUrlRaw.trim() || null : null;

  const { error } = await supabase
    .from("profiles")
    .update({ username, avatar_url: avatarUrl })
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { success: true };
}


