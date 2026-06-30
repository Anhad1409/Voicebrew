"use client";

import { useState } from "react";
import { Phone, PauseCircle, Clock, Ear, Mic, PhoneCall } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { StatCard } from "@/components/ui-bits/stat-card";
import { liveCalls } from "@/lib/ops-mock";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { baselineActive } from "@/lib/channel-mock";
import { formatDuration } from "@/lib/format";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TABS = ["Active calls", "My sessions", "History"];
const statusStyle: Record<string, string> = {
  talking: "text-success", "on-hold": "text-warning", ringing: "text-info",
};

export default function CallMonitoringPage() {
  const [tab, setTab] = useState(TABS[0]);
  const active = useLiveCapacity(baselineActive);
  const onHold = liveCalls.filter((c) => c.status === "on-hold").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Call Monitor" subtitle="Listen in, whisper to the agent, or take over — live" />

      <div className="mb-4 flex gap-1 border-b border-foam">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("-mb-px border-b-2 px-3 py-2 text-sm font-medium", tab === t ? "border-caramel text-caramel" : "border-transparent text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Live now" value={liveCalls.length} icon={PhoneCall} />
        <StatCard label="Slots in flight" value={active} icon={Phone} sub="across all campaigns" />
        <StatCard label="On hold" value={onHold} icon={PauseCircle} />
        <StatCard label="Longest call" value="3m 21s" icon={Clock} />
      </div>

      {tab === "Active calls" && (
      <div className="overflow-hidden rounded-2xl border border-foam bg-porcelain shadow-glass">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Monitor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveCalls.map((c) => (
              <TableRow key={c.id}>
                <TableCell><div className="font-medium text-coffee">{c.lead}</div><div className="text-xs text-muted-foreground">{c.phone}</div></TableCell>
                <TableCell className="text-muted-foreground">{c.campaign}</TableCell>
                <TableCell className="text-coffee">{c.agent}</TableCell>
                <TableCell>
                  <span className={cn("flex items-center gap-1.5 text-xs font-medium capitalize", statusStyle[c.status])}>
                    <span className={cn("size-2 rounded-full", c.status === "talking" ? "animate-pulse bg-success" : c.status === "on-hold" ? "bg-warning" : "bg-info")} />
                    {c.status.replace("-", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-right font-data text-sm tabular-nums text-coffee">{formatDuration(c.durationSec)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {[["Listen", Ear], ["Whisper", Mic], ["Barge", PhoneCall]].map(([label, Icon]) => {
                      const I = Icon as typeof Ear;
                      return (
                        <button key={label as string} onClick={() => toast({ title: `${label} — ${c.lead}`, body: `You're now in ${(label as string).toLowerCase()} mode.`, severity: "info" })}
                          title={label as string} className="flex size-7 items-center justify-center rounded-lg border border-foam text-mocha hover:bg-oat hover:text-caramel">
                          <I className="size-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="border-t border-foam px-4 py-2.5 text-[11px] text-muted-foreground">Only Pipecat-pipeline calls (Exotel / Plivo) can be monitored live. Vapi calls are managed externally.</div>
      </div>
      )}
      {tab === "My sessions" && (
        <div className="rounded-2xl border border-dashed border-foam bg-porcelain p-12 text-center shadow-glass"><PhoneCall className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 text-sm font-medium text-coffee">No sessions yet</div><div className="text-xs text-muted-foreground">Calls you take over (listen / whisper / barge) appear here.</div></div>
      )}
      {tab === "History" && (
        <div className="rounded-2xl border border-dashed border-foam bg-porcelain p-12 text-center shadow-glass"><Clock className="mx-auto size-7 text-muted-foreground" /><div className="mt-2 text-sm font-medium text-coffee">No monitored calls yet</div><div className="text-xs text-muted-foreground">A log of past monitored sessions will appear here.</div></div>
      )}
    </div>
  );
}
