"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check, ChevronRight, ChevronLeft, Upload, Plus, X, Rocket, Coffee, Flame, Thermometer, Snowflake, Target, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HelpHint } from "@/components/ui-bits/help-hint";
import { Tour, type TourStep } from "@/components/onboarding/tour";
import { CupGlyph } from "@/components/coffee/cup-glyph";
import { toast } from "@/components/notifications/toaster";
import { languages, campaignTypes, defaults, fieldTypes, defaultSchema, type SchemaField } from "@/lib/builder-mock";
import { CHANNELS, SLOTS_PER_CHANNEL } from "@/lib/channel-mock";

const OTHERS_USING = 3; // channels in use by other campaigns (mock)
const FREE_CHANNELS = CHANNELS - OTHERS_USING;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = [
  { key: "basics", label: "Basics", hint: "Name & goal", help: "Name the campaign and pick its goal. The goal tunes sensible defaults — change anything later." },
  { key: "agent", label: "Agent & Voice", hint: "Persona & languages", help: "Set the agent's name, voice and languages. It can switch between selected languages mid-call." },
  { key: "audience", label: "Audience", hint: "Leads & schema", help: "Upload leads and define your lead schema — the fields the agent reads and that feed scoring." },
  { key: "customer", label: "Customer Data", hint: "What the agent knows", help: "Give the agent facts about your business & product it can cite on the call — plus FAQs and reference docs." },
  { key: "scoring", label: "Scoring", hint: "Qualify leads", help: "Decide which fields drive the lead score and where Hot / Warm / Cold bands fall." },
  { key: "convo", label: "Conversation", hint: "Script & handoff", help: "Opening line, end message, instructions, business context, objections and human handoff." },
  { key: "schedule", label: "Capacity & Schedule", hint: "Channels & pacing", help: "Allocate channels, set pacing & retries, and your calling schedule. You're billed by channels — never per minute." },
  { key: "launch", label: "Review & Launch", hint: "Check & go", help: "Final check — then launch." },
];

const WIZ_TOUR: TourStep[] = [
  { sel: '[data-tour="wiz-steps"]', title: "Six guided steps", body: "Work top to bottom. Green = done — jump back anytime. Every step is pre-filled with smart defaults." },
  { sel: '[data-tour="wiz-name"]', title: "Start simple", body: "Name your campaign and pick a goal. That's the only thing required to get going." },
  { sel: '[data-tour="wiz-next"]', title: "Move forward", body: "Next takes you through audience, what the agent knows & says, scoring, then capacity." },
  { sel: '[data-tour="wiz-summary"]', title: "Live summary", body: "This panel updates as you build — and Launch is the final step. That's it!" },
];

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-coffee">{label}{required && <span className="text-danger"> *</span>}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ on, onChange, size = "md" }: { on: boolean; onChange: (v: boolean) => void; size?: "sm" | "md" }) {
  const w = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const k = size === "sm" ? "size-4" : "size-5";
  const x = size === "sm" ? (on ? "left-[18px]" : "left-0.5") : (on ? "left-[22px]" : "left-0.5");
  return (
    <button type="button" onClick={() => onChange(!on)} className={cn("relative shrink-0 rounded-full transition-colors", w, on ? "bg-success" : "bg-foam")}>
      <span className={cn("absolute top-0.5 rounded-full bg-white shadow-sm transition-all", k, x)} />
    </button>
  );
}

function Advanced({ children, label = "Advanced settings" }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-dashed border-latte/60">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-mocha">
        <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />{label}
        <span className="ml-auto text-xs font-normal text-muted-foreground">{open ? "Hide" : "Optional — defaults applied"}</span>
      </button>
      {open && <div className="space-y-4 border-t border-foam p-4">{children}</div>}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";

function StepHeader({ title, help }: { title: string; help: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-coffee">{title}</h2>
      <HelpHint text={help} side="left" />
    </div>
  );
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    name: "", company: "Blostem Demo Organization", type: "Outbound", description: "", reasonTag: "",
    agentName: "", gender: defaults.agentGender, primaryLang: defaults.primaryLanguage, secondaryLangs: [...defaults.secondaryLanguages],
    voiceSpeed: defaults.voiceSpeed, creativity: defaults.creativity,
    schema: defaultSchema as SchemaField[],
    scoreCfg: { f3: { weight: 4, direction: "higher" as const }, f4: { weight: 3, direction: "higher" as const } } as Record<string, { weight: number; direction: "higher" | "lower" }>,
    hotThreshold: 70, warmThreshold: 40,
    facts: [
      { id: "k1", label: "Product", value: "Personal Loan" },
      { id: "k2", label: "Interest rate", value: "12% p.a." },
      { id: "k3", label: "Tenure", value: "12–60 months" },
    ] as { id: string; label: string; value: string }[],
    faqs: [{ id: "q1", q: "Can I prepay early?", a: "Yes — no penalty after 6 EMIs." }] as { id: string; q: string; a: string }[],
    greeting: "", endMessage: "", systemPrompt: "", context: "", objections: [{ q: "", a: "" }],
    transferEnabled: false, transferNumber: "",
    callStart: defaults.callStart, callEnd: defaults.callEnd, dailyLimit: defaults.dailyLimit,
    channelsAllocated: 2, rampUp: true, rampUpMins: 30,
    maxRetries: 3, retryGapHours: 4, bestTime: true,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as string[], startDate: "", endDate: "", skipHolidays: true,
    dncScrub: true, owner: "Arnika Raj", testCall: true,
  });
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  // schema helpers
  const updField = (id: string, patch: Partial<SchemaField>) =>
    set("schema", f.schema.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addField = () =>
    set("schema", [...f.schema, { id: "f" + Date.now(), label: "", key: "", type: "text", required: false, scoring: false, agentVar: false }]);
  const rmField = (id: string) => set("schema", f.schema.filter((x) => x.id !== id));

  const scoringFields = f.schema.filter((x) => x.scoring && x.label);
  const channels = f.channelsAllocated;
  const concurrent = channels * SLOTS_PER_CHANNEL;

  const canNext =
    step === 0 ? f.name.trim() && f.company.trim()
    : step === 1 ? f.agentName.trim()
    : step === 2 ? f.schema.some((x) => x.required)
    : step === 5 ? f.greeting.trim() && f.systemPrompt.trim()
    : true;

  const launch = () => {
    toast({ title: "Campaign launched 🎉", body: `“${f.name || "Untitled"}” is live on ${channels} channel${channels > 1 ? "s" : ""}.`, severity: "success" });
    router.push("/campaigns");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-coffee">New campaign</h1>
          <p className="mt-1 text-sm text-muted-foreground">A few guided steps. We&apos;ve pre-filled smart defaults — change only what you need.</p>
        </div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("start-tour"))} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foam bg-oat/70 px-3 py-1.5 text-xs font-medium text-mocha hover:bg-foam">
          <Sparkles className="size-3.5 text-caramel" /> Show me how
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[210px_1fr] xl:grid-cols-[210px_1fr_250px]">
        {/* stepper */}
        <ol data-tour="wiz-steps" className="hidden lg:flex lg:flex-col lg:gap-1">
          {STEPS.map((s, i) => {
            const done = i < step, cur = i === step;
            return (
              <li key={s.key}>
                <button onClick={() => i < step && setStep(i)} className={cn("flex w-full items-start gap-3 rounded-xl p-2.5 text-left", cur && "bg-oat/60", i < step && "hover:bg-foam/60")}>
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", done ? "bg-success text-white" : cur ? "bg-caramel text-cream" : "bg-foam text-muted-foreground")}>
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className="pt-0.5"><span className={cn("block text-sm font-medium", cur ? "text-coffee" : "text-mocha")}>{s.label}</span><span className="block text-xs text-muted-foreground">{s.hint}</span></span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
          {step === 0 && (
            <div className="space-y-5">
              <StepHeader title="What's this campaign about?" help={STEPS[0].help} />
              <div data-tour="wiz-name"><Field label="Campaign name" required><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. EMI Reminders — June" className={inputCls} /></Field></div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Company" required><Input value={f.company} onChange={(e) => set("company", e.target.value)} className={inputCls} /></Field>
                <Field label="Goal"><select value={f.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>{campaignTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
              </div>
              <Advanced>
                <Field label="Description" hint="Internal note."><Textarea value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Campaign objective…" className={inputCls} /></Field>
                <Field label="Call reason tag" hint="Shown on the call record."><Input value={f.reasonTag} onChange={(e) => set("reasonTag", e.target.value)} placeholder="e.g. Loan Offer" className={inputCls} /></Field>
              </Advanced>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <StepHeader title="Your AI agent" help={STEPS[1].help} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Agent name" required><Input value={f.agentName} onChange={(e) => set("agentName", e.target.value)} placeholder="e.g. Anjali" className={inputCls} /></Field>
                <Field label="Voice gender"><select value={f.gender} onChange={(e) => set("gender", e.target.value)} className={inputCls}><option>Female</option><option>Male</option></select></Field>
              </div>
              <Field label="Languages" hint="Primary plus any the agent can switch to. Double-click to set primary.">
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => {
                    const isPrimary = f.primaryLang === l.code, isSecondary = f.secondaryLangs.includes(l.code);
                    return (
                      <button key={l.code} type="button"
                        onClick={() => { if (isPrimary) return; set("secondaryLangs", isSecondary ? f.secondaryLangs.filter((c) => c !== l.code) : [...f.secondaryLangs, l.code]); }}
                        onDoubleClick={() => set("primaryLang", l.code)}
                        className={cn("rounded-full border px-3 py-1 text-xs font-medium", isPrimary ? "border-caramel bg-caramel text-cream" : isSecondary ? "border-caramel/40 bg-oat text-mocha" : "border-foam text-muted-foreground hover:border-latte")}>
                        {l.label}{isPrimary && " · primary"}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Advanced label="Voice tuning">
                <Field label={`Speech speed — ${f.voiceSpeed.toFixed(1)}×`}><input type="range" min={0.8} max={1.6} step={0.1} value={f.voiceSpeed} onChange={(e) => set("voiceSpeed", +e.target.value)} className="w-full accent-caramel" /></Field>
                <Field label={`Creativity — ${f.creativity.toFixed(1)}`}><input type="range" min={0} max={1} step={0.1} value={f.creativity} onChange={(e) => set("creativity", +e.target.value)} className="w-full accent-caramel" /></Field>
              </Advanced>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <StepHeader title="Who are we calling?" help={STEPS[2].help} />
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-latte/60 bg-oat/30 px-6 py-7 text-center">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-card text-caramel"><Upload className="size-5" /></span>
                <p className="text-sm font-medium text-coffee">Drop a CSV of leads, or click to browse</p>
                <p className="text-xs text-muted-foreground">Columns auto-map to the schema below. <button className="font-medium text-caramel">Download template</button></p>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-coffee">Lead schema</span>
                  <span className="text-xs text-muted-foreground">Define the fields each lead carries</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-foam">
                  <div className="grid grid-cols-[1.4fr_1.1fr_0.9fr_repeat(3,auto)_24px] items-center gap-2 bg-oat/50 px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-mocha">
                    <span>Label</span><span>Key</span><span>Type</span><span className="text-center">Req</span><span className="text-center">Score</span><span className="text-center">Agent</span><span />
                  </div>
                  <div className="divide-y divide-foam">
                    {f.schema.map((fld) => (
                      <div key={fld.id} className="grid grid-cols-[1.4fr_1.1fr_0.9fr_repeat(3,auto)_24px] items-center gap-2 px-3 py-2">
                        <Input value={fld.label} onChange={(e) => updField(fld.id, { label: e.target.value, key: fld.key && fld.key !== slug(fld.label) ? fld.key : slug(e.target.value) })} placeholder="Label" className={inputCls + " py-1.5"} />
                        <Input value={fld.key} onChange={(e) => updField(fld.id, { key: e.target.value })} placeholder="key" className={inputCls + " py-1.5 font-data text-xs"} />
                        <select value={fld.type} onChange={(e) => updField(fld.id, { type: e.target.value as SchemaField["type"] })} className={inputCls + " py-1.5"}>{fieldTypes.map((t) => <option key={t}>{t}</option>)}</select>
                        <div className="flex justify-center"><Toggle size="sm" on={fld.required} onChange={(v) => updField(fld.id, { required: v })} /></div>
                        <div className="flex justify-center"><Toggle size="sm" on={fld.scoring} onChange={(v) => updField(fld.id, { scoring: v })} /></div>
                        <div className="flex justify-center"><Toggle size="sm" on={fld.agentVar} onChange={(v) => updField(fld.id, { agentVar: v })} /></div>
                        <button type="button" onClick={() => rmField(fld.id)} className="text-muted-foreground hover:text-danger"><X className="size-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={addField} className="mt-2 flex items-center gap-1 text-sm font-medium text-caramel"><Plus className="size-4" /> Add field</button>
                <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium">Score</span> = feeds the lead score · <span className="font-medium">Agent</span> = the agent can read it on the call.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <StepHeader title="What should the agent know?" help={STEPS[3].help} />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-coffee">Key facts</span>
                  <span className="text-xs text-muted-foreground">The agent can cite these on the call</span>
                </div>
                <div className="space-y-2">
                  {f.facts.map((k) => (
                    <div key={k.id} className="flex gap-2">
                      <Input value={k.label} onChange={(e) => set("facts", f.facts.map((x) => x.id === k.id ? { ...x, label: e.target.value } : x))} placeholder="Label e.g. Interest rate" className={inputCls} />
                      <Input value={k.value} onChange={(e) => set("facts", f.facts.map((x) => x.id === k.id ? { ...x, value: e.target.value } : x))} placeholder="Value e.g. 12% p.a." className={inputCls} />
                      <button type="button" onClick={() => set("facts", f.facts.filter((x) => x.id !== k.id))} className="shrink-0 px-2 text-muted-foreground hover:text-danger"><X className="size-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("facts", [...f.facts, { id: "k" + f.facts.length + Math.round(f.warmThreshold), label: "", value: "" }])} className="flex items-center gap-1 text-sm font-medium text-caramel"><Plus className="size-4" /> Add fact</button>
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-coffee">FAQs</div>
                <div className="space-y-2">
                  {f.faqs.map((q) => (
                    <div key={q.id} className="flex gap-2">
                      <Input value={q.q} onChange={(e) => set("faqs", f.faqs.map((x) => x.id === q.id ? { ...x, q: e.target.value } : x))} placeholder="Question" className={inputCls} />
                      <Input value={q.a} onChange={(e) => set("faqs", f.faqs.map((x) => x.id === q.id ? { ...x, a: e.target.value } : x))} placeholder="Answer" className={inputCls} />
                      <button type="button" onClick={() => set("faqs", f.faqs.filter((x) => x.id !== q.id))} className="shrink-0 px-2 text-muted-foreground hover:text-danger"><X className="size-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("faqs", [...f.faqs, { id: "q" + f.faqs.length + Math.round(f.hotThreshold), q: "", a: "" }])} className="flex items-center gap-1 text-sm font-medium text-caramel"><Plus className="size-4" /> Add FAQ</button>
                </div>
              </div>

              <Field label="Anything else the agent should know" hint="Free-form notes, policies & current offers.">
                <Textarea value={f.context} onChange={(e) => set("context", e.target.value)} rows={2} placeholder="Branch timings, escalation policy, festive offers…" className={inputCls} />
              </Field>

              <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-latte/60 bg-oat/30 px-6 py-6 text-center">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-card text-caramel"><Upload className="size-5" /></span>
                <p className="text-sm font-medium text-coffee">Upload knowledge docs (PDF, DOCX)</p>
                <p className="text-xs text-muted-foreground">The agent references these during calls.</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <StepHeader title="How should leads be scored?" help={STEPS[4].help} />
              {scoringFields.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-foam bg-oat/30 py-10 text-center">
                  <Target className="size-6 text-caramel" />
                  <p className="text-sm font-medium text-coffee">No scoring inputs yet</p>
                  <p className="max-w-xs text-xs text-muted-foreground">Go back to <span className="font-medium">Audience</span> and toggle <span className="font-medium">Score</span> on the fields that should drive qualification.</p>
                  <Button variant="outline" size="sm" onClick={() => setStep(2)} className="mt-1">Back to schema</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-coffee">Scoring inputs</div>
                    {scoringFields.map((fld) => {
                      const cfg = f.scoreCfg[fld.id] ?? { weight: 3, direction: "higher" as const };
                      return (
                        <div key={fld.id} className="rounded-xl border border-foam bg-card p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-coffee">{fld.label}</span>
                            <div className="flex rounded-lg border border-foam p-0.5 text-xs">
                              {(["higher", "lower"] as const).map((dir) => (
                                <button key={dir} type="button" onClick={() => set("scoreCfg", { ...f.scoreCfg, [fld.id]: { ...cfg, direction: dir } })}
                                  className={cn("rounded-md px-2 py-0.5 font-medium", cfg.direction === dir ? "bg-caramel text-cream" : "text-muted-foreground")}>
                                  {dir === "higher" ? "Higher = better" : "Lower = better"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">Weight</span>
                            <input type="range" min={1} max={5} value={cfg.weight} onChange={(e) => set("scoreCfg", { ...f.scoreCfg, [fld.id]: { ...cfg, weight: +e.target.value } })} className="flex-1 accent-caramel" />
                            <span className="w-6 text-center font-data text-sm font-medium text-coffee">{cfg.weight}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-foam bg-oat/40 p-4">
                    <div className="mb-3 text-sm font-medium text-coffee">Qualification bands</div>
                    <Field label={`Hot ≥ ${f.hotThreshold}`}><input type="range" min={1} max={100} value={f.hotThreshold} onChange={(e) => set("hotThreshold", Math.max(f.warmThreshold + 1, +e.target.value))} className="w-full accent-orange-500" /></Field>
                    <div className="mt-3"><Field label={`Warm ≥ ${f.warmThreshold}`}><input type="range" min={1} max={99} value={f.warmThreshold} onChange={(e) => set("warmThreshold", Math.min(f.hotThreshold - 1, +e.target.value))} className="w-full accent-amber-500" /></Field></div>
                    <div className="mt-3 flex gap-2 text-xs font-medium">
                      <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-orange-700"><Flame className="size-3" /> Hot ≥ {f.hotThreshold}</span>
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-amber-700"><Thermometer className="size-3" /> Warm {f.warmThreshold}–{f.hotThreshold - 1}</span>
                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><Snowflake className="size-3" /> Cold &lt; {f.warmThreshold}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <StepHeader title="What does the agent say?" help={STEPS[5].help} />
              <Field label="Greeting" required hint="First line when the lead picks up."><Textarea value={f.greeting} onChange={(e) => set("greeting", e.target.value)} placeholder="Hello! This is Anjali calling from Blostem…" className={inputCls} /></Field>
              <Field label="End-call message" hint="How the agent signs off."><Input value={f.endMessage} onChange={(e) => set("endMessage", e.target.value)} placeholder="Thank you for your time. Have a great day!" className={inputCls} /></Field>
              <Field label="System prompt" required hint="The agent's instructions and persona."><Textarea value={f.systemPrompt} onChange={(e) => set("systemPrompt", e.target.value)} rows={3} placeholder="You are a polite collections agent for…" className={inputCls} /></Field>
              <Field label="Objection handlers" hint="Optional.">
                <div className="space-y-2">
                  {f.objections.map((o, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={o.q} onChange={(e) => { const n = [...f.objections]; n[i] = { ...n[i], q: e.target.value }; set("objections", n); }} placeholder="If they say…" className={inputCls} />
                      <Input value={o.a} onChange={(e) => { const n = [...f.objections]; n[i] = { ...n[i], a: e.target.value }; set("objections", n); }} placeholder="Agent responds…" className={inputCls} />
                      <button type="button" onClick={() => set("objections", f.objections.filter((_, j) => j !== i))} className="shrink-0 px-2 text-muted-foreground hover:text-danger"><X className="size-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("objections", [...f.objections, { q: "", a: "" }])} className="flex items-center gap-1 text-sm font-medium text-caramel"><Plus className="size-4" /> Add objection</button>
                </div>
              </Field>
              <div className="rounded-xl border border-foam bg-oat/40 p-4">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-coffee">Hand off to a human</div><div className="text-xs text-muted-foreground">Transfer when the agent can&apos;t resolve it.</div></div>
                  <Toggle on={f.transferEnabled} onChange={(v) => set("transferEnabled", v)} />
                </div>
                {f.transferEnabled && <div className="mt-3"><Input value={f.transferNumber} onChange={(e) => set("transferNumber", e.target.value)} placeholder="Transfer number e.g. +9180…" className={inputCls} /></div>}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <StepHeader title="Capacity & schedule" help={STEPS[6].help} />

              {/* channel allocation */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-coffee">Channel allocation</span>
                  <span className="text-xs text-muted-foreground">{FREE_CHANNELS} of {CHANNELS} free · {OTHERS_USING} in use elsewhere</span>
                </div>
                <div className="rounded-xl border border-foam bg-card p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: CHANNELS }).map((_, i) => {
                      const used = i < OTHERS_USING;
                      const mine = !used && i < OTHERS_USING + f.channelsAllocated;
                      return (
                        <button key={i} type="button" disabled={used}
                          onClick={() => set("channelsAllocated", Math.min(FREE_CHANNELS, i - OTHERS_USING + 1))}
                          title={used ? "In use by other campaigns" : mine ? "Allocated to this campaign" : "Free"}
                          className={cn("transition-transform hover:scale-110", used && "cursor-not-allowed")}>
                          <CupGlyph className={cn("size-8", used ? "opacity-25" : mine ? "" : "opacity-40 grayscale")} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-coffee"><span className="font-semibold">{f.channelsAllocated}</span> channel{f.channelsAllocated > 1 ? "s" : ""} allocated</span>
                    <span className="text-muted-foreground">= up to <span className="font-semibold text-coffee">{concurrent}</span> concurrent calls</span>
                  </div>
                  <div className="mt-1 text-xs text-success">No per-minute cost — you only pay for channels.</div>
                </div>
              </div>

              {/* pacing */}
              <div className="space-y-3 rounded-xl border border-foam bg-card p-4">
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-coffee">Ramp up gradually</div><div className="text-xs text-muted-foreground">Start slow, then scale to full capacity.</div></div>
                  <Toggle on={f.rampUp} onChange={(v) => set("rampUp", v)} />
                </div>
                {f.rampUp && <Field label={`Ramp-up window — ${f.rampUpMins} min`}><input type="range" min={5} max={120} step={5} value={f.rampUpMins} onChange={(e) => set("rampUpMins", +e.target.value)} className="w-full accent-caramel" /></Field>}
                <Field label="Daily call limit"><Input type="number" value={f.dailyLimit} onChange={(e) => set("dailyLimit", +e.target.value)} className={inputCls} /></Field>
              </div>

              {/* retry strategy */}
              <div className="space-y-3 rounded-xl border border-foam bg-card p-4">
                <div className="text-sm font-medium text-coffee">Retry strategy</div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Max attempts per lead"><Input type="number" value={f.maxRetries} onChange={(e) => set("maxRetries", +e.target.value)} className={inputCls} /></Field>
                  <Field label="Gap between attempts (hrs)"><Input type="number" value={f.retryGapHours} onChange={(e) => set("retryGapHours", +e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-coffee">Best-time-to-call</div><div className="text-xs text-muted-foreground">Retry when each lead is most likely to answer.</div></div>
                  <Toggle on={f.bestTime} onChange={(v) => set("bestTime", v)} />
                </div>
              </div>

              {/* schedule */}
              <div className="space-y-3 rounded-xl border border-foam bg-card p-4">
                <div className="text-sm font-medium text-coffee">Calling schedule</div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Call start (IST)"><Input value={f.callStart} onChange={(e) => set("callStart", e.target.value)} className={inputCls} /></Field>
                  <Field label="Call end (IST)"><Input value={f.callEnd} onChange={(e) => set("callEnd", e.target.value)} className={inputCls} /></Field>
                </div>
                <Field label="Active days">
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((day) => {
                      const on = f.days.includes(day);
                      return <button key={day} type="button" onClick={() => set("days", on ? f.days.filter((dd) => dd !== day) : [...f.days, day])} className={cn("rounded-full border px-3 py-1 text-xs font-medium", on ? "border-caramel bg-caramel text-cream" : "border-foam text-muted-foreground hover:border-latte")}>{day}</button>;
                    })}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start date" hint="Optional"><Input type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} /></Field>
                  <Field label="End date" hint="Optional"><Input type="date" value={f.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} /></Field>
                </div>
                <div className="flex items-center justify-between">
                  <div><div className="text-sm font-medium text-coffee">Skip public holidays</div><div className="text-xs text-muted-foreground">Pause on listed bank / public holidays.</div></div>
                  <Toggle on={f.skipHolidays} onChange={(v) => set("skipHolidays", v)} />
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <StepHeader title="Review & launch" help={STEPS[7].help} />
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Campaign", f.name || "—"], ["Agent", `${f.agentName || "—"} · ${f.gender}`],
                  ["Schema", `${f.schema.length} fields · ${scoringFields.length} scored`],
                  ["Channels", `${channels} · up to ${concurrent} concurrent`],
                  ["Schedule", `${f.callStart}–${f.callEnd} · ${f.days.length} days`],
                  ["Handoff", f.transferEnabled ? (f.transferNumber || "enabled") : "off"],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-xl border border-foam bg-oat/40 p-3"><div className="text-xs text-muted-foreground">{k}</div><div className="mt-0.5 font-medium text-coffee">{v}</div></div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl border border-foam bg-card p-3">
                <div><div className="text-sm font-medium text-coffee">Place a test call before launch</div><div className="text-xs text-muted-foreground">Dial one number to sanity-check the agent.</div></div>
                <Toggle on={f.testCall} onChange={(v) => set("testCall", v)} />
              </div>
              <Advanced label="Compliance & owner">
                <Field label="Owner"><Input value={f.owner} onChange={(e) => set("owner", e.target.value)} className={inputCls} /></Field>
                <div className="flex items-center justify-between rounded-xl border border-foam bg-card p-3">
                  <div><div className="text-sm font-medium text-coffee">Scrub against DNC registry</div><div className="text-xs text-muted-foreground">Skip Do-Not-Call numbers (recommended).</div></div>
                  <Toggle on={f.dncScrub} onChange={(v) => set("dncScrub", v)} />
                </div>
              </Advanced>
              <p className="text-xs text-muted-foreground">Dispositions & agent skills can be configured anytime from <span className="font-medium text-mocha">campaign settings</span> after launch.</p>
            </div>
          )}

          <div className="mt-7 flex items-center justify-between border-t border-foam pt-5">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="gap-1 text-mocha"><ChevronLeft className="size-4" /> Back</Button>
            <div data-tour="wiz-next" className="flex gap-2">
              <Button variant="outline" className="text-mocha">Save as draft</Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext} className="gap-1 bg-caramel text-cream hover:bg-mocha">Next <ChevronRight className="size-4" /></Button>
              ) : (
                <Button onClick={launch} className="gap-1.5 bg-success text-white hover:opacity-90"><Rocket className="size-4" /> Launch campaign</Button>
              )}
            </div>
          </div>
        </div>

        {/* live summary (wide screens) */}
        <aside data-tour="wiz-summary" className="hidden xl:block">
          <div className="sticky top-4 space-y-3 rounded-2xl border border-foam bg-porcelain p-4 shadow-glass">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mocha"><Coffee className="size-3.5 text-caramel" /> Summary</div>
            <div><div className="text-xs text-muted-foreground">Name</div><div className="text-sm font-medium text-coffee">{f.name || "Untitled campaign"}</div></div>
            <div><div className="text-xs text-muted-foreground">Agent</div><div className="text-sm font-medium text-coffee">{f.agentName || "—"} · {f.gender}</div></div>
            <div><div className="text-xs text-muted-foreground">Languages</div><div className="text-sm text-coffee">{[f.primaryLang, ...f.secondaryLangs].join(", ")}</div></div>
            <div><div className="text-xs text-muted-foreground">Schema</div><div className="text-sm text-coffee">{f.schema.length} fields · {scoringFields.length} scored</div></div>
            <div><div className="text-xs text-muted-foreground">Bands</div><div className="text-sm text-coffee">Hot ≥ {f.hotThreshold} · Warm ≥ {f.warmThreshold}</div></div>
            <div><div className="text-xs text-muted-foreground">Handoff</div><div className="text-sm text-coffee">{f.transferEnabled ? "Enabled" : "Off"}</div></div>
            <div className="rounded-xl bg-oat/60 p-3"><div className="text-xs text-muted-foreground">Capacity</div><div className="text-sm font-medium text-coffee">{channels} of {CHANNELS} channels</div><div className="text-xs text-success">up to {concurrent} concurrent calls</div></div>
          </div>
        </aside>
      </div>

      <Tour steps={WIZ_TOUR} storageKey="vox-tour-campaign" />
    </div>
  );
}
