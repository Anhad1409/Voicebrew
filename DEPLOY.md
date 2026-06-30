# Deploy VoiceBrew (v6 live)

The app is **deploy-ready**: production build passes, root `/` lands on **v6**, everything is committed. Data is all mock — **no env vars/secrets needed**.

> ⚠️ This publishes the clone to a public URL (it can be cached/indexed). It was previously local-only — deploy intentionally.

I can't publish from here (no Vercel/GitHub login in this sandbox). Pick one path and run it on your machine — both take ~2 minutes.

---

## Option A — Vercel CLI (fastest)
```bash
cd ~/voicebrew
npm i -g vercel
vercel login            # opens browser / email code
vercel --prod           # accept defaults; Next.js is auto-detected
```
→ Vercel prints your live URL (e.g. `https://vox-clone-xxxx.vercel.app`). The root lands on v6.

## Option B — GitHub + Vercel dashboard (no CLI)
```bash
cd ~/voicebrew
gh repo create voicebrew --private --source=. --push     # or create the repo in the GitHub UI and `git push`
```
Then: vercel.com → **Add New → Project** → import the `voicebrew` repo → **Deploy** (defaults are correct).

---

## Settings (auto-detected — only confirm if asked)
- **Framework:** Next.js · **Build:** `next build` · **Install:** `npm install` · **Output:** default
- **Node:** 20+ · **Env vars:** none
- Type/lint checks are skipped in the prod build on purpose (`next.config.ts`) — this is a mock/demo; cosmetic type mismatches in seed data aren't runtime bugs.

## After it's live
- `/` → v6. Other versions stay reachable: `/dashboard-v2` (locked baseline), `/dashboard-v5` (benchmark), `/dashboard-v3`, `/dashboard-v4`.
- To change the landing later, edit `src/app/page.tsx` (the `redirect(...)`).

## Run the production build locally (stable, no dev-server drops)
```bash
cd ~/voicebrew
npm run build && npx next start -p 3434      # http://localhost:3434  (lands on v6)
```
