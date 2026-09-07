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

child.on("exit", async (code) => {
  if (code !== 0) process.exit(code ?? 1);

  // Nitro's node-server output is fully self-contained — it bundles every
  // dependency it needs into .output/ (~750 files). frontend/node_modules
  // (~34,000 files) is build-time only and unused at runtime, so it's
  // removed here.
  //
  // This is not a size optimisation: SiteGround enforces an *inode* (file
  // count) quota, and two node_modules trees alone are enough to exhaust it
  // — leaving it in place is what tripped "Site Limit Exceeded". Verified by
  // booting the built server with the directory removed: every route,
  // including SSR pages reading from the database, renders identically.
  //
  // backend/node_modules is NOT removed — the Express app runs from source
  // and genuinely needs its dependencies (and Prisma's generated client) at
  // runtime.
  if (process.env.KEEP_FRONTEND_NODE_MODULES) {
    console.log("KEEP_FRONTEND_NODE_MODULES set — leaving frontend/node_modules in place.");
    process.exit(0);
  }

  const target = path.join(__dirname, "frontend", "node_modules");
  try {
    const { rm } = await import("node:fs/promises");
    await rm(target, { recursive: true, force: true });
    console.log("Removed frontend/node_modules (not needed at runtime; frees ~34k inodes).");
  } catch (err) {
    // Never fail the build over cleanup — a host that refuses the delete
    // still has a working app, just a fuller disk.
    console.warn(`Could not remove frontend/node_modules: ${err.message}`);
  }
  process.exit(0);
});
