"use client";

import { useState } from "react";
import { Brain, Lightbulb, TrendingUp, Check } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

const initial = [
  { title: "Lead with the activation benefit, not the process", why: "Calls that mention the benefit in the first 10s convert 18% better.", impact: "+18% intent" },
  { title: "Shorten the consent line", why: "Drop-off spikes during a long disclosure. A tighter prompt keeps 9% more on the line.", impact: "−9% drop-off" },
  { title: "Handle 'I'll do it later' with a callback offer", why: "This objection appears in 22% of lost calls with no recovery step.", impact: "22% of losses" },
];

export default function LearningPage() {
  const [applied, setApplied] = useState<number[]>([]);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="AI Learning Engine" subtitle="What your won & lost calls are teaching the agent" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Calls analyzed" value="3,420" icon={Brain} sub="last 30 days" />
        <StatCard label="Open suggestions" value={`${initial.length - applied.length}`} icon={Lightbulb} sub="ready to apply" />
        <StatCard label="Win-rate lift" value="+11%" icon={TrendingUp} sub="from applied tweaks" />
      </div>
      <div className="space-y-3">
        {initial.map((s, i) => {
          const done = applied.includes(i);
          return (
            <div key={i} className={cn("flex items-start gap-4 rounded-2xl border bg-porcelain p-5 shadow-glass", done ? "border-success/40" : "border-foam")}>
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", done ? "bg-success/12 text-success" : "bg-caramel/15 text-caramel")}>{done ? <Check className="size-4" /> : <Lightbulb className="size-4" />}</span>
              <div className="flex-1"><div className="flex items-center gap-2"><h3 className="font-medium text-coffee">{s.title}</h3><span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-mocha">{s.impact}</span></div><p className="mt-1 text-sm text-muted-foreground">{s.why}</p></div>
              <Button size="sm" disabled={done} onClick={() => { setApplied((p) => [...p, i]); toast({ title: "Suggestion applied", body: s.title, severity: "success" }); }} className={cn(done ? "bg-foam text-muted-foreground" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>{done ? "Applied" : "Apply"}</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
