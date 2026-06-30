"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, ChevronLeft, ChevronRight, Info, Save, Plus, Trash2, Lock, AlertTriangle,
  ListChecks, Users2, Target, GitBranch, Phone, BookOpen, Sparkles, ChevronDown, Braces, Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpHint } from "@/components/ui-bits/help-hint";
import { Tour, type TourStep } from "@/components/onboarding/tour";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import {
  products, coreFields, fieldTypes, campaignTypes2, agentGenders, langs, scoreBands,
  inCallSignals, dispositions, phoneNumbers, backgroundSounds, agentSkills,
} from "@/lib/campaign-config-mock";

const ADV_TOUR: TourStep[] = [
  { sel: '[data-tour="adv-steps"]', title: "Six guided steps", body: "Work top to bottom: Basics, Lead Schema, Customer Data, Scoring, Conversation, then Phone & Outcomes. Green = done — jump back anytime." },
  { sel: '[data-tour="adv-name"]', title: "Name & agent", body: "Campaign name and agent name are the only required fields to advance. Calling rules, language and limits live under “Calling rules & limits”." },
  { sel: '[data-tour="adv-help"]', title: "Hover for help", body: "Every field with a ⓘ explains itself — and the ? on each section header gives you the full context. Hover any of them." },
  { sel: '[data-tour="adv-next"]', title: "Save or continue", body: "Save as Draft on any step — campaigns land in Draft until you activate them. Next is gated on Lead Schema until you add at least one field." },
  { sel: '[data-tour="adv-summary"]', title: "Live summary", body: "This panel updates as you build, and shows your progress. Create the campaign from here anytime." },
];

const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";
const STEPS = [
  { key: "basic", label: "Basics", icon: Info, sub: "Name, agent & calling rules" },
  { key: "schema", label: "Lead Schema", icon: ListChecks, sub: "The columns each lead carries" },
  { key: "customer", label: "Customer Data", icon: Users2, sub: "What to collect on the call" },
  { key: "scoring", label: "Scoring", icon: Target, sub: "How leads are ranked" },
  { key: "flow", label: "Conversation", icon: GitBranch, sub: "What the agent says" },
  { key: "phone", label: "Phone & Outcomes", icon: Phone, sub: "Number, transfer & dispositions" },
  { key: "skills", label: "Agent Skills", icon: Wrench, sub: "Real-time tools the agent can use" },
];

// real hover tooltip (not a native title=) — shows the explanation on hover/focus
function Tip({ t }: { t: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" aria-label="More info" className="inline-flex cursor-help text-muted-foreground/60 transition-colors hover:text-caramel"><Info className="size-3.5" /></button>}
      />
      <TooltipContent side="top" className="max-w-[260px] text-left leading-relaxed">{t}</TooltipContent>
    </Tooltip>
  );
}
function Lbl({ children, req, tip }: { children: React.ReactNode; req?: boolean; tip?: string }) {
  return <label className="flex items-center gap-1 text-sm font-medium text-coffee">{children}{req && <span className="text-danger">*</span>}{tip && <Tip t={tip} />}</label>;
}
function Group({ title, sub, help, children }: { title?: string; sub?: string; help?: string; children: React.ReactNode }) {
  return <div>{title && <div className="mb-3"><h3 className="flex items-center gap-1.5 text-sm font-semibold text-coffee">{title}{help && <HelpHint text={help} side="top" />}</h3>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div>}<div className="space-y-4">{children}</div></div>;
}
function More({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-foam bg-card/60">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-mocha"><ChevronDown className="size-4 transition-transform group-open:rotate-180" /> {label}</summary>
      <div className="space-y-4 px-3.5 pb-4 pt-1">{children}</div>
    </details>
  );
}
function Toggle({ on, set, dim }: { on: boolean; set?: () => void; dim?: boolean }) {
  return <button type="button" disabled={!set} onClick={set} className={cn("relative h-5 w-9 shrink-0 rounded-full transition-colors", on ? "bg-success" : "bg-foam", dim && "opacity-60")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-0.5")} /></button>;
}
type XField = { label: string; name: string; type: string; def: string; required: boolean; scoring: boolean; convo: boolean };

export default function AdvancedCreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [tried, setTried] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [agent, setAgent] = useState("");
  const [type, setType] = useState(campaignTypes2[0]);
  const [lang, setLang] = useState(langs[0]);
  const [xfields, setXfields] = useState<XField[]>([]);
  const [cdata, setCdata] = useState<{ label: string }[]>([]);
  const [warmT, setWarmT] = useState(scoreBands.warm);
  const [hotT, setHotT] = useState(scoreBands.hot);
  const [prompt, setPrompt] = useState("You are {agent_name} from {company}. Greet warmly, confirm the right person, state the benefit in one line, handle objections, and capture intent. Respect Do-Not-Call.");
  const [objs, setObjs] = useState<{ o: string; r: string }[]>([{ o: "not available right now", r: "what would be a good time to call you back?" }]);
  const [transferOn, setTransferOn] = useState(false);
  const [skills, setSkills] = useState(() => agentSkills.map((s) => ({ ...s })));
  const cur = STEPS[step];

  const addX = () => setXfields((f) => [...f, { label: `Field ${String.fromCharCode(65 + f.length)}`, name: `field_${f.length + 1}`, type: "Text", def: "", required: false, scoring: false, convo: true }]);
  const setX = (i: number, patch: Partial<XField>) => setXfields((f) => f.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const scoringFields = xfields.filter((f) => f.scoring);

  const canNext = (() => {
    if (cur.key === "basic") return name.trim().length > 0 && agent.trim().length > 0;
    if (cur.key === "schema") return xfields.length >= 1;
    return true;
  })();
  const goNext = () => { if (!canNext) { setTried(true); return; } setTried(false); setStep((s) => Math.min(STEPS.length - 1, s + 1)); };
  const draft = () => toast({ title: "Saved as draft", body: "Resume anytime — drafts live for 5 days.", severity: "info" });
  const create = () => { toast({ title: "Campaign created", body: `“${name || "Untitled"}” saved as draft.`, severity: "success" }); router.push("/campaigns"); };

  // live summary rows
  const summary = [
    { k: "Type", v: type, done: true },
    { k: "Lead schema", v: xfields.length ? `${xfields.length} extra field${xfields.length > 1 ? "s" : ""}` : "core only", done: xfields.length > 0 },
    { k: "Customer data", v: cdata.length ? `${cdata.length} field${cdata.length > 1 ? "s" : ""}` : "none", done: cdata.length > 0 },
    { k: "Scoring", v: `${warmT} / ${hotT}`, done: true },
    { k: "Objection handlers", v: `${objs.length}`, done: objs.length > 0 },
    { k: "Transfer", v: transferOn ? "On" : "Off", done: true },
    { k: "Agent skills", v: `${skills.filter((s) => s.on).length} on`, done: true },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Create Campaign" subtitle="Advanced — full control, step by step."
        actions={
          <div className="flex items-center gap-2">
            <button data-tour="adv-help" onClick={() => window.dispatchEvent(new CustomEvent("start-tour"))} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foam bg-oat/70 px-3 py-1.5 text-xs font-medium text-mocha transition-colors hover:bg-foam">
              <Sparkles className="size-3.5 text-caramel" /> Show me how
            </button>
            <Button variant="outline" size="sm" onClick={() => router.push("/campaigns/quick")} className="text-mocha">Switch to Quick</Button>
          </div>
        } />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[190px_1fr_270px]">
        {/* STEP RAIL */}
        <nav data-tour="adv-steps" className="flex gap-1 overflow-x-auto rounded-2xl border border-foam bg-porcelain p-2 shadow-glass lg:flex-col lg:overflow-visible">
          {STEPS.map((s, i) => {
            const Icon = s.icon; const active = i === step; const done = i < step;
            return (
              <button key={s.key} onClick={() => setStep(i)} className={cn("flex shrink-0 items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors", active ? "bg-secondary" : "hover:bg-oat/60")}>
                <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold", done ? "bg-success text-white" : active ? "bg-brand text-brand-foreground" : "bg-foam text-muted-foreground")}>{done ? <Check className="size-3" /> : i + 1}</span>
                <span className="min-w-0"><span className={cn("block text-sm font-medium", active ? "text-brand" : done ? "text-coffee" : "text-mocha/80")}>{s.label}</span><span className="hidden text-[11px] leading-tight text-muted-foreground lg:block">{s.sub}</span></span>
              </button>
            );
          })}
        </nav>

        {/* FORM */}
        <div className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
          <div className="mb-1 flex items-center gap-2"><cur.icon className="size-5 text-caramel" /><h2 className="font-serif text-xl font-semibold text-coffee">{cur.label}</h2></div>
          <p className="mb-6 text-sm text-muted-foreground">{cur.sub}.</p>

          {/* STEP: BASICS */}
          {cur.key === "basic" && (
            <div className="space-y-6">
              <Group title="Identity" help="The campaign's name, who the AI says it is, and the language it speaks. Name and Agent are required; everything else inherits org defaults.">
                <div data-tour="adv-name" className="space-y-1.5"><Lbl req tip="Naming convention: Product - Segment - Quarter. Appears in reports and the calls list.">Campaign Name</Lbl><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Loan — Salaried — Q1" className={inputCls} />{tried && !name.trim() && <p className="text-xs text-danger">Campaign name is required</p>}</div>
                <div className="space-y-1.5"><Lbl tip="Internal note — never spoken on the call. Helps your team know what this campaign is for.">Description</Lbl><textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of the campaign" className={inputCls + " h-16 resize-none"} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Lbl req tip="The name the AI introduces itself with.">Agent Name</Lbl><Input value={agent} onChange={(e) => setAgent(e.target.value)} placeholder="e.g. Anjali" className={inputCls} />{tried && !agent.trim() && <p className="text-xs text-danger">Agent name is required</p>}</div>
                  <div className="space-y-1.5"><Lbl>Company Name</Lbl><Input defaultValue="Blostem" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl tip="Drives Hindi conjugation & TTS voice.">Agent Gender</Lbl><select className={inputCls}>{agentGenders.map((g) => <option key={g}>{g}</option>)}</select></div>
                  <div className="space-y-1.5"><Lbl>Language</Lbl><select value={lang} onChange={(e) => setLang(e.target.value)} className={inputCls}>{langs.map((l) => <option key={l}>{l}</option>)}</select></div>
                </div>
                <div className="space-y-1.5"><Lbl tip="Opening line. Supports {full_name}, {company}, {agent_name}.">Greeting</Lbl><Input defaultValue="Hi {full_name}, this is {agent_name} from {company}." className={inputCls} /></div>
              </Group>

              <More label="Calling rules & limits">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Lbl tip="Outbound: you call leads. Missed Call: auto-callback. Inbound: receive.">Campaign Type</Lbl><select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>{campaignTypes2.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div className="space-y-1.5"><Lbl tip="Shown on Truecaller.">Call Reason Tag</Lbl><Input placeholder="e.g. Loan Offer" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Call Start (IST)</Lbl><Input type="time" defaultValue="09:00" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Call End (IST)</Lbl><Input type="time" defaultValue="21:00" className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Max Concurrent Calls</Lbl><Input type="number" defaultValue={3} className={inputCls} /></div>
                  <div className="space-y-1.5"><Lbl>Daily Call Limit</Lbl><Input type="number" defaultValue={1000} className={inputCls} /></div>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="size-3.5" /> Calls stay within the compliance window (09:00–21:00 IST).</p>
              </More>
            </div>
          )}

          {/* STEP: LEAD SCHEMA */}
          {cur.key === "schema" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-info/25 bg-info/5 p-3 text-xs text-mocha">
                <span className="font-medium text-coffee">3 core fields are automatic</span> — Phone, Full Name, Email. Only add the extra columns this campaign needs (e.g. monthly_income, employer).
              </div>
              <div className="space-y-1.5"><Lbl req>Schema name</Lbl><Input defaultValue={name ? `${name} — Lead Schema` : "Lead Schema"} className={inputCls + " max-w-sm"} /></div>

              {xfields.length === 0 ? (
                <button onClick={addX} className="flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-latte bg-oat/30 px-6 py-8 text-center transition-colors hover:border-caramel hover:bg-oat/50">
                  <Plus className="size-6 text-caramel" /><span className="text-sm font-medium text-coffee">Add your first field</span><span className="text-xs text-muted-foreground">Next unlocks once you add one.</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {xfields.map((f, i) => (
                    <div key={i} className="rounded-xl border border-foam bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Input value={f.label} onChange={(e) => setX(i, { label: e.target.value })} className={inputCls + " flex-1"} placeholder="Label" />
                        <Input value={f.name} onChange={(e) => setX(i, { name: e.target.value })} className={inputCls + " w-28 font-data"} placeholder="name" />
                        <select value={f.type} onChange={(e) => setX(i, { type: e.target.value })} className={inputCls + " w-24"}>{fieldTypes.map((t) => <option key={t}>{t}</option>)}</select>
                        <Input value={f.def} onChange={(e) => setX(i, { def: e.target.value })} className={inputCls + " w-24"} placeholder="Default" />
                        <button onClick={() => setXfields((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-mocha">
                        <span className="flex items-center gap-1.5"><Toggle on={f.required} set={() => setX(i, { required: !f.required })} /> Required <Tip t="Leads missing this column are rejected at upload." /></span>
                        <span className="flex items-center gap-1.5"><Toggle on={f.scoring} set={() => setX(i, { scoring: !f.scoring })} /> Scoring input <Tip t="Only fields flagged here feed the pre-call score (Cold / Warm / Hot)." /></span>
                        <span className="flex items-center gap-1.5"><Toggle on={f.convo} set={() => setX(i, { convo: !f.convo })} /> Agent can see <code className="font-data">{`{${f.name}}`}</code> <Tip t="Exposes the value to the agent at call time. Off keeps it private even if populated." /></span>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addX} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add field</Button>
                </div>
              )}
            </div>
          )}

          {/* STEP: CUSTOMER DATA */}
          {cur.key === "customer" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Details the agent collects <span className="font-medium text-coffee">during the call</span> (optional). Field names are auto-prefixed <code className="font-data text-mocha">ld_enrich_</code> so they can never clash with Lead Schema, and answers are stored <span className="font-medium text-coffee">per call</span> — re-calling a lead records a fresh set.</p>
              <div className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning/5 p-3 text-xs text-mocha"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" /> Needs the <span className="font-medium text-coffee">“Customer Data” agent skill</span> enabled (Settings → Skills) to actually collect.</div>
              {cdata.map((c, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-foam bg-card p-2.5">
                  <Input value={c.label} onChange={(e) => setCdata((d) => d.map((x, j) => (j === i ? { label: e.target.value } : x)))} className={inputCls + " flex-1"} placeholder="e.g. Monthly Income" />
                  <span className="font-data text-xs text-muted-foreground">ld_enrich_{c.label.toLowerCase().replace(/\s+/g, "_") || "field"}</span>
                  <select className={inputCls + " w-28"}>{fieldTypes.map((t) => <option key={t}>{t}</option>)}</select>
                  <button onClick={() => setCdata((d) => d.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
                </div>
              ))}
              <Button onClick={() => setCdata((d) => [...d, { label: "" }])} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add field</Button>
            </div>
          )}

          {/* STEP: SCORING */}
          {cur.key === "scoring" && (
            <div className="space-y-6">
              <Group title="Score buckets" sub="Where Cold becomes Warm becomes Hot.">
                <div className="flex gap-2 text-xs"><span className="rounded-full bg-secondary px-2.5 py-1 text-mocha">Cold 0–{warmT}</span><span className="rounded-full bg-warning/15 px-2.5 py-1 text-warning">Warm {warmT}–{hotT}</span><span className="rounded-full bg-danger/12 px-2.5 py-1 text-danger">Hot {hotT}–100</span></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="flex justify-between text-xs text-mocha"><span>Warm threshold</span><span className="font-data">{warmT}</span></div><input type="range" min={10} max={hotT - 5} value={warmT} onChange={(e) => setWarmT(+e.target.value)} className="w-full accent-caramel" /></div>
                  <div><div className="flex justify-between text-xs text-mocha"><span>Hot threshold</span><span className="font-data">{hotT}</span></div><input type="range" min={warmT + 5} max={95} value={hotT} onChange={(e) => setHotT(+e.target.value)} className="w-full accent-caramel" /></div>
                </div>
              </Group>
              <More label={`Pre-score weights (${scoringFields.length})`}>
                {scoringFields.length === 0 ? <p className="text-xs text-muted-foreground">Flag a field as “Scoring input” in Lead Schema to weight it here.</p>
                  : scoringFields.map((f) => <div key={f.name} className="flex items-center justify-between rounded-xl border border-foam bg-card px-3 py-2 text-sm"><span className="text-coffee">{f.label}</span><Input type="number" defaultValue={10} className={inputCls + " w-20 text-right"} /></div>)}
              </More>
              <More label={`In-call adjustments (${inCallSignals.length} built-in)`}>
                <p className="text-xs text-muted-foreground">Locked signals the agent applies live as the score moves Cold → Warm → Hot during the call.</p>
                <div className="space-y-1.5">{inCallSignals.map((s) => (
                  <div key={s.key} className="flex items-center justify-between rounded-lg border border-foam bg-card px-3 py-1.5 text-sm"><span className="flex items-center gap-1.5 text-coffee"><Lock className="size-3 text-muted-foreground" /> {s.label}</span><span className={cn("font-data", s.delta >= 0 ? "text-success" : "text-danger")}>{s.delta > 0 ? "+" : ""}{s.delta}</span></div>
                ))}</div>
                <button onClick={() => toast({ title: "Add adjustment", body: "Define a custom in-call signal and its score delta.", severity: "info" })} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-latte px-3 py-1.5 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> Add custom adjustment</button>
              </More>
            </div>
          )}

          {/* STEP: CONVERSATION */}
          {cur.key === "flow" && (
            <div className="space-y-5">
              <Button variant="outline" size="sm" className="gap-1.5 text-mocha" onClick={() => toast({ title: "Import flow", body: "Pick a template from the library.", severity: "info" })}><BookOpen className="size-4" /> Import from library</Button>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Lbl>Greeting</Lbl><Input defaultValue="Hi {full_name}, this is {agent_name}…" className={inputCls} /></div>
                <div className="space-y-1.5"><Lbl>End-call message</Lbl><Input defaultValue="Thanks for your time!" className={inputCls} /></div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between"><Lbl tip="Every LLM turn re-processes this prompt — keep it tight. Variables below are filled per lead at call time.">System prompt</Lbl><span className="text-xs text-muted-foreground">{prompt.length} chars</span></div>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className={inputCls + " h-28 font-data text-xs"} />
              </div>

              {/* variables reference panel */}
              <div className="rounded-xl border border-foam bg-oat/30 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-coffee"><Braces className="size-3.5 text-caramel" /> Variables you can use<HelpHint text="Drop any of these into the greeting, end-call message or system prompt — each is replaced with the lead's value at call time." side="top" /></div>
                <div className="mt-2.5 space-y-2">
                  {[
                    { g: "Campaign", vars: ["{company}", "{agent_name}", "{agent_gender}", "{language}"] },
                    { g: "Lead", vars: ["{full_name}", "{phone}", "{email}"] },
                    { g: "Lead schema", vars: xfields.filter((f) => f.convo).map((f) => `{${f.name}}`) },
                    { g: "Customer data", vars: cdata.filter((c) => c.label).map((c) => `{ld_enrich_${c.label.toLowerCase().replace(/\s+/g, "_")}}`) },
                  ].map((row) => (
                    <div key={row.g} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="w-24 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{row.g}</span>
                      {row.vars.length
                        ? row.vars.map((v) => <code key={v} className="rounded border border-foam bg-card px-1.5 py-0.5 font-data text-[11px] text-mocha">{v}</code>)
                        : <span className="text-[11px] italic text-muted-foreground/70">none yet — add fields in earlier steps</span>}
                    </div>
                  ))}
                </div>
              </div>
              <More label="Objection handlers">
                {objs.map((o, i) => (
                  <div key={i} className="flex items-center gap-2"><Input value={o.o} onChange={(e) => setObjs((x) => x.map((y, j) => (j === i ? { ...y, o: e.target.value } : y)))} placeholder="Objection" className={inputCls + " flex-1"} /><ChevronRight className="size-4 shrink-0 text-muted-foreground" /><Input value={o.r} onChange={(e) => setObjs((x) => x.map((y, j) => (j === i ? { ...y, r: e.target.value } : y)))} placeholder="Response" className={inputCls + " flex-1"} /><button onClick={() => setObjs((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button></div>
                ))}
                <Button onClick={() => setObjs((o) => [...o, { o: "", r: "" }])} variant="outline" size="sm" className="gap-1.5 text-mocha"><Plus className="size-4" /> Add handler</Button>
              </More>
              <More label="Voice, LLM & timing">
                <div className="grid grid-cols-3 gap-4 text-xs text-mocha">
                  {[["Stability", "0.6"], ["Speed", "1.05×"], ["Temperature", "0.3"], ["Max tokens", "150"], ["Silence timeout", "30s"], ["Max duration", "600s"]].map(([k, v]) => (
                    <div key={k}><div className="flex justify-between"><span>{k}</span><span className="font-data text-coffee">{v}</span></div><input type="range" className="mt-1 w-full accent-caramel" defaultValue={50} /></div>
                  ))}
                  <div className="space-y-1.5"><span>Background sound</span><select className={inputCls}>{backgroundSounds.map((b) => <option key={b}>{b}</option>)}</select></div>
                </div>
              </More>
            </div>
          )}

          {/* STEP: PHONE & OUTCOMES */}
          {cur.key === "phone" && (
            <div className="space-y-6">
              <Group title="Outbound number"><select className={inputCls + " max-w-sm"}>{phoneNumbers.map((n) => <option key={n.id}>{n.label}</option>)}</select></Group>
              <div className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                <div><div className="text-sm font-medium text-coffee">Enable Call Transfer</div><div className="text-xs text-muted-foreground">{transferOn ? "Agent hands off to a human." : "Agent ends calls itself."}</div></div>
                <Toggle on={transferOn} set={() => setTransferOn((v) => !v)} />
              </div>
              {transferOn && <div className="space-y-1.5"><Lbl req>Transfer number</Lbl><Input placeholder="+91 …" className={inputCls + " max-w-sm"} /></div>}
              <Group title="Call dispositions" sub="Built-ins are locked; add your own below." help="Outcomes the agent records at the end of every call. The seven built-ins are fixed; add campaign-specific labels for your own reporting.">
                <div className="flex flex-wrap gap-2">
                  {dispositions.map((d) => <span key={d.key} className="inline-flex items-center gap-1.5 rounded-full border border-foam bg-card px-3 py-1.5 text-sm text-coffee"><Lock className="size-3 text-muted-foreground" /> {d.label}</span>)}
                  <button onClick={() => toast({ title: "Add disposition", body: "Define a custom outcome.", severity: "info" })} className="rounded-full border border-dashed border-latte px-3 py-1.5 text-sm text-mocha hover:border-caramel">+ Add outcome</button>
                </div>
              </Group>
            </div>
          )}

          {/* STEP: AGENT SKILLS */}
          {cur.key === "skills" && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">Real-time tools the agent can invoke <span className="font-medium text-coffee">mid-call</span>. Core skills are always on; toggle the optional ones for this campaign.</p>
              <div className="flex items-start gap-2 rounded-xl border border-info/25 bg-info/5 p-3 text-xs text-mocha"><Info className="mt-0.5 size-4 shrink-0 text-info" /> Keep <code className="font-data text-coffee">customer_data</code> on or the Customer Data fields you defined in step 3 won&apos;t be collected. Org-wide skills live in <span className="font-medium text-coffee">Settings → Agent Skills</span>.</div>
              <div className="space-y-2">
                {skills.map((s, i) => {
                  const gates = s.id === "customer_data";
                  return (
                    <div key={s.id} className={cn("flex items-center gap-3 rounded-xl border bg-card p-3", gates ? "border-info/40" : "border-foam")}>
                      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", s.on ? "bg-secondary text-brand" : "bg-oat text-latte")}><Wrench className="size-4" /></span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-data text-sm font-medium text-coffee">{s.name}</code>
                          {s.core && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mocha">core</span>}
                          {gates && <span className="rounded-full bg-info/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-info">gates step 3</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{s.desc}</div>
                      </div>
                      {s.core
                        ? <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground"><Lock className="size-3" /> Always on</span>
                        : <Toggle on={s.on} set={() => setSkills((arr) => arr.map((x, j) => (j === i ? { ...x, on: !x.on } : x)))} />}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => toast({ title: "Add custom skill", body: "Connect a tool/API the agent can call. Configure in Settings → Agent Skills.", severity: "info" })} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-latte px-3 py-2 text-sm text-mocha transition-colors hover:border-caramel"><Plus className="size-4" /> Add custom skill</button>
            </div>
          )}

          {/* footer nav */}
          <div className="mt-7 flex items-center justify-between border-t border-foam pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => { setTried(false); setStep((s) => s - 1); }} className="gap-1.5 text-mocha"><ChevronLeft className="size-4" /> Back</Button>
            <div data-tour="adv-next" className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={draft} className="gap-1.5 text-mocha"><Save className="size-4" /> Save Draft</Button>
              {step < STEPS.length - 1
                ? <Button onClick={goNext} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark">Next <ChevronRight className="size-4" /></Button>
                : <Button onClick={create} className="gap-1.5 bg-coffee text-cream hover:bg-espresso">Create Campaign <Check className="size-4" /></Button>}
            </div>
          </div>
        </div>

        {/* LIVE SUMMARY */}
        <aside data-tour="adv-summary" className="h-fit rounded-2xl border border-foam bg-porcelain p-5 shadow-glass lg:sticky lg:top-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mocha"><Sparkles className="size-3.5 text-caramel" /> Live summary</div>
          <div className="mt-2 font-serif text-lg font-semibold text-coffee">{name || <span className="text-muted-foreground">Untitled campaign</span>}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{agent ? `Agent ${agent}` : "No agent yet"} · {lang}</div>

          <div className="mt-4 space-y-2 border-t border-foam pt-3">
            {summary.map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">{r.done ? <Check className="size-3.5 text-success" /> : <span className="size-3.5 rounded-full border border-latte" />}{r.k}</span>
                <span className="truncate text-right font-medium text-coffee">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foam"><div className="h-full rounded-full bg-gradient-to-r from-mocha to-caramel transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div><span className="font-data text-[11px] text-muted-foreground">{step + 1}/{STEPS.length}</span></div>

          <Button onClick={create} className="mt-4 w-full gap-1.5 bg-coffee text-cream hover:bg-espresso"><Check className="size-4" /> Create Campaign</Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">Saved as draft — activate when ready.</p>
        </aside>
      </div>

      <Tour steps={ADV_TOUR} storageKey="vox-tour-adv" />
    </div>
  );
}
