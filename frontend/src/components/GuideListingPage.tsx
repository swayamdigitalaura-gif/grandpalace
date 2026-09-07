import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ExternalLink, ArrowRight } from "lucide-react";
import mandala from "@/assets/mandala.png";
import { guidesContent } from "@/lib/guidesContent";
import { TAGS, tagColors, type GuideItem, type Tag } from "@/lib/guidesListingData";

/** Shared visual design for both /guides and /blog index pages — hero,
 *  tag filter bar and the card grid are identical between the two; only the
 *  item list, hero copy and link target (/guides/$slug vs /blog/$slug) differ. */
export function GuideListingPage({
  items,
  dbSlugs,
  basePath,
  heroKicker,
  heroTitle,
  heroSubtitle,
  heroImg,
  crumbLabel,
}: {
  items: GuideItem[];
  dbSlugs: Set<string>;
  basePath: "/guides" | "/blog";
  heroKicker: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImg: string;
  crumbLabel: string;
}) {
  const [active, setActive] = useState<Tag>("All");
  const filtered = active === "All" ? items : items.filter((g) => g.tag === active);

  return (
    <PageShell crumbs={[{ label: crumbLabel }]}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroImg} alt="" className="w-full h-full object-cover" fetchPriority="high"
             style={{ filter: "brightness(0.55) saturate(1.1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.5),rgba(8,3,0,0.88))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{heroKicker}</p>
          <h1 className="font-display text-5xl md:text-6xl text-gold-gradient">{heroTitle}</h1>
          <p className="text-cream/60 text-sm max-w-md">{heroSubtitle}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 py-3 overflow-x-auto">
          {TAGS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`flex-shrink-0 text-[11px] font-bold uppercase tracking-widest px-5 py-2 rounded-full transition ${
                active === tab ? "text-white" : "text-stone-500 hover:text-stone-900"
              }`}
              style={active === tab ? { background: "linear-gradient(90deg,#c8860a,#e6a020)" } : {}}
            >
              {tab}
            </button>
          ))}
          <span className="ml-auto text-stone-400 text-[12px] flex-shrink-0">{filtered.length} guides</span>
        </div>
      </div>

      {/* Guide grid */}
      <section className="relative section-cream py-12 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.07] animate-spin-slow" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((guide, i) => {
              const isBuilt = Boolean(guidesContent[guide.slug]) || dbSlugs.has(guide.slug);
              const cardClass = "group rounded-2xl border border-stone-200 bg-white hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(200,134,10,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden";
              const cardBody = (
                <>
                  {/* Tag bar */}
                  <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full"
                          style={{ background: tagColors[guide.tag] }}>
                      {guide.tag}
                    </span>
                    <span className="text-stone-400 text-[11px]">{guide.date}</span>
                  </div>
                  <div className="px-5 pb-5 flex flex-col flex-1">
                    <h2 className="font-display text-lg text-stone-900 leading-snug mb-2 group-hover:text-amber-800 transition">
                      {guide.title}
                    </h2>
                    <p className="text-stone-500 text-[13px] leading-relaxed flex-1">{guide.excerpt}</p>
                    <div className="mt-4 flex items-center gap-1 text-[12px] font-semibold text-amber-700 group-hover:text-amber-600 transition">
                      Read Guide {isBuilt ? <ArrowRight className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                    </div>
                  </div>
                </>
              );
              if (!isBuilt) {
                return (
                  <a key={i} href={`https://www.thegrandpalace.com.au/guides/${guide.slug}/`} target="_blank" rel="noreferrer" className={cardClass}>
                    {cardBody}
                  </a>
                );
              }
              return basePath === "/blog" ? (
                <Link key={i} to="/blog/$slug" params={{ slug: guide.slug }} className={cardClass}>
                  {cardBody}
                </Link>
              ) : (
                <Link key={i} to="/guides/$slug" params={{ slug: guide.slug }} className={cardClass}>
                  {cardBody}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
