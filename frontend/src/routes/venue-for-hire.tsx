import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import mandala from "@/assets/mandala.png";
import { useState, createContext, useContext } from "react";
import { useSiteToggle } from "@/lib/useSiteToggle";
import {
  Users, MapPin, Phone, Mail, Clock, ChevronDown,
  ArrowRight, Check, Star, Music, Utensils, Calendar,
} from "lucide-react";

import heroImgDefault from "@/assets/venue.jpg";
import venueImg       from "@/assets/venue-catering-section.jpg";
import imgBirthday    from "@/assets/venue-birthday.jpg";
import imgBabyShower  from "@/assets/gallery/Customers_029-scaled.jpg";
import imgAnniversary from "@/assets/gallery/Hero_008.jpg";
import imgCorporate   from "@/assets/gallery/Corporate_059-scaled.jpg";
import imgEngagement  from "@/assets/gallery/Diwali_09-scaled.jpg";
import int1           from "@/assets/gallery/Interior_051.jpg";
import int2           from "@/assets/gallery/Interior_059.JPG";
import int3           from "@/assets/gallery/Interior_062.jpg";
import int4           from "@/assets/gallery/Interior_054.jpg";
import int5           from "@/assets/gallery/Interior_055.jpg";
import hero2          from "@/assets/gallery/Hero_007.jpg";

export const Route = createFileRoute("/venue-for-hire")({
  loader: () => fetchPageContent("/venue-for-hire"),
  head: () => ({
    meta: [
      { title: "Private Venue for Hire Sydney CBD — The Grand Palace Indian Restaurant" },
      { name: "description", content: "Hire The Grand Palace Indian Restaurant for your private event in Sydney CBD. Up to 125 guests. Birthdays, baby showers, anniversaries, corporate functions. From $45pp." },
    ],
  }),
  component: VenueForHirePage,
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

const whyUs = [
  { icon: Users,    title: "Up to 125 Guests",        body: "Whether it's an intimate gathering of 20 or a grand celebration of 125, The Grand Palace Indian Restaurant can accommodate your entire group." },
  { icon: Utensils, title: "Authentic Indian Cuisine", body: "Impress your guests with our full à la carte menu or choose from our exclusive set menus from just $45 per person." },
  { icon: Star,     title: "Exclusive Venue Hire",     body: "The entire restaurant is yours — a private, elegant setting for your milestone event with dedicated staff throughout." },
  { icon: Music,    title: "Bring Your Own DJ",        body: "Customise the atmosphere your way. You're welcome to bring your own decorations and a DJ to create the perfect vibe." },
  { icon: MapPin,   title: "Heart of Sydney CBD",      body: "Basement, 261 George Street — 3 min walk from Wynyard Station, 10 min to Circular Quay. Easy access from all across Sydney." },
  { icon: Calendar, title: "Weekend Lunches Only",     body: "Private venue hire is available exclusively on Saturdays and Sundays for lunch, up to 3 PM — perfect for daytime celebrations." },
];

const eventTypes = [
  { title: "Birthday Celebrations",  desc: "From 18th to 80th — milestone birthdays celebrated in style with cake, décor and a full set menu experience at The Grand Palace Indian Restaurant.", img: imgBirthday },
  { title: "Baby Showers",           desc: "A warm, intimate setting for welcoming new arrivals. Our team handles every detail so the mum-to-be can simply enjoy.", img: imgBabyShower },
  { title: "Anniversaries",          desc: "Mark your special years together with fine Indian cuisine, elegant ambiance, and a dedicated team ensuring a flawless evening.", img: imgAnniversary },
  { title: "Corporate Functions",    desc: "Team lunches, client entertainment, product launches — The Grand Palace Indian Restaurant creates the perfect professional backdrop.", img: imgCorporate },
  { title: "Engagements & Reunions", desc: "Celebrate life's biggest moments surrounded by people you love. Our flexible layout suits intimate groups and large gatherings alike.", img: imgEngagement },
];

const faqs = [
  { q: "When is the venue available for private hire?", a: "Private venue hire at The Grand Palace Indian Restaurant is available exclusively on Saturdays and Sundays for lunch, from 12:00pm to 3:00pm. For other event times, please contact us to discuss availability." },
  { q: "How many guests can the venue accommodate?", a: "Our venue comfortably accommodates up to 125 guests for a private event, making it suitable for both intimate gatherings and larger celebrations." },
  { q: "What is the minimum spend?", a: "All-inclusive packages start from $45 per person. There is a minimum charge of $35 per person (children aged 5–10: $25). A 10% surcharge applies on public holidays and special events." },
  { q: "Can I bring my own decorations and DJ?", a: "Absolutely. You are welcome to bring your own decorations and a DJ to personalise the event. Please discuss any specific requirements with our team when enquiring." },
  { q: "Is there parking nearby?", a: "Yes — Wilson Parking on Clarence Street and Secure Parking on Erskine Street are both nearby. We are also a 3-minute walk from Wynyard Station (trains and buses)." },
  { q: "Can the menu be customised for dietary requirements?", a: "Yes. Our menus include vegetarian, vegan, gluten-friendly and halal options. Please advise us of any dietary requirements when making your enquiry." },
  { q: "How do I enquire about a venue hire?", a: "Call us on (02) 8021 7696, email bookings@thegrandpalace.com.au, or use the enquiry form below. We respond within 24 hours to confirm availability and discuss your event." },
  { q: "Is BYO allowed?", a: "No BYO. The Grand Palace Indian Restaurant is a fully licensed venue with a comprehensive bar offering cocktails, wines, beers, spirits and non-alcoholic options." },
];

const PageContentCtx = createContext<(key: string, fallback: string) => string>((_, fallback) => fallback);

function VenueForHirePage() {
  const content = useLiveContent("/venue-for-hire", Route.useLoaderData());
  const c = makeContent(content);
  return (
    <PageContentCtx.Provider value={c}>
    <PageShell crumbs={[{ label: "Venue for Hire" }]}>
      <Hero />
      <WhyChooseUs />
      <EventTypes />
      <VenueFeatures />
      <EnquiryForm />
      <Gallery />
      <FAQ />
      <ContactCTA />
    </PageShell>
    </PageContentCtx.Provider>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────── */
function Hero() {
  const c = useContext(PageContentCtx);
  const heroImg = c("hero.image", "") || heroImgDefault;
  return (
    <section className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
      <img src={heroImg} alt="The Grand Palace Indian Restaurant venue" data-tgp-key="hero.image" fetchPriority="high" decoding="async"
           className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
      <div className="relative flex flex-col items-center gap-4 px-6 py-10">
        <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
          The Grand Palace · Sydney CBD
        </p>
        <h1 data-tgp-key="hero.title" className="font-display leading-none" style={{ fontSize: "clamp(38px,7vw,80px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
          {c("hero.title", "Private Venue for Hire")}
        </h1>
        <div className="flex items-center gap-4" style={{ width: "10rem" }}>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
          <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
        </div>
        <p data-tgp-key="hero.subtitle" className="text-[13px] md:text-[15px] max-w-xl" style={{ color: "rgba(255,235,190,0.9)" }}>
          {c("hero.subtitle", "Up to 125 guests · From $45 per person · Saturday & Sunday lunches")}
        </p>
        <div className="flex flex-nowrap gap-2 sm:gap-3 mt-2">
          <a href="#events" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">View Event Types <ArrowRight className="h-4 w-4" /></a>
          <a href="#enquiry" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Enquire Now</a>
        </div>
      </div>
    </section>
  );
}

/* ─── Why Choose Us ──────────────────────────────────────────────── */
function WhyChooseUs() {
  return (
    <section className="relative z-0 section-cream py-14 px-6 overflow-hidden">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Private Venue Hire · Sydney CBD</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Why choose <span className="italic text-saffron">The Grand Palace Indian Restaurant?</span></h2>
          <p className="text-palace/55 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
            An exceptional private dining experience for milestone events — where authentic Indian cuisine meets an elegant, fully customisable venue in the heart of Sydney CBD.
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

/* ─── Event Types ────────────────────────────────────────────────── */
function EventTypes() {
  return (
    <section id="events" className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10 scroll-mt-24">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-3">Every Occasion, Perfectly Hosted</div>
          <h2 className="font-display text-4xl md:text-5xl text-palace">Perfect for <span className="italic text-saffron">any milestone</span></h2>
          <p className="text-palace/55 mt-3 text-sm max-w-lg mx-auto leading-relaxed">
            From intimate baby showers to large corporate functions — The Grand Palace Indian Restaurant tailors every event to your vision.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {eventTypes.map(({ title, desc, img }) => (
            <div key={title} className="rounded-2xl border border-saffron/20 bg-white/70 overflow-hidden hover:shadow-[0_8px_32px_-10px_rgba(212,120,0,0.2)] transition group">
              <div className="relative h-48 overflow-hidden">
                <img src={img} alt={title} loading="lazy" decoding="async"
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-palace/75 to-transparent" />
                <h3 className="absolute bottom-3 left-4 font-display text-lg text-cream leading-tight">{title}</h3>
              </div>
              <p className="p-5 text-palace/65 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Venue Features / Package ───────────────────────────────────── */
function VenueFeatures() {
  return (
    <section className="relative z-0 overflow-hidden border-t border-saffron/10">
      <div className="grid lg:grid-cols-2">

        {/* mobile-only title — shown before the image; hidden on desktop where it lives in the text column */}
        <div className="order-1 lg:hidden bg-palace px-6 pt-10 pb-6">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">All-Inclusive Packages</div>
          <h2 className="font-display text-3xl text-cream">
            From <span className="text-gold">$45</span> per person
          </h2>
        </div>

        <div className="order-2 lg:order-1 relative min-h-[360px]">
          <img src={venueImg} alt="The Grand Palace Indian Restaurant dining room" loading="lazy" decoding="async"
               className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-palace/20" />
        </div>
        <div className="order-3 lg:order-2 relative bg-palace px-8 md:px-12 py-14 overflow-hidden">
          <CarvedBackdrop tone="gold" />
          <div className="relative z-10">
            <div className="hidden lg:block text-xs tracking-[0.4em] uppercase text-saffron mb-3">All-Inclusive Packages</div>
            <h2 className="hidden lg:block font-display text-3xl md:text-4xl text-cream mb-4">
              From <span className="text-gold">$45</span> per person
            </h2>
            <p className="text-cream/60 text-sm leading-relaxed mb-7">
              Every package at The Grand Palace Indian Restaurant includes exclusive restaurant access, dedicated wait staff, and your choice of set menu. Customise further with your own décor and music.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Exclusive use of the full restaurant",
                "Dedicated event staff throughout",
                "Set menu from $45 per person",
                "Full licensed bar — cocktails, wine, beer, spirits",
                "Bring your own decorations & DJ",
                "Up to 125 guests",
                "Available Saturday & Sunday lunches (12pm–3pm)",
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="h-5 w-5 rounded-full bg-saffron/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-saffron" />
                  </span>
                  <span className="text-cream/75 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-nowrap gap-2 sm:gap-3">
              <a href="#enquiry" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Enquire Now <ArrowRight className="h-4 w-4" /></a>
              <Link to="/menu/a-la-carte" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">View Menu</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Enquiry Form ───────────────────────────────────────────────── */
function EnquiryForm() {
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", guests: "", date: "", eventType: "", message: "",
  });
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const captcha = useSimpleCaptcha();

  function update(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha.verify()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/api/enquiries", {
        type: "venue-for-hire",
        name: form.name,
        email: form.email,
        phone: form.mobile,
        subject: `Venue Hire Enquiry${form.eventType ? ` — ${form.eventType}` : ""}`,
        message: form.message || null,
        data: {
          guests: form.guests,
          date: form.date,
          eventType: form.eventType,
        },
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-gold/25 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 focus:bg-white/15 transition text-sm";
  const labelCls = "text-[11px] uppercase tracking-[0.2em] text-cream/60 mb-1.5 block";

  return (
    <section id="enquiry" className="relative z-0 bg-palace py-16 px-6 overflow-hidden border-t border-gold/10 scroll-mt-24">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Get in Touch</div>
          <h2 className="font-display text-3xl md:text-4xl text-cream">Venue Hire <span className="italic text-gold">Enquiry</span></h2>
          <p className="text-cream/45 text-sm mt-3">Fill in the form and our team at The Grand Palace Indian Restaurant will respond within 24 hours.</p>
        </div>
        {sent ? (
          <div className="rounded-2xl border border-gold/20 bg-white/[0.05] p-10 text-center">
            <div className="text-gold text-5xl mb-4">✦</div>
            <h3 className="font-display text-2xl text-cream mb-2">Enquiry received — thank you!</h3>
            <p className="text-cream/55 text-sm max-w-sm mx-auto">Our team will be in touch within 24 hours. For anything urgent, call us on (02) 8021 7696.</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className={labelCls}>Number of Guests <span className="text-saffron">*</span></label>
              <input required type="number" min="1" max="125" value={form.guests} onChange={e => update("guests", e.target.value)} placeholder="Enter number of guests (max 125)" className={inputCls} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Date of Hire <span className="text-saffron">*</span></label>
              <input required type="date" value={form.date} onChange={e => update("date", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Type of Event <span className="text-saffron">*</span></label>
              <select required value={form.eventType} onChange={e => update("eventType", e.target.value)} className={inputCls}>
                <option value="">Select event type</option>
                <option>Birthday Celebration</option>
                <option>Baby Shower</option>
                <option>Anniversary</option>
                <option>Corporate Function</option>
                <option>Engagement</option>
                <option>Reunion</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Additional Message</label>
            <textarea value={form.message} onChange={e => update("message", e.target.value)} rows={3}
              placeholder="Any dietary requirements, décor requests, or special arrangements…"
              className={`${inputCls} resize-none`} />
          </div>
          <SimpleCaptcha captcha={captcha} dark />
          <button type="submit" disabled={saving} className="btn-gold w-full justify-center text-base py-4 disabled:opacity-60">
            {saving ? "Sending…" : <>Submit Enquiry <ArrowRight className="h-4 w-4" /></>}
          </button>
          {error && <p className="text-red-400 text-[12px] text-center">{error}</p>}
          <p className="text-center text-cream/30 text-[11px]">Or call us on (02) 8021 7696 · We respond within 24 hours</p>
        </form>
        )}
      </div>
    </section>
  );
}

/* ─── Venue Gallery ──────────────────────────────────────────────── */
function Gallery() {
  return (
    <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
      <CarvedBackdrop tone="dark" />
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron/80 mb-2">The Space</div>
          <h2 className="font-display text-3xl text-palace">A venue that <span className="italic text-saffron">sets the tone</span></h2>
          <p className="text-palace/50 text-sm mt-2">Warm lighting, rich textures, and an atmosphere crafted for celebrations at The Grand Palace Indian Restaurant.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[int1, int2, int3, int4, int5, hero2].map((src, i) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-[4/3] group">
              <img src={src} alt="" loading="lazy" decoding="async"
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────── */
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
                    ? "All-inclusive packages start from $45 per person. A 10% surcharge applies on public holidays and special events."
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

/* ─── Contact CTA ────────────────────────────────────────────────── */
function ContactCTA() {
  return (
    <section id="contact" className="relative z-0 bg-palace py-20 px-6 overflow-hidden scroll-mt-24">
      <CarvedBackdrop tone="gold" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Reserve Your Venue</div>
        <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">
          Ready to book your <span className="italic text-gold">private event?</span>
        </h2>
        <p className="text-cream/50 max-w-md mx-auto text-sm leading-relaxed mb-10">
          The Grand Palace Indian Restaurant team responds within 24 hours. Weekend lunch slots fill quickly — we recommend enquiring 4–6 weeks ahead.
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
        <div className="flex flex-nowrap gap-2 sm:gap-3 justify-center">
          <Link to="/book-a-table" className="btn-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Book a Table <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/birthday-package" className="btn-outline-gold flex-1 sm:flex-initial justify-center whitespace-nowrap !text-[12px] !px-4 !py-2.5 sm:!text-sm sm:!px-8 sm:!py-3.5">Celebrate Birthday</Link>
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gold/15 bg-white/[0.03] px-5 py-3 text-[12px] text-cream/40">
          <Clock className="h-3.5 w-3.5 text-gold/50" />
          Venue hire: Sat & Sun lunch 12pm–3pm · Up to 125 guests · From $45pp
        </div>
      </div>
    </section>
  );
}
