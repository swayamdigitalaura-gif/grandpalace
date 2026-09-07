import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Check, Phone, Mail, MapPin, Clock, Users } from "lucide-react";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/gallery/Interior_052.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { fetchPageContent, useLiveContent, makeContent, contentParagraphs } from "@/lib/pageContent";
import { Editable } from "@/components/Editable";
import interiorImg from "@/assets/gallery/Interior_058.jpg";
import foodImg from "@/assets/menu-categories/cat-biryani.jpg";
import corpImg from "@/assets/gallery/Corporate_084.jpeg";

export const Route = createFileRoute("/about")({
  loader: () => fetchPageContent("/about"),
  head: () => ({
    meta: [
      { title: "About Us — The Grand Palace Indian Restaurant Sydney CBD" },
      { name: "description", content: "The Grand Palace serves traditional Indian cuisine in a royal palace-inspired setting in Sydney CBD. Authentic flavours, HACCP certified, Gold Licensed." },
    ],
  }),
  component: AboutPage,
});

const STORY_DEFAULT = [
  "The Grand Palace Indian Restaurant is serving traditional Indian food that is rich, plentiful and meticulously prepared. India's culinary heritage features distinct regional cuisines found throughout the country — and we bring these authentic flavours to Sydney's dining community.",
  "Our kitchen employs experienced chefs who blend spices with aromatic herbs using time-honoured techniques passed down through generations. Every dish is crafted with care, celebrating the bold regional flavours of the Indian subcontinent.",
  "The restaurant's interior design draws inspiration from India's royal palaces, creating an opulent atmosphere that reflects historical regal aesthetics — making every visit a truly immersive experience.",
];

function AboutPage() {
  const content = useLiveContent("/about", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = useSiteImage("about-hero", content["hero.image"] || heroImgDefault);
  const storyImg = content["story.image"] || interiorImg;
  const storyParas = contentParagraphs(content, "story.body", STORY_DEFAULT);
  const minChargeActive = useSiteToggle("min-charge-notice");
  return (
    <PageShell crumbs={[{ label: "About Us" }]}>
      {/* Hero */}
      <div className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: "46vh" }}>
        <img src={heroImg} alt="The Grand Palace interior" data-tgp-key="hero.image" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.55) 0%, rgba(8,3,0,0.92) 100%)" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}><Editable k="hero.kicker">{c("hero.kicker", "The Grand Palace · Sydney CBD")}</Editable></p>
          <h1 className="font-display text-5xl md:text-7xl text-gold-gradient leading-tight"><Editable k="hero.title">{c("hero.title", "About Us")}</Editable></h1>
          <p className="text-cream/60 text-sm tracking-wider max-w-md"><Editable k="hero.subtitle">{c("hero.subtitle", "Fine Dining Indian Restaurant · Est. Sydney CBD")}</Editable></p>
        </div>
      </div>

      {/* Our Story */}
      <section className="relative section-cream py-20 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.08] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -bottom-28 w-[460px] opacity-[0.08] animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3"><Editable k="story.kicker">{c("story.kicker", "Our Story")}</Editable></p>
            <h2 className="font-display text-4xl md:text-5xl text-palace mb-6 leading-tight">
              <Editable k="story.headingLine1">{c("story.headingLine1", "Fine Dining Indian")}</Editable><br /><span className="italic text-saffron"><Editable k="story.headingLine2">{c("story.headingLine2", "Restaurant")}</Editable></span>
            </h2>
            <div data-tgp-key="story.body">
              {storyParas.map((p, i) => (
                <p key={i} className="text-palace/70 leading-relaxed mb-5 last:mb-0">{p}</p>
              ))}
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] min-h-[400px]">
            <img src={storyImg} alt="The Grand Palace dining room" data-tgp-key="story.image" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-palace/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="relative bg-palace py-20 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-[0.05]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-4"><Editable k="vision.kicker">{c("vision.kicker", "Our Vision")}</Editable></p>
          <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl text-cream leading-relaxed italic">
            <Editable k="vision.quote">{c("vision.quote", "\"We are supremely confident that our sublime food set in an ostentatious environment supported by attentive service will satiate your desire to have a unique dining experience.\"")}</Editable>
          </blockquote>
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {["HACCP Certified", "Gold Licensed", "Halal Certified", "Est. Sydney CBD"].map((b) => (
              <span key={b} className="text-[11px] tracking-[0.3em] uppercase text-gold/70 border border-gold/25 rounded-full px-4 py-1.5">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why us tiles */}
      <section className="relative section-cream py-20 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -top-28 w-[460px] opacity-[0.07] animate-spin-slow" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3"><Editable k="diff.kicker">{c("diff.kicker", "What Sets Us Apart")}</Editable></p>
            <h2 className="font-display text-4xl text-palace" data-tgp-key="diff.heading" dangerouslySetInnerHTML={{ __html: c("diff.heading", "The Grand Palace <span class=\"italic text-saffron\">difference</span>") }} />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {[
              { key: "tile1", title: "Royal Ambience", body: "Hand-carved arches, golden light and opulent décor inspired by India's historic royal palaces — no extra decoration needed." },
              { key: "tile2", title: "Authentic Regional Cuisine", body: "Experienced chefs craft traditional recipes from across India's diverse culinary regions, using the finest spices and aromatic herbs." },
              { key: "tile3", title: "HACCP Certified Kitchen", body: "Gold-licensed and HACCP certified — our kitchen meets the highest food safety and hygiene standards in Australia." },
              { key: "tile4", title: "Customisable Menus", body: "Vegetarian, vegan, halal, and gluten-friendly options available. Menus tailored to your event, taste, and dietary requirements." },
              { key: "tile5", title: "Heart of Sydney CBD", body: "Basement, 261 George Street — one minute from Wynyard Station and Bridge Street Light Rail, with parking nearby." },
              { key: "tile6", title: "Private Event Specialists", body: "From intimate birthday dinners to full venue takeovers, our dedicated team handles every detail of your special occasion." },
            ].map(({ key, title, body }) => (
              <div key={key} className="rounded-2xl border border-saffron/20 bg-white/70 p-6 hover:bg-white/90 hover:border-saffron/40 hover:shadow-[0_8px_28px_-10px_rgba(212,120,0,0.2)] transition">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-saffron shrink-0" />
                  <h3 data-tgp-key={`diff.${key}.title`} className="font-display text-lg text-palace">{c(`diff.${key}.title`, title)}</h3>
                </div>
                <p data-tgp-key={`diff.${key}.body`} className="text-palace/60 text-sm leading-relaxed">{c(`diff.${key}.body`, body)}</p>
              </div>
            ))}
          </div>

          {/* Food + venue image split */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { img: foodImg, label: "The Cuisine", title: "Bold regional flavours, authentically prepared" },
              { img: corpImg, label: "The Venue", title: "Majestic setting for every celebration" },
            ].map(({ img, label, title }) => (
              <div key={label} className="relative rounded-2xl overflow-hidden min-h-[280px] shadow-md">
                <img src={img} alt={title} loading="lazy" className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-palace/95 via-palace/60 to-palace/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-1" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}>{label}</p>
                  <h4 className="font-display text-xl text-cream max-w-[260px]" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trading hours + conditions */}
      <section className="bg-palace py-16 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-display text-2xl text-gold mb-5 flex items-center gap-2"><Clock className="h-5 w-5 text-saffron" /> Trading Hours</h3>
            <div className="space-y-4 text-[14px] text-cream/65">
              <div><p className="text-cream/90 font-semibold mb-1">Lunch</p><p>Monday – Sunday: 12:00pm – 3:00pm</p></div>
              <div>
                <p className="text-cream/90 font-semibold mb-1">Dinner</p>
                <p>Sunday – Thursday: 5:00pm – 10:00pm</p>
                <p>Friday – Saturday: 5:00pm – 10:30pm</p>
              </div>
              <div><p className="text-cream/90 font-semibold mb-1">Venue for Hire</p><p>Saturday – Sunday: 12:00pm – 3:00pm</p></div>
              <p className="italic text-cream/40 text-[12px]">Kitchen closes 30 minutes before restaurant close.</p>
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl text-gold mb-5 flex items-center gap-2"><Users className="h-5 w-5 text-saffron" /> Conditions of Entry</h3>
            <ul className="space-y-3 text-[14px] text-cream/65">
              {[...(minChargeActive ? ["Minimum charge per person $35. Children aged 5–10 is $25."] : []), "NO BYO", "Card surcharge apply", "10% surcharge on special events and public holidays"].map((c) => (
                <li key={c} className="flex items-start gap-2"><span className="text-saffron mt-0.5">✦</span>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-cream py-16 px-6 text-center">
        <h2 className="font-display text-4xl text-palace mb-3"><Editable k="cta.heading">{c("cta.heading", "Come Dine With Us")}</Editable></h2>
        <p className="text-palace/60 text-sm mb-8 max-w-sm mx-auto"><Editable k="cta.subtext">{c("cta.subtext", "Experience authentic Indian fine dining in the heart of Sydney CBD.")}</Editable></p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/book-a-table" className="btn-gold">Book a Table</Link>
          <Link to="/events" className="btn-outline-dark">Plan an Event</Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-[13px] text-palace/60">
          <a href="tel:+61280217696" className="flex items-center gap-2 hover:text-saffron transition"><Phone className="h-4 w-4" /> (02) 8021 7696</a>
          <a href="mailto:bookings@thegrandpalace.com.au" className="flex items-center gap-2 hover:text-saffron transition"><Mail className="h-4 w-4" /> bookings@thegrandpalace.com.au</a>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Basement, 261 George St, Sydney NSW 2000</span>
        </div>
      </section>
    </PageShell>
  );
}
