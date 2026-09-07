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

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    const [content, adminGuides] = await Promise.all([fetchPageContent("/blog"), fetchAdminGuides()]);
    return { content, adminGuides };
  },
  head: () => ({
    meta: [
      { title: "Blog — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Birthdays, events, catering and dining guides from The Grand Palace — Sydney CBD's Indian fine dining restaurant." },
    ],
  }),
  component: BlogPage,
});

const blogSlugSet = new Set(BLOG_SLUGS);

function BlogPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/blog", loaderData.content);
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;

  // Same guide list the /guides index draws from, filtered down to just the
  // slugs that live under /blog now (see BLOG_SLUGS in guidesListingData).
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
    .filter((g) => blogSlugSet.has(g.slug))
    .sort((a, b) => a.order - b.order);

  return (
    <GuideListingPage
      items={mergedGuides}
      dbSlugs={dbGuideSlugs}
      basePath="/blog"
      heroKicker="The Grand Palace · Sydney CBD"
      heroTitle={c("hero.title", "Blog")}
      heroSubtitle={c("hero.subtitle", "Birthdays, events, catering and dining stories from The Grand Palace")}
      heroImg={heroImg}
      crumbLabel="Blog"
    />
  );
}
