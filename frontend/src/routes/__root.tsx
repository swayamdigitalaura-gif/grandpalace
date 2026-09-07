import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { API_URL, SITE_URL } from "../lib/admin-api";

type SiteSeoConfigLite = { headerCode: string | null; footerCode: string | null };

type ThemeSetting = {
  colorSaffron?: string | null; colorGold?: string | null;
  colorPalace?: string | null; colorCream?: string | null;
  fontDisplay?: string | null; fontBody?: string | null;
  baseFontScale?: string | null;
};

type RootLoaderData = SiteSeoConfigLite & { theme: ThemeSetting | null };

async function fetchRootData(): Promise<RootLoaderData> {
  const seoP = fetch(`${API_URL}/api/seo/config`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const themeP = fetch(`${API_URL}/api/content/theme`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [seo, theme] = await Promise.all([seoP, themeP]);
  return {
    headerCode: seo?.headerCode ?? null,
    footerCode: seo?.footerCode ?? null,
    theme: theme ?? null,
  };
}

// Turns the admin Theme tokens into a small CSS block that overrides the
// design-system variables site-wide. Only emits variables that are actually
// set, so anything left blank keeps the styles.css default.
function themeToCss(theme: ThemeSetting | null): string {
  if (!theme) return "";
  const decls: string[] = [];
  if (theme.colorSaffron) decls.push(`--color-saffron:${theme.colorSaffron};`);
  if (theme.colorGold) decls.push(`--color-gold:${theme.colorGold};`);
  if (theme.colorPalace) decls.push(`--color-palace:${theme.colorPalace};`);
  if (theme.colorCream) decls.push(`--color-cream:${theme.colorCream};`);
  if (theme.fontDisplay) decls.push(`--font-display:${theme.fontDisplay};`);
  if (theme.fontBody) { decls.push(`--font-sans:${theme.fontBody};`); decls.push(`--font-body:${theme.fontBody};`); }
  const root = decls.length ? `:root{${decls.join("")}}` : "";
  const scale = theme.baseFontScale && Number(theme.baseFontScale) > 0
    ? `html{font-size:${Number(theme.baseFontScale) * 100}%;}`
    : "";
  return root + scale;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => fetchRootData(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Grand Palace Indian Restaurant | Sydney CBD" },
      { name: "description", content: "Authentic Indian fine dining in Sydney CBD. Birthday packages, events, catering and à la carte dining at The Grand Palace." },
      { name: "author", content: "The Grand Palace" },
      { property: "og:title", content: "The Grand Palace Indian Restaurant | Sydney CBD" },
      { property: "og:description", content: "Authentic Indian fine dining in Sydney CBD. Birthday packages, events, catering and à la carte dining at The Grand Palace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Grand Palace Indian Restaurant | Sydney CBD" },
      { name: "twitter:description", content: "Authentic Indian fine dining in Sydney CBD. Birthday packages, events, catering and à la carte dining at The Grand Palace." },
      { property: "og:image", content: `${SITE_URL}/site-image-defaults/about-hero.jpg` },
      { name: "twitter:image", content: `${SITE_URL}/site-image-defaults/about-hero.jpg` },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // Admin-managed site-wide code injection (e.g. GTM). Rendered as real HTML
  // via SSR (not a client-side innerHTML mutation), so any <script> tags in
  // it execute normally on page load. Placed at the top/bottom of <body> —
  // not literally inside <head> — since arbitrary pasted markup (multiple
  // tags, mixed content) isn't valid as a direct child of <head>.
  const data = Route.useLoaderData();
  const headerCode = data?.headerCode ?? null;
  const footerCode = data?.footerCode ?? null;
  const themeCss = themeToCss(data?.theme ?? null);

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      </head>
      <body>
        {headerCode && <div dangerouslySetInnerHTML={{ __html: headerCode }} />}
        {children}
        {footerCode && <div dangerouslySetInnerHTML={{ __html: footerCode }} />}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
