"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Headset, CheckCircle2, AlertTriangle, PhoneForwarded, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { EmptyState } from "@/components/ui-bits/empty-state";
import { handoffCalls } from "@/lib/handoff-mock";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

const band = { hot: "bg-orange-100 text-orange-700", warm: "bg-amber-100 text-amber-700", cold: "bg-stone-100 text-stone-600" };
const statusTone: Record<string, string> = { Completed: "bg-success/12 text-success", Transferred: "bg-info/12 text-info", Callback: "bg-warning/12 text-warning" };

export default function HandoffPage() {
  const router = useRouter();
  const [testMode, setTestMode] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const cards = handoffCalls.filter((c) => showCompleted || c.status !== "Completed");

  const Toggle = ({ on, set, label }: { on: boolean; set: () => void; label: string }) => (
    <button onClick={set} className="flex items-center gap-2 text-sm text-mocha">
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-success" : "bg-foam")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} /></span>
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Handoff Console" subtitle="Calls the bot handed off — open a card for the summary, transcript, recording & collected info."
        actions={<div className="flex items-center gap-4"><Toggle on={testMode} set={() => setTestMode((v) => !v)} label="Test mode" /><Toggle on={showCompleted} set={() => setShowCompleted((v) => !v)} label="Show completed" /></div>} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Handed off today" value={handoffCalls.length} icon={PhoneForwarded} />
        <StatCard label="Avg handle time" value="2m 19s" icon={Clock} />
        <StatCard label="Low-confidence" value={handoffCalls.filter((c) => c.lowConfidence).length} icon={AlertTriangle} sub="need review" />
        <StatCard label="Resolved" value="14" icon={CheckCircle2} sub="today" />
      </div>

      {cards.length === 0 ? (
        <EmptyState icon={Headset} title="Nothing handed off" hint="Calls the bot escalates will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <button key={c.id} onClick={() => router.push(`/handoff/${c.id}`)} className="flex flex-col rounded-2xl border border-foam bg-porcelain p-4 text-left shadow-glass transition-all hover:border-caramel hover:shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="font-medium text-coffee">{c.name}</span><span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", band[c.band])}>{c.score}</span></div>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", statusTone[c.status])}>{c.status}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{c.phone}</div>
              <div className="mt-1 text-xs font-medium text-mocha">{c.campaign}</div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-coffee/90">{c.summary}</p>
              <div className="mt-3 flex items-center justify-between border-t border-foam pt-2 text-[11px]">
                <span className={cn("flex items-center gap-1", c.lowConfidence ? "text-warning" : "text-success")}>{c.lowConfidence ? <><AlertTriangle className="size-3" /> Low-confidence summary</> : <><CheckCircle2 className="size-3" /> Summary ready</>}</span>
                <span className="text-muted-foreground">{c.when}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
