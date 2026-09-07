import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { Gift, Heart, PartyPopper, Briefcase, Star } from "lucide-react";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/hero-gift-card-dessert.jpg";
import diningImg from "@/assets/gallery/SLA09499.jpg";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

export const Route = createFileRoute("/gift-card")({
  loader: () => fetchPageContent("/gift-card"),
  head: () => ({
    meta: [
      { title: "Gift Vouchers — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Give the gift of fine Indian dining. The Grand Palace gift vouchers are perfect for birthdays, anniversaries, and any occasion. Purchase online via Now Book It." },
    ],
  }),
  component: GiftCardPage,
});

const occasions = [
  { icon: PartyPopper, label: "Birthdays" },
  { icon: Heart, label: "Anniversaries" },
  { icon: Star, label: "Special Thanks" },
  { icon: Briefcase, label: "Corporate Gifts" },
  { icon: Gift, label: "Christmas" },
  { icon: Heart, label: "Mother's Day" },
];

function GiftCardPage() {
  const content = useLiveContent("/gift-card", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = content["hero.image"] || heroImgDefault;
  return (
    <PageShell crumbs={[{ label: "Gift Card" }]}>
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={heroImg} alt="" data-tgp-key="hero.image" className="w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.55),rgba(8,3,0,0.92))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-4">
          <p className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>The Grand Palace · Sydney CBD</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-7xl text-gold-gradient leading-tight">{c("hero.title", "Gift Vouchers")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/65 text-sm md:text-base max-w-md leading-relaxed">
            {c("hero.subtitle", "Give your loved ones the gift of an unforgettable Indian dining experience")}
          </p>
        </div>
      </div>

      {/* Main */}
      <section className="relative section-cream py-20 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.08] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -bottom-28 w-[460px] opacity-[0.08] animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="relative z-10 max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-2 gap-14 items-center mb-16">
            <div>
              <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3">The Perfect Present</p>
              <h2 data-tgp-key="intro.heading" className="font-display text-4xl md:text-5xl text-palace mb-6 leading-tight">
                {c("intro.heading", "Give the gift of flavour")}
              </h2>
              <p data-tgp-key="intro.body1" className="text-palace/70 leading-relaxed mb-5 text-[15px]">
                {c("intro.body1", "Looking for the perfect gift? The Grand Palace Indian Restaurant gift vouchers make every celebration extra special. Whether it's a birthday, anniversary, or a simple thank you, let your loved ones choose what they truly want.")}
              </p>
              <p data-tgp-key="intro.body2" className="text-palace/70 leading-relaxed mb-8 text-[15px]">
                {c("intro.body2", "Easy to purchase online and even easier to enjoy — treat someone to an authentic Indian fine dining experience in the heart of Sydney CBD.")}
              </p>
              <a
                href="#purchase"
                className="btn-gold inline-flex items-center gap-2"
              >
                <Gift className="h-4 w-4" /> Purchase Gift Voucher
              </a>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)] min-h-[380px]">
              <img src={diningImg} alt="The Grand Palace dining experience" className="w-full h-full object-cover absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-palace/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="font-display text-xl text-cream">An experience they'll never forget</p>
              </div>
            </div>
          </div>

          {/* Perfect for occasions */}
          <div className="text-center mb-10">
            <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3">Perfect For</p>
            <h3 className="font-display text-3xl text-palace mb-8">Every <span className="italic text-saffron">occasion</span></h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {occasions.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-saffron/20 bg-white/70 p-4 flex flex-col items-center gap-2 hover:bg-white/90 hover:border-saffron/40 transition">
                  <div className="h-10 w-10 rounded-full bg-saffron/15 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-saffron" />
                  </div>
                  <span className="text-palace/75 text-[12px] font-medium text-center">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl bg-palace p-8 md:p-10 mb-10">
            <h3 className="font-display text-2xl text-gold text-center mb-8">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Purchase Online", desc: "Buy your gift voucher securely online via our partner Now Book It. Choose your preferred value." },
                { step: "02", title: "Receive Instantly", desc: "Your digital voucher is delivered straight away — perfect for last-minute gifts or planning ahead." },
                { step: "03", title: "Redeem & Enjoy", desc: "Present your voucher when dining at The Grand Palace. Your recipient enjoys an authentic Indian feast." },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="font-display text-5xl text-gold/30 mb-3">{step}</div>
                  <h4 className="font-display text-xl text-cream mb-2">{title}</h4>
                  <p className="text-cream/55 text-[13px] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase widget */}
          <div id="purchase" className="scroll-mt-24 mb-10">
            <div className="text-center mb-6">
              <p className="text-[11px] tracking-[0.4em] uppercase text-saffron/80 mb-3">Buy Now</p>
              <h3 className="font-display text-3xl text-palace">Purchase Your <span className="italic text-saffron">Gift Voucher</span></h3>
            </div>
            <div className="rounded-2xl border border-saffron/20 bg-white overflow-hidden shadow-[0_20px_50px_-24px_rgba(70,40,0,0.35)]">
              <iframe
                src="https://app.gift-it.com.au/buy/thegrandpalace"
                title="Purchase a Grand Palace gift voucher"
                width="100%"
                height="1000"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          {/* Terms note */}
          <div className="rounded-2xl border border-saffron/20 bg-white/70 p-6 mb-8">
            <h4 className="font-display text-lg text-palace mb-3">Important Information</h4>
            <ul data-tgp-key="terms.list" className="space-y-2 text-[13px] text-palace/65">
              {c("terms.list", "Gift vouchers are non-exchangeable and non-refundable.\nVouchers are invalid on public holidays, Valentine's Day, Mother's Day, Father's Day, Diwali, and New Year's Eve.\nRedemption in combination with other offers is at the restaurant's discretion.\nPurchase constitutes agreement to receive marketing communications from The Grand Palace.\n10% surcharge applies on special events and public holidays.")
                .split("\n").map((s) => s.trim()).filter(Boolean).map((line) => (
                  <li key={line} className="flex items-start gap-2"><span className="text-saffron">•</span> {line}</li>
                ))}
            </ul>
            <Link to="/terms" className="inline-block mt-3 text-[12px] text-saffron hover:text-gold transition font-semibold">View Full Terms & Conditions →</Link>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="#purchase"
              className="btn-gold inline-flex items-center gap-2 text-base px-10 py-4"
            >
              <Gift className="h-5 w-5" /> Buy a Gift Voucher Now
            </a>
            <p className="text-palace/45 text-[12px] mt-3">Processed securely via Gift It</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
