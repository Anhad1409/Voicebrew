"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, Plug, ShieldCheck, KeyRound, Plus, Copy, ListChecks, Target, GitBranch, Wand2, FileText, Gauge, LayoutTemplate, BadgeCheck, MousePointerClick, MessageSquare, MessageCircle, RefreshCw, Wallet, BarChart3, ChevronRight, CheckCircle2, ArrowRight, Phone, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui-bits/page-header";
import { SetupGuideButton } from "@/components/setup-guide/setup-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/notifications/toaster";
import { cn } from "@/lib/utils";
import { organization, currentUser } from "@/lib/data";
import { titleCase } from "@/lib/format";

const TABS = [
  { key: "Organization", icon: Building2 },
  { key: "Team", icon: Users },
  { key: "Providers", icon: Plug },
  { key: "Compliance", icon: ShieldCheck },
  { key: "API Keys", icon: KeyRound },
];
const inputCls = "w-full rounded-lg border border-foam bg-card px-3 py-2 text-sm text-coffee outline-none focus:border-caramel focus:ring-1 focus:ring-caramel/30";
const team = [
  { name: currentUser.full_name, email: currentUser.email, role: "super_admin" },
  { name: "Rohan Verma", email: "rohan@blostem.com", role: "manager" },
  { name: "Priya Nair", email: "priya@blostem.com", role: "agent" },
];
const PROVIDER_TABS = ["Telephony", "STT", "LLM", "TTS"];
const providerCatalog: Record<string, { name: string; status: "Connected" | "Not connected"; def?: boolean }[]> = {
  Telephony: [{ name: "Plivo", status: "Connected", def: true }, { name: "Exotel", status: "Connected" }, { name: "Vapi", status: "Not connected" }],
  STT: [{ name: "Deepgram", status: "Connected", def: true }, { name: "Sarvam", status: "Not connected" }],
  LLM: [{ name: "Google Gemini", status: "Connected", def: true }, { name: "OpenAI", status: "Connected" }, { name: "Anthropic", status: "Not connected" }],
  TTS: [{ name: "Cartesia", status: "Connected", def: true }, { name: "ElevenLabs", status: "Connected" }, { name: "Sarvam Bulbul", status: "Not connected" }],
};
const apiKeys = [
  { name: "Production", key: "vb_live_••••••••3a91", created: "12 May 2026" },
  { name: "Sandbox", key: "vb_test_••••••••7c20", created: "02 Jun 2026" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium text-coffee">{label}</label>{children}</div>;
}

type Cfg = { icon: LucideIcon; title: string; desc: string; badge?: string; href?: string };
const badgeTone: Record<string, string> = {
  REQUIRED: "bg-danger/12 text-danger", OPTIONAL: "bg-foam text-mocha",
  DEFAULT: "bg-success/12 text-success", SEEDED: "bg-caramel/15 text-caramel",
};
const AGENT_CFG: Cfg[] = [
  { icon: ListChecks, title: "Lead Schemas", desc: "Columns each lead carries; auto-mapped on upload.", badge: "DEFAULT" },
  { icon: Target, title: "Scoring Configs", desc: "Per-field weights & hot/warm/cold thresholds.", badge: "DEFAULT" },
  { icon: GitBranch, title: "Conversation Flows", desc: "The system prompt the agent runs on every call.", badge: "REQUIRED" },
  { icon: Wand2, title: "Agent Skills", desc: "Real-time tools the agent can call mid-call.", badge: "SEEDED" },
  { icon: Phone, title: "Human Agent Numbers", desc: "Transfer numbers — one per agent for warm hand-offs.", badge: "OPTIONAL" },
  { icon: FileText, title: "Documents", desc: "Upload PDFs/FAQs into the agent's knowledge base.", badge: "OPTIONAL" },
  { icon: Gauge, title: "Call Quality", desc: "Noise suppression, VAD, latency budgets.", badge: "DEFAULT" },
  { icon: LayoutTemplate, title: "Templates", desc: "55 pre-built scripts across 10 verticals.", badge: "OPTIONAL" },
];
const CHANNELS: Cfg[] = [
  { icon: BadgeCheck, title: "Truecaller Identity", desc: "Verified business caller-ID; fewer spam flags.", badge: "OPTIONAL" },
  { icon: MousePointerClick, title: "Click-to-Call Widgets", desc: "Embeddable callback button for your site.", badge: "OPTIONAL" },
  { icon: MessageSquare, title: "SMS / DLT", desc: "DLT-registered transactional SMS (India).", badge: "OPTIONAL" },
  { icon: MessageCircle, title: "WhatsApp", desc: "WhatsApp messages via Business API.", badge: "OPTIONAL" },
  { icon: RefreshCw, title: "CRM Sync", desc: "Two-way sync with LeadSquared, Salesforce, Zoho, HubSpot.", badge: "OPTIONAL" },
];
const BILLING: Cfg[] = [
  { icon: Wallet, title: "Billing & Wallet", desc: "Buy channels or top up minutes; view history.", badge: "REQUIRED", href: "/settings/billing" },
  { icon: BarChart3, title: "Usage & Metering", desc: "Volume, minutes & per-provider cost breakdown.", badge: "OPTIONAL", href: "/settings/billing" },
];

function SettingsGroup({ title, blurb, items }: { title: string; blurb: string; items: Cfg[] }) {
  return (
    <section className="mt-6">
      <h2 className="font-serif text-lg font-semibold text-coffee">{title}</h2>
      <p className="mb-3 text-sm text-muted-foreground">{blurb}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const Icon = c.icon;
          const inner = (
            <>
              <div className="flex items-start justify-between">
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-brand"><Icon className="size-4" /></span>
                {c.badge && <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide", badgeTone[c.badge])}>{c.badge}</span>}
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-sm font-medium text-coffee">{c.title}<ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></div>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.desc}</p>
            </>
          );
          const cls = "group rounded-2xl border border-foam bg-porcelain p-4 text-left shadow-glass transition-all hover:border-caramel";
          return c.href
            ? <Link key={c.title} href={c.href} className={cls}>{inner}</Link>
            : <button key={c.title} onClick={() => toast({ title: c.title, body: "Opening configuration…", severity: "info" })} className={cls}>{inner}</button>;
        })}
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("Organization");
  const [provTab, setProvTab] = useState("Telephony");
  const o = organization as Record<string, string>;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Settings" subtitle="Organization, team, providers, compliance & keys" />

      {/* setup completion banner */}
      <div className="mb-6 rounded-2xl border border-caramel/30 bg-gradient-to-br from-cream to-oat/60 p-5 shadow-glass">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <div className="font-serif text-lg font-semibold text-coffee">Great start — keep going</div>
            <div className="text-xs text-muted-foreground">1 of 3 done · finish setup to start placing calls</div>
          </div>
          <div className="flex items-center gap-2"><div className="h-1.5 w-32 overflow-hidden rounded-full bg-foam"><div className="h-full w-1/3 rounded-full bg-gradient-to-r from-mocha to-caramel" /></div><span className="font-data text-sm font-medium text-mocha">33%</span></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { t: "Complete organization profile", s: "~1 min", state: "next" },
            { t: "Connect call pipeline (Telephony, STT, LLM, TTS)", s: "~5 min", state: "todo" },
            { t: "Top up your wallet", s: "done", state: "done" },
          ].map((step) => (
            <div key={step.t} className={cn("flex items-center gap-2.5 rounded-xl border bg-card/70 px-3 py-2.5", step.state === "next" ? "border-caramel" : "border-foam")}>
              {step.state === "done" ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold", step.state === "next" ? "bg-caramel text-cream" : "bg-foam text-muted-foreground")}>{step.state === "next" ? "!" : ""}</span>}
              <span className={cn("flex-1 text-xs", step.state === "done" ? "text-muted-foreground line-through" : "text-coffee")}>{step.t}</span>
              {step.state === "next" && <button onClick={() => toast({ title: "Organization", body: "Opening org profile…", severity: "info" })} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-caramel">Start here <ArrowRight className="size-3" /></button>}
              {step.state === "todo" && <button onClick={() => setTab("Providers")} className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-mocha">Configure <ArrowRight className="size-3" /></button>}
            </div>
          ))}
        </div>
      </div>

      {/* quick settings cards */}
      <div data-tour="set-quick" className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("rounded-2xl border bg-porcelain p-3 text-left shadow-glass transition-all", active ? "border-caramel ring-1 ring-caramel/30" : "border-foam hover:border-latte")}>
              <span className="flex size-8 items-center justify-center rounded-xl bg-secondary text-brand"><Icon className="size-4" /></span>
              <div className="mt-2 text-sm font-medium text-coffee">{t.key}</div>
            </button>
          );
        })}
      </div>

      <div data-tour="set-content" className="rounded-2xl border border-foam bg-porcelain p-6 shadow-glass">
        {tab === "Organization" && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-coffee">Organization profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Organization name"><Input defaultValue={o.name} className={inputCls} /></Field>
              <Field label="Billing email"><Input defaultValue={o.billing_email} className={inputCls} /></Field>
              <Field label="Industry vertical"><Input defaultValue={titleCase(o.industry_vertical)} className={inputCls} /></Field>
              <Field label="Plan"><Input defaultValue="Growth" disabled className={inputCls + " opacity-70"} /></Field>
              <Field label="GST number"><Input placeholder="22AAAAA0000A1Z5" className={inputCls} /></Field>
              <Field label="Primary contact"><Input defaultValue={o.primary_contact_name || currentUser.full_name} className={inputCls} /></Field>
            </div>
            <Button onClick={() => toast({ title: "Saved", body: "Organization profile updated.", severity: "success" })} className="bg-brand text-brand-foreground hover:bg-brand-dark">Save changes</Button>
          </div>
        )}

        {tab === "Team" && (
          <div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-coffee">Team members</h2><Button size="sm" onClick={() => toast({ title: "Invite sent", body: "Invitation email queued.", severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Invite</Button></div>
            <div className="overflow-hidden rounded-xl border border-foam">
              <table className="w-full text-sm">
                <thead><tr className="bg-oat/40 text-left text-xs text-mocha"><th className="px-4 py-2.5">Name</th><th className="px-4 py-2.5">Email</th><th className="px-4 py-2.5">Role</th></tr></thead>
                <tbody className="divide-y divide-foam">
                  {team.map((m) => <tr key={m.email}><td className="px-4 py-2.5 font-medium text-coffee">{m.name}</td><td className="px-4 py-2.5 text-muted-foreground">{m.email}</td><td className="px-4 py-2.5"><span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-mocha">{titleCase(m.role)}</span></td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Providers" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div><h2 className="text-lg font-semibold text-coffee">Provider Management</h2><p className="text-sm text-muted-foreground">Bring your own telephony &amp; AI providers — no lock-in.</p></div>
              <Button size="sm" onClick={() => toast({ title: "Add provider", body: `Connect a ${provTab} provider…`, severity: "info" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Add provider</Button>
            </div>
            <div className="mb-4 flex gap-1.5">
              {PROVIDER_TABS.map((t) => <button key={t} onClick={() => setProvTab(t)} className={cn("rounded-full border px-3 py-1.5 text-sm font-medium", provTab === t ? "border-caramel bg-caramel/10 text-caramel" : "border-foam bg-card text-muted-foreground hover:border-latte")}>{t}</button>)}
            </div>
            {provTab === "Telephony" && <p className="mb-3 text-xs text-muted-foreground">Voice call providers (Vapi, Exotel, Plivo). Pipecat-pipeline providers (Exotel/Plivo) also need STT/LLM/TTS set.</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {providerCatalog[provTab].map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-coffee">{p.name}{p.def && <span className="rounded-full bg-caramel/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-caramel">Default</span>}</div>
                    <div className={cn("text-xs", p.status === "Connected" ? "text-success" : "text-muted-foreground")}>● {p.status}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {p.status === "Connected" && <Button size="sm" variant="outline" onClick={() => toast({ title: `Testing ${p.name}`, body: "Sending a test request…", severity: "info" })} className="text-mocha">Test</Button>}
                    <button onClick={() => toast({ title: p.name, body: "Provider settings…", severity: "info" })} className="rounded-md p-1.5 text-muted-foreground hover:bg-foam hover:text-coffee"><Copy className="size-4 rotate-90" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Compliance" && (
          <div className="space-y-3">
            <h2 className="mb-1 text-lg font-semibold text-coffee">Compliance defaults</h2>
            {[["DNC / DND scrubbing", "Skip Do-Not-Call numbers on every dial", true], ["Calling-window enforcement", "Only dial within TRAI/RBI permitted hours", true], ["Consent & recording disclosure", "Play the consent prompt at call start", true], ["PII masking in recordings", "Redact names, numbers & account data in saved audio", true]].map(([t, d, on]) => (
              <div key={t as string} className="flex items-center justify-between rounded-xl border border-foam bg-card p-4">
                <div><div className="text-sm font-medium text-coffee">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", on ? "bg-success/12 text-success" : "bg-foam text-muted-foreground")}>{on ? "On" : "Off"}</span>
              </div>
            ))}
            <Link href="/compliance" className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-caramel">Open compliance dashboard →</Link>
          </div>
        )}

        {tab === "API Keys" && (
          <div>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-coffee">API keys &amp; webhooks</h2><Button size="sm" onClick={() => toast({ title: "Key generated", body: "New API key created — copy it now.", severity: "success" })} className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand-dark"><Plus className="size-4" /> Generate key</Button></div>
            <div className="mb-3 rounded-xl border border-foam bg-oat/30 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-mocha">Funnel Webhook URL</div>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-foam bg-card px-2.5 py-1.5 font-data text-xs text-coffee">POST https://vox.blostem.info/api/v1/webhooks/funnel/blostem-demo</code>
                <button onClick={() => toast({ title: "Copied", body: "Webhook URL copied.", severity: "info" })} className="text-muted-foreground hover:text-caramel"><Copy className="size-4" /></button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">POST leads from your funnel/landing page straight into a campaign.</p>
            </div>
            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.name} className="flex items-center gap-3 rounded-xl border border-foam bg-card p-4">
                  <KeyRound className="size-4 text-mocha" />
                  <div className="flex-1"><div className="text-sm font-medium text-coffee">{k.name}</div><div className="font-data text-xs text-muted-foreground">{k.key} · created {k.created}</div></div>
                  <button onClick={() => toast({ title: "Copied", body: "API key copied to clipboard.", severity: "info" })} className="text-muted-foreground hover:text-caramel"><Copy className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <SettingsGroup title="Agent Configuration" blurb="How your AI agent thinks, talks and what it knows." items={AGENT_CFG} />
      <SettingsGroup title="Channels & Integrations" blurb="Optional — SMS, WhatsApp, branded caller-ID and CRM sync." items={CHANNELS} />
      <SettingsGroup title="Billing & Usage" blurb="Fund channels or minutes, and track spend." items={BILLING} />
    </div>
  );
}
