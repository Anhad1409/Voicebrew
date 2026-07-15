"use client";

/* Settings → Outbound Caller IDs — the number pool campaigns rotate through.
   Per-number daily limits, live usage, enable toggles. Mock state, real UX. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Phone, Plus, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type PoolNumber = { num: string; provider: string; usedToday: number; limit: number; on: boolean };

const SEED: PoolNumber[] = [
  { num: "+91 80353 41719", provider: "plivo", usedToday: 14, limit: 200, on: true },
  { num: "+91 80353 12770", provider: "plivo", usedToday: 14, limit: 200, on: true },
];

export default function PhoneNumbersPage() {
  const [pool, setPool] = useState(SEED);

  const addNumber = () => {
    const next = `+91 80353 ${String(10000 + Math.floor((pool.length * 7919) % 90000)).slice(0, 5)}`;
    setPool((p) => [...p, { num: next, provider: "plivo", usedToday: 0, limit: 200, on: true }]);
    toast({ title: "Number added", body: `${next} joined the pool — campaigns rotate through it from the next call.`, severity: "success" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><Phone className="size-6 text-caramel" /> Outbound Caller IDs</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            The numbers used as caller ID on outbound calls — campaigns rotate through them round-robin.
            A campaign can use all of these, or a chosen subset. Call-volume limits (concurrency / daily) are set on the campaign, not the number.
          </p>
        </div>
        <Button onClick={addNumber} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Add number</Button>
      </div>

      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <h2 className="font-serif text-lg font-semibold text-coffee">Numbers</h2>
        <p className="text-xs text-muted-foreground">{pool.length} number{pool.length === 1 ? "" : "s"} in the pool</p>
        <ul className="mt-4 divide-y divide-foam/70">
          {pool.map((n, i) => (
            <li key={n.num} className="flex flex-wrap items-center gap-4 py-3.5">
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className={cn("font-data text-[15px] font-semibold", n.on ? "text-coffee" : "text-latte line-through")}>{n.num}</span>
                  <span className="rounded-full bg-oat/70 px-2 py-0.5 font-data text-[10px] text-mocha">{n.provider}</span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{n.usedToday} of {n.limit} calls today</div>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-mocha">
                  Daily limit
                  <input type="number" value={n.limit}
                    onChange={(e) => setPool((p) => p.map((x, j) => (j === i ? { ...x, limit: Math.max(0, +e.target.value) } : x)))}
                    className="w-20 rounded-lg border border-foam bg-cream px-2 py-1.5 text-right font-data text-sm text-coffee outline-none focus:border-caramel" />
                </label>
                <button aria-label={n.on ? "Disable number" : "Enable number"}
                  onClick={() => { setPool((p) => p.map((x, j) => (j === i ? { ...x, on: !x.on } : x))); toast({ title: n.on ? "Number disabled" : "Number enabled", body: `${n.num} ${n.on ? "removed from" : "returned to"} rotation.`, severity: "info" }); }}
                  className={cn("relative h-5 w-9 rounded-full transition-colors", n.on ? "bg-success" : "bg-foam")}>
                  <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", n.on ? "left-[18px]" : "left-0.5")} />
                </button>
                <button aria-label={`Remove ${n.num}`}
                  onClick={() => { setPool((p) => p.filter((_, j) => j !== i)); toast({ title: "Number removed", body: `${n.num} left the pool.`, severity: "warning" }); }}
                  className="text-latte transition-colors hover:text-danger"><Trash2 className="size-4" /></button>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-foam">
                <div className={cn("h-full rounded-full", n.on ? "bg-gradient-to-r from-mocha to-caramel" : "bg-latte/50")} style={{ width: `${Math.min(100, (n.usedToday / Math.max(1, n.limit)) * 100)}%` }} />
              </div>
            </li>
          ))}
          {pool.length === 0 && (
            <li className="flex flex-col items-center gap-2 py-10 text-center">
              <Power className="size-5 text-latte" />
              <p className="text-sm text-muted-foreground">No numbers in the pool — add one to start dialing.</p>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
