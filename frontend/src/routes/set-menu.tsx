import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ExploreMenus } from "@/components/ExploreMenus";
import { useEffect, useMemo, useState } from "react";
import { API_URL, type MenuCategory as MenuCategoryDTO } from "@/lib/admin-api";

// Server-rendered — this list used to be a plain useQuery with no loader,
// so the whole page rendered blank during SSR and only appeared after
// client-side hydration fetched it.
async function fetchCategories(): Promise<MenuCategoryDTO[]> {
  try {
    const res = await fetch(`${API_URL}/api/menu/set-menu`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

import g1Default from "@/assets/gallery/Hero_022-scaled.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { fetchPageContent, useLiveContent } from "@/lib/pageContent";
import { useSiteToggle } from "@/lib/useSiteToggle";
import aLaCarteCardImg   from "@/assets/hero-menu-spread.jpg";
import beveragesHeroImg  from "@/assets/hero-beverages-wines.jpg";
import lunchSpecialCardImg from "@/assets/hero-lunch-special-spread.jpg";

export const Route = createFileRoute("/set-menu")({
  loader: async () => {
    const [content, rawCategories] = await Promise.all([fetchPageContent("/set-menu"), fetchCategories()]);
    return { content, rawCategories };
  },
  head: () => ({
    meta: [
      { title: "Set Menu — The Grand Palace" },
      { name: "description", content: "Three curated banquets at The Grand Palace, Sydney CBD — Vegetarian $65, Non-Vegetarian $70, and TGP Special $95 per person." },
    ],
  }),
  component: SetMenuPage,
});

/* ─── data ───────────────────────────────────────────────────────────────── */
type Course = { label: string; items: string[] };
type Package = {
  id: string; title: string; shortTitle: string; price: string; tag: string;
  tagBg: string; dot: string; accent: string; img: string;
  minimum: string; desc: string; courses: Course[];
};

const TAG_STYLE: Record<string, { tagBg: string; dot: string; accent: string }> = {
  "Vegetarian":     { tagBg: "bg-green-900/40 text-green-300", dot: "bg-green-500 border-green-600", accent: "#4caf50" },
  "Non-Vegetarian": { tagBg: "bg-red-900/40 text-red-300",     dot: "bg-red-500 border-red-600",       accent: "#e05454" },
  "★ Premium":      { tagBg: "bg-amber-900/40 text-amber-300", dot: "bg-amber-500 border-amber-600",   accent: "#e6a020" },
};
const DEFAULT_TAG_STYLE = { tagBg: "bg-stone-700/40 text-stone-300", dot: "bg-stone-400 border-stone-500", accent: "#c8860a" };

function mapCategoryToPackage(cat: MenuCategoryDTO, fallbackImg: string): Package {
  const courses: Course[] = cat.items.map((it) => ({
    label: it.name,
    items: (it.description ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  }));
  const firstExtra = (cat.items[0]?.extra ?? {}) as { minimum?: string; packageDesc?: string; packagePrice?: string };
  const style = TAG_STYLE[cat.tag ?? ""] ?? DEFAULT_TAG_STYLE;
  return {
    id: cat.slug,
    title: cat.label,
    shortTitle: cat.label,
    price: firstExtra.packagePrice ?? "",
    tag: cat.tag ?? "",
    tagBg: style.tagBg,
    dot: style.dot,
    accent: style.accent,
    img: cat.imageUrl || fallbackImg,
    minimum: firstExtra.minimum ?? "Minimum 2 Guests",
    desc: firstExtra.packageDesc ?? "",
    courses,
  };
}

const notes = [
  "All prices include GST",
  "Minimum 2 guests per banquet",
  "No BYO — Fully Licensed",
  "Credit card surcharge applies",
  "10% surcharge on public holidays",
  "All food is Halal & HACCP approved",
];

/* ─── page ───────────────────────────────────────────────────────────────── */
function SetMenuPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/set-menu", loaderData.content);
  const g1 = useSiteImage("setmenu-hero", content["hero.image"] || g1Default);
  const lunchSpecialActive = useSiteToggle("lunch-special");
  const rawCategories = loaderData.rawCategories;

  const packages: Package[] = useMemo(
    () => (rawCategories ?? []).map((cat) => mapCategoryToPackage(cat, g1)),
    [rawCategories, g1]
  );

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (packages.length && !activeId) setActiveId(packages[0].id);
  }, [packages, activeId]);

  useEffect(() => {
    if (!packages.length) return;
    const observers = packages.map((pkg) => {
      const el = document.getElementById(pkg.id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveId(pkg.id); },
        { rootMargin: "-35% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [packages]);

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: "Set Menu" }]}>

      {/* ── Hero — identical height/style to Beverages ── */}
      <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={g1} alt="" data-tgp-key="hero.image" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10">
          <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            The Grand Palace · Sydney CBD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(44px,9vw,110px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            Set Menu
          </h1>
          <div className="flex items-center gap-4" style={{ width: "10rem" }}>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
            <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          </div>
          <div className="flex gap-3 mt-1">
            <Link to="/book-a-table" className="btn-gold !text-[11px] !px-5 !py-2.5 whitespace-nowrap">Reserve a Table</Link>
            <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer"
               className="btn-outline-gold !text-[11px] !px-5 !py-2.5 whitespace-nowrap">Order Online</a>
          </div>
        </div>
      </div>

      {/* notice bar */}
      <div className="bg-amber-50 border-b border-amber-200 text-center text-xs text-amber-800 py-2.5 px-4">
        Minimum 2 guests per banquet &nbsp;·&nbsp; No BYO — Fully Licensed &nbsp;·&nbsp; 10% surcharge on public holidays
      </div>

      <div className="flex bg-stone-50 min-h-screen">

        {/* ══ SIDEBAR — exact same structure as à la carte ══ */}
        <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen w-56">
          <div className="h-full flex flex-col"
               style={{ background: "linear-gradient(170deg,#fffdf7 0%,#fef6e4 60%,#fdefd3 100%)", borderRight: "2px solid rgba(200,140,30,0.18)", boxShadow: "4px 0 24px rgba(180,110,20,0.07)" }}>

            <div className="px-5 pt-7 pb-5 text-center" style={{ borderBottom: "1px solid rgba(200,140,30,0.18)" }}>
              <p className="text-[8px] tracking-[0.55em] uppercase font-semibold mb-1" style={{ color: "#b8860b" }}>The Grand Palace</p>
              <p className="font-display text-[28px] leading-none" style={{ color: "#1a0e00" }}>Set Menu</p>
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
                <span className="text-[10px]" style={{ color: "rgba(180,120,20,0.5)" }}>◆</span>
                <span className="h-px flex-1" style={{ background: "rgba(200,140,30,0.3)" }} />
              </div>
            </div>

            {/* nav list */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 mt-1" style={{ scrollbarWidth: "none" }}>
              {packages.map((p) => {
                const active = activeId === p.id;
                return (
                  <button key={p.id} onClick={() => go(p.id)}
                    className="w-full text-left px-3 py-2 rounded-lg mb-0.5 flex items-center gap-2.5 transition-all duration-200"
                    style={active
                      ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff", boxShadow: "0 2px 8px rgba(200,134,10,0.35)" }
                      : { color: "#1a0e00" }}>
                    <span className={`w-2 h-2 rounded-sm border-2 flex-shrink-0 ${p.dot}`} />
                    <span className={`text-[13px] leading-snug ${active ? "font-semibold" : "font-medium"}`}>{p.shortTitle}</span>
                    {active && <span className="ml-auto text-white/70 text-sm leading-none">›</span>}
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

        {/* ══ CONTENT ══ */}
        <div className="flex-1 min-w-0 py-8 px-4 md:px-8 space-y-10">

          {/* ── package sections ── */}
          {packages.map((pkg) => (
            <section key={pkg.id} id={pkg.id} className="scroll-mt-28 lg:scroll-mt-36">
              <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">

                {/* section header — full-width bg image */}
                <div className="relative flex items-end min-h-[180px] md:min-h-[220px] overflow-hidden">
                  <img src={pkg.img} alt={pkg.title}
                       className="absolute inset-0 w-full h-full object-cover"
                       loading="lazy" decoding="async"
                       style={{ filter: "brightness(0.75) saturate(1.15)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(10,4,0,0.88) 0%,rgba(10,4,0,0.45) 55%,rgba(10,4,0,0.2) 100%)" }} />
                  <div className="relative z-10 flex flex-col px-6 py-6 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-sm border-2 ${pkg.dot}`} />
                      <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${pkg.tagBg}`}>
                        {pkg.tag}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">{pkg.title}</h2>
                    <p className="text-amber-300 text-[11px] tracking-wider">{pkg.price} per person · {pkg.minimum}</p>
                  </div>
                </div>

                {/* package body */}
                <div className="bg-white px-6 md:px-10 py-8">
                  <p className="text-stone-500 text-[14px] leading-relaxed mb-8 max-w-2xl">{pkg.desc}</p>

                  <div className="space-y-7">
                    {pkg.courses.map((course, ci) => (
                      <div key={ci}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[11px] tracking-[0.3em] uppercase font-bold flex-shrink-0 text-stone-900">
                            {course.label}
                          </span>
                          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(120,80,20,0.35),transparent)" }} />
                        </div>
                        <div className={course.items.length > 2 ? "grid sm:grid-cols-2 gap-x-8 gap-y-2" : "flex flex-col gap-2"}>
                          {course.items.map((item, ii) => (
                            <div key={ii} className="flex items-start gap-2.5">
                              <span className="mt-[7px] flex-shrink-0 w-1.5 h-1.5 rounded-full"
                                    style={{ background: pkg.accent, opacity: 0.7 }} />
                              <span className="text-[13px] md:text-[14px] leading-snug text-stone-700">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-10 pt-8 border-t border-stone-100 flex items-center gap-5 flex-wrap">
                    <Link to="/book-a-table" className="btn-gold text-sm">Book a Table</Link>
                    <a href="tel:+61280217696" className="text-[12px] text-stone-500 hover:text-amber-700 transition">
                      or call (02) 8021 7696
                    </a>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* fine print */}
          <div className="rounded-2xl border border-stone-200 bg-white px-6 md:px-10 py-8">
            <h3 className="font-display text-xl text-stone-900 mb-5">Terms &amp; Conditions</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {notes.map((note, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                     style={{ background: "rgba(255,248,235,0.8)", border: "1px solid rgba(180,110,10,0.18)" }}>
                  <span className="text-amber-600/70 text-[10px] flex-shrink-0">◆</span>
                  <p className="text-stone-600 text-[12px] leading-snug">{note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* explore other menus */}
          <ExploreMenus cards={[
            { to: "/menu/a-la-carte", img: aLaCarteCardImg, kicker: "Full Menu", title: "À la Carte", desc: "Our full menu of authentic Indian dishes, made to order." },
            { to: "/beverages", img: beveragesHeroImg, kicker: "Drinks", title: "Beverages", desc: "Cocktails, wine, spirits and non-alcoholic favourites." },
            ...(lunchSpecialActive ? [{ to: "/lunch-special", img: lunchSpecialCardImg, kicker: "Weekday Midday", title: "Lunch Special", desc: "Three curated lunch banquets, available every day 12pm–3pm." }] : []),
          ]} />

        </div>
      </div>

      {/* bottom CTA */}
      <div className="section-cream py-16 px-6 text-center" style={{ borderTop: "1px solid rgba(200,150,50,0.15)" }}>
        <p className="text-[10px] tracking-[0.5em] uppercase text-amber-600 mb-3">Secure Your Evening</p>
        <h3 className="font-display text-3xl md:text-5xl text-stone-900 mb-4">Dine in The Grand Palace</h3>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Reserve your table today and let our team craft a perfect evening for you and your guests.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="btn-outline-gold">Order Online</a>
        </div>
      </div>

    </PageShell>
  );
}
