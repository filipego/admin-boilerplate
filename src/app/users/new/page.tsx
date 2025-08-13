import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UIButton from "@/components/common/UIButton";
import PageHeader from "@/components/common/PageHeader";
import UserCreateForm from "./UserCreateForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function NewUserPage() {
  const supabase = getSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  return (
    <AppLayout title="New User">
      <PageHeader title="Create User" description="Create a new account and profile" />
      <div className="max-w-md">
        <UserCreateForm />
        <div className="mt-4">
          <UIButton asChild uiSize="sm" variant="outline"><Link href="/users">Back</Link></UIButton>
        </div>
      </div>
    </AppLayout>
  );
}


