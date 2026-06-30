# VoiceBrew — Product Handoff · **v5 = current benchmark**

> The product is a study/clone of the VoiceBrew (Blostem) AI voice-calling platform — a dashboard for running outbound AI-voice campaigns. This doc is the **team source of truth for the whole product as built**, with **v5 as the locked benchmark**.

_Last verified: 2026-06-26 — all version routes 200, no compile errors._

> Companion docs in this repo: [`V2-HANDOFF.md`](./V2-HANDOFF.md) (deep dive on the v2 baseline + its snapshots), [`docs/`](./docs/) (the screen-recording product model). Run/restore basics are repeated below so this file stands alone.

---

## 0. Getting started

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 (`@theme` tokens) · Base UI + shadcn-style · framer-motion · @number-flow/react · lottie-react. Local demo only — all data is **mock/fake** (`src/lib/*-mock.ts`), no backend.

```bash
npm install
PORT=3434 npm run dev          # project convention is port 3434
# if it ever drops (the bg process gets reaped), just rerun the line above
```
Node 20+ (built on Node 24). ⚠️ Read [`AGENTS.md`](./AGENTS.md) before coding — this Next.js version has breaking changes vs older docs.

---

## 1. Version map

Each version is an independent design/experiment. **v2 and v5 are locked references — don't edit them.** Build new work as a new version.

| Ver | What it is | Open at | Status |
|---|---|---|---|
| **v2** | The original full app + feature/content benchmark (sidebar shell, coffee/Playfair, flip-card dashboard, all 28 screens). | `/dashboard-v2` (+ all `/campaigns`, `/leads`, … render in this shell) | 🔒 Locked (`v2-baseline` tag) |
| **v3** | "Brewing" showcase — warm brew gradient, Calistoga, espresso hero, BrewCup, Lottie soundwave. | `/dashboard-v3` | Standalone design |
| **v4** | "The Pour Line" — café command-deck: live call player, reactor, roast curve, V60 funnel, Bean-Wave logo. | `/dashboard-v4` | Standalone design |
| **v5** | ⭐ **Current benchmark.** A clean replica of v2 (VoiceBrew logo, flip-card dashboard) **minus** the Get-started block, **plus** a v3-inspired **Today** section. The sandbox everything now builds from. | `/dashboard-v5` · `/dashboard-v5/today` | 🔒 **Locked benchmark** |
| **v6** | Built **from v5** + three new features: campaign **scheduling**, **smart auto-pause** (quiet hours + report-threshold), and **AI blocker analysis** (alert → report). | `/dashboard-v6` · `/dashboard-v6/today` · `/dashboard-v6/campaigns/new` · `/dashboard-v6/insights` | Active / experiment |

---

## 2. Architecture — how versions stay isolated

- **v2 is the global app.** `src/app/layout.tsx` wraps every normal route in the v2 **Sidebar + Topbar** shell; `/dashboard-v2` + all feature screens (`/campaigns`, `/leads`, `/calls`, …) live here.
- **v3 / v4 / v5 / v6 are standalone overlays.** Each renders `fixed inset-0 z-50` so it *covers* the global v2 shell — that's why each can have its own chrome without colliding.
- **v5 & v6 use a per-version namespace** so edits never leak:
  - Components: `src/components/v5/*` and `src/components/v6/*` (own `sidebar`, `topbar`, `dashboard`, `today`, …).
  - Routes: `src/app/dashboard-v5/**` and `src/app/dashboard-v6/**`, each with its own `layout.tsx` (the overlay shell) so it can hold sub-routes (`/today`, `/campaigns/new`, `/insights`).
  - Their sidebars **remap** shared nav links into their own namespace (e.g. Dashboard→`/dashboard-v6`, Today→`/dashboard-v6/today`, Campaigns→`/dashboard-v6/campaigns/new`).
- **Shared leaf primitives** (`components/coffee/*`, `components/ui-bits/*`, `onboarding/*`, `wallet/*`, `config/nav`, `lib/*-mock`) are reused by all versions. Editing one affects everyone — fork into the version namespace if you need to change one for a single version.

---

## 3. v5 — the benchmark (do not edit)

What it is: a faithful **replica of v2** so it can be experimented on freely, with two intentional deltas already applied:
1. **Get-started block removed** from the dashboard (opens straight into the welcome banner + capacity/KPIs).
2. **Today section** rebuilt with **v3 "brewing" inspiration** — espresso hero ("Your worklist is brewing"), a **BrewCup that fills as you tick tasks**, a Lottie soundwave band, roast-style worklist cards, drifting beans.

**v5 files (the locked set):**
- `src/app/dashboard-v5/layout.tsx` — overlay shell (mounts the v5 sidebar + topbar)
- `src/app/dashboard-v5/page.tsx` — dashboard route → `<V5Dashboard/>`
- `src/app/dashboard-v5/today/page.tsx` — today route → `<V5Today/>`
- `src/components/v5/{sidebar,topbar,dashboard,today}.tsx`

Brand: uses the real **VoiceBrew logo** (`src/components/layout/voicebrew-logo.tsx` — a coffee cup with a voice waveform + steam, also now in v2's sidebar).

> To experiment going forward, **clone v5 → a new version** (see §6) rather than editing v5.

---

## 4. v6 — the active experiment (built from v5)

Adds three features the product needed. All café-styled, user-friendly, reduced-motion-safe.

### 4.1 Campaign **Scheduling** — `/dashboard-v6/campaigns/new`
A focused 5-step wizard (Basics · Audience · **Schedule** · **Smart pauses** · Review) with a live-summary rail. The **Schedule** step: start now / schedule-for-later (date+time), a day-of-week calling window, daily from/to times, timezone, and a plain-language preview ("Will call Mon–Fri, 09:00–18:00 IST · starts now").

### 4.2 **Smart auto-pause** triggers (in the wizard's "Smart pauses" step)
- **Quiet hours** — define windows (default *Lunch 13:00–14:00*) where the campaign **auto-pauses and auto-resumes** so brands don't disturb customers. Add multiple windows.
- **Auto-pause on reported issues** — "Pause when **≥ N** customers report the same blocker within an hour", with a severity filter and a **Notify-me-first (recommended)** vs **Pause-automatically** choice. This is the config side of the AI blocker feature.

### 4.3 **AI blocker analysis** — alert + report
- `src/components/v6/blocker-alert.tsx` — a dashboard alert: VoiceBrew AI spots a blocker clustered across customers, shows a **brief** + stat chips, and offers **Pause campaign / Ignore / View full report →** (Pause flips it to a "paused — Resume" state).
- `/dashboard-v6/insights` (`blocker-report.tsx`) — the full, **uncluttered** report: title + severity, stat cards (customers reported, % of calls, connect impact, detected), "What's happening", representative customer quotes, AI root cause, and a **before/after suggested fix** with Apply / Pause / Ignore actions.
- Data: `src/lib/v6-mock.ts` (the example blocker, quiet-hour defaults, schedule options).

**v6 files:** `src/app/dashboard-v6/**` (layout, page, today, campaigns/new, insights) · `src/components/v6/{sidebar,topbar,dashboard,today,campaign-wizard,blocker-alert,blocker-report}.tsx` · `src/lib/v6-mock.ts`.

---

## 5. Design system (shared)

- **Type:** Space Grotesk / Playfair (`--font-display`, used as `font-serif` in v2/v5) · Instrument Serif italic accent (v3/v4) · JetBrains Mono for data. Café-warm palette: oat/cream surfaces, espresso/coffee ink, caramel + brass accents, café-sage for "live/positive", terracotta/amber for status. Tokens live in `src/app/globals.css` (`@theme`).
- **Logo:** `components/layout/voicebrew-logo.tsx` — `VoiceBrewMark` (cup + waveform + steam, inherits `currentColor`) and `VoiceBrewLogo` (mark + "Voice**Brew** · by Blostem").
- For full design intelligence the project uses the **ui-ux-pro-max** skill; v4's full art direction is in `V4-DESIGN-SPEC.md` and assets in `v4-assets/`.

---

## 6. Keeping v5 locked + spinning up the next version

**Lock it in git** (recommended — v5/v6 aren't committed yet):
```bash
git add -A && git commit -m "v5 benchmark + v6 (scheduling, smart-pause, AI blocker)"
git tag v5-benchmark         # restore later with: git checkout v5-benchmark -- src/app/dashboard-v5 src/components/v5
```

**Start a new version from v5 (the pattern used for v6):**
```bash
cp -r src/components/v5 src/components/vN
cp -r src/app/dashboard-v5 src/app/dashboard-vN
# rename exports/imports/routes: V5->VN, @/components/v5/->@/components/vN/, dashboard-v5->dashboard-vN
# then remap the new sidebar's nav links into /dashboard-vN/* and build your feature
```

---

## 7. Snapshots (in `shots-v2/`)
- v5: `v5-replica.png`, `v5-today.png`, `v5-today-progress.png`
- v6: `v6-dash.png` (AI alert), `v6-wiz-schedule.png`, `v6-wiz-pauses.png`, `v6-report.png`
- earlier: `v2-logo.png`, `v4-pour-*.png`, etc.

---

## 8. Reference docs
- [`V2-HANDOFF.md`](./V2-HANDOFF.md) — v2 fingerprint, verify/restore, full v2 snapshot set.
- [`V4-DESIGN-SPEC.md`](./V4-DESIGN-SPEC.md) — v4 "Pour Line" creative direction.
- [`docs/MODEL-FROM-VIDEO.md`](./docs/MODEL-FROM-VIDEO.md) — the product model extracted from the original-platform screen recording (drives the campaign journey, etc.).
- [`docs/SITEMAP.md`](./docs/SITEMAP.md), [`docs/DASHBOARD-SPEC.md`](./docs/DASHBOARD-SPEC.md).
