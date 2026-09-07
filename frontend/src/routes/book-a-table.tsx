import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Phone, Mail, MapPin, Car, Train, Users } from "lucide-react";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/hero-events-spread.jpg";

const PHONE_TEL = "+61280217696";
const PHONE_DISPLAY = "(02) 8021 7696";
const EMAIL = "bookings@thegrandpalace.com.au";

const OPENTABLE_URL = "https://www.opentable.com/r/the-grand-palace-indian-restaurant-fine-dining-reservations-sydney?restref=158699&lang=en-AU&ot_source=Restaurant%20website";

function OpenTableWidget() {
  return (
    <iframe
      src={OPENTABLE_URL}
      width="100%"
      height="1200"
      frameBorder="1"
      scrolling="yes"
      name="opentable-make-reservation-widget"
      title="OpenTable Reservations"
    />
  );
}

const reserveActionSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "The Grand Palace Indian Restaurant",
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: OPENTABLE_URL,
      actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
    },
    result: { "@type": "Reservation", name: "Reservation" },
  },
};

export const Route = createFileRoute("/book-a-table")({
  loader: () => fetchPageContent("/book-a-table"),
  head: () => ({
    meta: [
      { title: "Book a Table — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Reserve your table at The Grand Palace Indian Restaurant, Sydney CBD. Book online instantly via OpenTable." },
    ],
  }),
  component: BookATablePage,
});

const parkingOptions = [
  { name: "Jamison Street", detail: "Off-street parking, available after 6:00pm" },
  { name: "Met Centre Secure Car Park", detail: "60 Margaret Street — 1.90m max height" },
  { name: "Wilson Car Park", detail: "9 Lang Street — 2m max height" },
  { name: "Australian Square Parking", detail: "31 Bond Street" },
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

function BookATablePage() {
  const content = useLiveContent("/book-a-table", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;
  const minChargeActive = useSiteToggle("min-charge-notice");

  return (
    <PageShell crumbs={[{ label: "Book a Table" }]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reserveActionSchema) }} />

      {/* Hero */}
      <section className="relative z-0 overflow-hidden">
        <img src={heroImg} alt="" data-tgp-key="hero.image" fetchPriority="high" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-palace/85 via-palace/80 to-palace/95" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="text-xs tracking-[0.4em] uppercase text-saffron mb-3">Namaste from The Grand Palace</div>
          <h1 data-tgp-key="hero.title" className="font-display text-4xl md:text-5xl text-cream mb-4">{c("hero.title", "Come and Dine With Us")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/65 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {c("hero.subtitle", "The most authentic Indian food in Sydney CBD. Reserve instantly online, or call us directly — our team responds within 24 hours.")}
          </p>
        </div>
      </section>

      {/* Reserve CTA */}
      <section className="relative z-0 section-cream py-16 px-6 overflow-hidden">
        <CarvedBackdrop tone="dark" />
        <div className="relative z-10 max-w-2xl mx-auto text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl text-palace mb-3">Reserve Your Table</h2>
          <p className="text-palace/60 text-sm max-w-md mx-auto leading-relaxed">
            Book instantly online via OpenTable — pick your date, time and party size, and we'll confirm right away.
          </p>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto grid lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Info card — Namaste, hours, conditions of entry */}
          <div className="rounded-2xl border border-saffron/20 bg-white/85 p-6">
            <h3 className="font-display text-lg text-palace mb-2">Namaste! Come and Dine With Us!</h3>
            <p className="text-palace/60 text-[13px] leading-relaxed mb-4 pb-4 border-b border-saffron/10">
              Group bookings or private events for 15 or more guests, please email <a href={`mailto:${EMAIL}`} className="text-saffron underline hover:text-saffron/80">{EMAIL}</a>
            </p>

            <h4 className="text-saffron font-display text-base mb-3">TGP – Sydney CBD</h4>
            <div className="space-y-2 text-[13px] text-palace/70 mb-4 pb-4 border-b border-saffron/10">
              <p className="text-palace font-semibold">Lunch</p>
              <p>Monday – Sunday: 12:00pm – 3:00pm</p>
              <p className="text-palace font-semibold pt-1">Dinner</p>
              <p>Monday – Thursday: 5:00pm – 10:00pm</p>
              <p>Friday – Sunday: 5:00pm – 10:30pm</p>
            </div>

            <h4 className="text-saffron font-display text-base mb-3">Conditions Of Entry</h4>
            <ul className="space-y-2 text-[13px] text-palace/70 mb-4 pb-4 border-b border-saffron/10">
              {[
                ...(minChargeActive ? ["Minimum spend per person $35.", "Children aged 5 to 10 is $25."] : []),
                "NO BYO",
                "Card surcharge apply",
                "10% surcharge on special events and public holidays",
              ].map((c) => (
                <li key={c} className="flex items-start gap-2"><span className="text-saffron mt-0.5">•</span>{c}</li>
              ))}
            </ul>

            {minChargeActive && <p className="text-palace/45 text-[12px] italic">Note: Public holidays surcharge applies.</p>}
          </div>

          {/* OpenTable widget — embedded via iframe */}
          <div className="rounded-2xl border border-saffron/20 bg-white overflow-hidden shadow-[0_20px_50px_-24px_rgba(70,40,0,0.35)]">
            <OpenTableWidget />
          </div>
        </div>
      </section>

      {/* Parking / Getting Here */}
      <section className="relative z-0 section-cream py-16 px-6 overflow-hidden border-t border-saffron/10">
        <CarvedBackdrop tone="dark" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h3 className="font-display text-2xl md:text-3xl text-palace mb-8 text-center">Getting Here &amp; Parking</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-saffron/20 bg-white/70 p-6">
              <div className="flex items-center gap-2 mb-4 text-saffron"><Train className="h-5 w-5" /><h4 className="font-display text-lg text-palace">Public Transport</h4></div>
              <p className="text-palace/65 text-sm leading-relaxed">Just a 1-minute walk from Bridge Street Light Rail and Wynyard Train Station.</p>
            </div>
            <div className="rounded-2xl border border-saffron/20 bg-white/70 p-6">
              <div className="flex items-center gap-2 mb-4 text-saffron"><Car className="h-5 w-5" /><h4 className="font-display text-lg text-palace">By Car</h4></div>
              <ul className="space-y-2.5">
                {parkingOptions.map(({ name, detail }) => (
                  <li key={name} className="text-sm">
                    <span className="text-palace font-medium">{name}</span>
                    <span className="text-palace/55"> — {detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="relative z-0 section-cream pb-16 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-3">
          {[
            { icon: Phone,  label: "Call",  value: PHONE_DISPLAY, href: `tel:${PHONE_TEL}` },
            { icon: Mail,   label: "Email", value: EMAIL, href: `mailto:${EMAIL}` },
            { icon: MapPin, label: "Visit", value: "Basement, 261 George St, Sydney CBD", href: "https://maps.google.com/?q=261+George+Street+Sydney" },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target={label === "Visit" ? "_blank" : undefined} rel="noreferrer"
              className="rounded-xl border border-saffron/20 bg-white/70 p-5 flex items-center gap-4 text-left hover:bg-white/90 transition group">
              <span className="h-9 w-9 rounded-full bg-saffron/15 flex items-center justify-center shrink-0 group-hover:bg-saffron/25 transition">
                <Icon className="h-4 w-4 text-saffron" />
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-palace/40 mb-0.5">{label}</div>
                <div className="text-palace/80 text-[13px] leading-snug">{value}</div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
