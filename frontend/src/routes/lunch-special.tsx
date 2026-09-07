import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { MandalaDivider } from "@/components/MandalaDivider";
import { ExploreMenus } from "@/components/ExploreMenus";
import heroImgDefault   from "@/assets/hero-lunch-special-spread.jpg";
import aLaCarteCardImg  from "@/assets/hero-menu-spread.jpg";
import setMenuCardImg   from "@/assets/gallery/Hero_022-scaled.jpg";
import beveragesCardImg from "@/assets/hero-beverages-wines.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

export const Route = createFileRoute("/lunch-special")({
  loader: () => fetchPageContent("/lunch-special"),
  head: () => ({
    meta: [
      { title: "Lunch Special Set Menu — The Grand Palace" },
      { name: "description", content: "Three curated lunch banquets — Halka $35, Fulka $45, Bhari $60. Available everyday 12pm–3pm at The Grand Palace, Sydney CBD." },
    ],
  }),
  component: LunchSpecialPage,
});

/* ── DATA ─────────────────────────────────────────────────────── */
const vegDishes = {
  entrees: [
    { name: "Paneer Schnitzel", img: "/dishes/PANEER-SCHNITZEL.png" },
    { name: "Hariyali Kebab",   img: "/dishes/HARIYALI-KEBAB.png" },
    { name: "Samosa",           img: "/dishes/TRIANGLE-SAMOSA.png" },
    { name: "Onion Bhaji",      img: "/dishes/ONION-BHAJI.png" },
  ],
  curries: [
    { name: "Navratan Korma",  img: "/dishes/Vegetables-Korma.png" },
    { name: "Shahi Paneer",    img: "/dishes/KADHAI-PANEER.png" },
    { name: "Aloo Gobhi",      img: "/dishes/Aloo-Gobhi.png" },
    { name: "Bhindi Do Pyaza", img: "/dishes/BHINDI-DO-PYAZA.png" },
  ],
};

const nonVegDishes = {
  entrees: [
    { name: "Murgh Abir Tikka",       img: "/dishes/MURGH-ABEER-TIKKA.png" },
    { name: "Saffron Chicken Tikka",  img: "/dishes/Entree_Saffron-Chicken-Tikka_01-ri381p5s1zwap0rpedu6zn6dx5gkaxtcbcqyo272f4.jpg" },
    { name: "Kakori Kebab",           img: "/dishes/KAKORI-KEBAB.png" },
    { name: "Semolina Crusted Prawns",img: "/dishes/SEMOLINA-CRUSTED-PRAWNS.png" },
  ],
  curries: [
    { name: "Butter Chicken",       img: "/dishes/BUTTER-CHICKEN.png" },
    { name: "Chicken Tikka Masala", img: "/dishes/Mains_Chicken-Tikka-Masala_04-scaled-ri388vne9fq5dsc8gzkljby5a42i3pbiyw5hn5jsw0.jpg" },
    { name: "Chicken Saag Wala",    img: "/dishes/CHICKEN-SAAG-WALA-32.90.png" },
    { name: "Kashmiri Rogan Josh",  img: "/dishes/Kashmiri-Rogan-Josh.png" },
    { name: "Masala Fish Curry",    img: "/dishes/Masala-Fish-Curry.png" },
  ],
};

const extras = {
  daal: [
    { name: "Lasooni Daal Tadka", img: "/dishes/LASOONI-DAAL-TADKA.png" },
    { name: "Daal Makhani",       img: "/dishes/DAAL-MAKHANI.png" },
  ],
  dessert: [
    { name: "Gulab Jamun", img: "/dishes/Dessert_Gulab-Jamun-ri38l5fjhkiwyiiitaj938gsh7l0lg1dbmrp77crnk.jpeg" },
  ],
};

const notes = [
  "Available everyday, 12pm – 3pm",
  "One piece of each entrée per guest",
  "Unlimited repeat of curries, rice & staples",
  "One serve of dessert per guest",
  "All food is Halal & HACCP approved",
  "10% surcharge on public holidays",
  "All prices include GST",
];

/* ── PAGE ─────────────────────────────────────────────────────── */
function LunchSpecialPage() {
  const content = useLiveContent("/lunch-special", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = useSiteImage("lunch-special-hero", content["hero.image"] || heroImgDefault);
  const active = useSiteToggle("lunch-special");

  if (!active) {
    return (
      <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: "Lunch Special" }]}>
        <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "50vh" }}>
          <h1 className="font-display text-3xl md:text-4xl text-stone-900 mb-3">Lunch Special — Currently Unavailable</h1>
          <p className="text-stone-500 max-w-md mb-8">
            Our Lunch Special Set Menu isn't running at the moment. Check out our À la Carte menu or Set Menu banquets instead.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/menu/a-la-carte" className="btn-gold">À la Carte Menu</Link>
            <Link to="/set-menu" className="btn-outline-gold">Set Menu</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: "Lunch Special" }]}>

      {/* ══ HERO ══ */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ height: "58vh", minHeight: 380 }}>
        <img src={heroImg} alt="Lunch at The Grand Palace" data-tgp-key="hero.image" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(8,3,0,0.45) 0%,rgba(20,8,0,0.8) 100%)" }} />
        <div className="relative text-center px-6 max-w-3xl mx-auto">
          <p className="text-[9px] tracking-[0.75em] uppercase mb-4" style={{ color: "rgba(200,134,10,0.85)" }}>
            The Grand Palace Presents
          </p>
          <h1 className="font-display leading-none mb-5" style={{ fontSize: "clamp(34px,6vw,68px)", color: "#faf3e8" }}>
            Lunch Special Set Menu
          </h1>
          <div className="flex items-center gap-4 mx-auto mb-5" style={{ maxWidth: "220px" }}>
            <span className="h-px flex-1" style={{ background: "rgba(200,134,10,0.5)" }} />
            <span style={{ color: "rgba(200,134,10,0.7)", fontSize: 10 }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(200,134,10,0.5)" }} />
          </div>
          <p className="tracking-[0.45em] text-[12px] uppercase" style={{ color: "rgba(250,240,220,0.7)" }}>
            Everyday · 12pm – 3pm · Sydney CBD
          </p>
        </div>
      </section>

      {/* ══ PRICING CARDS ══ */}
      <section className="py-12 md:py-20 px-4" style={{ background: "#f5ede0" }}>
        <div className="text-center mb-14">
          <p className="text-[9px] tracking-[0.65em] uppercase mb-3" style={{ color: "rgba(180,100,10,0.6)" }}>Three Curated Banquets</p>
          <h2 className="font-display text-stone-900 leading-none" style={{ fontSize: "clamp(28px,4vw,48px)" }}>Choose Your Feast</h2>
          <div className="flex items-center gap-4 mt-4 mx-auto" style={{ maxWidth: "10rem" }}>
            <span className="h-px flex-1" style={{ background: "rgba(180,110,10,0.3)" }} />
            <span className="text-amber-700/40 text-xs">◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(180,110,10,0.3)" }} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-stretch">

          {/* ── HALKA ── */}
          <div className="rounded-2xl overflow-hidden flex flex-col"
               style={{ background: "#ffffff", boxShadow: "0 4px 28px rgba(0,0,0,0.07)", border: "1px solid rgba(200,150,50,0.18)" }}>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg,transparent,#c8860a,transparent)" }} />
            <div className="px-7 pt-8 pb-4">
              <p className="text-[9px] tracking-[0.55em] uppercase text-stone-400 mb-2">Solo Diner</p>
              <h3 data-tgp-key="halka.name" className="font-display leading-none" style={{ fontSize: "clamp(44px,6vw,60px)", color: "#2a1200" }}>{c("halka.name", "Halka")}</h3>
              <p data-tgp-key="halka.tagline" className="text-[11px] tracking-[0.35em] uppercase mt-1 mb-5" style={{ color: "#c8860a" }}>{c("halka.tagline", "Light")}</p>
              <div className="flex items-baseline gap-2 mb-7">
                <span data-tgp-key="halka.price" className="font-display" style={{ fontSize: "clamp(36px,5vw,50px)", color: "#2a1200" }}>{c("halka.price", "$35")}</span>
                <span className="text-stone-400 text-sm">/ person</span>
              </div>
            </div>

            <div className="px-7 pb-4 space-y-0 border-t" style={{ borderColor: "rgba(200,150,50,0.15)" }}>
              <p className="text-[9px] tracking-[0.5em] uppercase pt-5 pb-3 font-semibold" style={{ color: "#c8860a" }}>What's Included</p>
              <IncludeRow icon="✗" label="Entrée" value="Not included" dim />
              <IncludeRow icon="✓" label="Main" value="1 Curry (veg or non-veg)" />
              <IncludeRow icon="✓" label="Staples" value="Assorted Breads · Basmati Rice" />
              <IncludeRow icon="✗" label="Dessert" value="Not included" dim />
            </div>

            <div className="px-7 pb-8 mt-auto pt-5">
              <p className="text-[11px] text-stone-400 italic mb-4">Perfect for a solo lunch break</p>
              <Link to="/book-a-table"
                className="block text-center py-3 rounded-full text-[12px] uppercase tracking-[0.2em] font-semibold border transition hover:bg-amber-50"
                style={{ borderColor: "#c8860a", color: "#c8860a" }}>
                Book a Table
              </Link>
            </div>
          </div>

          {/* ── FULKA ── */}
          <div className="rounded-2xl overflow-hidden flex flex-col"
               style={{ background: "linear-gradient(160deg,#fefaf0,#fef4da)", boxShadow: "0 10px 42px rgba(0,0,0,0.12)", border: "1px solid rgba(200,150,50,0.28)" }}>
            <div className="h-[4px]" style={{ background: "linear-gradient(90deg,#c8860a,#e6a020,#c8860a)" }} />
            <div className="px-7 pt-8 pb-4 relative">
              <span className="absolute top-6 right-6 text-[9px] tracking-[0.25em] uppercase font-bold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(200,134,10,0.12)", border: "1px solid rgba(200,134,10,0.3)", color: "#c8860a" }}>
                ★ Popular
              </span>
              <p className="text-[9px] tracking-[0.55em] uppercase mb-2" style={{ color: "rgba(180,100,10,0.55)" }}>Min 2 Guests</p>
              <h3 data-tgp-key="fulka.name" className="font-display leading-none" style={{ fontSize: "clamp(44px,6vw,60px)", color: "#2a1200" }}>{c("fulka.name", "Fulka")}</h3>
              <p data-tgp-key="fulka.tagline" className="text-[11px] tracking-[0.35em] uppercase mt-1 mb-5" style={{ color: "#c8860a" }}>{c("fulka.tagline", "Wholesome")}</p>
              <div className="flex items-baseline gap-2 mb-7">
                <span data-tgp-key="fulka.price" className="font-display" style={{ fontSize: "clamp(36px,5vw,50px)", color: "#2a1200" }}>{c("fulka.price", "$45")}</span>
                <span className="text-sm" style={{ color: "rgba(160,90,10,0.5)" }}>/ person</span>
              </div>
            </div>

            <div className="px-7 pb-4 space-y-0 border-t" style={{ borderColor: "rgba(200,134,10,0.18)" }}>
              <p className="text-[9px] tracking-[0.5em] uppercase pt-5 pb-3 font-semibold" style={{ color: "#c8860a" }}>What's Included</p>
              <IncludeRow icon="✓" label="Entrée × 2" value="1 Veg + 1 Non-Veg" amber />
              <IncludeRow icon="✓" label="Curries × 2" value="1 Veg + 1 Non-Veg" amber />
              <IncludeRow icon="✓" label="Daal" value="Chef's choice" amber />
              <IncludeRow icon="✓" label="Staples" value="Rice · Breads · Salad · Papadum" amber />
              <IncludeRow icon="✓" label="Dessert" value="Gulab Jamun" amber />
            </div>

            <div className="px-7 pb-8 mt-auto pt-5">
              <p className="text-[11px] italic mb-4" style={{ color: "rgba(160,90,10,0.5)" }}>Unlimited curries, rice & staples</p>
              <Link to="/book-a-table"
                className="block text-center py-3 rounded-full text-[12px] uppercase tracking-[0.2em] font-semibold text-white transition hover:brightness-110"
                style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                Book a Table
              </Link>
            </div>
          </div>

          {/* ── BHARI ── */}
          <div className="rounded-2xl overflow-hidden flex flex-col relative"
               style={{ background: "linear-gradient(160deg,#2d1200,#1e0c00,#2a1400)", boxShadow: "0 12px 48px rgba(0,0,0,0.28)" }}>
            <div className="h-[4px]" style={{ background: "linear-gradient(90deg,#c8860a,#e6a020,#c8860a)" }} />
            {/* Watermark */}
            <div className="absolute bottom-16 right-2 pointer-events-none select-none overflow-hidden opacity-60">
              <span className="font-display" style={{ fontSize: "clamp(100px,15vw,160px)", color: "rgba(200,134,10,0.055)", letterSpacing: "-0.04em", lineHeight: 1 }}>60</span>
            </div>
            <div className="px-7 pt-8 pb-4 relative">
              <p className="text-[9px] tracking-[0.55em] uppercase mb-2" style={{ color: "rgba(200,134,10,0.55)" }}>Min 2 Guests</p>
              <h3 data-tgp-key="bhari.name" className="font-display leading-none" style={{ fontSize: "clamp(44px,6vw,60px)", color: "#faf3e8" }}>{c("bhari.name", "Bhari")}</h3>
              <p data-tgp-key="bhari.tagline" className="text-[11px] tracking-[0.35em] uppercase mt-1 mb-5" style={{ color: "#c8860a" }}>{c("bhari.tagline", "Bountiful Feast")}</p>
              <div className="flex items-baseline gap-2 mb-7">
                <span data-tgp-key="bhari.price" className="font-display" style={{ fontSize: "clamp(36px,5vw,50px)", color: "#faf3e8" }}>{c("bhari.price", "$60")}</span>
                <span className="text-sm" style={{ color: "rgba(200,134,10,0.5)" }}>/ person</span>
              </div>
            </div>

            <div className="px-7 pb-4 space-y-0 border-t relative" style={{ borderColor: "rgba(200,134,10,0.15)" }}>
              <p className="text-[9px] tracking-[0.5em] uppercase pt-5 pb-3 font-semibold" style={{ color: "rgba(200,134,10,0.7)" }}>What's Included</p>
              <IncludeRowDark label="Entrée × 4" value="2 Veg + 2 Non-Veg" />
              <IncludeRowDark label="Curries × 4" value="2 Veg + 2 Non-Veg" />
              <IncludeRowDark label="Daal" value="Chef's choice" />
              <IncludeRowDark label="Staples" value="Rice · Breads · Salad · Papadum" />
              <IncludeRowDark label="Dessert" value="Gulab Jamun" />
            </div>

            <div className="px-7 pb-8 mt-auto pt-5 relative">
              <p className="text-[11px] italic mb-4" style={{ color: "rgba(200,134,10,0.45)" }}>Unlimited curries, rice & staples for the table</p>
              <Link to="/book-a-table"
                className="block text-center py-3.5 rounded-full text-[12px] uppercase tracking-[0.22em] font-bold text-white transition hover:brightness-110"
                style={{ background: "linear-gradient(90deg,#c8860a,#e6a020,#c8860a)", boxShadow: "0 4px 20px rgba(200,134,10,0.35)" }}>
                Book the Feast
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ══ WHAT'S ON THE MENU ══ */}
      <section style={{ background: "#fdf8ef" }} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-[9px] tracking-[0.65em] uppercase mb-3" style={{ color: "rgba(180,100,10,0.6)" }}>
              Rotate through the finest
            </p>
            <h2 className="font-display leading-none mb-2" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#2a1200" }}>
              What's on the Menu
            </h2>
            <div className="flex items-center gap-4 mx-auto mt-4" style={{ maxWidth: "10rem" }}>
              <span className="h-px flex-1" style={{ background: "rgba(180,110,10,0.3)" }} />
              <span className="text-amber-700/40 text-xs">◆</span>
              <span className="h-px flex-1" style={{ background: "rgba(180,110,10,0.3)" }} />
            </div>
          </div>

          {/* Vegetarian | Non-Veg split */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 mb-8 lg:mb-10">

            {/* ── Vegetarian column ── */}
            <div>
              <div className="flex items-center gap-3 mb-7 pb-4" style={{ borderBottom: "2px solid rgba(200,150,50,0.25)" }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#4a8c3a" }} />
                <h3 className="font-display" style={{ fontSize: "clamp(20px,2.5vw,26px)", color: "#2a1200" }}>Vegetarian</h3>
              </div>
              <MenuSubGroup label="Entrées" dishes={vegDishes.entrees} />
              <MenuSubGroup label="Curries" dishes={vegDishes.curries} />
            </div>

            {/* ── Non-Veg column ── */}
            <div>
              <div className="flex items-center gap-3 mb-7 pb-4" style={{ borderBottom: "2px solid rgba(200,150,50,0.25)" }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: "#8c3a3a" }} />
                <h3 className="font-display" style={{ fontSize: "clamp(20px,2.5vw,26px)", color: "#2a1200" }}>Non-Vegetarian</h3>
              </div>
              <MenuSubGroup label="Entrées" dishes={nonVegDishes.entrees} />
              <MenuSubGroup label="Curries" dishes={nonVegDishes.curries} />
            </div>

          </div>

          {/* ── Daal & Dessert row ── */}
          <div className="h-px mb-10" style={{ background: "linear-gradient(90deg,transparent,rgba(200,150,50,0.3),transparent)" }} />
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(200,150,50,0.2)" }}>
                <span style={{ color: "#c8860a", fontSize: 10 }}>◆</span>
                <h3 className="font-display" style={{ fontSize: "clamp(18px,2vw,22px)", color: "#2a1200" }}>Daal</h3>
              </div>
              <MenuSubGroup dishes={extras.daal} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(200,150,50,0.2)" }}>
                <span style={{ color: "#c8860a", fontSize: 10 }}>◆</span>
                <h3 className="font-display" style={{ fontSize: "clamp(18px,2vw,22px)", color: "#2a1200" }}>Dessert</h3>
              </div>
              <MenuSubGroup dishes={extras.dessert} />
            </div>
          </div>

        </div>
      </section>

      {/* ══ EXPLORE OTHER MENUS ══ */}
      <div className="bg-stone-50 py-14 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <ExploreMenus cards={[
            { to: "/menu/a-la-carte", img: aLaCarteCardImg,  kicker: "Full Menu",       title: "À la Carte", desc: "Our full menu of authentic Indian dishes, made to order." },
            { to: "/set-menu",        img: setMenuCardImg,   kicker: "Curated Banquets", title: "Set Menu",   desc: "Three courses of the best of TGP, from $65 per person.", pos: "25% 85%" },
            { to: "/beverages",       img: beveragesCardImg, kicker: "Drinks",           title: "Beverages",  desc: "Cocktails, wine, spirits and non-alcoholic favourites." },
          ]} />
        </div>
      </div>

      {/* ══ NOTES ══ */}
      <div style={{ background: "linear-gradient(120deg,#221000,#3d1f06 60%,#221000)" }}>
        <div className="max-w-4xl mx-auto px-6 py-14">
          <MandalaDivider tone="gold" />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notes.map((note, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                   style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(200,134,10,0.15)" }}>
                <span style={{ color: "rgba(200,134,10,0.6)", fontSize: "10px", flexShrink: 0 }}>◆</span>
                <p className="text-[12px] leading-snug" style={{ color: "rgba(250,240,220,0.75)" }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM CTA ══ */}
      <div className="section-cream py-16 px-6 text-center" style={{ borderTop: "1px solid rgba(200,150,50,0.15)" }}>
        <p className="text-[9px] tracking-[0.55em] uppercase text-amber-700 mb-3">Reserve Your Lunch</p>
        <h3 className="font-display text-stone-900 mb-4" style={{ fontSize: "clamp(26px,4vw,48px)" }}>
          Dine in The Grand Palace at Noon
        </h3>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          A full Indian feast in the heart of Sydney CBD — the perfect escape from the city.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="btn-outline-gold">Order Online</a>
        </div>
      </div>

    </PageShell>
  );
}

/* ── HELPERS ──────────────────────────────────────────────────── */
function IncludeRow({ icon, label, value, dim, amber }: {
  icon: string; label: string; value: string; dim?: boolean; amber?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(200,150,50,0.1)" }}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span style={{ color: dim ? "#b0503c" : "#c8860a", fontSize: 11, lineHeight: 1 }}>{icon}</span>
        <span className="text-[12px] font-semibold"
              style={{ color: dim ? "#8a7a6a" : amber ? "#7a4a0a" : "#3a2010" }}>
          {label}
        </span>
      </div>
      <span className="text-right text-[13px] leading-snug"
            style={{ color: dim ? "#9c8c7a" : amber ? "#5a3a0a" : "#3a2010" }}>
        {value}
      </span>
    </div>
  );
}

function IncludeRowDark({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: "1px solid rgba(200,134,10,0.1)" }}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span style={{ color: "#c8860a", fontSize: 11 }}>✓</span>
        <span className="text-[12px] font-semibold" style={{ color: "rgba(250,243,232,0.85)" }}>{label}</span>
      </div>
      <span className="text-right text-[13px]" style={{ color: "rgba(250,243,232,0.65)" }}>{value}</span>
    </div>
  );
}

function MenuSubGroup({ label, dishes }: { label?: string; dishes: { name: string; img: string }[] }) {
  return (
    <div className="mb-7 last:mb-0">
      {label && (
        <p className="text-[9px] tracking-[0.5em] uppercase font-semibold mb-3"
           style={{ color: "#c8860a" }}>
          {label}
        </p>
      )}
      <div className="space-y-2">
        {dishes.map((d, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
               style={{
                 background: i % 2 === 0 ? "#ffffff" : "rgba(200,150,50,0.06)",
                 border: "1px solid rgba(200,150,50,0.14)",
                 boxShadow: i % 2 === 0 ? "0 1px 6px rgba(0,0,0,0.05)" : "none",
               }}>
            <img src={d.img} alt={d.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                 style={{ border: "1px solid rgba(200,150,50,0.2)" }} />
            <span className="text-[16px] font-medium" style={{ color: "#2a1200" }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
