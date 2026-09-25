import { createFileRoute, notFound } from "@tanstack/react-router";
import { WhatsOnSimpleTemplate } from "@/components/WhatsOnSimpleTemplate";
import { renderRich, renderBlockText } from "@/components/GuideTemplate";
import { API_URL, type SitePage } from "@/lib/admin-api";
import { buildSeoHead, whatsOnDefaults } from "@/lib/seo";

// Server-rendered like every other content page (guides, blog) — this used
// to be a bare useQuery with no loader, so the SSR response was always
// blank ("if (isLoading) return null") and only real content ever showed
// up after client-side hydration fetched it. Bad for SEO/crawlers/social
// previews, and it's exactly the kind of gap to check for on any new page.
async function fetchPage(slug: string): Promise<SitePage | null> {
  const res = await fetch(`${API_URL}/api/pages/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json();
}

export const Route = createFileRoute("/whats-on/$slug")({
  loader: async ({ params }) => {
    const page = await fetchPage(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: (ctx) => {
    const page = ctx.loaderData;
    if (!page) return { meta: [] };
    return buildSeoHead(ctx, `/whats-on/${page.slug}`, whatsOnDefaults(page));
  },
  component: WhatsOnPage,
});

function WhatsOnPage() {
  const page = Route.useLoaderData();

  const cta = page.ctaHref.startsWith("/")
    ? { label: page.ctaLabel, to: page.ctaHref }
    : { label: page.ctaLabel, href: page.ctaHref, external: page.ctaHref.startsWith("http") };

  const cta2 = page.cta2Label && page.cta2Href
    ? (page.cta2Href.startsWith("/")
        ? { label: page.cta2Label, to: page.cta2Href }
        : { label: page.cta2Label, href: page.cta2Href, external: page.cta2Href.startsWith("http") })
    : undefined;

  return (
    <WhatsOnSimpleTemplate
      crumbLabel={page.title}
      emoji={page.emoji ?? undefined}
      title={page.title}
      subtitle={page.subtitle}
      heroImage={page.heroImage}
      heroVideo={page.heroVideo ?? undefined}
      galleryImages={page.galleryImages ?? undefined}
      highlightLine={page.highlightLine ? renderRich(page.highlightLine) : undefined}
      intro={page.intro ? renderBlockText(page.intro, "text-stone-800 leading-relaxed mb-2 last:mb-0 text-[15px]") : undefined}
      contentBlocks={page.contentBlocks?.map((b) => ({
        subtitle: b.subtitle ? renderRich(b.subtitle) : undefined,
        body: renderBlockText(b.body, "text-stone-700 leading-relaxed mb-2 last:mb-0 text-[15px]"),
      }))}
      sections={page.sections.map((sec) => ({
        heading: sec.heading,
        priceTag: sec.priceTag,
        intro: sec.intro ? renderRich(sec.intro) : undefined,
        items: sec.items.map((item) => renderRich(item)),
        description: sec.description ? renderRich(sec.description) : undefined,
        tags: sec.tags,
        character: sec.character ? renderRich(sec.character) : undefined,
        itemIcons: sec.itemIcons,
      }))}
      sidebarImage={page.sidebarImage}
      sidebarVideo={page.sidebarVideo ?? undefined}
      cta={cta}
      cta2={cta2}
    />
  );
}
