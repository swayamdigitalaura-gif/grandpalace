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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("=== root server.js entry point started ===");

// Non-secret deployment defaults. These are fixed by how this app is wired
// (the API always runs on an internal loopback port, never exposed), so they
// live here rather than needing to be set by hand on every host. Anything
// genuinely secret — DATABASE_URL, JWT_SECRET, Stripe and SMTP credentials —
// must still come from the host's own environment variables and must never
// be committed here.
const DEFAULTS = {
  NODE_ENV: "production",
  INTERNAL_BACKEND_PORT: "4000",
  NITRO_PRESET: "node-server",
};

for (const [key, value] of Object.entries(DEFAULTS)) {
  if (!process.env[key]) process.env[key] = value;
}

const INTERNAL_BACKEND_PORT = process.env.INTERNAL_BACKEND_PORT;
const PUBLIC_PORT = process.env.PORT || "3000";
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
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.error(`Backend process exited with code ${code}, exiting.`);
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
    process.exit(code ?? 1);
  });
  return child;
}

// Confirms the backend is actually reachable at INTERNAL_BACKEND_URL before
// starting the frontend (whose proxy target is baked in at build time and
// can't be redirected at runtime). Without this, the frontend can come up
// and serve pages successfully while every /api/** call 502s silently if the
// backend is slow to bind or bound to the wrong interface — exactly what
// happened on first deploy (both processes reported healthy in the logs;
// the mismatch was invisible without probing the connection directly).
function waitForBackend(url, { timeoutMs = 30000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      fetch(`${url}/api/health`)
        .then((res) => {
          if (res.ok) return resolve();
          retry();
        })
        .catch(retry);
    };
    const retry = () => {
      if (Date.now() > deadline) {
        return reject(new Error(`Backend did not become reachable at ${url} within ${timeoutMs}ms`));
      }
      setTimeout(attempt, intervalMs);
    };
    attempt();
  });
}

console.log(`Starting backend on ${INTERNAL_BACKEND_URL} (internal only)`);
const backend = startBackend();
let frontend;

waitForBackend(INTERNAL_BACKEND_URL)
  .then(() => {
    console.log(`Backend confirmed reachable at ${INTERNAL_BACKEND_URL}`);
    console.log(`Starting frontend on port ${PUBLIC_PORT}, public origin ${SITE_ORIGIN}`);
    frontend = startFrontend();
  })
  .catch((err) => {
    console.error(err.message);
    console.error(
      "Starting frontend anyway — /api/** requests will 502 until the backend becomes reachable.",
    );
    frontend = startFrontend();
  });

function shutdown() {
  backend.kill();
  frontend?.kill();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
