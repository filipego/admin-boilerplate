"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UIButton from "@/components/common/UIButton";
import Link from "next/link";

type UserRow = {
  id: string;
  email: string;
  username: string | null;
  role: "admin" | "client" | string;
  avatar_url: string | null;
  created_at?: string;
};

export default function UsersTable({ initial }: { initial?: UserRow[] }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [rows, setRows] = useState<UserRow[]>(initial ?? []);

  useEffect(() => {
    let mounted = true;
    if (!initial || initial.length === 0) {
      const load = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, username, role, avatar_url, created_at")
          .order("created_at", { ascending: false });
        if (mounted && data) setRows(data as UserRow[]);
      };
      load();
    }

    const channel = supabase
      .channel("realtime:profiles")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload: { new?: UserRow }) => {
          if (!payload.new) return;
          setRows((prev) => [payload.new!, ...prev.filter((r) => r.id !== payload.new!.id)]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: { new?: UserRow }) => {
          if (!payload.new) return;
          setRows((prev) => prev.map((r) => (r.id === payload.new!.id ? { ...r, ...payload.new! } : r)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "profiles" },
        (payload: { old?: { id?: string } }) => {
          const id = payload.old?.id;
          if (!id) return;
          setRows((prev) => prev.filter((r) => r.id !== id));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      channel.unsubscribe();
    };
  }, [supabase]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Avatar</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((u) => (
          <TableRow key={u.id} className="hover:bg-muted/30">
            <TableCell>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {u.avatar_url ? <img src={u.avatar_url} alt="" className="size-8 rounded-full object-cover" /> : null}
            </TableCell>
            <TableCell>
              <Link href={`/users/${u.id}`} className="underline">{u.username ?? "—"}</Link>
            </TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell className="capitalize">{u.role}</TableCell>
            <TableCell className="text-right">
              <UIButton asChild uiSize="sm">
                <Link href={`/users/${u.id}`}>Edit</Link>
              </UIButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


