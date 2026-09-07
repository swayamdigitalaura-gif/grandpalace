import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SimpleCaptcha, useSimpleCaptcha } from "@/components/SimpleCaptcha";
import { Phone, Mail, MapPin, Clock, Train, Car, Facebook, Instagram } from "lucide-react";
import mandala from "@/assets/mandala.png";
import heroImgDefault from "@/assets/gallery/Interior_066.jpg";
import { useSiteImage } from "@/lib/useSiteImage";
import { useSiteToggle } from "@/lib/useSiteToggle";
import { api } from "@/lib/admin-api";
import { fetchPageContent, useLiveContent, makeContent } from "@/lib/pageContent";

export const Route = createFileRoute("/contact")({
  loader: () => fetchPageContent("/contact"),
  head: () => ({
    meta: [
      { title: "Contact Us — The Grand Palace Indian Restaurant Sydney" },
      { name: "description", content: "Contact The Grand Palace Indian Restaurant in Sydney CBD. Call (02) 8021 7696 or email bookings@thegrandpalace.com.au. Basement, 261 George Street." },
    ],
  }),
  component: ContactPage,
});

const PHONE_DISPLAY = "(02) 8021 7696";
const PHONE_TEL = "+61280217696";
const EMAIL = "bookings@thegrandpalace.com.au";
const MAPS_URL = "https://maps.google.com/?q=The+Grand+Palace+Indian+Restaurant+261+George+Street+Sydney";
const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=61422984570&text&type=phone_number&app_absent=0";
const FACEBOOK_URL = "https://www.facebook.com/tgp.thegrandpalace";
const INSTAGRAM_URL = "https://www.instagram.com/tgp.thegrandpalace";

function ContactPage() {
  const content = useLiveContent("/contact", Route.useLoaderData());
  const c = makeContent(content);
  const heroImg = useSiteImage("contact-hero", content["hero.image"] || heroImgDefault);
  const minChargeActive = useSiteToggle("min-charge-notice");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const captcha = useSimpleCaptcha();

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.message.trim()) e.message = "Message is required";
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
        type: "contact",
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message,
      });
      setSent(true);
    } catch {
      setErrors({ submit: "Something went wrong. Please try again or call us directly." });
    } finally {
      setSaving(false);
    }
  }

  const fieldCls = (k: string) =>
    `w-full rounded-lg border px-4 py-3 text-palace placeholder:text-palace/40 focus:outline-none focus:ring-2 transition text-sm ${
      errors[k] ? "border-red-400 bg-red-50 focus:ring-red-200" : "border-saffron/30 bg-white/70 focus:border-saffron focus:ring-saffron/20"
    }`;
  const labelCls = "text-xs uppercase tracking-[0.2em] text-palace/60 mb-1.5 block";

  return (
    <PageShell crumbs={[{ label: "Contact" }]}>
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={heroImg} alt="" data-tgp-key="hero.image" className="w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(6,2,0,0.6),rgba(8,3,0,0.9))" }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-3">
          <p data-tgp-key="hero.kicker" className="text-[11px] tracking-[0.45em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{c("hero.kicker", "The Grand Palace · Sydney CBD")}</p>
          <h1 data-tgp-key="hero.title" className="font-display text-5xl md:text-6xl text-gold-gradient">{c("hero.title", "Contact Us")}</h1>
          <p data-tgp-key="hero.subtitle" className="text-cream/60 text-sm">{c("hero.subtitle", "We're here to help")}</p>
        </div>
      </div>

      {/* Main grid */}
      <section className="relative section-cream py-16 px-6 overflow-hidden">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -left-36 -top-28 w-[460px] opacity-[0.08] animate-spin-slow" />
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-36 -bottom-28 w-[460px] opacity-[0.08] animate-spin-slow" style={{ animationDirection: "reverse" }} />
        <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">

          {/* Left info panel — shown after the form on mobile */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-8">
            <div>
              <h2 data-tgp-key="info.heading" className="font-display text-3xl text-palace mb-2">{c("info.heading", "Get In Touch")}</h2>
              <p data-tgp-key="info.text" className="text-palace/60 text-sm leading-relaxed">{c("info.text", "We'd love to hear from you. Fill in the form and one of our team will be in touch shortly.")}</p>
            </div>

            <div className="rounded-2xl bg-palace p-6 space-y-4">
              <h3 className="font-display text-xl text-gold mb-4">Contact Details</h3>
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-3 text-cream/75 hover:text-gold transition text-sm">
                <Phone className="h-4 w-4 text-saffron shrink-0" /> {PHONE_DISPLAY}
              </a>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-3 text-cream/75 hover:text-gold transition text-sm">
                <Mail className="h-4 w-4 text-saffron shrink-0" /> {EMAIL}
              </a>
              <div className="flex items-start gap-3 text-cream/75 text-sm">
                <MapPin className="h-4 w-4 text-saffron mt-0.5 shrink-0" />
                <span>Basement, 261 George Street, Sydney, NSW 2000</span>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook"
                   className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace transition">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
                   className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace transition">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp"
                   className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace transition">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>

            {/* Trading Hours */}
            <div className="rounded-2xl border border-saffron/20 bg-white/70 p-6">
              <h3 className="font-display text-xl text-palace mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-saffron" /> Trading Hours</h3>
              <div className="space-y-3 text-[13px] text-palace/65">
                <div><p className="font-semibold text-palace/90 mb-0.5">Lunch</p><p>Monday – Sunday: 12:00pm – 3:00pm</p></div>
                <div><p className="font-semibold text-palace/90 mb-0.5">Dinner</p><p>Sunday – Thursday: 5:00pm – 10:00pm</p><p>Friday – Saturday: 5:00pm – 10:30pm</p></div>
                <div><p className="font-semibold text-palace/90 mb-0.5">Venue for Hire</p><p>Saturday – Sunday: 12:00pm – 3:00pm</p></div>
                <p className="italic text-palace/45 text-[12px] pt-1">The kitchen closes 30 minutes before the restaurant close.</p>
              </div>
            </div>
          </div>

          {/* Right: form + map — shown first on mobile */}
          <div className="order-1 lg:order-2 lg:col-span-3 space-y-8">
            <div className="rounded-2xl bg-white/80 border border-saffron/20 shadow-sm p-8">
              <h3 className="font-display text-2xl text-palace mb-1">Send us a message</h3>
              <p className="text-palace/50 text-[12px] mb-6">We typically reply within 24–48 hours.</p>
              {sent ? (
                <div className="text-center py-8">
                  <div className="text-saffron text-4xl mb-3">✦</div>
                  <p className="font-display text-xl text-palace">Thank you for getting in touch!</p>
                  <p className="text-palace/60 text-sm mt-2">We've received your message and will get back to you within 24–48 hours.</p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Your Name *</label>
                    <input className={fieldCls("name")} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
                    {errors.name && <p className="text-red-500 text-[11px] mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Email Address *</label>
                    <input type="email" className={fieldCls("email")} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@email.com" />
                    {errors.email && <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Phone Number</label>
                    <input className={fieldCls("phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="04xx xxx xxx" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Message *</label>
                    <textarea className={`${fieldCls("message")} min-h-[140px] resize-y`} value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="How can we help you?" />
                    {errors.message && <p className="text-red-500 text-[11px] mt-1">{errors.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <SimpleCaptcha captcha={captcha} />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" disabled={saving} className="btn-gold w-full justify-center disabled:opacity-60">
                      {saving ? "Sending…" : "Send Message"}
                    </button>
                    {errors.submit && <p className="text-red-500 text-[12px] text-center mt-2">{errors.submit}</p>}
                    <p className="text-[11px] text-palace/40 text-center mt-2">
                      By submitting, you agree to our{" "}
                      <Link to="/terms" className="underline hover:text-saffron">Privacy Policy</Link>.
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Map + parking */}
            <div className="rounded-2xl border border-saffron/20 bg-white/70 overflow-hidden">
              <iframe
                title="The Grand Palace Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.9775876223985!2d151.2045876757085!3d-33.86446847322829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12afac09f525ab%3A0xc5ade05750b0f485!2sThe%20Grand%20Palace%20-%20Indian%20Restaurant%20in%20Sydney!5e0!3m2!1sen!2sin!4v1783682384598!5m2!1sen!2sin"
                width="100%" height="220" style={{ border: 0, display: "block" }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="p-5">
                <h4 className="font-display text-lg text-palace mb-3">Getting Here</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-[13px] text-palace/65">
                  <div className="flex items-start gap-2">
                    <Train className="h-4 w-4 text-saffron mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-palace/90 mb-0.5">Public Transport</p>
                      <p>1-min walk from Bridge Street Light Rail Station</p>
                      <p>1-min walk from Wynyard Train Station (George St exit)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Car className="h-4 w-4 text-saffron mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-palace/90 mb-0.5">Parking</p>
                      <p>Multiple secure car parks nearby. Advance booking recommended for discounted rates.</p>
                    </div>
                  </div>
                </div>
                <a href={MAPS_URL} target="_blank" rel="noreferrer"
                   className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold uppercase tracking-wider text-saffron hover:text-gold transition">
                  Open in Google Maps ↗
                </a>
              </div>
            </div>

            {/* Conditions */}
            <div className="rounded-2xl border border-saffron/20 bg-white/70 p-6">
              <h4 className="font-display text-lg text-palace mb-3">Conditions of Entry</h4>
              <ul className="space-y-2 text-[13px] text-palace/65">
                {[...(minChargeActive ? ["Minimum charge per person $35. Children aged 5–10 is $25."] : []), "NO BYO", "Card surcharge apply", "10% surcharge on special events and public holidays"].map((c) => (
                  <li key={c} className="flex items-start gap-2"><span className="text-saffron">•</span>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
