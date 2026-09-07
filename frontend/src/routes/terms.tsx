import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import mandala from "@/assets/mandala.png";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

export const Route = createFileRoute("/terms")({
  loader: () => fetchPageContent("/terms"),
  head: () => ({
    meta: [
      { title: "Terms & Conditions — The Grand Palace Indian Restaurant" },
      { name: "description", content: "Terms and conditions for dining, online ordering, gift cards, and events at The Grand Palace Indian Restaurant, Sydney CBD." },
    ],
  }),
  component: TermsPage,
});

const sections = [
  {
    title: "Definitions",
    body: `"We", "us", and "our" refer to The Grand Palace – Indian Restaurant at Basement, 261 George Street, Sydney, NSW 2000. The restaurant reserves the right to revise these terms without prior notice.`,
  },
  {
    title: "Kitchen Closing Time",
    body: `The kitchen closes 30 minutes before restaurant closing. Specific hours include:`,
    list: [
      "Lunch Mon–Fri: closes 2:30 PM",
      "Dinner Sun–Thu: closes 9:30 PM",
      "Dinner Fri–Sat: closes 10:00 PM",
    ],
  },
  {
    title: "Privacy Policy",
    body: `The establishment states: "Information we receive from your use of our physical premise and digital media is used only to provide the best service."`,
  },
  {
    title: "Online Payment",
    body: `Payment details are processed securely through a gateway partner and discarded after order completion. Card details are not retained.`,
  },
  {
    title: "Physical Premise Payment",
    body: `Payment terminals process cards without the restaurant retaining card information.`,
  },
  {
    title: "Legal Rights",
    body: `The restaurant may disclose information to satisfy legal obligations or protect business interests and guest safety.`,
  },
  {
    title: "Food Quality",
    body: `The restaurant notes: "Our dishes contain oil. If the customers don't like the oily food, it can't be held against us."`,
  },
  {
    title: "Returns Policy",
    body: `No refunds on gift cards or items due to taste preferences. Incorrect or faulty products are replaced at no cost.`,
  },
  {
    title: "Disclaimer",
    body: `Website content is provided "as is" with no warranties. The business disclaims liability for losses related to website information.`,
  },
  {
    title: "Gift Card Terms",
    body: `Gift cards require subscription to marketing communications and are invalid on public holidays and special event days at the restaurant's discretion.`,
  },
];

const SECTION_KEYS = [
  "definitions", "kitchen", "privacy", "onlinepayment", "premisepayment",
  "legalrights", "foodquality", "returns", "disclaimer", "giftcardterms",
];

function TermsPage() {
  const content = useLiveContent("/terms", Route.useLoaderData());
  const c = makeContent(content);
  return (
    <PageShell crumbs={[{ label: "Terms" }]}>
      {/* Hero */}
      <div className="relative h-48 md:h-64 overflow-hidden bg-palace">
        <img src={mandala} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-[0.07]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>The Grand Palace</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-gold-gradient">{c("hero.title", "Terms & Conditions")}</h1>
        </div>
      </div>

      <section className="relative section-cream py-14 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -top-28 w-[420px] opacity-[0.06] animate-spin-slow" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p data-tgp-key="intro.text" className="text-palace/60 text-[14px] leading-relaxed mb-8 border-l-2 border-saffron/40 pl-4">
            {c("intro.text", "Last updated: 2025. These terms apply to all dine-in guests and online customers of The Grand Palace Indian Restaurant, Basement, 261 George Street, Sydney, NSW 2000.")}
          </p>

          <div className="space-y-10">
            {sections.map(({ title, body, list, note }, i) => {
              const sk = SECTION_KEYS[i] ?? `section${i}`;
              return (
              <div key={i} className="scroll-mt-20">
                <h2 data-tgp-key={`${sk}.title`} className="font-display text-2xl text-palace mb-3">{i + 1}. {c(`${sk}.title`, title)}</h2>
                {body && (
                  <div data-tgp-key={`${sk}.body`} className="text-palace/65 text-[14px] leading-relaxed mb-3 whitespace-pre-line">{c(`${sk}.body`, body)}</div>
                )}
                {list && (
                  <ul className="space-y-2 mb-3">
                    {list.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-palace/65 text-[14px]">
                        <span className="text-saffron mt-1 shrink-0">•</span> {item}
                      </li>
                    ))}
                  </ul>
                )}
                {note && <p className="italic text-palace/45 text-[13px]">{note}</p>}
              </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl bg-palace p-6 text-center">
            <p className="text-cream/70 text-[13px] mb-4">Questions about our terms? We're happy to help.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+61280217696" className="btn-gold">Call Us</a>
              <Link to="/contact" className="btn-outline-gold">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
