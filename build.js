// Builds the frontend with the env vars Nitro bakes into its output.
//
// BACKEND_URL and NITRO_PRESET must be correct at BUILD time — vite.config.ts
// reads them to generate the /api/** proxy rule and to pick the self-hosted
// node-server output — so setting them only at runtime is too late. They're
// not secret (the API target is an internal loopback address), so they're
// defaulted here rather than needing to be set by hand on the host.
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INTERNAL_BACKEND_PORT = process.env.INTERNAL_BACKEND_PORT || "4000";

const env = {
  ...process.env,
  NITRO_PRESET: process.env.NITRO_PRESET || "node-server",
  BACKEND_URL: process.env.BACKEND_URL || `http://127.0.0.1:${INTERNAL_BACKEND_PORT}`,
  VITE_API_URL: process.env.VITE_API_URL || `http://127.0.0.1:${INTERNAL_BACKEND_PORT}`,
  VITE_SITE_URL:
    process.env.VITE_SITE_URL || process.env.SITE_ORIGIN || "https://ketanp10.sg-host.com",
};

console.log(`Building frontend: preset=${env.NITRO_PRESET} backend=${env.BACKEND_URL}`);

// shell: true is required on Windows, where spawning npm (a .cmd shim)
// directly fails with EINVAL. Harmless on Linux, where the host actually runs.
const child = spawn("npm", ["run", "build"], {
  cwd: path.join(__dirname, "frontend"),
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 1));
