"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import Lottie from "lottie-react";
import {
  Search, Bell, Plus, ArrowUpRight, Sun, PhoneCall, Flame, Clock,
  TrendingUp, Headset, Sparkles, Coffee, Zap,
} from "lucide-react";
import { overviewStats } from "@/lib/data";
import { CHANNELS, baselineActive, liveCampaigns } from "@/lib/channel-mock";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { wallet } from "@/lib/wallet-mock";
import voicewave from "@/lib/voicewave.json";

const Spark = ({ data, stroke }: { data: number[]; stroke: string }) => {
  const max = Math.max(...data), min = Math.min(...data), w = 96, h = 30;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - ((d - min) / (max - min || 1)) * h}`).join(" ");
  return <svg width={w} height={h} className="overflow-visible"><polyline points={pts} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};
const Equalizer = ({ active, color }: { active: boolean; color: string }) => (
  <div className="flex h-5 items-end gap-[2px]">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="v3-bar w-[3px] rounded-full" style={{ background: color, animationDelay: `${i * 0.12}s`, animationPlayState: active ? "running" : "paused", height: active ? undefined : "30%" }} />)}</div>
);

function BrewCup({ pct }: { pct: number }) {
  return (
    <div className="relative h-44 w-44 shrink-0">
      <svg viewBox="0 0 120 70" className="absolute -top-3 left-1/2 h-16 w-28 -translate-x-1/2 opacity-70" aria-hidden>
        {[28, 50, 72].map((x, i) => <path key={x} className="v3-steam" style={{ animationDelay: `${i * 0.5}s` }} d={`M${x},64 q-10,-16 0,-30 q10,-14 0,-28`} fill="none" stroke="#9fd8cf" strokeWidth="3.5" strokeLinecap="round" />)}
      </svg>
      <svg viewBox="0 0 160 150" className="absolute inset-0 h-full w-full drop-shadow-[0_18px_30px_rgba(40,20,8,0.45)]">
        <defs>
          <linearGradient id="brewg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F0B563" /><stop offset="0.5" stopColor="#D6705B" /><stop offset="1" stopColor="#8E5A7C" /></linearGradient>
          <clipPath id="cupclip"><path d="M30,42 h84 a8,8 0 0 1 8,8 v30 a42,42 0 0 1 -100,0 v-30 a8,8 0 0 1 8,-8 z" /></clipPath>
        </defs>
        <path d="M122,56 a22,22 0 0 1 0,40" fill="none" stroke="#e9d8be" strokeWidth="9" />
        <path d="M30,42 h84 a8,8 0 0 1 8,8 v30 a42,42 0 0 1 -100,0 v-30 a8,8 0 0 1 8,-8 z" fill="#fff7ec" stroke="#e0caa9" strokeWidth="2" />
        <g clipPath="url(#cupclip)">
          <rect x="22" y={60 + (1 - pct) * 60} width="116" height="120" fill="url(#brewg)" />
          <path className="v3-wave" d="M22,72 q12,-9 24,0 t24,0 t24,0 t24,0 t24,0" fill="none" stroke="#fff7ec" strokeWidth="3" strokeLinecap="round" opacity="0.85" style={{ transform: `translateY(${(1 - pct) * 60}px)` }} />
        </g>
        <ellipse cx="72" cy="132" rx="58" ry="9" fill="#e9d8be" opacity="0.6" />
      </svg>
    </div>
  );
}

const card = "rounded-3xl border border-[#efe2cf] bg-[#fffdf9]/90 shadow-[0_10px_30px_-12px_rgba(60,40,20,0.18)] backdrop-blur-sm";
const spring = { type: "spring" as const, stiffness: 80, damping: 16 };
const fade = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: spring } };

export default function DashboardV3() {
  const reduce = useReducedMotion();
  const active = useLiveCapacity(baselineActive);
  const pct = Math.min(1, active / CHANNELS);

  const KPIS = [
    { label: "Calls today", value: overviewStats.total_calls, suffix: "", icon: PhoneCall, tint: "#D6705B", spark: [12, 18, 14, 22, 19, 26, 24], delta: "+12%" },
    { label: "Connect rate", value: 61, suffix: "%", icon: TrendingUp, tint: "#4FB0A5", spark: [40, 44, 39, 52, 49, 58, 61], delta: "+4pts" },
    { label: "Hot leads", value: Math.max(overviewStats.hot_leads, 11), suffix: "", icon: Flame, tint: "#E8943C", spark: [3, 5, 4, 8, 7, 9, 11], delta: "+6" },
    { label: "Minutes left", value: wallet.minutes, suffix: "", icon: Clock, tint: "#8E5A7C", spark: [20, 16, 14, 12, 10, 9, 7], delta: "low", warn: true },
  ];
  const nav = [["Dashboard", "/dashboard-v3", true], ["Campaigns", "/campaigns", false], ["Leads", "/leads", false], ["Calls", "/calls", false], ["Analytics", "/analytics", false]] as const;
  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } };

  return (
    <div className="v3-root fixed inset-0 z-[60] overflow-y-auto font-[family-name:var(--font-inter)] text-[#3a2415]"
      style={{ background: "radial-gradient(120% 90% at 85% -10%, #f6e7cf 0%, #fbf3e6 38%, #f7efe2 100%)" }}>
      <style>{`
        .v3-root{ --brew: linear-gradient(135deg,#F0B563,#D6705B 52%,#8E5A7C); }
        @keyframes v3steam{0%{opacity:0;transform:translateY(6px) scaleY(.9)}30%{opacity:.8}100%{opacity:0;transform:translateY(-14px) scaleY(1.15)}}
        .v3-steam{animation:v3steam 3.4s ease-in-out infinite}
        @keyframes v3bar{0%,100%{height:25%}50%{height:100%}}
        .v3-bar{height:60%;animation:v3bar 1s ease-in-out infinite}
        @keyframes v3wave{0%{transform:translateX(0)}100%{transform:translateX(-48px)}}
        .v3-wave{animation:v3wave 2.6s linear infinite}
        @keyframes v3float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        .v3-float{animation:v3float 6s ease-in-out infinite}
        .v3-bean{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6f4a2a,#3a2412);opacity:.06}
        .v3-bean::after{content:"";position:absolute;inset:0;border-radius:50%;background:linear-gradient(transparent 47%,rgba(0,0,0,.35) 48% 52%,transparent 53%);transform:rotate(28deg)}
        @media (prefers-reduced-motion: reduce){.v3-root *{animation:none !important}}
      `}</style>

      <span className="v3-bean v3-float" style={{ width: 60, height: 78, top: 220, left: 40, transform: "rotate(20deg)" }} />
      <span className="v3-bean v3-float" style={{ width: 40, height: 52, bottom: 120, right: 70, animationDelay: "1.5s" }} />
      <span className="v3-bean v3-float" style={{ width: 28, height: 36, top: 120, right: 240, animationDelay: "3s" }} />

      {/* TOP NAV */}
      <header className="sticky top-0 z-20 border-b border-[#efe2cf]/70 bg-[#fbf3e6]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-4 px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-9 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: "var(--brew)" }}><Coffee className="size-[18px]" /></span>
            <span className="font-[family-name:var(--font-brew)] text-xl tracking-tight text-[#2a1a0f]">Voice<span style={{ color: "#D6705B" }}>Brew</span></span>
          </div>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {nav.map(([label, href, act]) => <Link key={label} href={href} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${act ? "bg-[#2a1a0f] text-[#f7efe2]" : "text-[#6b4a2c] hover:bg-[#f0e2cd]"}`}>{label}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <button className="flex items-center gap-2 rounded-full border border-[#efe2cf] bg-[#fffdf9] px-3 py-1.5 text-sm text-[#8a6a4a] hover:border-[#d6705b]/40"><Search className="size-4" /> <span className="hidden sm:block">Search</span> <kbd className="hidden rounded bg-[#f0e2cd] px-1 text-[10px] sm:block">⌘K</kbd></button>
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-sm" style={{ background: "var(--brew)" }}><Clock className="size-3.5" /> {wallet.minutes} min</span>
            <button className="relative grid size-9 place-items-center rounded-full border border-[#efe2cf] bg-[#fffdf9] text-[#6b4a2c]"><Bell className="size-4" /><span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-[#D6705B] text-[9px] font-bold text-white">3</span></button>
            <Link href="/dashboard-v2" className="rounded-full border border-[#efe2cf] bg-[#fffdf9] px-3 py-1.5 text-xs font-medium text-[#8a6a4a] hover:bg-[#f0e2cd]">← v2</Link>
            <span className="grid size-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#caa06a,#6b4a2c)" }}>AR</span>
          </div>
        </div>
      </header>

      <motion.main variants={container} initial="hidden" animate="show" className="mx-auto max-w-[1180px] space-y-6 px-6 py-7">
        {/* HERO */}
        <motion.section variants={fade} className="relative overflow-hidden rounded-[28px] border border-[#3a2412] text-[#f7efe2] shadow-[0_30px_70px_-30px_rgba(40,20,8,0.7)]"
          style={{ background: "radial-gradient(90% 130% at 88% 0%, rgba(214,112,91,.55), transparent 55%), radial-gradient(70% 120% at 10% 100%, rgba(142,90,124,.5), transparent 60%), linear-gradient(135deg,#2c1a0d,#241509)" }}>
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,.06) 45%, transparent 60%)" }} />
          <div className="relative flex flex-col items-center justify-between gap-6 p-7 md:flex-row">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#f0d9b8] ring-1 ring-white/15"><Sun className="size-3.5" /> Good morning, Arnika</div>
              <h1 className="mt-3 font-[family-name:var(--font-brew)] text-[40px] leading-[1.05] tracking-tight">Your calls are <span style={{ color: "#F0B563" }}>brewing</span>.</h1>
              <p className="mt-3 text-sm leading-relaxed text-[#e7d6bf]/90">{active} of {CHANNELS} cups on the bar · 5 callbacks due · <span className="text-[#9fd8cf]">2 leads waiting for a human</span>. Wallet's running low — a top-up keeps the espresso flowing.</p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/campaigns/quick" className="inline-flex items-center gap-1.5 rounded-full bg-[#f7efe2] px-4 py-2 text-sm font-semibold text-[#2a1a0f] transition-transform hover:scale-[1.03]"><Plus className="size-4" /> Brew a campaign</Link>
                <Link href="/today" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-sm font-medium text-[#f7efe2] hover:bg-white/10">Today's worklist <ArrowUpRight className="size-4" /></Link>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <BrewCup pct={pct} />
              <div>
                <div className="font-[family-name:var(--font-data)] text-5xl font-semibold tracking-tight"><NumberFlow value={active} />/<span className="text-2xl text-[#caa06a]">{CHANNELS}</span></div>
                <div className="text-xs uppercase tracking-widest text-[#caa06a]">cups brewing</div>
                <div className="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs ring-1 ring-white/15"><span className="size-1.5 animate-pulse rounded-full bg-[#9fd8cf]" /> live · {Math.round(pct * 100)}% of capacity</div>
              </div>
            </div>
          </div>
          {/* Lottie soundwave band */}
          <div className="relative border-t border-white/10 px-7 py-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#caa06a]">Live voice</span>
              <Lottie animationData={voicewave} loop className="h-12 flex-1" />
            </div>
          </div>
        </motion.section>

        {/* KPI ROAST */}
        <motion.section variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPIS.map((k) => { const Icon = k.icon; return (
            <motion.div key={k.label} variants={fade} whileHover={reduce ? undefined : { y: -6 }} className={`group relative overflow-hidden p-5 ${card}`}>
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: k.tint }}><Icon className="size-[18px]" /></span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${k.warn ? "bg-[#8E5A7C]/12 text-[#8E5A7C]" : "bg-[#4FB0A5]/12 text-[#3d8c83]"}`}>{k.delta}</span>
              </div>
              <div className="mt-3 font-[family-name:var(--font-data)] text-3xl font-semibold tabular-nums text-[#2a1a0f]"><NumberFlow value={k.value} suffix={k.suffix} /></div>
              <div className="text-xs text-[#8a6a4a]">{k.label}</div>
              <div className="mt-2"><Spark data={k.spark} stroke={k.tint} /></div>
              <div className="pointer-events-none absolute -bottom-6 -right-6 size-20 rounded-full opacity-[0.07] blur-xl" style={{ background: k.tint }} />
            </motion.div>
          ); })}
        </motion.section>

        {/* ON THE BAR + NEEDS YOU */}
        <motion.section variants={fade} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className={`p-6 ${card}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-brew)] text-lg text-[#2a1a0f]">On the bar</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3d8c83]"><span className="size-1.5 animate-pulse rounded-full bg-[#4FB0A5]" /> live</span>
            </div>
            <div className="space-y-2.5">
              {liveCampaigns.map((c) => { const lp = c.slotsUsed / c.slotsCap; const running = c.status === "running"; return (
                <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-[#f0e2cd] bg-[#fffdf9] px-4 py-3">
                  <Equalizer active={running} color={running ? "#D6705B" : "#caa06a"} />
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-[#2a1a0f]">{c.name}</div><div className="text-xs text-[#8a6a4a]">{c.hot} hot · {c.warm} warm · {c.reached}/{c.total} reached</div></div>
                  <div className="w-28"><div className="h-1.5 overflow-hidden rounded-full bg-[#f0e2cd]"><div className="h-full rounded-full" style={{ width: `${lp * 100}%`, background: "var(--brew)" }} /></div></div>
                  <span className={`w-16 text-right text-xs font-medium ${running ? "text-[#3d8c83]" : c.status === "paused" ? "text-[#b08400]" : "text-[#8a6a4a]"}`}>{c.slotsUsed}/{c.slotsCap} ch</span>
                </div>
              ); })}
            </div>
          </div>

          <div className={`p-6 ${card}`}>
            <h2 className="mb-4 font-[family-name:var(--font-brew)] text-lg text-[#2a1a0f]">Needs you</h2>
            <div className="space-y-2.5">
              {[
                { icon: Headset, t: "2 leads waiting for a human", s: "Outreach campaign", tint: "#D6705B", href: "/handoff" },
                { icon: PhoneCall, t: "5 callbacks due today", s: "Don't let them cool", tint: "#E8943C", href: "/leads" },
                { icon: Zap, t: "Wallet running low", s: "720 min — top up", tint: "#8E5A7C", href: "/settings/billing" },
              ].map((a) => { const Icon = a.icon; return (
                <Link key={a.t} href={a.href} className="flex items-center gap-3 rounded-2xl border border-[#f0e2cd] bg-[#fffdf9] px-3.5 py-3 transition-colors hover:border-[#d6705b]/40">
                  <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: a.tint }}><Icon className="size-4" /></span>
                  <div className="flex-1"><div className="text-sm font-medium text-[#2a1a0f]">{a.t}</div><div className="text-xs text-[#8a6a4a]">{a.s}</div></div>
                  <ArrowUpRight className="size-4 text-[#caa06a]" />
                </Link>
              ); })}
            </div>
            <div className="mt-4 rounded-2xl p-4 text-[#f7efe2]" style={{ background: "linear-gradient(135deg,#2c1a0d,#3a2412)" }}>
              <div className="flex items-center gap-2 text-sm font-medium"><Sparkles className="size-4 text-[#F0B563]" /> Catch-me-up</div>
              <p className="mt-1.5 text-xs leading-relaxed text-[#e7d6bf]/85">Since yesterday: 108 calls placed, connect rate up 4 pts, 11 new hot leads. EMI Reminders is your best roast today.</p>
            </div>
          </div>
        </motion.section>

        <footer className="flex items-center justify-center gap-2 pb-4 pt-2 text-xs text-[#a98a68]">
          <Coffee className="size-3.5" /> VoiceBrew v3 — trial. <Link href="/dashboard-v2" className="font-medium text-[#D6705B] hover:underline">Back to v2</Link>
        </footer>
      </motion.main>
    </div>
  );
}
