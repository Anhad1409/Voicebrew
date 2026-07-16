"use client";

/* Handoff Queue — where the AI hands calls to humans, rebuilt in the v7
   list language: live wait timers, reason chips, claim → resolve flow. */

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Headset, Phone, CheckCircle2, UserRound, AlarmClock } from "lucide-react";
import { V7Banner, Chip, SectionCard, InitialBean, monoLabel, rowStagger, rowItem } from "@/components/v7/kit";
import { GlazedTile } from "@/components/settings/glaze";
import { BeanDot } from "@/components/coffee/bean-dot";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type Status = "waiting" | "claimed" | "resolved";
type Item = {
  id: string; lead: string; phone: string; campaign: string;
  reason: "Asked for a human" | "High-value lead" | "Compliance flag" | "Complex query";
  priority: "high" | "normal"; waitedSec: number; status: Status; owner?: string;
};

const SEED: Item[] = [
  { id: "h1", lead: "Virendra Singh", phone: "+91 97717 27833", campaign: "Outreach campaign", reason: "High-value lead", priority: "high", waitedSec: 250, status: "waiting" },
  { id: "h2", lead: "Yandamuri Rajesh", phone: "+91 94063 24204", campaign: "Outreach campaign", reason: "Asked for a human", priority: "normal", waitedSec: 128, status: "waiting" },
  { id: "h3", lead: "Biswajit Dwivedy", phone: "+91 76764 64643", campaign: "IOB : Mobile Banking Activation (Clone)", reason: "Complex query", priority: "normal", waitedSec: 74, status: "waiting" },
  { id: "h4", lead: "Ridisha Kumar", phone: "+91 94602 70488", campaign: "IOB : Mobile Banking Activation (Clone)", reason: "Compliance flag", priority: "high", waitedSec: 31, status: "waiting" },
  { id: "h5", lead: "Ashish Mehta", phone: "+91 99996 43755", campaign: "Outreach campaign", reason: "Asked for a human", priority: "normal", waitedSec: 0, status: "resolved", owner: "Priya" },
];

const reasonPill: Record<Item["reason"], string> = {
  "Asked for a human": "bg-info/10 text-info border-info/25",
  "High-value lead": "bg-success/12 text-success border-success/25",
  "Compliance flag": "bg-danger/10 text-danger border-danger/25",
  "Complex query": "bg-warning/12 text-warning border-warning/25",
};

const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);

export default function HandoffPage() {
  const [items, setItems] = useState(SEED);
  const [status, setStatus] = useState<Status | "all">("all");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => ({
    waiting: items.filter((i) => i.status === "waiting").length,
    claimed: items.filter((i) => i.status === "claimed").length,
    resolved: items.filter((i) => i.status === "resolved").length,
  }), [items]);

  const longest = Math.max(0, ...items.filter((i) => i.status === "waiting").map((i) => i.waitedSec + tick));
  const rows = items.filter((i) => status === "all" || i.status === status);

  const claim = (id: string) => {
    setItems((x) => x.map((i) => (i.id === id ? { ...i, status: "claimed", owner: "You" } : i)));
    toast({ title: "Handoff claimed", body: "Bridging the call to your line — it rings in a moment.", severity: "success" });
  };
  const resolve = (id: string) => {
    setItems((x) => x.map((i) => (i.id === id ? { ...i, status: "resolved" } : i)));
    toast({ title: "Marked resolved", body: "Outcome logged against the campaign.", severity: "info" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="Live operations"
        title="Handoff Queue"
        subtitle={<>The AI hands over when a human wins the moment — <span className="font-medium text-coffee">{counts.waiting} waiting</span> right now.</>}
        stats={[
          { label: "Waiting", value: <span className={counts.waiting > 2 ? "text-warning" : "text-coffee"}>{counts.waiting}</span> },
          { label: "Longest wait", value: <span className={longest > 240 ? "text-danger" : "text-coffee"}>{fmt(longest)}</span> },
          { label: "Resolved today", value: <span className="text-success">{counts.resolved}</span> },
        ]}
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Chip active={status === "all"} onClick={() => setStatus("all")} dot="var(--color-caramel)" count={items.length}>All</Chip>
        <Chip active={status === "waiting"} onClick={() => setStatus(status === "waiting" ? "all" : "waiting")} dot="var(--color-warning)" count={counts.waiting}>Waiting</Chip>
        <Chip active={status === "claimed"} onClick={() => setStatus(status === "claimed" ? "all" : "claimed")} dot="var(--color-info)" count={counts.claimed}>Claimed</Chip>
        <Chip active={status === "resolved"} onClick={() => setStatus(status === "resolved" ? "all" : "resolved")} dot="var(--color-success)" count={counts.resolved}>Resolved</Chip>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-foam bg-oat/60 px-3 py-1.5 text-xs font-medium text-mocha">
          <AlarmClock className="size-3.5 text-caramel" /> SLA target: claim within 2m
        </span>
      </div>

      <SectionCard title="Queue" count={`${rows.length} of ${items.length}`}
        help="Claim bridges the caller to your line. High-priority beans are darker — compliance flags and high-value leads jump the queue.">
        <div className={cn("hidden grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_110px_120px_170px] gap-3 border-b border-foam px-4 py-1.5 lg:grid", monoLabel)}>
          <span>Lead</span><span>Campaign</span><span>Reason</span><span>Waited</span><span>Status</span><span className="text-right">Actions</span>
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((i) => {
            const waited = i.status === "waiting" ? i.waitedSec + tick : i.waitedSec;
            const breach = i.status === "waiting" && waited > 120;
            return (
              <motion.li key={i.id} variants={rowItem}
                className="group grid grid-cols-1 gap-2 border-b border-foam/70 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-oat/40 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_110px_120px_170px] lg:items-center lg:gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <BeanDot color={i.priority === "high" ? "var(--color-danger)" : "var(--color-latte)"} className="size-3" />
                  <InitialBean name={i.lead} band={i.priority === "high" ? "hot" : "warm"} />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-coffee">{i.lead}</div>
                    <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{i.phone}</div>
                  </div>
                </div>
                <div className="truncate text-[13px] text-mocha">{i.campaign}</div>
                <div><span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium", reasonPill[i.reason])}>{i.reason}</span></div>
                <div className={cn("font-[family-name:var(--font-data)] text-[13px] font-semibold tabular-nums", breach ? "text-danger" : "text-coffee")}>
                  {i.status === "resolved" ? "—" : fmt(waited)}
                  {breach && <span className="ml-1 text-[10px] font-medium">SLA</span>}
                </div>
                <div>
                  {i.status === "waiting" && <span className="rounded-full bg-warning/12 px-2.5 py-1 text-[11px] font-medium text-warning">Waiting</span>}
                  {i.status === "claimed" && <span className="rounded-full bg-info/10 px-2.5 py-1 text-[11px] font-medium text-info">Claimed · {i.owner}</span>}
                  {i.status === "resolved" && <span className="rounded-full bg-success/12 px-2.5 py-1 text-[11px] font-medium text-success">Resolved{i.owner ? ` · ${i.owner}` : ""}</span>}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  {i.status === "waiting" && (
                    <button onClick={() => claim(i.id)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark">
                      <Headset className="size-3.5" /> Claim
                    </button>
                  )}
                  {i.status === "claimed" && (
                    <button onClick={() => resolve(i.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-[11px] font-semibold text-success transition-colors hover:bg-success/20">
                      <CheckCircle2 className="size-3.5" /> Resolve
                    </button>
                  )}
                  {i.status !== "waiting" && (
                    <button onClick={() => toast({ title: "Calling back", body: `Dialing ${i.lead} from your assigned agent number.`, severity: "info" })}
                      className="inline-flex items-center gap-1 rounded-full border border-foam bg-porcelain px-2.5 py-1.5 text-[11px] font-medium text-mocha shadow-glass transition-colors hover:border-caramel hover:text-coffee">
                      <Phone className="size-3.5" /> Call back
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2.5 py-12 text-center">
            <GlazedTile icon={UserRound} tint="var(--color-success)" size="lg" />
            <p className="font-serif text-lg text-coffee">Queue&apos;s clear</p>
            <p className="text-sm text-mocha">The AI is handling everything solo — handoffs land here the moment a human is needed.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
