import { createFileRoute } from "@tanstack/react-router";
import { API_URL, SITE_URL } from "@/lib/admin-api";
import { guidesContent } from "@/lib/guidesContent";
import { SITE_PAGES } from "@/lib/sitePages";
import { BLOG_SLUGS } from "@/lib/guidesListingData";

// Every static page currently on the site, from the single shared list (also
// used by the admin SEO panel) so the sitemap can never drift out of sync
// with what's actually manageable in admin.
const STATIC_PATHS = SITE_PAGES.map((p) => p.path);

const WHATS_ON_SLUGS = ["order-online", "birthday-party-packages", "mocktails-and-cocktails-offer"];

function xmlEscape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        let redirectedPaths = new Set<string>();
        let dbGuideSlugs: string[] = [];
        try {
          const [seoRes, guidesRes] = await Promise.all([
            fetch(`${API_URL}/api/seo/sitemap-data`),
            fetch(`${API_URL}/api/guides`),
          ]);
          if (seoRes.ok) {
            const data = await seoRes.json();
            redirectedPaths = new Set((data.redirects ?? []).map((r: { fromPath: string }) => r.fromPath));
          }
          if (guidesRes.ok) {
            const guides: { slug: string }[] = await guidesRes.json();
            dbGuideSlugs = guides.map((g) => g.slug);
          }
        } catch {
          // sitemap still works with the static list even if the backend is briefly down
        }

        const blogSlugSet = new Set(BLOG_SLUGS);
        const allGuideSlugs = new Set([...Object.keys(guidesContent), ...dbGuideSlugs]);
        const guidePaths = [...allGuideSlugs].map((slug) => (blogSlugSet.has(slug) ? `/blog/${slug}` : `/guides/${slug}`));
        const whatsOnPaths = WHATS_ON_SLUGS.map((slug) => `/whats-on/${slug}`);

        const allPaths = [...STATIC_PATHS, ...guidePaths, ...whatsOnPaths]
          .filter((p) => !redirectedPaths.has(p));

        const urls = allPaths
          .map((p) => `  <url><loc>${xmlEscape(SITE_URL + p)}</loc></url>`)
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

        return new Response(xml, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
