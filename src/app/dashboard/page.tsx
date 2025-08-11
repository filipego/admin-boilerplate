import AppLayout from "@/components/layout/Layout";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { stats, recentClients, recentProjects, nextTasks } from "@/data/dashboard";

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <AppLayout title="Overview">
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-base">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.client}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Next Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between">
                  <span>{t.title}</span>
                  <span className="text-muted-foreground text-xs">{t.due}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


