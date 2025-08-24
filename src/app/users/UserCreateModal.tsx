"use client";

import { useEffect, useState } from "react";
import UIModal from "@/components/common/UIModal";
import { RHFForm } from "@/components/common/form/Form";
import { TextField } from "@/components/common/form/Fields";
import UIButton from "@/components/common/UIButton";
import { z } from "zod";
import ImageCropUpload from "@/components/uploader/ImageCropUpload";
import { createUserAdmin } from "./actions";

const schema = z.object({
	email: z.string().email(),
	username: z.string().min(2),
	password: z.string().min(6),
	role: z.enum(["admin", "client"]).default("client"),
});

export default function UserCreateModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
	const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [uploaderUserId, setUploaderUserId] = useState<string>("");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        if (!res.ok) return;
        const json = await res.json();
        const id = json.profile?.id as string | undefined;
        if (id) setUploaderUserId(id);
      } catch {}
    })();
  }, []);
	return (
		<UIModal open={open} onOpenChange={onOpenChange} title="Create User" description="Create auth user and profile">
			<RHFForm
				schema={schema}
				defaultValues={{ email: "", username: "", password: "", role: "client" }}
				onSubmit={async (values) => {
					await createUserAdmin({ ...values, avatarDataUrl: avatarUrl });
					onOpenChange(false);
				}}
			>
				<TextField name="email" label="Email" placeholder="user@example.com" />
				<TextField name="username" label="Username" placeholder="Username" />
				<TextField name="password" label="Password" placeholder="Password" />
				<div className="grid gap-2 mt-1">
					<label className="text-xs font-medium">Role</label>
					<select name="role" className="px-2 py-1 rounded-md border bg-background text-sm">
						<option value="client">Client</option>
						<option value="admin">Admin</option>
					</select>
				</div>
				<div className="space-y-2 mt-2">
					<div className="text-xs font-medium">Avatar (optional)</div>
					<ImageCropUpload userId={uploaderUserId || "temp"} initialUrl={avatarUrl} onUploaded={(url) => setAvatarUrl(url)} />
				</div>
				<div className="flex justify-end gap-2 mt-2">
					<UIButton variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancel</UIButton>
					<UIButton type="submit">Create</UIButton>
				</div>
			</RHFForm>
		</UIModal>
	);
}


