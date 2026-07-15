"use client";

/* Shared scaffold for the three reusable-config template libraries
   (lead schema / scoring config / conversation flow). Seeded with one
   example + working create/delete so the page is never a dead end. */

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Plus, Trash2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/notifications/toaster";

export type SeedTpl = { name: string; desc: string; meta: string; system?: boolean };

export function TemplateLibrary({ icon: Icon, title, blurb, noun, seed, createBody }: {
  icon: LucideIcon; title: string; blurb: string; noun: string; seed: SeedTpl[]; createBody: string;
}) {
  const [tpls, setTpls] = useState<SeedTpl[]>(seed);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const create = () => {
    if (!name.trim()) { toast({ title: "Name it first", body: `Give the ${noun} a recognisable name.`, severity: "warning" }); return; }
    setTpls((t) => [...t, { name: name.trim(), desc: createBody, meta: "Custom · created today" }]);
    setCreating(false); setName("");
    toast({ title: "Template created", body: `“${name.trim()}” is available in the campaign wizard.`, severity: "success" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/settings" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Back to settings</Link>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="flex items-center gap-2.5 font-serif text-3xl font-semibold tracking-tight text-coffee"><Icon className="size-6 text-caramel" /> {title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-1.5 bg-brand text-brand-foreground shadow-cta hover:bg-brand-dark"><Plus className="size-4" /> Create template</Button>
      </div>

      {creating && (
        <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-2xl border border-caramel/40 bg-porcelain p-4 shadow-glass">
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder={`${title.replace(" Templates", "")} name — e.g. NBFC standard`}
            className="min-w-[260px] flex-1 rounded-xl border border-foam bg-cream px-3.5 py-2.5 text-sm text-coffee outline-none focus:border-caramel" />
          <Button size="sm" onClick={create} className="bg-brand text-brand-foreground hover:bg-brand-dark">Create</Button>
          <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="text-mocha">Cancel</Button>
        </div>
      )}

      {tpls.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-foam bg-porcelain py-16 text-center shadow-glass">
          <Icon className="size-6 text-latte" />
          <p className="text-sm font-medium text-coffee">No templates yet.</p>
          <p className="text-xs text-muted-foreground">Create your first {noun} to speed up future campaigns.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tpls.map((t, i) => (
            <div key={t.name + i} className="rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-coffee">{t.name}</h3>
                {t.system
                  ? <span className="inline-flex items-center gap-1 rounded-full bg-oat/80 px-2 py-0.5 text-[10px] font-medium text-mocha"><Lock className="size-3" /> System</span>
                  : <button onClick={() => { setTpls((x) => x.filter((_, j) => j !== i)); toast({ title: "Template deleted", body: `“${t.name}” removed.`, severity: "warning" }); }} aria-label={`Delete ${t.name}`} className="text-latte hover:text-danger"><Trash2 className="size-4" /></button>}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
              <p className="mt-2 font-data text-[11px] text-latte">{t.meta}</p>
              <button onClick={() => toast({ title: "Ready in the wizard", body: `Import “${t.name}” from the campaign wizard — it's cross-checked against the campaign's schema first.`, severity: "info" })}
                className="mt-3 rounded-full border border-foam px-2.5 py-1 text-xs font-medium text-mocha hover:border-caramel hover:text-coffee">Use in a campaign →</button>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 rounded-xl bg-oat/50 px-4 py-3 text-xs text-mocha">
        Templates are cross-checked at import — any keys that don&apos;t match the campaign&apos;s lead schema are dropped before they can break anything.
      </p>
    </div>
  );
}
