import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Phone, Mail, MapPin, Car } from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import mandala from "@/assets/mandala.png";
import { useSiteToggle } from "@/lib/useSiteToggle";

const PHONE_DISPLAY = "(02) 8021 7696";
const PHONE_TEL = "+61280217696";
const EMAIL = "bookings@thegrandpalace.com.au";
const MAPS_URL = "https://maps.app.goo.gl/FvQpKwHwXEWxo3BAA";
const WHATSAPP_URL = "https://api.whatsapp.com/send/?phone=61422984570&text&type=phone_number&app_absent=0";
const FACEBOOK_URL = "https://www.facebook.com/tgp.thegrandpalace";
const INSTAGRAM_URL = "https://www.instagram.com/tgp.thegrandpalace";

const bottomLinks = [
  { label: "Home",         to: "/" },
  { label: "Menu",         to: "/menu/a-la-carte" },
  { label: "Events",       to: "/events" },
  { label: "What's On",    to: "/whats-on" },
  { label: "Gallery",      to: "/gallery" },
  { label: "About Us",     to: "/about" },
  { label: "Guides",       to: "/guides" },
  { label: "Blog",         to: "/blog" },
  { label: "Contact Us",   to: "/contact" },
  { label: "Career",       to: "/career" },
  { label: "Terms",        to: "/terms" },
  { label: "Gift Card",    to: "/gift-card" },
  { label: "Book a Table", to: "/book-a-table" },
];

export function Footer() {
  const minChargeActive = useSiteToggle("min-charge-notice");
  return (
    <footer className="relative overflow-hidden bg-palace border-t border-gold/20">
      <img src={mandala} alt="" aria-hidden
        className="pointer-events-none absolute -left-40 -bottom-40 w-[520px] opacity-[0.06] animate-spin-slow" />
      <img src={mandala} alt="" aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 w-[400px] opacity-[0.04] animate-spin-slow" style={{ animationDirection: "reverse" }} />

      {/* Main grid */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-14 grid gap-10 md:grid-cols-4 border-b border-gold/15">

        {/* ── Col 1: Brand ── */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <img src={logo} alt="The Grand Palace" className="h-24 w-24 object-contain mb-4"
            style={{ filter: "drop-shadow(0 0 14px rgba(212,168,76,0.55))" }} />
          <p className="text-gold/90 font-display text-base italic leading-snug mb-1">Fine Dining Indian Restaurant</p>
          <p className="text-cream/55 text-[13px] leading-relaxed mb-5">Make Your Moments Special With Us</p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold/60 mb-3">Follow Us</p>
          <div className="flex gap-3">
            <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook"
               className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace hover:border-gold transition">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram"
               className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace hover:border-gold transition">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp"
               className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-gold/25 text-cream/70 hover:bg-gold hover:text-palace hover:border-gold transition">
              {/* WhatsApp icon SVG */}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            </a>
          </div>
        </div>

        {/* ── Col 2: Trading Hours ── */}
        <div>
          <h4 className="text-cream text-base font-semibold mb-4 tracking-wide">Trading Hours</h4>
          <div className="space-y-3 text-[13px] text-cream/60 leading-relaxed">
            <div>
              <p className="text-cream/90 font-semibold text-[13px] mb-1">Lunch</p>
              <p>Monday – Sunday: 12:00pm – 03:00pm</p>
            </div>
            <div>
              <p className="text-cream/90 font-semibold text-[13px] mb-1">Dinner</p>
              <p>Sunday – Thursday: 05:00pm – 10:00pm</p>
              <p>Friday – Saturday: 05:00pm – 10:30pm</p>
            </div>
            <div>
              <p className="text-cream/90 font-semibold text-[13px] mb-1">Venue for Hire</p>
              <p>Saturday – Sunday: 12:00pm – 03:00pm</p>
            </div>
            <p className="text-cream/45 italic text-[12px] pt-1">
              The kitchen closes 30 minutes before the restaurant close.
            </p>
          </div>
        </div>

        {/* ── Col 3: Contact + Conditions ── */}
        <div>
          <h4 className="text-cream text-base font-semibold mb-4 tracking-wide">Contact Us</h4>
          <ul className="space-y-2.5 text-[13px] mb-6">
            <li>
              <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-2.5 text-cream/70 hover:text-gold transition">
                <Phone className="h-4 w-4 text-gold shrink-0" /> {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="flex items-center gap-2.5 text-cream/70 hover:text-gold transition">
                <Mail className="h-4 w-4 text-gold shrink-0" /> {EMAIL}
              </a>
            </li>
          </ul>

          <h4 className="text-cream text-base font-semibold mb-3 tracking-wide">Conditions of Entry</h4>
          <ul className="space-y-2 text-[13px] text-cream/60">
            {[
              ...(minChargeActive ? ["Minimum charge per person $35. Children aged 5 to 10 is $25."] : []),
              "NO BYO",
              "Card surcharge apply",
              "10% surcharge on special events and public holidays",
            ].map((c) => (
              <li key={c} className="flex items-start gap-2">
                <span className="text-gold mt-0.5 text-[10px] shrink-0">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Col 4: Visit Us ── */}
        <div>
          <h4 className="text-cream text-base font-semibold mb-4 tracking-wide">Visit Us</h4>
          <ul className="space-y-3 text-[13px] text-cream/60 mb-4">
            <li className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <span>Basement, 261 George Street, Sydney, NSW 2000</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Car className="h-4 w-4 text-gold mt-0.5 shrink-0" />
              <span>Parking options are available with reasonable prices</span>
            </li>
          </ul>
          <a href={MAPS_URL} target="_blank" rel="noreferrer"
             className="text-[12px] font-semibold uppercase tracking-wider text-gold hover:text-saffron transition mb-4 inline-block">
            Check more ↗
          </a>
          {/* Map embed */}
          <div className="rounded-xl overflow-hidden border border-gold/20 mt-3">
            <iframe
              title="The Grand Palace Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.9775876223985!2d151.2045876757085!3d-33.86446847322829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12afac09f525ab%3A0xc5ade05750b0f485!2sThe%20Grand%20Palace%20-%20Indian%20Restaurant%20in%20Sydney!5e0!3m2!1sen!2sin!4v1783682384598!5m2!1sen!2sin"
              width="100%"
              height="140"
              style={{ border: 0, display: "block" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[12px] text-cream/40 order-2 sm:order-1">
          © {new Date().getFullYear()} The Grand Palace. All Rights Reserved.
        </p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 order-1 sm:order-2">
          {bottomLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className="text-[12px] text-cream/55 hover:text-gold transition tracking-wide">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
