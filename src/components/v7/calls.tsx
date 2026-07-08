"use client";

/* v7 Calls — "the pour log". Bucket chips carry their own colors, rows get
   bean dots + score meters, and the expanded dossier keeps its transcript. */

import { useMemo, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, ChevronRight, Headset, Play, FileText, Volume2, FlaskConical } from "lucide-react";
import { calls, campaigns, timeSeries } from "@/lib/data";
import { bucketOf, bucketMeta, bucketOrder, type Bucket } from "@/lib/outcomes";
import { formatDuration, formatDateTime, titleCase } from "@/lib/format";
import { BeanDot } from "@/components/coffee/bean-dot";
import { cn } from "@/lib/utils";
import { V7Banner, Chip, SearchPill, SectionCard, Meter, monoLabel, rowStagger, rowItem, EASE } from "./kit";

const businessOutcomes = ["All outcomes", "Not Connected", "Ended — No Outcome", "Transferred", "Callback Scheduled", "Do Not Call", "Not Interested", "Wrong Number"];
const preScore = (id: string) => 35 + (id.charCodeAt(id.length - 1) % 45);

export function V7Calls() {
  const router = useRouter();
  const [filter, setFilter] = useState<Bucket | "all">("all");
  const [campaign, setCampaign] = useState("All campaigns");
  const [q, setQ] = useState("");
  const [bizOutcome, setBizOutcome] = useState("All outcomes");
  const [testMode, setTestMode] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { reached: 0, callback: 0, dropped: 0, failed: 0 };
    for (const call of calls) c[bucketOf(call.disposition)] += 1;
    return c;
  }, []);

  const rows = calls.filter((c) => {
    if (filter !== "all" && bucketOf(c.disposition) !== filter) return false;
    if (q && !(`${c.lead_name} ${c.lead_phone} ${c.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const reachedPct = calls.length ? Math.round((counts.reached / calls.length) * 100) : 0;
  const avgDur = calls.length ? Math.round(calls.reduce((s, c) => s + c.duration_seconds, 0) / calls.length) : 0;
  const selectCls = "h-9 rounded-full border border-foam bg-porcelain px-3.5 text-[13px] text-coffee shadow-glass outline-none focus:border-caramel";

  return (
    <div className="mx-auto max-w-7xl">
      <V7Banner
        eyebrow="The pour log"
        title="Calls"
        subtitle={<><span className="font-medium text-coffee">{calls.length} pours</span> on the record — tap any row for the full dossier.</>}
        stats={[
          { label: "Reached", value: `${reachedPct}%`, spark: timeSeries.map((p) => p.completed), color: "var(--color-success)" },
          { label: "Avg pour", value: formatDuration(avgDur), spark: timeSeries.map((p) => p.avg_duration) },
          { label: "Callbacks", value: counts.callback, color: "var(--color-info)" },
        ]}
      />

      {/* filters — buckets carry their own colors */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} dot="var(--color-caramel)" count={calls.length}>Every pour</Chip>
        {bucketOrder.map((b) => (
          <Chip key={b} active={filter === b} onClick={() => setFilter(filter === b ? "all" : b)} dot={bucketMeta[b].color} count={counts[b]}>
            {bucketMeta[b].label}
          </Chip>
        ))}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select value={campaign} onChange={(e) => setCampaign(e.target.value)} className={selectCls}>
            <option>All campaigns</option>{campaigns.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <select value={bizOutcome} onChange={(e) => setBizOutcome(e.target.value)} className={selectCls}>
            {businessOutcomes.map((b) => <option key={b}>{b}</option>)}
          </select>
          <button onClick={() => setTestMode((v) => !v)}
            className={cn("flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium shadow-glass transition-colors",
              testMode ? "border-steam/40 bg-steam/10 text-steam" : "border-foam bg-porcelain text-latte hover:text-mocha")}>
            <FlaskConical className="size-3.5" /> Test pours
          </button>
          <SearchPill value={q} onChange={setQ} placeholder="Name, phone, or call ID…" className="w-56" />
        </div>
      </div>

      <SectionCard title="The pour log" count={`${rows.length} of ${calls.length}`}
        help="Pre/after is the lead's warmth score around this call. Expand a row for summary, transcript and recording.">
        <div className={cn("hidden grid-cols-[20px_minmax(0,1.9fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_150px_76px_minmax(0,1fr)] gap-4 border-b border-foam px-5 py-2 lg:grid", monoLabel)}>
          <span /><span>Cup</span><span>Call outcome</span><span>Business</span><span>Warmth pre → after</span><span className="text-right">Pour</span><span className="text-right">When</span>
        </div>

        <motion.ul variants={rowStagger} initial="hidden" animate="show">
          {rows.map((c) => {
            const b = bucketOf(c.disposition);
            const pre = preScore(c.id);
            const after = Math.max(0, Math.min(100, pre + (b === "reached" ? 14 : b === "callback" ? 6 : b === "dropped" ? -8 : -3)));
            const up = after >= pre;
            const open = expanded === c.id;
            return (
              <Fragment key={c.id}>
                <motion.li variants={rowItem} onClick={() => setExpanded(open ? null : c.id)}
                  className={cn("group grid cursor-pointer grid-cols-1 gap-2 border-b border-foam/70 px-5 py-3 transition-colors last:border-b-0 lg:grid-cols-[20px_minmax(0,1.9fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_150px_76px_minmax(0,1fr)] lg:items-center lg:gap-4",
                    open ? "bg-oat/50" : "hover:bg-oat/40")}>
                  <ChevronRight className={cn("size-4 text-latte transition-transform", open && "rotate-90 text-caramel")} />

                  <div className="flex min-w-0 items-center gap-2.5">
                    <BeanDot color={bucketMeta[b].color} className="size-3" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-coffee transition-colors group-hover:text-brand-dark">{c.lead_name}</div>
                      <div className="font-[family-name:var(--font-data)] text-[11px] text-latte">{c.lead_phone}</div>
                    </div>
                  </div>

                  <div>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium", bucketMeta[b].badge)}>
                      {c.disposition_label || titleCase(c.disposition)}
                    </span>
                  </div>

                  <div className="truncate text-[13px] text-mocha">{c.disposition_category ? titleCase(c.disposition_category) : "—"}</div>

                  <div>
                    <div className="flex items-center gap-1.5 font-[family-name:var(--font-data)] text-[12px] tabular-nums">
                      <span className="text-latte">{pre}</span>
                      <span className="text-latte">→</span>
                      <span className="font-semibold text-coffee">{after}</span>
                      <span className={cn("text-[10px]", up ? "text-success" : "text-danger")}>{up ? "▲" : "▼"}{Math.abs(after - pre)}</span>
                    </div>
                    <Meter pct={after} color={up ? "var(--color-success)" : "var(--color-danger)"} className="mt-1 w-[120px]" />
                  </div>

                  <div className="text-right font-[family-name:var(--font-data)] text-[13px] text-coffee tabular-nums">{formatDuration(c.duration_seconds)}</div>
                  <div className="text-right font-[family-name:var(--font-data)] text-[11px] text-latte">{formatDateTime(c.initiated_at)}</div>
                </motion.li>

                {/* the dossier */}
                <AnimatePresence initial={false}>
                  {open && (() => {
                    const summaryLine = b === "reached" ? `${c.lead_name} engaged on the call — ${c.disposition_label || titleCase(c.disposition)}. ${c.next_action ? titleCase(c.next_action) + " queued." : "No further action."}`
                      : b === "callback" ? `${c.lead_name} asked to be called back later.`
                      : b === "dropped" ? `Call with ${c.lead_name} dropped before completing.`
                      : `Couldn't connect to ${c.lead_name}.`;
                    const snippet = [
                      { who: "agent", text: "नमस्ते, मैं Blostem से Aria बोल रही हूँ। क्या अभी बात कर सकते हैं?" },
                      { who: "lead", text: b === "reached" ? "Haan, boliye." : b === "callback" ? "Abhi busy hoon, baad mein call karna." : "…" },
                      { who: "agent", text: b === "reached" ? "धन्यवाद! मैं details अभी भेज देती हूँ।" : "कोई बात नहीं, मैं callback schedule कर देती हूँ।" },
                    ];
                    const Fact = ({ k, v }: { k: string; v: React.ReactNode }) => (
                      <div><div className={monoLabel}>{k}</div><div className="mt-0.5 text-sm font-medium text-coffee">{v}</div></div>
                    );
                    return (
                      <motion.li key={`${c.id}-dossier`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: EASE }} className="overflow-hidden border-b border-foam/70 bg-oat/30 last:border-b-0">
                        <div className="grid grid-cols-1 gap-5 px-5 py-4 lg:grid-cols-[1.3fr_1fr] lg:pl-14">
                          <div>
                            <div className="flex items-center gap-2">
                              <BeanDot color={bucketMeta[b].color} className="size-3" />
                              <span className="font-serif text-[15px] font-semibold text-coffee">Call summary</span>
                            </div>
                            <p className="mt-1.5 text-sm text-coffee/90">{summaryLine}</p>
                            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                              <Fact k="Business outcome" v={c.disposition_category ? titleCase(c.disposition_category) : "—"} />
                              <Fact k="Pre → After" v={<span className="tabular-nums">{pre} → {after} <span className={cn("text-[10px]", up ? "text-success" : "text-danger")}>{up ? "▲" : "▼"}{Math.abs(after - pre)}</span></span>} />
                              <Fact k="Duration" v={formatDuration(c.duration_seconds)} />
                              <Fact k="Next action" v={c.next_action ? titleCase(c.next_action) : "—"} />
                              <Fact k="When" v={formatDateTime(c.initiated_at)} />
                              <Fact k="Call ID" v={<span className="font-[family-name:var(--font-data)] text-xs">{c.id.slice(0, 8)}</span>} />
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel"><Play className="size-3.5 text-caramel" /> Play recording</button>
                              <button className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3 py-1.5 text-xs font-medium text-mocha shadow-glass hover:border-caramel"><FileText className="size-3.5" /> Full transcript</button>
                              <button onClick={() => router.push("/handoff")} className="inline-flex items-center gap-1.5 rounded-full bg-coffee px-3 py-1.5 text-xs font-medium text-cream shadow-cta hover:bg-espresso"><Headset className="size-3.5" /> Open in handoff</button>
                            </div>
                          </div>
                          <div className="rounded-xl border border-foam bg-porcelain p-3 shadow-glass">
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-cta"><Play className="size-3.5" /></span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full w-1/4 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div>
                              <span className="font-[family-name:var(--font-data)] text-[11px] text-latte">{formatDuration(c.duration_seconds)}</span>
                              <Volume2 className="size-3.5 text-latte" />
                            </div>
                            <div className="mt-3 space-y-1.5">
                              {snippet.map((m, k) => (
                                <div key={k} className={cn("max-w-[90%] rounded-xl px-2.5 py-1.5 text-xs", m.who === "agent" ? "bg-oat/60 text-coffee" : "ml-auto bg-caramel/15 text-coffee")}>{m.text}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })()}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </motion.ul>

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <PhoneOff className="size-5 text-latte" />
            <p className="font-serif text-lg text-coffee">Nothing in the log</p>
            <p className="text-sm text-mocha">Pours will land here once campaigns start running.</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
