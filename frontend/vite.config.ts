// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

// Where the separate backend API project lives. Defaults to the Vercel
// deployment (current production); set BACKEND_URL in the host's own
// environment variables to point a self-hosted build at a different
// backend (e.g. a SiteGround Node.js app) without a code change.
const BACKEND_URL = process.env.BACKEND_URL || "https://grand-palace-backend.vercel.app";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    // Defaults to the Vercel Build Output API preset (current production
    // pipeline, untouched). Set NITRO_PRESET=node-server in the host's own
    // environment variables (e.g. a SiteGround Node.js project) to build a
    // plain, self-hosted Node server instead — no code change needed per host.
    //
    // IMPORTANT: node-server's output directory is Nitro-version-dependent,
    // not a fixed path — it moved from dist/server/index.mjs to
    // .output/server/index.mjs between the nitro versions used earlier in
    // this project vs the one currently pinned in package.json
    // (devDependencies.nitro). package.json's "start" script and the host's
    // "Output directory" setting (SiteGround: Node.js → Output directory)
    // both hardcode whichever path is currently correct — if nitro is ever
    // bumped, rebuild locally and check `ls .output/server` vs
    // `ls dist/server` to confirm which one exists before deploying, or the
    // host will fail to start the app with a stale path.
    preset: (process.env.NITRO_PRESET as "vercel" | "node-server" | undefined) || "vercel",
    // Proxies /api/** through this site's own domain to the separate backend
    // Vercel project, so the browser sees the auth cookie as first-party
    // instead of cross-domain — modern browsers (Chrome/Edge/Firefox) now
    // block cross-domain "third-party" cookies by default, which broke
    // admin login entirely once that rollout reached this project.
    routeRules: {
      "/api/**": { proxy: `${BACKEND_URL}/api/**` },
      // Every page is server-rendered from live database content (menus,
      // guides, admin-editable text) — it must never be cached by a proxy
      // in front of the app (SiteGround's edge sends X-Proxy-Cache-Info on
      // every response), or an admin edit can sit invisible behind a stale
      // cached copy for an unknown period. Hashed build assets are the
      // exception — those are content-addressed and safe to cache forever.
      "/**": { headers: { "cache-control": "no-store, must-revalidate" } },
      "/assets/**": { headers: { "cache-control": "public, max-age=31536000, immutable" } },
      // Static images shipped from public/ (menu dish photos, gallery
      // defaults, category thumbnails, etc.) — NOT content-hashed like
      // /assets/**, so a file can be replaced under the same name. Cached
      // for a day (fixes every one of these being re-fetched from scratch
      // on every page load, which was compounding the site's slow/failing
      // image loads) but short enough that a swapped-in replacement image
      // shows up within a day rather than being stuck for a year.
      "/dishes/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/category-images/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/gallery-images/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/gallery-images-home/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/site-image-defaults/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/whats-on-images/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/scroll-frames/**": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/favicon.png": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      "/email-logo.png": { headers: { "cache-control": "public, max-age=86400, stale-while-revalidate=604800" } },
      // These 28 guides moved from /guides/$slug to /blog/$slug — permanent
      // redirects so existing search rankings/backlinks to the old URLs
      // still land on the right page instead of 404ing.
      "/guides/restaurant-for-birthday-dinner": { redirect: { to: "/blog/best-indian-birthday-dinner-sydney-where-to-celebrate-in-style", status: 301 } },
      "/guides/private-event-venue-hire-sydney": { redirect: { to: "/blog/private-event-venue-hire-sydney", status: 301 } },
      "/guides/best-indian-birthday-dinner-sydney-where-to-celebrate-in-style": { redirect: { to: "/blog/best-indian-birthday-dinner-sydney-where-to-celebrate-in-style", status: 301 } },
      "/guides/make-birthday-memorable-with-tgp": { redirect: { to: "/blog/make-birthday-memorable-with-tgp", status: 301 } },
      "/guides/why-tgp-best-for-christmas-lunch-and-dinner": { redirect: { to: "/blog/why-tgp-best-for-christmas-lunch-and-dinner", status: 301 } },
      "/guides/catering-boxes-in-sydney-for-parties": { redirect: { to: "/blog/catering-boxes-in-sydney-for-parties", status: 301 } },
      "/guides/why-tgp-is-best-for-diwali-party": { redirect: { to: "/blog/why-tgp-is-best-for-diwali-party", status: 301 } },
      "/guides/where-to-host-a-royal-indian-birthday-dinner-in-sydney": { redirect: { to: "/blog/best-birthday-venues-sydney-cbd", status: 301 } },
      "/guides/wedding-catering-sydney-cbd": { redirect: { to: "/blog/wedding-catering-sydney-cbd", status: 301 } },
      "/guides/best-birthday-venues-sydney-cbd": { redirect: { to: "/blog/best-birthday-venues-sydney-cbd", status: 301 } },
      "/guides/how-to-plan-office-lunch-catering-in-sydney": { redirect: { to: "/blog/how-to-plan-office-lunch-catering-in-sydney", status: 301 } },
      "/guides/indian-catering-box-sydney-cbd": { redirect: { to: "/blog/indian-catering-box-sydney-cbd", status: 301 } },
      "/guides/christmas-corporate-catering-box-by-tgp": { redirect: { to: "/blog/christmas-corporate-catering-box-by-tgp", status: 301 } },
      "/guides/sydney-corporate-catering-at-tgp": { redirect: { to: "/blog/sydney-corporate-catering-at-tgp", status: 301 } },
      "/guides/corporate-catering-in-sydney-at-tgp": { redirect: { to: "/blog/private-corporate-dining-sydney-cbd", status: 301 } },
      "/blog/corporate-catering-in-sydney-at-tgp": { redirect: { to: "/blog/private-corporate-dining-sydney-cbd", status: 301 } },
      "/guides/indian-catering-boxes-in-sydney": { redirect: { to: "/blog/indian-catering-boxes-in-sydney", status: 301 } },
      "/guides/find-right-indian-catering-for-event": { redirect: { to: "/blog/find-right-indian-catering-for-event", status: 301 } },
      "/guides/business-lunch-sydney-cbd": { redirect: { to: "/blog/business-lunch-sydney-cbd", status: 301 } },
      "/guides/corporate-catering-sydney-cbd": { redirect: { to: "/blog/how-to-plan-office-lunch-catering-in-sydney", status: 301 } },
      "/blog/corporate-catering-sydney-cbd": { redirect: { to: "/blog/how-to-plan-office-lunch-catering-in-sydney", status: 301 } },
      "/guides/indian-wedding-catering-sydney": { redirect: { to: "/blog/indian-wedding-catering-sydney", status: 301 } },
      "/guides/choose-indian-catering-sydney-event": { redirect: { to: "/blog/find-right-indian-catering-for-event", status: 301 } },
      "/guides/jain-restaurants-in-sydney-no-onion-no-garlic": { redirect: { to: "/blog/jain-restaurants-in-sydney-no-onion-no-garlic", status: 301 } },
      "/guides/tgp-is-best-for-a-weekend-indian-lunch": { redirect: { to: "/blog/tgp-is-best-for-a-weekend-indian-lunch", status: 301 } },
      "/guides/mocktails-drinks-in-indian-food": { redirect: { to: "/blog/mocktails-drinks-in-indian-food", status: 301 } },
      "/guides/indian-restaurant-near-wynyard-station-sydney": { redirect: { to: "/blog/indian-restaurant-near-wynyard-station-sydney", status: 301 } },
      "/guides/best-indian-restaurant-near-me-sydney-cbd-the-grand-palace-guide": { redirect: { to: "/blog/best-indian-restaurant-near-me-sydney-cbd-the-grand-palace-guide", status: 301 } },
      "/guides/guide-to-indian-whisky-in-sydney": { redirect: { to: "/blog/guide-to-indian-whisky-in-sydney", status: 301 } },
      "/guides/indian-food-delivery-sydney-cbd": { redirect: { to: "/blog/indian-food-delivery-sydney-cbd", status: 301 } },
      "/guides/indian-restaurant-near-martin-place": { redirect: { to: "/blog/indian-restaurant-near-martin-place", status: 301 } },
      "/guides/indian-restaurant-near-town-hall-station": { redirect: { to: "/blog/indian-restaurant-near-town-hall-station", status: 301 } },
      "/guides/best-halal-indian-restaurant-sydney": { redirect: { to: "/guides/best-halal-restaurant-in-sydney", status: 301 } },
      // Consolidated near-duplicate catering guides into stronger versions covering the same ground.
      "/blog/indian-catering-boxes-in-sydney": { redirect: { to: "/blog/indian-catering-box-sydney-cbd", status: 301 } },
      "/blog/sydney-corporate-catering-at-tgp": { redirect: { to: "/blog/indian-catering-box-sydney-cbd", status: 301 } },
      "/blog/choose-indian-catering-sydney-event": { redirect: { to: "/blog/find-right-indian-catering-for-event", status: 301 } },
      // Consolidated near-duplicate birthday guides into stronger versions covering the same ground.
      "/blog/restaurant-for-birthday-dinner": { redirect: { to: "/blog/best-indian-birthday-dinner-sydney-where-to-celebrate-in-style", status: 301 } },
      "/blog/where-to-host-a-royal-indian-birthday-dinner-in-sydney": { redirect: { to: "/blog/best-birthday-venues-sydney-cbd", status: 301 } },
    },
  },
  vite: {
    plugins: [
      ViteImageOptimizer({
        jpg: { quality: 72 },
        jpeg: { quality: 72 },
        png: { quality: 72 },
        webp: { lossless: false, quality: 75 },
      }),
    ],
  },
});
