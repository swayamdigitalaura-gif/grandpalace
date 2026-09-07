import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import mandala from "@/assets/mandala.png";
import {
  Cake, Sparkles, Users, Phone, Mail, MapPin,
  ArrowRight, Check, PartyPopper, Gift, Star, ChevronDown,
  Music, Banknote, Clock, Shield,
} from "lucide-react";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

import heroImgDefault from "@/assets/birthday.jpg";
import cakeFerraro   from "@/assets/cake-ferrero-rocher.jpeg";
import cakeVanilla   from "@/assets/cake-vanilla-raspberry.jpeg";
import bday1   from "@/assets/gallery/BdayCelebration_001-scaled.jpg";
import bday2   from "@/assets/gallery/BdayCelebration_009.jpg";
import bday3   from "@/assets/gallery/BdayCelebration_012.JPG";
import bday4   from "@/assets/gallery/BdayCelebration_014.JPG";
import bday5   from "@/assets/gallery/BdayCelebration_015.JPG";
import bday6   from "@/assets/gallery/BdayCelebration_016.jpeg";
import bpReel       from "@/assets/video/bp-reel.mp4";
import bpReelPoster from "@/assets/video/bp-reel-poster.jpg";

export const Route = createFileRoute("/birthday-package")({
  loader: () => fetchPageContent("/birthday-package"),
  head: () => ({
    meta: [
      { title: "Celebrate Birthday in Sydney | The Grand Palace Indian Restaurant" },
      { name: "description", content: "Celebrate your birthday at The Grand Palace Indian Restaurant Sydney. $150 package includes cake, décor & songs. Set menus from $40pp. Groups up to 125 guests." },
    ],
  }),
  component: BirthdayPackagePage,
});

const PHONE_TEL = "+61280217696";
const PHONE_DISPLAY = "(02) 8021 7696";
const EMAIL = "bookings@thegrandpalace.com.au";

const whyUs = [
  { icon: Cake,     title: "We Bring the Cake", body: "We provide a freshly baked birthday cake — choose from Ferrero Rocher or Vanilla Raspberry — included in the package." },
  { icon: Sparkles, title: "Full Decoration Setup", body: "We set up 25 balloons, a birthday banner with curtains, and table props, so you walk into a beautifully decorated setup — zero effort required." },
  { icon: Shield,   title: "Cuisine for Every Guest", body: "Our birthday set menu offers non-veg, veg, vegan, and gluten-free options for every guest." },
  { icon: MapPin,   title: "Heart of Sydney CBD", body: "Located at 261 George Street, Basement, opposite Bridge Street Light Rail Station. Just a 10-minute walk to Circular Quay and the Opera House, with nearby parking at Wilson Parking and Secure MetCentre." },
  { icon: Users,    title: "Groups Size Up to 125", body: "Whether it's a small gathering or a large party, we offer both lunch and dinner for groups of up to 125 guests." },
  { icon: Banknote, title: "Value for Money", body: "At $150 for the complete package (cake, balloons, banner, decorations, birthday song) plus set menus from $40/person, you get a premium experience at an honest price. No hidden costs." },
];

const vegEntrees   = ["Paneer Schnitzel", "Hariyali Kebab", "Samosa", "Onion Bhaji"];
const nonVegEntrees= ["Murgh Afghani Tikka", "Saffron Chicken Tikka", "Kakori Kebab", "Semolina Crusted Prawns"];
const vegCurries   = ["Navratan Korma", "Shahi Paneer", "Aloo Gobhi", "Bhindi Do Pyaza"];
const nonVegCurries= ["Butter Chicken", "Chicken Tikka Masala", "Chicken Saag Wala", "Kashmiri Rogan Josh", "Masala Fish Curry"];

const milestones = [
  { age: "18th", title: "18th Birthday Dinner", body: "Step into adulthood in style. Vibrant atmosphere, great Indian food, and the full birthday experience for groups of 10–30." },
  { age: "21st", title: "21st Birthday Restaurant Sydney", body: "Celebrate the big 21 in Sydney CBD. Semi-private sections available. All-inclusive package means zero planning stress." },
  { age: "30th", title: "30th Birthday Dinner Sydney", body: "A milestone worth celebrating properly. Birthday Shine ($55pp) is the popular choice — premium dishes, elegant atmosphere." },
  { age: "40th", title: "40th Birthday Party Sydney", body: "Table decorated, cake ready, menu set — all before you arrive. Just show up and enjoy every moment with your guests." },
  { age: "50th", title: "50th Birthday Venue Sydney", body: "Large milestone? We accommodate up to 125 guests. Easy access from Wynyard station — perfect for family and friends across Sydney." },
];

const reviews = [
  { name: "Riya Sharma",   text: "Everything was perfect. Celebrating my birthday here made it so easy with cake, décor, and banner included." },
  { name: "Aman Verma",    text: "Had an amazing time. Great decorations, delicious Indian food, and very smooth service." },
  { name: "Neha Patel",    text: "The setup, cake, and ambiance were exactly what we wanted. Highly recommended for birthday parties in Sydney." },
  { name: "Rajesh Mehta",  text: "The Celebrate Birthday package covered everything, and the team managed it beautifully." },
  { name: "Emily Johnson",  text: "It was a fantastic experience. Celebrating my birthday here made everything simple with cake and décor included." },
  { name: "Michael Brown",  text: "Great food, beautiful setup, and very friendly staff. Highly recommend for birthday celebrations in Sydney!" },
];

const faqs = [
  { q: "What is included in the birthday package?", a: "Our TGP Celebrate Birthday package ($150) includes an 8-inch birthday cake with candles, 25 balloons, a birthday banner with curtains, birthday table props, birthday song, and a specially priced set menu." },
  { q: "How much does a birthday package cost?", a: "Our Birthday Sparkle set menu is $40 per person, Birthday Shine is $55 per person. The all-inclusive TGP Celebrate Birthday package (adds cake, decorations and balloons) is $150 in addition to your chosen set menu." },
  { q: "Can I bring my own birthday cake?", a: "There's no need to bring your own cake! Our birthday package includes a freshly baked 8-inch birthday cake — available as Ferrero Rocher or Vanilla Raspberry. Both are 1.4kg and serve up to 14 guests." },
  { q: "How far in advance should I book my birthday?", a: "We recommend booking at least 2–4 weeks in advance. Friday and Saturday evenings are especially popular and typically book 4–6 weeks ahead. For groups over 30 guests, please give us as much notice as possible." },
  { q: "Can you cater for dietary requirements?", a: "Absolutely. Our set menus include a wide range of vegetarian and non-vegetarian options. We can also accommodate vegan, gluten-friendly, and halal dietary requirements." },
  { q: "Is TGP suitable for 18th and 21st birthday parties?", a: "Yes! We regularly host 18th, 21st, 30th and 50th birthday celebrations. Our vibrant atmosphere, delicious Indian cuisine, and all-inclusive packages make us a favourite birthday dinner venue in Sydney CBD. We serve alcohol (no BYO) and can accommodate mixed-age groups." },
  { q: "Where are you located and is parking available?", a: "We are located at Basement, 261 George Street, Sydney NSW 2000 — right in Sydney CBD. We are a 3-minute walk from Wynyard Station (trains and buses) and close to Circular Quay. For parking, Wilson Parking on Clarence Street and Secure Parking on Erskine Street are nearby." },
  { q: "How do I book a birthday package?", a: "Simply fill in the Birthday Enquiry Form above, call us on (02) 8021 7696, or send us a WhatsApp message. Our team will respond within 24 hours to confirm availability and answer any questions you have." },
];

function CarvedBackdrop({ tone }: { tone: "gold" | "dark" }) {
  const op = tone === "gold" ? "opacity-[0.09]" : "opacity-[0.11]";
  return (
    <>
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -left-36 -top-28 w-[460px] ${op} animate-spin-slow`} />
      <img src={mandala} alt="" aria-hidden className={`pointer-events-none absolute -right-36 -bottom-28 w-[460px] ${op} animate-spin-slow`} style={{ animationDirection: "reverse" }} />
    </>
  );
}

type FormState = { name: string; email: string; mobile: string; guests: string; date: string; time: string; message: string };
const EMPTY_FORM: FormState = { name: "", email: "", mobile: "", guests: "", date: "", time: "", message: "" };

const PageContentCtx = createContext<(key: string, fallback: string) => string>((_, fallback) => fallback);

function BirthdayPackagePage() {
  const content = useLiveContent("/birthday-package", Route.useLoaderData());
  const c = makeContent(content);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [cake, setCake] = useState("");

  return (
    <PageContentCtx.Provider value={c}>
    <PageShell crumbs={[{ label: "Celebrate Birthday" }]}>
      <Hero />
      <BookingWizard form={form} setForm={setForm} cake={cake} setCake={setCake} />
      <SetMenus />
      <MenuItemsList />
      <MomentsStrip />
      <Milestones />
      <Reviews />
      <WhyChooseUs />
      <FAQ />
      <BookingCTA />
    </PageShell>
    </PageContentCtx.Provider>
  );
}

/* ─── Hero ───────────────────────────────────────────────── */
const PACKAGE_ITEMS = [
  { icon: Cake,     title: "Birthday Cake", body: "8-inch cake — Ferrero Rocher or Vanilla Raspberry, serves up to 14" },
  { icon: Sparkles, title: "Balloon Setup",  body: "25 balloons fully arranged at your table before you arrive" },
  { icon: Gift,     title: "Birthday Banner", body: "Banner with curtains & festive table props — all set up on arrival" },
  { icon: Music,    title: "Birthday Song",  body: "Birthday song played by our team" },
  { icon: Users,    title: "Dedicated Team", body: "Our event team handles every detail of your celebration" },
  { icon: Star,     title: "Special Set Menu", body: "Access to Birthday Sparkle ($40pp) or Shine ($55pp)" },
];

function Hero() {
  const c = useContext(PageContentCtx);
  const heroImg = c("hero.image", "") || heroImgDefault;
  return (
    <section className="relative z-0 overflow-hidden">
      <img src={heroImg} alt="Birthday at The Grand Palace" data-tgp-key="hero.image" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-palace/95 via-palace/85 to-palace/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-palace/70 via-transparent to-transparent" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 w-full py-16 md:py-20">
        <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/10 px-4 py-1.5 text-[11px] tracking-[0.3em] uppercase text-saffron mb-5">
              <PartyPopper className="h-3.5 w-3.5" /> Since 2021 · 500+ Birthdays Hosted
            </div>
            <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-cream leading-tight mb-4 whitespace-pre-line">
              {c("hero.title", "Celebrate Birthday in Sydney at\nThe Grand Palace Indian Restaurant")}
            </h1>
            <p data-tgp-key="hero.subtitle" className="text-cream/65 text-base leading-relaxed mb-3 max-w-md">
              {c("hero.subtitle", "Cake, Decorations, and Songs are on us — celebrations and everlasting moments are on you.")}
            </p>
            <p className="text-cream/50 text-sm mb-8">All-inclusive from $150 · Groups up to 125 guests · Book in 2 minutes.</p>
            <div className="flex flex-nowrap gap-2 sm:gap-3 mb-6">
              <a href="#enquiry" className="btn-gold flex-[2] sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Book Your Birthday <ArrowRight className="h-4 w-4" /></a>
              <a href="#package" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">View Package</a>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-cream/45">
              {[
                { label: "Package", href: "#package" },
                { label: "Menu", href: "#menu" },
                { label: "Reviews", href: "#reviews" },
                { label: "FAQ", href: "#faq" },
              ].map(({ label, href }) => (
                <a key={label} href={href} className="hover:text-gold transition underline underline-offset-4 decoration-cream/20">{label}</a>
              ))}
            </div>
          </div>

          {/* Package card — beside the hero text, no scrolling needed to see it */}
          <div id="package" className="rounded-2xl border border-gold/25 bg-black/45 backdrop-blur-sm p-6 scroll-mt-24">
            <span className="text-[10px] uppercase tracking-widest border border-saffron/40 bg-saffron/10 text-saffron rounded-full px-3 py-1">Most Popular · Signature Package</span>
            <div className="flex items-end gap-2 mt-3 mb-5">
              <span className="font-display text-5xl text-gold">$150</span>
              <span className="text-cream/45 text-xs mb-1.5">per booking · everything included</span>
            </div>
            <div className="space-y-3.5">
              {PACKAGE_ITEMS.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex items-start gap-3">
                  <span className="h-7 w-7 rounded-full bg-saffron/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-saffron" />
                  </span>
                  <div>
                    <div className="text-cream/90 text-[13px] font-medium">{title}</div>
                    <div className="text-cream/55 text-[12px] leading-snug mt-0.5">{body}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-cream/55 text-[11px] mt-5 pt-4 border-t border-gold/10 leading-relaxed">
              Non-refundable · Billed separately from dine-in bill · Date changes at restaurant's discretion
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Why Choose Us ──────────────────────────────────────── */
function WhyChooseUs() {
  return (
    <section className="relative z-0 section-cream py-14 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Since 2021 · 500+ Birthdays Hosted</div>
          <h2 className="font-display text-3xl md:text-4xl text-palace">Why Choose Us — Why Celebrate Your Birthday at <span className="italic text-saffron">The Grand Palace Indian Restaurant?</span></h2>
          <p className="text-palace/55 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
            Operating since 2021 and having hosted over 500 birthday celebrations, we accommodate groups from intimate settings to 125 guests. Our expert team handles every celebration detail so you can enjoy the moment.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUs.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/65 p-6 hover:bg-white/85 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.18)] transition">
              <span className="h-10 w-10 rounded-full bg-saffron/15 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-saffron" />
              </span>
              <h3 className="font-display text-lg text-palace mb-2">{title}</h3>
              <p className="text-palace/65 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Cakes data ──────────────────────────────────────────── */
const CAKES = [
  { img: cakeFerraro, name: "Ferraro Rocher Cake",   detail: "8 inches, 1.4 kg, up to 14 servings" },
  { img: cakeVanilla, name: "Vanilla Raspberry Cake", detail: "8 inches, 1.4 kg, up to 14 servings" },
];

/* ─── Menu Items List ────────────────────────────────────── */
function MenuItemsList() {
  return (
    <section className="relative z-0 section-cream py-14 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-2">What's on the Menu</div>
          <h2 className="font-display text-3xl text-palace">List of Dishes <span className="italic text-saffron">— Same for Both Packages</span></h2>
        </div>

        <div className="rounded-2xl border border-saffron/20 bg-white/80 overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-200">

            {/* Left — Entrees */}
            <div className="p-7">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-3 mb-5">Entrees</h3>

              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">Vegetarian</p>
              <ul className="space-y-2 mb-6">
                {["Paneer Schnitzel", "Hariyali Kebab", "Samosa", "Onion Bhaji"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                    <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">Non-Vegetarian</p>
              <ul className="space-y-2">
                {["Murgh Afghani Tikka", "Saffron Chicken Tikka", "Kakori Kebab", "Semolina Crusted Prawns"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                    <span className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Curries */}
            <div className="p-7">
              <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase text-stone-500 border-b border-stone-200 pb-3 mb-5">Curries</h3>

              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">Vegetarian</p>
              <ul className="space-y-2 mb-6">
                {["Navratan Korma", "Shahi Paneer", "Aloo Gobhi", "Bhindi Do Pyaza"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                    <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">Non-Vegetarian</p>
              <ul className="space-y-2">
                {["Butter Chicken", "Chicken Tikka Masala", "Chicken Saag Wala", "Kashmiri Rogan Josh", "Masala Fish Curry"].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-stone-700">
                    <span className="h-3 w-3 rounded-full bg-red-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Also includes */}
          <div className="bg-stone-50 border-t border-stone-200 px-7 py-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-2">Also includes with every package</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {["Dal (Lasooni Tadka or Dal Makhani)", "Basmati Rice", "Assorted Breads", "Garden Salad", "Papadum & Chutney", "Dessert"].map(item => (
                <span key={item} className="flex items-center gap-1.5 text-[12px] text-stone-600">
                  <Check className="h-3 w-3 text-green-500 shrink-0" />{item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Booking Wizard (Reserve → Cake → Confirm & Pay) ────── */
const NOWBOOKIT_URL = "https://nowbookit.com/reservations/reservation-widget/index.html?accountId=e78f7994-d03f-4898-8c34-e57c7e5e49aa&venueId=6791";
const inputCls = "w-full rounded-lg border border-saffron/30 bg-white/70 px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 transition text-sm";
const labelCls = "text-[11px] uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

function BookingWizard({
  form, setForm, cake, setCake,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  cake: string;
  setCake: (v: string) => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const captcha = useSimpleCaptcha();
  const wizardRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  // Scroll the wizard card back into view on every step change — on mobile the
  // long Reserve form pushes the Continue button well below the fold, so
  // without this the next step renders off-screen and looks broken/frozen.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // ── Lead capture: record the lead the moment the customer types anything,
  // then keep updating it as they progress — so an abandoned form (e.g. left
  // at cake selection) still shows up as a lead in the admin panel, with
  // exactly how far they got. sessionId persists across a page reload so a
  // refresh mid-form updates the same lead instead of creating a duplicate.
  // Lazily created on first use in the browser only — sessionStorage/crypto
  // don't exist during server-side rendering, so touching them at render
  // time (even in a lazy useRef initializer) crashes the SSR pass and forces
  // the whole page into a client-only render.
  const sessionId = useRef<string | null>(null);
  function getSessionId(): string {
    if (sessionId.current) return sessionId.current;
    const existing = sessionStorage.getItem("tgp-birthday-session");
    const id = existing || crypto.randomUUID();
    if (!existing) sessionStorage.setItem("tgp-birthday-session", id);
    sessionId.current = id;
    return id;
  }
  const STEP_LABEL = ["reserve", "cake", "confirm"] as const;

  useEffect(() => {
    const hasAnything = form.name.trim() || form.email.trim() || form.mobile.trim() || cake || form.message.trim();
    if (!hasAnything) return;
    const t = setTimeout(() => {
      api.post("/api/enquiries/track", {
        sessionId: getSessionId(),
        type: "birthday",
        name: form.name || null,
        email: form.email || null,
        phone: form.mobile || null,
        subject: "Celebrate Birthday Package Enquiry",
        message: form.message || null,
        step: STEP_LABEL[step],
        status: status === "success" ? "completed" : "in-progress",
        data: { guests: form.guests, date: form.date, time: form.time, cake: cake || null },
      }).catch(() => {});
    }, 700);
    return () => clearTimeout(t);
  }, [form.name, form.email, form.mobile, form.guests, form.date, form.time, form.message, cake, step, status]);

  function update(k: keyof FormState, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleReserveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha.verify()) return;
    setStep(1);
  }

  async function handleMakePayment(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    window.open(NOWBOOKIT_URL, "_blank", "noopener,noreferrer");
    try {
      await api.post("/api/birthday-enquiries", {
        name: form.name, email: form.email, mobile: form.mobile, guests: form.guests,
        date: form.date, time: form.time, cake: cake || null, message: form.message || null,
      });
      setStatus("success");
      sessionStorage.removeItem("tgp-birthday-session");
    } catch {
      setStatus("error");
    }
  }

  const summaryRows = [
    { label: "Full Name", value: form.name || "—" },
    { label: "Email", value: form.email || "—" },
    { label: "Mobile", value: form.mobile || "—" },
    { label: "Guests", value: form.guests || "—" },
    { label: "Date", value: form.date || "—" },
    { label: "Time", value: form.time || "—" },
    { label: "Cake", value: cake || "Not selected yet" },
  ];

  return (
    <section ref={wizardRef} id="enquiry" className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Easy Online Booking</div>
          <h2 className="font-display text-3xl md:text-4xl text-palace mb-3">Reserve Your Birthday Celebration</h2>
          <p className="text-palace/55 text-sm">Takes 2 minutes — fill your details, pick a cake, then confirm with secure payment of $150.</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-10 bg-saffron" : i < step ? "w-5 bg-saffron/50" : "w-5 bg-saffron/20"
              }`} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-saffron/20 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-[0_20px_50px_-24px_rgba(70,40,0,0.35)]">
          <div key={step} className="animate-fade-swap">

            {/* Step 0 — Reserve */}
            {step === 0 && (
              <form onSubmit={handleReserveSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Full Name <span className="text-saffron">*</span></label>
                    <input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your full name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email <span className="text-saffron">*</span></label>
                    <input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Mobile Number <span className="text-saffron">*</span></label>
                    <input required value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="+61 4xx xxx xxx" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Number Of Guests <span className="text-saffron">*</span></label>
                    <input required type="number" min="1" max="125" value={form.guests} onChange={e => update("guests", e.target.value)} placeholder="Enter number of guests (max 125)" className={inputCls} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Date of Event <span className="text-saffron">*</span></label>
                    <input required type="date" value={form.date} onChange={e => update("date", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Time of Celebration <span className="text-saffron">*</span></label>
                    <select required value={form.time} onChange={e => update("time", e.target.value)} className={inputCls}>
                      <option value="">Select time</option>
                      <option>Lunch — 12:00pm to 3:00pm</option>
                      <option>Dinner — 5:00pm to 10:00pm (Sun–Thu)</option>
                      <option>Dinner — 5:00pm to 10:30pm (Fri–Sat)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Additional Message</label>
                  <textarea value={form.message} onChange={e => update("message", e.target.value)} rows={3}
                    placeholder="Dietary requirements, special requests…"
                    className={`${inputCls} resize-none`} />
                </div>
                <SimpleCaptcha captcha={captcha} />
                <button type="submit" className="btn-gold w-full justify-center text-base py-4">
                  Continue to Cake Selection <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-palace/40 text-[11px]">Or call us directly on (02) 8021 7696 · We respond within 24 hours</p>
              </form>
            )}

            {/* Step 1 — Cake */}
            {step === 1 && (
              <div>
                <h3 className="font-display text-2xl text-palace text-center mb-6">Select Your Cake</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {CAKES.map(({ img, name, detail }) => {
                    const selected = cake === name;
                    return (
                      <button key={name} type="button" onClick={() => setCake(name)}
                        className={`text-left rounded-xl border overflow-hidden transition group ${selected ? "border-saffron ring-2 ring-saffron/40 bg-saffron/[0.06]" : "border-saffron/25 bg-white hover:border-saffron/50"}`}>
                        <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                          <img src={img} alt={name} loading="lazy" decoding="async"
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {selected && (
                            <span className="absolute top-3 right-3 h-7 w-7 rounded-full bg-saffron flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-display text-lg text-palace mb-0.5">{name}</h4>
                          <p className="text-palace/55 text-[13px] font-medium">{detail}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-center text-palace/50 text-[12px] mt-5">Both cakes are freshly baked and included in the TGP Celebrate Birthday package ($150)</p>
                <div className="flex items-center justify-between mt-7">
                  <button type="button" onClick={() => setStep(0)} className="text-sm text-palace/55 hover:text-saffron transition">← Back</button>
                  <button type="button" disabled={!cake} onClick={() => setStep(2)}
                    className="btn-gold !py-3 !px-6 disabled:opacity-40 disabled:pointer-events-none">
                    Continue to Summary <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Confirm & Pay */}
            {step === 2 && (
              <div>
                <h3 className="font-display text-2xl text-palace text-center mb-6">Confirm &amp; Pay</h3>
                <div className="rounded-xl border border-saffron/20 bg-white overflow-hidden mb-5">
                  {summaryRows.map(({ label, value }, i) => (
                    <div key={label} className={`flex items-center justify-between px-5 py-3 text-sm ${i % 2 === 0 ? "bg-saffron/[0.04]" : ""}`}>
                      <span className="text-stone-500">{label}</span>
                      <span className="text-stone-800 font-medium text-right">{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-3.5 bg-palace">
                    <span className="text-cream/70 text-sm">TGP Celebrate Birthday</span>
                    <span className="font-display text-xl text-gold">$150</span>
                  </div>
                </div>
                <form onSubmit={handleMakePayment}>
                  <button type="submit" disabled={status === "submitting"} className="btn-gold w-full justify-center text-base py-4 disabled:opacity-60">
                    <Cake className="h-5 w-5" /> {status === "submitting" ? "Sending…" : "Make Payment"} <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                {status === "success" && (
                  <p className="text-center text-green-700 bg-green-50 border border-green-200 rounded-lg text-sm mt-4 py-2.5 px-4">
                    Enquiry received — our team will confirm your booking shortly. Complete payment in the tab that just opened.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-center text-red-700 bg-red-50 border border-red-200 rounded-lg text-sm mt-4 py-2.5 px-4">
                    Payment tab opened, but we couldn't save your enquiry automatically — please call us on (02) 8021 7696 to confirm.
                  </p>
                )}
                <p className="text-center text-palace/40 text-[11px] mt-3">Your booking is confirmed the moment payment is made · Processed securely via Now Book It</p>
                <button type="button" onClick={() => setStep(1)} className="text-sm text-palace/55 hover:text-saffron transition mt-5">← Back</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Set Menus ──────────────────────────────────────────── */
function SetMenus() {
  const minChargeActive = useSiteToggle("min-charge-notice");
  return (
    <section id="menu" className="relative z-0 section-cream py-12 md:py-20 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Available with TGP Celebrate Birthday Only</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Birthday Special <span className="italic text-saffron">Set Menus</span></h2>
          <p className="text-palace/55 mt-3 text-sm max-w-lg mx-auto leading-relaxed">
            Choose 1 veg + 1 non-veg entrée and curry (Sparkle) or 2 veg + 2 non-veg (Shine). Daal, rice, breads, salad & papadum included with both.
          </p>
        </div>

        {/* menu cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-6 md:mb-10">
          {[
            { name: "Birthday Sparkle", price: 40, tag: "Great Value",  dessert: "Gulab Jamun",         picks: "1 Veg + 1 Non-Veg entrée & curry" },
            { name: "Birthday Shine",   price: 55, tag: "Most Popular",  dessert: "Ras Malai or Kulfi",  picks: "2 Veg + 2 Non-Veg entrée & curry" },
          ].map(({ name, price, tag, dessert, picks }) => (
            <div key={name} className="rounded-2xl border border-saffron/30 bg-white/75 p-7 flex flex-col shadow-[0_6px_24px_-10px_rgba(212,120,0,0.15)] hover:bg-white/90 transition">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[10px] uppercase tracking-widest border border-saffron/40 bg-saffron/10 text-saffron rounded-full px-3 py-1">{tag}</span>
                  <h3 className="font-display text-2xl text-palace mt-2">{name}</h3>
                  <p className="text-palace/50 text-[12px] mt-1">{picks}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-4xl text-saffron">${price}</div>
                  <div className="text-palace/40 text-xs">/person</div>
                </div>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-saffron mb-2">Entrées (Vegetarian)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {vegEntrees.map(i => <span key={i} className="text-[12px] text-palace/70 border border-palace/15 rounded-full px-2.5 py-0.5">{i}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-saffron mb-2">Entrées (Non-Vegetarian)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nonVegEntrees.map(i => <span key={i} className="text-[12px] text-palace/70 border border-palace/15 rounded-full px-2.5 py-0.5">{i}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-saffron mb-2">Curries (Vegetarian)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {vegCurries.map(i => <span key={i} className="text-[12px] text-palace/70 border border-palace/15 rounded-full px-2.5 py-0.5">{i}</span>)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-saffron mb-2">Curries (Non-Vegetarian)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nonVegCurries.map(i => <span key={i} className="text-[12px] text-palace/70 border border-palace/15 rounded-full px-2.5 py-0.5">{i}</span>)}
                  </div>
                </div>
                <div className="pt-3 border-t border-saffron/10">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-palace/60">
                    {["Dal (Lasooni Tadka or Dal Makhani)", "Basmati Rice", "Assorted Breads", "Garden Salad", "Papadum & Chutney"].map(i => (
                      <span key={i} className="flex items-center gap-1"><Check className="h-3 w-3 text-saffron shrink-0" />{i}</span>
                    ))}
                    <span className="flex items-center gap-1 text-saffron font-medium"><Star className="h-3 w-3 shrink-0" />Dessert: {dessert}</span>
                  </div>
                </div>
              </div>
              <a href="#enquiry" className="mt-6 text-center rounded-full py-2.5 text-[12px] font-medium tracking-wider uppercase transition border border-saffron/40 text-saffron hover:bg-saffron hover:text-white">
                Book This Menu
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-palace/65 text-[12px] font-medium">
          1 piece of each entrée per guest · Unlimited curries, rice &amp; staples · 1 serve of dessert per guest
          {minChargeActive && <><br />Min. charge $35/person · Children 5–10: $25</>}
        </p>
      </div>
    </section>
  );
}

/* ─── Photo Strip ────────────────────────────────────────── */
/* Silent autoplay loop, no controls — the video element only mounts once the
   card scrolls near the viewport, so it never touches initial page-load performance. */
function BirthdayReel() {
  const [inView, setInView] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={holderRef} className="mx-auto w-full max-w-[260px]">
      <div className="relative aspect-[9/16] rounded-[1.75rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border-4 border-white/80 bg-black">
        {inView ? (
          <video
            src={bpReel}
            poster={bpReelPoster}
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload noplaybackrate nofullscreen"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <img src={bpReelPoster} alt="Birthday celebration reel preview" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        )}
      </div>
      <p className="text-center text-palace/45 text-[11px] mt-2 tracking-wide uppercase">A glimpse of the celebration</p>
    </div>
  );
}

function MomentsStrip() {
  return (
    <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-2">Captured Moments</div>
          <h2 className="font-display text-3xl text-palace">Glimpse of Birthday Memory <span className="italic text-saffron">at TGP</span></h2>
          <p className="text-palace/50 text-sm mt-2">Decorated tables, birthday cakes & guests enjoying the full experience.</p>
        </div>
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-center">
          <BirthdayReel />
          <div className="grid grid-cols-3 gap-2.5">
            {[bday1, bday2, bday3, bday4, bday5, bday6].map((src, i) => (
              <div key={i} className="img-hover rounded-xl overflow-hidden aspect-square">
                <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Milestone Birthdays ────────────────────────────────── */
function Milestones() {
  return (
    <section className="relative z-0 bg-palace py-20 px-6 overflow-hidden">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Every Age, Every Stage</div>
          <h2 className="font-display text-4xl md:text-5xl text-cream">Perfect for <span className="italic text-gold">milestone birthdays</span></h2>
          <p className="text-cream/50 mt-3 text-sm max-w-lg mx-auto">From 18th birthday dinners to 50th celebrations — we specialise in making every milestone unforgettable.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map(({ age, title, body }) => (
            <div key={age} className="rounded-2xl border border-gold/30 bg-white/[0.08] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)] p-6 hover:bg-white/[0.12] hover:border-gold/50 transition">
              <div className="font-display text-4xl text-gold/60 mb-3">{age}</div>
              <h3 className="font-display text-lg text-gold mb-2">{title}</h3>
              <p className="text-cream/70 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Guest Reviews ──────────────────────────────────────── */
function Reviews() {
  return (
    <section id="reviews" className="relative z-0 section-cream py-20 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Real Birthday Celebrations at TGP</div>
          <h2 className="font-display text-4xl text-palace">What <span className="italic text-saffron">guests say</span></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map(({ name, text }) => (
            <div key={name} className="rounded-2xl border border-saffron/20 bg-white/65 p-6 hover:bg-white/85 transition">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-saffron text-saffron" />)}
              </div>
              <p className="text-palace/70 text-sm leading-relaxed mb-4">"{text}"</p>
              <div className="text-palace font-medium text-sm">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────── */
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
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

/* ─── Booking CTA ────────────────────────────────────────── */
function BookingCTA() {
  return (
    <section id="booking" className="relative z-0 bg-palace py-20 px-6 overflow-hidden scroll-mt-24">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Reserve Your Celebration</div>
        <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">
          Ready to book your <span className="italic text-gold">birthday?</span>
        </h2>
        <p className="text-cream/50 max-w-md mx-auto text-sm leading-relaxed mb-10">
          Our team responds within 24 hours. Book 2–4 weeks ahead for weekdays, 4–6 weeks for weekends.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {[
            { icon: Phone,  label: "Call",   value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
            { icon: Mail,   label: "Email",  value: EMAIL, href: `mailto:${EMAIL}` },
            { icon: MapPin, label: "Visit",  value: "Basement, 261 George St, Sydney CBD", href: "https://maps.google.com/?q=261+George+Street+Sydney" },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target={label === "Visit" ? "_blank" : undefined} rel="noreferrer"
              className="rounded-xl border border-gold/15 bg-white/[0.04] p-5 flex items-center gap-4 text-left hover:bg-white/[0.08] transition group">
              <span className="h-9 w-9 rounded-full bg-saffron/15 flex items-center justify-center shrink-0 group-hover:bg-saffron/25 transition">
                <Icon className="h-4 w-4 text-saffron" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gold/50 mb-0.5">{label}</div>
                <div className="text-cream/75 text-[13px] leading-snug">{value}</div>
              </div>
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/book-a-table" className="btn-gold">Book a Table <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/events" className="btn-outline-gold">All Events</Link>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gold/15 bg-white/[0.03] px-5 py-3 text-[12px] text-cream/40">
          <Clock className="h-3.5 w-3.5 text-gold/50" />
          Lunch 12pm–3pm · Dinner 5pm–10pm (10:30pm Fri–Sat) · Up to 125 guests
        </div>
      </div>
    </section>
  );
}
