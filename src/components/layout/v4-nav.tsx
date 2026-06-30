"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, Plus, Sun, Moon, ChevronDown } from "lucide-react";
import { nav, navGroups } from "@/config/nav";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { baselineActive } from "@/lib/channel-mock";
import { organization, currentUser } from "@/lib/data";
import { WalletMeter } from "@/components/wallet/wallet-meter";
import { TopbarGuide } from "@/components/setup-guide/topbar-guide";
import { cn } from "@/lib/utils";

const brew = "linear-gradient(135deg,#F5A524,#C2410C 50%,#6D28D9)";
const PRIMARY = ["/dashboard-v2", "/campaigns", "/leads", "/calls", "/analytics"];
const initials = (s: string) => s.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export function V4Nav() {
  const pathname = usePathname();
  const active = useLiveCapacity(baselineActive);
  const [more, setMore] = useState(false);
  const [dark, setDark] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);

  const { scrollY } = useScroll();
  const h = useTransform(scrollY, [0, 80], [68, 56]);
  const blur = useTransform(scrollY, [0, 80], [6, 18]);
  const alpha = useTransform(scrollY, [0, 80], [0.55, 0.82]);

  const primary = nav.filter((n) => PRIMARY.includes(n.href));
  const rest = navGroups.map((g) => ({ ...g, items: nav.filter((n) => n.group === g.key && !PRIMARY.includes(n.href)) })).filter((g) => g.items.length);
  const isActive = (href: string) => pathname === href || (href !== "/dashboard-v2" && pathname.startsWith(href));
  const toggleRoast = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); try { localStorage.setItem("vox-theme", next ? "dark" : "light"); } catch {} };

  return (
    <motion.header ref={ref} style={{ height: h }} className="sticky top-0 z-40">
      <motion.div style={{ backdropFilter: useTransform(blur, (b) => `blur(${b}px)`), backgroundColor: useTransform(alpha, (a) => `color-mix(in srgb, var(--background) ${a * 100}%, transparent)`) }} className="absolute inset-0 border-b border-border" />
      <div className="relative mx-auto flex h-full max-w-[1320px] items-center gap-4 px-5">
        {/* brand */}
        <Link href="/dashboard-v2" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl text-white shadow" style={{ background: brew }}>
            <span className="flex h-3.5 items-end gap-[2px]"><span className="w-[2px] rounded-full bg-white/90" style={{ height: "45%" }} /><span className="v4navbar w-[2px] rounded-full bg-white" /><span className="w-[2px] rounded-full bg-white/80" style={{ height: "65%" }} /></span>
          </span>
          <span className="font-serif text-xl tracking-tight text-foreground">VoiceBrew</span>
        </Link>

        {/* primary nav */}
        <nav className="ml-3 hidden items-center gap-0.5 lg:flex">
          {primary.map((n) => (
            <Link key={n.href} href={n.href} className={cn("relative px-3 py-1.5 text-sm font-medium transition-colors", isActive(n.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {n.label}
              {isActive(n.href) && <motion.span layoutId="v4nav" className="absolute inset-x-2 -bottom-px h-[2px] rounded-full" style={{ background: brew }} />}
            </Link>
          ))}
          {/* More */}
          <div className="relative">
            <button onClick={() => setMore((v) => !v)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">More <ChevronDown className={cn("size-3.5 transition-transform", more && "rotate-180")} /></button>
            {more && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMore(false)} />
                <div className="absolute left-0 z-50 mt-2 grid w-[440px] grid-cols-2 gap-3 rounded-2xl border border-border bg-popover p-4 shadow-card-lg">
                  {rest.map((g) => (
                    <div key={g.key}>
                      <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</div>
                      {g.items.map((it) => { const Icon = it.icon; return (
                        <Link key={it.href} href={it.href} onClick={() => setMore(false)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground hover:bg-accent/60"><Icon className="size-4 text-mocha" /> {it.label}</Link>
                      ); })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* right */}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-[color:var(--color-steam)] sm:flex"><span className="size-1.5 animate-pulse rounded-full bg-[color:var(--color-steam)]" /> {active} live</span>
          <button onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"><Search className="size-4" /><kbd className="hidden rounded bg-secondary px-1 text-[10px] sm:block">⌘K</kbd></button>
          <span className="hidden md:block"><TopbarGuide /></span>
          <Link href="/campaigns/quick" className="hidden items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-white shadow sm:flex" style={{ background: brew }}><Plus className="size-4" /> Brew</Link>
          <WalletMeter collapsed />
          <button onClick={toggleRoast} title="Roast dial" className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
          <button className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
            <span className="grid size-6 place-items-center rounded-full bg-secondary text-[10px] font-semibold text-mocha">{initials(organization.name)}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
          <span className="grid size-9 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#caa06a,#6b4a2c)" }}>{initials(currentUser.full_name)}</span>
        </div>
      </div>
    </motion.header>
  );
}
