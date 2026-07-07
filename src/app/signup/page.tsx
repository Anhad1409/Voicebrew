"use client";

/* /signup — "NEW PATRONS — TABS OPENED DAILY". The flip side of the Morning
   Edition broadsheet: same masthead world, the TAB CARD (3 fields, nothing
   else), magic-bean collapse, voided-line errors. → /welcome. Spec §2. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { VoiceBrewMark } from "@/components/layout/voicebrew-logo";
import { ListeningCup, type CupHandle } from "../login/ListeningCup";
import { Ticker } from "../login/Ticker";
import { RotatingWord } from "../login/RotatingWord";
import { EMAIL_RE } from "../login/pour";
import { setProfile, resetTab } from "@/lib/tab-mock";
import { Beans } from "../login/Beans";

const EASE = [0.22, 1, 0.36, 1] as const;
const inputCls =
  "h-11 w-full rounded-xl border bg-[#fdf8f0] px-3.5 text-[15px] text-[#2a1a0f] outline-none transition-[border-color,box-shadow] duration-150";

export default function SignupPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const cupRef = useRef<CupHandle>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magic, setMagic] = useState(false);          // magic-bean path (password collapsed)
  const [agreed, setAgreed] = useState(false);        // House Rules consent — required
  const [focus, setFocus] = useState<"name" | "email" | "password" | null>(null);
  const [err, setErr] = useState<null | "email" | "taken">(null);
  const [opening, setOpening] = useState(false);
  const [flipIn, setFlipIn] = useState(false);
  const [dateline, setDateline] = useState("");

  useEffect(() => {
    const d = new Date();
    setDateline(`${d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()} · ${d.toLocaleDateString("en-US", { month: "long" }).toUpperCase()} ${d.getDate()} · MUMBAI EDITION`);
    try { if (sessionStorage.getItem("vb-card-flip")) { setFlipIn(true); sessionStorage.removeItem("vb-card-flip"); } } catch {}
  }, []);

  const done = name.trim() && email.trim() && (magic || password.length > 0) && agreed;
  const fill = 0.22 + (name.trim() ? 0.21 : 0) + (EMAIL_RE.test(email) ? 0.21 : 0) + ((magic || password) ? 0.21 : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!done || opening) return;
    if (!EMAIL_RE.test(email.trim())) { setErr("email"); return; }
    if (email.trim().toLowerCase().startsWith("taken@")) { setErr("taken"); return; }
    setErr(null);
    setOpening(true);
    resetTab(); // fresh tab per registration — the wizard always runs
    setProfile({ name: name.trim(), email: email.trim(), agreedTerms: true });
    try { sessionStorage.setItem("vb-tab-open", "1"); } catch {}
    setTimeout(() => router.push("/welcome"), reduce ? 150 : 550);
  };

  const goLogin = () => {
    try { sessionStorage.setItem("vb-card-flip", "1"); } catch {}
    router.push("/login");
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#faf3e4" }}>
      <div className="grid min-h-full lg:grid-cols-[1.15fr_1fr]">
        {/* LEFT — masthead, flip side */}
        <aside className="relative hidden flex-col justify-between lg:flex" style={{ padding: "clamp(2.5rem,5vw,5rem)", background: "radial-gradient(120% 120% at 0% 100%, #eddcbe 0%, #f9f1e2 60%)" }}>
          <Beans />
          <div aria-hidden className="relative">
            <div className="flex items-end justify-between gap-4">
              <span className="flex items-center gap-2">
                <VoiceBrewMark className="size-7 text-coffee" />
                <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6b4423" }}>VoiceBrew · by Blostem</span>
              </span>
              <span className="font-[family-name:var(--font-data)] text-[10px] tracking-[0.14em]" style={{ color: "#6b4423" }}>{dateline}</span>
            </div>
            <div className="mt-3 h-px w-full" style={{ background: "#d8bf9a" }} />
            <div className="mt-8 font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>New patrons — tabs opened daily</div>
            <motion.h1 className="mt-3 font-serif" style={{ fontSize: "clamp(3rem,5.8vw,5.6rem)", lineHeight: 0.98, color: "#2a1a0f" }} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: EASE }}>
              Every account,
              <br />freshly <RotatingWord paused={focus !== null} />
            </motion.h1>
            <div className="relative mt-8 w-[340px] max-w-full">
              {/* blank receipt tucked under the saucer — grows as fields complete */}
              <motion.div
                aria-hidden
                className="absolute -bottom-2 left-1/2 h-16 w-40 -translate-x-1/2 rounded-sm"
                style={{ background: "#fffdf9", border: "1px solid #d8bf9a", zIndex: 0, clipPath: "polygon(0 0,100% 0,100% 92%,95% 100%,90% 92%,85% 100%,80% 92%,75% 100%,70% 92%,65% 100%,60% 92%,55% 100%,50% 92%,45% 100%,40% 92%,35% 100%,30% 92%,25% 100%,20% 92%,15% 100%,10% 92%,5% 100%,0 92%)" }}
                animate={{ y: 8 + (fill - 0.22) * 56 }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              />
              <div className="relative z-10">
                <ListeningCup ref={cupRef} focus={focus === "password" ? "password" : focus ? "email" : null} fill={fill} deaf={focus === "password"} phase="form" errorTick={0} stained={false} />
              </div>
            </div>
          </div>
          <Ticker dimmed={focus !== null} stamp={null} />
        </aside>

        {/* RIGHT — THE TAB CARD */}
        <section className="relative grid min-h-svh place-items-center border-l shadow-[-12px_0_32px_-24px_rgba(42,26,15,0.35)]" style={{ background: "#fffdf9", borderColor: "#d8bf9a" }}>
          <div className="absolute inset-x-0 top-0 flex h-[72px] items-center justify-between border-b px-5 lg:hidden" style={{ borderColor: "#d8bf9a" }}>
            <span className="flex items-center gap-2">
              <VoiceBrewMark className="size-8 text-coffee" />
              <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6b4423" }}>VoiceBrew · by Blostem</span>
            </span>
            <span className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.12em]" style={{ color: "#b8763d" }}>Tabs opened daily</span>
          </div>

          <motion.div
            className="w-full max-w-[400px] px-8 py-24 lg:py-12"
            initial={flipIn && !reduce ? { rotateY: -90, opacity: 0.6 } : { opacity: 0, y: 10 }}
            animate={{ rotateY: 0, opacity: 1, y: 0 }}
            transition={{ duration: flipIn ? 0.22 : 0.4, ease: "easeOut" }}
            style={{ transformPerspective: 1200 }}
          >
            <header className="mb-8">
              <h2 className="font-serif text-[28px] leading-tight" style={{ color: "#2a1a0f" }}>Open a tab</h2>
              <p className="mt-1.5 text-sm" style={{ color: "#6b4423" }}>50 sips on the house — no card, no clock.</p>
            </header>

            <form onSubmit={submit} noValidate className="space-y-5">
              <div>
                <label htmlFor="su-name" className="mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>Name on the tab</label>
                <input id="su-name" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocus("name")} onBlur={() => setFocus(null)}
                  onKeyDown={() => cupRef.current?.spike(name.length % 24)}
                  className={inputCls}
                  style={{ borderColor: focus === "name" ? "#b8763d" : "#eadbc8", boxShadow: focus === "name" ? "0 0 0 3px rgba(184,118,61,0.35)" : undefined, caretColor: "#b8763d" }} />
              </div>

              <div>
                <label htmlFor="su-email" className="mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>Work email</label>
                <input id="su-email" type="email" autoComplete="email" inputMode="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
                  onKeyDown={() => cupRef.current?.spike(email.length % 24)}
                  className={inputCls}
                  style={{ borderColor: err ? "#a5432c" : focus === "email" ? "#b8763d" : "#eadbc8", boxShadow: focus === "email" ? "0 0 0 3px rgba(184,118,61,0.35)" : undefined, caretColor: "#b8763d" }} />
                {focus === "email" && !err && <p className="mt-1.5 font-[family-name:var(--font-data)] text-[10px]" style={{ color: "#a3906e" }}>we&apos;ll save your seat here</p>}
                {err && (
                  <p role="alert" className="mt-1.5 font-[family-name:var(--font-data)] text-[11px]" style={{ color: "#a5432c" }}>
                    {err === "email" ? "✗ EMAIL ......... VOID — CHECK THE SPELLING" : "✗ THAT SEAT'S TAKEN ...... BACK TO THE COUNTER?"}
                  </p>
                )}
              </div>

              <AnimatePresence initial={false}>
                {!magic && (
                  <motion.div key="pw" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: EASE }} className="overflow-hidden">
                    <label htmlFor="su-pass" className="mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>Password</label>
                    <input id="su-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}
                      className={inputCls}
                      style={{ borderColor: focus === "password" ? "#b8763d" : "#eadbc8", boxShadow: focus === "password" ? "0 0 0 3px rgba(184,118,61,0.35)" : undefined, caretColor: "#b8763d" }} />
                  </motion.div>
                )}
              </AnimatePresence>
              <button type="button" onClick={() => setMagic((v) => !v)} className="-mt-2 block text-[13px] underline-offset-4 hover:underline" style={{ color: "#6b4423" }}>
                {magic ? "I'll keep a key" : <>or skip it — take a magic bean <span style={{ color: "#4fb0a5" }}>✳</span> link instead</>}
              </button>

              <motion.button
                type="submit"
                aria-disabled={!done}
                className="h-12 w-full rounded-xl font-serif text-[17px] font-semibold transition-colors"
                style={{ background: done ? "#2a1a0f" : "#e6d5b8", color: done ? "#fdf8f0" : "#a3906e", cursor: done ? "pointer" : "not-allowed", boxShadow: done ? "0 6px 18px -6px rgba(42,26,15,0.5)" : undefined }}
                whileTap={done ? { scale: 0.98 } : undefined}
              >
                {opening ? "Opening…" : magic ? "Plant the bean ✳" : "Open my tab"}
              </motion.button>

              <label className="flex cursor-pointer items-start gap-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreed}
                  onClick={() => setAgreed((v) => !v)}
                  className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] border-2 transition-colors"
                  style={{ borderColor: agreed ? "#b8763d" : "#c9a87c", background: agreed ? "#b8763d" : "#fffdf9" }}
                >
                  {agreed && (
                    <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5 L4.8 9 L10 3" fill="none" stroke="#fffdf9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </button>
                <span onClick={() => setAgreed((v) => !v)} className="text-[12px] leading-relaxed" style={{ color: "#6b4423" }}>
                  I agree to the{" "}
                  <a className="font-medium underline underline-offset-2" style={{ color: "#b8763d" }} href="/terms" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>
                    House Rules — Terms &amp; Acceptable Use
                  </a>
                  : business calling only, no prank or nuisance calls, no spoofing, and I&apos;m responsible for consent &amp; DND compliance on every number I dial.
                </span>
              </label>
            </form>

            <p className="mt-8 text-center text-[13px]" style={{ color: "#6b4423" }}>
              Already have a tab?{" "}
              <button onClick={goLogin} className="font-medium underline-offset-4 hover:underline" style={{ color: "#b8763d" }}>Back to the counter →</button>
            </p>
          </motion.div>

          <span className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-[family-name:var(--font-data)] text-[10px]" style={{ color: "#c9a87c" }}>
            brewed with care · v6
          </span>
        </section>
      </div>
    </div>
  );
}
