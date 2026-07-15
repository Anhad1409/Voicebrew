"use client";

/* Settings → Human Agent Numbers — where the bot transfers calls to. */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, PhoneForwarded, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";

type AgentNum = { num: string; label: string; assigned: string | null; active: boolean };

export default function AgentNumbersPage() {
  const [nums, setNums] = useState<AgentNum[]>([]);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");

  const add = () => {
    if (!/\d{10}/.test(phone.replace(/\D/g, ""))) { toast({ title: "Check the number", body: "Enter a valid 10-digit Indian mobile number.", severity: "warning" }); return; }
    setNums((n) => [...n, { num: phone, label: label.trim() || "Agent line", assigned: null, active: true }]);
    setAdding(false); setPhone(""); setLabel("");
    toast({ title: "Number registered", body: "Assign it to an agent when you invite them (Settings → Team Members).", severity: "success" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to Settings</Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><PhoneForwarded className="size-6 text-caramel" /> Human Agent Numbers</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">The phone numbers the bot transfers calls to. Add your agents&apos; numbers here, then assign one to each agent when you invite them. Only active, unassigned numbers can be handed to a new agent.</p>
        </div>
        <Button onClick={() => setAdding(true)} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Add number</Button>
      </div>

      <section className="rounded-2xl border border-foam bg-porcelain p-5 shadow-glass">
        <h2 className="font-serif text-lg font-semibold text-coffee">Registered numbers</h2>
        <p className="text-xs text-muted-foreground">{nums.length} number{nums.length === 1 ? "" : "s"} registered</p>

        {adding && (
          <div className="mt-4 grid gap-2.5 rounded-xl border border-caramel/40 bg-card p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98xxx xxxxx" autoFocus className="rounded-lg border border-foam bg-cream px-3 py-2 font-data text-sm text-coffee outline-none focus:border-caramel" />
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label — e.g. Collections desk 1" className="rounded-lg border border-foam bg-cream px-3 py-2 text-sm text-coffee outline-none focus:border-caramel" />
            <Button size="sm" onClick={add} className="bg-brand text-brand-foreground hover:bg-brand-dark">Register</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-mocha">Cancel</Button>
          </div>
        )}

        {nums.length === 0 && !adding ? (
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-oat/40" />)}
            <p className="pt-2 text-center text-sm text-muted-foreground">No numbers yet — add your first agent line to enable warm transfers.</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-foam/70">
            {nums.map((n, i) => (
              <li key={n.num + i} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-[200px]">
                  <div className="font-data text-[15px] font-semibold text-coffee">{n.num}</div>
                  <div className="text-xs text-muted-foreground">{n.label}</div>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", n.assigned ? "bg-info/10 text-info" : "bg-success/10 text-success")}>{n.assigned ? `Assigned · ${n.assigned}` : "Unassigned — available"}</span>
                <div className="ml-auto flex items-center gap-3">
                  <button role="switch" aria-checked={n.active}
                    onClick={() => setNums((x) => x.map((y, j) => (j === i ? { ...y, active: !y.active } : y)))}
                    className={cn("relative h-5 w-9 rounded-full transition-colors", n.active ? "bg-success" : "bg-foam")}>
                    <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", n.active ? "left-[18px]" : "left-0.5")} />
                  </button>
                  <button onClick={() => { setNums((x) => x.filter((_, j) => j !== i)); toast({ title: "Number removed", body: `${n.num} deleted.`, severity: "warning" }); }} aria-label={`Remove ${n.num}`} className="text-latte hover:text-danger"><Trash2 className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
