# DeskFinds (deskfinds.com)

A Next.js 16 affiliate content site deployed to **Cloudflare Pages** as a static export.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build and deploy

```bash
npm run build        # regenerates public/_headers + public/_redirects, exports to ./out, prunes it
npm run start        # serve ./out locally to check the exported site
```

The site is deployed as a **Cloudflare Pages** project connected to this GitHub
repository. Everything is configured in the Cloudflare dashboard, not in a file
here, so there is no wrangler config in the repo.

**Settings > Build & deployments:**

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `out` |
| Root directory | repository root |

`npm run build` is required, not the `npx next build` that Cloudflare
auto-detects for a Next.js project. The default command skips
`scripts/prune-export.mjs`, the export then contains roughly 55,000 files, and
the deployment fails with "Pages only supports up to 20,000 files in a
deployment."

**Settings > Environment variables (Production):**

| Variable | Value |
|---|---|
| `NODE_VERSION` | `22` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.deskfinds.com` |

`NEXT_PUBLIC_SITE_URL` is optional here, since `lib/seo.ts` already falls back to
that exact value, but setting it explicitly keeps the canonical domain from
depending on a default buried in code. `.env.local` is gitignored, so a
Cloudflare build has no secrets to leak and needs none.

A push to `main` triggers a production deploy.

### The non-www redirect

Cloudflare matches `public/_redirects` on path only, so it cannot express the
`deskfinds.com` to `www.deskfinds.com` rule that `next.config.ts` used to hold.
Add it on the zone instead: **Rules > Redirect Rules**, when hostname equals
`deskfinds.com`, dynamic redirect to
`concat("https://www.deskfinds.com", http.request.uri.path)`, status 301.

## Why a static export

Vercel bills per request (ISR Reads, function invocations), which this site's
6,000+ guide pages made expensive. A static export has no per-request server cost
at all, so Cloudflare serves it from its asset hosting. The trade-offs this
imposes, and where each one is handled:

| Not available in a static export | Where it lives now |
|---|---|
| `next.config.ts` `headers()` | `public/_headers` |
| `next.config.ts` `redirects()` | `public/_redirects` |
| Route handlers (`app/api/**`) | removed, along with the `vercel.json` crons that called them |
| Middleware (`middleware.ts`) | removed; bot filtering belongs in Cloudflare's WAF |
| `next/image` optimization | `images.unoptimized: true` |
| ISR / `export const revalidate` | removed from all 289 pages; everything is prerendered at build time |

Both generated files come from `scripts/build-cloudflare-static-config.mjs`
(`npm run cf:config`, which `npm run build` runs first). Edit the script, never
`public/_headers` or `public/_redirects` by hand.

The build then runs `scripts/prune-export.mjs`. Next 16 writes one `__next.*.txt`
segment-cache directory per route (8 files each), which for 6,000+ routes is tens
of thousands of extra files against Cloudflare's 20,000-file cap. Nothing
prefetches them (every `<Link>` sets `prefetch={false}`), and without them the
router falls back to a full-page navigation, which is how a plain static site
behaves anyway.

`app/sitemap.ts` and `app/robots.ts` declare `export const dynamic = "force-static"`
so they are emitted as files at build time. Every dynamic route sets
`dynamicParams = false`: its `generateStaticParams()` list is the complete set of
URLs, and anything else serves the exported 404 page.

Supabase remains a build-time data source only. With no credentials present the
public data layer falls back to `data/`, which is what a CI build uses.

## Publishing new content

There is no ISR, so new or edited guides go live only through a rebuild: edit
`data/`, then push, and Cloudflare rebuilds and redeploys.

The bot-blocking that `middleware.ts` used to do, and the IndexNow ping that the
`/api/cron/ping-indexnow` route handled, both need a new home if they are still
wanted: bot blocking as a Cloudflare WAF rule, IndexNow as a manual
`node scripts/indexnow.mjs <slug> ...` run after a deploy.
