"use client";

/* /login/v2 — the flagship sign-in. Split hero: left tells the story
   (animated brand mark, a live agent call speaking every language, trust
   facts); right is a clean, layout-stable auth card. The quirk survives in
   a form anyone can read: an equalizer that LISTENS while you type your
   email and goes visibly MUTED on the password. Plain CTAs carry meaning;
   the café carries the feeling. Mock auth: everything succeeds except error@… */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MicOff, ShieldCheck, Languages, Clock3, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-mark";
import { useLiveCapacity } from "@/lib/use-live-capacity";
import { CHANNELS, baselineActive } from "@/lib/channel-mock";
import { EMAIL_RE } from "../pour";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const mono = "font-[family-name:var(--font-data)]";
const inputCls =
  "h-12 w-full rounded-xl border border-foam bg-cream px-3.5 text-[15px] text-coffee outline-none transition-[border-color,box-shadow] duration-150 focus:border-caramel focus:shadow-[0_0_0_3px_rgba(184,118,61,0.22)]";
const labelCls = `${mono} mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-mocha`;

/* the live call — one agent line per language, typed out on loop */
const CALL_LINES: [string, string][] = [
  ["Hinglish", "Namaste! Aapki EMI kal due hai — main madad ke liye yahan hoon."],
  ["English", "Hello! Your KYC is pending — it takes two minutes, shall we do it now?"],
  ["Hindi", "नमस्ते! आपकी किश्त कल देय है — मैं मदद के लिए यहाँ हूँ।"],
  ["Tamil", "Vanakkam! Ungal EMI naalai due aagum — naan udhavalaam."],
  ["Marathi", "Namaskar! Tumchi EMI udya due aahe — mi madat karto."],
];

function LiveCallCard() {
  const reduce = useReducedMotion();
  const [li, setLi] = useState(0);
  const [chars, setChars] = useState(0);
  useEffect(() => {
    if (reduce) { setChars(CALL_LINES[0][1].length); return; }
    const id = setInterval(() => {
      setChars((c) => {
        if (c < CALL_LINES[li][1].length) return c + 1;
        return c; // hold; advance handled below
      });
    }, 38);
    return () => clearInterval(id);
  }, [li, reduce]);
  useEffect(() => {
    if (reduce) return;
    if (chars >= CALL_LINES[li][1].length) {
      const t = setTimeout(() => { setLi((v) => (v + 1) % CALL_LINES.length); setChars(0); }, 1600);
      return () => clearTimeout(t);
    }
  }, [chars, li, reduce]);
  const speaking = chars < CALL_LINES[li][1].length;
  return (
    <div className="rounded-2xl border border-foam bg-porcelain/90 p-4 shadow-glass backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-steam" />
          </span>
          <span className={`${mono} text-[10px] uppercase tracking-[0.14em] text-mocha`}>Live — a VoiceBrew agent on a call</span>
        </div>
        <span className={`${mono} text-[10px] uppercase tracking-[0.1em] text-latte`}>sample</span>
      </div>
      {/* language chips — the speaking one lights up */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CALL_LINES.map(([lang], i) => (
          <span key={lang} className={cn(`${mono} rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide transition-colors duration-300`,
            i === li ? "border-caramel bg-brand text-brand-foreground" : "border-foam bg-cream text-latte")}>
            {lang}
          </span>
        ))}
      </div>
      {/* the spoken line */}
      <div className="mt-3 min-h-[64px] rounded-xl bg-oat/50 px-3.5 py-2.5">
        <p className="text-[13.5px] leading-relaxed text-coffee">
          {CALL_LINES[li][1].slice(0, chars)}
          {speaking && !reduce && <span className="ml-0.5 inline-block h-[13px] w-[2px] animate-pulse bg-caramel align-middle" />}
        </p>
      </div>
      {/* speaking waveform — fixed height, transform-only animation */}
      <div className="mt-3 flex h-6 items-center gap-[3px]">
        {Array.from({ length: 32 }).map((_, i) => (
          <span key={i} className="w-[3px] flex-1 rounded-full"
            style={{
              background: i % 4 === 0 ? "var(--color-steam)" : "var(--color-caramel)",
              height: "100%", transformOrigin: "center", opacity: 0.8,
              animation: reduce || !speaking ? undefined : `v2eq ${620 + (i % 5) * 120}ms ease-in-out ${(i % 7) * 70}ms infinite`,
              transform: speaking ? undefined : "scaleY(0.2)", transition: "transform .4s",
            }} />
        ))}
        <style>{`@keyframes v2eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
      </div>
    </div>
  );
}

/* the listening strip under the email field — the quirk, made legible */
function ListenStrip({ email, mode }: { email: string; mode: "idle" | "listening" | "muted" }) {
  const reduce = useReducedMotion();
  const bars = useMemo(
    () => Array.from({ length: 26 }, (_, i) =>
      email ? 8 + ((email.charCodeAt(i % Math.max(1, email.length)) * (i + 3)) % 20) : 6),
    [email]
  );
  return (
    <div className="mt-2 flex h-9 items-center gap-3 rounded-xl border border-foam bg-oat/40 px-3">
      <div className="flex h-5 flex-1 items-end gap-[3px]">
        {bars.map((h, i) => (
          <motion.span key={i} className="w-[3px] flex-1 rounded-full"
            style={{ background: i % 5 === 0 ? "var(--color-steam)" : "var(--color-caramel)" }}
            animate={{ height: mode === "muted" ? 3 : mode === "listening" ? h : 5, opacity: mode === "muted" ? 0.3 : 0.85 }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22 }} />
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {mode === "muted" ? (
          <motion.span key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${mono} flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-mocha`}>
            <MicOff className="size-3 text-danger" /> muted — passwords are never heard
          </motion.span>
        ) : (
          <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`${mono} shrink-0 text-[10px] uppercase tracking-[0.1em] text-latte`}>
            {mode === "listening" ? "listening…" : "the counter is quiet"}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginV2Page() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const active = useLiveCapacity(baselineActive);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focus, setFocus] = useState<"email" | "password" | null>(null);
  const [err, setErr] = useState<null | "email" | "auth">(null);
  const [busy, setBusy] = useState(false);
  const wiped = useRef(false);

  const canSubmit = email.trim().length > 0 && password.length > 0;
  const mode: "idle" | "listening" | "muted" =
    focus === "password" ? "muted" : focus === "email" && email ? "listening" : "idle";

  const runWipe = useCallback(() => {
    if (wiped.current) return;
    wiped.current = true;
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;left:50%;top:50%;width:120px;height:120px;margin:-60px;border-radius:50%;background:#fffdf9;transform:scale(0);z-index:2147483000;pointer-events:none;transition:transform ${reduce ? 200 : 450}ms ease-in-out;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = "scale(40)"; }));
    setTimeout(() => { try { sessionStorage.setItem("vb-poured", "1"); } catch {} router.push("/dashboard"); }, reduce ? 180 : 400);
    setTimeout(() => el.remove(), 1000);
  }, [reduce, router]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit || busy) return;
    if (!EMAIL_RE.test(email.trim())) { setErr("email"); return; }
    setErr(null);
    if (email.trim().toLowerCase().startsWith("error@")) { setErr("auth"); return; }
    setBusy(true);
    router.prefetch("/dashboard");
    setTimeout(runWipe, reduce ? 250 : 900);
  };

  const rows = { hidden: reduce ? {} : { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } } };
  const stack = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-cream"
      style={{ backgroundImage: "radial-gradient(1200px 620px at 78% -12%, #f9ead2 0%, transparent 58%), radial-gradient(900px 500px at 0% 104%, #f1e3d2 0%, transparent 60%), radial-gradient(560px 380px at 96% 88%, rgba(79,176,165,0.08) 0%, transparent 70%)" }}>
      {/* header */}
      <header className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between px-6 pt-6">
        <span className="flex items-center gap-2.5">
          <BrandMark className="size-9 shrink-0" />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-semibold text-coffee">Voice<span className="text-caramel">Brew</span></span>
            <span className={`${mono} block text-[9px] font-medium uppercase tracking-[0.16em] text-latte`}>by Blostem</span>
          </span>
        </span>
        <div className="flex items-center gap-2.5">
          <span className={`${mono} flex items-center gap-2 rounded-full border border-foam bg-card px-3 py-1.5 text-[11px] font-medium text-mocha shadow-glass`}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-steam opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-steam" />
            </span>
            {active}/{CHANNELS} channels live
          </span>
          <button onClick={() => router.push("/login")}
            className={`${mono} rounded-full border border-foam bg-card px-3 py-1.5 text-[11px] text-latte shadow-glass transition-colors hover:text-coffee`}>
            classic sign-in (v1)
          </button>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_1fr]">
        {/* ===== LEFT — the story ===== */}
        <motion.section variants={stack} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={rows} className="w-40 sm:w-48">
            <BrandMark animated className="w-full" />
          </motion.div>
          <motion.h1 variants={rows} className="mt-6 font-serif text-[40px] font-semibold leading-[1.12] tracking-tight text-coffee sm:text-[46px]">
            Your best caller.
            <br />On <span className="text-caramel">every</span> call.
          </motion.h1>
          <motion.p variants={rows} className="mt-4 text-[15.5px] leading-relaxed text-mocha">
            VoiceBrew&apos;s AI voice agents call your customers in Hindi, Hinglish, English and more —
            payment reminders, KYC verification, lead follow-ups — polite, tireless, and
            <span className="font-medium text-coffee"> TRAI-compliant out of the box</span>.
          </motion.p>
          <motion.div variants={rows} className="mt-6">
            <LiveCallCard />
          </motion.div>
          {/* trust facts — plain, no decoding needed */}
          <motion.div variants={rows} className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {[
              { icon: Languages, text: "7 Indian languages" },
              { icon: Clock3, text: "Calls only 9am–9pm IST" },
              { icon: ShieldCheck, text: "DND-scrubbed · TRAI-safe" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className={`${mono} flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-mocha`}>
                <Icon className="size-3.5 text-caramel" /> {text}
              </span>
            ))}
          </motion.div>
        </motion.section>

        {/* ===== RIGHT — the auth card (layout-stable) ===== */}
        <motion.section initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.15 }}
          className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="rounded-3xl border border-foam bg-porcelain p-7 shadow-card-lg lg:p-8" style={{ minHeight: 560 }}>
            <h2 className="font-serif text-[24px] font-semibold text-coffee">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your VoiceBrew workspace.</p>

            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="v2-email" className={labelCls}>Work email</label>
                <input id="v2-email" type="email" autoComplete="email" inputMode="email" value={email} disabled={busy}
                  onChange={(e) => { setEmail(e.target.value); setErr(null); }}
                  onFocus={() => setFocus("email")} onBlur={() => setFocus(null)}
                  className={inputCls} style={{ borderColor: err ? "#a5432c" : undefined, caretColor: "#b8763d" }} />
                <div className="min-h-[20px] pt-1">
                  {err === "email" && <p className="text-[12px] text-danger">That doesn&apos;t look like an email — one more look?</p>}
                  {err === "auth" && <p role="alert" className="text-[13px] text-danger">Email or password didn&apos;t match — try again.</p>}
                </div>
              </div>
              <div>
                <div className="flex h-[20px] items-center justify-between">
                  <label htmlFor="v2-pass" className={`${labelCls} mb-0`}>Password</label>
                  <button type="button" onClick={() => router.push("/forgot")} className="text-[12px] font-medium text-caramel underline-offset-4 hover:underline">
                    Forgot?
                  </button>
                </div>
                <input id="v2-pass" type="password" autoComplete="current-password" value={password} disabled={busy}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocus("password")} onBlur={() => setFocus(null)}
                  className={`${inputCls} mt-1.5`} style={{ caretColor: "#b8763d" }} />
              </div>

              {/* the quirk, legible: listening bars that visibly mute */}
              <ListenStrip email={email} mode={mode} />

              <motion.button type="submit" aria-disabled={!canSubmit} whileTap={canSubmit && !reduce ? { scale: 0.98 } : undefined}
                className="group relative h-12 w-full overflow-hidden rounded-xl bg-brand font-serif text-[16px] font-semibold text-brand-foreground shadow-cta transition-colors hover:bg-brand-dark aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
                {/* shine sweep */}
                {!reduce && (
                  <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />
                )}
                <AnimatePresence mode="wait" initial={false}>
                  {busy ? (
                    <motion.span key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-2">
                      <span className="inline-flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="inline-block size-[5px] rounded-full bg-cream"
                            animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }} />
                        ))}
                      </span>
                      Signing you in… ☕
                    </motion.span>
                  ) : (
                    <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Sign in</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="flex items-center gap-3 py-0.5">
                <span className="h-px flex-1 bg-foam" />
                <span className={`${mono} text-[10px] uppercase tracking-[0.2em] text-latte`}>or</span>
                <span className="h-px flex-1 bg-foam" />
              </div>

              <button type="button"
                onClick={() => { if (!busy) { setEmail(email || "you@company.com"); setPassword(password || "·"); setTimeout(() => submit(), 0); } }}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-foam bg-card text-sm text-coffee transition-colors hover:bg-oat/60">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" fill="#34A853" />
                  <path d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="text-center">
                <button type="button" onClick={() => router.push("/login")} className="text-[13px] text-mocha underline-offset-4 hover:underline">
                  no password? get a sign-in link by email <span className="text-steam">✳</span>
                </button>
              </div>

              <div className="border-t border-foam pt-4 text-center">
                <span className="text-[13px] text-mocha">New to VoiceBrew? </span>
                <button type="button" onClick={() => router.push("/signup")} className="text-[13px] font-semibold text-caramel underline-offset-4 hover:underline">
                  Create a free account →
                </button>
                <p className={`${mono} mt-1.5 text-[10px] uppercase tracking-[0.1em] text-latte`}>50 free sips ≈ 6 minutes of AI calls · no card</p>
              </div>
            </form>
          </div>
        </motion.section>
      </main>

      <footer className={`${mono} shrink-0 pb-5 text-center text-[10px] uppercase tracking-[0.14em] text-latte`}>
        brewed with care · VoiceBrew by Blostem · estd. 2025, Delhi NCR
      </footer>

      {/* v2 preview badge */}
      <span className={`${mono} pointer-events-none fixed bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-foam bg-porcelain px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-mocha shadow-glass`}>
        <Sparkles className="size-3 text-caramel" /> new counter · v2 preview
      </span>
    </div>
  );
}
