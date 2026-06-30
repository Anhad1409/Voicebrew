"use client";

import { useState } from "react";
import { Building2, Users, Percent, IndianRupee } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

const orgs = [
  { name: "Blostem Bank (demo)", plan: "Growth", channels: 10, status: "active" },
  { name: "Indus Capital", plan: "Scale", channels: 24, status: "active" },
  { name: "Kashi Finserv", plan: "Starter", channels: 4, status: "trial" },
];
const flags = [
  ["Minute-balance billing", "Per-minute wallet model", true],
  ["AI Learning Engine", "Auto-suggested improvements", true],
  ["Learning Lab experiments", "A/B sweeps", false],
  ["Custom HTTP integrations", "Outbound webhooks", true],
];

export default function AdminPage() {
  const [f, setF] = useState(() => flags.map(([, , on]) => on as boolean));
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Admin" subtitle="Platform administration — orgs, provisioning & feature flags" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Organizations" value="3" icon={Building2} sub="2 active · 1 trial" />
        <StatCard label="Active users" value="28" icon={Users} sub="last 30 days" />
        <StatCard label="Blended margin" value="64%" icon={Percent} sub="across plans" />
        <StatCard label="MRR" value={formatINR(412000)} icon={IndianRupee} sub="recurring" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="px-5 py-3 text-sm font-semibold text-coffee">Organizations</div>
          <table className="w-full text-sm">
            <thead><tr className="bg-oat/40 text-left text-xs text-mocha"><th className="px-5 py-2.5">Org</th><th className="px-4 py-2.5">Plan</th><th className="px-4 py-2.5">Channels</th><th className="px-4 py-2.5">Status</th></tr></thead>
            <tbody className="divide-y divide-foam">{orgs.map((o) => <tr key={o.name}><td className="px-5 py-2.5 font-medium text-coffee">{o.name}</td><td className="px-4 py-2.5 text-muted-foreground">{o.plan}</td><td className="px-4 py-2.5 font-data text-coffee">{o.channels}</td><td className="px-4 py-2.5"><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", o.status === "active" ? "bg-success/12 text-success" : "bg-warning/12 text-warning")}>{o.status}</span></td></tr>)}</tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
          <div className="mb-3 text-sm font-semibold text-coffee">Feature flags</div>
          <div className="space-y-2">
            {flags.map(([t, d], i) => (
              <button key={t as string} onClick={() => { setF((p) => p.map((v, j) => (j === i ? !v : v))); toast({ title: t as string, body: f[i] ? "Disabled" : "Enabled", severity: "info" }); }} className="flex w-full items-center justify-between rounded-xl border border-foam bg-card p-3 text-left">
                <div><div className="text-sm font-medium text-coffee">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                <span className={cn("relative h-5 w-9 rounded-full transition-colors", f[i] ? "bg-success" : "bg-foam")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", f[i] ? "left-[18px]" : "left-0.5")} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
