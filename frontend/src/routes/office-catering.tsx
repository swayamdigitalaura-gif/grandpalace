import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import { useSiteImage } from "@/lib/useSiteImage";
import mandala from "@/assets/mandala.png";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import {
  Truck, UtensilsCrossed, ShieldCheck, Star, MapPin, Clock,
  Phone, Mail, ArrowRight, ChevronDown, Check, Package,
  Soup, Sandwich, Leaf, IceCreamCone, Minus, Plus, ShoppingBag,
} from "lucide-react";

import heroImgDefault   from "@/assets/hero-office-catering-platter.jpg";
import food1Default     from "@/assets/platterbox-veg-live.jpg";
import food2Default     from "@/assets/platterbox-nonveg-live.jpg";
import food3Default     from "@/assets/office-catering-gallery-1.jpg";
import food4Default     from "@/assets/office-catering-gallery-2.jpg";
import corpImgDefault   from "@/assets/gallery/Corporate_059.jpg";

export const Route = createFileRoute("/office-catering")({
  loader: () => fetchPageContent("/office-catering"),
  head: () => ({
    meta: [
      { title: "Office Catering Sydney CBD — The Grand Palace Indian Restaurant" },
      { name: "description", content: "Premium Indian office catering in Sydney CBD. Full-service catering to your venue, or fresh platter boxes from $75 for pickup/delivery. HACCP certified." },
    ],
  }),
  component: OfficeCateringPage,
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

const menuCategories = [
  { icon: Soup,        title: "Traditional Indian Curries",     desc: "Rich, aromatic, and full of flavour — from mild Butter Chicken to bold Lamb Rogan Josh." },
  { icon: Sandwich,    title: "Entrées & Finger Foods",         desc: "Perfect for meetings, conferences and networking — samosas, tikkas, kebabs and more." },
  { icon: Leaf,        title: "Dietary-Friendly Options",       desc: "Vegetarian, vegan, gluten-friendly and halal options available across the full menu." },
  { icon: IceCreamCone, title: "Desserts & Indian Sweets",       desc: "An indulgent finish to any corporate occasion — Gulab Jamun, Ras Malai, Kulfi and more." },
];

const whyUs = [
  { icon: MapPin,         title: "Sydney CBD Location",         desc: "Basement, 261 George St — 2 min from Wynyard Station. Easy access for CBD delivery and pickup." },
  { icon: ShieldCheck,    title: "HACCP Certified",             desc: "All food prepared in our certified kitchen to the highest food safety and quality standards." },
  { icon: Truck,          title: "We Come to You",              desc: "Our team bring freshly cooked food in hot pots, set them up in your office, and collect the pots later." },
  { icon: UtensilsCrossed,title: "Tailored Menus",              desc: "Fully customisable menus to suit your team size, dietary requirements and event style." },
  { icon: Star,           title: "4.4★ Google Rated",           desc: "Trusted by Sydney's top businesses. 1,000+ Google reviews from happy customers." },
  { icon: Package,        title: "Platter Boxes from $75",      desc: "Order online, pay securely, and collect from our George Street kitchen or arrange CBD delivery." },
];

const faqs = [
  { q: "What is the difference between Full Catering and Platter Boxes?", a: "Full Catering means our team comes to your office — we set up, serve, and clean up. Platter Boxes are freshly prepared boxes you order for pickup or delivery. Two completely different services." },
  { q: "How do I order platter boxes?", a: "Contact us via phone or email with your preferred box type (Veg $75 or Non-Veg $85), pickup date, and time. We confirm your order and have it ready for you." },
  { q: "What are the platter box pickup times?", a: "Order before 5:00 PM → ready next day from 12:00 PM. Order after 5:00 PM → ready next day from 5:30 PM. Weekends → dinner pickup only from 5:30 PM. For early pickups call (02) 8021 7696." },
  { q: "How far in advance should I book full-service catering?", a: "We recommend at least 5–7 days' notice for full-service catering. For large events (100+ guests), please give us 2–3 weeks' notice." },
  { q: "Can you cater for dietary requirements?", a: "Absolutely. Our menus include vegetarian, vegan, gluten-friendly and halal options. Please advise dietary requirements when enquiring and our kitchen will prepare accordingly." },
  { q: "Is CBD delivery available for platter boxes?", a: "Yes — CBD delivery is available for an additional fee. Contact us at (02) 8021 7696 or bookings@thegrandpalace.com.au to arrange." },
];

const PageContentCtx = createContext<(key: string, fallback: string) => string>((_, fallback) => fallback);

function OfficeCateringPage() {
  const content = useLiveContent("/office-catering", Route.useLoaderData());
  const c = makeContent(content);
  return (
    <PageContentCtx.Provider value={c}>
    <PageShell crumbs={[{ label: "Office Catering" }]}>
      <Hero />
      <StatsBar />
      <Services />
      <MenuSection />
      <PlatterBoxes />
      <PlatterOrderWizard />
      <WhyUs />
      <Gallery />
      <FAQ />
      <EnquirySection />
      <BirthdayTeaser />
    </PageShell>
    </PageContentCtx.Provider>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────── */
function Hero() {
  const c = useContext(PageContentCtx);
  const heroImg = useSiteImage("office-catering-hero", heroImgDefault);
  return (
    <section className="relative flex items-start md:items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
      <img src={heroImg} alt="Office catering by The Grand Palace Indian Restaurant" fetchPriority="high" decoding="async"
           className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
      <div className="relative flex flex-col items-center gap-4 px-6 pt-20 pb-10 md:py-10">
        <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          Office Catering · Sydney CBD
        </p>
        <h1 data-tgp-key="hero.title" className="font-display leading-none whitespace-pre-line" style={{ fontSize: "clamp(32px,6vw,64px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {c("hero.title", "Office Catering Sydney CBD")}
        </h1>
        <div className="flex items-center gap-4" style={{ width: "10rem" }}>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
        </div>
        <p data-tgp-key="hero.subtitle" className="text-[13px] md:text-[15px] max-w-xl" style={{ color: "rgba(255,235,190,0.9)" }}>
          {c("hero.subtitle", "Fresh Indian platter boxes from $75 per box. Full Catering Service at your office premise for group sizes of 20 and above")}
        </p>
        <div className="flex flex-nowrap gap-2 sm:gap-3 mt-2">
          <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Get a Quote <ArrowRight className="h-4 w-4" /></a>
          <a href="#platters" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">View Platter Boxes</a>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats Bar ─────────────────────────────────────────────────── */
function StatsBar() {
  return (
    <div className="bg-palace border-t border-gold/10">
      <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {[
          { label: "HACCP Certified & Gold Licensed", icon: ShieldCheck },
          { label: "Basement, 261 George Street, Sydney CBD", icon: MapPin },
          { label: "4.4 Stars · 1,000+ Reviews", icon: Star },
          { label: "Small Teams to 200+ Guests", icon: Truck },
        ].map(({ label, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <Icon className="h-4 w-4 text-saffron" />
            <span className="text-cream/70 text-[11px] leading-snug">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Two services ──────────────────────────────────────────────── */
function Services() {
  const corpImg = useSiteImage("office-catering-corporate", corpImgDefault);
  const food2 = useSiteImage("office-catering-platter-nonveg", food2Default);
  return (
    <section className="relative z-0 section-cream py-12 md:py-20 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Two Ways to Cater</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Choose your <span className="italic text-saffron">service</span></h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Full service */}
          <div className="rounded-2xl border border-saffron/20 bg-white/70 overflow-hidden hover:shadow-[0_12px_36px_-12px_rgba(212,120,0,0.2)] transition flex flex-col">
            <div className="relative h-52 overflow-hidden">
              <img src={corpImg} alt="Full service catering" loading="lazy" decoding="async"
                   className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/80 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="text-[9px] uppercase tracking-widest text-gold/80">Service 01</span>
                <h3 className="font-display text-2xl text-cream">Full-Service Catering</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-palace/65 text-sm leading-relaxed mb-5">
                Our team arrives with freshly cooked food and handles the complete setup. We cook everything fresh in our HACCP-certified kitchen, deliver to your office, set up in your designated space, and collect the pots later — a completely seamless experience from start to finish.
              </p>
              <ul className="space-y-2 mb-6">
                {["Freshly cooked on-site at our kitchen", "Full setup & service at your office", "Tailored menus for any dietary need", "Ideal for small boardrooms to 200+ guests"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-palace/70">
                    <Check className="h-4 w-4 text-saffron shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
              <a href="#enquiry" className="btn-gold w-full justify-center mt-auto">Get a Quote <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Platter boxes */}
          <div className="rounded-2xl border border-saffron/20 bg-white/70 overflow-hidden hover:shadow-[0_12px_36px_-12px_rgba(212,120,0,0.2)] transition flex flex-col">
            <div className="relative h-52 overflow-hidden">
              <img src={food2} alt="Platter boxes" loading="lazy" decoding="async"
                   className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/80 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <span className="text-[9px] uppercase tracking-widest text-gold/80">Service 02 · From $75</span>
                <h3 className="font-display text-2xl text-cream">TGP Platter Boxes</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-palace/65 text-sm leading-relaxed mb-5">
                Order online, pay securely, and collect from our George Street kitchen — or arrange CBD delivery (additional fees apply). Choose your box, choose your pickup time, and we keep it ready for you.
              </p>
              <ul className="space-y-2 mb-6">
                {["Veg Platter Box — $75", "Non-Veg Platter Box — $85", "Pickup or CBD delivery available", "Order by 5pm for next-day lunch pickup"].map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-palace/70">
                    <Check className="h-4 w-4 text-saffron shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
              <a href="#order" className="btn-gold w-full justify-center mt-auto">Order Platter Boxes <ArrowRight className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Menu section ──────────────────────────────────────────────── */
function MenuSection() {
  const c = useContext(PageContentCtx);
  return (
    <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Tailored for Every Occasion</div>
          <h2 data-tgp-key="menusection.heading" className="font-display text-4xl text-palace">{c("menusection.heading", "Our catering menu")}</h2>
          <p data-tgp-key="menusection.subtitle" className="text-palace/55 mt-3 text-sm max-w-xl mx-auto leading-relaxed">
            {c("menusection.subtitle", "Our menu celebrates the rich traditions of Indian cuisine while offering flexibility to customise for diverse corporate needs.")}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuCategories.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 transition">
              <div className="h-11 w-11 rounded-full bg-saffron/15 flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-saffron" />
              </div>
              <h3 data-tgp-key={`menusection.item${i + 1}.title`} className="font-display text-lg text-palace mb-2">{c(`menusection.item${i + 1}.title`, title)}</h3>
              <p data-tgp-key={`menusection.item${i + 1}.desc`} className="text-palace/60 text-sm leading-relaxed">{c(`menusection.item${i + 1}.desc`, desc)}</p>
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

/* ─── Platter Boxes ─────────────────────────────────────────────── */
function PlatterBoxes() {
  const food1 = useSiteImage("office-catering-platter-veg", food1Default);
  return (
    <section id="platters" className="relative z-0 overflow-hidden border-t border-saffron/10 scroll-mt-20">
      <div className="grid lg:grid-cols-2">

        {/* mobile-only title — shown before the image; hidden on desktop where it lives in the text column */}
        <div className="order-1 lg:hidden bg-palace px-6 pt-10 pb-6">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Fresh Indian Platter Boxes</div>
          <h2 className="font-display text-3xl text-cream">TGP Platter Box</h2>
        </div>

        <div className="order-2 lg:order-1 relative min-h-[360px]">
          <img src={food1} alt="TGP Platter Boxes" loading="lazy" decoding="async"
               className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-palace/20" />
        </div>
        <div className="order-3 lg:order-2 relative bg-palace px-8 md:px-12 py-14 overflow-hidden">
          <CarvedBackdrop tone="gold" />
          <div className="relative z-10">
            <div className="hidden lg:block text-xs tracking-[0.4em] uppercase text-saffron mb-3">Fresh Indian Platter Boxes</div>
            <h2 className="hidden lg:block font-display text-3xl md:text-4xl text-cream mb-6">TGP Platter Box</h2>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {/* Veg */}
              <div className="rounded-xl border border-gold/20 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-green-400">Vegetarian</span>
                  <span className="font-display text-2xl text-gold">$75</span>
                </div>
                <h4 className="font-display text-lg text-cream mb-2">Veg Platter Box</h4>
                <p className="text-cream/50 text-[11px] mb-3">5 varieties of veg rolls</p>
                <ul className="space-y-1">
                  {["Paneer Tikka Roll", "Malai Soya Chaap Roll", "Hara Bhara Roll", "Samosa Chaat Roll", "Mirchi Vada Roll"].map(item => (
                    <li key={item} className="text-cream/65 text-[12px] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-saffron flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Non-veg */}
              <div className="rounded-xl border border-gold/20 bg-white/[0.06] p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-widest text-red-400">Non-Vegetarian</span>
                  <span className="font-display text-2xl text-gold">$85</span>
                </div>
                <h4 className="font-display text-lg text-cream mb-2">Non-Veg Platter Box</h4>
                <p className="text-cream/50 text-[11px] mb-3">5 varieties of non-veg rolls</p>
                <ul className="space-y-1">
                  {["Butter Chicken Roll", "Rogan Josh Roll", "Kadhai Chicken Roll", "Chicken 65 Roll", "Seekh Kebab Roll"].map(item => (
                    <li key={item} className="text-cream/65 text-[12px] flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-saffron flex-shrink-0" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-gold/15 bg-white/[0.04] p-4 mb-6">
              <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-2 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Pickup Timing Guide
              </div>
              <ul className="space-y-1 text-[12px] text-cream/60">
                <li>Order before 5:00 PM → next day from 12:00 PM</li>
                <li>Order after 5:00 PM → next day from 5:30 PM</li>
                <li>Weekends → dinner pickup only from 5:30 PM</li>
                <li className="text-cream/40 italic">For early pickup call (02) 8021 7696</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#order" className="btn-gold">
                <ShoppingBag className="h-4 w-4" /> Order Online Now
              </a>
              <a href={`tel:${PHONE_TEL}`} className="btn-outline-gold">
                <Phone className="h-4 w-4" /> Order by Phone
              </a>
            </div>
            <p className="text-cream/35 text-[11px] mt-4">CBD delivery available — contact us to arrange (additional fees apply)</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Platter Box Order Wizard (Order → Review → Confirm & Pay) ─── */
type OrderForm = { name: string; email: string; mobile: string; pickupDate: string; pickupTime: string; delivery: string; message: string };
const EMPTY_ORDER: OrderForm = { name: "", email: "", mobile: "", pickupDate: "", pickupTime: "", delivery: "pickup", message: "" };
const orderInputCls = "w-full rounded-lg border border-saffron/30 bg-white/70 px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition text-sm";
const orderLabelCls = "text-[11px] uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
function isWeekend(iso: string): boolean {
  if (!iso) return false;
  const day = new Date(`${iso}T00:00:00`).getDay();
  return day === 0 || day === 6;
}

function PlatterOrderWizard() {
  const food1 = useSiteImage("office-catering-platter-veg", food1Default);
  const food2 = useSiteImage("office-catering-platter-nonveg", food2Default);
  const [step, setStep] = useState<0 | 1 | 2 | "done" | "cancelled">(0);
  const [form, setForm] = useState<OrderForm>(EMPTY_ORDER);
  const [vegQty, setVegQty] = useState(0);
  const [nonVegQty, setNonVegQty] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [qtyError, setQtyError] = useState("");
  const captcha = useSimpleCaptcha();
  const wizardRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);
  const sessionId = useRef<string | null>(null);

  // Stripe redirects back here with ?payment=success|cancelled after checkout —
  // show the outcome inline instead of leaving the visitor on a bare page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      setStep("done");
      sessionStorage.removeItem("tgp-catering-session");
      window.history.replaceState({}, "", window.location.pathname);
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (payment === "cancelled") {
      setStep("cancelled");
      window.history.replaceState({}, "", window.location.pathname);
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function getSessionId(): string {
    if (sessionId.current) return sessionId.current;
    const existing = sessionStorage.getItem("tgp-catering-session");
    const id = existing || crypto.randomUUID();
    if (!existing) sessionStorage.setItem("tgp-catering-session", id);
    sessionId.current = id;
    return id;
  }
  const STEP_LABEL = ["order", "review", "confirm"] as const;

  useEffect(() => {
    if (typeof step !== "number") return;
    const hasAnything = form.name.trim() || form.email.trim() || form.mobile.trim() || vegQty > 0 || nonVegQty > 0;
    if (!hasAnything) return;
    const t = setTimeout(() => {
      api.post("/api/enquiries/track", {
        sessionId: getSessionId(),
        type: "office-catering",
        name: form.name || null,
        email: form.email || null,
        phone: form.mobile || null,
        subject: "TGP Platter Box Order",
        message: form.message || null,
        step: STEP_LABEL[step],
        status: "in-progress",
        data: { vegQty, nonVegQty, pickupDate: form.pickupDate, pickupTime: form.pickupTime, delivery: form.delivery },
      }).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [form.name, form.email, form.mobile, form.pickupDate, form.pickupTime, form.delivery, form.message, vegQty, nonVegQty, step]);

  function update(k: keyof OrderForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (vegQty + nonVegQty === 0) { setQtyError("Please select at least one platter box with quantity greater than 0"); return; }
    setQtyError("");
    if (!captcha.verify()) return;
    setStep(1);
  }

  async function handleMakePayment(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const { url } = await api.post<{ url: string }>("/api/stripe/create-catering-checkout-session", {
        sessionId: getSessionId(), name: form.name, email: form.email, mobile: form.mobile,
        vegQty, nonVegQty, pickupDate: form.pickupDate, pickupTime: form.pickupTime,
        delivery: form.delivery, message: form.message || null,
      });
      window.location.href = url;
    } catch {
      setStatus("error");
    }
  }

  const total = vegQty * 75 + nonVegQty * 85;
  const timeOptions = isWeekend(form.pickupDate)
    ? ["Dinner Pickup — 5:30pm onwards"]
    : ["Lunch Pickup — 12:00pm onwards", "Dinner Pickup — 5:30pm onwards"];

  const summaryRows = [
    { label: "Full Name", value: form.name || "—" },
    { label: "Email", value: form.email || "—" },
    { label: "Mobile", value: form.mobile || "—" },
    { label: "Pickup Date", value: form.pickupDate || "—" },
    { label: "Pickup Time", value: form.pickupTime || "—" },
    { label: "Fulfilment", value: form.delivery === "delivery" ? "CBD Delivery (fee arranged separately)" : "Pickup — 261 George St" },
  ];

  return (
    <section ref={wizardRef} id="order" className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Order Online</div>
          <h2 className="font-display text-3xl md:text-4xl text-palace mb-3">Order Your Platter Boxes</h2>
          <p className="text-palace/55 text-sm">Choose your boxes, pick a pickup slot, then confirm with secure online payment.</p>
          {typeof step === "number" && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-10 bg-saffron" : i < step ? "w-5 bg-saffron/50" : "w-5 bg-saffron/20"
                }`} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-saffron/20 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-[0_20px_50px_-24px_rgba(70,40,0,0.35)]">
          <div key={step} className="animate-fade-swap">

            {/* Step 0 — Order */}
            {step === 0 && (
              <form onSubmit={handleOrderSubmit} className="space-y-5">
                <div>
                  <label className={orderLabelCls}>Choose Your Platter Box <span className="text-saffron">*</span></label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: "veg" as const, img: food1, name: "Veg Platter Box", price: 75, tag: "Vegetarian", tagColor: "text-green-600", dot: "bg-green-500",
                        desc: "5 varieties of veg rolls for $75",
                        items: ["Paneer Tikka Roll", "Malai Soya Chaap Roll", "Hara Bhara Roll", "Samosa Chaat Roll", "Mirchi Vada Roll"],
                        qty: vegQty, set: setVegQty },
                      { key: "nonVeg" as const, img: food2, name: "Non-Veg Platter Box", price: 85, tag: "Non-Vegetarian", tagColor: "text-red-600", dot: "bg-red-500",
                        desc: "5 varieties of non-veg rolls for $85",
                        items: ["Butter Chicken Roll", "Rogan Josh Roll", "Kadhai Chicken Roll", "Chicken 65 Roll", "Seekh Kebab Roll"],
                        qty: nonVegQty, set: setNonVegQty },
                    ].map(({ key, img, name, price, tag, tagColor, dot, desc, items, qty, set }) => (
                      <div key={key} className={`rounded-2xl border overflow-hidden bg-white transition ${qty > 0 ? "border-saffron ring-2 ring-saffron/30" : "border-saffron/20"}`}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img src={img} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          <span className="absolute top-3 left-3 rounded-md bg-red-600 text-white text-[11px] font-semibold px-2 py-1">${price.toFixed(2)}</span>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-palace text-sm font-semibold">{name}</div>
                              <div className="text-palace/50 text-[11px] mt-0.5">${price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => set(q => Math.max(0, q - 1))}
                                className="h-7 w-7 rounded-full border border-saffron/30 flex items-center justify-center text-saffron hover:bg-saffron/10 transition">
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-5 text-center text-palace font-medium text-sm">{qty}</span>
                              <button type="button" onClick={() => set(q => q + 1)}
                                className="h-7 w-7 rounded-full border border-saffron/30 flex items-center justify-center text-saffron hover:bg-saffron/10 transition">
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-palace/40 text-[11px] mt-2">{desc}</p>
                          <div className={`text-[10px] uppercase tracking-[0.2em] font-medium mt-3 mb-1.5 ${tagColor}`}>{tag} Inclusions</div>
                          <div className="flex flex-wrap gap-x-1 gap-y-1 text-[12px] text-palace/65 leading-relaxed">
                            {items.map((item, i) => (
                              <span key={item} className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${dot} shrink-0`} />
                                {item}{i < items.length - 1 && <span className="text-palace/25 ml-1">|</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {qtyError && <p className="text-red-500 text-[11px] mt-2">{qtyError}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={orderLabelCls}>Full Name <span className="text-saffron">*</span></label>
                    <input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your full name" className={orderInputCls} />
                  </div>
                  <div>
                    <label className={orderLabelCls}>Email <span className="text-saffron">*</span></label>
                    <input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" className={orderInputCls} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={orderLabelCls}>Mobile Number <span className="text-saffron">*</span></label>
                    <input required value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="+61 4xx xxx xxx" className={orderInputCls} />
                  </div>
                  <div>
                    <label className={orderLabelCls}>Fulfilment</label>
                    <select value={form.delivery} onChange={e => update("delivery", e.target.value)} className={orderInputCls}>
                      <option value="pickup">Pickup — 261 George St</option>
                      <option value="delivery">CBD Delivery (fee arranged separately)</option>
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={orderLabelCls}>Pickup Date <span className="text-saffron">*</span></label>
                    <input required type="date" min={tomorrowISO()} value={form.pickupDate}
                      onChange={e => { update("pickupDate", e.target.value); update("pickupTime", ""); }} className={orderInputCls} />
                  </div>
                  <div>
                    <label className={orderLabelCls}>Pickup Time <span className="text-saffron">*</span></label>
                    <select required value={form.pickupTime} onChange={e => update("pickupTime", e.target.value)} className={orderInputCls} disabled={!form.pickupDate}>
                      <option value="">{form.pickupDate ? "Select time" : "Select a date first"}</option>
                      {timeOptions.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="rounded-lg border border-saffron/15 bg-saffron/[0.04] px-4 py-3 text-[11px] text-palace/55 leading-relaxed">
                  Order before 5:00 PM → ready from 12:00 PM next day · Order after 5:00 PM → ready from 5:30 PM next day · Weekends → dinner pickup only from 5:30 PM. For earlier pickup, call {PHONE_DISPLAY}.
                </div>
                <div>
                  <label className={orderLabelCls}>Additional Message</label>
                  <textarea value={form.message} onChange={e => update("message", e.target.value)} rows={3}
                    placeholder="Dietary requirements, delivery address, special requests…"
                    className={`${orderInputCls} resize-none`} />
                </div>
                <SimpleCaptcha captcha={captcha} />
                <button type="submit" className="btn-gold w-full justify-center text-base py-4">
                  Continue to Review <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-palace/40 text-[11px]">Or call us directly on {PHONE_DISPLAY} · We respond within 24 hours</p>
              </form>
            )}

            {/* Step 1 — Review */}
            {step === 1 && (
              <div>
                <h3 className="font-display text-2xl text-palace text-center mb-6">Review Your Order</h3>
                <div className="rounded-xl border border-saffron/20 bg-white overflow-hidden mb-5">
                  {vegQty > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 text-sm bg-saffron/[0.04]">
                      <span className="text-stone-500">Veg Platter Box × {vegQty}</span>
                      <span className="text-stone-800 font-medium">${vegQty * 75}</span>
                    </div>
                  )}
                  {nonVegQty > 0 && (
                    <div className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-stone-500">Non-Veg Platter Box × {nonVegQty}</span>
                      <span className="text-stone-800 font-medium">${nonVegQty * 85}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-5 py-3.5 bg-palace">
                    <span className="text-cream/70 text-sm">Order Total</span>
                    <span className="font-display text-xl text-gold">${total}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-saffron/20 bg-white overflow-hidden mb-5">
                  {summaryRows.map(({ label, value }, i) => (
                    <div key={label} className={`flex items-center justify-between px-5 py-3 text-sm ${i % 2 === 0 ? "bg-saffron/[0.04]" : ""}`}>
                      <span className="text-stone-500">{label}</span>
                      <span className="text-stone-800 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setStep(0)} className="text-sm text-palace/55 hover:text-saffron transition">← Back</button>
                  <button type="button" onClick={() => setStep(2)} className="btn-gold !py-3 !px-6">
                    Continue to Payment <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Confirm & Pay */}
            {step === 2 && (
              <div>
                <h3 className="font-display text-2xl text-palace text-center mb-6">Confirm &amp; Pay</h3>
                <div className="rounded-xl border border-saffron/20 bg-white overflow-hidden mb-5">
                  <div className="flex items-center justify-between px-5 py-3.5 bg-palace">
                    <span className="text-cream/70 text-sm">Total Payable</span>
                    <span className="font-display text-xl text-gold">${total}</span>
                  </div>
                </div>
                <form onSubmit={handleMakePayment}>
                  <button type="submit" disabled={status === "submitting"} className="btn-gold w-full justify-center text-base py-4 disabled:opacity-60">
                    <ShoppingBag className="h-5 w-5" /> {status === "submitting" ? "Redirecting…" : "Make Payment"} <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                {status === "error" && (
                  <p className="text-center text-red-700 bg-red-50 border border-red-200 rounded-lg text-sm mt-4 py-2.5 px-4">
                    Couldn't start checkout — please try again or call us on {PHONE_DISPLAY}.
                  </p>
                )}
                <p className="text-center text-palace/40 text-[11px] mt-3">Your order is confirmed the moment payment is made · Processed securely via Stripe</p>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-palace/55 hover:text-saffron transition mt-5">← Back</button>
              </div>
            )}

            {/* Payment success — Stripe redirected back here */}
            {step === "done" && (
              <div className="text-center py-6">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                  <Check className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-display text-2xl text-palace mb-2">Thank you — your order is confirmed!</h3>
                <p className="text-palace/60 text-sm max-w-sm mx-auto leading-relaxed">
                  Payment received. A confirmation email with your order and pickup details is on its way — our team will be in touch if anything needs confirming.
                </p>
                <p className="text-palace/40 text-[11px] mt-4">Questions? Call us on {PHONE_DISPLAY}</p>
                <button type="button" onClick={() => { setStep(0); setForm(EMPTY_ORDER); setVegQty(0); setNonVegQty(0); }}
                  className="btn-outline-gold mt-6 !py-2.5 !px-6">Place Another Order</button>
              </div>
            )}

            {/* Payment cancelled — Stripe redirected back here */}
            {step === "cancelled" && (
              <div className="text-center py-6">
                <h3 className="font-display text-2xl text-palace mb-2">Payment cancelled</h3>
                <p className="text-palace/60 text-sm max-w-sm mx-auto leading-relaxed">
                  Your order wasn't completed and you haven't been charged. Please re-select your boxes to try again.
                </p>
                <button type="button" onClick={() => setStep(0)} className="btn-gold mt-6 !py-2.5 !px-6">Start a New Order</button>
              </div>
            )}
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
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Trusted by Sydney's Top Businesses</div>
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

        {/* cert badges */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-center">
          {[
            { label: "HACCP Certified", sub: "Highest food safety standards" },
            { label: "Gold Licensed",   sub: "Fully licensed to serve alcohol" },
            { label: "4.4★ Google",    sub: "1,000+ reviews from happy clients" },
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

/* ─── Gallery ───────────────────────────────────────────────────── */
function Gallery() {
  const food1 = useSiteImage("office-catering-platter-veg", food1Default);
  const food2 = useSiteImage("office-catering-platter-nonveg", food2Default);
  const food3 = useSiteImage("office-catering-gallery-1", food3Default);
  const food4 = useSiteImage("office-catering-gallery-2", food4Default);
  return (
    <section className="relative z-0 section-cream py-12 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl text-palace">Freshly made, <span className="italic text-saffron">every time</span></h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[food1, food2, food3, food4].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-square">
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
                <div className="px-5 pb-4 text-sm text-palace/65 leading-relaxed border-t border-saffron/10 pt-3">{faq.a}</div>
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", guests: "", type: "Full-Service Catering", dietary: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const captcha = useSimpleCaptcha();

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

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!captcha.verify()) return;
    setSaving(true);
    try {
      await api.post("/api/enquiries", {
        type: "office-catering",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: `Office Catering Enquiry — ${form.type}`,
        message: form.message || null,
        data: {
          service: form.type,
          date: form.date,
          guests: form.guests,
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
  const label = "text-xs uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

  return (
    <section id="enquiry" className="relative z-0 bg-palace py-20 px-6 overflow-hidden scroll-mt-20">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Get a Quote</div>
          <h2 className="font-display text-4xl text-cream mb-2">Ready to <span className="italic text-gold">book catering?</span></h2>
          <p className="text-cream/50 text-sm">Fill in the form and our team will respond within 24 hours.</p>
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
            <div className="rounded-xl border border-gold/20 bg-white/[0.04] p-4 text-[12px] text-cream/50 leading-relaxed">
              <div className="text-gold font-medium uppercase tracking-wider text-[11px] mb-2">Pickup Address</div>
              Basement, 261 George Street, Sydney CBD<br />
              <span className="text-cream/35 italic">2 min walk from Wynyard Station</span>
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
                <p className="text-palace/60 text-sm">We'll be in touch within 24 hours.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className={label}>Full Name *</label>
                  <input className={fieldCls("name")} value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }} placeholder="Jane Sharma" />
                  {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={label}>Email *</label>
                  <input type="email" className={fieldCls("email")} value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: "" })); }} placeholder="jane@company.com" />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={label}>Phone *</label>
                  <input className={fieldCls("phone")} value={form.phone} onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }} placeholder="04xx xxx xxx" />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className={label}>Service Type</label>
                  <select className={fieldCls("type")} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option>Full-Service Catering</option>
                    <option>Corporate Event</option>
                    <option>Other</option>
                  </select>
                  <p className="text-[11px] text-palace/45 mt-1">Ordering Platter Boxes? <a href="#order" className="underline hover:text-saffron">Order online here</a> instead.</p>
                </div>
                <div>
                  <label className={label}>Preferred Date *</label>
                  <input type="date" className={fieldCls("date")} value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: "" })); }} />
                  {errors.date && <p className="text-red-500 text-[11px] mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className={label}>Number of Guests *</label>
                  <input className={fieldCls("guests")} value={form.guests} onChange={e => { setForm(f => ({ ...f, guests: e.target.value })); setErrors(er => ({ ...er, guests: "" })); }} placeholder="e.g. 25" />
                  {errors.guests && <p className="text-red-500 text-[11px] mt-1">{errors.guests}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Dietary Requirements</label>
                  <input className={fieldCls("dietary")} value={form.dietary} onChange={e => setForm(f => ({ ...f, dietary: e.target.value }))} placeholder="e.g. Halal, vegan, gluten-free…" />
                </div>
                <div className="sm:col-span-2">
                  <label className={label}>Additional Notes</label>
                  <textarea className={`${fieldCls("message")} min-h-[100px] resize-y`} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Delivery address, special requirements, preferred cuisine style…" />
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-4"><SimpleCaptcha captcha={captcha} /></div>
                  <button type="submit" disabled={saving} className="btn-gold w-full justify-center disabled:opacity-60">
                    {saving ? "Sending…" : <>Send Enquiry <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  {errors.submit && <p className="text-red-500 text-[12px] text-center mt-2">{errors.submit}</p>}
                  <p className="text-[11px] text-palace/45 text-center mt-2">We'll respond within 24 hours.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── Birthday Teaser ────────────────────────────────────────────── */
function BirthdayTeaser() {
  return (
    <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Celebrate Birthday</div>
        <h2 className="font-display text-3xl md:text-4xl text-palace mb-4">
          Celebrate Your Birthday with Our <span className="italic text-saffron">Exclusive Packages</span>
        </h2>
        <p className="text-palace/80 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
          Celebrate your birthday with our specially designed celebration packages at The Grand Palace Indian Restaurant. Enjoy authentic Indian cuisine prepared by expert chefs in an elegant and comfortable setting. Our packages are perfect for family gatherings, kids' birthdays, and group celebrations. With personalised service and flexible options, we make your special day stress-free and memorable.
        </p>
        <Link to="/birthday-package" className="btn-gold">Celebrate Birthday <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}
