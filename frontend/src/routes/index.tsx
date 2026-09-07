import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { api, API_URL, type GalleryImage } from "@/lib/admin-api";
import type { SeoSetting } from "@/lib/admin-api";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { MandalaDivider } from "@/components/MandalaDivider";
import { ArrowRight, Award, Leaf, Sparkles, Utensils } from "lucide-react";
import menuImg from "@/assets/menu-section.png";
import menuFeatureImg from "@/assets/menu-feature.png";
import menuHero020Default from "@/assets/menu-hero-020.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import introVideo from "@/assets/intro-video.mp4";
import birthdayImgDefault from "@/assets/birthday-015.jpg";
import milestoneImgDefault from "@/assets/corporate-section.png";
import venueImgDefault from "@/assets/venue-section.png";
import corporateImgDefault from "@/assets/milestone-celebration.jpg";
import officeCateringImgDefault from "@/assets/catering-venue-live-final.jpg";
import venueCateringImgDefault from "@/assets/office-catering-live-final.jpg";
import mandala from "@/assets/mandala.png";
import type { PageContent } from "@/lib/admin-api";
import { fetchPageContent, makeContent, useLiveContent } from "@/lib/pageContent";

const DEFAULT_TITLE = "The Grand Palace — Indian Fine Dining in Sydney CBD";
const DEFAULT_DESCRIPTION = "Grand Indian dining experience in the heart of Sydney CBD. HACCP certified, Gold Licensed. Book a table, host events, order catering.";

// Proof-of-pattern for the admin SEO panel's per-page overrides — the
// homepage is the first page wired to actually apply them. A backend hiccup
// falls back to the hardcoded defaults, never breaks the page.
async function fetchHomeSeo(): Promise<SeoSetting | null> {
  try {
    const res = await fetch(`${API_URL}/api/seo/pages/lookup?path=/`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchHomeContent(): Promise<PageContent | null> {
  try {
    const res = await fetch(`${API_URL}/api/content/pages/lookup?path=/`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Server-rendered — these two used to be plain useQuery calls with no
// loader, so real admin-managed reviews/gallery photos never appeared in
// the SSR HTML on the homepage. Reviews silently fell back to 3 hardcoded
// placeholder quotes for every crawler/social-preview request; the gallery
// preview rendered as an empty section.
async function fetchHomeReviews(): Promise<{ name: string; quote: string; stars: number }[]> {
  try {
    const res = await fetch(`${API_URL}/api/reviews`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchHomeGalleryImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`${API_URL}/api/gallery?collection=homepage`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchHomeLoaderData() {
  const [seo, content, blocks, reviews, galleryImages] = await Promise.all([
    fetchHomeSeo(),
    fetchHomeContent(),
    fetchPageContent("/"),
    fetchHomeReviews(),
    fetchHomeGalleryImages(),
  ]);
  return { seo, content, blocks, reviews, galleryImages };
}

export const Route = createFileRoute("/")({
  loader: () => fetchHomeLoaderData(),
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const title = seo?.metaTitle || DEFAULT_TITLE;
    const description = seo?.metaDescription || DEFAULT_DESCRIPTION;
    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ];
    if (seo?.ogImage) meta.push({ property: "og:image", content: seo.ogImage });
    const links = seo?.canonicalUrl ? [{ rel: "canonical", href: seo.canonicalUrl }] : [];
    return { meta, links };
  },
  component: Home,
});

// Hardcoded fallbacks — used whenever an admin-editable field is empty, so
// an unfinished/blank edit never leaves a gap on the live page.
const cms = (doc: PageContent | null | undefined, field: keyof PageContent, fallback: string) =>
  (doc?.[field] as string) || fallback;

function Home() {
  const { seo, content: loadedContent, blocks, reviews, galleryImages } = Route.useLoaderData();
  const blockContent = useLiveContent("/", blocks);
  const c = makeContent(blockContent);
  // Merges live edits posted from the admin's preview iframe on top of the
  // loaded content — see useLiveContent in pageContent.ts for the pattern
  // this mirrors (Home still uses the older PageContent shape, not ContentMap).
  const [liveOverrides, setLiveOverrides] = useState<Record<string, string>>({});
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data || e.data.type !== "tgp-preview-update" || e.data.path !== "/") return;
      setLiveOverrides((o) => ({ ...o, [e.data.key]: e.data.value }));
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);
  const content = Object.keys(liveOverrides).length ? { ...loadedContent, ...liveOverrides } as typeof loadedContent : loadedContent;
  // Owned by the admin Content editor now (Menu section photo) — not the
  // Site Images admin panel, so there's exactly one place to edit this image.
  const menuHero020 = content?.menuSectionImage || menuHero020Default;
  const birthdayImg = useSiteImage("home-birthday-section", birthdayImgDefault);
  const venueImg = useSiteImage("home-venue-hire-section", venueImgDefault);
  const aboutParagraphs = (content?.aboutBody ?? "").split(/\n\s*\n/).filter(Boolean);
  const menuParagraphs = (content?.menuSectionBody ?? "").split(/\n\s*\n/).filter(Boolean);

  return (
    <PageShell>
      {seo?.schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.schema) }} />
      )}
      {/* HERO — dark */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/dGCgvw12CUk?autoplay=1&mute=1&loop=1&controls=0&playlist=dGCgvw12CUk&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1"
            title="background video"
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 border-0"
            style={{
              transform: "translate(-50%, -50%)",
              width: "max(177.78vh, 100%)",
              height: "max(100%, 56.25vw)",
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
          <div className="absolute inset-0 bg-palace hero-video-cover" style={{ zIndex: 2 }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-palace/80 via-palace/40 to-palace" />
        <div className="relative z-10 text-center max-w-4xl px-6 animate-fade-up">
          <div data-tgp-key="heroKicker" className="text-xs md:text-sm tracking-[0.5em] uppercase text-gold mb-6">{cms(content, "heroKicker", "Sydney CBD · Est. 2021")}</div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-8xl leading-[0.95] mb-6">
            <span data-tgp-key="heroHeadlineTop" className="text-gold-gradient">{cms(content, "heroHeadlineTop", "A True Taste")}</span>
            <br />
            <span data-tgp-key="heroHeadlineBottom" className="text-cream italic font-light">{cms(content, "heroHeadlineBottom", "of India")}</span>
          </h1>
          <p data-tgp-key="heroSubtext" className="text-base md:text-lg font-semibold text-cream max-w-2xl mx-auto mb-10 leading-relaxed" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)" }}>
            {cms(content, "heroSubtext", "Bold flavours, fresh curries and a dining room that channels the glamour of India's majestic palaces — right in the heart of Sydney.")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/book-a-table" className="btn-gold">Book a Table <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/menu/a-la-carte" className="btn-outline-gold">View Menu</Link>
          </div>
        </div>
      </section>

      {/* ABOUT — off-white with mandala */}
      <section className="section-cream relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 data-tgp-key="aboutHeading" className="font-display text-3xl md:text-4xl text-saffron leading-tight mb-4 whitespace-pre-line">
              {cms(content, "aboutHeading", "The Grand Palace | Indian Restaurant in Sydney CBD\nDining | Events | Catering")}
            </h2>
            <OrnamentDivider />
          </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: video */}
          <div className="relative rounded-xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
            <video
              src={introVideo}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>

          {/* Right: content */}
          <div>
            <div data-tgp-key="aboutBody">
              {(aboutParagraphs.length > 0 ? aboutParagraphs : [
                "The Grand Palace - Indian Restaurant brings the most authentic Indian Cuisine to Australian shores. Our food is full of bold flavours as our chefs prepare the fresh curries in our kitchen everyday. Our carefully crafted interior is a reminiscence of glamorous majestic palaces of India. Our attentive service is here to offer you an unforgettable dining experience.",
                "HACCP Food certificate is an epitome of authority about food hygiene, handling, and preparation methods. The Grand Palace - Indian Restaurant is proudly HACCP certified. We are also Gold Licensed allowing us to cater to many high end prestigious venues.",
              ]).map((p, i) => (
                <p key={i} className="text-palace/75 mt-6 mb-4 leading-relaxed last:mb-8">{p}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu/a-la-carte" className="btn-gold">Menu</Link>
              <Link to="/book-a-table" className="btn-outline-dark">Book Now</Link>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* OUR DELICIOUS MENU — dark */}
      <section className="relative py-20 px-6 overflow-hidden bg-palace">
        {/* Mandala grid background — unique tiled pattern */}
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[700px] opacity-[0.13] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute bottom-[-60px] left-0 w-[280px] opacity-[0.11]" style={{ animationDirection: "reverse" }} />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute top-10 right-0 w-[240px] opacity-[0.11]" />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 20% 80%, oklch(0.78 0.14 78 / 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.72 0.18 55 / 0.04) 0%, transparent 50%)` }} />

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-x-14 gap-y-5 items-center">
          {/* Mobile title */}
          <div className="order-1 md:hidden text-center">
            <h2 data-tgp-key="menuSectionHeading" className="font-display text-4xl text-cream mb-3">{cms(content, "menuSectionHeading", "Our Delicious Menu")}</h2>
            <OrnamentDivider tone="gold" align="center" />
          </div>
          {/* Left: image */}
          <div className="group img-hover relative rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.22)] aspect-[4/3] md:aspect-auto order-2 md:order-1">
            <img
              src={menuHero020}
              alt="Our Delicious Menu"
              data-tgp-key="menuSectionImage"
              className="w-full h-full md:h-auto object-cover block"
              style={{ transformOrigin: "center bottom" }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(212,168,76,0.10) 0%, transparent 60%)" }}
            />
          </div>

          {/* Right: content */}
          <div className="text-center md:text-left order-3 md:order-2">
            <div className="hidden md:block">
              <h2 data-tgp-key="menuSectionHeading" className="font-display text-4xl md:text-5xl text-cream mb-3">{cms(content, "menuSectionHeading", "Our Delicious Menu")}</h2>
              <OrnamentDivider tone="gold" align="center" />
            </div>
            <div data-tgp-key="menuSectionBody" className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              {(menuParagraphs.length > 0 ? menuParagraphs : [
                "The Grand Palace - Indian Restaurant offers authentic Indian cuisine, celebrating the rich and diverse flavours of India. Using premium Indian spices, we craft dishes that delight Sydney's food lovers.",
                "Renowned as the best Indian restaurant in Sydney CBD, we provide a grand dining experience with exquisite food, vibrant ambiance, and attentive service.",
                "At The Grand Palace - Indian Restaurant, savour the true taste of India.",
                "We also serve gluten free, vegetarian, vegan, no onion no garlic dishes. We use halal certified meat.",
              ]).map((p, i) => <p key={i}>{p}</p>)}
            </div>

            {/* Buttons */}
            <div className="flex flex-nowrap justify-center md:justify-start gap-2 sm:gap-3 mt-8 mb-7 overflow-x-auto">
              <Link to="/menu/a-la-carte" className="border border-cream/60 text-cream rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap hover:bg-cream hover:text-palace transition">Menu</Link>
              <Link to="/book-a-table" className="border border-cream/60 text-cream rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap hover:bg-cream hover:text-palace transition">Book Now</Link>
              <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="border border-cream/60 text-cream rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap hover:bg-cream hover:text-palace transition">Order Online</a>
            </div>

            {/* Certification badges */}
            <div className="flex flex-nowrap justify-center md:justify-start gap-2 sm:gap-4 items-center mt-2">
              {/* GF — Gluten Free */}
              <div className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full bg-[#1a9fd4] flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <span className="font-black text-[11px] sm:text-base leading-none">GF</span>
                <span className="hidden sm:block text-[7px] leading-none mt-0.5 opacity-90 tracking-wide">GLUTEN</span>
                <span className="hidden sm:block text-[7px] leading-none opacity-90 tracking-wide">FREE</span>
              </div>
              {/* Vegan */}
              <div className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full bg-[#3aaa35] flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-6 sm:w-6 fill-white mb-0.5">
                  <path d="M6.5 2C5 6 5 10 7 13c-1.5-1-2.5-2.5-3-4.5C3 12 3.5 15 6 17.5 4.5 17 3.5 16 3 15c.5 3 3 5.5 6 6.5-.5.3-1 .5-1.5.5H9c3 0 6-2 7.5-5 .5-1 .8-2.2.8-3.5 0-5-3-9-6.5-10C10 4.5 10 6 10 7c-1-1.5-1.5-3.5-.5-5H6.5z"/>
                </svg>
                <span className="hidden sm:block text-[8px] leading-none tracking-wide font-semibold">VEGAN</span>
              </div>
              {/* VG — Vegetarian */}
              <div className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full bg-[#f07d00] flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <span className="font-black text-[11px] sm:text-base leading-none">VG</span>
                <span className="hidden sm:block text-[7px] leading-none mt-0.5 opacity-90 tracking-wide">VEGGIE</span>
              </div>
              {/* Halal */}
              <div className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full bg-[#1a5c2a] flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-4 w-4 sm:h-6 sm:w-6 fill-white mb-0.5">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-5h2v2h-2zm0-8h2v6h-2z"/>
                  <path d="M17 7.5A6 6 0 0 0 7.2 11h1.5A4.5 4.5 0 0 1 17 9.1zM7 12.5a6 6 0 0 0 9.8 3.5l-1.1-1A4.5 4.5 0 0 1 8.5 12.5z"/>
                </svg>
                <span className="hidden sm:block text-[8px] leading-none tracking-wide font-semibold">HALAL</span>
              </div>
              {/* HACCP */}
              <div className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full bg-[#c0392b] flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-white mb-0.5">
                  <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm-2 16l-4-4 1.4-1.4L10 14.2l6.6-6.6L18 9l-8 8z"/>
                </svg>
                <span className="hidden sm:block text-[7px] leading-none tracking-wide font-semibold">HACCP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIRTHDAY — cream */}
      <section className="section-cream relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-5 items-center">
          <div className="order-1 md:hidden text-center">
            <h2 data-tgp-key="birthday.heading" className="font-display text-4xl text-palace mb-3">
              {c("birthday.heading", "Celebrate Your Birthday at TGP with Cake & Decoration")}
            </h2>
            <OrnamentDivider />
          </div>
          <div className="order-3 md:order-1">
            <div className="hidden md:block">
              <h2 data-tgp-key="birthday.heading" className="font-display text-4xl md:text-5xl text-palace mb-3">
                {c("birthday.heading", "Celebrate Your Birthday at TGP with Cake & Decoration")}
              </h2>
              <OrnamentDivider align="left" />
            </div>
            <p data-tgp-key="birthday.body1" className="text-palace/70 mt-6 mb-4 leading-relaxed text-center md:text-left">
              {c("birthday.body1", "When you celebrate your birthday at The Grand Palace - Indian Restaurant, you can enjoy the moment whilst we take care of cake and decoration.")}
            </p>
            <p data-tgp-key="birthday.body2" className="text-palace/70 mb-8 leading-relaxed text-center md:text-left">
              {c("birthday.body2", "Our special Birthday packages allow you to choose the cake, the decoration, or both — we do it for you so you don't have to.")}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 justify-items-center max-w-sm mx-auto md:max-w-none md:mx-0 md:flex md:flex-wrap md:justify-start md:gap-3 [&>*:last-child]:col-span-2 md:[&>*:last-child]:col-auto">
              <Link to="/birthday-package" className="btn-gold !text-[13px] !px-6 !py-3 whitespace-nowrap">Explore More</Link>
              <Link to="/birthday-package" className="btn-outline-dark !text-[13px] !px-6 !py-3 whitespace-nowrap">Enquire Now</Link>
              <a href="mailto:bookings@thegrandpalace.com.au" className="btn-outline-dark !text-[13px] !px-6 !py-3 whitespace-nowrap">Send Email</a>
            </div>
          </div>
          <div className="relative order-2 md:order-2">
            <div className="absolute -inset-4 border border-saffron/40 rounded-lg pointer-events-none" />
            <div className="img-hover rounded-lg shadow-xl">
              <img src={birthdayImg} alt="Birthday celebration" loading="lazy" decoding="async" width={1280} height={960} className="w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* HOST YOUR EVENTS — cream, 3-card grid (Venue for Hire + Corporate + Milestone) */}
      <section className="section-cream relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 data-tgp-key="hostevents.heading" className="font-display text-4xl md:text-6xl text-palace mb-2">{c("hostevents.heading", "Host Your Events")}</h2>
            <OrnamentDivider />
            <p data-tgp-key="hostevents.subtitle" className="text-palace/65 mt-5 max-w-2xl mx-auto leading-relaxed">
              {c("hostevents.subtitle", "From private venue hire to corporate functions and milestone celebrations, host your next event with The Grand Palace - Indian Restaurant — traditional recipes, bold flavours, and seamless coordination from start to finish.")}
            </p>
          </div>

          <HostEventsGrid venueImg={venueImg} />
        </div>
      </section>

      {/* CATERING SERVICES — dark (Office + At Your Venue combined) */}
      <section className="relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="gold" />
        <div className="relative max-w-6xl mx-auto">

          {/* Section header */}
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.45em] uppercase text-gold/70 mb-3">Delivered To You</p>
            <h2 className="font-display text-4xl md:text-6xl text-gold-gradient mb-4">Our Catering Services</h2>
            <OrnamentDivider tone="gold" />
          </div>

          <CateringGrid />
        </div>
      </section>

      {/* WHAT'S ON — cream */}
      <section className="section-cream relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl md:text-6xl text-palace mb-2">What's On</h2>
            <OrnamentDivider />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 — Indian Whisky */}
            <div className="img-hover bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(180,100,20,0.18)] hover:border-saffron/40 border border-stone-100 transition-all duration-500 flex flex-col">
              <div className="overflow-hidden h-60 shrink-0 bg-palace">
                <img src="https://booriz1miux5j9vr.public.blob.vercel-storage.com/Whiskey-sS8lZkbA2F93CFH7czzi16usJuIiLk.png" alt="Indian Whisky in Sydney" loading="lazy"
                  className="w-full h-full object-contain" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl text-palace mb-2 leading-snug">
                  Indian Whisky in Sydney
                </h3>
                <p className="text-saffron text-sm font-medium mb-2">Indri, Rampur & Amrut — three of India's most awarded single malts.</p>
                <p className="text-palace/65 text-sm leading-relaxed mb-4 flex-1">
                  Poured alongside authentic Indian food in Sydney CBD, from $18 a glass.
                </p>
                <div className="border-t border-palace/10 pt-4 flex gap-3">
                  <Link to="/whats-on/$slug" params={{ slug: "indian-whisky-sydney-cbd" }} className="bg-palace text-cream rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-saffron transition">Learn More</Link>
                  <Link to="/book-a-table" className="border border-palace text-palace rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-palace hover:text-cream transition">Book Now</Link>
                </div>
              </div>
            </div>

            {/* Card 2 — Biryani */}
            <div className="img-hover bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(180,100,20,0.18)] hover:border-saffron/40 border border-stone-100 transition-all duration-500 flex flex-col">
              <div className="overflow-hidden h-60 shrink-0 bg-palace">
                <img src="https://booriz1miux5j9vr.public.blob.vercel-storage.com/Briyani-oTqmcjPTCcfpmihvZDUGxQxVAjuzh8.png" alt="$20 Takeaway Biryani" loading="lazy"
                  className="w-full h-full object-contain" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl text-palace mb-2 leading-snug">$20 Takeaway Biryani Lunch</h3>
                <p className="text-saffron text-sm font-medium leading-relaxed mb-4 flex-1">
                  Enjoy our $20 takeaway biryani lunch special at The Grand Palace - Indian Restaurant, Sydney.
                </p>
                <div className="border-t border-palace/10 pt-4 flex gap-3">
                  <Link to="/whats-on/$slug" params={{ slug: "takeaway-biryani-lunch-special" }} className="bg-palace text-cream rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-saffron transition">Learn More</Link>
                  <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="border border-palace text-palace rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-palace hover:text-cream transition">Order Now</a>
                </div>
              </div>
            </div>

            {/* Card 3 — Celebrate Birthday */}
            <div className="img-hover bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-[0_16px_40px_rgba(180,100,20,0.18)] hover:border-saffron/40 border border-stone-100 transition-all duration-500 flex flex-col">
              <div className="overflow-hidden h-60 shrink-0 bg-palace">
                <img src="https://booriz1miux5j9vr.public.blob.vercel-storage.com/Birthday-4Yq05aMsFBHrLiDfDMqd1IeK2a8i36.png" alt="Celebrate Birthday" loading="lazy"
                  className="w-full h-full object-contain" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-xl text-palace mb-2 leading-snug">Celebrate Birthday</h3>
                <p className="text-palace/70 text-sm leading-relaxed mb-2">Celebrate Your Birthday in Style at The Grand Palace Sydney!</p>
                <p className="text-saffron text-sm font-medium mb-4 flex-1">Now Offering Exclusive Celebrate Birthday Deals – From Just $150!</p>
                <div className="border-t border-palace/10 pt-4 flex gap-3">
                  <Link to="/whats-on/$slug" params={{ slug: "birthday-party-packages" }} className="bg-palace text-cream rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-saffron transition">Learn More</Link>
                  <Link to="/book-a-table" className="border border-palace text-palace rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wide hover:bg-palace hover:text-cream transition">Book Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY — cream */}
      <GallerySection c={c} galleryImages={galleryImages} />

      {/* TESTIMONIALS — dark */}
      <TestimonialsSection reviews={reviews} />

      {/* WHY US — cream */}
      <section className="section-cream relative py-20 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs tracking-[0.5em] uppercase text-saffron mb-3">Why The Grand Palace</div>
            <h2 className="font-display text-4xl md:text-5xl text-palace">A Palace Above the Rest</h2>
            <OrnamentDivider />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "HACCP Certified", body: "Observing the highest food hygiene standards." },
              { icon: Sparkles, title: "Gold Licensed", body: "Trusted to cater high-end prestigious venues." },
              { icon: Utensils, title: "Authentic Recipes", body: "Bold regional flavours, fresh every day." },
              { icon: Leaf, title: "Dietary Friendly", body: "Vegan, gluten-free & no onion-garlic options." },
            ].map((f) => (
              <div key={f.title} className="group p-8 border border-saffron/30 rounded-lg bg-white/70 hover:shadow-[var(--shadow-gold)] hover:border-saffron transition">
                <f.icon className="h-8 w-8 text-saffron mb-4 group-hover:scale-110 transition" />
                <h3 className="font-display text-2xl mb-2 text-palace">{f.title}</h3>
                <p className="text-sm text-palace/70 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT — dark */}
      <ContactSection />
    </PageShell>
  );
}

/* ---------- Testimonials ---------- */

// Generic fallback shown only if the live API has no reviews yet / is unreachable —
// real reviews are managed at /admin/reviews and fetched from /api/reviews.
const FALLBACK_REVIEWS = [
  { name: "Jason W.", quote: "The Grand Palace has been our go-to for special occasions. The food is consistently excellent — bold, fragrant and beautifully presented. The atmosphere is unmatched in Sydney CBD.", stars: 5 },
  { name: "Sarah J.", quote: "Absolutely divine Indian food. Every dish felt authentic and carefully crafted. The service was attentive and warm — we felt truly special from the moment we walked in.", stars: 5 },
  { name: "Kevin L.", quote: "We hosted our corporate team dinner here and it was flawless. The event team organised everything seamlessly and the food was a real hit. Highly recommend for functions.", stars: 5 },
];

function TestimonialsSection({ reviews: liveReviews }: { reviews: { name: string; quote: string; stars: number }[] }) {
  const reviews = liveReviews.length ? liveReviews : FALLBACK_REVIEWS;

  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(reviews.length / perPage);
  const shown = reviews.slice(page * perPage, page * perPage + perPage);

  return (
    <section className="relative py-20 px-6 overflow-hidden bg-palace">
      {/* layered mandala background */}
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] opacity-[0.13] animate-spin-slow" />
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-40 top-0 w-[350px] opacity-[0.10]" style={{ animationDirection: "reverse" }} />
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-40 bottom-0 w-[350px] opacity-[0.10] animate-spin-slow" />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.5em] uppercase text-gold/70 mb-3">Guest Experiences</div>
          <h2 className="font-display text-4xl md:text-5xl text-gold-gradient mb-2">What Our Guests Say</h2>
          <OrnamentDivider tone="gold" />
        </div>

        {/* 3 cards — horizontal scroll-snap on mobile, grid on desktop */}
        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 md:overflow-visible scroll-px-6 px-1">
          {shown.map((r) => (
            <div
              key={r.name}
              className="group relative bg-cream rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] overflow-hidden hover:-translate-y-3 hover:shadow-[0_24px_60px_rgba(212,168,76,0.35)] transition-all duration-500 flex flex-col shrink-0 w-[88%] sm:w-[60%] md:w-auto snap-center"
            >
              {/* gold top bar that slides in on hover */}
              <div className="h-1 w-full bg-gradient-to-r from-gold via-gold-bright to-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

              <div className="p-7 flex flex-col flex-1 relative">
                {/* large decorative quote */}
                <div className="absolute top-3 right-5 font-display text-7xl text-saffron/20 leading-none select-none pointer-events-none z-10">"</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 relative z-10">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <svg key={j} viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" style={{ fill: "var(--color-saffron)" }}>
                      <path d="M10 1l2.4 6.4H19l-5.3 4 2 6.4L10 14l-5.7 3.8 2-6.4L1 7.4h6.6z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <ReviewQuote text={r.quote} />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-saffron/30 to-transparent mb-5 relative z-10" />

                {/* Author */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center font-display text-lg text-cream shrink-0 shadow-md"
                    style={{ background: "var(--gradient-gold)" }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-palace text-sm font-semibold">{r.name}</div>
                    <div className="text-saffron/70 text-xs tracking-wide flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-3 w-3" style={{ fill: "#4285F4" }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: "#34A853" }}/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{ fill: "#FBBC05" }}/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: "#EA4335" }}/>
                      </svg>
                      Verified Guest · Google
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-9 w-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-palace disabled:opacity-30 transition"
            aria-label="Previous"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current"><path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/></svg>
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`rounded-full transition-all duration-300 ${page === i ? "h-3 w-8 bg-gold" : "h-3 w-3 bg-gold/30 hover:bg-gold/60"}`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="h-9 w-9 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-palace disabled:opacity-30 transition"
            aria-label="Next"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg>
          </button>
        </div>

        {/* CTA */}
        <div className="text-center mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <a href="https://maps.app.goo.gl/thegrandpalacesydney" target="_blank" rel="noreferrer" className="btn-outline-gold">Leave a Review</a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const captcha = useSimpleCaptcha();

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!captcha.verify()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/enquiries", {
        type: "contact",
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        subject: form.subject || "Enquiry from website",
        message: form.message || null,
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full bg-white/90 border border-saffron/30 rounded-lg px-4 py-3 text-sm text-palace placeholder:text-palace/35 focus:outline-none focus:border-saffron focus:bg-white transition";

  return (
    <section className="relative py-20 px-6 overflow-hidden bg-palace">
      <CarvedBackdrop tone="gold" />
      <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] opacity-[0.13] animate-spin-slow" />

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

        {/* Left: info — dark theme */}
        <div>
          <div className="text-xs tracking-[0.5em] uppercase text-gold/70 mb-3">Get In Touch</div>
          <h2 className="font-display text-3xl md:text-5xl text-gold-gradient mb-4 leading-tight text-balance">
            Contact <br className="hidden md:block" />The Grand Palace - Indian Restaurant Sydney CBD
          </h2>
          <OrnamentDivider tone="gold" align="left" />
          <p className="text-muted-foreground mt-6 mb-10 leading-relaxed">
            Whether you'd like to make a booking, enquire about private events, catering, or simply have a question — our team is ready to help.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />,
                label: "Phone", value: "(02) 8021 7696", href: "tel:+61280217696",
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
                label: "Email", value: "bookings@thegrandpalace.com.au", href: "mailto:bookings@thegrandpalace.com.au",
              },
              {
                icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
                label: "Location", value: "Basement, 261 George St, Sydney NSW 2000", href: undefined,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 group">
                <div className="h-11 w-11 rounded-full border border-gold/40 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-palace transition shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">{item.icon}</svg>
                </div>
                <div>
                  <div className="text-gold/60 text-xs uppercase tracking-widest mb-1">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-cream/80 hover:text-gold transition text-sm">{item.value}</a>
                  ) : (
                    <span className="text-cream/80 text-sm">{item.value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Hours */}
          <div className="mt-10 border border-gold/20 rounded-xl p-6 bg-white/[0.04]">
            <div className="text-gold text-sm font-semibold tracking-wide mb-4">Opening Hours</div>
            {[
              { day: "Mon – Thu", hours: "Lunch 12–3pm · Dinner 5:30–10pm" },
              { day: "Friday", hours: "Lunch 12–3pm · Dinner 5:30–10:30pm" },
              { day: "Saturday", hours: "Lunch 12–3pm · Dinner 5–10:30pm" },
              { day: "Sunday", hours: "Lunch 12–3pm · Dinner 5–10pm" },
            ].map((h) => (
              <div key={h.day} className="flex justify-between text-xs py-2 border-b border-gold/10 last:border-0">
                <span className="text-cream/60 font-medium">{h.day}</span>
                <span className="text-cream/80">{h.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form — off-white panel on dark section */}
        <div className="bg-[oklch(0.97_0.025_85)] border border-gold/20 rounded-2xl p-8 shadow-[0_16px_60px_rgba(0,0,0,0.5)]">
          {sent ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-full bg-saffron/15 border border-saffron/40 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-2" style={{ stroke: "var(--color-saffron)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-palace mb-3">Message Sent!</h3>
              <p className="text-palace/60 text-sm">Thank you for reaching out. Our team will be in touch shortly.</p>
              <button onClick={() => setSent(false)} className="btn-outline-gold mt-8">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-display text-2xl text-palace mb-6">Send Us a Message</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-palace font-semibold uppercase tracking-widest block mb-1.5">Your Name *</label>
                  <input required name="name" value={form.name} onChange={handleChange} placeholder="John Smith" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-palace font-semibold uppercase tracking-widest block mb-1.5">Phone Number</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="+61 4xx xxx xxx" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-xs text-palace font-semibold uppercase tracking-widest block mb-1.5">Email Address *</label>
                <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-palace font-semibold uppercase tracking-widest block mb-1.5">Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange} className={inputCls}>
                  <option value="">Select a topic…</option>
                  <option>Table Reservation</option>
                  <option>Private Event / Venue Hire</option>
                  <option>Corporate Function</option>
                  <option>Catering Enquiry</option>
                  <option>Celebrate Birthday</option>
                  <option>General Enquiry</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-palace font-semibold uppercase tracking-widest block mb-1.5">Message *</label>
                <textarea required name="message" value={form.message} onChange={handleChange} rows={5} placeholder="Tell us about your enquiry, preferred date, number of guests…" className={`${inputCls} resize-none`} />
              </div>
              <SimpleCaptcha captcha={captcha} />
              <button type="submit" disabled={saving} className="btn-gold w-full justify-center mt-2 disabled:opacity-60">
                {saving ? "Sending…" : "Send Message"}
              </button>
              {error && <p className="text-red-500 text-[12px] text-center mt-2">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Gallery ---------- */

function GallerySection({ c, galleryImages }: { c: (key: string, fallback: string) => string; galleryImages: GalleryImage[] }) {
  const [visible, setVisible] = useState(12);
  const filtered = galleryImages;
  const shown = filtered.slice(0, visible);

  return (
    <section className="section-cream relative py-20 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 data-tgp-key="gallery.heading" className="font-display text-4xl md:text-5xl text-palace mb-2">
            {c("gallery.heading", "A look inside The Grand Palace Indian Restaurant")}
          </h2>
          <OrnamentDivider />
          <p data-tgp-key="gallery.subtitle" className="text-palace/60 mt-4 max-w-2xl mx-auto text-sm">
            {c("gallery.subtitle", "Explore our gallery, featuring rich ambiance, delectable cuisine and refreshing drinks that define our signature experience")}
          </p>
        </div>

        {/* Single tab */}
        <div className="flex justify-center mb-10">
          <span className="px-5 py-2 rounded-full text-xs uppercase tracking-widest font-medium bg-saffron text-cream shadow-[0_4px_14px_rgba(212,120,0,0.4)]">
            Gallery
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shown.map((img, i) => (
            <div
              key={img.id}
              className="group img-hover relative rounded-lg aspect-square shadow-md hover:shadow-[0_8px_30px_rgba(212,168,76,0.3)] hover:-translate-y-1 transition-all duration-500"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <img
                src={img.url}
                alt={img.alt || `Gallery — ${img.category}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-3">
                <span className="text-xs text-gold uppercase tracking-widest font-medium">{img.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* View More */}
        {visible < filtered.length && (
          <div className="text-center mt-10">
            <button
              onClick={() => setVisible((v) => v + 8)}
              className="btn-gold"
            >
              View More
            </button>
          </div>
        )}
        {visible >= filtered.length && (
          <div className="text-center mt-10">
            <Link to="/gallery" className="btn-outline-dark">View Full Gallery</Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- Host Your Events — 3-card grid (Venue for Hire + Corporate + Milestone) ---------- */

function HostEventsGrid({ venueImg }: { venueImg: string }) {
  const corporateImg = useSiteImage("home-corporate-section", corporateImgDefault);
  const milestoneImg = useSiteImage("home-private-celebration-section", milestoneImgDefault);

  const cards = [
    {
      title: "Venue for Hire",
      img: venueImg,
      alt: "Venue for hire at The Grand Palace",
      body: "Hire our whole restaurant for your birthday, baby shower, or milestone event until 3PM on Saturday and Sunday. Up to 125 guests, bring your own decorations and DJ, from $45 per person.",
      exploreHref: "/venue-for-hire",
      enquireHref: "/venue-for-hire",
    },
    {
      title: "Corporate Functions",
      img: corporateImg,
      alt: "Corporate function at The Grand Palace",
      body: "Personalised service and seamless coordination for meetings, team events, and corporate celebrations.",
      exploreHref: "/events#corporate-section",
      enquireHref: "/contact",
    },
    {
      title: "Milestone Celebrations",
      img: milestoneImg,
      alt: "Milestone celebration at The Grand Palace",
      body: "Weddings, anniversaries, or farewells — fully customised menus and seamless service for your special occasion.",
      exploreHref: "/events#private-section",
      enquireHref: "/contact",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xl border border-saffron/20 bg-white/70 overflow-hidden hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_12px_36px_-12px_rgba(212,120,0,0.2)] transition flex flex-col">
          <div className="img-hover relative aspect-[4/3] overflow-hidden">
            <img src={c.img} alt={c.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-display text-2xl text-palace mb-2">{c.title}</h3>
            <p className="text-palace/65 text-sm leading-relaxed mb-6 flex-1">{c.body}</p>
            <div className="flex flex-wrap gap-2.5">
              {c.exploreHref.includes("#")
                ? <a href={c.exploreHref} className="btn-gold !text-[12px] !px-4 !py-2.5 whitespace-nowrap">Explore More</a>
                : <Link to={c.exploreHref} className="btn-gold !text-[12px] !px-4 !py-2.5 whitespace-nowrap">Explore More</Link>}
              <Link to={c.enquireHref} className="btn-outline-dark !text-[12px] !px-4 !py-2.5 whitespace-nowrap">Enquire Now</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Catering Services — card grid ---------- */

function CateringGrid() {
  const officeImg = useSiteImage("home-office-catering-section", officeCateringImgDefault);
  const venueImg = useSiteImage("home-venue-catering-section", venueCateringImgDefault);
  const cards = [
    {
      title: "Office Catering",
      tag: "Premium Indian & Corporate Catering in Sydney CBD",
      img: officeImg,
      alt: "Office catering platters",
      body: "HACCP-certified, Gold Licensed catering for corporate clients — authentic Indian curries, traditional sweets, and customised menus delivered straight to your office.",
      buttons: [
        { label: "Explore More", to: "/office-catering", variant: "gold" as const },
        { label: "Order Platter Box", href: "/office-catering#platters", variant: "outline" as const },
        { label: "Enquire Now", to: "/contact", variant: "outline" as const },
      ],
    },
    {
      title: "Catering at Your Venue",
      tag: "Gourmet Dining, Delivered to Your Celebration",
      img: venueImg,
      alt: "Catering at your venue",
      body: "From weddings to birthdays and baby showers, we bring gourmet dining to your chosen venue — HACCP Certified, Gold Catering Licensed, and delivered with restaurant-quality service.",
      buttons: [
        { label: "Explore More", to: "/venue-catering", variant: "gold" as const },
        { label: "Enquire Now", to: "/contact", variant: "outline" as const },
        { label: "Send Email", href: "mailto:bookings@thegrandpalace.com.au", variant: "outline" as const },
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xl border border-gold/20 bg-white/[0.04] overflow-hidden hover:bg-white/[0.07] hover:border-gold/40 hover:shadow-[0_12px_36px_-12px_rgba(200,134,10,0.3)] transition flex flex-col">
          <div className="img-hover relative aspect-[16/10] overflow-hidden">
            <img src={c.img} alt={c.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h3 className="font-display text-2xl text-gold mb-1">{c.title}</h3>
            <p className="text-gold/70 text-[13px] font-medium tracking-wide mb-3">{c.tag}</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{c.body}</p>
            <div className="flex flex-nowrap gap-1.5">
              {c.buttons.map((b) =>
                "to" in b ? (
                  <Link key={b.label} to={b.to} className={`${b.variant === "gold" ? "btn-gold" : "btn-outline-gold"} flex-1 justify-center !text-[10.5px] !px-2 !py-2.5 whitespace-nowrap`}>{b.label}</Link>
                ) : (
                  <a key={b.label} href={b.href} className="btn-outline-gold flex-1 justify-center !text-[10.5px] !px-2 !py-2.5 whitespace-nowrap">{b.label}</a>
                )
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Local atoms ---------- */

// Long reviews get clamped to 4 lines with a Read More/Less toggle — short
// ones (the common case) render as-is with no extra button clutter.
const REVIEW_CLAMP_THRESHOLD = 180;

function ReviewQuote({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > REVIEW_CLAMP_THRESHOLD;
  return (
    <div className="mb-6 flex-1 relative z-10">
      <p className={`text-palace/75 text-sm leading-relaxed ${!expanded && isLong ? "line-clamp-4" : ""}`}>{text}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-saffron text-xs font-semibold hover:underline"
        >
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </div>
  );
}

function OrnamentDivider({ tone = "saffron", align = "center" }: { tone?: "saffron" | "gold"; align?: "center" | "left" }) {
  const color = tone === "gold" ? "var(--color-gold)" : "var(--color-saffron)";
  return (
    <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : "justify-center md:justify-start"} mt-4`}>
      <span className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <svg width="36" height="16" viewBox="0 0 36 16" fill="none" style={{ color }} className="shrink-0">
        <ellipse cx="6" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
        <circle cx="18" cy="8" r="2.5" fill="currentColor"/>
        <ellipse cx="30" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2"/>
      </svg>
      <span className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

function CarvedBackdrop({ tone }: { tone: "gold" | "dark" }) {
  const opacity = tone === "gold" ? "opacity-[0.12]" : "opacity-[0.16]";
  return (
    <>
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -left-40 -top-32 w-[520px] ${opacity} animate-spin-slow`} />
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -right-40 -bottom-32 w-[520px] ${opacity} animate-spin-slow`} style={{ animationDirection: "reverse" }} />
    </>
  );
}
