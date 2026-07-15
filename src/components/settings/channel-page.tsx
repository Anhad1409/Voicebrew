"use client";

/* Shared scaffold for channel integration pages (Truecaller, Click-to-Call,
   SMS/DLT, WhatsApp). Connection state + per-channel fields + save. */

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

export type ChannelField = { label: string; placeholder: string; mono?: boolean; hint?: string };

export function ChannelPage({ icon: Icon, title, blurb, fields, extras, connectLabel = "Connect" }: {
  icon: LucideIcon; title: string; blurb: string; fields: ChannelField[]; extras?: React.ReactNode; connectLabel?: string;
}) {
  const [connected, setConnected] = useState(false);
  const [vals, setVals] = useState<string[]>(fields.map(() => ""));

  const connect = () => {
    if (vals.some((v, i) => !v.trim() && !fields[i].hint?.includes("optional"))) {
      toast({ title: "Missing details", body: "Fill the required fields to connect.", severity: "warning" }); return;
    }
    setConnected(true);
    toast({ title: `${title} connected`, body: "Credentials verified — the channel is live for campaigns.", severity: "success" });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-2xl">
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><Icon className="size-6 text-caramel" /> {title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{blurb}</p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", connected ? "border-success/25 bg-success/10 text-success" : "border-foam bg-oat/60 text-mocha")}>
          {connected ? "● Connected" : "Not connected"}
        </span>
      </div>

      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((f, i) => (
            <div key={f.label} className={fields.length % 2 && i === fields.length - 1 ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-sm font-medium text-coffee">{f.label}</label>
              <input value={vals[i]} onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? e.target.value : x)))} placeholder={f.placeholder}
                className={cn("w-full rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none focus:border-caramel", f.mono && "font-data")} />
              {f.hint && <p className="mt-1 text-[11px] text-muted-foreground">{f.hint}</p>}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          {connected && <Button variant="outline" onClick={() => { setConnected(false); toast({ title: "Disconnected", body: `${title} is paused — campaigns skip this channel.`, severity: "warning" }); }} className="border-foam text-mocha">Disconnect</Button>}
          <Button onClick={connect} className="bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark">{connected ? "Save changes" : connectLabel}</Button>
        </div>
      </section>

      {extras}
    </div>
  );
}
