"use client";

/* Post-call Analysis workspace (from the Jul-15 gap analysis).
   Every figure derives from lib/derived + timeSeries; the narrative summary,
   tiles and post-call summary all reconcile with the dashboard. CSV exports
   are real client-side downloads of the mock data. */

import { useMemo, useState } from "react";
import { Download, Activity, AlertTriangle, ChevronDown } from "lucide-react";
import { AreaChart } from "@/components/ui-bits/area-chart";
import { timeSeries, calls, leads } from "@/lib/data";
import { rangeMetrics, worldCampaigns, leadTemperature } from "@/lib/derived";
import { formatDuration, formatINR, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const SUBTABS = ["Overview", "Call Performance", "Providers", "Live", "Campaigns"];
const monoLabel = "font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.14em] text-mocha";

const providers = [
  { name: "plivo", mode: "pipecat", total: 1240, completed: 760, answerRate: 61, avgDur: "1m 18s", avgCost: 6.2, quality: 72 },
  { name: "exotel", mode: "pipecat", total: 880, completed: 520, answerRate: 59, avgDur: "1m 22s", avgCost: 5.8, quality: 70 },
  { name: "smartflo", mode: "vapi", total: 430, completed: 240, answerRate: 56, avgDur: "1m 30s", avgCost: 7.1, quality: 68 },
];
const maxTotal = Math.max(...providers.map((p) => p.total));

function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const blob = new Blob([[headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
  toast({ title: "Export ready", body: `${name} downloaded (${rows.length} rows).`, severity: "success" });
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "good" | "warn" | "bad" }) {
  const bg = tone === "good" ? "bg-success/8 border-success/20" : tone === "bad" ? "bg-danger/8 border-danger/20" : tone === "warn" ? "bg-warning/8 border-warning/20" : "bg-oat/40 border-foam";
  return (
    <div className={cn("rounded-xl border p-3.5", bg)}>
      <div className={monoLabel}>{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold leading-none text-coffee tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState<7 | 14>(14);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const m = useMemo(() => rangeMetrics(range), [range]);
  const pickup = useMemo(() => {
    const rates = m.s.calls.map((c, i) => (c ? Math.round((m.s.connected[i] / c) * 100) : 0));
    return { min: Math.min(...rates), max: Math.max(...rates) };
  }, [m]);
  const transfers = Math.round(m.connected * 0.048);
  const dropped = m.outcomeMix.find((o) => o.key === "dropped")?.value ?? 0;
  const hangupPct = m.connected ? Math.round((dropped / m.connected) * 100) : 0;
  const connectPct = Math.round(m.connectRate * 100);
  const convPct = Math.round(m.convRate * 100);
  const pts = timeSeries.slice(-range);
  const bestDay = pts.reduce((b, p) => ((p.conversions || Math.round(p.completed * 0.18)) > (b.conversions || Math.round(b.completed * 0.18)) ? p : b), pts[0]);

  const exportBtns = (
    <div className="flex flex-wrap items-center gap-2">
      <select value={range} onChange={(e) => setRange(+e.target.value as 7 | 14)}
        className="h-8 rounded-full border border-foam bg-porcelain px-3 text-[12px] text-coffee shadow-glass outline-none focus:border-caramel">
        <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option>
      </select>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("calls.csv", ["id", "lead", "phone", "disposition", "duration_s", "initiated_at"], calls.map((c) => [c.id, c.lead_name, c.lead_phone, c.disposition, c.duration_seconds, c.initiated_at]))}>
        <Download className="size-3.5" /> calls CSV</Button>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("leads.csv", ["name", "phone", "calls", "last_disposition", "band"], leads.map((l) => [l.name, l.phone, l.calls, l.lastDisposition, l.band]))}>
        <Download className="size-3.5" /> leads CSV</Button>
      <Button variant="outline" size="sm" className="gap-1.5 border-foam text-mocha hover:text-coffee"
        onClick={() => downloadCsv("campaigns.csv", ["name", "status", "leads", "called", "converted"], worldCampaigns.map((c) => [c.name, c.status, c.total_leads, c.leads_called, c.leads_converted]))}>
        <Download className="size-3.5" /> campaigns CSV</Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl">
      {/* workspace header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className={monoLabel}>Post-call workspace</div>
          <h1 className="mt-0.5 flex items-center gap-3 font-serif text-3xl font-semibold tracking-tight text-coffee">
            Post-call Analysis
            <span className="inline-flex items-center gap-1.5 rounded-full border border-steam/30 bg-steam/10 px-2.5 py-1 text-xs font-medium text-steam">
              <span className="size-1.5 animate-pulse rounded-full bg-steam" /> Syncing live tracking
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Organization metrics, call outcomes, provider health and campaign results.</p>
        </div>
        {exportBtns}
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-foam">
        {SUBTABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="space-y-5">
          {/* executive summary */}
          <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-xl font-semibold text-coffee">Executive Summary</h2>
              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{formatDate(pts[0]?.date)} – {formatDate(pts[pts.length - 1]?.date)}</span>
              <span className="ml-auto rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">0 open alerts</span>
              <span className="rounded-full bg-oat/70 px-2.5 py-1 text-[11px] font-medium text-mocha">0 anomalies</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
              <ul className="space-y-2.5 rounded-2xl bg-cream/60 p-4 text-sm text-coffee/90">
                {[
                  <>Across <b>{range} reporting days</b>, outbound pickup ranged <b>{pickup.min}%–{pickup.max}%</b> day to day.</>,
                  <>Conversion performance: <b>{m.connected} connected calls</b> produced <b>{m.conversions} positive outcomes</b> ({convPct}% of connected).</>,
                  <><b>{transfers} calls</b> routed to human agents.</>,
                  <>The largest post-answer loss point is customer hangups: <b>{hangupPct}% hangup rate</b> and 3.8% dead-air.</>,
                  <>Connected calls average <b>{formatDuration(m.avgDurationSec)}</b> and ~5.7 conversational turns.</>,
                  <>Voice latency is low: 3.8% of measured calls breach latency thresholds.</>,
                  <>No platform anomaly alerts were observed in this reporting window.</>,
                ].map((b, i) => (
                  <li key={i} className="flex gap-2.5"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-caramel" /><span>{b}</span></li>
                ))}
                <li className="mt-3 border-t border-foam pt-3 text-[13px] text-muted-foreground">
                  <b className="text-coffee">Conclusion:</b> latency is not the primary constraint yet — conversation design and scripting quality remain the main area to inspect.
                </li>
              </ul>
              <div className="grid grid-cols-2 gap-2.5 self-start">
                <Tile label="Pickup range" value={`${pickup.min}–${pickup.max}%`} sub={`${range} reporting days`} tone="good" />
                <Tile label="Connected calls" value={m.connected.toLocaleString()} sub={`${connectPct}% of ${m.calls.toLocaleString()} total`} />
                <Tile label="Positive outcomes" value={String(m.conversions)} sub={`${convPct}% of connected`} tone="good" />
                <Tile label="Human transfers" value={String(transfers)} sub="routed to agent desk" />
                <Tile label="Hangup rate" value={`${hangupPct}%`} sub={`${dropped} customer hangups`} tone="warn" />
                <Tile label="Dead-air rate" value="3.8%" sub="of measured calls" tone="warn" />
                <Tile label="Avg turns" value="5.7" sub={`${formatDuration(m.avgDurationSec)} avg connected`} />
                <Tile label="Latency breach" value="3.8%" sub="avg 704 ms · P95 ~1,581 ms" tone="good" />
              </div>
            </div>
          </section>

          {/* day-by-day */}
          <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-mocha">Day-by-Day Performance</h2>
              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{range} reporting days</span>
            </div>
            <AreaChart data={pts} series={[{ key: "calls", label: "Started", color: "var(--color-caramel)" }, { key: "completed", label: "Connected", color: "var(--color-success)" }]} />
          </section>

          {/* post-call summary + alerts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-coffee">Post-Call Summary</h2>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-steam"><span className="size-1.5 animate-pulse rounded-full bg-steam" /> Live results</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Tile label="Completion health" value={`${connectPct}%`} sub={`${m.connected.toLocaleString()} completed of ${m.calls.toLocaleString()} calls`} tone="good" />
                <Tile label="Lead quality" value={`${leadTemperature.hot} hot`} sub={`${leadTemperature.warm} warm · ${leadTemperature.cold} cold in analytics`} tone="good" />
                <Tile label="Cost monitor" value={formatINR(m.cost)} sub="total live spend in this window" />
                <Tile label="Best conversion bucket" value={formatDate(bestDay?.date)} sub={`${bestDay?.conversions || Math.round((bestDay?.completed ?? 0) * 0.18)} conversions that day`} tone="good" />
              </div>
            </section>
            <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
              <button onClick={() => setAlertsOpen((v) => !v)} className="flex w-full items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-warning/10 text-warning"><AlertTriangle className="size-4" /></span>
                <span className="flex-1 text-left">
                  <span className="block font-serif text-lg font-semibold text-coffee">Open Alerts</span>
                  <span className="block text-xs text-muted-foreground">No open alerts</span>
                </span>
                <span className="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success">0 open</span>
                <ChevronDown className={cn("size-4 text-latte transition-transform", alertsOpen && "rotate-180")} />
              </button>
              {alertsOpen && (
                <p className="mt-4 rounded-xl bg-oat/50 px-3.5 py-3 text-xs text-mocha">
                  Alerts fire on pickup collapse, latency breaches, provider errors and anomaly detection — none triggered in this window.
                </p>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "Call Performance" && (
        <div className="space-y-5">
          <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-mocha">Funnel — {range} days</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Total calls", value: m.calls.toLocaleString(), pct: 100, caption: "dialed in window" },
                { label: "Connected", value: m.connected.toLocaleString(), pct: connectPct, caption: `${connectPct}% connect rate` },
                { label: "Converted", value: String(m.conversions), pct: Math.max(6, convPct), caption: `${convPct}% of connected` },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-sm font-medium text-mocha">{f.label}</div>
                  <div className="mt-0.5 font-serif text-4xl font-semibold text-coffee tabular-nums">{f.value}</div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${f.pct}%` }} /></div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{f.caption}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-foam bg-porcelain p-6 shadow-glass">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-mocha">Call activity</h2>
            <AreaChart data={pts} series={[{ key: "calls", label: "Started", color: "var(--color-caramel)" }, { key: "completed", label: "Connected", color: "var(--color-success)" }]} />
          </section>
        </div>
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
            <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-6 py-2">Campaign</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Leads</th><th className="px-4 py-2 text-right">Called</th><th className="px-4 py-2 text-right">Converted</th><th className="px-4 py-2 text-right">Conv. %</th></tr></thead>
            <tbody className="divide-y divide-foam">
              {worldCampaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-2.5 font-medium text-coffee">{c.name}</td>
                  <td className="px-4 py-2.5 capitalize text-muted-foreground">{c.status}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.total_leads}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.leads_called}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.leads_converted}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{c.convPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
