import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import {
  Briefcase, Heart, PartyPopper, Crown, Users, UtensilsCrossed,
  ShieldCheck, MapPin, CalendarDays, Clock, Phone, Mail, Check, ArrowRight,
  ChevronDown, Sparkles, MonitorPlay,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import mandala from "@/assets/mandala.png";

import heroImgDefault from "@/assets/hero-events-spread.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import corpImg from "@/assets/gallery/Corporate_084.jpeg";
import corp2   from "@/assets/gallery/Hero_007.jpg";
import privateImg from "@/assets/milestone-celebration.jpg";
import private2 from "@/assets/gallery/Interior_071.jpg";
import venueWholeImg from "@/assets/gallery/Interior_067.jpg";
import venueSectionImg from "@/assets/gallery/Interior_055.jpg";
import birthdayDecorImg from "@/assets/gallery/BdayCelebration_020.jpeg";
import bentoAmbience from "@/assets/gallery/Interior_070.jpg";
import bentoFeast from "@/assets/events-bento-feast.jpg";
import bentoJoy from "@/assets/gallery/Diwali_09-scaled.jpg";

export const Route = createFileRoute("/events")({
  loader: () => fetchPageContent("/events"),
  head: () => ({
    meta: [
      { title: "Private Event Venue Sydney CBD — The Grand Palace" },
      { name: "description", content: "Host corporate functions, private celebrations and birthdays at The Grand Palace, Sydney CBD. Book the whole venue or a private section, with fully customisable menus." },
    ],
  }),
  component: EventsPage,
});

const EMAIL = "bookings@thegrandpalace.com.au";
const PHONE_DISPLAY = "(02) 8021 7696";
const PHONE_TEL = "+61280217696";

/* ---------- atoms ---------- */

function OrnamentDivider({ tone = "saffron", align = "center" }: { tone?: "saffron" | "gold"; align?: "center" | "left" }) {
  const color = tone === "gold" ? "var(--color-gold)" : "var(--color-saffron)";
  return (
    <div className={`flex items-center gap-4 ${align === "center" ? "justify-center" : "justify-start"} mt-4`}>
      <span className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <svg width="36" height="16" viewBox="0 0 36 16" fill="none" style={{ color }} className="shrink-0">
        <ellipse cx="6" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
        <circle cx="18" cy="8" r="2.5" fill="currentColor" />
        <ellipse cx="30" cy="8" rx="5" ry="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      </svg>
      <span className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

function CarvedBackdrop({ tone }: { tone: "gold" | "dark" }) {
  const opacity = tone === "gold" ? "opacity-[0.10]" : "opacity-[0.14]";
  return (
    <>
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -left-40 -top-32 w-[520px] ${opacity} animate-spin-slow`} />
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -right-40 -bottom-32 w-[520px] ${opacity} animate-spin-slow`} style={{ animationDirection: "reverse" }} />
    </>
  );
}

/* ---------- data ---------- */

const occasions = [
  {
    no: "01", icon: Briefcase, tag: "For Business", title: "Corporate Functions", img: corpImg,
    body: "Impress clients and reward your team beneath hand-carved arches and warm golden light. From boardroom dinners to end-of-year parties, our bold regional cuisine and majestic ambience turn an ordinary work function into a night people talk about.",
    points: ["Boardroom dinners & client entertaining", "Team celebrations & EOFY parties", "Bold, traditional Indian regional flavours"],
  },
  {
    no: "02", icon: Heart, tag: "For the Milestones", title: "Private Events", img: privateImg,
    body: "Weddings, anniversaries, engagements, farewells — every milestone deserves a setting as memorable as the moment. Our team crafts fully customisable menus to suit your taste, theme and dietary needs, from intimate gatherings to grand celebrations.",
    points: ["Weddings, anniversaries & engagements", "Fully customisable, theme-led menus", "Intimate dinners to large celebrations"],
  },
  {
    no: "03", icon: PartyPopper, tag: "For the Joy", title: "Birthday Celebrations", img: birthdayDecorImg,
    body: "Make your birthday truly special. Our charming venue is the perfect backdrop for grand parties and intimate dinners alike — host a private dining experience or take over the entire restaurant and make the night unmistakably yours.",
    points: ["Private dining or whole-venue takeover", "Kids' parties & family gatherings", "Bespoke birthday packages"],
  },
];

const marqueeWords = ["Weddings", "Corporate Dinners", "Birthdays", "Anniversaries", "Engagements", "Farewells", "Festive Parties", "Milestone Celebrations"];

/* ---------- page ---------- */

const PageContentCtx = createContext<(key: string, fallback: string) => string>((_, fallback) => fallback);

function EventsPage() {
  const content = useLiveContent("/events", Route.useLoaderData());
  const c = makeContent(content);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    let targetId: string | null = null;
    if (hash === "#private-section") { setActive(1); targetId = "private-section"; }
    else if (hash === "#birthday-section") { setActive(2); targetId = "birthday-section"; }
    else if (hash === "#corporate-section") { setActive(0); targetId = "corporate-section"; }
    if (targetId) {
      const id = targetId;
      // wait for the conditionally-rendered section to paint before scrolling to it
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }
  }, []);

  return (
    <PageContentCtx.Provider value={c}>
    <PageShell crumbs={[{ label: "Events" }]}>
      <Hero c={c} content={content} />
      <Marquee />
      <OccasionSwitcher active={active} setActive={setActive} />
      {active === 0 && <CorporateSection />}
      {active === 1 && <PrivateSection />}
      {active === 2 && <BirthdaySection />}
      <Bento />
      <SpaceSplit />
      <EnquiryForm />
    </PageShell>
    </PageContentCtx.Provider>
  );
}

/* ---------- hero ---------- */

function Hero({ c, content }: { c: (key: string, fallback: string) => string; content: Record<string, string> }) {
  const heroImg = useSiteImage("events-hero", content["hero.image"] || heroImgDefault);
  return (
    <section className="relative z-0 flex items-start md:items-center overflow-hidden bg-palace" style={{ minHeight: "46vh" }}>
      <img src={heroImg} alt="" aria-hidden data-tgp-key="hero.image" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-palace via-palace/70 to-palace/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-palace via-transparent to-palace/60" />

      {/* vertical side label */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <span className="block text-[11px] tracking-[0.5em] uppercase text-gold/60 [writing-mode:vertical-rl] rotate-180">
          Est. Sydney CBD · 261 George Street
        </span>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-20 pt-20 pb-12 md:py-12">
        <div className="max-w-3xl animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-palace/40 backdrop-blur px-4 py-1.5 text-[11px] tracking-[0.3em] uppercase text-gold/85 mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Private Event Venue
          </div>
          <h1 data-tgp-key="hero.title" className="font-display text-4xl md:text-6xl leading-[0.98] text-cream whitespace-pre-line">
            {c("hero.title", "Where Sydney\ncomes to celebrate")}
          </h1>
          <OrnamentDivider tone="gold" align="left" />
          <p data-tgp-key="hero.subtitle" className="text-cream/70 mt-5 max-w-xl leading-relaxed">
            {c("hero.subtitle", "Plan your next birthday, anniversary or work dinner at The Grand Palace. Book the whole venue over the weekend for ultimate privacy — or just a section. The choice is yours.")}
          </p>
          <div className="flex flex-nowrap items-center gap-2 sm:gap-4 mt-7">
            <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Make an Enquiry <ArrowRight className="h-4 w-4" /></a>
            <Link to="/book-a-table" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Book a Table</Link>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <a href="#occasions" className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 text-gold/70 animate-float-cue" aria-label="Scroll down">
        <ChevronDown className="h-7 w-7" />
      </a>
    </section>
  );
}

/* ---------- marquee ---------- */

function Marquee() {
  const row = [...marqueeWords, ...marqueeWords];
  return (
    <div className="relative bg-saffron overflow-hidden py-3 border-y border-gold/30">
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center text-cream/95 font-display text-xl md:text-2xl px-6">
            {w} <span className="mx-6 text-cream/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- interactive occasion switcher ---------- */

function OccasionSwitcher({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  const o = occasions[active];
  const Icon = o.icon;

  return (
    <section id="occasions" className="relative z-0 section-cream py-16 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Three Ways to Celebrate</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Choose your <span className="italic text-saffron">occasion</span></h2>
        </div>

        {/* selector — always 3 cols, compact on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-8">
          {occasions.map((oc, i) => {
            const OcIcon = oc.icon;
            const on = i === active;
            return (
              <button
                key={oc.no}
                onClick={() => setActive(i)}
                className={`group relative flex items-center justify-center gap-2 text-center rounded-full border px-3 py-3 sm:px-5 sm:py-4 transition-all duration-300 ${
                  on ? "border-saffron bg-saffron/10 shadow-[0_12px_30px_-12px_rgba(212,120,0,0.45)]"
                     : "border-saffron/20 bg-white/40 hover:border-saffron/50 hover:bg-white/70"
                }`}
              >
                <OcIcon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${on ? "text-saffron" : "text-palace/50 group-hover:text-saffron"}`} />
                <span className={`text-xs sm:text-sm tracking-wide leading-tight ${on ? "text-palace font-semibold" : "text-palace/80 font-medium"}`}>{oc.title}</span>
              </button>
            );
          })}
        </div>

        {/* feature panel (morphs on switch) */}
        <div key={active} className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch animate-fade-swap">

          {/* mobile-only tag+title — shown before the image; hidden on desktop where it lives in the text column */}
          <div className="order-1 lg:hidden">
            <div className="flex items-center gap-3 text-saffron">
              <Icon className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.3em]">{o.tag}</span>
            </div>
            <h3 className="font-display text-3xl text-palace mt-3">{o.title}</h3>
          </div>

          <div className="order-2 lg:order-1 img-hover relative rounded-2xl overflow-hidden min-h-[320px] lg:min-h-[460px] shadow-[0_24px_50px_-22px_rgba(70,40,0,0.45)] ring-1 ring-saffron/15">
            <img src={o.img} alt={o.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-palace/55 via-transparent to-transparent" />
            <span className="absolute top-5 left-6 font-display text-7xl text-cream/95 leading-none drop-shadow-lg">{o.no}</span>
          </div>

          <div className="order-3 lg:order-2 flex flex-col justify-center">
            <div className="hidden lg:flex items-center gap-3 text-saffron">
              <Icon className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.3em]">{o.tag}</span>
            </div>
            <h3 className="hidden lg:block font-display text-3xl md:text-4xl text-palace mt-3">{o.title}</h3>
            <p className="text-palace/80 mt-4 leading-relaxed">{o.body}</p>
            <ul className="mt-6 space-y-2.5">
              {o.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-palace/75 text-sm">
                  <Check className="h-4 w-4 text-saffron mt-0.5 shrink-0" /><span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-nowrap gap-2 sm:gap-3 mt-8">
              <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Make an Enquiry</a>
              <Link to="/book-a-table" className="btn-outline-dark flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Book a Table</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- corporate section ---------- */

const corpPoints = [
  { title: "Boardroom Dinners", desc: "Impress clients with a sophisticated private dining experience — bold regional flavours in an opulent setting that does the talking for you." },
  { title: "EOFY & Team Celebrations", desc: "Reward your team the right way. End-of-year parties, team milestones and staff appreciation nights done with warmth and flair." },
  { title: "Client Entertainment", desc: "Turn a business dinner into a memorable event. Our attentive team and customisable menu make every client feel truly valued." },
  { title: "Business Lunches", desc: "Available Friday to Sunday from 12pm–3pm. Private sections or full venue hire for daytime corporate events in the heart of Sydney CBD." },
  { title: "Product Launches & Networking", desc: "A stunning backdrop for your brand moment. Canapé-style or seated — our events team works around your format and schedule." },
  { title: "Conferences & Seminars", desc: "On-site AV support, fully customisable menus and dedicated coordination — everything you need for a seamless professional event." },
];

function CorporateSection() {
  const c = useContext(PageContentCtx);
  return (
    <section id="corporate-section" className="relative z-0 overflow-hidden border-t border-saffron/10 scroll-mt-20">
      {/* top image band */}
      <div className="relative flex items-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={corpImg} alt="Corporate function at The Grand Palace" loading="lazy" decoding="async"
             className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,4,0,0.35) 0%, rgba(10,4,0,0.82) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[11px] tracking-[0.45em] uppercase text-saffron mb-3">For Business</div>
          <h2 className="font-display text-4xl md:text-6xl text-cream leading-tight mb-3">
            Corporate <span className="italic text-gold">Functions</span>
          </h2>
          <p className="text-cream/65 text-sm max-w-xl leading-relaxed">
            Personalised service and seamless event coordination in an elegant, sophisticated setting — where authentic Indian cuisine meets premier corporate hospitality.
          </p>
        </div>
      </div>

      {/* content */}
      <div className="relative z-0 section-cream py-16 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
            <div>
              <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Sydney CBD · Up to 125 Guests</div>
              <h3 data-tgp-key="corp.heading" className="font-display text-3xl md:text-4xl text-palace mb-5">
                {c("corp.heading", "Where business meets bold flavour")}
              </h3>
              <p data-tgp-key="corp.body1" className="text-palace/80 leading-relaxed mb-4">
                {c("corp.body1", "The Grand Palace offers a sophisticated yet inviting atmosphere for corporate gatherings of all kinds. From intimate boardroom dinners to large EOFY celebrations, our team handles every detail — so you can focus on your guests.")}
              </p>
              <p data-tgp-key="corp.body2" className="text-palace/80 leading-relaxed mb-7">
                {c("corp.body2", "Our chefs craft traditional Indian recipes with bold regional flavours, using the finest ingredients. Menus are fully customisable to suit dietary requirements, themes, and budgets. Halal certified, HACCP approved.")}
              </p>
              <div className="flex flex-nowrap gap-2 sm:gap-3">
                <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Make an Enquiry <ArrowRight className="h-4 w-4" /></a>
                <a href={`tel:${PHONE_TEL}`} className="btn-outline-dark flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">
                  <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
                </a>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_50px_-18px_rgba(0,0,0,0.4)] min-h-[300px]">
              <img src={corp2} alt="Corporate dining" loading="lazy" decoding="async"
                   className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/40 to-transparent" />
            </div>
          </div>

          {/* 6 event type cards */}
          <div className="text-center mb-8">
            <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">What We Host</div>
            <h3 className="font-display text-3xl md:text-4xl text-palace">Every kind of <span className="italic text-saffron">business occasion</span></h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {corpPoints.map(({ title, desc }, i) => (
              <div key={i} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-saffron flex-shrink-0" />
                  <h4 className="font-display text-lg text-palace leading-tight">{title}</h4>
                </div>
                <p className="text-palace/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* info bar */}
          <div className="mt-10 rounded-2xl bg-palace px-6 py-5 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: Users,    label: "Capacity",     value: "Up to 125 guests" },
              { icon: Clock,    label: "Event Hours",  value: "Mon–Sun 5pm · Fri–Sun Lunch 12pm" },
              { icon: Briefcase, label: "Packages",    value: "From $45 per person" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5 text-saffron mb-1" />
                <div className="text-[10px] uppercase tracking-widest text-gold/60">{label}</div>
                <div className="text-cream/80 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- private / milestone section ---------- */

const privatePoints = [
  { title: "Weddings & Ceremonies",     desc: "A breathtaking backdrop for your big day — hand-carved arches, golden light and a team dedicated to making every detail perfect." },
  { title: "Anniversary Celebrations",  desc: "Mark your milestone years in a setting as special as your story. Intimate or grand, our team tailors every element to you." },
  { title: "Engagements",               desc: "Pop the question or celebrate with loved ones. We'll set the stage — décor, menu and ambiance all crafted around your moment." },
  { title: "Baby Showers",              desc: "A warm, elegant setting for welcoming new arrivals. Let us take care of every detail while the mum-to-be simply enjoys." },
  { title: "Farewell Gatherings",       desc: "Send someone off in style. A memorable dinner in a stunning venue — the perfect send-off for a beloved colleague or friend." },
  { title: "Family Reunions",           desc: "Bring everyone together. Our spacious venue accommodates groups of 20 to 125, with customisable menus for every taste." },
];

function PrivateSection() {
  const c = useContext(PageContentCtx);
  return (
    <section id="private-section" className="relative z-0 overflow-hidden border-t border-saffron/10 scroll-mt-20">
      {/* top image band */}
      <div className="relative flex items-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={privateImg} alt="Private milestone celebration at The Grand Palace" loading="lazy" decoding="async"
             className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,4,0,0.3) 0%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[11px] tracking-[0.45em] uppercase text-saffron mb-3">For the Milestones</div>
          <h2 className="font-display text-4xl md:text-6xl text-cream leading-tight mb-3">
            Private <span className="italic text-gold">Celebrations</span>
          </h2>
          <p className="text-cream/65 text-sm max-w-xl leading-relaxed">
            Weddings, anniversaries, engagements, farewells — every milestone deserves a setting as memorable as the moment. Fully customisable menus to suit your taste, theme and dietary needs.
          </p>
        </div>
      </div>

      {/* content */}
      <div className="relative z-0 section-cream py-16 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_50px_-18px_rgba(0,0,0,0.4)] min-h-[300px]">
              <img src={private2} alt="Elegant private dining" loading="lazy" decoding="async"
                   className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/40 to-transparent" />
            </div>
            <div>
              <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Intimate to Grand · Up to 125 Guests</div>
              <h3 data-tgp-key="private.heading" className="font-display text-3xl md:text-4xl text-palace mb-5">
                {c("private.heading", "Your milestone, our grand stage")}
              </h3>
              <p data-tgp-key="private.body1" className="text-palace/80 leading-relaxed mb-4">
                {c("private.body1", "Our experienced team ensures seamless service and a memorable dining experience for every private occasion. Whether you're planning an intimate dinner for 20 or a grand celebration for 125, we handle every detail so you can be present in the moment.")}
              </p>
              <p data-tgp-key="private.body2" className="text-palace/80 leading-relaxed mb-7">
                {c("private.body2", "Fully customisable menus — vegetarian, vegan, gluten-friendly and halal options available. Our chefs craft traditional Indian recipes with bold regional flavours, tailored to your theme, taste and budget.")}
              </p>
              <div className="flex flex-nowrap gap-2 sm:gap-3">
                <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Make an Enquiry <ArrowRight className="h-4 w-4" /></a>
                <Link to="/venue-for-hire" className="btn-outline-dark flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Venue for Hire</Link>
              </div>
            </div>
          </div>

          {/* 6 occasion cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {privatePoints.map(({ title, desc }, i) => (
              <div key={i} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-saffron flex-shrink-0" />
                  <h4 className="font-display text-lg text-palace leading-tight">{title}</h4>
                </div>
                <p className="text-palace/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* info bar */}
          <div className="mt-10 rounded-2xl bg-palace px-6 py-5 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: Users,       label: "Capacity",    value: "20 to 125 guests" },
              { icon: Clock,       label: "Venue Hire",  value: "Sat & Sun lunch 12pm–3pm" },
              { icon: Heart,       label: "Occasions",   value: "Weddings · Anniversaries · More" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5 text-saffron mb-1" />
                <div className="text-[10px] uppercase tracking-widest text-gold/60">{label}</div>
                <div className="text-cream/80 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- birthday section ---------- */

const birthdayPoints = [
  { title: "Intimate Birthday Dinners",    desc: "A beautifully set private table for your closest friends and family — the perfect setting for a meaningful birthday celebration." },
  { title: "Whole-Venue Birthday Parties", desc: "Take over the entire palace for the night. Your guests, your music, your décor — an unforgettable grand party." },
  { title: "Kids' Birthday Parties",       desc: "A fun, welcoming atmosphere with kid-friendly menu options and a dedicated team to keep the little ones happy all night." },
  { title: "Birthday Cake Ceremony",       desc: "We'll coordinate the cake moment — candles, song, and all. Add our TGP Decoration Package from $150 for the full experience." },
  { title: "Custom Birthday Menus",        desc: "Tell us your favourites. Our chefs craft tailored menus — vegetarian, vegan, halal, gluten-friendly — to suit every guest." },
  { title: "Décor & Balloon Setup",        desc: "Our TGP Celebrate Birthday package includes 25 balloons, an 8-inch customised cake, a birthday banner, props and a heartfelt birthday song." },
];

function BirthdaySection() {
  const minChargeActive = useSiteToggle("min-charge-notice");
  const c = useContext(PageContentCtx);
  return (
    <section id="birthday-section" className="relative z-0 overflow-hidden border-t border-saffron/10 scroll-mt-20">
      {/* top image band */}
      <div className="relative flex items-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={bentoAmbience} alt="Birthday celebration at The Grand Palace" loading="lazy" decoding="async"
             className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,4,0,0.3) 0%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="text-[11px] tracking-[0.45em] uppercase text-saffron mb-3">For the Joy</div>
          <h2 className="font-display text-4xl md:text-6xl text-cream leading-tight mb-3">
            Birthday <span className="italic text-gold">Celebrations</span>
          </h2>
          <p className="text-cream/65 text-sm max-w-xl leading-relaxed">
            Make your birthday truly unforgettable at The Grand Palace. From intimate dinners to full venue takeovers, we create the perfect backdrop for your special day.
          </p>
        </div>
      </div>

      {/* content */}
      <div className="relative z-0 section-cream py-16 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
            <div>
              <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Packages from $150 · Up to 125 Guests</div>
              <h3 data-tgp-key="birthday.heading" className="font-display text-3xl md:text-4xl text-palace mb-5">
                {c("birthday.heading", "Your birthday, our grand celebration")}
              </h3>
              <p data-tgp-key="birthday.body1" className="text-palace/80 leading-relaxed mb-4">
                {c("birthday.body1", "Celebrate your birthday in style beneath hand-carved arches and warm golden light. Whether you're planning a quiet dinner for twelve or a grand party for the whole venue, our team makes every detail magical.")}
              </p>
              <p data-tgp-key="birthday.body2" className="text-palace/80 leading-relaxed mb-7">
                {c("birthday.body2", "Our TGP Decoration & Cake Package starts from just $150 — includes an 8-inch customised birthday cake, 25 balloons, a birthday banner, props and a heartfelt birthday song performed by our team.")}
              </p>
              <div className="flex flex-nowrap gap-2 sm:gap-3">
                <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Make an Enquiry <ArrowRight className="h-4 w-4" /></a>
                <a href="/whats-on/birthday-party-packages"
                   className="btn-outline-dark flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Birthday Packages</a>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_50px_-18px_rgba(0,0,0,0.4)] min-h-[300px]">
              <img src={venueWholeImg} alt="Birthday party at The Grand Palace" loading="lazy" decoding="async"
                   className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/40 to-transparent" />
            </div>
          </div>

          {/* 6 birthday feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {birthdayPoints.map(({ title, desc }, i) => (
              <div key={i} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-2 w-2 rounded-full bg-saffron flex-shrink-0" />
                  <h4 className="font-display text-lg text-palace leading-tight">{title}</h4>
                </div>
                <p className="text-palace/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* info bar */}
          <div className="mt-10 rounded-2xl bg-palace px-6 py-5 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { icon: PartyPopper, label: "Package From",  value: "$150 TGP Decoration & Cake" },
              { icon: Users,       label: "Guests",        value: "Kids' parties to 125 guests" },
              { icon: Clock,       label: "Booking",       value: minChargeActive ? "Min charge $35pp · $25 kids 5–10" : "Book 2–4 weeks ahead" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="h-5 w-5 text-saffron mb-1" />
                <div className="text-[10px] uppercase tracking-widest text-gold/60">{label}</div>
                <div className="text-cream/80 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---------- bento inclusions ---------- */

function Bento() {
  return (
    <section className="section-cream relative z-0 py-20 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Why The Grand Palace</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Everything your event <span className="italic text-saffron">deserves</span></h2>
          <OrnamentDivider />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[220px] sm:auto-rows-[170px] gap-4">
          {/* big image tile */}
          <ImgTile img={bentoAmbience} className="col-span-2 row-span-2" eyebrow="The Setting" title="Majestic ambience, no extra decoration needed" />

          <FeatTile icon={Crown} title="Whole-Venue Privacy" text="Book the entire palace for total exclusivity — or just a private section." />
          <FeatTile icon={UtensilsCrossed} title="Customisable Menus" text="Tailored to your taste, theme & dietary needs by our chefs." />

          <FeatTile icon={ShieldCheck} title="HACCP Certified" text="Gold-licensed, uncompromising standards behind every dish." />
          <FeatTile icon={MonitorPlay} title="Projector & AV On-Site" text="Built-in projector screen and AV support — ready for presentations, speeches or slideshows." />

          {/* medium image tile */}
          <ImgTile img={bentoFeast} className="col-span-2" eyebrow="The Feast" title="Banquet spreads & regional flavours" />

          <FeatTile icon={MapPin} title="Heart of the CBD" text="Basement, 261 George Street — central, parking nearby." />
          <FeatTile icon={Heart} title="Made Personal" text="Personalised service that makes your day stress-free." />

          {/* wide joy tile — full width */}
          <ImgTile img={bentoJoy} className="col-span-2 lg:col-span-4" eyebrow="The Joy" title="Festive nights worth remembering" />
        </div>
      </div>
    </section>
  );
}

function FeatTile({ icon: Icon, title, text }: { icon: typeof Crown; title: string; text: string }) {
  return (
    <div className="group rounded-2xl border border-saffron/20 bg-white/70 p-5 flex flex-col justify-between hover:bg-white/90 hover:border-saffron/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-[0_18px_40px_-18px_rgba(212,120,0,0.4)]">
      <div className="h-10 w-10 rounded-full bg-saffron/15 flex items-center justify-center group-hover:bg-saffron/25 transition">
        <Icon className="h-5 w-5 text-saffron" />
      </div>
      <div>
        <h3 className="font-display text-xl text-palace leading-tight">{title}</h3>
        <p className="text-palace/75 text-[13px] mt-1 leading-snug">{text}</p>
      </div>
    </div>
  );
}

function ImgTile({ img, className = "", eyebrow, title }: { img: string; className?: string; eyebrow: string; title: string }) {
  return (
    <div className={`img-hover group relative rounded-2xl overflow-hidden shadow-md min-h-[220px] sm:min-h-[170px] ${className}`}>
      <img src={img} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-palace/85 via-palace/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85 mb-1">{eyebrow}</div>
        <div className="font-display text-xl md:text-2xl text-cream leading-tight max-w-[260px]">{title}</div>
      </div>
    </div>
  );
}

/* ---------- whole venue vs section ---------- */

function SpaceSplit() {
  const cards = [
    { img: venueWholeImg, eyebrow: "Total Exclusivity", title: "The Whole Palace", text: "Take over the entire venue across the weekend — your guests, your music, your night, uninterrupted." },
    { img: venueSectionImg, eyebrow: "Just Your Circle", title: "A Private Section", text: "Prefer something intimate? Reserve a dedicated section and enjoy a private corner of the palace." },
  ];
  return (
    <section className="relative z-0 section-cream py-12 md:py-24 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Your Space, Your Way</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">How much of the palace <span className="italic text-saffron">is yours?</span></h2>
          <OrnamentDivider />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="img-hover group relative rounded-2xl overflow-hidden min-h-[360px] flex items-end shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
              <img src={c.img} alt={c.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace via-palace/40 to-transparent" />
              <div className="relative p-8">
                <div className="text-xs uppercase tracking-[0.3em] text-gold/80 mb-2">{c.eyebrow}</div>
                <h3 className="font-display text-3xl text-cream">{c.title}</h3>
                <p className="text-cream/70 text-sm mt-3 max-w-md leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- enquiry form (overlapping glass) ---------- */

function EnquiryForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", type: "Corporate Function",
    date: "", time: "", guests: "", budget: "", message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const captcha = useSimpleCaptcha();
  const minChargeActive = useSiteToggle("min-charge-notice");

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.date.trim())  e.date  = "Preferred date is required";
    if (!form.guests.trim()) e.guests = "Number of guests is required";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!captcha.verify()) return;
    setSaving(true);
    try {
      await api.post("/api/enquiries", {
        type: "events",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Event Enquiry — ${form.type}`,
        message: form.message || null,
        data: {
          eventType: form.type,
          preferredDate: form.date,
          preferredTime: form.time,
          guests: form.guests,
          budget: form.budget,
        },
      });
      setSent(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again or call us directly." });
    } finally {
      setSaving(false);
    }
  }

  const field = (k: string) =>
    `w-full rounded-lg border px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:ring-2 transition text-sm ${
      errors[k] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200" : "border-saffron/30 bg-white/70 focus:border-saffron focus:ring-saffron/20"
    }`;
  const label = "text-xs uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

  return (
    <section id="enquiry" className="relative z-0 section-cream pt-16 pb-16 md:pt-24 md:pb-28 px-6 overflow-hidden scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Event Enquiry</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Let's plan something <span className="italic text-saffron">unforgettable</span></h2>
        </div>

        <div className="rounded-3xl bg-white/70 backdrop-blur border border-saffron/20 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)] overflow-hidden grid lg:grid-cols-5">
          {/* left rail — shown after the form on mobile */}
          <div className="order-2 lg:order-1 lg:col-span-2 bg-palace text-cream p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <CarvedBackdrop tone="gold" />
            <div className="relative z-10">
              <h3 className="font-display text-2xl text-gold">Get in touch</h3>
              <p className="text-cream/75 mt-3 text-sm leading-relaxed">
                Fill in the form and a member of our team will be in touch within <strong className="text-cream">24 to 48 hours</strong>.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 text-cream/85 hover:text-gold transition"><Phone className="h-4 w-4 text-gold" /> {PHONE_DISPLAY}</a>
                <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-cream/85 hover:text-gold transition"><Mail className="h-4 w-4 text-gold" /> {EMAIL}</a>
                <div className="flex items-start gap-3 text-cream/85"><MapPin className="h-4 w-4 text-gold mt-0.5" /> Basement, 261 George Street, Sydney NSW 2000</div>
              </div>
              <div className="mt-6 rounded-xl border border-gold/25 bg-white/[0.06] p-4 text-[12px] text-cream/70 leading-relaxed">
                <div className="text-gold font-medium mb-1 uppercase tracking-wider text-[11px]">Good to know</div>
                {minChargeActive && "Min charge $35pp ($25 kids 5–10) · "}No BYO · Card surcharge applies · 10% surcharge on public holidays &amp; special events.
              </div>
              <div className="mt-6">
                <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-3">What's included</div>
                <ul className="space-y-2 text-[13px] text-cream/75">
                  {["Dedicated event coordinator","Customisable menu & dietary options","Private dining or full venue hire","Personalised table setup & décor","AV & background music support"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-saffron mt-0.5">✦</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 pt-6 border-t border-gold/20">
                <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-2">Event Hours</div>
                <p className="text-[13px] text-cream/70">Monday – Sunday<br /><span className="text-cream/90">5:00 pm – 11:00 pm</span></p>
                <p className="text-[13px] text-cream/70 mt-1">Lunch events available<br /><span className="text-cream/90">Friday – Sunday, 12:00 pm – 3:00 pm</span></p>
              </div>
            </div>
          </div>

          {/* form — shown first on mobile */}
          {sent ? (
            <div className="order-1 lg:order-2 lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="text-saffron text-5xl mb-4">✦</div>
              <h3 className="font-display text-2xl text-palace mb-2">Enquiry received — thank you!</h3>
              <p className="text-palace/60 text-sm max-w-sm">Our events team will be in touch within 24–48 hours to plan the details. For anything urgent, call us on (02) 8021 7696.</p>
            </div>
          ) : (
          <form onSubmit={submit} noValidate className="order-1 lg:order-2 lg:col-span-3 p-6 sm:p-8 lg:p-10">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={label}>Your Name *</label>
                <input className={field("name")} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Sharma" />
                {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={label}>Email *</label>
                <input type="email" className={field("email")} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@email.com" />
                {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={label}>Phone *</label>
                <input className={field("phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="04xx xxx xxx" />
                {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className={label}>Event Type</label>
                <select className={field("type")} value={form.type} onChange={(e) => update("type", e.target.value)}>
                  <option>Corporate Function</option>
                  <option>Private Event</option>
                  <option>Birthday Celebration</option>
                  <option>Wedding / Anniversary</option>
                  <option>Baby Shower</option>
                  <option>Farewell</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={label}><CalendarDays className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Event Date *</label>
                <input type="date" className={field("date")} value={form.date} onChange={(e) => update("date", e.target.value)} />
                {errors.date && <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>}
              </div>
              <div>
                <label className={label}><Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Event Time</label>
                <input type="time" className={field("time")} value={form.time} onChange={(e) => update("time", e.target.value)} />
              </div>
              <div>
                <label className={label}><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Approximate Guests *</label>
                <input className={field("guests")} value={form.guests} onChange={(e) => update("guests", e.target.value)} placeholder="e.g. 40" />
                {errors.guests && <p className="text-red-500 text-[11px] mt-1">{errors.guests}</p>}
              </div>
              <div>
                <label className={label}>Estimated Budget</label>
                <select className={field("budget")} value={form.budget} onChange={(e) => update("budget", e.target.value)}>
                  <option value="">Select a range</option>
                  <option>Under $1,000</option>
                  <option>$1,000 – $3,000</option>
                  <option>$3,000 – $6,000</option>
                  <option>$6,000 – $10,000</option>
                  <option>$10,000+</option>
                  <option>To be discussed</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={label}>Tell us about your event</label>
                <textarea className={`${field("message")} min-h-[150px] resize-y`} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Theme, dietary requirements, décor preferences, anything special you have in mind…" />
              </div>
            </div>
            <div className="mt-6"><SimpleCaptcha captcha={captcha} /></div>
            <button type="submit" disabled={saving} className="btn-gold w-full justify-center mt-4 disabled:opacity-60">
              {saving ? "Sending…" : <>Send Enquiry <ArrowRight className="h-4 w-4" /></>}
            </button>
            {errors.submit && <p className="text-red-500 text-[12px] text-center mt-3">{errors.submit}</p>}
            <p className="text-[11px] text-palace/45 text-center mt-3">* Required fields. We reply within 24–48 hours.</p>
          </form>
          )}
        </div>
      </div>
    </section>
  );
}

