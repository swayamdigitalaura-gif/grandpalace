import { SITE_URL, type SeoSetting } from "@/lib/admin-api";
import { RESTAURANT_EMAIL, RESTAURANT_PHONE_TEL } from "@/lib/guidesContent";
import { sitePage } from "@/lib/sitePages";

// Central head builder for every public page. Each route passes its own
// built-in defaults; whatever is saved in admin (SEO → Pages, keyed by path)
// overrides them field-by-field. The admin override is fetched once per
// request by the root loader (see __root.tsx) and read back here from the
// root match, since TanStack keeps the *leaf* route's meta over its parents'
// — so an override can only win if the leaf route applies it itself.

export const SITE_NAME = "The Grand Palace";
export const OG_LOCALE = "en_AU";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/site-image-defaults/about-hero.jpg`;

export type SeoOverride = Pick<
  SeoSetting,
  | "path"
  | "metaTitle"
  | "metaDescription"
  | "focusKeywords"
  | "ogImage"
  | "canonicalUrl"
  | "schema"
  | "headTags"
>;

export type SeoDefaults = {
  title: string;
  description: string;
  keywords?: string;
  /** Absolute URL, or a site-relative path ("/site-image-defaults/x.jpg"). */
  image?: string | null;
  type?: "website" | "article";
  /** JSON-LD objects built by the page itself (Article, FAQPage, etc). */
  schema?: unknown[];
  /** Breadcrumb trail after Home, e.g. [{ name: "Menu", path: "/menu" }, { name: "Set Menu" }]. */
  breadcrumbs?: { name: string; path?: string }[];
};

type HeadCtx = { matches?: { routeId?: string; loaderData?: unknown }[] };
type MetaTag = Record<string, unknown>;

// An earlier preview deployment whose URLs are still stored in some guide
// content; the same files are served from the real domain.
const OLD_HOSTS = /^https?:\/\/palace-art-reimagined-main\.vercel\.app/;

export const absUrl = (u: string) =>
  /^https?:\/\//.test(u)
    ? u.replace(OLD_HOSTS, SITE_URL)
    : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;

/** The admin override for `path`, if the root loader fetched one for it. */
export function getSeoOverride(ctx: HeadCtx | undefined, path: string): SeoOverride | null {
  const root = ctx?.matches?.find((m) => m.routeId === "__root__")?.loaderData as
    { seo?: SeoOverride | null } | undefined;
  const seo = root?.seo;
  return seo && normPath(seo.path) === normPath(path) ? seo : null;
}

const TITLE_MAX = 60;
const DESC_MAX = 160;

/** Appends the brand only as far as it still fits in a search-result title. */
export function titleWithBrand(base: string) {
  for (const suffix of [" | The Grand Palace Sydney CBD", " | The Grand Palace"]) {
    if (base.length + suffix.length <= TITLE_MAX) return base + suffix;
  }
  return base;
}

const plain = (s: string) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();

const clip = (s: string) =>
  s.length > DESC_MAX ? s.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "") + "…" : s;

/** A meta description from a short lead line, topped up with whole sentences
 *  from the body until it reaches a useful length (max 160 chars). If the
 *  lead is short and the body's first sentence won't fit after it, the body
 *  alone is used instead. */
export function fitDescription(lead: string, body?: string | null) {
  let out = plain(lead);
  const text = body ? plain(body) : "";
  if (out.length >= 120 || !text) return clip(out);
  for (const sentence of text.match(/[^.!?]+[.!?]+/g) ?? []) {
    const next = `${out}${/[.!?]$/.test(out) ? "" : "."} ${sentence.trim()}`;
    if (next.length > DESC_MAX) break;
    out = next;
  }
  if (out.length < 110 && text.length > out.length) out = text;
  return clip(out);
}

export const normPath = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** Pulls <meta> and <link> tags out of the admin "Extra Head Tags" box. Only
 *  those two tag types are supported — scripts belong in Header Code. */
function parseHeadTags(html: string | null | undefined) {
  const meta: MetaTag[] = [];
  const links: Record<string, string>[] = [];
  if (!html) return { meta, links };
  for (const m of html.matchAll(/<(meta|link)\b([^>]*?)\/?>/gi)) {
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g))
      attrs[a[1]] = a[3] ?? a[4] ?? "";
    if (m[1].toLowerCase() === "meta") meta.push(attrs);
    else if (attrs.rel !== "canonical") links.push(attrs);
  }
  return { meta, links };
}

export function breadcrumbSchema(path: string, trail: { name: string; path?: string }[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absUrl(c.path ?? path),
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** The restaurant as a schema.org entity — used on the homepage and contact page. */
export function restaurantSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: "The Grand Palace Indian Restaurant",
    alternateName: "The Grand Palace",
    description:
      "Indian fine dining in Sydney CBD with a HACCP certified kitchen, a Gold Catering Licence and halal-certified meats. Dine-in, private functions, and office and venue catering.",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    image: DEFAULT_OG_IMAGE,
    telephone: RESTAURANT_PHONE_TEL,
    email: RESTAURANT_EMAIL,
    servesCuisine: "Indian",
    acceptsReservations: true,
    menu: `${SITE_URL}/menu`,
    hasMenu: `${SITE_URL}/menu`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Basement, 261 George Street",
      addressLocality: "Sydney",
      addressRegion: "NSW",
      postalCode: "2000",
      addressCountry: "AU",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "12:00",
        closes: "15:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "17:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday"],
        opens: "17:00",
        closes: "22:30",
      },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/book-a-table` },
      result: { "@type": "FoodEstablishmentReservation", name: "Table reservation" },
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#restaurant` },
    inLanguage: "en-AU",
  };
}

/** Head for one of the static SITE_PAGES — its defaults, a Home › (Parent ›)
 *  Page breadcrumb, any page-specific schema, and the admin override. */
export function pageHead(ctx: HeadCtx | undefined, path: string, schema: unknown[] = []) {
  return buildSeoHead(ctx, path, { ...pageDefaults(path), schema });
}

/** Built-in SEO for a static page — shared by pageHead() and admin. */
export function pageDefaults(path: string): SeoDefaults {
  const p = sitePage(path);
  return {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    image: p.image,
    breadcrumbs: [...(p.parent ? [p.parent] : []), { name: p.label.replace(/ Hub$/, "") }],
  };
}

/** The canonical URL a page gets when admin leaves it blank. */
export const defaultCanonical = (path: string) => absUrl(path === "/" ? "/" : normPath(path));

type GuideLike = {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroImage?: string | null;
  sections?: { image?: string | null }[];
  publishedDate?: string;
  updatedDate?: string;
};

/** A slug as a starting focus keyword ("best-vegan-restaurant-sydney" →
 *  "best vegan restaurant sydney") — slugs here are written as the target query. */
const slugKeyword = (slug: string) => slug.replace(/-/g, " ");

/** Built-in SEO for a guide/blog post — shared by its route head and the
 *  admin SEO panel, which pre-fills its fields from this. */
export function guideDefaults(g: GuideLike): SeoDefaults {
  return {
    title: g.metaTitle,
    description: g.metaDescription,
    keywords: slugKeyword(g.slug),
    // Most guides have no dedicated hero image — fall back to the first
    // in-article photo so each post gets its own share preview instead of
    // every post showing the same site-wide default.
    image: g.heroImage || g.sections?.find((s) => s.image)?.image || null,
    type: "article",
  };
}

type WhatsOnLike = {
  slug: string;
  title: string;
  subtitle: string;
  intro?: string | null;
  heroImage?: string | null;
};

/** Built-in SEO for a What's On page — shared by its route head and admin. */
export function whatsOnDefaults(p: WhatsOnLike): SeoDefaults {
  return {
    title: titleWithBrand(p.title),
    description: fitDescription(p.subtitle, p.intro),
    keywords: slugKeyword(p.slug),
    image: p.heroImage || null,
    breadcrumbs: [{ name: "What's On", path: "/whats-on" }, { name: p.title }],
  };
}

/** Head for a guide or blog post. Its Article/FAQ/Breadcrumb schema is
 *  rendered by the template itself, so none is added here. */
export function guideHead(ctx: HeadCtx | undefined, base: "/guides" | "/blog", g: GuideLike) {
  const head = buildSeoHead(ctx, `${base}/${g.slug}`, guideDefaults(g));
  if (g.publishedDate)
    head.meta.push({ property: "article:published_time", content: g.publishedDate });
  if (g.updatedDate) head.meta.push({ property: "article:modified_time", content: g.updatedDate });
  return head;
}

/**
 * Builds a route's full head: title, description, keywords, canonical, Open
 * Graph, Twitter and JSON-LD — with the admin override (if any) applied on top.
 */
export function buildSeoHead(ctx: HeadCtx | undefined, path: string, d: SeoDefaults) {
  const o = getSeoOverride(ctx, path);
  const title = o?.metaTitle?.trim() || d.title;
  const description = o?.metaDescription?.trim() || d.description;
  const keywords = o?.focusKeywords?.trim() || d.keywords || "";
  const image = absUrl(o?.ogImage?.trim() || d.image || DEFAULT_OG_IMAGE);
  const canonical = o?.canonicalUrl?.trim() || defaultCanonical(path);
  const type = d.type ?? "website";

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    ...(keywords ? [{ name: "keywords", content: keywords }] : []),
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: title },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: OG_LOCALE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];

  // Admin schema replaces the page's own main schema (as the admin screen
  // says); the breadcrumb trail is structural and always kept.
  const custom = o?.schema;
  const pageSchema = custom ? (Array.isArray(custom) ? custom : [custom]) : (d.schema ?? []);
  const schemas = [...pageSchema];
  if (path !== "/" && d.breadcrumbs?.length) schemas.push(breadcrumbSchema(path, d.breadcrumbs));
  for (const s of schemas) if (s) meta.push({ "script:ld+json": s });

  const extra = parseHeadTags(o?.headTags);
  // Extra head tags come last in the array so they win over the defaults
  // above for the same name/property (TanStack keeps the last one per key
  // within a route's own meta list).
  const extraKeys = new Set(
    extra.meta.map((m) => (m.name ?? m.property) as string).filter(Boolean),
  );
  const finalMeta = [
    ...meta.filter((m) => !extraKeys.has((m.name ?? m.property) as string)),
    ...extra.meta,
  ];

  return { meta: finalMeta, links: [{ rel: "canonical", href: canonical }, ...extra.links] };
}
