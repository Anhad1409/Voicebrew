"use client";

import { useRouter } from "next/navigation";
import { Headset, PhoneCall, Clock, FileWarning, PauseCircle, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { GetStarted } from "@/components/onboarding/get-started";
import { cn } from "@/lib/utils";
import { campaigns } from "@/lib/data";
import { wallet, walletState } from "@/lib/wallet-mock";

type Item = { id: string; priority: "high" | "med" | "low"; icon: typeof Headset; title: string; detail: string; action: string; href: string };

const accent = {
  high: "border-l-danger bg-danger/[0.04]",
  med: "border-l-warning bg-warning/[0.04]",
  low: "border-l-mocha/40 bg-oat/30",
};

export default function TodayPage() {
  const router = useRouter();
  const drafts = campaigns.filter((c) => c.status === "draft").length;
  const paused = campaigns.filter((c) => c.status === "paused").length;
  const ws = walletState(wallet.minutes);

  const items: Item[] = [
    { id: "handoff", priority: "high", icon: Headset, title: "2 leads waiting for a human", detail: "AI escalated them on Outreach campaign — pick up before they drop.", action: "Open queue", href: "/handoff" },
    { id: "callbacks", priority: "high", icon: PhoneCall, title: "5 callbacks due today", detail: "Leads who asked to be called back. Don't let them go cold.", action: "View callbacks", href: "/leads" },
    ...(ws !== "healthy" ? [{ id: "wallet", priority: (ws === "critical" ? "high" : "med") as "high" | "med", icon: Clock, title: `Minute balance ${ws === "critical" ? "critically low" : "running low"} — ${wallet.minutes} min`, detail: "Top up or buy channels so live campaigns don't stall.", action: "Top up", href: "/settings/billing" }] : []),
    ...(drafts > 0 ? [{ id: "drafts", priority: "med" as const, icon: FileWarning, title: `${drafts} campaign${drafts > 1 ? "s" : ""} still in draft`, detail: "Created but not calling yet — review and activate when ready.", action: "Review drafts", href: "/campaigns" }] : []),
    ...(paused > 0 ? [{ id: "paused", priority: "med" as const, icon: PauseCircle, title: `${paused} paused campaign${paused > 1 ? "s" : ""}`, detail: "Resume to keep dialing, or leave parked.", action: "View", href: "/campaigns" }] : []),
    { id: "leads", priority: "low", icon: Sparkles, title: "Outreach campaign is low on fresh leads", detail: "Upload more leads to keep the agents busy.", action: "Add leads", href: "/campaigns" },
  ];

  const high = items.filter((i) => i.priority === "high").length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Today" subtitle={`${items.length} things need your attention${high ? ` · ${high} urgent` : ""}`} />

      <div className="mb-5"><GetStarted /></div>

      <div className="space-y-2.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.id} className={cn("flex items-center gap-4 rounded-xl border border-foam border-l-[3px] p-4 shadow-glass", accent[it.priority])}>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-mocha"><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-coffee">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.detail}</div>
              </div>
              <button onClick={() => router.push(it.href)} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-coffee px-3.5 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-espresso">
                {it.action} <ArrowRight className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-dashed border-foam py-4 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-success" /> That's everything for now — your agents are handling the rest.
      </div>
    </div>
  );
}
