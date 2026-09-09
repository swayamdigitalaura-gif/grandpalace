// Single entry point for the combined app on one Node.js host (SiteGround).
// Starts the backend Express API as a child process on an internal-only
// port, then starts the frontend's built Nitro server (node-server preset)
// as the process SiteGround actually listens on. The frontend's own
// vite.config.ts routeRules already proxy /api/** to BACKEND_URL — pointing
// BACKEND_URL at this internal port keeps both apps' code completely
// unchanged, this file only wires the two already-independent servers
// together as one deployable unit.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SiteGround exposes no runtime/application log for this process or its
// children (stdio: "inherit" output has nowhere visible to go) — only the
// build log is visible in the panel. Mirror backend startup output to a
// plain file in the app directory instead, readable via File Manager, so a
// backend crash (missing env var, DB connection failure, etc.) is
// diagnosable without SSH access.
const backendLogFd = openSync(path.join(__dirname, "backend-debug.log"), "a");

console.log("=== root server.js entry point started ===");

// This orchestrator process crashing takes the site down even though the
// backend it spawned (a separate OS process) keeps running and answering
// requests fine — indistinguishable from the outside from "frontend never
// started" without direct log access to this process (which SiteGround's
// panel does not expose; only the build log is visible there). Log and
// survive rather than risk silently losing the frontend to an error here.
process.on("uncaughtException", (err) => {
  console.error("server.js uncaught exception (staying up):", err);
});
process.on("unhandledRejection", (err) => {
  console.error("server.js unhandled rejection (staying up):", err);
});

// Non-secret deployment defaults. These are fixed by how this app is wired
// (the API always runs on an internal loopback port, never exposed), so they
// live here rather than needing to be set by hand on every host. Anything
// genuinely secret — DATABASE_URL, JWT_SECRET, Stripe and SMTP credentials —
// must still come from the host's own environment variables and must never
// be committed here.
const DEFAULTS = {
  NODE_ENV: "production",
  // Must match build.js's own INTERNAL_BACKEND_PORT default — that script
  // bakes BACKEND_URL into the frontend build using this same port, and the
  // two are never read from a shared source, so a mismatch here silently
  // points the deployed frontend's proxy at a port nothing is listening on
  // (a 502 on every /api/** call) even though both processes start fine.
  INTERNAL_BACKEND_PORT: "4000",
  NITRO_PRESET: "node-server",
};

for (const [key, value] of Object.entries(DEFAULTS)) {
  if (!process.env[key]) process.env[key] = value;
}

const PUBLIC_PORT = process.env.PORT || "3000";
const INTERNAL_BACKEND_PORT = process.env.INTERNAL_BACKEND_PORT;

// The host's own PORT is meant for the public-facing frontend only. If it
// ever collided with the internal backend port, the backend (Express, binds
// faster) would win the race and answer every public request instead of the
// frontend — Express's "Cannot GET /" for pages the frontend should serve,
// with nothing crashing or logged. Fail loudly rather than silently pick a
// different port, which would only reintroduce the build/runtime mismatch
// described above.
if (INTERNAL_BACKEND_PORT === PUBLIC_PORT) {
  console.error(
    `FATAL: INTERNAL_BACKEND_PORT and PORT are both ${PUBLIC_PORT}. Set INTERNAL_BACKEND_PORT ` +
      "to a different value in the host's environment variables (and rebuild, since build.js " +
      "bakes it into the frontend too).",
  );
  process.exit(1);
}

const INTERNAL_BACKEND_URL = `http://127.0.0.1:${INTERNAL_BACKEND_PORT}`;

// The public origin this site is served from — used for absolute URLs in
// canonical tags, sitemap.xml, uploaded-image URLs and CORS. Falls back to
// the SiteGround staging hostname; set SITE_ORIGIN on the host to override
// (e.g. https://thegrandpalace.com.au once the domain is pointed here).
const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://ketanp10.sg-host.com";

// Derived values the two apps expect under their own env var names. Set only
// if the host hasn't already provided them, so a manual override still wins.
const DERIVED = {
  FRONTEND_URL: SITE_ORIGIN,
  PUBLIC_URL: SITE_ORIGIN,
  VITE_SITE_URL: SITE_ORIGIN,
  VITE_API_URL: INTERNAL_BACKEND_URL,
};

for (const [key, value] of Object.entries(DERIVED)) {
  if (!process.env[key]) process.env[key] = value;
}

if (!process.env.DATABASE_URL) {
  console.error(
    "FATAL: DATABASE_URL is not set. Add it as an environment variable on the host " +
      "(SiteGround: Site Tools → Node.js → Environment Variables). It is a secret and " +
      "is deliberately not committed to this repo.",
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET is not set. Add it as an environment variable on the host. " +
      "It signs admin login sessions and is deliberately not committed to this repo.",
  );
  process.exit(1);
}

function startBackend() {
  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: path.join(__dirname, "backend"),
    env: { ...process.env, PORT: INTERNAL_BACKEND_PORT },
    stdio: ["ignore", backendLogFd, backendLogFd],
  });
  child.on("exit", (code) => {
    console.error(`Backend process exited with code ${code}, exiting. See backend-debug.log.`);
    // frontend is spawned with its own stdio, so it survives this process's
    // exit as an orphan unless explicitly killed here first.
    frontend?.kill();
    process.exit(code ?? 1);
  });
  return child;
}

function startFrontend() {
  const child = spawn(process.execPath, ["./.output/server/index.mjs"], {
    cwd: path.join(__dirname, "frontend"),
    env: {
      ...process.env,
      PORT: PUBLIC_PORT,
      // BACKEND_URL (the Nitro proxy target) is baked into the build — see
      // vite.config.ts — so it must be correct at BUILD time, not just here.
      // The root package.json's build script sets it for that reason.
      // VITE_API_URL below is read at runtime by SSR loaders (admin-api.ts).
      VITE_API_URL: INTERNAL_BACKEND_URL,
    },
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.error(`Frontend process exited with code ${code}, exiting.`);
    // same orphan risk as above, in the other direction.
    backend?.kill();
    process.exit(code ?? 1);
  });
  return child;
}

// A previous version of this file gated startFrontend() behind an async
// health-check probe of the backend (waitForBackend()), added while chasing
// what turned out to be a database connectivity bug (DATABASE_URL pointed
// at the public hostname; SiteGround's own server couldn't reliably reach
// itself through it — fixed by using 127.0.0.1 instead). That gate added a
// real risk of its own: an error anywhere in that async chain is unhandled
// at this top level, and killing the *parent* process here does not kill
// the backend — spawn()'d with its own stdio, it keeps running as an
// independent OS process. The result was a backend that stayed up and kept
// answering correctly while server.js itself silently died before ever
// calling startFrontend(), which is indistinguishable from the outside
// (curl) from "backend is fine, frontend never started" — exactly what was
// observed. Removed now that the real bug is fixed; starting both
// unconditionally is simpler and was the original, correct design.
console.log(`Starting backend on ${INTERNAL_BACKEND_URL} (internal only)`);
const backend = startBackend();
console.log(`Starting frontend on port ${PUBLIC_PORT}, public origin ${SITE_ORIGIN}`);
const frontend = startFrontend();

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
