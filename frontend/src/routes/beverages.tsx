import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ExploreMenus } from "@/components/ExploreMenus";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Wine } from "lucide-react";
import heroImgDefault from "@/assets/hero-beverages-wines.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { fetchPageContent, useLiveContent } from "@/lib/pageContent";
import { useSiteToggle } from "@/lib/useSiteToggle";
import aLaCarteHeroImg from "@/assets/hero-menu-spread.jpg";
import setMenuHeroImg  from "@/assets/gallery/Hero_022-scaled.jpg";
import lunchSpecialCardImg from "@/assets/hero-lunch-special-spread.jpg";
import { API_URL, type MenuCategory as MenuCategoryDTO } from "@/lib/admin-api";

// Server-rendered — the drink list used to be a plain useQuery with no
// loader, so the entire page (every wine/cocktail/spirit list) rendered
// blank during SSR and only appeared after client-side hydration fetched
// it. Fetched here now alongside the page's editable text content.
async function fetchCategories(): Promise<MenuCategoryDTO[]> {
  try {
    const res = await fetch(`${API_URL}/api/menu/beverages`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function BottleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 2h6v3.5c0 .5.3 1 .7 1.4L17 8.5V20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8.5l1.3-1.6c.4-.4.7-.9.7-1.4V2z" />
      <line x1="7" y1="11" x2="17" y2="11" />
    </svg>
  );
}

export const Route = createFileRoute("/beverages")({
  loader: async () => {
    const [content, categories] = await Promise.all([fetchPageContent("/beverages"), fetchCategories()]);
    return { content, categories };
  },
  head: () => ({
    meta: [
      { title: "Beverages — The Grand Palace" },
      { name: "description", content: "Premium cocktails, curated wines, craft beers and fine spirits at The Grand Palace, Sydney CBD." },
    ],
  }),
  component: BeveragesPage,
});

/* ── TYPES ───────────────────────────────────────────────────── */
type WineItem   = { name: string; region?: string; glass?: string; bottle?: string };
type SpiritItem = { name: string; price: string; note?: string };
type NonAlcItem = { name: string; variants?: string; desc?: string; price?: string; glass?: string; jug?: string };
type CocktailItem = { name: string; subtitle?: string; base?: string; desc?: string; price?: string };
type MocktailItem = { name: string; variants?: string; desc?: string; price?: string };
type BeerItem = { name: string; price?: string };

/* ── TABS ────────────────────────────────────────────────────── */
const TABS = [
  { id: "white-wine",        label: "White Wine" },
  { id: "red-wine",          label: "Red Wine" },
  { id: "rose-dessert",      label: "Rose/Dessert Wine" },
  { id: "riesling",          label: "Riesling" },
  { id: "sparkling",         label: "Sparkling wine & Champagne" },
  { id: "tgp-cocktails",     label: "TGP Special Cocktails" },
  { id: "classic-cocktails", label: "Classic Cocktails" },
  { id: "mocktails",         label: "Mocktails" },
  { id: "beer",              label: "Beer & Ciders" },
  { id: "gin",               label: "Gin" },
  { id: "vodka",             label: "Vodka" },
  { id: "rum",               label: "Rum" },
  { id: "bourbon",           label: "Bourbon" },
  { id: "brandy",            label: "Brandy" },
  { id: "tequila",           label: "Tequila" },
  { id: "whisky",            label: "Whisky" },
  { id: "indian-whisky",     label: "Indian Whisky" },
  { id: "shots",             label: "Shots" },
  { id: "non-alc",           label: "Non-Alcoholic Drinks" },
];

const OTHER_WINE_ACCENTS: Record<string, string> = {
  "rose-dessert": "#b55e8a",
  "riesling": "#c8860a",
  "sparkling": "#6b7280",
};
const SPIRIT_SLUGS = ["gin", "vodka", "rum", "bourbon", "brandy", "tequila", "whisky", "indian-whisky", "shots"];

/* ── data mapping: DB categories → the shapes every panel already expects ── */
function useBeveragesData(categories: MenuCategoryDTO[]) {
  return useMemo(() => {
    const bySlug = new Map<string, MenuCategoryDTO>();
    (categories ?? []).forEach((c) => bySlug.set(c.slug, c));
    const extraOf = (extra: unknown) => (extra ?? {}) as Record<string, string | undefined>;

    const tgpCocktails: CocktailItem[] = (bySlug.get("tgp-cocktails")?.items ?? []).map((it) => ({
      name: it.name, subtitle: extraOf(it.extra).subtitle, base: extraOf(it.extra).base,
      desc: it.description ?? undefined, price: it.price ?? undefined,
    }));
    const classicCocktails: CocktailItem[] = (bySlug.get("classic-cocktails")?.items ?? []).map((it) => ({
      name: it.name, subtitle: extraOf(it.extra).variants, desc: it.description ?? undefined, price: it.price ?? undefined,
    }));
    const mocktails: MocktailItem[] = (bySlug.get("mocktails")?.items ?? []).map((it) => ({
      name: it.name, variants: extraOf(it.extra).variants, desc: it.description ?? undefined, price: it.price ?? undefined,
    }));

    function mapWine(slug: string): WineItem[] {
      return (bySlug.get(slug)?.items ?? []).map((it) => {
        const e = extraOf(it.extra);
        return { name: it.name, region: e.region, glass: e.glass, bottle: e.bottle };
      });
    }
    const whiteWines = mapWine("white-wine");
    const redWines = mapWine("red-wine");
    const otherWines = Object.keys(OTHER_WINE_ACCENTS)
      .filter((slug) => bySlug.has(slug))
      .map((slug) => ({
        id: slug,
        type: (bySlug.get(slug)!.label).toUpperCase(),
        accent: OTHER_WINE_ACCENTS[slug],
        items: mapWine(slug),
      }));

    const beers: BeerItem[] = (bySlug.get("beer")?.items ?? []).map((it) => ({ name: it.name, price: it.price ?? undefined }));

    const spirits = SPIRIT_SLUGS.filter((slug) => bySlug.has(slug)).map((slug) => ({
      id: slug,
      type: bySlug.get(slug)!.label.toUpperCase(),
      items: (bySlug.get(slug)!.items ?? []).map((it): SpiritItem => ({
        name: it.name, price: it.price ?? "", note: extraOf(it.extra).note,
      })),
    }));

    function mapNonAlc(slug: string): NonAlcItem[] {
      return (bySlug.get(slug)?.items ?? []).map((it) => {
        const e = extraOf(it.extra);
        return { name: it.name, variants: e.variants, desc: it.description ?? undefined, price: it.price ?? undefined, glass: e.glass, jug: e.jug };
      });
    }
    const nonAlcFeatured = mapNonAlc("non-alc-featured");
    const nonAlcOthers = mapNonAlc("non-alc-others");

    return { tgpCocktails, classicCocktails, mocktails, whiteWines, redWines, otherWines, beers, spirits, nonAlcFeatured, nonAlcOthers };
  }, [categories]);
}

/* ── WINE ROW ─────────────────────────────────────────────────── */
function WineRow({ w, stripe }: { w: WineItem; stripe: boolean }) {
  return (
    <div className="flex items-start gap-3 px-3 py-3 rounded"
         style={{ background: stripe ? "rgba(200,150,50,0.07)" : "transparent" }}>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[17px] leading-snug text-stone-900">{w.name}</p>
        {w.region && <p className="text-[12px] italic mt-0.5 text-stone-500">{w.region}</p>}
      </div>
      <div className="flex-shrink-0 text-right space-y-1">
        {w.glass  && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
          {w.glass} <Wine className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        </div>}
        {w.bottle && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
          {w.bottle} <BottleIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        </div>}
      </div>
    </div>
  );
}

/* ── SHARED ROW — used by all panels ────────────────────────── */
function ItemRow({ name, sub, desc, price, priceAlt, stripe }: {
  name: string; sub?: string; desc?: string;
  price?: string; priceAlt?: ReactNode; stripe: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-4 rounded-xl"
         style={{ background: stripe ? "rgba(200,140,30,0.07)" : "transparent", borderBottom: "1px solid rgba(200,140,30,0.08)" }}>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-stone-900 text-[17px] md:text-[19px] leading-snug">{name}</h3>
        {sub && <p className="text-stone-700 font-semibold text-[12px] mt-0.5">{sub}</p>}
        {desc && <p className="text-stone-600 text-[13px] mt-0.5 leading-relaxed">{desc}</p>}
      </div>
      <div className="flex-shrink-0 text-right mt-0.5">
        {price    && <span className="font-display text-[20px] text-amber-700">{price}</span>}
        {priceAlt && <div className="text-[12px] space-y-0.5 text-right">{priceAlt}</div>}
      </div>
    </div>
  );
}

function SubHeading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mt-8 mb-2 first:mt-0">
      <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-stone-900 flex-shrink-0">{label}</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(120,80,20,0.35),transparent)" }} />
    </div>
  );
}

/* ── PANELS — all white bg, consistent layout ────────────────── */

function CocktailsPanel({ tgpCocktails, classicCocktails }: { tgpCocktails: CocktailItem[]; classicCocktails: CocktailItem[] }) {
  return (
    <div className="bg-white px-6 md:px-10 py-8">
      <div id="tgp-cocktails" className="scroll-mt-24 lg:scroll-mt-36">
        <SubHeading label="TGP Special Cocktails" />
        {tgpCocktails.map((c, i) => (
          <ItemRow key={i} stripe={i % 2 === 0}
            name={c.name} sub={c.base ? `Base: ${c.base}` : undefined} desc={c.desc} price={c.price} />
        ))}
      </div>
      <div id="classic-cocktails" className="scroll-mt-24 lg:scroll-mt-36">
        <SubHeading label="Classic Cocktails" />
        {classicCocktails.map((c, i) => (
          <ItemRow key={i} stripe={i % 2 === 0}
            name={c.name} sub={c.subtitle || undefined} desc={c.desc} price={c.price} />
        ))}
      </div>
    </div>
  );
}

function MocktailsPanel({ mocktails }: { mocktails: MocktailItem[] }) {
  return (
    <div className="bg-white px-6 md:px-10 py-8">
      {mocktails.map((m, i) => (
        <ItemRow key={i} stripe={i % 2 === 0}
          name={m.name} sub={m.variants} desc={m.desc} price={m.price} />
      ))}
    </div>
  );
}

function WinePanel({ whiteWines, redWines, otherWines }: {
  whiteWines: WineItem[]; redWines: WineItem[];
  otherWines: { id: string; type: string; accent: string; items: WineItem[] }[];
}) {
  return (
    <div className="bg-white px-6 md:px-10 py-8">
      <div id="white-wine" className="scroll-mt-24 lg:scroll-mt-36">
        <SubHeading label="White Wine" />
        {whiteWines.map((w, i) => <WineRow key={i} w={w} stripe={i % 2 === 0} />)}
      </div>
      <div id="red-wine" className="scroll-mt-24 lg:scroll-mt-36">
        <SubHeading label="Red Wine" />
        {redWines.map((w, i) => <WineRow key={i} w={w} stripe={i % 2 === 0} />)}
      </div>
      {otherWines.map((sec) => (
        <div key={sec.id} id={sec.id} className="scroll-mt-24 lg:scroll-mt-36">
          <SubHeading label={sec.type} />
          {sec.items.map((w, j) => <WineRow key={j} w={w} stripe={j % 2 === 0} />)}
        </div>
      ))}
      <p className="mt-6 text-[12px] text-stone-500 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1"><Wine className="h-3.5 w-3.5 text-amber-600" /> Glass = 150ml</span>
        <span className="text-stone-300">·</span>
        <span className="flex items-center gap-1"><BottleIcon className="h-3.5 w-3.5 text-amber-600" /> Bottle = 750ml</span>
      </p>
    </div>
  );
}

function BeerPanel({ beers }: { beers: BeerItem[] }) {
  return (
    <div className="bg-white px-6 md:px-10 py-8">
      {beers.map((b, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-4 rounded-xl"
             style={{ background: i % 2 === 0 ? "rgba(200,140,30,0.07)" : "transparent", borderBottom: "1px solid rgba(200,140,30,0.08)" }}>
          <h3 className="font-display text-stone-900 text-[17px]">{b.name}</h3>
          <span className="font-display text-[18px] font-bold text-amber-700">{b.price}</span>
        </div>
      ))}
    </div>
  );
}

function SpiritsPanel({ spirits }: { spirits: { id: string; type: string; items: SpiritItem[] }[] }) {
  return (
    <div className="bg-white px-6 md:px-10 py-8">
      {spirits.map((group) => (
        <div key={group.id} id={group.id} className="mb-2 scroll-mt-24 lg:scroll-mt-36">
          <SubHeading label={group.type} />
          {group.items.map((item, ii) => (
            <div key={ii} className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl"
                 style={{ background: ii % 2 === 0 ? "rgba(200,140,30,0.07)" : "transparent", borderBottom: "1px solid rgba(200,140,30,0.08)" }}>
              <div className="min-w-0 flex-1">
                <p className="font-display text-stone-900 text-[17px] leading-snug">{item.name}</p>
                {item.note && <p className="text-stone-600 text-[12px] mt-0.5">{item.note}</p>}
              </div>
              <span className="font-display text-[18px] font-bold flex-shrink-0 text-amber-700">{item.price}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NonAlcoholicPanel({ nonAlcFeatured, nonAlcOthers }: { nonAlcFeatured: NonAlcItem[]; nonAlcOthers: NonAlcItem[] }) {
  return (
    <div id="non-alc" className="bg-white px-6 md:px-10 py-8 scroll-mt-24 lg:scroll-mt-36">
      <SubHeading label="Indian Specialties" />
      {nonAlcFeatured.map((d, i) => (
        <ItemRow key={i} stripe={i % 2 === 0}
          name={d.name} sub={d.variants} desc={d.desc}
          price={d.price}
          priceAlt={!d.price ? (
            <>
              {d.glass && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
                {d.glass} <Wine className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              </div>}
              {d.jug   && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
                {d.jug} <BottleIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              </div>}
            </>
          ) : undefined} />
      ))}
      <SubHeading label="Soft Drinks & More" />
      {nonAlcOthers.map((d, i) => (
        <ItemRow key={i} stripe={i % 2 === 0}
          name={d.name} sub={d.variants}
          priceAlt={
            <>
              {d.glass && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
                {d.glass} <Wine className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              </div>}
              {d.jug   && <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-amber-700">
                {d.jug} <BottleIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              </div>}
            </>
          } />
      ))}
    </div>
  );
}

/* ── PAGE ────────────────────────────────────────────────────── */
function BeveragesPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/beverages", loaderData.content);
  const heroImg = useSiteImage("beverages-hero", content["hero.image"] || heroImgDefault);
  const lunchSpecialActive = useSiteToggle("lunch-special");
  const [activeId, setActiveId] = useState("white-wine");
  const data = useBeveragesData(loaderData.categories);

  useEffect(() => {
    const observers = TABS.map((tab) => {
      const el = document.getElementById(tab.id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveId(tab.id); },
        { rootMargin: "-35% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: "Beverages" }]}>

      {/* ══ HERO ══ */}
      <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={heroImg} alt="" data-tgp-key="hero.image" className="absolute inset-0 w-full h-full object-cover"
             fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10">
          <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            The Grand Palace · Sydney CBD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(44px,9vw,110px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            Beverages
          </h1>
          <div className="flex items-center gap-4" style={{ width: "10rem" }}>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
            <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          </div>
          <p className="text-[11px] tracking-[0.4em] uppercase" style={{ color: "rgba(255,235,190,0.9)" }}>
            Cocktails · Wine · Spirits · Non-Alcoholic
          </p>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="flex bg-stone-50 min-h-screen">

        {/* ── DESKTOP SIDEBAR ── */}
        <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen w-56">
          <div className="h-full flex flex-col"
               style={{ background: "linear-gradient(170deg,#fffdf7 0%,#fef6e4 60%,#fdefd3 100%)", borderRight: "2px solid rgba(200,140,30,0.18)", boxShadow: "4px 0 24px rgba(180,110,20,0.07)" }}>

            <div className="px-5 pt-7 pb-5 text-center" style={{ borderBottom: "1px solid rgba(200,140,30,0.18)" }}>
              <p className="text-[8px] tracking-[0.55em] uppercase font-semibold mb-1" style={{ color: "#b8860b" }}>The Grand Palace</p>
              <p className="font-display text-[28px] leading-none" style={{ color: "#1a0e00" }}>Beverages</p>
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
                <span className="text-[10px]" style={{ color: "rgba(180,120,20,0.5)" }}>◆</span>
                <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
              </div>
            </div>

            <nav className="flex-1 py-3 px-3 overflow-y-auto">
              {TABS.map(tab => {
                const active = activeId === tab.id;
                return (
                  <button key={tab.id} onClick={() => scrollTo(tab.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all duration-200"
                    style={active
                      ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", boxShadow: "0 2px 8px rgba(200,134,10,0.35)" }
                      : {}}>
                    <span className="text-[13px] font-semibold leading-snug"
                          style={{ color: active ? "#fff" : "#2a1203" }}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(200,140,30,0.18)" }}>
              <Link to="/book-a-table"
                className="block text-center text-[11px] uppercase tracking-widest font-bold py-2.5 rounded-lg transition hover:brightness-105"
                style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff", boxShadow: "0 2px 10px rgba(200,134,10,0.3)" }}>
                Book a Table
              </Link>
              <p className="text-[10px] text-center mt-3 leading-relaxed" style={{ color: "#7a5020" }}>
                Basement, 261 George St<br />Sydney NSW 2000
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="flex-1 min-w-0 py-8 px-4 md:px-8 space-y-10">

          {/* ── all sections rendered, scroll to navigate ── */}
          <section className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Wine List</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">Curated Selection</p>
              </div>
            </div>
            <WinePanel whiteWines={data.whiteWines} redWines={data.redWines} otherWines={data.otherWines} />
          </section>

          <section className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Cocktails</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">Signature & Classic</p>
              </div>
            </div>
            <CocktailsPanel tgpCocktails={data.tgpCocktails} classicCocktails={data.classicCocktails} />
          </section>

          <section id="mocktails" className="scroll-mt-24 lg:scroll-mt-36 rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Mocktails</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">All the Flavour</p>
              </div>
            </div>
            <MocktailsPanel mocktails={data.mocktails} />
          </section>

          <section id="beer" className="scroll-mt-24 lg:scroll-mt-36 rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Beer & Ciders</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">On Tap & Bottled</p>
              </div>
            </div>
            <BeerPanel beers={data.beers} />
          </section>

          <section className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Spirits</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">Premium Selection</p>
              </div>
            </div>
            <SpiritsPanel spirits={data.spirits} />
          </section>

          <section className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">
            <div className="flex items-center min-h-[100px]"
                 style={{ background: "linear-gradient(120deg,#1a0e00 0%,#2d1a06 60%,#3d2610 100%)" }}>
              <div className="flex-1 px-6 py-5">
                <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">Non-Alcoholic Drinks</h2>
                <p className="text-amber-300 text-[11px] tracking-wider mt-1">Indian & International</p>
              </div>
            </div>
            <NonAlcoholicPanel nonAlcFeatured={data.nonAlcFeatured} nonAlcOthers={data.nonAlcOthers} />
          </section>

          {/* explore other menus */}
          <ExploreMenus cards={[
            { to: "/menu/a-la-carte", img: aLaCarteHeroImg, kicker: "Full Menu", title: "À la Carte", desc: "Our full menu of authentic Indian dishes, made to order." },
            { to: "/set-menu", img: setMenuHeroImg, kicker: "Curated Banquets", title: "Set Menu", desc: "Three courses of the best of TGP, from $65 per person.", pos: "25% 85%" },
            ...(lunchSpecialActive ? [{ to: "/lunch-special", img: lunchSpecialCardImg, kicker: "Weekday Midday", title: "Lunch Special", desc: "Three curated lunch banquets, available every day 12pm–3pm." }] : []),
          ]} />

        </div>
      </div>

      {/* ══ BOTTOM CTA ══ */}
      <div className="section-cream py-12 px-6 text-center" style={{ borderTop: "1px solid rgba(200,150,50,0.15)" }}>
        <p className="text-[9px] tracking-[0.55em] uppercase text-amber-700 mb-3">Reserve Your Evening</p>
        <h3 className="font-display text-3xl md:text-5xl text-stone-900 mb-4">Pair the Perfect Drink</h3>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Let our team guide you through our curated selection and craft the ideal pairing for your meal.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="btn-outline-gold">Order Online</a>
        </div>
      </div>

    </PageShell>
  );
}
