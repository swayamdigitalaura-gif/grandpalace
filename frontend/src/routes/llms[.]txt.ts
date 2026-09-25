import { createFileRoute } from "@tanstack/react-router";
import { API_URL, SITE_URL } from "@/lib/admin-api";
import {
  guidesContent,
  RESTAURANT_ADDRESS,
  RESTAURANT_EMAIL,
  RESTAURANT_PHONE_DISPLAY,
} from "@/lib/guidesContent";
import { BLOG_SLUGS, RETIRED_GUIDE_SLUGS } from "@/lib/guidesListingData";

// llms.txt (https://llmstxt.org) — a plain-markdown summary of the site for AI
// assistants, the way robots.txt/sitemap.xml are for crawlers. Business details
// come from the same constants the guides' Restaurant schema uses, and the
// guide/blog list is built the same way as sitemap.xml, so this can't drift
// from what the rest of the site says.

const KEY_PAGES: { path: string; label: string; note: string }[] = [
  { path: "/menu", label: "Menu", note: "full food menu" },
  { path: "/menu/a-la-carte", label: "À la Carte Menu", note: "dishes and prices" },
  { path: "/set-menu", label: "Set Menu", note: "group set menus" },
  { path: "/lunch-special", label: "Lunch Special", note: "lunch specials" },
  { path: "/beverages", label: "Beverages", note: "drinks list" },
  { path: "/book-a-table", label: "Book a Table", note: "online reservations" },
  { path: "/venue-for-hire", label: "Venue for Hire", note: "private functions and events" },
  { path: "/events", label: "Events", note: "parties, corporate and celebrations" },
  { path: "/birthday-package", label: "Birthday Packages", note: "birthday celebration packages" },
  { path: "/office-catering", label: "Office Catering", note: "corporate catering in Sydney" },
  { path: "/venue-catering", label: "Venue Catering", note: "catering for external venues" },
  { path: "/gift-card", label: "Gift Card", note: "restaurant gift cards" },
  { path: "/whats-on", label: "What's On", note: "current offers and promotions" },
  { path: "/about", label: "About Us", note: "our story" },
  { path: "/contact", label: "Contact", note: "location, phone and email" },
];

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const titles = new Map<string, string>(
          Object.values(guidesContent).map((g) => [g.slug, g.title]),
        );
        try {
          const res = await fetch(`${API_URL}/api/guides`);
          if (res.ok) {
            const guides: { slug: string; title?: string }[] = await res.json();
            for (const g of guides) if (!titles.has(g.slug)) titles.set(g.slug, g.title || g.slug);
          }
        } catch {
          // still serve the bundled guides if the backend is briefly down
        }

        for (const slug of RETIRED_GUIDE_SLUGS) titles.delete(slug);
        const blogSlugSet = new Set(BLOG_SLUGS);
        const toLine = ([slug, title]: [string, string], base: string) =>
          `- [${title}](${SITE_URL}/${base}/${slug})`;
        const entries = [...titles.entries()];
        const guideLines = entries.filter(([s]) => !blogSlugSet.has(s)).map((e) => toLine(e, "guides"));
        const blogLines = entries.filter(([s]) => blogSlugSet.has(s)).map((e) => toLine(e, "blog"));

        const body = `# The Grand Palace Indian Restaurant

> Indian fine dining in the Sydney CBD. HACCP certified kitchen with a Gold Catering Licence, serving halal-certified meats across the full menu. Dine-in, private functions, and office and venue catering.

- Address: ${RESTAURANT_ADDRESS}, Australia
- Phone: ${RESTAURANT_PHONE_DISPLAY}
- Email: ${RESTAURANT_EMAIL}
- Lunch: Monday to Sunday, 12:00pm to 3:00pm
- Dinner: Sunday to Thursday, 5:00pm to 10:00pm; Friday and Saturday, 5:00pm to 10:30pm

## Key pages

${KEY_PAGES.map((p) => `- [${p.label}](${SITE_URL}${p.path}): ${p.note}`).join("\n")}

## Guides

${guideLines.join("\n")}
${blogLines.length ? `\n## Blog\n\n${blogLines.join("\n")}\n` : ""}
## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
- [Gallery](${SITE_URL}/gallery)
- [Careers](${SITE_URL}/career)
`;

        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
