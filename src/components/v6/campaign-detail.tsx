"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft, Play, Pause, Pencil, Info, ListChecks, Users2, Target, GitBranch, Bot, PhoneForwarded,
  Wand2, Tags, Gauge, UploadCloud, CheckCircle2, Phone, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui-bits/stat-card";
import { StatusBadge } from "@/components/ui-bits/status-badge";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { campaigns } from "@/lib/data";
import { titleCase } from "@/lib/format";
import { defaultSchema, scoringRules, scoreBands, agentSkills as seedSkills, dispositions, transferModes } from "@/lib/campaign-config-mock";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";

type Campaign = (typeof campaigns)[number];

const SECTIONS = [
  { key: "overview", label: "Overview", icon: Info },
  { key: "basic", label: "Basic Info", icon: Info },
  { key: "schema", label: "Lead Schema", icon: ListChecks },
  { key: "customer", label: "Customer Data", icon: Users2 },
  { key: "scoring", label: "Scoring", icon: Target },
  { key: "flow", label: "Flow", icon: GitBranch },
  { key: "voice", label: "Voice & AI", icon: Bot },
  { key: "transfer", label: "Call Transfer", icon: PhoneForwarded },
  { key: "skills", label: "Skills", icon: Wand2 },
  { key: "dispositions", label: "Dispositions", icon: Tags },
  { key: "capacity", label: "Capacity & Schedule", icon: Gauge },
  { key: "leads", label: "Leads", icon: UploadCloud },
];

const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-foam py-2.5 last:border-0">
    <span className="text-sm text-muted-foreground">{k}</span>
    <span className="text-right text-sm font-medium text-coffee">{v}</span>
  </div>
);
const Panel = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
    <h2 className="font-serif text-lg font-semibold text-coffee">{title}</h2>
    {desc && <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

export function V6CampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const c: Campaign = campaigns.find((x) => x.id === id) ?? campaigns[0];
  const [status, setStatus] = useState<string>(c.status);
  const [sec, setSec] = useState("overview");
  const [skills, setSkills] = useState(seedSkills.map((s) => s.on));
  const [leadState, setLeadState] = useState<"empty" | "done">(c.total_leads > 0 ? "done" : "empty");

  const activate = () => {
    const next = status === "active" ? "paused" : "active";
    setStatus(next);
    toast({ title: next === "active" ? "Campaign activated" : "Campaign paused", body: `“${c.name}” is now ${next}.`, severity: next === "active" ? "success" : "info" });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <button onClick={() => router.push("/campaigns")} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-coffee"><ChevronLeft className="size-4" /> Campaigns</button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-coffee">{c.name}</h1>
          <StatusBadge value={status} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/campaigns/${c.id}/edit`)} className="gap-1.5 border-foam text-mocha hover:text-coffee">
            <Pencil className="size-4" /> Edit
          </Button>
          <Button onClick={activate} className={cn("gap-1.5", status === "active" ? "bg-warning text-white hover:bg-warning/90" : "bg-brand text-brand-foreground hover:bg-brand-dark")}>
            {status === "active" ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> {status === "draft" ? "Activate" : "Resume"}</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[210px_1fr]">
        {/* section nav */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-foam bg-porcelain p-2 shadow-glass lg:flex-col lg:overflow-visible">
          {SECTIONS.map((s) => {
            const Icon = s.icon; const active = sec === s.key;
            return (
              <button key={s.key} onClick={() => setSec(s.key)} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors", active ? "bg-secondary text-brand" : "text-mocha/80 hover:bg-oat/60")}>
                <Icon className="size-4 shrink-0" /> <span className="whitespace-nowrap">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div>
          {sec === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Leads" value={c.total_leads} icon={Users2} />
                <StatCard label="Called" value={c.leads_called} icon={Phone} />
                <StatCard label="Converted" value={c.leads_converted} icon={CheckCircle2} />
                <StatCard label="Concurrency" value={`${c.max_concurrent_calls} ch`} icon={Gauge} sub="1 channel = 1 call" />
              </div>
              <Panel title="At a glance">
                <Row k="Status" v={<StatusBadge value={status} />} />
                <Row k="Type" v={titleCase(c.campaign_type)} />
                <Row k="Agent" v={c.agent_name || "—"} />
                <Row k="Calling window" v={`${c.calling_start_time?.slice(0,5)} – ${c.calling_end_time?.slice(0,5)}`} />
                <Row k="Languages" v={[c.primary_language, ...(c.secondary_languages||[])].join(", ")} />
              </Panel>
            </div>
          )}

          {sec === "basic" && (
            <Panel title="Basic Info" desc="Identity & framing the agent uses on every call.">
              <Row k="Campaign name" v={c.name} />
              <Row k="Description" v={c.description || "—"} />
              <Row k="Company name" v={c.company_name} />
              <Row k="Agent name" v={c.agent_name || "—"} />
              <Row k="Campaign type" v={titleCase(c.campaign_type)} />
              <Row k="Default language" v={<span className="inline-flex items-center gap-1"><Globe className="size-3.5" /> {titleCase(c.default_language)}</span>} />
            </Panel>
          )}

          {sec === "schema" && (
            <Panel title="Lead Schema" desc="Columns each lead carries. The CSV uploader auto-maps to these.">
              <div className="overflow-hidden rounded-xl border border-foam">
                <table className="w-full text-sm">
                  <thead><tr className="bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2">Field</th><th className="px-4 py-2">Key</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Required</th></tr></thead>
                  <tbody className="divide-y divide-foam">{defaultSchema.map((f) => <tr key={f.key}><td className="px-4 py-2 text-coffee">{f.label}</td><td className="px-4 py-2 font-data text-xs text-muted-foreground">{f.key}</td><td className="px-4 py-2 text-muted-foreground">{f.type}</td><td className="px-4 py-2">{f.required ? <span className="text-danger">required</span> : <span className="text-muted-foreground">optional</span>}</td></tr>)}</tbody>
                </table>
              </div>
            </Panel>
          )}

          {sec === "customer" && (
            <Panel title="Customer Data" desc="Extra context the agent can reference mid-call.">
              <div className="grid grid-cols-2 gap-3">
                {["Outstanding amount", "Due date", "Last payment", "Relationship tier"].map((f) => (
                  <div key={f} className="rounded-xl border border-foam bg-card px-3 py-2.5 text-sm text-coffee">{f}</div>
                ))}
              </div>
            </Panel>
          )}

          {sec === "scoring" && (
            <Panel title="Scoring" desc={`Classifies each lead — Hot ≥${scoreBands.hot}, Warm ≥${scoreBands.warm}, else Cold.`}>
              <div className="space-y-2">
                {scoringRules.map((r) => (
                  <div key={r.field} className="flex items-center justify-between rounded-xl border border-foam bg-card px-3 py-2.5 text-sm">
                    <span className="text-coffee">{titleCase(r.field)} <span className="text-muted-foreground">{r.condition}</span></span>
                    <span className="font-data font-medium text-success">+{r.points}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {sec === "flow" && (
            <Panel title="Conversation Flow" desc="The system prompt the LLM sees on every call.">
              <textarea readOnly className="h-48 w-full rounded-xl border border-foam bg-card p-3 font-data text-xs leading-relaxed text-mocha" defaultValue={`You are ${c.agent_name || "the agent"} calling on behalf of ${c.company_name}.\nGoal: qualify the lead for ${c.name}.\n\n1) Greet warmly and confirm you're speaking to the right person.\n2) State the reason for the call in one line (benefit-first).\n3) Handle objections; if interested, capture intent and offer a callback or transfer.\n4) Respect Do-Not-Call; close politely.`} />
            </Panel>
          )}

          {sec === "voice" && (
            <Panel title="Voice & AI" desc="Providers and tuning. (Internal — not shown to clients.)">
              <Row k="Telephony" v={titleCase(c.telephony_provider_id ? "configured" : "org default")} />
              <Row k="STT" v={`${c.transcriber_language} transcriber`} />
              <Row k="LLM" v={`${c.llm_provider} / ${c.llm_model} · temp ${c.llm_temperature} · ${c.llm_max_tokens} tok`} />
              <Row k="TTS / Voice" v={`${c.voice_provider} / ${c.voice_model}`} />
              <Row k="Speed" v={`${c.voice_speed}×`} />
              <Row k="Interruptions" v={c.interruptions_enabled ? "On" : "Off"} />
            </Panel>
          )}

          {sec === "transfer" && (
            <Panel title="Call Transfer" desc="Hand off to a human when conditions are met.">
              <Row k="Mode" v={transferModes[0]} />
              <Row k="Transfer number" v={c.transfer_numbers || "—"} />
              <Row k="Trigger" v="On 'speak to agent' or high-value intent" />
            </Panel>
          )}

          {sec === "skills" && (
            <Panel title="Agent Skills" desc="Real-time tools the agent can call mid-conversation.">
              <div className="space-y-2">
                {seedSkills.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-foam bg-card p-3">
                    <div><div className="font-data text-sm text-coffee">{s.name} {s.core && <span className="ml-1 rounded-full bg-caramel/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-caramel">core</span>}</div><div className="text-xs text-muted-foreground">{s.desc}</div></div>
                    <button disabled={s.core} onClick={() => setSkills((p) => p.map((v, j) => (j === i ? !v : v)))} className={cn("relative h-5 w-9 rounded-full transition-colors", skills[i] ? "bg-success" : "bg-foam", s.core && "opacity-60")}><span className={cn("absolute top-0.5 size-4 rounded-full bg-white transition-all", skills[i] ? "left-[18px]" : "left-0.5")} /></button>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {sec === "dispositions" && (
            <Panel title="Dispositions" desc="Outcome labels every call is tagged with.">
              <div className="flex flex-wrap gap-2">
                {dispositions.map((d) => <span key={d.key} className="rounded-full border border-foam bg-card px-3 py-1.5 text-sm text-coffee">{d.label}</span>)}
              </div>
            </Panel>
          )}

          {sec === "capacity" && (
            <Panel title="Capacity & Schedule" desc="How fast and when this campaign dials.">
              <Row k="Max concurrent calls" v={`${c.max_concurrent_calls} channels`} />
              <Row k="Max retries" v={c.max_retries} />
              <Row k="Daily call limit" v={c.daily_call_limit} />
              <Row k="Calling window" v={`${c.calling_start_time?.slice(0,5)} – ${c.calling_end_time?.slice(0,5)}`} />
              <Row k="Pickup timeout" v={`${c.pickup_timeout_s ?? 20}s`} />
            </Panel>
          )}

          {sec === "leads" && (
            <Panel title="Leads" desc="Upload a CSV/XLSX — only phone is required.">
              {leadState === "empty" ? (
                <button onClick={() => { setLeadState("done"); toast({ title: "Leads imported", body: "2 leads imported successfully.", severity: "success" }); }} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-latte bg-oat/30 px-6 py-10 text-center hover:border-caramel hover:bg-oat/50">
                  <UploadCloud className="size-7 text-caramel" />
                  <div className="text-sm font-medium text-coffee">Click to upload CSV / Excel</div>
                  <div className="text-xs text-muted-foreground">Required: <span className="font-data">phone</span> · optional: full_name, email + custom</div>
                </button>
              ) : (
                <div className="rounded-2xl border border-success/30 bg-success/8 p-5 text-center">
                  <CheckCircle2 className="mx-auto size-6 text-success" />
                  <div className="mt-2 text-sm font-semibold text-coffee">{Math.max(c.total_leads, 2)} leads loaded</div>
                  <div className="text-xs text-muted-foreground">Activate the campaign to start calling them.</div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
