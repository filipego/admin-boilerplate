"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import UIButton from "@/components/common/UIButton";
import { showSaved, showError } from "@/lib/toast";
import ImageCropUpload from "@/components/uploader/ImageCropUpload";
import { updateProfileAction } from "./actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string;
  username: string | null;
  avatar_url: string | null;
  role: string;
};

export default function ProfileViewEdit({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [username, setUsername] = useState<string>(profile.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "taken" | "available">("idle");
  const [state, formAction] = useActionState(updateProfileAction, {} as { success?: boolean; error?: string });

  useEffect(() => {
    if (state?.success) {
      showSaved();
      setEditing(false);
    }
    if (state?.error) showError(state.error);
  }, [state?.success, state?.error]);

  useEffect(() => {
    if (!editing) return;
    const controller = new AbortController();
    const check = async () => {
      if (!username || username === (profile.username ?? "")) {
        setUsernameStatus("idle");
        return;
      }
      try {
        setUsernameStatus("checking");
        const res = await fetch(`/api/username-available?username=${encodeURIComponent(username)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setUsernameStatus(json.available ? "available" : "taken");
      } catch {
        // ignore
      }
    };
    const t = setTimeout(check, 400);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [username, editing, profile.username]);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const handlePasswordChange = async () => {
    const newPassword = prompt("Enter new password");
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else alert("Password updated");
  };

  if (!editing) {
    return (
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <div className="size-16 rounded-full overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {avatarUrl ? <img src={avatarUrl} alt="avatar" className="size-full object-cover" /> : null}
          </div>
          <div>
            <div className="font-medium">{profile.username ?? "—"}</div>
            <div className="text-sm text-muted-foreground">{profile.email}</div>
          </div>
        </div>
        <div className="text-sm">Role: {profile.role}</div>
        <div className="flex gap-3">
          <UIButton onClick={() => setEditing(true)}>Edit</UIButton>
          <UIButton variant="outline" onClick={handlePasswordChange}>Change Password</UIButton>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="avatar_url" value={avatarUrl ?? ""} />
      <div className="grid gap-2">
        <label className="text-sm">Avatar</label>
        <ImageCropUpload
          userId={profile.id}
          initialUrl={avatarUrl}
          onUploaded={async (url) => {
            setAvatarUrl(url);
            // Persist immediately so header/sidebar/users reflect new avatar without waiting for Save
            const { error } = await supabase
              .from("profiles")
              .update({ avatar_url: url })
              .eq("id", profile.id);
            if (error) showError(error.message);
          }}
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="username" className="text-sm">Username</label>
        <input
          id="username"
          name="username"
          className="px-3 py-2 rounded-md border bg-background"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {usernameStatus === "taken" && <p className="text-xs text-red-500">Username is taken</p>}
        {usernameStatus === "available" && <p className="text-xs text-green-600">Username is available</p>}
      </div>
      <div className="flex gap-3">
        <UIButton type="submit" disabled={usernameStatus === "taken"}>Save</UIButton>
        <UIButton variant="secondary" type="button" onClick={() => setEditing(false)}>Cancel</UIButton>
      </div>
    </form>
  );
}


