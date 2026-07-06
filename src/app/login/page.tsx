"use client";

/* /login — "THE MORNING EDITION — Now Serving". Spec: LOGIN-DESIGN-SPEC.md.
   Living café broadsheet + jewel form + THE LISTENING CUP. Submit → THE POUR
   → porcelain wipe → /dashboard. Mock auth: everything succeeds except error@… */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { VoiceBrewMark } from "@/components/layout/voicebrew-logo";
import { ListeningCup, type CupHandle } from "./ListeningCup";
import { Ticker, type Stamp } from "./Ticker";
import { RotatingWord } from "./RotatingWord";
import { MagicFace } from "./MagicFlip";
import { POUR, EMAIL_RE } from "./pour";

const EASE = [0.22, 1, 0.36, 1] as const;
const inputBase =
  "peer h-11 w-full rounded-xl border bg-[#fdf8f0] px-3.5 text-[15px] text-[#2a1a0f] outline-none transition-[border-color,box-shadow] duration-150";

type Phase = "form" | "brewing" | "pouring" | "error";

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  // ---- state (spec §12) ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focus, setFocus] = useState<"email" | "password" | null>(null);
  const [emailValid, setEmailValid] = useState(false);
  const [emailFmtErr, setEmailFmtErr] = useState(false);
  const [remember, setRemember] = useState(false);
  const [lidOff, setLidOff] = useState(false);
  const [caps, setCaps] = useState(false);
  const [face, setFace] = useState<"signin" | "magic">("signin");
  const [phase, setPhase] = useState<Phase>("form");
  const [authErr, setAuthErr] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const [stained, setStained] = useState(false);
  const [stamp, setStamp] = useState<Stamp>(null);
  const [pulseTick, setPulseTick] = useState(0);
  const [pulseTarget, setPulseTarget] = useState<"email" | "password" | null>(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [subline, setSubline] = useState("Sign in to the roastery");
  const [dateline, setDateline] = useState("");
  const [skipStagger, setSkipStagger] = useState(false);
  // pour beats
  const [glide, setGlide] = useState<{ x: number; y: number } | null>(null);
  const [streamOn, setStreamOn] = useState(false);
  const [counterOn, setCounterOn] = useState(false);
  const [ringOn, setRingOn] = useState(false);

  const cupRef = useRef<CupHandle>(null);
  const cupWrapRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const pourStart = useRef(0);
  const prefetched = useRef(false);
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wiped = useRef(false);

  const t = (ms: number, fn: () => void) => timeouts.current.push(setTimeout(fn, ms));
  const clearAll = () => { timeouts.current.forEach(clearTimeout); timeouts.current = []; };

  // ---- mount: dateline, greeting, warm email, back-nav stagger skip ----
  useEffect(() => {
    const d = new Date();
    const wd = d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    const mo = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
    setDateline(`${wd} · ${mo} ${d.getDate()} · MUMBAI EDITION`);
    const h = d.getHours();
    let g = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    try {
      if (sessionStorage.getItem("vb-poured")) setSkipStagger(true);
      const warm = localStorage.getItem("vb-warm-email");
      if (warm) {
        setEmail(warm);
        setRemember(true);
        if (EMAIL_RE.test(warm)) setEmailValid(true);
        g = "Welcome back";
        setSubline("Your usual, coming right up.");
      }
    } catch {}
    setGreeting(g);
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived ----
  const deaf = focus === "password";
  const fill =
    phase === "pouring" ? 1 : password.length > 0 ? 0.85 : emailValid ? 0.55 : 0.22;
  const canSubmit = email.trim().length > 0 && password.length > 0;
  const localpart = email.split("@")[0] || "you";
  const cinematic = phase === "brewing" || phase === "pouring";

  // ---- email interactions ----
  const onEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === "Backspace") cupRef.current?.spike((email.length + 1) % 24);
  };
  const onEmailBlur = () => {
    setFocus(null);
    const v = email.trim();
    if (!v) return;
    if (EMAIL_RE.test(v)) {
      setEmailFmtErr(false);
      if (!emailValid) {
        setEmailValid(true);
        cupRef.current?.ping();
        if (!prefetched.current) { prefetched.current = true; router.prefetch("/dashboard"); }
        // ticker stamp for 2s
        if (stampTimer.current) clearTimeout(stampTimer.current);
        setStamp({ kind: "order", text: `ORDER RECEIVED · ${v.split("@")[0]}@…` });
        stampTimer.current = setTimeout(() => setStamp(null), 2000);
      }
    } else {
      setEmailValid(false);
      setEmailFmtErr(true);
    }
  };

  // ---- password caps detection ----
  const onPassKey = (e: React.KeyboardEvent) => {
    try { setCaps(e.getModifierState("CapsLock")); } catch {}
  };

  // ---- THE POUR ----
  const runWipe = useCallback((fast: boolean) => {
    if (wiped.current) return;
    wiped.current = true;
    clearAll();
    const rect = cupWrapRef.current?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const el = document.createElement("div");
    const dur = fast ? 200 : 450;
    el.style.cssText = `position:fixed;left:${cx - 60}px;top:${cy - 60}px;width:120px;height:120px;border-radius:50%;background:#fffdf9;transform:scale(0);z-index:2147483000;pointer-events:none;transition:transform ${dur}ms ease-in-out;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = "scale(40)"; }));
    setTimeout(() => {
      try { sessionStorage.setItem("vb-poured", "1"); } catch {}
      router.push("/dashboard");
    }, fast ? 180 : 400);
    setTimeout(() => { el.style.transition = "opacity 250ms ease-out"; el.style.opacity = "0"; }, fast ? 420 : 700);
    setTimeout(() => el.remove(), fast ? 750 : 1000);
  }, [router]);

  const fail = useCallback(() => {
    clearAll();
    setPhase("error");
    setAuthErr(true);
    setErrorTick((n) => n + 1);
    setStained(true);
  }, []);

  const startPour = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== "form" && phase !== "error") return;
    if (!canSubmit) {
      setPulseTarget(email.trim() ? "password" : "email");
      setPulseTick((n) => n + 1);
      (email.trim() ? passRef : emailRef).current?.focus();
      return;
    }
    setAuthErr(false);
    setFocus(null);
    try { if (remember) localStorage.setItem("vb-warm-email", email.trim()); else localStorage.removeItem("vb-warm-email"); } catch {}
    setPhase("brewing");
    pourStart.current = performance.now();
    const isErr = email.trim().toLowerCase().startsWith("error@");
    if (isErr) { t(POUR.MOCK_LATENCY, fail); return; }
    if (reduce) { t(250, () => runWipe(true)); return; }
    t(POUR.GLIDE, () => {
      setPhase("pouring");
      const rect = cupWrapRef.current?.getBoundingClientRect();
      if (rect) {
        setGlide({
          x: window.innerWidth / 2 - (rect.left + rect.width / 2),
          y: window.innerHeight / 2 - (rect.top + rect.height / 2),
        });
      }
    });
    t(POUR.STREAM, () => { setStreamOn(true); setCounterOn(true); cupRef.current?.wave(); });
    t(POUR.STEAM, () => {
      setStamp({ kind: "final", text: `NOW SERVING · №073 — ${localpart}@…` });
      cupRef.current?.ping();
    });
    t(POUR.RING, () => setRingOn(true));
    t(POUR.WIPE, () => runWipe(false));
  };

  // skip cinematic: any key/click after 300ms jumps to the wipe
  useEffect(() => {
    if (!cinematic || reduce) return;
    const skip = () => {
      if (performance.now() - pourStart.current > POUR.SKIP_AFTER) runWipe(false);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => { window.removeEventListener("keydown", skip); window.removeEventListener("pointerdown", skip); };
  }, [cinematic, reduce, runWipe]);

  // ---- entrance ----
  const rows = {
    hidden: skipStagger ? {} : { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    exit: { opacity: 0, y: 12, transition: { duration: 0.3 } },
  };
  const stack = { hidden: {}, show: { transition: { staggerChildren: skipStagger || reduce ? 0 : 0.06 } } };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" style={{ background: "#fdf8f0" }}>
      <div className="grid min-h-full lg:grid-cols-[1.15fr_1fr]">
        {/* ============ LEFT — THE MASTHEAD ============ */}
        <motion.aside
          className="relative hidden flex-col justify-between lg:flex"
          style={{
            padding: "clamp(2.5rem,5vw,5rem)",
            background: "radial-gradient(120% 120% at 0% 100%, #f4e9d8 0%, #fdf8f0 55%)",
          }}
          animate={{ opacity: phase === "pouring" ? 0.25 : 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* latte contour texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='480' viewBox='0 0 480 480' fill='none'%3E%3Cg stroke='%23eadbc8' stroke-width='1'%3E%3Ccircle cx='240' cy='240' r='60'/%3E%3Ccircle cx='240' cy='240' r='110'/%3E%3Ccircle cx='240' cy='240' r='160'/%3E%3Ccircle cx='240' cy='240' r='210'/%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "480px",
            }}
          />
          <div aria-hidden className="relative">
            {/* masthead row */}
            <div className="flex items-end justify-between gap-4">
              <span className="flex items-center gap-2">
                <VoiceBrewMark className="size-7 text-coffee" />
                <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6b4423" }}>
                  VoiceBrew · by Blostem
                </span>
              </span>
              <span className="font-[family-name:var(--font-data)] text-[10px] tracking-[0.14em]" style={{ color: "#6b4423" }}>
                {dateline}
              </span>
            </div>
            <div className="mt-3 h-px w-full" style={{ background: "#eadbc8" }} />

            {/* headline */}
            <h1
              className="mt-10 font-serif"
              style={{ fontSize: "clamp(3.25rem,6.5vw,6.5rem)", lineHeight: 0.98, color: "#2a1a0f" }}
            >
              Voice, freshly
              <br />
              <RotatingWord paused={focus !== null || cinematic} />
            </h1>

            {/* THE LISTENING CUP + glide/pour overlays */}
            <motion.div
              ref={cupWrapRef}
              className="relative mt-8 w-[340px] max-w-full"
              animate={glide ? { x: glide.x, y: glide.y, scale: 1.3 } : { x: 0, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              style={{ zIndex: 5 }}
            >
              {/* pour stream */}
              <AnimatePresence>
                {streamOn && (
                  <motion.div
                    key="stream"
                    className="absolute left-1/2 z-10 -ml-[3px] w-[6px] rounded-full"
                    style={{ top: -66, background: "#b8763d", transformOrigin: "top" }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 150, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeIn" }}
                  />
                )}
              </AnimatePresence>
              {/* the cup speaks — one teal ring */}
              {ringOn && (
                <motion.div
                  className="pointer-events-none absolute left-1/2 top-1/2 rounded-full border-2"
                  style={{ borderColor: "#4fb0a5", width: 80, height: 80, marginLeft: -40, marginTop: -40 }}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 5.5, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}
              <ListeningCup
                ref={cupRef}
                focus={focus}
                fill={fill}
                deaf={deaf}
                phase={phase}
                errorTick={errorTick}
                stained={stained}
              />
              {/* deaf caption / pour counter */}
              <div className="mt-1 h-[18px] text-center font-[family-name:var(--font-data)] text-[11px]" style={{ color: "#6b4423" }}>
                <AnimatePresence mode="wait">
                  {deaf ? (
                    <motion.span key="deaf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.3 }}>
                      not listening, promise.
                    </motion.span>
                  ) : counterOn ? (
                    <motion.span key="counter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[13px]">
                      <NumberFlow value={counterOn ? 4812 : 0} /> calls already served today
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* NOW SERVING ticker */}
          <div className="relative">
            <Ticker dimmed={focus !== null} stamp={stamp} />
          </div>
        </motion.aside>

        {/* ============ RIGHT — THE JEWEL PANEL ============ */}
        <motion.section
          className="relative grid min-h-svh place-items-center border-l"
          style={{ background: "#fffdf9", borderColor: "#eadbc8" }}
          animate={phase === "pouring" ? { x: "40%", opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {/* compact masthead (mobile) */}
          <div className="absolute inset-x-0 top-0 flex h-[72px] items-center justify-between border-b px-5 lg:hidden" style={{ borderColor: "#eadbc8" }}>
            <span className="flex items-center gap-2">
              <VoiceBrewMark className="size-8 text-coffee" />
              <span className="font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.2em]" style={{ color: "#6b4423" }}>
                VoiceBrew · by Blostem
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-data)] text-[10px]" style={{ color: "#4fb0a5" }}>
              <span className="size-1.5 animate-pulse rounded-full" style={{ background: "#4fb0a5" }} /> NOW SERVING
            </span>
          </div>

          <div className="w-full max-w-[400px] px-8 py-24 lg:py-12" style={{ perspective: 1200 }}>
            <motion.div
              className="relative"
              animate={{ rotateY: face === "magic" && !reduce ? 180 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* ---------- FACE A: SIGN IN ---------- */}
              <motion.div
                style={{ backfaceVisibility: "hidden", pointerEvents: face === "signin" ? "auto" : "none" }}
                animate={reduce ? { opacity: face === "signin" ? 1 : 0 } : {}}
              >
                <motion.form
                  variants={stack}
                  initial={skipStagger ? false : "hidden"}
                  animate="show"
                  onSubmit={startPour}
                  noValidate
                  // shake on auth error
                  key={`form`}
                >
                  <motion.div
                    animate={authErr && !reduce ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.32 }}
                    key={errorTick}
                    className="space-y-5"
                  >
                    {/* header (+ tiny cup on mobile) */}
                    <motion.header variants={rows} className="mb-8 flex items-end gap-4">
                      <div className="lg:hidden">
                        <ListeningCup
                          focus={focus} fill={fill} deaf={deaf} phase={phase}
                          errorTick={errorTick} stained={stained} width={96}
                        />
                      </div>
                      <div>
                        <h2 className="font-serif text-[28px] leading-tight" style={{ color: "#2a1a0f" }}>{greeting}</h2>
                        <p className="mt-1.5 text-sm" style={{ color: "#6b4423" }}>{subline}</p>
                      </div>
                    </motion.header>

                    {/* EMAIL */}
                    <motion.div variants={rows} className="relative">
                      <label htmlFor="vb-email" className="mb-1.5 block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>
                        Work email
                      </label>
                      <motion.div
                        key={`ep-${pulseTick}`}
                        animate={pulseTick > 0 && pulseTarget === "email" ? { boxShadow: ["0 0 0 0px rgba(184,118,61,0)", "0 0 0 3px rgba(184,118,61,0.45)", "0 0 0 0px rgba(184,118,61,0)"] } : {}}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-xl"
                      >
                        <input
                          ref={emailRef}
                          id="vb-email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          value={email}
                          disabled={cinematic}
                          onChange={(e) => { setEmail(e.target.value); setEmailFmtErr(false); }}
                          onFocus={() => setFocus("email")}
                          onBlur={onEmailBlur}
                          onKeyDown={onEmailKeyDown}
                          className={inputBase}
                          style={{
                            borderColor: emailFmtErr || (authErr && phase === "error") ? "#a5432c" : focus === "email" ? "#b8763d" : "#eadbc8",
                            boxShadow: focus === "email" ? "0 0 0 3px rgba(184,118,61,0.35)" : undefined,
                            caretColor: "#b8763d",
                          }}
                        />
                        {/* valid checkmark draws itself */}
                        <AnimatePresence>
                          {emailValid && (
                            <motion.svg
                              key="check" width="20" height="20" viewBox="0 0 20 20"
                              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            >
                              <motion.path
                                d="M4 10.5 L8.5 15 L16 5.5"
                                fill="none" stroke="#4fb0a5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ duration: reduce ? 0 : 0.3, ease: "easeOut" }}
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      {emailFmtErr && (
                        <p className="mt-1.5 text-[12px]" style={{ color: "#a5432c" }}>
                          That doesn&apos;t look like an email — one more look?
                        </p>
                      )}
                      {authErr && phase === "error" && (
                        <p role="alert" className="mt-1.5 text-[13px]" style={{ color: "#a5432c" }}>
                          That blend didn&apos;t match — try again.
                        </p>
                      )}
                    </motion.div>

                    {/* PASSWORD */}
                    <motion.div variants={rows} className="relative">
                      <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="vb-pass" className="block font-[family-name:var(--font-data)] text-[11px] uppercase tracking-[0.14em]" style={{ color: "#6b4423" }}>
                          Password
                        </label>
                        <AnimatePresence>
                          {caps && focus === "password" && (
                            <motion.span
                              initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="rounded-full border px-2 py-0.5 font-[family-name:var(--font-data)] text-[10px]"
                              style={{ color: "#b8763d", background: "#f4e9d8", borderColor: "#eadbc8" }}
                            >
                              CAPS ON
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        key={`pp-${pulseTick}`}
                        animate={pulseTick > 0 && pulseTarget === "password" ? { boxShadow: ["0 0 0 0px rgba(184,118,61,0)", "0 0 0 3px rgba(184,118,61,0.45)", "0 0 0 0px rgba(184,118,61,0)"] } : {}}
                        transition={{ duration: 0.3 }}
                        className="relative rounded-xl"
                      >
                        <input
                          ref={passRef}
                          id="vb-pass"
                          type={lidOff ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          disabled={cinematic}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocus("password")}
                          onBlur={() => { setFocus(null); setCaps(false); }}
                          onKeyDown={onPassKey}
                          onKeyUp={onPassKey}
                          className={inputBase}
                          style={{
                            borderColor: focus === "password" ? "#b8763d" : "#eadbc8",
                            boxShadow: focus === "password" ? "0 0 0 3px rgba(184,118,61,0.35)" : undefined,
                            caretColor: "#b8763d",
                            paddingRight: 44,
                          }}
                        />
                        {/* lid on / lid off */}
                        <button
                          type="button"
                          aria-label={lidOff ? "Hide password" : "Show password"}
                          aria-pressed={lidOff}
                          title="take the lid off"
                          onClick={() => { setLidOff((v) => !v); cupRef.current?.ping(); }}
                          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg transition-colors hover:bg-[#f4e9d8]"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <motion.g
                              animate={{ rotateX: lidOff ? 180 : 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              style={{ transformOrigin: "10px 8px" }}
                            >
                              <path d="M4 7.5 h12 a1.6 1.6 0 0 0 -1.6 -2 h-8.8 a1.6 1.6 0 0 0 -1.6 2 Z" fill="#b8763d" opacity={lidOff ? 0.35 : 1} />
                            </motion.g>
                            <path d="M5 9 h10 l-1.4 6.2 a1.8 1.8 0 0 1 -1.8 1.3 h-3.6 a1.8 1.8 0 0 1 -1.8 -1.3 Z" fill="none" stroke="#6b4423" strokeWidth="1.4" />
                            <path d="M15 10.5 q3 .6 2 3 q-.8 1.8 -3 1.4" fill="none" stroke="#6b4423" strokeWidth="1.2" />
                          </svg>
                        </button>
                        {lidOff && (
                          <span className="pointer-events-none absolute -bottom-4 right-1 font-[family-name:var(--font-data)] text-[10px]" style={{ color: "#c9a87c" }}>
                            lid off
                          </span>
                        )}
                      </motion.div>
                    </motion.div>

                    {/* remember + forgot */}
                    <motion.div variants={rows} className="mt-1 flex items-center justify-between">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={remember}
                        onClick={() => setRemember((v) => !v)}
                        className="flex items-center gap-2.5"
                      >
                        <span
                          className="relative h-[22px] w-10 rounded-full transition-colors duration-200"
                          style={{ background: remember ? "#b8763d" : "#f4e9d8", border: "1px solid #eadbc8" }}
                        >
                          <motion.span
                            className="absolute top-[1px] grid size-[18px] place-items-center rounded-full"
                            animate={{ left: remember ? 19 : 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <svg width="18" height="18" viewBox="0 0 18 18">
                              <path d="M4.5 6 h8 l-1 6.5 a1.5 1.5 0 0 1 -1.5 1.2 h-3 a1.5 1.5 0 0 1 -1.5 -1.2 Z" fill="#fffdf9" stroke="#6b4423" strokeWidth="1.1" />
                              <path d="M12.5 7.5 q2 .5 1.4 2.2 q-.5 1.4 -2.2 1" fill="none" stroke="#6b4423" strokeWidth="0.9" />
                            </svg>
                            <AnimatePresence>
                              {remember && !reduce && (
                                <motion.span
                                  key="steam"
                                  className="absolute -top-2 left-1/2 h-2.5 w-[2.5px] rounded-full"
                                  style={{ background: "#c9a87c" }}
                                  initial={{ opacity: 0, y: 3 }}
                                  animate={{ opacity: [0, 1, 0], y: -4 }}
                                  transition={{ duration: 0.4 }}
                                />
                              )}
                            </AnimatePresence>
                          </motion.span>
                        </span>
                        <span className="text-[13px]" style={{ color: "#6b4423" }}>Keep my cup warm</span>
                      </button>
                      <button type="button" onClick={() => setFace("magic")} className="text-[13px] underline-offset-4 hover:underline" style={{ color: "#6b4423" }}>
                        Forgot password?
                      </button>
                    </motion.div>

                    {/* SUBMIT — Start the pour */}
                    <motion.div variants={rows}>
                      <motion.button
                        type="submit"
                        aria-disabled={!canSubmit}
                        layout
                        className="group relative mx-auto block h-12 overflow-hidden rounded-xl font-serif text-[17px] font-semibold"
                        style={{
                          width: phase === "brewing" || phase === "pouring" ? 56 : "100%",
                          borderRadius: cinematic ? 999 : 12,
                          background: canSubmit || cinematic ? "#b8763d" : "#eadbc8",
                          color: canSubmit || cinematic ? "#fffdf9" : "#c9a87c",
                          cursor: canSubmit ? "pointer" : "not-allowed",
                          transition: "width .3s cubic-bezier(0.22,1,0.36,1), border-radius .3s",
                        }}
                        whileTap={canSubmit ? { scale: 0.98 } : undefined}
                      >
                        {/* hover liquid layer */}
                        {canSubmit && !cinematic && (
                          <span
                            className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                            style={{ background: "#6b4423" }}
                          />
                        )}
                        <span className="relative flex items-center justify-center gap-2">
                          <AnimatePresence mode="wait" initial={false}>
                            {cinematic ? (
                              <motion.span key="brewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="inline-block h-[6px] w-[4.5px] rounded-full"
                                    style={{ background: "#fffdf9" }}
                                    animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 0.72, repeat: Infinity, delay: i * 0.12 }}
                                  />
                                ))}
                              </motion.span>
                            ) : (
                              <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                                {reduce && cinematic ? "Signing you in…" : "Start the pour"}
                                <svg width="14" height="14" viewBox="0 0 14 14" className="transition-transform duration-200 group-hover:rotate-[15deg]">
                                  <path d="M2 7 h7 M9 7 l-3 -3 M9 7 l-3 3 M11 3 v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                                </svg>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      </motion.button>
                    </motion.div>

                    {/* divider */}
                    <motion.div variants={rows} className="flex items-center gap-3" style={{ margin: "20px 0" }}>
                      <span className="h-px flex-1" style={{ background: "#eadbc8" }} />
                      <span className="font-[family-name:var(--font-data)] text-[10px] uppercase tracking-[0.2em]" style={{ color: "#6b4423" }}>or</span>
                      <span className="h-px flex-1" style={{ background: "#eadbc8" }} />
                    </motion.div>

                    {/* Google */}
                    <motion.div variants={rows}>
                      <motion.button
                        type="button"
                        onClick={() => { if (phase === "form" || phase === "error") { setEmail(email || "you@company.com"); setPassword(password || "·"); setTimeout(() => startPour(), 0); } }}
                        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border text-[14px] transition-colors"
                        style={{ background: "#fffdf9", borderColor: "#eadbc8", color: "#2a1a0f" }}
                        whileHover={reduce ? undefined : { y: -1, boxShadow: "0 2px 8px rgba(42,26,15,0.06)", backgroundColor: "#fdf8f0" }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
                          <path d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </motion.button>
                    </motion.div>

                    {/* magic link */}
                    <motion.div variants={rows} className="text-center">
                      <button type="button" onClick={() => setFace("magic")} className="text-[13px] underline-offset-4 hover:underline" style={{ color: "#6b4423" }}>
                        or get a magic bean <span style={{ color: "#4fb0a5" }}>✳</span> link
                      </button>
                    </motion.div>
                  </motion.div>
                </motion.form>
              </motion.div>

              {/* ---------- FACE B: MAGIC LINK ---------- */}
              <motion.div
                className="absolute inset-0"
                style={{
                  backfaceVisibility: "hidden",
                  transform: reduce ? undefined : "rotateY(180deg)",
                  pointerEvents: face === "magic" ? "auto" : "none",
                }}
                animate={reduce ? { opacity: face === "magic" ? 1 : 0 } : {}}
              >
                {face === "magic" && <MagicFace initialEmail={email} onBack={() => setFace("signin")} />}
              </motion.div>
            </motion.div>
          </div>

          {/* footer */}
          <span className="pointer-events-none absolute bottom-4 left-0 right-0 text-center font-[family-name:var(--font-data)] text-[10px]" style={{ color: "#c9a87c" }}>
            brewed with care · v6
          </span>
        </motion.section>
      </div>
    </div>
  );
}
