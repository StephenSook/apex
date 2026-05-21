# APEX Vercel Deploy Runbook

> Manual deploy steps for the live production demo at https://apex-race.vercel.app (or https://apex.race once DNS lands). Stephen owns. Pre-mortem row 16 says the AI-tone sweep is the Day-11 morning gate; the actual Vercel deploy is Day 9 dress-rehearsal + Day 11 final cutover.

---

## Why this is a runbook and not a script

Vercel's CLI requires browser OAuth that cannot be automated from a non-interactive context. The repo ships:

- `vercel.json` at the repo root with build command + framework + region + security headers.
- `app/frontend/next.config.ts` already configured for Vercel-compatible Next.js 16 + Turbopack build.
- `.github/workflows/ci.yml` already runs `pnpm build` per commit, so the build will succeed on Vercel runners without surprise.

What it does NOT ship: a CI-driven `vercel --prod` automation. That requires a `VERCEL_TOKEN` repo secret which the project does not currently hold. Adding the token + the GH Action step is a 30-minute task whenever Stephen decides; the manual deploy below is the canonical path until then.

---

## First-time setup (Stephen one-time)

1. `npm install -g vercel`
2. `vercel login` (browser OAuth)
3. `cd /Users/stephensookra/Desktop/IBM\ May`
4. `vercel link` (select scope, create project "apex-race")
5. Verify Vercel dashboard shows the project + the GitHub auto-deploy hook is enabled

After step 5, every push to `main` triggers a preview deploy + a production deploy on the configured branch (default: `main`).

## Day 9 dress-rehearsal deploy

```bash
cd /Users/stephensookra/Desktop/IBM\ May
vercel --prod   # or simply push to main and let the GitHub integration handle it
```

Verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://apex-race.vercel.app/
curl -s -o /dev/null -w "%{http_code}\n" https://apex-race.vercel.app/analyze
curl -s -o /dev/null -w "%{http_code}\n" https://apex-race.vercel.app/judges
curl -s -o /dev/null -w "%{http_code}\n" https://apex-race.vercel.app/status
```

All four should return 200. Pre-submit Check 14 (README demo URL) flips WARN → PASS once the README is updated with the live URL.

## Domain swap (Day 11 if apex.race lands)

If the `apex.race` domain registration completes before Day 11:

1. Vercel dashboard → Project Settings → Domains → Add `apex.race`.
2. Set CNAME at the DNS registrar to `cname.vercel-dns.com`.
3. Wait for SSL provisioning (Vercel handles automatically, usually < 5 min).
4. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel project settings to `https://apex.race`.
5. Push a new commit to trigger redeploy with the new metadataBase.
6. Update README + /judges + /status references.

If `apex.race` does NOT land in time, the `apex-race.vercel.app` URL stays in production. metadataBase fallback at `app/frontend/app/layout.tsx` already handles this case.

## Rollback path

If a production deploy goes bad:

```bash
vercel rollback                              # prompts for prior deploy
vercel rollback <deployment-url>             # specific prior deploy
```

Or via Vercel dashboard: Project → Deployments → previous green → "Promote to Production."

## Environment variables

Set in Vercel project settings (NOT committed to repo):

- `NEXT_PUBLIC_SITE_URL`: `https://apex.race` once domain lands, else `https://apex-race.vercel.app`.
- (Day 5+ Vinh-lane) `OPENROUTER_API_KEY`: server-side only, used by the Granite proxy route once Vinh ships `app/backend/`.
- (Day 5+ Vinh-lane) `HF_TOKEN`: if any client component ever hits Hugging Face directly (currently not).

## Vercel build caveat

Vercel's default Node version may not match the local `node@22.22.2` pin. Verify in Vercel project settings → Environment → Node Version is `22.x`. If Vercel ships Node 25 by default, set it to 22 explicitly to avoid the simdjson dyld bug (see global CLAUDE.md cost-discipline notes).

---

_Last updated: 2026-05-21 evening by Stephen (wave-19 mega: Vercel runbook drafted; manual deploy step Day 9 dress-rehearsal)._
