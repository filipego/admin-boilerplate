"use client";

import UIButton from "@/components/common/UIButton";
import ImageCropUpload from "@/components/uploader/ImageCropUpload";
import { useActionState, useEffect, useMemo, useState } from "react";
import { showSaved, showError } from "@/lib/toast";
import { adminUpdateUserAction } from "./actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminUserControls({ userId }: { userId: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<"admin" | "client">("client");
  const [state, formAction] = useActionState(adminUpdateUserAction, {} as { success?: boolean; error?: string });

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    // Load current user data into admin edit controls
    const load = async () => {
      const { data } = await supabase.from("profiles").select("username, avatar_url, role").eq("id", userId).single();
      setUsername(data?.username ?? "");
      setAvatarUrl(data?.avatar_url ?? null);
      setRole(data?.role === "admin" ? "admin" : "client");
    };
    load();
  }, [supabase, userId]);

  useEffect(() => {
    if (state?.success) showSaved();
    if (state?.error) showError(state.error);
  }, [state?.success, state?.error]);

  return (
    <form action={formAction} className="grid gap-4 mt-6 border-t pt-4">
      <input type="hidden" name="id" value={userId} />
      <div className="text-sm font-medium">Admin Controls</div>
      <div className="grid gap-2">
        <label className="text-sm">Avatar</label>
        <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
        <ImageCropUpload userId={userId} initialUrl={avatarUrl} onUploaded={setAvatarUrl} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm" htmlFor="admin-username">Username</label>
        <input id="admin-username" name="username" className="px-3 py-2 rounded-md border bg-background" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm" htmlFor="admin-role">Role</label>
        <select id="admin-role" name="role" className="px-3 py-2 rounded-md border bg-background" value={role} onChange={(e) => setRole(e.target.value === "admin" ? "admin" : "client")}>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex gap-3">
        <UIButton type="submit">Save</UIButton>
        <UIButton asChild variant="outline">
          <Link href="/users">Back</Link>
        </UIButton>
      </div>
    </form>
  );
}


