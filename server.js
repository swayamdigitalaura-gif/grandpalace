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

const INTERNAL_BACKEND_PORT = process.env.INTERNAL_BACKEND_PORT || "4000";
const PUBLIC_PORT = process.env.PORT || "3000";

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
      // BACKEND_URL (baked into the Nitro build's proxy rules — see
      // vite.config.ts) must already be http://127.0.0.1:<INTERNAL_BACKEND_PORT>
      // at BUILD time, set via the host's env vars. VITE_API_URL here only
      // affects SSR loaders reading it at runtime (admin-api.ts's API_URL).
      VITE_API_URL: `http://127.0.0.1:${INTERNAL_BACKEND_PORT}`,
    },
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.error(`Frontend process exited with code ${code}, exiting.`);
    process.exit(code ?? 1);
  });
  return child;
}

const backend = startBackend();
const frontend = startFrontend();

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
