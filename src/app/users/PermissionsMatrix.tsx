"use client";

import { useEffect, useState } from "react";
import UIButton from "@/components/common/UIButton";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Perm = { key: string; label: string };
type RolePerm = { role: string; permission_key: string };

const ROLES: Array<"admin" | "client"> = ["admin", "client"];

export default function PermissionsMatrix() {
  const supabase = getSupabaseBrowserClient();
  const [perms, setPerms] = useState<Perm[]>([]);
  const [rp, setRp] = useState<Record<string, Set<string>>>({ admin: new Set(), client: new Set() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("permissions").select("key, label").order("key");
      const { data: map } = await supabase.from("role_permissions").select("role, permission_key");
      const roles: Record<string, Set<string>> = { admin: new Set(), client: new Set() };
      (map as RolePerm[] | null)?.forEach((row) => roles[row.role]?.add(row.permission_key));
      setPerms((p as Perm[]) ?? []);
      setRp(roles as any);
    })();
  }, [supabase]);

  const toggle = (role: "admin" | "client", key: string) => {
    setRp((prev) => {
      const copy: Record<string, Set<string>> = { admin: new Set(prev.admin), client: new Set(prev.client) };
      const set = copy[role];
      if (set.has(key)) set.delete(key); else set.add(key);
      return copy as any;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      // Clear and re-insert for simplicity
      await supabase.from("role_permissions").delete().in("role", ROLES as any);
      const rows: RolePerm[] = [];
      ROLES.forEach((r) => rp[r].forEach((k) => rows.push({ role: r, permission_key: k } as RolePerm)));
      if (rows.length) await supabase.from("role_permissions").insert(rows as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="text-sm font-medium mb-2">Permissions</div>
      <div className="overflow-auto">
        <table className="text-sm border w-full">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 border-b">Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="text-left px-3 py-2 border-b capitalize">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p.key} className="border-t">
                <td className="px-3 py-2">
                  <div className="font-medium">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.key}</div>
                </td>
                {ROLES.map((r) => (
                  <td key={r} className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={rp[r]?.has(p.key) || false} onChange={() => toggle(r, p.key)} />
                      <span className="text-xs">Allow</span>
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-end">
        <UIButton onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</UIButton>
      </div>
    </div>
  );
}


