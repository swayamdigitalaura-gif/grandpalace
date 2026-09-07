import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Drumstick, Sprout, Flower2, Utensils } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ExploreMenus } from "@/components/ExploreMenus";
import { useEffect, useMemo, useState } from "react";
import { API_URL, type MenuCategory as MenuCategoryDTO } from "@/lib/admin-api";

// Server-rendered — this list used to be a plain useQuery with no loader,
// so the entire menu (every category/dish) rendered blank during SSR and
// only appeared after client-side hydration fetched it.
async function fetchCategories(): Promise<MenuCategoryDTO[]> {
  try {
    const res = await fetch(`${API_URL}/api/menu/a-la-carte`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { fetchPageContent, useLiveContent } from "@/lib/pageContent";

import menuHero    from "@/assets/menu-hero-020.jpg";
import pageHeroImgDefault from "@/assets/hero-menu-spread.jpg";
import setMenuCardImg  from "@/assets/gallery/Hero_022-scaled.jpg";
import beveragesHeroImg from "@/assets/hero-beverages-wines.jpg";
import lunchSpecialCardImg from "@/assets/hero-lunch-special-spread.jpg";
import menuImg     from "@/assets/menu.jpg";
import biryaniImg  from "@/assets/whats-on-biryani.png";
import spicesImg   from "@/assets/crafted-spices-section.jpg";
import sidesImg    from "@/assets/gallery/NotHero_085_Assorted-Sides-scaled.jpg";
import dessertImg  from "@/assets/birthday-015.jpg";
import menuFeature from "@/assets/menu-feature.png";
import g1          from "@/assets/gallery/Hero_001-scaled.jpg";
import g2          from "@/assets/gallery/Hero_004-1.jpg";
import g3          from "@/assets/gallery/Hero_005-1-scaled.jpg";
import g4          from "@/assets/gallery/NotHero_002-scaled.jpg";
import g5          from "@/assets/gallery/NotHero_009-scaled.jpg";
import g6          from "@/assets/gallery/NotHero_019-scaled.jpg";
import g7          from "@/assets/gallery/NotHero_031-scaled.jpg";
import g8          from "@/assets/gallery/NotHero_040-scaled.jpg";
import g9          from "@/assets/gallery/NotHero_076.jpg";
import g10         from "@/assets/gallery/NotHero_078.jpg";
import g11         from "@/assets/gallery/SLA09430-scaled.jpg";
import g12         from "@/assets/gallery/SLA09433-scaled.jpg";
import g13         from "@/assets/gallery/SLA09455.jpg";
import g14         from "@/assets/gallery/Hero_011-scaled.jpg";
import g15         from "@/assets/gallery/Hero_022-scaled.jpg";

/* ── Category banner images (distinct per section, not shared with dish thumbnails) ── */
import catAppVeg      from "@/assets/food-real/entree-gunpowder-gobhi.jpg";
import catAppChicken  from "@/assets/food-real/entree-lahori-boti-tikka.jpg";
import catAppLamb     from "@/assets/food-real/entree-chapli-kebab.jpg";
import catAppSeafood  from "@/assets/food-real/entree-tandoori-salmon.jpg";
import catMainsVeg     from "@/assets/menu-categories/cat-mains-veg.jpg";
import catMainsChicken from "@/assets/food-real/mains-dragon-chicken.jpg";
import catMainsLamb    from "@/assets/food-real/mains-bhuna-lamb.jpg";
import catMainsGoat    from "@/assets/food-real/mains-goat-masala.jpg";
import catMainsSeafood from "@/assets/food-real/mains-fish-curry.jpg";
import catBiryani  from "@/assets/menu-categories/cat-biryani.jpg";
import catBreads   from "@/assets/menu-categories/cat-breads.jpg";
import catSides    from "@/assets/menu-categories/cat-sides.jpg";
import catVegan    from "@/assets/food-real/mains-veg-korma.jpg";
import catJain     from "@/assets/food-real/mains-mixed-veg.jpg";
import catDesserts from "@/assets/menu-categories/cat-desserts.jpg";

export const Route = createFileRoute("/menu/a-la-carte")({
  loader: async () => {
    const [content, rawCategories] = await Promise.all([fetchPageContent("/menu/a-la-carte"), fetchCategories()]);
    return { content, rawCategories };
  },
  head: () => ({
    meta: [
      { title: "À la Carte Menu — The Grand Palace" },
      { name: "description", content: "Full à la carte menu — authentic Indian cuisine at The Grand Palace, Sydney CBD." },
    ],
  }),
  component: MenuPage,
});

/* ─── data ──────────────────────────────────────────────────────────────── */
type Item = { name: string; desc: string; price: string; badge?: string; img?: string; tag?: Category["tag"] };
type Category = { id: string; label: string; tag: "veg"|"non-veg"|"vegan"|"jain"|"mixed"; img: string; items: Item[] };


/* grouped for index panel */
const indexGroups = [
  { heading: "Appetizers", ids: ["app-veg","app-chicken","app-lamb","app-seafood"] },
  { heading: "Mains",      ids: ["mains-veg","mains-chicken","mains-lamb","mains-goat","mains-seafood"] },
  { heading: "",           ids: ["biryani","sides","breads","vegan-entrees","vegan-curries","vegan-sides","jain-curries","jain-entrees","kids","desserts"] },
];

const tagIcon: Record<string, { Icon: typeof Leaf; className: string }> = {
  veg: { Icon: Leaf, className: "text-green-600" },
  "non-veg": { Icon: Drumstick, className: "text-red-600" },
  vegan: { Icon: Sprout, className: "text-emerald-600" },
  jain: { Icon: Flower2, className: "text-amber-600" },
  mixed: { Icon: Utensils, className: "text-stone-400" },
};

function TagIcon({ tag, className = "w-3.5 h-3.5" }: { tag: string; className?: string }) {
  const entry = tagIcon[tag] ?? tagIcon.mixed;
  const { Icon, className: colorCls } = entry;
  return <Icon className={`${className} ${colorCls} flex-shrink-0`} strokeWidth={2.25} />;
}

const dishPool: Record<string, string[]> = {
  "app-veg":      [menuHero, g1, g6, menuFeature, g7, sidesImg, g9, g10],
  "app-chicken":  [g2, spicesImg, g11, g12, g14, g4],
  "app-lamb":     [g4, g3, g13, menuImg, g15],
  "app-seafood":  [menuFeature, g11, g13, g12],
  "mains-veg":    [g1, g6, g7, menuHero, sidesImg, g9, g10, g8],
  "mains-chicken":[g2, g14, g12, g15, spicesImg, menuImg],
  "mains-lamb":   [g3, g4, g13, menuImg, g15],
  "mains-goat":   [menuImg, g4, g3, g11],
  "mains-seafood":[menuFeature, g11, g13, g12],
  "biryani":      [biryaniImg, g2, g3, menuImg, g14, g15, spicesImg],
  "breads":       [spicesImg, g6, g7, g8, g9, g10, sidesImg, menuHero, g1, menuFeature, g11, g12],
  "sides":        [sidesImg, g6, g7, g9, g8, menuHero, g1, g10],
  "vegan":        [menuHero, g1, g6, g7, sidesImg, g9, g10, g8, biryaniImg, spicesImg, menuFeature, g11],
  "jain":         [g1, menuHero, g6, g7, sidesImg, g9, g10],
  "desserts":     [dessertImg, g10, g9, g8, g7],
};

/* ─── page ───────────────────────────────────────────────────────────────── */
function MenuPage() {
  const loaderData = Route.useLoaderData();
  const content = useLiveContent("/menu/a-la-carte", loaderData.content);
  const pageHeroImg = useSiteImage("alacarte-hero", content["hero.image"] || pageHeroImgDefault);
  const lunchSpecialActive = useSiteToggle("lunch-special");
  const rawCategories = loaderData.rawCategories;

  const categories: Category[] = useMemo(() => (rawCategories ?? []).map((cat) => ({
    id: cat.slug,
    label: cat.label,
    tag: (cat.tag ?? "mixed") as Category["tag"],
    img: cat.imageUrl || menuHero,
    items: cat.items.map((it) => ({
      name: it.name,
      desc: it.description ?? "",
      price: it.price ?? "",
      badge: it.badge ?? undefined,
      img: it.imageUrl ?? undefined,
      tag: typeof it.extra?.tag === "string" ? (it.extra.tag as Category["tag"]) : undefined,
    })),
  })), [rawCategories]);

  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (categories.length && !activeId) setActiveId(categories[0].id);
  }, [categories, activeId]);

  useEffect(() => {
    if (!categories.length) return;
    const obs = categories.map((cat) => {
      const el = document.getElementById(cat.id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveId(cat.id); },
        { rootMargin: "-35% 0px -55% 0px" }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach((o) => o?.disconnect());
  }, [categories]);


  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: "À la Carte" }]}>
      {/* ── Hero ── */}
      <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={pageHeroImg} alt="" data-tgp-key="hero.image" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10">
          <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            The Grand Palace · Sydney CBD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(44px,9vw,110px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            À la Carte Menu
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

      <div className="flex bg-stone-50 min-h-screen">

        {/* ══ MENU INDEX PANEL ══════════════════════════════════════════════ */}
        <div className="hidden lg:block flex-shrink-0 sticky top-0 h-screen w-56">
          <div className="h-full flex flex-col"
               style={{background:"linear-gradient(170deg,#fffdf7 0%,#fef6e4 60%,#fdefd3 100%)",
                       borderRight:"2px solid rgba(200,140,30,0.18)",
                       boxShadow:"4px 0 24px rgba(180,110,20,0.07)"}}>

            {/* top logo area */}
            <div className="px-5 pt-7 pb-5 text-center" style={{borderBottom:"1px solid rgba(200,140,30,0.18)"}}>
              <p className="text-[8px] tracking-[0.55em] uppercase font-semibold mb-1" style={{color:"#b8860b"}}>The Grand Palace</p>
              <p className="font-display text-[28px] leading-none" style={{color:"#1a0e00"}}>À la Carte</p>
              <div className="flex items-center justify-center gap-2 mt-2.5">
                <span className="h-px flex-1" style={{background:"rgba(200,140,30,0.3)"}} />
                <span className="text-[10px]" style={{color:"rgba(180,120,20,0.5)"}}>◆</span>
                <span className="h-px flex-1" style={{background:"rgba(200,140,30,0.3)"}} />
              </div>
            </div>

            {/* index list */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 mt-1" style={{scrollbarWidth:"none"}}>
              {indexGroups.map((group, gi) => (
                <div key={gi} className={gi > 0 ? "mt-2" : ""}>
                  {group.heading && (
                    <p className="text-[9px] uppercase tracking-[0.4em] font-bold px-2 mb-1 mt-3" style={{color:"#a06820"}}>{group.heading}</p>
                  )}
                  {group.ids.map((id) => {
                    const cat = categories.find(c => c.id === id)!;
                    const active = activeId === id;
                    const short = cat.label.includes("·") ? cat.label.split("·")[1].trim() : cat.label;
                    return (
                      <button key={id} onClick={() => go(id)}
                        className="w-full text-left px-3 py-2 rounded-lg mb-0.5 flex items-center gap-2.5 transition-all duration-200"
                        style={active
                          ? {background:"linear-gradient(90deg,#c8860a,#e6a020)",color:"#fff",boxShadow:"0 2px 8px rgba(200,134,10,0.35)"}
                          : {color:"#1a0e00"}}>
                        <TagIcon tag={cat.tag} className="w-3 h-3" />
                        <span className={`text-[13px] leading-snug ${active ? "font-semibold" : "font-medium"}`}>{short}</span>
                        {active && <span className="ml-auto text-white/70 text-sm leading-none">›</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* bottom CTA */}
            <div className="px-4 py-4" style={{borderTop:"1px solid rgba(200,140,30,0.18)"}}>
              <Link to="/book-a-table"
                className="block text-center text-[11px] uppercase tracking-widest font-bold py-2.5 rounded-lg transition hover:brightness-105"
                style={{background:"linear-gradient(90deg,#c8860a,#e6a020)",color:"#fff",boxShadow:"0 2px 10px rgba(200,134,10,0.3)"}}>
                Book a Table
              </Link>
              <p className="text-[10px] text-center mt-3 leading-relaxed" style={{color:"#7a5020"}}>
                Basement, 261 George St<br/>Sydney NSW 2000
              </p>
            </div>
          </div>
        </div>

        {/* ══ CONTENT ══════════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 py-8 px-4 md:px-8 space-y-10">

          {/* legend */}
          <div className="flex flex-wrap gap-4 text-xs text-stone-500 bg-white rounded-xl px-5 py-3 border border-stone-200 items-center">
            <span className="font-semibold text-stone-700 text-[10px] uppercase tracking-widest">Legend</span>
            {["veg", "non-veg", "vegan", "jain"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5">
                <TagIcon tag={tag} className="w-3.5 h-3.5" />
                {tag === "non-veg" ? "Non-Vegetarian" : tag === "veg" ? "Vegetarian" : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
            <span className="flex items-center gap-1.5"><span className="text-amber-600 font-bold">★</span> Chef's Special</span>
          </div>

          {/* ── category sections ── */}
          {categories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-28 lg:scroll-mt-36">
              <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200">

                {/* section header: full-width bg image */}
                <div className="relative flex items-end min-h-[180px] md:min-h-[220px] overflow-hidden bg-stone-900">
                  <img src={cat.img} alt="" aria-hidden="true"
                       className="absolute inset-0 w-full h-full object-cover scale-110"
                       style={{filter:"brightness(0.5) saturate(1.1) blur(20px)"}} />
                  <img src={cat.img} alt={cat.label}
                       className="absolute inset-0 w-full h-full object-cover"
                       style={{filter:"brightness(0.85) saturate(1.15)"}} />
                  <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(10,4,0,0.88) 0%,rgba(10,4,0,0.45) 55%,rgba(10,4,0,0.2) 100%)"}} />
                  <div className="relative z-10 flex flex-col px-6 py-6 gap-2">
                    <div className="flex items-center gap-2">
                      <TagIcon tag={cat.tag} className="w-4 h-4" />
                      {cat.tag !== "mixed" && (
                        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${
                          cat.tag==="veg"?"bg-green-900/40 text-green-300":
                          cat.tag==="non-veg"?"bg-red-900/40 text-red-300":
                          cat.tag==="vegan"?"bg-emerald-900/40 text-emerald-300":"bg-amber-900/40 text-amber-300"}`}>
                          {cat.tag==="non-veg"?"Non-Veg":cat.tag.charAt(0).toUpperCase()+cat.tag.slice(1)}
                        </span>
                      )}
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl text-white leading-tight">{cat.label}</h2>
                    <p className="text-amber-300 text-[11px] tracking-wider">{cat.items.length} dishes</p>
                  </div>
                </div>

                {/* items grid */}
                <div className="bg-white grid sm:grid-cols-2">
                  {cat.items.map((item, i) => {
                    const pool = dishPool[cat.id] ?? [cat.img];
                    const thumb = item.img ?? pool[i % pool.length];
                    return (
                      <div key={i}
                        className={`flex gap-4 px-5 py-5 hover:bg-amber-50/70 transition-colors items-start
                          ${i >= 2 ? "border-t border-stone-100" : ""}
                          ${i % 2 === 1 ? "sm:border-l border-stone-100" : ""}
                          ${i % 2 === 0 && i === cat.items.length - 1 && cat.items.length % 2 !== 0 ? "sm:col-span-2" : ""}
                        `}>
                        {/* dish image */}
                        <div className="flex-shrink-0 w-[100px] h-[100px] rounded-xl overflow-hidden shadow-sm"
                             style={{border:"1px solid rgba(0,0,0,0.07)"}}>
                          <img src={thumb} alt={item.name}
                               className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        {/* text */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <TagIcon tag={item.tag ?? cat.tag} className="w-3.5 h-3.5" />
                            <span className="font-semibold text-stone-800 text-[15px] leading-tight">{item.name}</span>
                            {item.badge && (
                              <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-bold">★ Chef's</span>
                            )}
                          </div>
                          <p className="text-stone-500 text-[13px] leading-relaxed">{item.desc}</p>
                          <p className="font-bold text-amber-700 text-[15px] mt-2">{item.price}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}

          {/* explore other menus */}
          <ExploreMenus cards={[
            { to: "/set-menu", img: setMenuCardImg, kicker: "Curated Banquets", title: "Set Menu", desc: "Three courses of the best of TGP, from $65 per person.", pos: "25% 85%" },
            { to: "/beverages", img: beveragesHeroImg, kicker: "Drinks", title: "Beverages", desc: "Cocktails, wine, spirits and non-alcoholic favourites." },
            ...(lunchSpecialActive ? [{ to: "/lunch-special", img: lunchSpecialCardImg, kicker: "Weekday Midday", title: "Lunch Special", desc: "Three curated lunch banquets, available every day 12pm–3pm." }] : []),
          ]} />

          {/* footer */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <p className="text-stone-500 text-sm">Prices subject to change · Card surcharge applies · 10% surcharge on public holidays</p>
            <div className="flex flex-wrap gap-3 justify-center mt-4">
              <a href="tel:+61280217696" className="border border-stone-200 text-stone-600 rounded-full px-4 py-2 text-sm hover:bg-stone-50 transition">📞 (02) 8021 7696</a>
              <a href="mailto:bookings@thegrandpalace.com.au" className="border border-stone-200 text-stone-600 rounded-full px-4 py-2 text-sm hover:bg-stone-50 transition">
                ✉ <span className="hidden sm:inline">bookings@thegrandpalace.com.au</span><span className="sm:hidden">Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
