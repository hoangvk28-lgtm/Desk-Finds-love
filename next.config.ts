import type { NextConfig } from "next";
import path from "path";

// Cloudflare Pages deployment.
//
// This site is served as a pure static export (output: "export") from
// Cloudflare Pages. There is no Node server at runtime, which is deliberate:
// Vercel's per-request ISR Read / function-invocation billing is what this move
// exists to remove.
//
// Consequences, all handled elsewhere in the repo:
//   * next.config headers()/redirects() do nothing in an export, so they live
//     in public/_headers and public/_redirects, which Cloudflare reads.
//     scripts/build-cloudflare-static-config.mjs generates both (npm run cf:config).
//   * Route handlers (app/api), middleware.ts and the Vercel cron jobs that
//     called them are unsupported and have been removed.
//   * next/image optimization needs a server, so images are served unoptimized.
//   * ISR is gone: every route is prerendered at build time.
//   * scripts/prune-export.mjs trims Next's per-route segment payloads from out/
//     so the deployment stays under Cloudflare's 20,000-file cap.
const nextConfig: NextConfig = {
  output: "export",

  // Pin the workspace root explicitly. An unrelated stray lockfile at
  // /home/admin1/package-lock.json was making Next.js infer the workspace
  // root as the whole home directory instead of this project folder.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  // Cloudflare serves /guide/foo from out/guide/foo.html, which matches the
  // canonical URLs buildMetadata() emits (no trailing slash).
  trailingSlash: false,

  experimental: {
    // The export prerenders 6,000+ pages. The default worker count makes
    // several concurrent Node processes exhaust RAM + swap on this machine.
    cpus: 2,
    staticGenerationMaxConcurrency: 2,
  },

  // Type-checking runs separately (`npx tsc --noEmit`) before every push per the
  // pre-commit gate. With 6,000+ guide pages the in-build pass is slow enough to
  // threaten the build timeout, so skip the redundant check.
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    // Required by output: "export" — there is no server to optimize images.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
    ],
  },
};

export default nextConfig;
