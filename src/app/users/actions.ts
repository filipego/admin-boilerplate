"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type CreateUserInput = {
	email: string;
	username: string;
	password: string;
	role: "admin" | "client";
	avatarDataUrl?: string; // optional public URL (already uploaded)
};

export async function createUserAdmin(input: CreateUserInput) {
	const admin = getSupabaseAdminClient();
	const { data: created, error } = await admin.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true });
	if (error || !created.user) throw new Error(error?.message || "Failed to create user");
	const userId = created.user.id;

	const avatarUrl: string | null = input.avatarDataUrl ?? null;

	await admin.from("profiles").upsert({ id: userId, email: input.email, username: input.username, role: input.role, avatar_url: avatarUrl });

	// notify via realtime by updating a timestamp (optional safeguard)
	await admin.from("profiles").update({ updated_at: new Date().toISOString() }).eq("id", userId);
	return { ok: true, userId } as const;
}


