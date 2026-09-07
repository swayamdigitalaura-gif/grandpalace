import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { MandalaDivider } from "@/components/MandalaDivider";
import { ExternalLink } from "lucide-react";
import mandala from "@/assets/mandala.png";
import { API_URL, type SitePage } from "@/lib/admin-api";

import heroImgDefault from "@/assets/hero-whats-on-spread.jpg";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

// The card grid used to be a plain useQuery with no loader, so it was
// always empty during SSR — crawlers/social previews saw an empty "What's
// On" page below the hero. Fetched here now alongside the page's editable
// text content, so both are ready before the server ever renders anything.
async function fetchCards(): Promise<SitePage[]> {
  try {
    const res = await fetch(`${API_URL}/api/pages`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/whats-on/")({
  loader: async () => {
    const [content, pages] = await Promise.all([fetchPageContent("/whats-on"), fetchCards()]);
    return { content, pages };
  },
  head: () => ({
    meta: [
      { title: "What's On — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Latest offers, deals and events at The Grand Palace, Sydney CBD. $20 Takeaway Biryani, Birthday Packages, Buy 3 Get 1 Free Cocktails & more." },
    ],
  }),
  component: WhatsOnPage,
});

function CarvedBackdrop() {
  return (
    <>
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.09] animate-spin-slow" />
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -bottom-28 w-[460px] opacity-[0.09] animate-spin-slow" style={{ animationDirection: "reverse" }} />
    </>
  );
}

function WhatsOnPage() {
  const { content: baseContent, pages } = Route.useLoaderData();
  const content = useLiveContent("/whats-on", baseContent);
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;

  const dbCards = pages.map((p) => ({
    img: p.heroImage,
    imgHeight: p.cardImageHeight ?? 340,
    badge: p.badge,
    badgeColor: p.badgeColor ?? "#c8860a",
    title: p.title,
    sub: p.subtitle,
    desc: p.intro ?? "",
    learnHref: `/whats-on/${p.slug}` as string | null,
    bookHref: p.ctaHref,
    bookLabel: p.ctaLabel,
    bookExternal: p.ctaHref.startsWith("http"),
  }));

  const cards = dbCards;

  return (
    <PageShell crumbs={[{ label: "What's On" }]}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroImg} alt="" data-tgp-key="hero.image" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.72),rgba(8,3,0,0.88))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>The Grand Palace · Sydney CBD</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-gold-gradient" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>{c("hero.title", "What's On")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/60 text-sm tracking-wider">{c("hero.subtitle", "Latest offers, deals & events")}</p>
        </div>
      </div>

      {/* Cards */}
      <section className="relative z-0 section-cream pt-8 pb-16 px-6 overflow-hidden">
        <CarvedBackdrop />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <MandalaDivider />
            <p className="text-stone-800 text-[16px] md:text-[17px] font-medium leading-relaxed max-w-lg mx-auto">
              Please stay tuned to our website and social media sites to keep informed of the latest promotions at The Grand Palace.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-[0_8px_32px_-10px_rgba(200,134,10,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Clickable image area */}
                {card.learnHref ? (
                  <Link to={card.learnHref} className="relative overflow-hidden block bg-palace" style={{ height: `${card.imgHeight}px` }}>
                    <img src={card.img} alt={card.title} loading="eager" decoding="async" className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" style={{ imageRendering: "-webkit-optimize-contrast" }} />
                    {card.badge && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full"
                            style={{ background: card.badgeColor }}>
                        {card.badge}
                      </span>
                    )}
                  </Link>
                ) : (
                <div className="relative overflow-hidden bg-palace" style={{ height: `${card.imgHeight}px` }}>
                  <img src={card.img} alt={card.title} loading="eager" decoding="async" className="w-full h-full object-contain" />
                  {card.badge && (
                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full"
                          style={{ background: card.badgeColor }}>
                      {card.badge}
                    </span>
                  )}
                </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-xl text-stone-900 leading-snug mb-2">{card.title}</h3>
                  <p className="text-amber-700 text-[13px] font-semibold leading-snug mb-2">{card.sub}</p>
                  <p className="text-stone-500 text-[13px] leading-relaxed mb-5 flex-1">{card.desc}</p>
                  <div className="border-t border-stone-100 pt-4 flex items-center gap-2">
                    {card.learnHref && (
                      <Link to={card.learnHref}
                        className="flex-1 text-center text-[12px] font-bold uppercase tracking-wider py-2.5 rounded-lg border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition">
                        Learn More
                      </Link>
                    )}
                    {card.bookExternal ? (
                      <a href={card.bookHref} target="_blank" rel="noreferrer"
                         className="flex-1 text-center text-[12px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-white flex items-center justify-center gap-1 transition hover:brightness-105"
                         style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                        {card.bookLabel} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link to={card.bookHref}
                        className="flex-1 text-center text-[12px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-white transition hover:brightness-105"
                        style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                        {card.bookLabel}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
