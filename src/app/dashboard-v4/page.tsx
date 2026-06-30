"use client";

/* =====================================================================
   VoiceBrew — ATLAS · "The Pour Line"  (v4)
   A modern specialty-espresso bar rendered as a real-time voice-ops
   command deck. A CALL is a POUR; live audio IS crema/steam.
   Self-contained app shell — own theme/fonts scoped under .vb-atlas.
   v2 is never touched. Built to V4-DESIGN-SPEC.md.
   ===================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import {
  Search, ArrowRight, ArrowDown, Sparkles, Radio, PhoneCall, Users, Settings,
  BarChart3, Filter, Megaphone, Coffee, Bell, Gauge, Play, Pause, Headphones,
  Mic, PhoneForwarded, Command, Dot, LayoutGrid,
} from "lucide-react";
import { overviewStats, currentUser, organization } from "@/lib/data";
import { wallet } from "@/lib/wallet-mock";
import { CHANNELS, baselineActive, liveCampaigns, connectRate } from "@/lib/channel-mock";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import {
  fleet, nextActions, feedKinds, feedKindMeta, feedNames, feedCampaigns,
  providers, roastCurve, roastNowIndex, funnel, liveCalls, type FeedKind,
} from "@/lib/atlas-mock";

/* ---------------- tokens ---------------- */
const C = {
  bg: "#FBF8F1", bgTint: "#F6F0E4", surface: "#FFFFFF", surface2: "#FEFCF7",
  sidebar: "#1C1917", sidebar2: "#292320",
  ink: "#1C1917", ink2: "#6B5E50", ink3: "#A89B8B", onDark: "#F6F0E4", onDark2: "#B7A793",
  line: "#E9E0D0", lineStrong: "#DBCFBA", lineDark: "#3A332E",
  coffee: "#78350F", coffee2: "#92400E",
  brass: "#A16207", brassSoft: "#C99A3A", caramel: "#BE823F", caramelSoft: "#E3B57E", crema: "#E9C9A0", oat: "#F1E7D5",
  positive: "#6E8157", positiveSoft: "#DDE5D2", warning: "#B45309", warningSoft: "#FBE7C6", danger: "#C2410C", dangerSoft: "#F6D9C7",
};
const SHADOW = "0 1px 2px rgba(28,25,23,0.04), 0 12px 24px rgba(28,25,23,0.05)";
const card: React.CSSProperties = { background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: SHADOW };
const initials = (s: string) => s.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const mono = "font-[family-name:var(--font-data)] tabular-nums";

/* ================= inline café illustrations ================= */
function BeanWaveMark({ size = 28, live, reduce }: { size?: number; live?: boolean; reduce?: boolean | null }) {
  const bars = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.45, 0.65];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="VoiceBrew">
      <path d="M24 3c11 0 18 9 18 21S35 45 24 45 6 36 6 24 13 3 24 3Z" fill={C.brass} />
      <path d="M24 3c11 0 18 9 18 21S35 45 24 45 6 36 6 24 13 3 24 3Z" fill="url(#bw)" opacity="0.0" />
      {/* crease as waveform */}
      <g>
        {bars.map((h, i) => {
          const x = 13 + i * 2.6;
          return <rect key={i} x={x} y={24 - h * 9} width="1.6" height={h * 18} rx="0.8" fill="#FBF8F1"
            style={{ transformBox: "fill-box", transformOrigin: "center", animation: live && !reduce ? `vbBar ${720 + (i % 4) * 130}ms ease-in-out ${i * 70}ms infinite` : undefined }} />;
        })}
      </g>
    </svg>
  );
}
function LatteArt({ variant, size = 24, color = C.brass }: { variant: string; size?: number; color?: string }) {
  const p: Record<string, React.ReactNode> = {
    rosetta: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><path d="M12 4v16" /><path d="M12 7c-3 0-5 1-5 1M12 7c3 0 5 1 5 1M12 11c-3 0-5 1-5 1M12 11c3 0 5 1 5 1M12 15c-2 0-4 1-4 1M12 15c2 0 4 1 4 1" /></g>,
    tulip: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><circle cx="12" cy="8" r="3" /><circle cx="12" cy="13" r="2.4" /><path d="M12 16v4" /></g>,
    heart: <path d="M12 19s-6-4-6-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6 2.5C18 15 12 19 12 19Z" stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
    swan: <g stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"><path d="M8 18c0-6 4-9 8-9-2 1-3 3-3 5M16 9c0-2-1-3-2-3.5" /><path d="M7 19h10" /></g>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24">{p[variant] || p.rosetta}</svg>;
}
function Steam({ live, reduce, color = C.caramel, w = 22 }: { live?: boolean; reduce?: boolean | null; color?: string; w?: number }) {
  return (
    <svg width={w} height={w * 1.1} viewBox="0 0 22 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      {[4, 11, 18].map((x, i) => <path key={x} d={`M${x} 22 C ${x - 4} 16 ${x + 4} 13 ${x} 8 C ${x - 3} 4 ${x + 3} 2 ${x} 0`} opacity={0.5 + i * 0.15}
        style={{ animation: live && !reduce ? `vbSteam ${2600 + i * 500}ms ease-in-out ${i * 300}ms infinite` : undefined }} />)}
    </svg>
  );
}
function BrewMeter({ fill, live, reduce }: { fill: number; live?: boolean; reduce?: boolean | null }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
      <g style={{ animation: live && !reduce ? "vbSteam 3s ease-in-out infinite" : undefined, transformOrigin: "center" }}>
        {[20, 28, 36].map((x, i) => <path key={x} d={`M${x} 16 C ${x - 3} 12 ${x + 3} 10 ${x} 6`} stroke={C.caramelSoft} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity={0.6 - i * 0.12} />)}
      </g>
      <path d="M14 20h28v8a14 14 0 0 1-28 0z" fill={C.surface2} stroke={C.brassSoft} strokeWidth="1.5" />
      <clipPath id="bm"><path d="M14 20h28v8a14 14 0 0 1-28 0z" /></clipPath>
      <rect x="14" y={20 + (1 - fill) * 22} width="28" height="22" fill={C.caramel} clipPath="url(#bm)" />
      <path d="M42 23a6 6 0 0 1 0 12" fill="none" stroke={C.brassSoft} strokeWidth="2" />
    </svg>
  );
}

/* ================= shared bits ================= */
function Eyebrow({ children, icon: Icon }: { children: React.ReactNode; icon?: typeof Radio }) {
  return <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: C.ink2, fontFamily: "var(--vb-ui)" }}>{Icon && <Icon className="size-3.5" style={{ color: C.brass }} />}{children}</div>;
}
function Card({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={`p-5 ${className}`} style={{ ...card, ...style }}>{children}</section>;
}
function LiveChip() { return <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: C.positive }}><span className="size-1.5 rounded-full" style={{ background: C.positive, animation: "vbPulse 2s ease-in-out infinite" }} /> live</span>; }

/* ================= KPI rail ================= */
function SteamSpark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data), w = 72, h = 22;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / (max - min || 1)) * h]);
  let dpath = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) { const [x, y] = pts[i], [px, py] = pts[i - 1]; const cx = (x + px) / 2; dpath += ` Q ${px} ${py} ${cx} ${(y + py) / 2} T ${x} ${y}`; }
  return <svg width={w} height={h} className="overflow-visible"><path d={dpath} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></svg>;
}
function BulletKpi({ label, value, suffix, fill, target, delta, warn, spark }: { label: string; value: number; suffix?: string; fill: number; target: number; delta: string; warn?: boolean; spark: number[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl p-4" style={card}>
      <Eyebrow>{label}</Eyebrow>
      <div className="flex items-end justify-between">
        <div className={`${mono} text-[26px] font-semibold leading-none`} style={{ color: C.ink }}><NumberFlow value={value} />{suffix}</div>
        <SteamSpark data={spark} color={C.caramel} />
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.bgTint }}>
        <div className="h-full rounded-full" style={{ width: `${fill * 100}%`, background: C.caramel }} />
        <span className="absolute top-1/2 h-3 w-[2px] -translate-y-1/2 rounded" style={{ left: `${target * 100}%`, background: C.coffee }} />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: warn ? C.danger : C.positive }}>{delta}</span>
    </div>
  );
}

/* ================= Live Call Player — NOW POURING ================= */
function NowPouring({ live, reduce }: { live: boolean; reduce: boolean | null }) {
  const st = useRef({ ci: 0, turn: 0, chars: 0, pause: 0 });
  const [, force] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      const s = st.current, tr = liveCalls[s.ci].transcript;
      if (s.pause > 0) { s.pause--; force((x) => x + 1); return; }
      const cur = tr[s.turn];
      if (s.chars < cur.text.length) s.chars += reduce ? 99 : 1;
      else if (s.turn < tr.length - 1) { s.turn++; s.chars = 0; s.pause = 22; }
      else { s.ci = (s.ci + 1) % liveCalls.length; s.turn = 0; s.chars = 0; s.pause = 40; }
      force((x) => x + 1);
    }, 36);
    return () => clearInterval(id);
  }, [live, reduce]);
  const s = st.current, call = liveCalls[s.ci];
  const dur = 24 + s.turn * 16 + Math.floor(s.chars / 4);
  const fillPct = Math.min(0.9, 0.25 + (s.turn / Math.max(1, call.transcript.length)) * 0.6);
  const speakerAgent = call.transcript[s.turn]?.who === "agent";
  const shown = call.transcript.slice(0, s.turn + 1).map((t, i) => (i === s.turn ? { ...t, text: t.text.slice(0, s.chars), typing: s.chars < t.text.length } : { ...t, typing: false })).slice(-3);
  const waves = useMemo(() => Array.from({ length: 38 }, (_, i) => ({ delay: `${(i % 8) * 80}ms`, dur: `${640 + (i % 5) * 120}ms` })), []);
  const sentWord = call.sentiment > 0.78 ? "Light" : call.sentiment > 0.6 ? "Medium" : call.sentiment > 0.45 ? "Dark" : "Burnt";

  return (
    <Card className="flex h-full flex-col" style={{ borderRadius: 20 }}>
      <div className="flex items-start justify-between">
        <div>
          <Eyebrow icon={Coffee}>Now Pouring</Eyebrow>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[16px] font-semibold" style={{ color: C.ink, fontFamily: "var(--vb-ui)" }}>{call.agent}</span>
            <ArrowRight className="size-3.5" style={{ color: C.ink3 }} />
            <span className="rounded-md px-2 py-0.5 text-[12px] font-medium" style={{ background: C.bgTint, color: C.ink2 }}>{call.lead}</span>
          </div>
          <div className="mt-0.5 text-[12px]" style={{ color: C.ink3 }}>{call.campaign} · {call.lang}</div>
        </div>
        <div className={`${mono} text-[18px] font-semibold`} style={{ color: C.coffee }}>{mmss(dur)}</div>
      </div>

      {/* The Pour — glass + extraction + crema waveform */}
      <div className="mt-4 flex items-stretch gap-4">
        <svg width="86" height="150" viewBox="0 0 86 150" aria-hidden className="shrink-0">
          {/* portafilter */}
          <rect x="28" y="2" width="30" height="9" rx="2" fill={C.brass} />
          <rect x="38" y="11" width="10" height="6" fill={C.brassSoft} />
          {/* stream */}
          {live && !reduce && <rect x="42" y="17" width="2" height="20" fill={C.caramel} style={{ animation: "vbStream 0.5s linear infinite" }} />}
          {(!live || reduce) && <rect x="42" y="17" width="2" height="20" fill={C.caramel} opacity="0.5" />}
          {/* glass */}
          <path d="M22 40 h42 l-4 96 a6 6 0 0 1 -6 5 h-16 a6 6 0 0 1 -6 -5 z" fill={C.surface2} stroke={C.lineStrong} strokeWidth="1.5" />
          <clipPath id="glass"><path d="M22 40 h42 l-4 96 a6 6 0 0 1 -6 5 h-16 a6 6 0 0 1 -6 -5 z" /></clipPath>
          <g clipPath="url(#glass)">
            <rect x="20" y={141 - fillPct * 100} width="48" height="120" fill="url(#pour)" />
            <rect x="20" y={141 - fillPct * 100} width="48" height="4" fill={C.crema} />
          </g>
          <defs><linearGradient id="pour" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.caramel} /><stop offset="1" stopColor={C.coffee} /></linearGradient></defs>
        </svg>
        {/* crema waveform on the surface */}
        <div className="flex flex-1 items-center justify-center rounded-xl px-3" style={{ background: C.bgTint }}>
          <div className="flex h-16 w-full items-center justify-between gap-[2px]">
            {waves.map((w, i) => <span key={i} className="w-[3px] flex-1 rounded-full" style={{ background: speakerAgent ? C.brass : C.positive, height: "32%", transformOrigin: "center", animation: live && !reduce ? `vbWave ${w.dur} ease-in-out ${w.delay} infinite` : undefined, opacity: 0.9 }} />)}
          </div>
        </div>
      </div>

      {/* transcript — order on the cup */}
      <div className="mt-4 flex-1 space-y-1.5">
        <AnimatePresence initial={false}>
          {shown.map((t, i) => (
            <motion.div key={`${s.ci}-${s.turn - (shown.length - 1 - i)}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${t.who === "agent" ? "justify-start" : "justify-end"}`}>
              <div className={`${"font-[family-name:var(--font-data)]"} max-w-[88%] rounded-xl px-2.5 py-1.5 text-[12.5px] leading-snug`} style={t.who === "agent" ? { background: C.bgTint, color: C.ink, borderBottomLeftRadius: 5 } : { background: "rgba(190,130,63,.12)", color: C.coffee, borderBottomRightRadius: 5 }}>
                {t.text}{t.typing && <span className="ml-0.5 inline-block w-[2px] translate-y-[2px]" style={{ height: 13, background: C.caramel, animation: "vbBlink 1s steps(2) infinite" }} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* roast gauge + controls */}
      <div className="mt-3 border-t pt-3" style={{ borderColor: C.line }}>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: C.ink3 }}>
          <span>Roast gauge</span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: `linear-gradient(90deg,${C.crema},${C.caramel},${C.coffee})` }}><span className="absolute top-1/2 size-2.5 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `calc(${call.sentiment * 100}% - 6px)`, background: call.sentiment > 0.55 ? C.positive : C.danger }} /></span>
          <span className="font-medium" style={{ color: C.coffee, fontFamily: "var(--vb-serif)", fontStyle: "italic" }}>{sentWord} roast</span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <Ctrl icon={Headphones} label="Listen" /><Ctrl icon={Mic} label="Whisper" /><Ctrl icon={PhoneForwarded} label="Take over" solid />
        </div>
      </div>
    </Card>
  );
}
function Ctrl({ icon: Icon, label, solid }: { icon: typeof Mic; label: string; solid?: boolean }) {
  return <button className="inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-medium transition-transform hover:-translate-y-0.5"
    style={solid ? { background: C.coffee, color: "#fff" } : { border: `1px solid ${C.line}`, color: C.ink2 }}><Icon className="size-3.5" /> {label}</button>;
}

/* ================= Capacity Reactor — THE EXTRACTION ================= */
function Extraction({ active, live, reduce }: { active: number; live: boolean; reduce: boolean | null }) {
  const cx = 200, cy = 200, INNER = 74, MAXLEN = 32, RING = 150;
  const spokes = useMemo(() => Array.from({ length: 48 }, (_, i) => ({ a: i * (360 / 48), delay: Math.round((Math.sin(i * 9.3) * 0.5 + 0.5) * 1200), dur: 780 + Math.round((Math.cos(i * 5.1) * 0.5 + 0.5) * 640) })), []);
  const arc = (r: number, s: number, e: number) => { const p = (deg: number) => { const a = ((deg - 90) * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`; }; return `M ${p(s)} A ${r} ${r} 0 ${e - s <= 180 ? 0 : 1} 1 ${p(e)}`; };
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[230px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="ex-sp" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={C.caramelSoft} /><stop offset="1" stopColor={C.caramel} /></linearGradient>
          <radialGradient id="ex-core" cx="0.5" cy="0.36" r="0.7"><stop offset="0" stopColor="#3a322c" /><stop offset="0.6" stopColor="#211A15" /><stop offset="1" stopColor="#120d0a" /></radialGradient>
          <linearGradient id="ex-seg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={C.brassSoft} /><stop offset="1" stopColor={C.brass} /></linearGradient>
        </defs>
        {Array.from({ length: CHANNELS }).map((_, i) => { const busy = i < active; return <path key={i} d={arc(RING, i * 36 + 4, i * 36 + 32)} fill="none" strokeLinecap="round" stroke={busy ? "url(#ex-seg)" : C.line} strokeWidth={busy ? 6 : 3} />; })}
        {spokes.map((b, i) => <g key={i} transform={`rotate(${b.a} ${cx} ${cy})`}><rect x={cx - 1} y={cy - INNER - MAXLEN} width="2" height={MAXLEN} rx="1" fill="url(#ex-sp)" style={{ transformBox: "fill-box", transformOrigin: "center bottom", opacity: 0.78, animation: live && !reduce ? `vbBar ${b.dur}ms ease-in-out ${b.delay}ms infinite` : undefined }} /></g>)}
        <circle cx={cx} cy={cy} r="56" fill="url(#ex-core)" style={{ transformBox: "fill-box", transformOrigin: "center", animation: live && !reduce ? "vbBreathe 4s ease-in-out infinite" : undefined }} />
        <ellipse cx={cx} cy={cy - 22} rx="30" ry="10" fill={C.brass} opacity="0.18" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className={`${mono} text-[36px] font-semibold leading-none`} style={{ color: C.crema }}><NumberFlow value={active} /></div>
        <div className="text-[9px] font-medium uppercase tracking-[0.2em]" style={{ color: C.caramelSoft }}>pulling</div>
      </div>
    </div>
  );
}

/* ================= Roast Curve ================= */
function RoastCurve() {
  const W = 600, H = 150, PAD = 14;
  const max = Math.max(...roastCurve.map((d) => d.v));
  const x = (i: number) => (i / (roastCurve.length - 1)) * (W - PAD * 2) + PAD;
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const line = roastCurve.map((d, i) => `${x(i)},${y(d.v)}`).join(" ");
  const area = `M ${x(0)},${H - PAD} L ${line.split(" ").join(" L ")} L ${x(roastCurve.length - 1)},${H - PAD} Z`;
  const nx = x(roastNowIndex), ny = y(roastCurve[roastNowIndex].v);
  const peak = roastCurve.reduce((m, d, i) => (d.v > roastCurve[m].v ? i : m), 0);
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between"><Eyebrow icon={BarChart3}>Roast Curve</Eyebrow><span className={`${mono} text-[11px]`} style={{ color: C.ink3 }}>calls / hour</span></div>
      <div className="relative flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 150 }}>
          <defs>
            <linearGradient id="rcF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.caramel} stopOpacity="0.34" /><stop offset="1" stopColor={C.oat} stopOpacity="0" /></linearGradient>
          </defs>
          <line x1={PAD} y1={y(max * 0.62)} x2={W - PAD} y2={y(max * 0.62)} stroke={C.coffee} strokeWidth="1" strokeDasharray="4 5" opacity="0.35" />
          <path d={area} fill="url(#rcF)" />
          <polyline points={line} fill="none" stroke={C.caramel} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 1400, strokeDashoffset: 1400, animation: "vbDraw 1.6s ease-out forwards" }} />
          <circle cx={x(peak)} cy={y(roastCurve[peak].v)} r="3" fill={C.coffee} />
          <line x1={nx} y1={PAD} x2={nx} y2={H - PAD} stroke={C.caramel} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <circle cx={nx} cy={ny} r="4" fill={C.caramel} stroke="#fff" strokeWidth="2" />
          <circle cx={nx} cy={ny} r="4" fill="none" stroke={C.caramel} strokeWidth="1.5"><animate attributeName="r" from="4" to="13" dur="1.9s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.6" to="0" dur="1.9s" repeatCount="indefinite" /></circle>
        </svg>
        <div className={`${mono} mt-1 flex justify-between text-[10px]`} style={{ color: C.ink3 }}>{roastCurve.filter((_, i) => i % 2 === 0).map((d) => <span key={d.h}>{d.h}</span>)}</div>
      </div>
    </Card>
  );
}

/* ================= Drip Funnel — THE DRIP (V60) ================= */
function DripFunnel() {
  const max = funnel[0].value;
  const won = funnel[funnel.length - 1];
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between"><Eyebrow icon={Filter}>The Drip</Eyebrow><span className={`${mono} text-[11px]`} style={{ color: C.ink3 }}>today</span></div>
      <div className="space-y-2">
        {funnel.map((f, i) => {
          const pct = (f.value / max) * 100, conv = i > 0 ? Math.round((f.value / funnel[i - 1].value) * 100) : null;
          const inset = i * 9;
          return (
            <div key={f.label}>
              {conv !== null && <div className="mb-0.5 flex items-center gap-1 pl-1 text-[10px]" style={{ color: C.ink3 }}><ArrowDown className="size-3" /> {conv}%{conv < 60 ? <span style={{ color: C.danger }}> · drip leak</span> : null}</div>}
              <div className="flex items-center gap-3" style={{ paddingLeft: inset, paddingRight: inset }}>
                <div className="relative h-8 flex-1 overflow-hidden rounded-lg" style={{ background: C.bgTint }}>
                  <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} className="h-full origin-left rounded-lg" style={{ width: `${pct}%`, background: f.color }} />
                  <span className="absolute inset-y-0 left-3 flex items-center text-[12px] font-medium" style={{ color: i > 1 ? "#fff" : C.ink }}>{f.label}</span>
                </div>
                <span className={`${mono} w-10 text-right text-[13px] font-semibold`} style={{ color: C.ink }}>{f.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg px-3 py-2" style={{ background: C.bgTint }}>
        <span className="text-[12px]" style={{ color: C.ink2 }}>In the carafe</span>
        <span className={`${mono} text-[14px] font-semibold`} style={{ color: C.coffee }}>{won.value} won · {Math.round((won.value / max) * 100)}%</span>
      </div>
    </Card>
  );
}

/* ================= On-the-Bar campaign shelf ================= */
function CampaignCup({ name, pct, running, reduce, live }: { name: string; pct: number; running: boolean; reduce: boolean | null; live: boolean }) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col items-center gap-1.5">
      <div className="relative h-14 w-12">
        {running && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Steam live={live} reduce={reduce} w={16} /></div>}
        <svg width="48" height="56" viewBox="0 0 48 56">
          <path d="M10 16h28l-3 34a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4z" fill={running ? C.surface2 : C.bgTint} stroke={running ? C.brass : C.line} strokeWidth="1.5" />
          <rect x="8" y="12" width="32" height="6" rx="3" fill={running ? C.caramel : C.lineStrong} />
          <clipPath id={`cup${name}`}><path d="M10 16h28l-3 34a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4z" /></clipPath>
          <rect x="8" y={52 - pct * 36} width="32" height="40" fill={running ? C.caramelSoft : "transparent"} clipPath={`url(#cup${name})`} opacity="0.6" />
        </svg>
      </div>
      <div className="w-full truncate text-center text-[11px] font-medium" style={{ color: running ? C.ink : C.ink3 }}>{name}</div>
      <div className={`${mono} text-[10px]`} style={{ color: C.ink3 }}>{Math.round(pct * 100)}% dialed</div>
    </div>
  );
}

/* ================= Live Wire — DRIP FEED ================= */
type Evt = { id: number; kind: FeedKind; name: string; campaign: string; ts: number };
function LiveWire({ now, live }: { now: number; live: boolean }) {
  const [evts, setEvts] = useState<Evt[]>([]);
  const n = useRef(0);
  useEffect(() => {
    const mk = (): Evt => ({ id: n.current++, kind: feedKinds[Math.floor(Math.random() * feedKinds.length)], name: feedNames[Math.floor(Math.random() * feedNames.length)], campaign: feedCampaigns[Math.floor(Math.random() * feedCampaigns.length)], ts: Date.now() });
    setEvts(Array.from({ length: 7 }, () => ({ ...mk(), ts: Date.now() - Math.floor(Math.random() * 50000) })).sort((a, b) => b.ts - a.ts));
    if (!live) return;
    const id = setInterval(() => setEvts((cur) => [mk(), ...cur].slice(0, 9)), 2400);
    return () => clearInterval(id);
  }, [live]);
  const age = (ts: number) => { const sec = Math.max(0, Math.floor((now - ts) / 1000)); return sec < 2 ? "now" : sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m`; };
  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between"><Eyebrow icon={Radio}>Drip Feed</Eyebrow><LiveChip /></div>
      <div className="relative flex-1 pl-3">
        <div className="absolute bottom-0 left-1 top-0 w-px" style={{ background: `linear-gradient(${C.caramel},${C.line})` }} />
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {evts.map((e) => { const m = feedKindMeta[e.kind]; return (
              <motion.li key={e.id} layout initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="relative flex items-center gap-2.5">
                <span className="absolute -left-[10px] size-2 rounded-full ring-2 ring-white" style={{ background: m.color }} />
                <span className="min-w-0 flex-1 truncate text-[12.5px]" style={{ color: C.ink }}><span className="font-medium">{e.name}</span> <span style={{ color: C.ink3 }}>· {e.campaign}</span></span>
                <span className="shrink-0 text-[11px] font-medium" style={{ color: m.color }}>{m.label}</span>
                <span className={`${mono} w-7 shrink-0 text-right text-[10px]`} style={{ color: C.ink3 }}>{age(e.ts)}</span>
              </motion.li>
            ); })}
          </AnimatePresence>
        </ul>
      </div>
    </Card>
  );
}

/* ================= The Fleet ================= */
const LATTE = ["rosetta", "tulip", "heart", "swan"];
function FleetCard({ a, i, sec, live, reduce }: { a: typeof fleet[number]; i: number; sec: number; live: boolean; reduce: boolean | null }) {
  const on = a.status === "on-call", wrap = a.status === "wrapping", ring = on ? C.positive : wrap ? C.warning : C.line;
  return (
    <div className="flex items-center gap-3 rounded-xl p-3" style={{ border: `1px solid ${C.line}`, background: C.surface2 }}>
      <div className="relative">
        <span className="grid size-10 place-items-center rounded-full" style={{ background: C.bgTint, boxShadow: `0 0 0 2px ${ring}` }}><LatteArt variant={LATTE[i % 4]} size={22} color={C.brass} /></span>
        {on && <span className="absolute -right-1 -top-1"><Steam live={live} reduce={reduce} w={12} color={C.caramelSoft} /></span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5"><span className="text-[13px] font-medium" style={{ color: C.ink }}>{a.name}</span><span className="text-[10px]" style={{ color: C.ink3 }}>· {a.lang}</span></div>
        <div className="truncate text-[11px]" style={{ color: C.ink3 }}>{on || wrap ? a.campaign : `${a.handled} pours today`}</div>
      </div>
      {on ? <span className={`${mono} text-[12px] font-medium`} style={{ color: C.positive }}>{mmss(a.baseSeconds + sec)}</span>
        : wrap ? <span className="text-[11px] font-medium" style={{ color: C.warning }}>wrapping</span>
          : <span className="text-[11px]" style={{ color: C.ink3 }}>ready</span>}
    </div>
  );
}

/* ================= Sidebar ================= */
const NAV = [
  { label: "Pass", icon: LayoutGrid }, { label: "Live Calls", icon: PhoneCall }, { label: "The Fleet", icon: Users },
  { label: "Roast", icon: BarChart3 }, { label: "Funnel", icon: Filter }, { label: "Campaigns", icon: Megaphone },
  { label: "Beans", icon: Coffee }, { label: "Insights", icon: Sparkles }, { label: "Settings", icon: Settings },
];
function Sidebar({ live, reduce, paused, setPaused }: { live: boolean; reduce: boolean | null; paused: boolean; setPaused: (v: boolean) => void }) {
  const [act, setAct] = useState(0);
  return (
    <aside className="group/sb relative z-20 hidden w-[76px] shrink-0 flex-col py-4 transition-[width] duration-300 ease-out hover:w-[232px] lg:flex" style={{ background: C.sidebar }}>
      <div className="flex items-center gap-2.5 px-[22px]">
        <BeanWaveMark size={30} live={live} reduce={reduce} />
        <span className="overflow-hidden whitespace-nowrap text-[15px] font-semibold opacity-0 transition-opacity group-hover/sb:opacity-100" style={{ color: C.onDark }}>VoiceBrew <span style={{ color: C.brass }}>Atlas</span></span>
      </div>
      <nav className="relative mt-6 flex flex-1 flex-col gap-0.5 px-3">
        {NAV.map((n, i) => { const A = i === act; const Icon = n.icon; return (
          <button key={n.label} onClick={() => setAct(i)} className="relative flex items-center gap-3 rounded-lg px-[10px] py-2.5 text-[13px] font-medium" style={{ color: A ? C.onDark : C.onDark2, background: A ? C.sidebar2 : "transparent" }}>
            {A && <motion.span layoutId="pourline" className="absolute -left-3 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full" style={{ background: C.caramel }} transition={{ type: "spring", stiffness: 200, damping: 22 }} />}
            <Icon className="size-[18px] shrink-0" strokeWidth={1.6} />
            <span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity group-hover/sb:opacity-100">{n.label}</span>
          </button>
        ); })}
      </nav>
      <div className="mt-auto flex flex-col items-center gap-3 px-3">
        <div className="flex w-full items-center gap-2.5 rounded-xl p-2" style={{ background: C.sidebar2 }}>
          <BrewMeter fill={0.61} live={live} reduce={reduce} />
          <div className="overflow-hidden opacity-0 transition-opacity group-hover/sb:opacity-100">
            <div className="whitespace-nowrap text-[11px] font-medium" style={{ color: C.onDark }}>61% poured</div>
            <div className={`${mono} whitespace-nowrap text-[10px]`} style={{ color: C.onDark2 }}>{wallet.minutes}m left</div>
          </div>
        </div>
        <button onClick={() => setPaused(!paused)} className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-medium" style={{ border: `1px solid ${C.lineDark}`, color: C.onDark2 }}>
          {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}<span className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity group-hover/sb:opacity-100">{paused ? "Resume bar" : "Pause bar"}</span>
        </button>
        <div className="flex w-full items-center gap-2 px-1">
          <span className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold" style={{ background: C.brass, color: "#fff", boxShadow: `0 0 0 2px ${C.brassSoft}` }}>{initials(currentUser.full_name)}</span>
          <div className="overflow-hidden opacity-0 transition-opacity group-hover/sb:opacity-100"><div className="truncate whitespace-nowrap text-[12px] font-medium" style={{ color: C.onDark }}>{currentUser.full_name}</div></div>
        </div>
      </div>
    </aside>
  );
}

/* ================= Top bar ================= */
function RoastPill({ word, color }: { word: string; color: string }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: C.surface, border: `1px solid ${C.line}`, color: C.ink2 }}><span className="size-2 rounded-full" style={{ background: color }} /> {word} roast</span>;
}
function Topbar({ active, reduce }: { active: number; reduce: boolean | null }) {
  const hr = 9; // mock morning
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 px-6" style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.line}` }}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight" style={{ color: C.ink }}>The Pass</div>
        <div className="truncate text-[12px]" style={{ color: C.ink2, fontFamily: "var(--vb-serif)", fontStyle: "italic" }}>now serving — {active} live pours · good morning, {currentUser.full_name.split(" ")[0]}, the bar&apos;s warming up</div>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-xl px-3 py-2 text-[12px] md:flex" style={{ background: C.surface, border: `1px solid ${C.line}`, color: C.ink3 }}><Search className="size-3.5" /> <span>Find an agent, campaign, number…</span> <kbd className="flex items-center gap-0.5 text-[10px]"><Command className="size-2.5" />K</kbd></div>
        <RoastPill word="Medium" color={C.brass} />
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium" style={{ background: C.coffee, color: "#fff" }}><span className="size-1.5 rounded-full bg-white" style={{ animation: reduce ? undefined : "vbPulse 2s ease-in-out infinite" }} /> <span className={mono}>{active}</span> open tabs</span>
        <button className="grid size-9 place-items-center rounded-full" style={{ border: `1px solid ${C.line}`, color: C.ink2 }}><Bell className="size-4" /></button>
      </div>
    </header>
  );
}

/* ========================================================================= */
export default function AtlasV4() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const live = !paused && !reduce;
  const active = useLiveCapacity(baselineActive);
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(0);
  useEffect(() => { setNow(Date.now()); if (paused) return; const id = setInterval(() => { setTick((t) => t + 1); setNow(Date.now()); }, 1000); return () => clearInterval(id); }, [paused]);
  const onCall = fleet.filter((f) => f.status === "on-call").length;

  const KPIS = [
    { label: "Calls Today", value: overviewStats.total_calls, fill: 0.68, target: 0.8, delta: "+12%", spark: [3, 5, 4, 7, 6, 8, 7, 9] },
    { label: "Connect Rate", value: Math.round(connectRate * 100), suffix: "%", fill: 0.61, target: 0.65, delta: "+4pts", spark: [4, 4.4, 3.9, 5.2, 4.9, 5.8, 6.1] },
    { label: "Avg Handle", value: 142, suffix: "s", fill: 0.5, target: 0.45, delta: "-6s", spark: [5, 4.6, 4.8, 4.2, 4.4, 4, 3.9] },
    { label: "Conversions", value: 31, fill: 0.42, target: 0.5, delta: "+6", spark: [1, 2, 2, 3, 3, 4, 4.2] },
    { label: "Fleet Online", value: fleet.length, fill: onCall / fleet.length, target: 0.8, delta: `${onCall} on call`, spark: [3, 4, 4, 5, 4, 5, 5] },
  ];

  return (
    <div className="vb-atlas fixed inset-0 z-50 flex" style={{ background: C.bg, color: C.ink, fontFamily: "var(--vb-ui), var(--font-inter), system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
        .vb-atlas{ --vb-ui:'Space Grotesk'; --vb-serif:'Instrument Serif'; }
        .vb-atlas ::selection{ background:#BE823F33; }
        @keyframes vbBar{ 0%,100%{ transform:scaleY(.26) } 50%{ transform:scaleY(1) } }
        @keyframes vbWave{ 0%,100%{ transform:scaleY(.3) } 50%{ transform:scaleY(1) } }
        @keyframes vbBreathe{ 0%,100%{ transform:scale(.98) } 50%{ transform:scale(1.03) } }
        @keyframes vbBlink{ 0%,100%{ opacity:1 } 50%{ opacity:0 } }
        @keyframes vbDraw{ to{ stroke-dashoffset:0 } }
        @keyframes vbPulse{ 0%,100%{ opacity:1; transform:scale(1) } 50%{ opacity:.4; transform:scale(.7) } }
        @keyframes vbSteam{ 0%{ opacity:0; transform:translateY(4px) } 40%{ opacity:.8 } 100%{ opacity:0; transform:translateY(-8px) } }
        @keyframes vbStream{ 0%{ transform:translateY(-6px) } 100%{ transform:translateY(6px) } }
        .vb-paused [style*="animation"]{ animation-play-state:paused !important; }
        @media (prefers-reduced-motion: reduce){ .vb-atlas *{ animation:none !important } }
      `}</style>

      <Sidebar live={live} reduce={reduce} paused={paused} setPaused={setPaused} />

      <div className={`flex min-w-0 flex-1 flex-col ${paused ? "vb-paused" : ""}`}>
        <Topbar active={active} reduce={reduce} />
        <div className="flex-1 overflow-y-auto" style={{ background: "radial-gradient(1200px 540px at 100% -8%, rgba(161,98,7,.05), transparent 55%)" }}>
          <div className="mx-auto max-w-[1600px] px-6 py-6">
            {paused && <div className="mb-4 rounded-xl px-4 py-2 text-center text-[12px] font-medium" style={{ background: C.warningSoft, color: C.warning }}>The bar is paused — live widgets are resting. Resume from the sidebar.</div>}

            {/* KPI rail */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">{KPIS.map((k) => <BulletKpi key={k.label} {...k} />)}</div>

            {/* Row 2: Now Pouring (8) | Extraction + Barista's Note (4) */}
            <div className="mt-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8"><NowPouring live={live} reduce={reduce} /></div>
              <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
                <Card className="flex flex-col">
                  <div className="mb-2 flex items-center justify-between"><Eyebrow icon={Coffee}>The Extraction</Eyebrow><LiveChip /></div>
                  <Extraction active={active} live={live} reduce={reduce} />
                  <div className={`${mono} mt-1 text-center text-[11px]`} style={{ color: C.ink3 }}>{active}/{CHANNELS} group heads · {Math.round((active / CHANNELS) * 100)}% load</div>
                </Card>
                {/* Barista's Note */}
                <div className="relative overflow-hidden rounded-2xl p-5" style={{ background: C.surface2, border: `1px solid ${C.line}`, boxShadow: SHADOW }}>
                  <div className="pointer-events-none absolute -right-4 -top-6 size-24 rounded-full border-[6px] opacity-[0.12]" style={{ borderColor: C.caramel }} />
                  <Eyebrow icon={Sparkles}>Barista&apos;s Note</Eyebrow>
                  <p className="mt-2 text-[16px] leading-relaxed" style={{ color: C.coffee, fontFamily: "var(--vb-serif)", fontStyle: "italic" }}>&ldquo;{nextActions[0].detail}&rdquo;</p>
                  <div className="mt-3 flex gap-2">
                    <Link href={nextActions[0].href} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-white" style={{ background: C.coffee }}>{nextActions[0].cta}</Link>
                    <button className="rounded-full px-3 py-1.5 text-[12px] font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink2 }}>Dismiss</button>
                  </div>
                </div>
              </div>
            </div>

            {/* On-the-Bar shelf */}
            <div className="mt-4 rounded-2xl p-4" style={{ ...card, background: C.surface2 }}>
              <div className="mb-2 flex items-center justify-between"><Eyebrow icon={Megaphone}>On the Bar</Eyebrow><Link href="/campaigns" className="text-[12px] font-medium" style={{ color: C.brass }}>View all</Link></div>
              <div className="flex items-end gap-2 overflow-x-auto pb-1">
                {liveCampaigns.map((c) => <CampaignCup key={c.id} name={c.name} pct={c.slotsCap ? c.slotsUsed / c.slotsCap : 0} running={c.status === "running"} live={live} reduce={reduce} />)}
              </div>
              <div className="mt-1 h-[3px] rounded-full" style={{ background: `linear-gradient(90deg,${C.brass},${C.caramelSoft})` }} />
            </div>

            {/* Row 3: Roast Curve (7) | Drip Funnel (5) */}
            <div className="mt-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-7"><RoastCurve /></div>
              <div className="col-span-12 lg:col-span-5"><DripFunnel /></div>
            </div>

            {/* Row 4: Fleet (8) | Drip Feed (4) */}
            <div className="mt-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-8">
                <Card>
                  <div className="mb-3 flex items-center justify-between"><Eyebrow icon={Users}>The Fleet</Eyebrow><span className={`${mono} text-[11px]`} style={{ color: C.ink3 }}>{onCall}/{fleet.length} on call</span></div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{fleet.map((a, i) => <FleetCard key={a.id} a={a} i={i} sec={tick} live={live} reduce={reduce} />)}</div>
                </Card>
              </div>
              <div className="col-span-12 xl:col-span-4"><LiveWire now={now} live={live} /></div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t pt-3 text-[10.5px]" style={{ borderColor: C.line, color: C.ink3 }}>
              <span className="flex items-center gap-1.5"><Coffee className="size-3.5" style={{ color: C.brass }} /> VoiceBrew Atlas · The Pour Line</span>
              <span className={mono}>{active}/{CHANNELS} group heads · {onCall} baristas live · {providers.length} pipelines green</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
