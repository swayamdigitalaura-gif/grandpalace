import { Link } from "@tanstack/react-router";
import type { GuideContent } from "@/lib/guidesContent";
import {
  BLOG_SLUGS,
  RETIRED_GUIDE_SLUGS,
  guides as listing,
  type GuideItem,
} from "@/lib/guidesListingData";

const COUNT = 3;
const bySlug = new Map(listing.map((g) => [g.slug, g]));
const blogSlugs = new Set(BLOG_SLUGS);
const retired = new Set(RETIRED_GUIDE_SLUGS);

/** The guide's own related slugs first, then same-topic posts, so every
 *  article links on to others — resolved against the full listing (bundled
 *  and database guides alike), not just the bundled ones. */
function pickRelated(guide: Pick<GuideContent, "slug" | "tag" | "relatedSlugs">): GuideItem[] {
  const out: GuideItem[] = [];
  const take = (g: GuideItem | undefined) => {
    if (g && g.slug !== guide.slug && !retired.has(g.slug) && !out.some((o) => o.slug === g.slug))
      out.push(g);
  };
  for (const slug of guide.relatedSlugs ?? []) take(bySlug.get(slug));
  for (const g of listing) if (out.length < COUNT && g.tag === guide.tag) take(g);
  for (const g of listing) if (out.length < COUNT) take(g);
  return out.slice(0, COUNT);
}

export function RelatedGuides({
  guide,
}: {
  guide: Pick<GuideContent, "slug" | "tag" | "relatedSlugs">;
}) {
  const related = pickRelated(guide);
  if (!related.length) return null;
  return (
    <div>
      <h3 className="font-display text-lg text-palace mb-4">Related Guides</h3>
      <div className="grid sm:grid-cols-3 gap-4">
        {related.map((g) => (
          <Link
            key={g.slug}
            to={blogSlugs.has(g.slug) ? "/blog/$slug" : "/guides/$slug"}
            params={{ slug: g.slug }}
            className="group rounded-xl border border-stone-200 bg-white p-4 hover:border-saffron/40 hover:-translate-y-0.5 transition-all"
          >
            <p className="text-[13px] font-semibold text-stone-800 leading-snug group-hover:text-amber-800 transition">
              {g.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
