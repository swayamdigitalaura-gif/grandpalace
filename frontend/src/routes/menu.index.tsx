import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { ExploreMenus } from "@/components/ExploreMenus";
import heroImgDefault   from "@/assets/gallery/Hero_002.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import aLaCarteCardImg  from "@/assets/hero-menu-spread.jpg";
import setMenuCardImg   from "@/assets/gallery/Hero_022-scaled.jpg";
import beveragesCardImg from "@/assets/hero-beverages-wines.jpg";
import lunchCardImg     from "@/assets/hero-lunch-special-spread.jpg";

export const Route = createFileRoute("/menu/")({
  loader: () => fetchPageContent("/menu"),
  head: () => ({
    meta: [
      { title: "Menu — The Grand Palace" },
      { name: "description", content: "Explore our à la carte dishes, Set Menus, Beverages and Lunch Special Set Menu at The Grand Palace, Sydney CBD." },
    ],
  }),
  component: MenuHubPage,
});

function MenuHubPage() {
  const content = useLiveContent("/menu", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = useSiteImage("menu-index-hero", content["hero.image"] || heroImgDefault);
  const lunchSpecialActive = useSiteToggle("lunch-special");
  return (
    <PageShell crumbs={[{ label: "Menu" }]}>

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
            Menu
          </h1>
          <div className="flex items-center gap-4" style={{ width: "10rem" }}>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
            <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          </div>
          <p className="text-[11px] tracking-[0.4em] uppercase" style={{ color: "rgba(255,235,190,0.9)" }}>
            À la Carte · Set Menu · Beverages · Lunch Special
          </p>
        </div>
      </div>

      {/* ══ INTRO ══ */}
      <div className="section-cream py-14 px-6 text-center">
        <p data-tgp-key="intro.text" className="text-stone-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          {c("intro.text", "Discover our rich selection of à la carte dishes, Set Menus, and refreshing Beverages — crafted to give you a truly royal dining experience.")}
        </p>
      </div>

      {/* ══ MENU CARDS ══ */}
      <div className="bg-stone-50 py-4 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <ExploreMenus cards={[
            { to: "/menu/a-la-carte", img: aLaCarteCardImg,  kicker: "Full Menu",       title: "À la Carte",              desc: "Our full menu of authentic Indian dishes, made to order." },
            { to: "/set-menu",        img: setMenuCardImg,   kicker: "Curated Banquets", title: "Set Menu",                desc: "Three courses of the best of TGP, from $65 per person.", pos: "25% 85%" },
            { to: "/beverages",       img: beveragesCardImg, kicker: "Drinks",           title: "Beverages",               desc: "Cocktails, wine, spirits and non-alcoholic favourites." },
            ...(lunchSpecialActive ? [{ to: "/lunch-special", img: lunchCardImg, kicker: "Weekday Midday", title: "Lunch Special", desc: "Three curated lunch banquets, available every day 12pm–3pm." }] : []),
          ]} />
        </div>
      </div>

      {/* ══ WELCOME — dark, breaks up the light Intro/Cards/CTA rhythm ══ */}
      <div className="relative bg-palace py-20 px-6 text-center overflow-hidden">
        <div className="relative max-w-4xl mx-auto">
          <div className="text-xs tracking-[0.5em] uppercase text-saffron mb-4">Welcome</div>
          <div className="flex items-center gap-4 justify-center mt-4 mb-6" style={{ width: "10rem", marginInline: "auto" }}>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
            <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          </div>
          <h2 data-tgp-key="welcome.heading" className="font-display text-4xl md:text-6xl text-gold-gradient mb-6">
            {c("welcome.heading", "Dine in The Grand Palace - Indian Restaurant Sydney CBD")}
          </h2>
          <p data-tgp-key="welcome.body" className="text-cream/70 leading-relaxed md:text-lg">
            {c("welcome.body", "The Grand Palace - Indian Restaurant brings the most authentic Indian cuisine to Australian shores. Our chefs prepare fresh curries every day, full of bold flavour. Our carefully crafted interior is a reminiscence of glamorous majestic palaces of India — and our attentive service is here to offer you an unforgettable dining experience.")}
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-3 text-[10px] md:text-xs tracking-[0.2em] uppercase">
            {["Gluten Free", "Vegetarian", "Vegan", "Halal Certified", "HACCP"].map((b) => (
              <div key={b} className="border border-gold/40 rounded-full px-4 py-3 text-cream/80 bg-white/[0.04] hover:bg-gold hover:text-palace transition text-center flex items-center justify-center">
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM CTA ══ */}
      <div className="section-cream py-12 px-6 text-center" style={{ borderTop: "1px solid rgba(200,150,50,0.15)" }}>
        <p className="text-[9px] tracking-[0.55em] uppercase text-amber-700 mb-3">Reserve Your Evening</p>
        <h3 className="font-display text-3xl md:text-5xl text-stone-900 mb-4">Ready to Dine With Us?</h3>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Book a table or order online to experience The Grand Palace for yourself.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="btn-outline-gold">Order Online</a>
        </div>
      </div>

    </PageShell>
  );
}
