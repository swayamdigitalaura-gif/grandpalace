import { createFileRoute, notFound } from "@tanstack/react-router";
import { GuideTemplate, CANONICAL_BASE_URL } from "@/components/GuideTemplate";
import { NormalGuideTemplate } from "@/components/NormalGuideTemplate";
import { getGuide, type GuideContent } from "@/lib/guidesContent";
import { API_URL, type Guide } from "@/lib/admin-api";

// Sitewide default OG/Twitter image — same fallback __root.tsx uses — for
// guides that don't (yet) have a hero image of their own.
const DEFAULT_OG_IMAGE = `${CANONICAL_BASE_URL}/site-image-defaults/about-hero.jpg`;

// Admin-created/edited guides live in the backend; the original hand-built
// guides still ship bundled as a fallback so nothing breaks if the API is
// briefly unavailable or a guide hasn't been migrated to the backend yet.
async function fetchGuideFromApi(slug: string): Promise<GuideContent | null> {
  try {
    const res = await fetch(`${API_URL}/api/guides/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const g: Guide = await res.json();
    return {
      slug: g.slug,
      title: g.title,
      metaTitle: g.metaTitle,
      metaDescription: g.metaDescription,
      tag: g.tag as GuideContent["tag"],
      publishedDate: g.publishedDate,
      publishedDateDisplay: g.publishedDateDisplay,
      updatedDate: g.updatedDate,
      updatedDateDisplay: g.updatedDateDisplay,
      excerpt: g.excerpt,
      intro: g.intro,
      quickAnswer: g.quickAnswer ?? undefined,
      heroImage: g.heroImage ?? undefined,
      heroImageAlt: g.heroImageAlt ?? undefined,
      quickFacts: g.quickFacts ?? undefined,
      comparisonTable: g.comparisonTable ?? undefined,
      sections: g.sections,
      pricingTable: g.pricingTable ?? undefined,
      externalLinks: g.externalLinks ?? undefined,
      faq: g.faq,
      relatedSlugs: g.relatedSlugs,
      ctaLabel: g.ctaLabel,
      ctaHref: g.ctaHref,
      guideType: g.guideType,
    };
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/guides/$slug")({
  loader: async ({ params }) => {
    const guide = (await fetchGuideFromApi(params.slug)) ?? getGuide(params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const canonical = `${CANONICAL_BASE_URL}/guides/${loaderData.slug}`;
    const ogImage = loaderData.heroImage || DEFAULT_OG_IMAGE;
    return {
      meta: [
        { title: loaderData.metaTitle },
        { name: "description", content: loaderData.metaDescription },
        { property: "og:title", content: loaderData.metaTitle },
        { property: "og:description", content: loaderData.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.metaTitle },
        { name: "twitter:description", content: loaderData.metaDescription },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: GuidePage,
});

function GuidePage() {
  const guide = Route.useLoaderData();
  // guideType is only ever undefined for the bundled static guides (they
  // predate this field) — all of those are listicle-style, so undefined
  // defaults to "listicle" to keep their appearance unchanged.
  return guide.guideType === "normal"
    ? <NormalGuideTemplate guide={guide} />
    : <GuideTemplate guide={guide} />;
}
