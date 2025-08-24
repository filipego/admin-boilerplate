"use client";

import { useEffect, useState } from "react";
import UIButton from "@/components/common/UIButton";

type Perm = { key: string; label: string };
type RolePerm = { role: string; permission_key: string };

const ROLES: Array<"admin" | "client"> = ["admin", "client"];

export default function PermissionsMatrix() {
  const [perms, setPerms] = useState<Perm[]>([]);
  const [rp, setRp] = useState<Record<string, Set<string>>>({ admin: new Set(), client: new Set() });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const pRes = await fetch('/api/permissions', { cache: 'no-store' });
      const pJson = await pRes.json();
      const mapRes = await fetch('/api/role-permissions', { cache: 'no-store' });
      const mapJson = await mapRes.json();
      const roles: Record<"admin" | "client", Set<string>> = { admin: new Set(), client: new Set() };
      (mapJson.rows as RolePerm[] | null)?.forEach((row) => {
        if (row.role === "admin" || row.role === "client") roles[row.role].add(row.permission_key);
      });
      setPerms((pJson.rows as Perm[]) ?? []);
      setRp(roles);
    })();
  }, []);

  const toggle = (role: "admin" | "client", key: string) => {
    setRp((prev) => {
      const copy: Record<"admin" | "client", Set<string>> = { admin: new Set(prev.admin), client: new Set(prev.client) };
      const set = copy[role];
      if (set.has(key)) set.delete(key); else set.add(key);
      return copy;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const rows: RolePerm[] = [];
      ROLES.forEach((r) => rp[r].forEach((k) => rows.push({ role: r, permission_key: k } as RolePerm)));
      await fetch('/api/role-permissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
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


