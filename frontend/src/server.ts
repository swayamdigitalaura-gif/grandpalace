import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // TEMPORARY: SiteGround exposes no runtime log and no File Manager for
    // this app, so there is no way to see why the backend process isn't
    // answering (502 on every /api/** call) without piping the file it logs
    // to (backend-debug.log, written by the root server.js) back out over
    // HTTP. Remove this block once the backend issue is diagnosed and fixed.
    const url = new URL(request.url);
    if (url.pathname === "/__debug-backend-log") {
      try {
        const { readFileSync } = await import("node:fs");
        const path = await import("node:path");
        // frontend runs with cwd = frontend/, the log is one level up at the
        // app root (see root server.js: path.join(__dirname, "backend-debug.log")).
        const logPath = path.join(process.cwd(), "..", "backend-debug.log");
        const content = readFileSync(logPath, "utf-8");
        return new Response(content || "(log file is empty)", {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      } catch (err) {
        return new Response(`Could not read log: ${err instanceof Error ? err.message : String(err)}`, {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
