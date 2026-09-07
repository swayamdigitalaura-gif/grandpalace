import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { PageShell } from "@/components/PageShell";
import {
  ArrowRight, MapPin, Phone, Mail, Clock, ExternalLink as ExternalLinkIcon,
  CheckCircle2, X, MapPinned, Globe, CalendarCheck,
  Sparkles, Soup, Pizza, Utensils, Coffee, Beer, Salad,
} from "lucide-react";
import mandala from "@/assets/mandala.png";
import type { GuideContent, GuideComparisonTable } from "@/lib/guidesContent";
import { REVIEWER, GUIDE_AUTHOR, RESTAURANT_ADDRESS, RESTAURANT_PHONE_DISPLAY, RESTAURANT_PHONE_TEL, RESTAURANT_EMAIL, guidesContent } from "@/lib/guidesContent";
import { SITE_URL as CURRENT_LIVE_SITE_URL } from "@/lib/admin-api";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.93 21.93 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

export const SITE_URL = "https://www.thegrandpalace.com.au";
// Where these guides actually live right now — thegrandpalace.com.au still
// serves the old WordPress site, so schema/canonical URLs for guide pages
// must point at wherever the new site is actually deployed (currently
// SiteGround), not the real business domain. Sourced from admin-api.ts's
// SITE_URL so this updates in one place (VITE_SITE_URL) when the domain
// cuts over, instead of needing a code change here too.
export const CANONICAL_BASE_URL = CURRENT_LIVE_SITE_URL;
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(RESTAURANT_ADDRESS + ", Australia");

/** Strips the rich-text markup used in guide body copy (bold, links, custom
 *  color/size spans) down to plain text — used when lifting copy into JSON-LD,
 *  which must not contain markup syntax. */
function stripInlineMarkup(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\{\{color:[^}]+\}\}([\s\S]*?)\{\{\/color\}\}/g, "$1")
    .replace(/\{\{size:[^}]+\}\}([\s\S]*?)\{\{\/size\}\}/g, "$1")
    .trim();
}

/** Finds the first numbered-list ("1. ", "2. " ...) of 3+ items inside any
 *  section body — e.g. walking directions — and returns it as plain-text
 *  steps for HowTo schema. Works for any guide with such a list, not just
 *  Wynyard, so every "near [station]" guide picks this up automatically. */
function extractHowToSteps(guide: GuideContent): string[] | null {
  for (const section of guide.sections) {
    for (const block of section.body) {
      const steps = block
        .split("\n")
        .map((line) => line.match(/^\d+\.\s+(.+)/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => stripInlineMarkup(m[1]));
      if (steps.length >= 3) return steps;
    }
  }
  return null;
}

export function buildSchema(guide: GuideContent) {
  const url = `${CANONICAL_BASE_URL}/guides/${guide.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    ...(guide.heroImage ? { image: guide.heroImage } : {}),
    datePublished: guide.publishedDate,
    dateModified: guide.updatedDate,
    author: { "@type": "Person", name: GUIDE_AUTHOR.name },
    publisher: {
      "@type": "Organization",
      name: "The Grand Palace Indian Restaurant",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqSchema = guide.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: CANONICAL_BASE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${CANONICAL_BASE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: url },
    ],
  };

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "The Grand Palace Indian Restaurant",
    description: "HACCP certified kitchen holding a Gold Catering Licence, serving halal-certified meats across the full menu, in the basement at 261 George Street, Sydney CBD.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Basement, 261 George Street",
      addressLocality: "Sydney",
      addressRegion: "NSW",
      postalCode: "2000",
      addressCountry: "AU",
    },
    telephone: RESTAURANT_PHONE_TEL,
    email: RESTAURANT_EMAIL,
    servesCuisine: "Indian",
    url: SITE_URL,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "12:00", closes: "15:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], opens: "17:00", closes: "22:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday"], opens: "17:00", closes: "22:30" },
    ],
  };

  const howToSteps = extractHowToSteps(guide);
  const howToSchema = howToSteps
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `How to Get to The Grand Palace — ${guide.title}`,
        step: howToSteps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
      }
    : null;

  return [articleSchema, faqSchema, howToSchema, breadcrumbSchema, restaurantSchema].filter(Boolean);
}

/** Renders "[label](href)" markdown-style links as real internal (Link) or
 *  external (<a>) anchors, "**text**" as a bold/emphasised inline tag,
 *  "{{color:#hex}}text{{/color}}" as a custom-coloured span, and
 *  "{{size:NNpx}}text{{/size}}" as a precisely resized span — works inside
 *  headings (H1/H2) as well as body paragraphs, so a title or section
 *  heading can carry any of these without any code change. */
export function renderRich(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\{\{color:(#[0-9a-fA-F]{3,8})\}\}([\s\S]*?)\{\{\/color\}\}|\{\{size:(\d{1,3})px\}\}([\s\S]*?)\{\{\/size\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const [, label, href, bold, colorHex, colorText, sizePx, sizeText] = match;
    if (bold !== undefined) {
      parts.push(
        <span key={i++} className="text-saffron font-semibold">{renderRich(bold)}</span>
      );
    } else if (colorHex !== undefined) {
      parts.push(
        <span key={i++} style={{ color: colorHex }}>{renderRich(colorText)}</span>
      );
    } else if (sizePx !== undefined) {
      parts.push(
        <span key={i++} style={{ fontSize: `${sizePx}px` }}>{renderRich(sizeText)}</span>
      );
    } else if (href.startsWith("tel:") || href.startsWith("mailto:")) {
      parts.push(
        <a key={i++} href={href} className="text-saffron underline decoration-saffron/30 hover:text-gold font-medium">
          {label}
        </a>
      );
    } else if (href.startsWith("http")) {
      parts.push(
        <a key={i++} href={href} target="_blank" rel="noreferrer" className="text-saffron underline decoration-saffron/30 hover:text-gold font-medium">
          {label}
        </a>
      );
    } else {
      parts.push(
        <Link key={i++} to={href} className="text-saffron underline decoration-saffron/30 hover:text-gold font-medium">
          {label}
        </Link>
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Renders a block of text line-by-line, recognizing:
 *    "# "/"## "/"### " at the start of a line → H1/H2/H3 (font-display styled)
 *    "- " or "* " at the start of one or more consecutive lines → a bullet list
 *    "{{image:URL}}" alone on a line → an inline image
 *  and anything else as a plain paragraph (via renderRich, so bold/links/
 *  colour/size all still work inside it). Blank lines are skipped rather than
 *  producing empty paragraphs — they're just separators between blocks. This
 *  is a superset of the old "## "/"### "-only heading convention, so any
 *  existing single-line paragraph renders exactly as it did before. */
export function renderBlockText(text: string, pClassName: string, keyPrefix = ""): ReactNode[] {
  const out: ReactNode[] = [];
  let bulletBuf: string[] = [];
  let orderedBuf: string[] = [];
  let key = 0;
  const flushBullets = () => {
    if (!bulletBuf.length) return;
    out.push(
      <ul key={`${keyPrefix}bul-${key++}`} className="space-y-1.5 my-2">
        {bulletBuf.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron shrink-0 mt-2" />
            <span className={pClassName}>{renderRich(b)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuf = [];
  };
  const flushOrdered = () => {
    if (!orderedBuf.length) return;
    out.push(
      <ol key={`${keyPrefix}ord-${key++}`} className="space-y-3 my-2">
        {orderedBuf.map((b, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg,#c8860a,#e6a020)" }}>{i + 1}</span>
            <span className={pClassName}>{renderRich(b)}</span>
          </li>
        ))}
      </ol>
    );
    orderedBuf = [];
  };
  for (const line of text.split("\n")) {
    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) { flushOrdered(); bulletBuf.push(bullet[1]); continue; }
    const ordered = line.match(/^\d+\.\s+(.+)/);
    if (ordered) { flushBullets(); orderedBuf.push(ordered[1]); continue; }
    flushBullets();
    flushOrdered();
    if (!line.trim()) continue;
    const h1 = line.match(/^#\s+(.+)/);
    if (h1) { out.push(<h1 key={`${keyPrefix}h-${key++}`} className="font-display text-2xl md:text-3xl text-palace mt-6 mb-2 first:mt-0">{renderRich(h1[1])}</h1>); continue; }
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) { out.push(<h2 key={`${keyPrefix}h-${key++}`} className="font-display text-lg md:text-xl text-palace mt-5 mb-2 first:mt-0">{renderRich(h2[1])}</h2>); continue; }
    const h3 = line.match(/^###\s+(.+)/);
    if (h3) { out.push(<h3 key={`${keyPrefix}h-${key++}`} className="font-display text-base md:text-lg text-palace mt-4 mb-1.5 first:mt-0">{renderRich(h3[1])}</h3>); continue; }
    const img = line.match(/^\{\{image:([^}]+)\}\}$/);
    if (img) { out.push(<img key={`${keyPrefix}img-${key++}`} src={img[1]} alt="" loading="lazy" decoding="async" className="w-full rounded-xl my-3 object-cover" />); continue; }
    out.push(<p key={`${keyPrefix}p-${key++}`} className={pClassName}>{renderRich(line)}</p>);
  }
  flushBullets();
  flushOrdered();
  return out;
}

/** Renders body paragraphs — each array item is passed through
 *  `renderBlockText`, so within any one paragraph field, an admin can mix
 *  headings, bullet lists, inline images and plain text by using the
 *  editor's toolbar (each insert adds the right line-prefix/markup). */
export function renderBody(paragraphs: string[], pClassName: string): ReactNode[] {
  return paragraphs.flatMap((p, j) => renderBlockText(p, pClassName, `b${j}-`));
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const EXPLORE_LINKS = [
  { label: "Full À la Carte Menu", to: "/menu" },
  { label: "Book a Table", to: "/book-a-table" },
  { label: "Set Menu Banquets", to: "/set-menu" },
  { label: "Private Venue & Catering", to: "/venue-catering" },
];

/* Cuisine-style banner shown when a listing has no photo of its own — avoids
   using unlicensed third-party restaurant photography while still giving every
   card a visual anchor. */
const BANNER_STYLES: Record<string, { icon: typeof Sparkles; gradient: string; label: string }> = {
  "fine-dining": { icon: Sparkles, gradient: "linear-gradient(135deg,#6b4a8a,#9c6bc9)", label: "Fine Dining" },
  ramen: { icon: Soup, gradient: "linear-gradient(135deg,#0e7c7b,#14b8a6)", label: "Noodles & Small Plates" },
  pizza: { icon: Pizza, gradient: "linear-gradient(135deg,#c0392b,#e67e22)", label: "Italian" },
  smallplates: { icon: Utensils, gradient: "linear-gradient(135deg,#2f7a3c,#5cb85c)", label: "Small Plates" },
  bakery: { icon: Coffee, gradient: "linear-gradient(135deg,#a9682f,#d9a441)", label: "Café & Bakery" },
  pub: { icon: Beer, gradient: "linear-gradient(135deg,#4a3220,#8a5a2f)", label: "Pub Food" },
  thai: { icon: Salad, gradient: "linear-gradient(135deg,#1f7a4d,#3fae6e)", label: "Thai" },
  vietnamese: { icon: Soup, gradient: "linear-gradient(135deg,#c2185b,#e05a92)", label: "Vietnamese" },
  malaysian: { icon: Soup, gradient: "linear-gradient(135deg,#b8860b,#e0a72a)", label: "Malaysian" },
  middleeastern: { icon: Utensils, gradient: "linear-gradient(135deg,#8a4a2f,#c17a4a)", label: "Middle Eastern" },
  lebanese: { icon: Utensils, gradient: "linear-gradient(135deg,#556b2f,#8a9a4a)", label: "Lebanese" },
};

/** Image below the hero band, above the reviewer strip. No-op if the guide has none. */
export function GuideHeroImage({ guide }: { guide: GuideContent }) {
  if (!guide.heroImage) return null;
  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-md mx-auto px-6 py-8">
        <img
          src={guide.heroImage}
          alt={guide.heroImageAlt || guide.title}
          loading="eager"
          fetchPriority="high"
          className="w-full max-h-[380px] rounded-2xl object-contain mx-auto"
        />
      </div>
    </div>
  );
}

/** Exact, approved author bio — same on every guide. Do not vary the copy per guide. */
export function AuthorBio() {
  return (
    <div className="mb-8 max-w-3xl mx-auto">
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/70 border border-saffron/20">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-lg"
          style={{ background: "linear-gradient(135deg,oklch(88% .16 88),oklch(68% .14 70))" }}
        >
          NS
        </div>
        <div>
          <p className="font-semibold text-palace mb-2 text-[15px]">{GUIDE_AUTHOR.name}</p>
          {GUIDE_AUTHOR.bioParagraphs.map((p, i) => (
            <p key={i} className="text-palace/65 text-[13.5px] leading-relaxed mb-2 last:mb-0">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MobileCTABar({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[10000] bg-palace/97 backdrop-blur border-t border-saffron/25 px-4 py-3 flex items-center gap-3 transition-transform duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
    >
      <a href={`tel:${RESTAURANT_PHONE_TEL}`} className="btn-outline-gold flex-1 inline-flex items-center justify-center text-[13px] py-2.5 px-3">Call</a>
      <Link to={ctaHref} className="btn-gold flex-1 inline-flex items-center justify-center gap-1.5 text-[13px] py-2.5 px-3">{ctaLabel}</Link>
    </div>
  );
}

/* Feature/dietary comparison — semantic <table> on desktop, accessible stacked
   cards on mobile (each element hidden via Tailwind `hidden` is removed from the
   a11y tree, so nothing is announced twice by screen readers). */
function ComparisonTable({ table }: { table: GuideComparisonTable }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-xl md:text-2xl text-palace mb-1">{table.title}</h2>
      {table.note && <p className="text-palace/50 text-[12.5px] leading-relaxed mb-4">{table.note}</p>}

      {/* Desktop / tablet: real table, scrolls horizontally if it ever overflows */}
      <div className="hidden sm:block rounded-2xl border border-saffron/20 bg-white/90 overflow-x-auto shadow-sm">
        <table className="w-full text-[13px] border-collapse">
          <caption className="sr-only">{table.title}</caption>
          <thead>
            <tr className="bg-palace text-cream/90">
              <th scope="col" className="text-left font-semibold px-4 py-3">Restaurant</th>
              <th scope="col" className="text-left font-semibold px-4 py-3">Area</th>
              <th scope="col" className="text-left font-semibold px-4 py-3">Style</th>
              <th scope="col" className="text-left font-semibold px-4 py-3">Dietary Highlights</th>
              <th scope="col" className="text-center font-semibold px-4 py-3">Good for Groups</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr
                key={row.name}
                className={`transition-colors duration-150 border-t border-saffron/10 hover:bg-saffron/[0.07] ${
                  row.highlight ? "bg-saffron/[0.08]" : i % 2 === 0 ? "bg-cream/30" : ""
                }`}
              >
                <th scope="row" className="text-left font-medium text-palace px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    {row.name}
                    {row.highlight && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                        Our Pick
                      </span>
                    )}
                  </span>
                </th>
                <td className="px-4 py-3 text-palace/65">
                  <span className="inline-flex items-center gap-1.5"><MapPinned className="h-3.5 w-3.5 text-saffron/70 shrink-0" />{row.area}</span>
                </td>
                <td className="px-4 py-3 text-palace/65">{row.style}</td>
                <td className="px-4 py-3 text-palace/65">{row.dietary}</td>
                <td className="px-4 py-3 text-center">
                  {row.goodForGroups ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" aria-label="Good for groups" />
                  ) : (
                    <X className="h-4 w-4 text-palace/25 mx-auto" aria-label="Not ideal for groups" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="sm:hidden space-y-2.5">
        {table.rows.map((row) => (
          <li
            key={row.name}
            className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
              row.highlight ? "border-saffron/50 bg-saffron/[0.07]" : "border-stone-200 bg-white/85"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="font-semibold text-palace text-[14px]">{row.name}</p>
              {row.highlight && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                  Our Pick
                </span>
              )}
            </div>
            <p className="text-palace/55 text-[12.5px] mb-2 flex items-center gap-1.5">
              <MapPinned className="h-3.5 w-3.5 text-saffron/70 shrink-0" />{row.area} · {row.style}
            </p>
            <p className="text-palace/70 text-[12px] mb-2.5">{row.dietary}</p>
            <div className="flex items-center gap-1.5 text-[12px] text-palace/70">
              {row.goodForGroups ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-palace/30" />}
              Good for groups
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Splits a card's bullet list into clearly labeled groups (falling back to a
   plain list for anything unlabeled) — easier to scan than one flat bulleted
   list. "Features:" / "Dietary options:" (single colon) are the two original
   built-in labels, kept exactly as before for backward compatibility with
   existing content. For any OTHER label, use a double colon —
   "SomeLabel:: text" — e.g. "Ambience:: cosy, candle-lit" — and it becomes
   its own styled group automatically, with zero code changes needed. Plain
   single-colon bullets (like "Best for: ..." or "Try: ...") are deliberately
   left alone so existing guides don't change appearance. */
function BulletGroups({ bullets, compact }: { bullets: string[]; compact: boolean }) {
  const groups: { label: string; values: string[] }[] = [];
  const rest: string[] = [];
  for (const b of bullets) {
    const builtIn = b.match(/^(Features|Dietary options)\s*:\s*(.+)/i);
    const custom = b.match(/^([A-Za-z][A-Za-z ]{1,30})::\s*(.+)/);
    const m = builtIn ?? custom;
    if (m) {
      const label = builtIn
        ? (/dietary/i.test(m[1]) ? "Dietary Options" : "Features")
        : m[1].trim().replace(/\s+/g, " ");
      const existing = groups.find((g) => g.label.toLowerCase() === label.toLowerCase());
      if (existing) existing.values.push(m[2]);
      else groups.push({ label, values: [m[2]] });
    } else {
      rest.push(b);
    }
  }
  const textCls = compact ? "text-[11.5px]" : "text-[13px]";
  return (
    <div className="space-y-2.5">
      {groups.map((g) => (
        <div key={g.label}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-saffron/80 mb-1">{g.label}</p>
          <p className={`text-palace/70 leading-relaxed ${textCls}`}>{g.values.join(" · ")}</p>
        </div>
      ))}
      {rest.length > 0 && (
        <ul className={`space-y-1.5 ${textCls}`}>
          {rest.map((b, j) => (
            <li key={j} className="flex items-start gap-2 text-palace/70 leading-relaxed">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron shrink-0 mt-2" />{renderRich(b)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* Renders bullets as Title + Description cards, styled identically to the
   Features/Dietary labels (orange uppercase label, description below). Used
   anywhere a section has structured bulletItems instead of legacy freeform
   bullets — shared by both the Listicle and Normal guide templates. */
export function BulletItemCards({ items, textSize = "text-[13px]", className = "space-y-2.5" }: {
  items: import("@/lib/guidesContent").GuideBulletItem[];
  textSize?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {items.map((item, idx) => (
        <div key={idx}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-saffron/80 mb-1">{renderRich(item.title)}</p>
          <div className="text-palace/70 leading-relaxed">{renderBlockText(item.description, textSize, `bi${idx}-`)}</div>
        </div>
      ))}
    </div>
  );
}

/* Auto-advancing photo slider — one image visible at a time, cross-fades on
   its own every 3.5s, with clickable dots for manual control. */
function ImageSlider({ images, alt, className = "mb-3 rounded-xl aspect-[16/9]" }: { images: string[]; alt: string; className?: string }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(timer);
  }, [images.length]);
  return (
    <div className={`relative overflow-hidden bg-palace/5 ${className}`}>
      {images.map((img, i) => (
        <img key={i} src={img} alt={`${alt} — photo ${i + 1}`} loading="lazy" decoding="async"
             className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
             style={{ opacity: i === index ? 1 : 0 }} />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Show photo ${i + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{ width: i === index ? "16px" : "6px", background: i === index ? "#f5c14a" : "rgba(255,255,255,0.65)" }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* A single ranked listing — used both as a full-width featured card (#1) and
   as a compact grid tile (everything else), so the list reads as a dense,
   magazine-style grid instead of one long column of near-identical rows. */
function RankCard({ section, num, compact }: {
  section: import("@/lib/guidesContent").GuideSection;
  num: string;
  compact: boolean;
}) {
  const title = section.heading.replace(/^\d+\.\s*/, "");
  const isTopPick = num === "1";
  const banner = section.bannerIcon ? BANNER_STYLES[section.bannerIcon] : undefined;
  return (
    <div
      id={slugify(section.heading)}
      className="scroll-mt-24 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 h-full flex flex-col border-2 border-saffron/50 bg-gradient-to-br from-white to-saffron/[0.06] shadow-[0_10px_30px_-14px_rgba(200,134,10,0.4)]"
    >
      <div className="relative">
        {section.imageSlider && section.imageSlider.length > 0 ? (
          <ImageSlider images={section.imageSlider} alt={title} className="aspect-[16/9]" />
        ) : section.image ? (
          <img src={section.image} alt={section.imageAlt || title} loading="lazy" decoding="async" className="w-full object-cover aspect-[16/9]" />
        ) : banner ? (
          <div className="relative w-full flex flex-col items-center justify-center gap-1.5 overflow-hidden aspect-[16/9]" style={{ background: banner.gradient }}>
            <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 w-32 opacity-[0.15]" />
            <banner.icon className={compact ? "h-6 w-6 text-white/90 relative z-10" : "h-8 w-8 text-white/90 relative z-10"} strokeWidth={1.5} />
            <span className="relative z-10 text-white/85 text-[10px] font-semibold uppercase tracking-widest">{banner.label}</span>
          </div>
        ) : null}
        <div
          className={`absolute top-3 left-3 rounded-full flex items-center justify-center font-display text-white shadow-md ${compact ? "h-7 w-7 text-[13px]" : "h-9 w-9 text-base"}`}
          style={{ background: "linear-gradient(135deg,#c8860a,#f5c14a)" }}
        >
          {num}
        </div>
      </div>
      <div className={`flex flex-col flex-1 ${compact ? "p-4" : "p-5 md:p-6"}`}>
        {isTopPick && (
          <span className="inline-block self-start mb-2 text-[10px] font-bold uppercase tracking-widest text-white px-2.5 py-1 rounded-full"
                style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
            Our Pick
          </span>
        )}
        <h2 className={`font-display text-palace mb-2 ${compact ? "text-base" : "text-lg md:text-xl"}`}>{renderRich(title)}</h2>

        {renderBody(section.body, `text-palace/70 leading-relaxed mb-2.5 ${compact ? "text-[12.5px]" : "text-[13.5px]"}`)}

        {section.mustTryDishes && section.mustTryDishes.length > 0 && (
          <div className={compact ? "mb-2.5" : "mb-3"}>
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-saffron/80 mb-1.5">Must-Try Dishes</p>
            <div className="flex flex-wrap gap-1.5">
              {section.mustTryDishes.map((dish, idx) => (
                <span key={idx} className={`font-semibold rounded-full bg-saffron/10 text-saffron border border-saffron/25 ${compact ? "text-[10.5px] px-2 py-0.5" : "text-[11.5px] px-2.5 py-1"}`}>
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Unified facts panel — address, timing, phone and website together in one place
            (deliberately not split into a separate table above the rest of the card). */}
        {section.showFactsTable !== false && (section.address || section.timing || section.contactInfo?.phone || section.contactInfo?.website) && (
          <div className={`rounded-xl border border-saffron/20 bg-cream/30 divide-y divide-saffron/10 mb-2.5 ${compact ? "text-[11px]" : "text-[12.5px]"}`}>
            {section.address && (
              <div className="flex items-start gap-2 px-3 py-2">
                <MapPin className="h-3.5 w-3.5 text-saffron mt-0.5 shrink-0" />
                <span className="text-palace/75">{section.address}</span>
              </div>
            )}
            {section.timing && (
              <div className="flex items-start gap-2 px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-saffron mt-0.5 shrink-0" />
                <span className="text-palace/75">{section.timing}</span>
              </div>
            )}
            {section.contactInfo?.phone && (
              <div className="flex items-start gap-2 px-3 py-2">
                <Phone className="h-3.5 w-3.5 text-saffron mt-0.5 shrink-0" />
                <a href={section.contactInfo.phoneHref} className="text-palace/75 hover:text-saffron transition">{section.contactInfo.phone}</a>
              </div>
            )}
            {section.contactInfo?.website && (
              <div className="flex items-start gap-2 px-3 py-2 min-w-0">
                <Globe className="h-3.5 w-3.5 text-saffron mt-0.5 shrink-0" />
                <a href={section.contactInfo.websiteHref} target="_blank" rel="noreferrer" className="text-palace/75 hover:text-saffron transition truncate">{section.contactInfo.website}</a>
              </div>
            )}
          </div>
        )}

        {(section.contactInfo?.reviewHref || section.contactInfo?.bookHref) && (
          <div className="flex gap-2 mb-2.5">
            {section.contactInfo.reviewHref && (
              <a href={section.contactInfo.reviewHref} target="_blank" rel="noreferrer"
                 className={`flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg border border-saffron/30 text-palace/75 hover:border-saffron/60 hover:text-saffron transition ${compact ? "text-[10.5px] px-2.5 py-1.5" : "text-[12px] px-3 py-2"}`}>
                <GoogleIcon className="h-3.5 w-3.5" /> {section.contactInfo.reviewLabel || "Reviews"}
              </a>
            )}
            {section.contactInfo.bookHref && (
              <a href={section.contactInfo.bookHref} target="_blank" rel="noreferrer"
                 className={`flex-1 inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg text-white transition hover:opacity-90 ${compact ? "text-[10.5px] px-2.5 py-1.5" : "text-[12px] px-3 py-2"}`}
                 style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                <CalendarCheck className="h-3.5 w-3.5" /> {section.contactInfo.bookLabel || "Book a Table"}
              </a>
            )}
          </div>
        )}

        {section.bulletItems && section.bulletItems.length > 0 ? (
          <BulletItemCards items={section.bulletItems} textSize={compact ? "text-[11.5px]" : "text-[13px]"} className="space-y-2.5" />
        ) : (
          section.bullets && <BulletGroups bullets={section.bullets} compact={compact} />
        )}
      </div>
    </div>
  );
}

/** Groups sections into render blocks: the first ranked listing stays a
 *  full-width feature, the rest collapse into one dense grid, everything
 *  else renders inline. A section counts as a ranked listing either the old
 *  way (heading starts "1. ", "2. " etc., with no blockType set — legacy
 *  content) or the new explicit way (`blockType === "listing"`, regardless
 *  of heading text) — the latter is what lets an admin pick "Listing
 *  (ranked card)" from the block-type dropdown without also having to
 *  hand-type a number into the heading. Numbers come from the heading when
 *  present (preserves exact legacy numbering), otherwise auto-increment. */
type SectionBlock =
  | { type: "single"; section: import("@/lib/guidesContent").GuideSection; key: string; num?: string }
  | { type: "grid"; items: { section: import("@/lib/guidesContent").GuideSection; num: string; key: string }[] };

function groupSections(sections: import("@/lib/guidesContent").GuideSection[]): SectionBlock[] {
  const blocks: SectionBlock[] = [];
  let grid: { section: import("@/lib/guidesContent").GuideSection; num: string; key: string }[] = [];
  let autoNum = 0;
  let sawFirstListing = false;
  sections.forEach((section, i) => {
    const m = section.heading.match(/^(\d+)\.\s*(.+)/);
    const isListing = section.blockType === "listing" || (!section.blockType && !!m);
    if (isListing) {
      autoNum++;
      const num = m ? m[1] : String(autoNum);
      if (!sawFirstListing) {
        sawFirstListing = true;
        if (grid.length) {
          blocks.push({ type: "grid", items: grid });
          grid = [];
        }
        blocks.push({ type: "single", section, key: `s${i}`, num });
        return;
      }
      grid.push({ section, num, key: `s${i}` });
      return;
    }
    if (grid.length) {
      blocks.push({ type: "grid", items: grid });
      grid = [];
    }
    blocks.push({ type: "single", section, key: `s${i}` });
  });
  if (grid.length) blocks.push({ type: "grid", items: grid });
  return blocks;
}

export function GuideTemplate({ guide }: { guide: GuideContent }) {
  const schemas = buildSchema(guide);
  const related = guide.relatedSlugs
    .map((slug) => guidesContent[slug])
    .filter((g): g is GuideContent => Boolean(g));

  return (
    <PageShell crumbs={[{ label: "Guides", to: "/guides" }, { label: `${guide.tag} Guides`, to: "/guides" }, { label: guide.title }]}>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* Hero — typographic + "at a glance" panel; optional photo below */}
      <div className="relative bg-palace overflow-hidden pt-24 pb-10 md:pt-28 md:pb-14 px-6">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-40 -top-32 w-[520px] opacity-[0.07] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-44 -bottom-40 w-[480px] opacity-[0.05] animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div>
            <p className="text-[11px] tracking-[0.45em] uppercase font-bold mb-4" style={{ color: "#f5c14a" }}>
              {guide.tag} Guide · The Grand Palace, Sydney CBD
            </p>
            <h1 className="font-display text-3xl md:text-[2.7rem] leading-[1.15] text-gold-gradient mb-5">{renderRich(guide.title)}</h1>
            <p className="text-cream/60 text-[14.5px] leading-relaxed max-w-xl mb-5">{guide.excerpt}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-cream/50">
              <span>Published {guide.publishedDateDisplay}</span>
              {guide.updatedDate !== guide.publishedDate && (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-emerald-400 font-medium">Updated {guide.updatedDateDisplay}</span>
                </>
              )}
            </div>
          </div>

          {/* At-a-glance panel — local SEO + CRO, no image needed */}
          <div className="rounded-2xl bg-cream/[0.06] border border-cream/15 backdrop-blur-sm p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-saffron mb-1">At a Glance</p>
            <a href={MAPS_URL} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 text-[13px] text-cream/80 hover:text-gold transition">
              <MapPin className="h-4 w-4 text-saffron mt-0.5 shrink-0" /> {RESTAURANT_ADDRESS}
            </a>
            <a href={`tel:${RESTAURANT_PHONE_TEL}`} className="flex items-start gap-2.5 text-[13px] text-cream/80 hover:text-gold transition">
              <Phone className="h-4 w-4 text-saffron mt-0.5 shrink-0" /> {RESTAURANT_PHONE_DISPLAY}
            </a>
            <a href={`mailto:${RESTAURANT_EMAIL}`} className="flex items-start gap-2.5 text-[13px] text-cream/80 hover:text-gold transition break-all">
              <Mail className="h-4 w-4 text-saffron mt-0.5 shrink-0" /> {RESTAURANT_EMAIL}
            </a>
            <div className="flex items-start gap-2.5 text-[13px] text-cream/80">
              <Clock className="h-4 w-4 text-saffron mt-0.5 shrink-0" /> Lunch 12–3pm · Dinner from 5pm, daily
            </div>
            <div className="h-px bg-cream/10 my-1" />
            <Link to={guide.ctaHref} className="btn-gold text-center text-[13px] py-2.5 inline-flex items-center justify-center gap-1.5">
              {guide.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      <GuideHeroImage guide={guide} />

      {/* Reviewer strip — EEAT */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-2 text-[12px] text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {REVIEWER.note}
        </div>
      </div>

      {/* Body */}
      <section className="relative section-cream py-12 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.06] animate-spin-slow" />
        <div className="relative z-10 max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="text-palace/75 mb-6">{renderBlockText(guide.intro, "text-[15px] leading-relaxed")}</div>

              {/* Quick Answer — AEO/GEO answer-engine callout */}
              {guide.quickAnswer && (
                <div id="quick-answer" className="mb-8 rounded-2xl border-l-4 border-saffron bg-white/90 p-5 shadow-sm scroll-mt-24">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-saffron mb-1.5">Quick Answer</p>
                  <div className="text-palace/85 font-medium">{renderBlockText(guide.quickAnswer, "text-[14.5px] leading-relaxed font-medium")}</div>
                </div>
              )}
            </div>

            {guide.comparisonTable && <ComparisonTable table={guide.comparisonTable} />}

            {groupSections(guide.sections).map((block) => {
              if (block.type === "single") {
                const { section, key, num } = block;

                if (num !== undefined) {
                  return (
                    <div key={key} className="mb-6 max-w-3xl mx-auto">
                      <RankCard section={section} num={num} compact={false} />
                    </div>
                  );
                }

                if (section.blockType === "box") {
                  return (
                    <div key={key} id={slugify(section.heading)} className="mb-8 max-w-3xl mx-auto scroll-mt-24 rounded-2xl border-l-4 border-saffron bg-white/90 p-5 md:p-6 shadow-sm">
                      {section.heading && <h2 className="font-display text-lg md:text-xl text-palace mb-2">{renderRich(section.heading)}</h2>}
                      {renderBody(section.body, "text-palace/75 text-[14px] leading-relaxed mb-2.5")}
                      {section.bulletItems && section.bulletItems.length > 0 ? (
                        <BulletItemCards items={section.bulletItems} textSize="text-[14px]" className="mt-1 space-y-2.5" />
                      ) : section.bullets && (
                        <ul className="space-y-1.5 mt-1">
                          {section.bullets.map((b, j) => (
                            <li key={j} className="flex items-start gap-2 text-palace/70 text-[14px] leading-relaxed">
                              <span className="h-1.5 w-1.5 rounded-full bg-saffron shrink-0 mt-2" />{renderRich(b)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                }

                if (section.blockType === "row") {
                  const rowItems = section.items && section.items.length ? section.items : (section.bullets ?? []);
                  return (
                    <div key={key} id={slugify(section.heading)} className="mb-8 max-w-3xl mx-auto scroll-mt-24">
                      {section.heading && <h2 className="font-display text-xl md:text-2xl text-palace mb-3">{renderRich(section.heading)}</h2>}
                      {renderBody(section.body, "text-palace/70 text-[14px] leading-relaxed mb-4")}
                      <div className="flex flex-wrap justify-center gap-3">
                        {rowItems.map((it, j) => {
                          const [titleLine, ...restLines] = it.split("\n");
                          const description = restLines.join("\n");
                          const widthClass = rowItems.length % 3 === 0 ? "sm:w-[calc(33.333%-0.5rem)]" : rowItems.length % 2 === 0 ? "sm:w-[calc(50%-0.375rem)]" : "sm:w-[calc(33.333%-0.5rem)]";
                          return (
                            <div key={j} className={`w-full ${widthClass} rounded-xl border border-saffron/25 bg-white p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                              <p className="font-semibold text-[14px] mb-1.5" style={{ color: "#c8720a" }}>{renderRich(titleLine)}</p>
                              {description && <p className="text-palace/70 text-[12.5px] leading-relaxed">{renderRich(description)}</p>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} id={slugify(section.heading)} className="mb-8 max-w-3xl mx-auto scroll-mt-24">
                    <h2 className="font-display text-xl md:text-2xl text-palace mb-3">{renderRich(section.heading)}</h2>
                    {renderBody(section.body, "text-palace/70 text-[14px] leading-relaxed mb-3")}
                    {section.bulletItems && section.bulletItems.length > 0 ? (
                      <BulletItemCards items={section.bulletItems} textSize="text-[14px]" className="mt-2 space-y-2.5" />
                    ) : section.bullets && (
                      <ul className="space-y-1.5 mt-2">
                        {section.bullets.map((b, j) => (
                          <li key={j} className="flex items-start gap-2 text-palace/70 text-[14px] leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-saffron shrink-0 mt-2" />{renderRich(b)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }

              return (
                <div key={block.items[0]?.key} className="flex flex-col gap-5 mb-8 max-w-3xl mx-auto">
                  {block.items.map(({ section, num, key }) => (
                    <RankCard key={key} section={section} num={num} compact={false} />
                  ))}
                </div>
              );
            })}

            <div className="max-w-3xl mx-auto">
            {guide.pricingTable && (
              <div className="mb-8 rounded-2xl border border-saffron/20 bg-white/80 overflow-hidden">
                <div className="px-5 py-3 border-b border-saffron/15">
                  <h3 className="font-display text-lg text-palace">{guide.pricingTable.title}</h3>
                </div>
                <table className="w-full text-[13px]">
                  <tbody>
                    {guide.pricingTable.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-cream/40" : ""}>
                        <td className="px-5 py-3 text-palace/85 font-medium">{row.item}</td>
                        <td className="px-5 py-3 text-saffron font-bold whitespace-nowrap">{row.price}</td>
                        <td className="px-5 py-3 text-palace/50 hidden sm:table-cell">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {guide.pricingTable.note && (
                  <p className="px-5 py-3 text-[12px] text-palace/45 italic border-t border-saffron/10">{guide.pricingTable.note}</p>
                )}
              </div>
            )}

            {/* Mid-content CTA — CRO */}
            <div className="mb-8 rounded-2xl bg-gradient-to-r from-palace to-[#2a0f05] p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-cream/90 text-[14px] text-center sm:text-left">Ready to experience it yourself? Tables fill fast on weeknights.</p>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto sm:shrink-0">
                <a href={`tel:${RESTAURANT_PHONE_TEL}`} className="btn-outline-gold whitespace-nowrap inline-flex items-center justify-center text-[13px]">Call Now</a>
                <Link to={guide.ctaHref} className="btn-gold whitespace-nowrap inline-flex items-center justify-center gap-2 text-[13px]">
                  {guide.ctaLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            </div>

            <AuthorBio />

            {/* FAQ */}
            {guide.faq.length > 0 && (
              <div id="faq" className="mb-10 scroll-mt-24">
                <h2 className="font-display text-xl md:text-2xl text-palace mb-4">Frequently Asked Questions</h2>
                <div className="grid sm:grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:sm:col-span-2">
                  {guide.faq.map((f, i) => (
                    <div key={i} className="rounded-xl border border-saffron/20 bg-white/70 p-5">
                      <p className="font-semibold text-palace mb-1.5 text-[14px]">{f.q}</p>
                      <div className="text-palace/65">{renderBlockText(f.a, "text-[13.5px] leading-relaxed", `faq${i}-`)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Resources — authoritative outbound links */}
            {guide.externalLinks && guide.externalLinks.length > 0 && (
              <div className="mb-10">
                <h3 className="font-display text-lg text-palace mb-3">Helpful External Resources</h3>
                <ul className="space-y-2">
                  {guide.externalLinks.map((l, i) => (
                    <li key={i}>
                      <a href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13.5px] text-saffron hover:text-gold transition font-medium">
                        <ExternalLinkIcon className="h-3.5 w-3.5" /> {l.label}
                      </a>
                      <span className="text-palace/40 text-[12px]"> — {l.source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Explore More — internal linking */}
            <div className="mb-10">
              <h3 className="font-display text-lg text-palace mb-3">Explore More at The Grand Palace</h3>
              <div className="flex flex-wrap gap-2">
                {EXPLORE_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} className="text-[12.5px] font-medium px-3.5 py-2 rounded-full border border-saffron/25 text-palace/75 hover:border-saffron/50 hover:text-saffron transition bg-white/60">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="rounded-2xl bg-palace p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
              <p className="text-cream/85 font-display text-lg text-center sm:text-left">Ready to book The Grand Palace?</p>
              <Link to={guide.ctaHref} className="btn-gold whitespace-nowrap inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                {guide.ctaLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Related guides */}
            {related.length > 0 && (
              <div>
                <h3 className="font-display text-lg text-palace mb-4">Related Guides</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {related.map((g) => (
                    <Link key={g.slug} to="/guides/$slug" params={{ slug: g.slug }}
                          className="group rounded-xl border border-stone-200 bg-white p-4 hover:border-saffron/40 hover:-translate-y-0.5 transition-all">
                      <p className="text-[13px] font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition">{g.title}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>

      <MobileCTABar ctaHref={guide.ctaHref} ctaLabel={guide.ctaLabel} />
    </PageShell>
  );
}
