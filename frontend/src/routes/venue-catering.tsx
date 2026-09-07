import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import mandala from "@/assets/mandala.png";
import { useState, createContext, useContext } from "react";
import { useSiteToggle } from "@/lib/useSiteToggle";
import {
  Truck, UtensilsCrossed, ShieldCheck, Star, MapPin, Clock,
  Phone, Mail, ArrowRight, ChevronDown, Check, Users, Heart,
  Gem, Baby, PartyPopper, HeartHandshake, Sparkles,
} from "lucide-react";

import heroImg  from "@/assets/hero-venue-catering-platter.jpg";
import venueImg from "@/assets/venue-section.png";
import food1    from "@/assets/gallery/SLA09455.jpg";
import food2    from "@/assets/gallery/SLA09464.jpg";
import food3    from "@/assets/platter-box/BoxedCatering_05.jpg";
import food4    from "@/assets/office-catering-gallery-1.jpg";
import int1     from "@/assets/food-real/mains-rara-mutton.jpg";
import int2     from "@/assets/food-real/entree-tandoori-salmon.jpg";

export const Route = createFileRoute("/venue-catering")({
  loader: () => fetchPageContent("/venue-catering"),
  head: () => ({
    meta: [
      { title: "Venue Catering Sydney — The Grand Palace Indian Restaurant" },
      { name: "description", content: "Luxury Indian venue catering across Sydney & NSW. Elegant canapés to multi-course banquets. HACCP certified. Engagements, weddings, birthdays and more." },
    ],
  }),
  component: VenueCateringPage,
});

const PHONE_TEL = "+61280217696";
const PHONE_DISPLAY = "(02) 8021 7696";
const EMAIL = "bookings@thegrandpalace.com.au";

function CarvedBackdrop({ tone }: { tone: "gold" | "dark" }) {
  const op = tone === "gold" ? "opacity-[0.09]" : "opacity-[0.11]";
  return (
    <>
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -left-36 -top-28 w-[460px] ${op} animate-spin-slow`} />
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -right-36 -bottom-28 w-[460px] ${op} animate-spin-slow`} style={{ animationDirection: "reverse" }} />
    </>
  );
}

const occasions = [
  { icon: Gem,             title: "Engagements",         desc: "Make the announcement unforgettable. We craft tailored menus and deliver restaurant-quality service at your chosen venue." },
  { icon: Heart,           title: "Weddings",             desc: "From intimate ceremonies to grand receptions — elegant canapés, grazing tables or multi-course banquets for your special day." },
  { icon: Baby,            title: "Baby Showers",         desc: "A warm, beautifully catered celebration welcoming new arrivals. Customised menus with vegetarian, vegan and halal options." },
  { icon: PartyPopper,     title: "Birthday Celebrations",desc: "Premium Indian catering delivered to your venue. Let us handle the food while you celebrate with the people who matter most." },
  { icon: HeartHandshake,  title: "Anniversaries",        desc: "Mark your milestone years with a feast worthy of the occasion — rich, aromatic Indian cuisine served at your location." },
  { icon: Sparkles,        title: "Any Celebration",      desc: "Farewells, reunions, corporate events, festive gatherings — we cater for any occasion across Sydney and NSW." },
];

const menuFormats = [
  { title: "Canapés & Finger Food",  desc: "Perfect for cocktail parties and networking events — bite-sized Indian delights passed by our professional wait staff." },
  { title: "Grazing Tables",         desc: "Stunning spreads of Indian mezze, chutneys, breads and snacks that create a centrepiece and a conversation starter." },
  { title: "Buffet Banquets",        desc: "Abundant spreads of curries, rice, breads, entrées and desserts — ideal for relaxed celebrations and large groups." },
  { title: "Multi-Course Fine Dining",desc: "A curated, restaurant-quality dining experience delivered to your venue — entrée, mains, staples and dessert, served by our team." },
];

const whyUs = [
  { icon: ShieldCheck,     title: "HACCP Certified",          desc: "All food prepared in our certified kitchen with annual external audits — the highest food safety standards, every time." },
  { icon: UtensilsCrossed, title: "Tailored Menus",           desc: "Our chefs design custom menus for your occasion — from mild and approachable to bold regional flavours." },
  { icon: Truck,           title: "We Come to You",           desc: "Our professional team delivers, sets up and serves at your chosen venue anywhere across Sydney and NSW." },
  { icon: Users,           title: "Any Group Size",           desc: "From intimate gatherings to large events of 200+ guests — we scale to your exact needs." },
  { icon: Heart,           title: "Dietary Inclusive",        desc: "Vegetarian, vegan, gluten-friendly and halal options built into every menu as standard." },
  { icon: Star,            title: "4.4★ Google Rated",        desc: "Trusted by hundreds of Sydney families and businesses. 1,000+ five-star reviews." },
];

const faqs = [
  { q: "What areas do you cater to?", a: "We cater across Sydney CBD and greater Sydney. For events in NSW outside Sydney, please contact us to discuss logistics and any additional fees." },
  { q: "What menu formats do you offer?", a: "We offer canapés and finger food, grazing tables, buffet banquets, and multi-course fine dining — all fully customisable to your event style and budget." },
  { q: "How far in advance should I book?", a: "We recommend at least 2–3 weeks for smaller events and 4–6 weeks for weddings or large celebrations. Popular dates (Saturdays, public holidays) book quickly." },
  { q: "Can you cater for dietary requirements?", a: "Absolutely. Our menus include vegetarian, vegan, gluten-friendly and halal options. Please advise all dietary needs when enquiring so our kitchen can prepare accordingly." },
  { q: "Is your food HACCP certified?", a: "Yes. The Grand Palace is HACCP certified with annual external audits, ensuring the highest standards of food safety and quality for all catering events." },
  { q: "Do you provide staff for the event?", a: "Yes — our professional team delivers, sets up and serves at your venue. Full-service catering includes wait staff for the duration of your event." },
  { q: "What is the minimum spend?", a: "Minimum charge is $35 per person (children aged 5–10: $25). A 10% surcharge applies on public holidays and special events. Card surcharge applies." },
  { q: "How do I get a quote?", a: "Fill in the enquiry form on this page, call us on (02) 8021 7696, or email bookings@thegrandpalace.com.au. We respond within 24 hours with a tailored quote." },
];

const PageContentCtx = createContext<(key: string, fallback: string) => string>((_, fallback) => fallback);

function VenueCateringPage() {
  const content = useLiveContent("/venue-catering", Route.useLoaderData());
  const c = makeContent(content);
  return (
    <PageContentCtx.Provider value={c}>
    <PageShell crumbs={[{ label: "Venue Catering" }]}>
      <Hero />
      <Occasions />
      <MenuFormats />
      <FeatureSplit />
      <WhyUs />
      <FoodGallery />
      <FAQ />
      <EnquirySection />
    </PageShell>
    </PageContentCtx.Provider>
  );
}

/* ─── Hero ──────────────────────────────────────────────────────── */
function Hero() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative flex items-start md:items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
      <img src={heroImg} alt="Venue catering by The Grand Palace" fetchPriority="high" decoding="async"
           className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
      <div className="relative flex flex-col items-center gap-4 px-6 pt-20 pb-10 md:py-10">
        <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          Venue Catering · Sydney & NSW
        </p>
        <h1 data-tgp-key="hero.title" className="font-display leading-none whitespace-pre-line" style={{ fontSize: "clamp(32px,6vw,64px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {c("hero.title", "Luxury Catering at Your Venue")}
        </h1>
        <div className="flex items-center gap-4" style={{ width: "10rem" }}>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
        </div>
        <p data-tgp-key="hero.subtitle" className="text-[13px] md:text-[15px] max-w-xl" style={{ color: "rgba(255,235,190,0.9)" }}>
          {c("hero.subtitle", "HACCP Certified · Engagements · Weddings · Birthdays · Anniversaries")}
        </p>
        <div className="flex flex-nowrap gap-2 sm:gap-3 mt-2">
          <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Get a Quote <ArrowRight className="h-4 w-4" /></a>
          <a href="#menu-formats" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">View Menu Formats</a>
        </div>
      </div>
    </section>
  );
}

/* ─── Occasions ─────────────────────────────────────────────────── */
function Occasions() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative z-0 section-cream py-12 md:py-20 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Every Celebration, Perfectly Catered</div>
          <h2 data-tgp-key="occasions.heading" className="font-display text-4xl md:text-5xl text-palace">{c("occasions.heading", "What are you celebrating?")}</h2>
          <p data-tgp-key="occasions.subtitle" className="text-palace/55 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            {c("occasions.subtitle", "We specialise in luxury event catering across Sydney and NSW for every milestone and occasion.")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {occasions.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
              <div className="h-11 w-11 rounded-full bg-saffron/15 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-saffron" />
              </div>
              <h3 data-tgp-key={`occasions.item${i + 1}.title`} className="font-display text-lg text-palace mb-2">{c(`occasions.item${i + 1}.title`, title)}</h3>
              <p data-tgp-key={`occasions.item${i + 1}.desc`} className="text-palace/60 text-sm leading-relaxed">{c(`occasions.item${i + 1}.desc`, desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Menu Formats ──────────────────────────────────────────────── */
function MenuFormats() {
  const c = useContext(PageContentCtx);
  return (
    <section id="menu-formats" className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-20">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Tailored Menus for Every Occasion</div>
          <h2 data-tgp-key="formats.heading" className="font-display text-4xl text-palace">{c("formats.heading", "Choose your format")}</h2>
          <p data-tgp-key="formats.subtitle" className="text-palace/55 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            {c("formats.subtitle", "Our catering menu celebrates the rich traditions of Indian cuisine with the flexibility to customise for any event style.")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {menuFormats.map(({ title, desc }, i) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/70 p-7 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition flex gap-5">
              <div className="font-display text-4xl text-saffron/20 leading-none flex-shrink-0 mt-1">0{i + 1}</div>
              <div>
                <h3 data-tgp-key={`formats.item${i + 1}.title`} className="font-display text-xl text-palace mb-2">{c(`formats.item${i + 1}.title`, title)}</h3>
                <p data-tgp-key={`formats.item${i + 1}.desc`} className="text-palace/60 text-sm leading-relaxed">{c(`formats.item${i + 1}.desc`, desc)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/menu/a-la-carte" className="btn-outline-gold">View Full Restaurant Menu</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Feature split ─────────────────────────────────────────────── */
function FeatureSplit() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative z-0 overflow-hidden border-t border-saffron/10">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[400px]">
          <img src={venueImg} alt="Catering at your venue" loading="lazy" decoding="async"
               className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-palace/20" />
        </div>
        <div className="relative bg-palace px-8 md:px-12 py-14 overflow-hidden">
          <CarvedBackdrop tone="gold" />
          <div className="relative z-10">
            <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Full-Service Catering</div>
            <h2 data-tgp-key="handle.heading" className="font-display text-3xl md:text-4xl text-cream mb-4">
              {c("handle.heading", "We handle everything")}
            </h2>
            <p data-tgp-key="handle.body" className="text-cream/60 text-sm leading-relaxed mb-7">
              {c("handle.body", "Our team arrives at your venue with freshly prepared food and handles the complete setup, service and pack-down — delivering a seamless, stress-free experience so you can focus entirely on your guests.")}
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Fresh preparation in our HACCP-certified kitchen",
                "Delivery and full setup at your chosen venue",
                "Professional wait staff for the duration of the event",
                "Customised menus — vegetarian, vegan, halal & gluten-friendly",
                "Flexible formats: canapés, grazing, buffet or fine dining",
                "Serving Sydney CBD and greater NSW",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-saffron/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-saffron" />
                  </span>
                  <span className="text-cream/75 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href="#enquiry" className="btn-gold">Get a Quote <ArrowRight className="h-4 w-4" /></a>
              <a href={`tel:${PHONE_TEL}`} className="btn-outline-gold">
                <Phone className="h-4 w-4" /> {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Why Us ────────────────────────────────────────────────────── */
function WhyUs() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative z-0 section-cream py-12 md:py-20 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Certified for Quality & Safety</div>
          <h2 data-tgp-key="whyus.heading" className="font-display text-4xl text-palace">{c("whyus.heading", "Why choose The Grand Palace?")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUs.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/65 p-6 hover:bg-white/85 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
              <span className="h-10 w-10 rounded-full bg-saffron/15 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-saffron" />
              </span>
              <h3 data-tgp-key={`whyus.item${i + 1}.title`} className="font-display text-lg text-palace mb-2">{c(`whyus.item${i + 1}.title`, title)}</h3>
              <p data-tgp-key={`whyus.item${i + 1}.desc`} className="text-palace/65 text-sm leading-relaxed">{c(`whyus.item${i + 1}.desc`, desc)}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          {[
            { label: "HACCP Certified", sub: "Annual external audits" },
            { label: "Gold Licensed",   sub: "Fully licensed bar available" },
            { label: "4.4★ Google",    sub: "1,000+ verified reviews" },
          ].map(({ label, sub }) => (
            <div key={label} className="rounded-xl border border-saffron/20 bg-white/60 p-4">
              <div className="font-display text-base text-palace">{label}</div>
              <div className="text-[11px] text-palace/50 mt-1 leading-snug">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Food Gallery ──────────────────────────────────────────────── */
function FoodGallery() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative z-0 section-cream py-12 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 data-tgp-key="gallery.heading" className="font-display text-3xl text-palace">{c("gallery.heading", "Restaurant quality, at your venue")}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[food1, food2, int1, food3, food4, int2].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-[4/3]">
              <img src={src} alt="" loading="lazy" decoding="async"
                   className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ───────────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const minChargeActive = useSiteToggle("min-charge-notice");
  return (
    <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-2">Everything You Need to Know</div>
          <h2 className="font-display text-3xl text-palace">Frequently asked <span className="italic text-saffron">questions</span></h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-saffron/20 bg-white/60 overflow-hidden">
              <button className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-medium text-palace text-sm">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-saffron shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-palace/65 leading-relaxed border-t border-saffron/10 pt-3">
                  {faq.q === "What is the minimum spend?" && !minChargeActive
                    ? "A 10% surcharge applies on public holidays and special events. Card surcharge applies."
                    : faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Enquiry form ──────────────────────────────────────────────── */
function EnquirySection() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", occasion: "Wedding", date: "", guests: "", location: "", dietary: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const captcha = useSimpleCaptcha();
  const minChargeActive = useSiteToggle("min-charge-notice");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())     e.name     = "Name is required";
    if (!form.email.trim())    e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone.trim())    e.phone    = "Phone number is required";
    else if (!/^[\d\s\+\-\(\)]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.date.trim())     e.date     = "Event date is required";
    if (!form.guests.trim())   e.guests   = "Number of guests is required";
    if (!form.location.trim()) e.location = "Venue location is required";
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!captcha.verify()) return;
    setSaving(true);
    try {
      await api.post("/api/enquiries", {
        type: "venue-catering",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Venue Catering Enquiry — ${form.occasion}`,
        message: form.message || null,
        data: {
          occasion: form.occasion,
          date: form.date,
          guests: form.guests,
          location: form.location,
          dietary: form.dietary || null,
        },
      });
      setSubmitted(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again or call us directly." });
    } finally {
      setSaving(false);
    }
  }

  const fieldCls = (k: string) =>
    `w-full rounded-lg border px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:ring-2 transition text-sm ${
      errors[k] ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200" : "border-saffron/30 bg-white/70 focus:border-saffron focus:ring-saffron/20"
    }`;
  const lbl = "text-xs uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

  return (
    <section id="enquiry" className="relative z-0 bg-palace py-20 px-6 overflow-hidden scroll-mt-20">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Get a Quote</div>
          <h2 className="font-display text-4xl text-cream mb-2">Ready to <span className="italic text-gold">book catering?</span></h2>
          <p className="text-cream/50 text-sm">Fill in the form and we'll respond with a tailored quote within 24 hours.</p>
        </div>

        <div className="rounded-3xl bg-white/[0.06] border border-gold/15 overflow-hidden grid lg:grid-cols-5">
          {/* left rail */}
          <div className="lg:col-span-2 bg-white/[0.04] p-8 border-b lg:border-b-0 lg:border-r border-gold/10">
            <h3 className="font-display text-xl text-gold mb-4">Contact Us</h3>
            <div className="space-y-4 text-sm mb-8">
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 text-cream/70 hover:text-gold transition">
                <Phone className="h-4 w-4 text-saffron shrink-0" />{PHONE_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-cream/70 hover:text-gold transition">
                <Mail className="h-4 w-4 text-saffron shrink-0" />{EMAIL}
              </a>
              <div className="flex items-start gap-3 text-cream/70">
                <MapPin className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                Basement, 261 George Street,<br />Sydney NSW 2000
              </div>
            </div>
            <div className="rounded-xl border border-gold/20 bg-white/[0.04] p-4 text-[12px] text-cream/50 leading-relaxed mb-4">
              <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-2">Good to Know</div>
              {minChargeActive && "Min $35pp · Children 5–10: $25 · "}No BYO · Card surcharge applies · 10% surcharge on public holidays
            </div>
            <div className="rounded-xl border border-gold/20 bg-white/[0.04] p-4 text-[12px] text-cream/50 leading-relaxed">
              <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Hours
              </div>
              Lunch: Mon–Sun 12pm–3pm<br />
              Dinner: Sun–Thu 5pm–10pm<br />
              Fri–Sat 5pm–10:30pm
            </div>
          </div>

          {/* form */}
          <form onSubmit={submit} noValidate className="lg:col-span-3 p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                <div className="h-14 w-14 rounded-full bg-saffron/20 flex items-center justify-center">
                  <Check className="h-7 w-7 text-saffron" />
                </div>
                <h3 className="font-display text-2xl text-palace">Enquiry sent!</h3>
                <p className="text-palace/60 text-sm">We'll get back to you within 24 hours with a tailored quote.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={lbl}>Full Name *</label>
                  <input className={fieldCls("name")} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} placeholder="Jane Sharma" />
                  {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={lbl}>Email *</label>
                  <input type="email" className={fieldCls("email")} value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: "" })); }} placeholder="jane@email.com" />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={lbl}>Phone *</label>
                  <input className={fieldCls("phone")} value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }} placeholder="04xx xxx xxx" />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className={lbl}>Occasion</label>
                  <select className={fieldCls("occasion")} value={form.occasion} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))}>
                    <option>Wedding</option>
                    <option>Engagement</option>
                    <option>Anniversary</option>
                    <option>Baby Shower</option>
                    <option>Birthday</option>
                    <option>Corporate Event</option>
                    <option>Farewell</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Event Date *</label>
                  <input type="date" className={fieldCls("date")} value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: "" })); }} />
                  {errors.date && <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className={lbl}>Number of Guests *</label>
                  <input className={fieldCls("guests")} value={form.guests} onChange={e => { setForm(f => ({ ...f, guests: e.target.value })); setErrors(er => ({ ...er, guests: "" })); }} placeholder="e.g. 80" />
                  {errors.guests && <p className="text-red-500 text-[11px] mt-1">{errors.guests}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Venue / Event Location *</label>
                  <input className={fieldCls("location")} value={form.location} onChange={e => { setForm(f => ({ ...f, location: e.target.value })); setErrors(er => ({ ...er, location: "" })); }} placeholder="e.g. Darling Harbour, Sydney" />
                  {errors.location && <p className="text-red-500 text-[11px] mt-1">{errors.location}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Dietary Requirements</label>
                  <input className={fieldCls("dietary")} value={form.dietary} onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))} placeholder="e.g. Halal, vegan, gluten-free, nut allergy…" />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Additional Notes</label>
                  <textarea className={`${fieldCls("message")} min-h-[100px] resize-y`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Menu preferences, service style, special requirements…" />
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-4"><SimpleCaptcha captcha={captcha} /></div>
                  <button type="submit" disabled={saving} className="btn-gold w-full justify-center disabled:opacity-60">
                    {saving ? "Sending…" : <>Send Enquiry <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  {errors.submit && <p className="text-red-500 text-[12px] text-center mt-2">{errors.submit}</p>}
                  <p className="text-[11px] text-palace/45 text-center mt-2">* Required fields. We'll respond within 24 hours.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
