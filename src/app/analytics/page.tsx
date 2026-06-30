"use client";

import { useState } from "react";
import { Clock, IndianRupee, BarChart3, Sparkles, Download, Flame, Activity } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { AreaChart } from "@/components/ui-bits/area-chart";
import { overviewStats, timeSeries, campaigns } from "@/lib/data";
import { conversionsToday } from "@/lib/channel-mock";
import { formatDuration, formatINR } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const SUBTABS = ["Overview", "Call Performance", "Providers", "Live", "Campaigns"];
const providers = [
  { name: "plivo", mode: "pipecat", total: 1240, completed: 760, answerRate: 61, avgDur: "1m 18s", avgCost: 6.2, quality: 72 },
  { name: "exotel", mode: "pipecat", total: 880, completed: 520, answerRate: 59, avgDur: "1m 22s", avgCost: 5.8, quality: 70 },
  { name: "smartflo", mode: "vapi", total: 430, completed: 240, answerRate: 56, avgDur: "1m 30s", avgCost: 7.1, quality: 68 },
];
const maxTotal = Math.max(...providers.map((p) => p.total));

function FunnelStep({ label, value, pct, caption }: { label: string; value: number | string; pct: number; caption: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-mocha">{label}</div>
      <div className="mt-0.5 font-serif text-4xl font-semibold text-coffee tabular-nums">{value}</div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${pct}%` }} /></div>
      <div className="mt-1.5 text-xs text-muted-foreground">{caption}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("Overview");
  const o = overviewStats;
  const connected = o.calls_completed;
  const connectRate = o.total_calls ? Math.round((connected / o.total_calls) * 100) : 0;
  const convRate = connected ? Math.round((conversionsToday / connected) * 100) : 0;
  const quality = o.avg_agent_quality > 10 ? o.avg_agent_quality / 10 : o.avg_agent_quality;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Analytics" subtitle="Organization-level metrics and insights"
        actions={<>{["Calls", "Leads", "Campaigns"].map((x) => <Button key={x} variant="outline" size="sm" onClick={() => toast({ title: `Export ${x}`, body: "Downloading…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-4" /> {x}</Button>)}</>} />

      <div className="mb-6 flex flex-wrap gap-1 border-b border-foam">
        {SUBTABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {(tab === "Overview" || tab === "Call Performance") && (
        <>
          {tab === "Overview" && (
            <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
              <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-mocha">Today&apos;s funnel</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <FunnelStep label="Total calls" value={o.total_calls} pct={100} caption="dialed today" />
                <FunnelStep label="Connected" value={connected} pct={connectRate} caption={`${connectRate}% connect rate`} />
                <FunnelStep label="Converted" value={conversionsToday} pct={Math.max(6, convRate)} caption={`${convRate}% of connected`} />
              </div>
            </section>
          )}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Avg Duration" value={formatDuration(o.avg_call_duration)} icon={Clock} />
            <StatCard label="Avg Agent Quality" value={`${quality.toFixed(1)} / 10`} icon={Sparkles} />
            <StatCard label="Active Campaigns" value={`${o.active_campaigns} / ${o.total_campaigns}`} icon={BarChart3} />
            <StatCard label="Total Cost" value={formatINR(o.total_cost)} icon={IndianRupee} sub="admin view" />
            <StatCard label="Hot Leads" value={o.hot_leads} icon={Flame} sub={`${o.warm_leads} warm · ${o.cold_leads} cold`} />
          </div>
          <section className="mt-6 rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-mocha">Call activity</h2>
            <AreaChart data={timeSeries} series={[{ key: "calls", label: "Started", color: "var(--color-caramel)" }, { key: "completed", label: "Connected", color: "var(--color-success)" }]} />
          </section>
        </>
      )}

      {tab === "Providers" && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-mocha">Provider performance</h2>
            <div className="space-y-4">
              {providers.map((p) => (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium capitalize text-coffee">{p.name}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${p.answerRate}%` }} /></div><span className="w-16 text-right font-data text-xs text-coffee">{p.answerRate}% ans</span></div>
                    <div className="flex items-center gap-2"><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-latte" style={{ width: `${(p.total / maxTotal) * 100}%` }} /></div><span className="w-16 text-right font-data text-xs text-muted-foreground">{p.total} calls</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="overflow-hidden rounded-3xl border border-foam bg-porcelain shadow-glass">
            <div className="px-6 py-4 text-sm font-semibold uppercase tracking-wider text-mocha">Provider details</div>
            <table className="w-full text-sm">
              <thead><tr className="border-y border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-6 py-2">Provider</th><th className="px-4 py-2">Mode</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2 text-right">Completed</th><th className="px-4 py-2 text-right">Answer rate</th><th className="px-4 py-2 text-right">Avg dur</th><th className="px-4 py-2 text-right">Avg cost</th><th className="px-4 py-2 text-right">Quality</th></tr></thead>
              <tbody className="divide-y divide-foam">
                {providers.map((p) => (
                  <tr key={p.name}>
                    <td className="px-6 py-2.5 font-medium capitalize text-coffee">{p.name}</td>
                    <td className="px-4 py-2.5"><span className="rounded-full bg-secondary px-2 py-0.5 font-data text-[10px] text-mocha">{p.mode}</span></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.total}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.completed}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-success">{p.answerRate}%</td>
                    <td className="px-4 py-2.5 text-right">{p.avgDur}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(p.avgCost)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{p.quality}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {tab === "Live" && (
        <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
          <div className="flex items-center gap-2"><Activity className="size-5 text-caramel" /><h2 className="font-serif text-lg font-semibold text-coffee">Live snapshot</h2><span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-medium text-success"><span className="size-1.5 animate-pulse rounded-full bg-success" /> Live</span></div>
          <p className="mt-2 text-sm text-muted-foreground">Real-time concurrency, connect rate and alerts live on the dedicated <a href="/realtime-analytics" className="font-medium text-caramel">Live Analytics</a> screen.</p>
        </section>
      )}

      {tab === "Campaigns" && (
        <section className="overflow-hidden rounded-3xl border border-foam bg-porcelain shadow-glass">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-6 py-2">Campaign</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Leads</th><th className="px-4 py-2 text-right">Called</th><th className="px-4 py-2 text-right">Converted</th></tr></thead>
            <tbody className="divide-y divide-foam">
              {campaigns.map((c) => (
                <tr key={c.id}><td className="px-6 py-2.5 font-medium text-coffee">{c.name}</td><td className="px-4 py-2.5 capitalize text-muted-foreground">{c.status}</td><td className="px-4 py-2.5 text-right tabular-nums">{c.total_leads}</td><td className="px-4 py-2.5 text-right tabular-nums">{c.leads_called}</td><td className="px-4 py-2.5 text-right tabular-nums">{c.leads_converted}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
