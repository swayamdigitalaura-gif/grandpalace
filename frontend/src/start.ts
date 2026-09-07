import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { API_URL } from "./lib/admin-api";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Admin-managed URL redirects (real server-side 301/302, checked before any
// route matching/SSR happens). Skipped for admin/API/asset requests and
// anything with a file extension so it can never intercept static assets,
// the admin panel, or robots.txt/sitemap.xml.
const redirectMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const { pathname } = url;
  const lastSegment = pathname.split("/").pop() ?? "";
  const isAsset = lastSegment.includes(".");
  const isExempt = pathname.startsWith("/admin") || pathname.startsWith("/api") || pathname.startsWith("/_") || isAsset;

  if (!isExempt) {
    try {
      const res = await fetch(`${API_URL}/api/seo/redirects/lookup?path=${encodeURIComponent(pathname)}`);
      if (res.ok) {
        const redirect = await res.json();
        if (redirect?.toPath) {
          return new Response(null, {
            status: redirect.statusCode ?? 301,
            headers: { Location: redirect.toPath },
          });
        }
      }
    } catch {
      // a backend hiccup should never take the whole site down — just skip the redirect check
    }
  }

  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [redirectMiddleware, errorMiddleware],
}));
