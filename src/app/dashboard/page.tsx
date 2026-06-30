import Link from "next/link";
import { Megaphone, Activity, Users, Phone, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { overviewStats, campaigns, calls } from "@/lib/data";
import { formatDuration } from "@/lib/format";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const o = overviewStats;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Dashboard"
        actions={
          <Link
            href="/dashboard-v2"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-brand-foreground shadow-cta hover:bg-brand-dark"
          >
            <Sparkles className="size-4" /> Try the revamp (v2)
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Campaigns" value={o.total_campaigns} icon={Megaphone} />
        <StatCard label="Active Campaigns" value={o.active_campaigns} icon={Activity} />
        <StatCard label="Total Leads" value={o.total_leads} icon={Users} />
        <StatCard label="Total Calls" value={o.total_calls} icon={Phone} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card shadow-glass">
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest campaign activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.slice(0, 5).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-brand-dark">{c.name}</TableCell>
                    <TableCell><StatusBadge value={c.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">{c.total_leads}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-glass">
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Latest call activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Disposition</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.slice(0, 5).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.lead_name}</TableCell>
                    <TableCell>
                      <StatusBadge value={c.disposition} label={c.disposition_label} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatDuration(c.duration_seconds)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
