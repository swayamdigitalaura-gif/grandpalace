import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { useState } from "react";
import { API_URL, type GalleryImage } from "@/lib/admin-api";
import { useSiteImage } from "@/lib/useSiteImage";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

import heroImgDefault from "@/assets/hero-gallery-spread.jpg";
import { pageHead } from "@/lib/seo";

// Server-rendered — the photo grid used to be a plain useQuery with no
// loader, so the entire gallery rendered blank during SSR and only
// appeared after client-side hydration fetched it.
async function fetchImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`${API_URL}/api/gallery`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/gallery")({
  loader: async () => {
    const [content, images] = await Promise.all([fetchPageContent("/gallery"), fetchImages()]);
    return { content, images };
  },
  head: (ctx) => pageHead(ctx, "/gallery"),
  component: GalleryPage,
});

type Category = "All" | "Interior" | "Food" | "Events" | "Platter Box" | "Birthday Celebration";

const TABS: Category[] = ["All", "Interior", "Food", "Events", "Platter Box", "Birthday Celebration"];

function GalleryPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/gallery", loaderData.content);
  const c = makeContent(content);
  const heroImg = useSiteImage("gallery-hero", content["hero.image"] || heroImgDefault);
  const [active, setActive] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = loaderData.images.filter((item) => active === "All" || item.category === active);

  return (
    <PageShell crumbs={[{ label: "Gallery" }]}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroImg} alt="The Grand Palace Indian restaurant dining room, Sydney CBD" data-tgp-key="hero.image" className="w-full h-full object-cover" fetchPriority="high" decoding="async"
             style={{ filter: "brightness(0.6) saturate(1.1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.6),rgba(8,3,0,0.85))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: "rgba(255,235,185,0.9)" }}>The Grand Palace · Sydney CBD</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-gold-gradient" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>{c("hero.title", "Our Gallery")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/60 text-sm tracking-wider">{c("hero.subtitle", "Food · Moments · Ambience")}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-wrap items-center justify-center gap-2 py-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3.5 py-2 rounded-full text-[11px] md:text-xs uppercase tracking-wider whitespace-nowrap transition ${
                active === tab
                  ? "bg-saffron text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="section-cream">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 data-tgp-key="intro.heading" className="font-display text-3xl md:text-4xl text-palace mb-3">
            {c("intro.heading", "Inside The Grand Palace, Sydney CBD")}
          </h2>
          <p data-tgp-key="intro.text" className="text-stone-600 leading-relaxed">
            {c("intro.text", "Step inside our Indian fine dining restaurant in the basement at 261 George Street, Sydney CBD. Browse our royal palace-inspired interiors, signature Indian dishes, birthday celebrations, corporate functions and private events — then book a table or enquire about hosting your own celebration with us.")}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setLightbox(item.url)}
              className="img-hover rounded-xl overflow-hidden aspect-square"
            >
              <img
                src={item.url}
                alt={item.alt || `${item.category} at The Grand Palace Indian Restaurant, Sydney CBD`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </PageShell>
  );
}
