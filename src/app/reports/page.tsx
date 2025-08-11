import AppLayout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <AppLayout title="Reports / Analytics">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 grid place-items-center text-sm text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 grid place-items-center text-sm text-muted-foreground">
              Chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


