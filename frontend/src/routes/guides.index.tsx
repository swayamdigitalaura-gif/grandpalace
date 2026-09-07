import { createFileRoute } from "@tanstack/react-router";
import { GuideListingPage } from "@/components/GuideListingPage";
import heroImgDefault from "@/assets/hero-guides-spread.jpg";
import { guides, BLOG_SLUGS } from "@/lib/guidesListingData";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import { API_URL, type Guide } from "@/lib/admin-api";

async function fetchAdminGuides(): Promise<Guide[]> {
  try {
    const res = await fetch(`${API_URL}/api/guides`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/guides/")({
  loader: async () => {
    const [content, adminGuides] = await Promise.all([fetchPageContent("/guides"), fetchAdminGuides()]);
    return { content, adminGuides };
  },
  head: () => ({
    meta: [
      { title: "Dining Guides — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Your ultimate guide to The Grand Palace's signature dining experience. Restaurant guides for Sydney CBD Indian dining, events, catering and more." },
    ],
  }),
  component: GuidesPage,
});

const blogSlugSet = new Set(BLOG_SLUGS);

function GuidesPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/guides", loaderData.content);
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;

  // Merge admin-created/edited guides into the static list — a DB guide with
  // a slug that already exists here overrides that card's display info, and
  // any new admin-only guide gets appended so it shows up immediately.
  // Display order follows the DB's admin-editable sortOrder when a guide is
  // published there; guides that only exist in the static list keep their
  // original position via that array's index as a fallback order.
  // The 28 informational/event/catering guides that moved to /blog are
  // excluded here so they don't show up in both places.
  const dbGuideSlugs = new Set(loaderData.adminGuides.map((g) => g.slug));
  const mergedGuides = [
    ...guides.map((g, i) => {
      const db = loaderData.adminGuides.find((d) => d.slug === g.slug);
      return db
        ? { title: db.title, excerpt: db.excerpt, date: db.publishedDateDisplay, tag: db.tag as typeof g.tag, slug: db.slug, order: db.sortOrder }
        : { ...g, order: i };
    }),
    ...loaderData.adminGuides
      .filter((g) => !guides.some((s) => s.slug === g.slug))
      .map((g) => ({ title: g.title, excerpt: g.excerpt, date: g.publishedDateDisplay, tag: g.tag as typeof guides[number]["tag"], slug: g.slug, order: g.sortOrder })),
  ]
    .filter((g) => !blogSlugSet.has(g.slug))
    .sort((a, b) => a.order - b.order);

  return (
    <GuideListingPage
      items={mergedGuides}
      dbSlugs={dbGuideSlugs}
      basePath="/guides"
      heroKicker="The Grand Palace · Sydney CBD"
      heroTitle={c("hero.title", "Dining Guides")}
      heroSubtitle={c("hero.subtitle", "Your ultimate guide to Sydney's finest Indian dining experience")}
      heroImg={heroImg}
      crumbLabel="Guides"
    />
  );
}
