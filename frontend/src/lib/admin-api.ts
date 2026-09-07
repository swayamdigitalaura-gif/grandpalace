// Absolute backend URL — used by SSR route loaders (menu, gallery, guides,
// whats-on, sitemap, etc.) that call `fetch(`${API_URL}${path}`)` directly.
// Those run server-side in the Nitro function, where fetch() has NO implicit
// origin, so this must stay an absolute URL — do NOT make it "" / relative,
// that breaks every server-side data fetch on the site (they'd silently
// fall back to stale bundled/default content instead of throwing loudly).
// Resolved at RUNTIME on the server first (process.env), falling back to the
// build-time inlined value. Self-hosted Node deployments (e.g. SiteGround)
// inject env vars into the running process rather than the build, so a
// build-time-only value silently stays stale there — every SSR fetch then
// fails and the page quietly renders bundled fallback content instead of
// live database content. `process` is undefined in the browser, hence the
// typeof guard; browser code never uses this constant anyway (it fetches
// relative paths through the /api/** proxy — see the note in request()).
const API_URL =
  (typeof process !== "undefined" && process.env?.VITE_API_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

// The site's own public URL — used for canonical tags, sitemap.xml,
// robots.txt's Sitemap line, and OG/Twitter image URLs. Same runtime-first
// resolution as API_URL above, for the same reason (self-hosted deploys
// inject env vars at runtime, not build time). Update VITE_SITE_URL when
// the real domain (thegrandpalace.com.au) goes live — every one of those
// features reads from here, so it's a one-place change.
const SITE_URL =
  (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
  import.meta.env.VITE_SITE_URL ||
  "https://ketanp10.sg-host.com";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // FormData (file uploads) must NOT get an explicit Content-Type — the browser
  // sets multipart/form-data with the correct boundary itself. Setting it manually
  // (as "application/json") corrupts the upload and the server can't parse it.
  const isFormData = options.body instanceof FormData;
  // This helper is only ever called from browser-side code (React Query hooks,
  // form submits) — never from a server-side route loader (those fetch directly
  // with API_URL above). A relative path here resolves against the current page's
  // own origin, which the browser proxies through this site's own /api/** route
  // (see vite.config.ts routeRules) to the separate backend project — making the
  // auth cookie first-party instead of cross-domain, which browsers increasingly
  // block by default. Deliberately ignores API_URL, unlike the SSR loaders above.
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, file: File, fieldName = "photo") => {
    const form = new FormData();
    form.append(fieldName, file);
    return request<T>(path, { method: "POST", body: form });
  },
  // Vercel serverless functions cap request bodies at ~4.5MB, so anything
  // routed through our own endpoint (the `upload` helper above) fails for
  // typical phone-camera photos. This instead fetches a short-lived token
  // from our backend (via the normal cookie-authenticated `request()` path,
  // since the Blob SDK's own `upload()` helper doesn't support sending
  // credentials cross-origin), then uploads the file bytes straight to Blob
  // storage from the browser using that token, bypassing our function
  // entirely for the actual file bytes.
  async uploadDirect(file: File): Promise<{ url: string }> {
    const { put } = await import("@vercel/blob/client");
    const { clientToken } = await request<{ clientToken: string }>("/api/uploads/client-token", {
      method: "POST",
      body: JSON.stringify({
        type: "blob.generate-client-token",
        payload: { pathname: file.name, clientPayload: null, multipart: false },
      }),
    });
    const blob = await put(file.name, file, { access: "public", token: clientToken });
    return { url: blob.url };
  },
};

export { ApiError, API_URL, SITE_URL };

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string | null;
  badge: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  extra: Record<string, unknown> | null;
};

export type MenuCategory = {
  id: string;
  menuType: string;
  menuLabel: string | null;
  slug: string;
  label: string;
  tag: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
  items: MenuItem[];
};

export type MenuTypeInfo = { menuType: string; label: string };

export type Enquiry = {
  id: string;
  type: string;
  status: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  step: string | null;
  sessionId: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type PageContent = {
  id: string;
  path: string;
  heroKicker: string | null;
  heroHeadlineTop: string | null;
  heroHeadlineBottom: string | null;
  heroSubtext: string | null;
  aboutHeading: string | null;
  aboutBody: string | null;
  menuSectionHeading: string | null;
  menuSectionBody: string | null;
  menuSectionImage: string | null;
  updatedAt: string;
};

export type SeoSetting = {
  id: string;
  path: string;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeywords: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  schema: Record<string, unknown> | null;
  headTags: string | null;
  updatedAt: string;
};

export type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  active: boolean;
  createdAt: string;
};

export type SiteSeoConfig = {
  id: string;
  robotsTxt: string | null;
  headerCode: string | null;
  footerCode: string | null;
};

export type Review = {
  id: string;
  name: string;
  quote: string;
  stars: number;
  source: string | null;
  reviewerMeta: string | null;
  active: boolean;
  sortOrder: number;
};

export type GalleryImage = {
  id: string;
  collection: string;
  category: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type SitePage = {
  id: string;
  slug: string;
  emoji: string | null;
  badge: string | null;
  badgeColor: string | null;
  title: string;
  subtitle: string;
  heroImage: string;
  cardImageHeight: number | null;
  sidebarImage: string;
  sidebarVideo: string | null;
  heroVideo: string | null;
  galleryImages: string[] | null;
  contentBlocks: Array<{ subtitle?: string; body: string }> | null;
  highlightLine: string | null;
  intro: string | null;
  sections: Array<{ heading: string; priceTag?: string; intro?: string; items: string[]; description?: string; tags?: string[]; character?: string; itemIcons?: ("pin" | "clock" | "phone" | "navigation" | "message" | "mail")[] }>;
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string | null;
  cta2Href: string | null;
  published: boolean;
};

export type GuideQuickFact = { label: string; value: string };
export type GuideComparisonRow = { name: string; area: string; style: string; dietary: string; goodForGroups: boolean; highlight?: boolean };
export type GuideComparisonTable = { title: string; note?: string; rows: GuideComparisonRow[] };
export type GuideBlockType = "listing" | "text" | "box" | "row";
export type GuideBulletItem = { title: string; description: string };
export type GuideSection = {
  heading: string; body: string[]; bullets?: string[]; bulletItems?: GuideBulletItem[];
  image?: string; imageAlt?: string; bannerIcon?: string; blockType?: GuideBlockType; items?: string[];
  showFactsTable?: boolean; address?: string; timing?: string;
};
export type GuideFAQ = { q: string; a: string };
export type GuideExternalLink = { label: string; href: string; source: string };
export type GuidePricingRow = { item: string; price: string; note?: string };

export type Guide = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  tag: string;
  publishedDate: string;
  publishedDateDisplay: string;
  updatedDate: string;
  updatedDateDisplay: string;
  excerpt: string;
  intro: string;
  quickAnswer: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
  quickFacts: GuideQuickFact[] | null;
  comparisonTable: GuideComparisonTable | null;
  sections: GuideSection[];
  pricingTable: { title: string; note?: string; rows: GuidePricingRow[] } | null;
  externalLinks: GuideExternalLink[] | null;
  faq: GuideFAQ[];
  relatedSlugs: string[];
  ctaLabel: string;
  ctaHref: string;
  published: boolean;
  sortOrder: number;
  guideType: "normal" | "listicle";
};
