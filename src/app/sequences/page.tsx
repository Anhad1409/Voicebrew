"use client";

import { useState } from "react";
import { Phone, MessageSquare, Clock, RotateCcw, Plus, Workflow, Users } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const stepIcon = { call: Phone, sms: MessageSquare, wait: Clock, retry: RotateCcw } as const;
type Step = { type: keyof typeof stepIcon; label: string };
type Seq = { id: string; name: string; status: "active" | "draft"; enrolled: number; completion: number; steps: Step[] };

const sequences: Seq[] = [
  { id: "s1", name: "EMI Reminder cadence", status: "active", enrolled: 420, completion: 68, steps: [{ type: "call", label: "Call" }, { type: "wait", label: "Wait 1d" }, { type: "sms", label: "SMS" }, { type: "retry", label: "Retry x2" }] },
  { id: "s2", name: "Mobile-banking activation", status: "active", enrolled: 260, completion: 54, steps: [{ type: "call", label: "Call" }, { type: "wait", label: "Wait 2d" }, { type: "call", label: "Call" }, { type: "sms", label: "SMS" }] },
  { id: "s3", name: "Loan cross-sell (warm)", status: "draft", enrolled: 0, completion: 0, steps: [{ type: "call", label: "Call" }, { type: "wait", label: "Wait 3d" }, { type: "retry", label: "Retry x1" }] },
];
const FILTERS = ["All", "Active", "Draft"];

export default function SequencesPage() {
  const [f, setF] = useState("All");
  const list = sequences.filter((s) => f === "All" || s.status === f.toLowerCase());
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Sequences" subtitle="Multi-step outreach cadences — call, wait, SMS, retry"
        actions={<Button size="sm" onClick={() => toast({ title: "New sequence", body: "Opening cadence builder…", severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> New sequence</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Active sequences" value="2" icon={Workflow} sub="running cadences" />
        <StatCard label="Contacts enrolled" value="680" icon={Users} sub="across sequences" />
        <StatCard label="Avg completion" value="61%" icon={RotateCcw} sub="reach end of cadence" />
      </div>

      <div className="mb-4 flex gap-1.5">
        {FILTERS.map((x) => <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", f === x ? "border-caramel bg-caramel/10 text-caramel" : "border-foam text-muted-foreground hover:border-latte")}>{x}</button>)}
      </div>

      <div className="space-y-3">
        {list.map((s) => (
          <div key={s.id} className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><h3 className="font-serif text-lg font-semibold text-coffee">{s.name}</h3><span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", s.status === "active" ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{s.status === "active" ? "Active" : "Draft"}</span></div>
              <Button size="sm" variant="outline" onClick={() => toast({ title: s.name, body: "Opening sequence…", severity: "info" })} className="text-mocha">Edit</Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {s.steps.map((st, i) => { const Icon = stepIcon[st.type]; return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-foam bg-card px-2.5 py-1.5 text-xs font-medium text-coffee"><Icon className="size-3.5 text-caramel" />{st.label}</span>
                  {i < s.steps.length - 1 && <span className="text-muted-foreground">→</span>}
                </div>
              ); })}
            </div>
            <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
              <span><span className="font-semibold text-coffee">{s.enrolled}</span> enrolled</span>
              <div className="flex flex-1 items-center gap-2"><span>Completion</span><div className="h-1.5 max-w-[180px] flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel" style={{ width: `${s.completion}%` }} /></div><span className="font-data text-coffee">{s.completion}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
