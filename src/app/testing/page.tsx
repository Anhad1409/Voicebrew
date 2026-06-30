"use client";

import { useState } from "react";
import { Bot, Play, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { campaigns } from "@/lib/data";
import { formatINR } from "@/lib/format";

const inputCls = "rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel";
const personas = [
  { name: "Busy Executive", desc: "Interrupts, wants it in 20 seconds, no small talk." },
  { name: "Hostile Refuser", desc: "Annoyed at the call, threatens to report as spam." },
  { name: "Interested Professional", desc: "Engaged, asks sharp questions about terms." },
  { name: "Non-Hindi Speaker", desc: "Switches to Tamil/English mid-call." },
  { name: "Price Shopper", desc: "Only cares about the rate; compares competitors." },
  { name: "Skeptical Senior", desc: "Wants to verify identity, distrusts automation." },
];
const RESULT_TABS = ["All", "Pending", "Running", "Completed", "Failed"];
const results = [
  { ref: "TST-3041", status: "Completed", mode: "Quick", turns: 14, disposition: "warm", cost: 3.2, date: "Today 11:20" },
  { ref: "TST-3040", status: "Completed", mode: "Quick", turns: 9, disposition: "cold", cost: 2.1, date: "Today 10:58" },
  { ref: "TST-3039", status: "Failed", mode: "Quick", turns: 3, disposition: "—", cost: 0.6, date: "Today 10:40" },
  { ref: "TST-3038", status: "Running", mode: "Quick", turns: 6, disposition: "—", cost: 1.4, date: "Today 10:31" },
  { ref: "TST-3037", status: "Completed", mode: "Quick", turns: 17, disposition: "hot", cost: 4.0, date: "Yesterday" },
];
const statusTone: Record<string, { c: string; Icon: typeof CheckCircle2 }> = {
  Completed: { c: "text-success", Icon: CheckCircle2 }, Failed: { c: "text-danger", Icon: XCircle },
  Running: { c: "text-info", Icon: Loader2 }, Pending: { c: "text-muted-foreground", Icon: Clock },
};

export default function TestingPage() {
  const [campaign, setCampaign] = useState(campaigns[0]?.name ?? "");
  const [persona, setPersona] = useState<string | null>(null);
  const [tab, setTab] = useState("All");
  const rows = results.filter((r) => tab === "All" || r.status === tab);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="AI Testing" subtitle="Dry-run your agent against synthetic BFSI personas before launch" />

      {/* run new test */}
      <div className="mb-6 rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-coffee">Run a new test</h3>
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={inputCls}>{campaigns.map((c) => <option key={c.id}>{c.name}</option>)}</select>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((p) => (
            <button key={p.name} onClick={() => setPersona(p.name)} className={cn("rounded-xl border bg-card p-3 text-left transition-all", persona === p.name ? "border-caramel ring-1 ring-caramel/30" : "border-foam hover:border-latte")}>
              <div className="flex items-center gap-2"><span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-mocha"><Bot className="size-4" /></span><span className="text-sm font-medium text-coffee">{p.name}</span></div>
              <p className="mt-1.5 text-xs text-muted-foreground">{p.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          {persona && <span className="mr-auto text-xs text-muted-foreground">Persona: <span className="font-medium text-coffee">{persona}</span></span>}
          <Button variant="outline" onClick={() => setPersona(null)} className="text-mocha">Cancel</Button>
          <Button disabled={!persona} onClick={() => toast({ title: "Test running", body: `${persona} vs ${campaign}…`, severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Play className="size-4" /> Run test</Button>
        </div>
      </div>

      {/* results */}
      <div className="mb-3 flex gap-1.5">
        {RESULT_TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", tab === t ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>{t}</button>)}
      </div>
      <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-foam bg-oat/40 text-left text-xs text-mocha"><th className="px-5 py-2.5">#Ref</th><th className="px-4 py-2.5">Status</th><th className="px-4 py-2.5">Mode</th><th className="px-4 py-2.5 text-right">Turns</th><th className="px-4 py-2.5">Disposition</th><th className="px-4 py-2.5 text-right">Cost</th><th className="px-4 py-2.5 text-right">Date</th></tr></thead>
          <tbody className="divide-y divide-foam">
            {rows.map((r) => { const s = statusTone[r.status]; const Icon = s.Icon; return (
              <tr key={r.ref}>
                <td className="px-5 py-2.5 font-data text-xs text-coffee">{r.ref}</td>
                <td className="px-4 py-2.5"><span className={cn("inline-flex items-center gap-1 text-xs font-medium", s.c)}><Icon className={cn("size-3.5", r.status === "Running" && "animate-spin")} /> {r.status}</span></td>
                <td className="px-4 py-2.5"><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-mocha">{r.mode}</span></td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.turns}</td>
                <td className="px-4 py-2.5 capitalize text-muted-foreground">{r.disposition}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatINR(r.cost)}</td>
                <td className="px-4 py-2.5 text-right text-muted-foreground">{r.date}</td>
              </tr>
            ); })}
            {rows.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No {tab.toLowerCase()} tests</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
