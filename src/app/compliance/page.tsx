"use client";

import { useState } from "react";
import { ShieldCheck, PhoneOff, FileCheck2, Clock, EyeOff, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "DNC / DND", "Consent & masking", "Audit log"];
const toggles = [
  ["DNC / DND scrubbing", "Skip Do-Not-Call numbers on every dial", true],
  ["Calling-window enforcement", "Only dial within TRAI / RBI permitted hours (9am–9pm)", true],
  ["Consent & recording disclosure", "Play the consent prompt at the start of every call", true],
  ["PII masking in recordings", "Redact names, phone numbers & account data in saved audio", true],
] as const;
const dnc = [
  { phone: "+91 98•••• ••21", reason: "Registered DND", at: "Today 10:12" },
  { phone: "+91 99•••• ••07", reason: "Opt-out on call", at: "Today 09:40" },
  { phone: "+91 90•••• ••88", reason: "Registered DND", at: "Yesterday 17:55" },
];
const audit = [
  { who: "System", what: "DNC list refreshed — 1,204 numbers scrubbed", at: "Today 06:00" },
  { who: "Arnika Raj", what: "Enabled PII masking on 'EMI Reminders'", at: "Yesterday 14:20" },
  { who: "System", what: "Blocked 12 dials outside calling window", at: "Yesterday 21:01" },
  { who: "Rohan Verma", what: "Exported consent report (Q2)", at: "18 Jun 10:30" },
];

export default function CompliancePage() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Compliance" subtitle="DNC, consent, calling-window & audit trail"
        actions={<Button size="sm" variant="outline" onClick={() => toast({ title: "Export", body: "Compliance report downloading…", severity: "info" })} className="gap-1.5 text-mocha"><Download className="size-3.5" /> Export report</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="DNC scrubbed" value="1,204" icon={PhoneOff} sub="this cycle" />
        <StatCard label="Consent captured" value="99.2%" icon={FileCheck2} sub="of connected calls" />
        <StatCard label="Window violations" value="0" icon={Clock} sub="all dials in window" />
        <StatCard label="Recordings masked" value="100%" icon={EyeOff} sub="PII redacted" />
      </div>

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="space-y-3">
          {toggles.map(([t, d, on]) => (
            <div key={t} className="flex items-center justify-between rounded-xl border border-foam bg-porcelain p-4 shadow-glass">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-success/12 text-success"><ShieldCheck className="size-4" /></span><div><div className="text-sm font-medium text-coffee">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div></div>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", on ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{on ? "On" : "Off"}</span>
            </div>
          ))}
          <div className="flex items-start gap-3 rounded-xl border border-caramel/30 bg-caramel/5 p-4">
            <EyeOff className="mt-0.5 size-4 shrink-0 text-caramel" />
            <p className="text-sm text-mocha"><span className="font-semibold text-coffee">All personal data in voice recordings is masked.</span> Names, phone numbers, and account identifiers are automatically redacted in stored audio and transcripts — the saved recording never contains raw PII.</p>
          </div>
        </div>
      )}

      {tab === "DNC / DND" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <div className="flex items-center gap-2 border-b border-foam p-3"><Search className="size-4 text-muted-foreground" /><Input placeholder="Search suppressed numbers…" className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" /></div>
          <table className="w-full text-sm">
            <thead><tr className="bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2.5">Number</th><th className="px-4 py-2.5">Reason</th><th className="px-4 py-2.5 text-right">Suppressed</th></tr></thead>
            <tbody className="divide-y divide-foam">{dnc.map((d) => <tr key={d.phone}><td className="px-4 py-2.5 font-data text-coffee">{d.phone}</td><td className="px-4 py-2.5 text-muted-foreground">{d.reason}</td><td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{d.at}</td></tr>)}</tbody>
          </table>
        </div>
      )}

      {tab === "Consent & masking" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass"><h3 className="font-serif text-lg font-semibold text-coffee">Consent disclosure</h3><p className="mt-2 text-sm text-muted-foreground">Every call opens with a consent + recording disclosure prompt. Captured on 99.2% of connected calls; non-consenting contacts are dropped and suppressed.</p></div>
          <div className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass"><h3 className="font-serif text-lg font-semibold text-coffee">PII masking</h3><p className="mt-2 text-sm text-muted-foreground">Recordings and transcripts are stored with names, numbers and account data redacted. Masking is enforced org-wide and cannot be disabled per campaign.</p></div>
        </div>
      )}

      {tab === "Audit log" && (
        <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
          <ul className="divide-y divide-foam">{audit.map((a, i) => <li key={i} className="flex items-center gap-3 px-5 py-3"><span className="flex size-8 items-center justify-center rounded-full bg-secondary text-mocha"><FileCheck2 className="size-4" /></span><div className="flex-1"><div className="text-sm text-coffee">{a.what}</div><div className="text-[11px] text-muted-foreground">{a.who}</div></div><span className="text-xs text-muted-foreground">{a.at}</span></li>)}</ul>
        </div>
      )}
    </div>
  );
}
