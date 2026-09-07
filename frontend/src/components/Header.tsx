import { Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu as MenuIcon, X, Home, ChevronDown, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo-full.jpg";
import { api, type MenuTypeInfo } from "@/lib/admin-api";

const BASE_MENU_ITEMS = [
  { to: "/menu/a-la-carte", label: "À la carte" },
  { to: "/set-menu", label: "Set Menu" },
  { to: "/beverages", label: "Beverages" },
  { to: "/lunch-special", label: "Lunch Special Set Menu" },
];
// menu types with a dedicated hand-built page already listed above — any
// other menuType created in admin shows up automatically via /menu/$menuType.
const KNOWN_MENU_TYPES = new Set(["a-la-carte", "set-menu", "beverages"]);

function useMenuDropdownItems() {
  const { data } = useQuery({
    queryKey: ["menu-types"],
    queryFn: () => api.get<MenuTypeInfo[]>("/api/menu"),
    staleTime: 60_000,
  });
  const custom = (data ?? [])
    .filter((t) => !KNOWN_MENU_TYPES.has(t.menuType))
    .map((t) => ({ to: `/menu/${t.menuType}`, label: t.label }));
  return [...BASE_MENU_ITEMS, ...custom];
}

const leftNav = [
  { to: "/whats-on", label: "What's On" },
  { to: "/gallery", label: "Gallery" },
  { to: "/events", label: "Events" },
];

const rightNav = [
  { to: "/gift-card", label: "Gift Card" },
  { to: "/birthday-package", label: "Celebrate Birthday" },
];

const restMobileNav = [
  ...leftNav,
  ...rightNav,
  { to: "/venue-for-hire", label: "Venue for Hire" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuDropdownItems = useMenuDropdownItems();

  function onMenuEnter() {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    setMenuOpen(true);
  }
  function onMenuLeave() {
    menuTimer.current = setTimeout(() => setMenuOpen(false), 120);
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="hidden md:flex items-center justify-between px-8 py-2.5 text-sm tracking-wide text-white" style={{ background: "#c8720a" }}>
        <a href="tel:+61280217696" className="flex items-center gap-2 hover:text-white/70 transition">
          <Phone className="h-4 w-4" /> (02) 8021 7696
        </a>
        <a href="mailto:bookings@thegrandpalace.com.au" className="flex items-center gap-2 hover:text-white/70 transition">
          <Mail className="h-4 w-4" /> bookings@thegrandpalace.com.au
        </a>
      </div>

      {/* Main bar */}
      <div className="bg-palace border-b border-gold/20 hidden lg:flex items-center px-6 h-[90px]" style={{ maxWidth: "100%" }}>
        {/* Logo — left */}
        <Link to="/" className="flex-shrink-0 mr-6">
          <img src={logo} alt="The Grand Palace" className="h-[72px] w-auto object-contain"
            style={{ mixBlendMode: "lighten" }} />
        </Link>

        {/* Nav — centered in remaining space */}
        <nav className="flex items-center justify-center gap-5 flex-1">
          <Link to="/" className="text-gold hover:text-gold-bright transition" aria-label="Home">
            <Home className="h-[18px] w-[18px]" />
          </Link>
          <div className="relative" onMouseEnter={onMenuEnter} onMouseLeave={onMenuLeave}>
            <Link to="/menu" className="flex items-center gap-1 text-[15px] tracking-wider text-cream/90 hover:text-gold transition" activeProps={{ className: "text-gold" }}>
              Menu <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </Link>
            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 rounded shadow-[0_8px_32px_rgba(0,0,0,0.35)] z-50 overflow-hidden border border-gold/20"
                style={{ background: "linear-gradient(180deg, oklch(0.97 0.025 85), oklch(0.94 0.035 80))" }}
                onMouseEnter={onMenuEnter} onMouseLeave={onMenuLeave}>
                {menuDropdownItems.map((item) => (
                  <Link key={item.label} to={item.to} className="block px-5 py-3 text-sm font-medium text-palace/80 hover:text-saffron hover:bg-saffron/10 border-b border-gold/15 last:border-0 transition">
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {[...leftNav, ...rightNav].map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center gap-1.5 text-[15px] tracking-wider text-cream/90 hover:text-gold transition whitespace-nowrap" activeProps={{ className: "text-gold" }}>
              {n.label}
              {n.to === "/birthday-package" && (
                <span className="bg-saffron text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Popular</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Action buttons — right */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-6">
          <Link to="/book-a-table" className="bg-gold text-palace rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition whitespace-nowrap">
            Book a Table
          </Link>
          <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" className="bg-gold text-palace rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] font-semibold hover:brightness-110 transition whitespace-nowrap">
            Order Online
          </a>
        </div>
      </div>

      {/* MOBILE main bar */}
      <div className="relative bg-palace border-b border-gold/20 lg:hidden">
        <div className="relative max-w-7xl mx-auto flex items-center px-4 h-20">
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
            <img src={logo} alt="The Grand Palace" className="h-16 w-auto object-contain"
              style={{ mixBlendMode: "lighten" }} />
          </Link>
          <button className="ml-auto text-gold p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="lg:hidden bg-palace/98 backdrop-blur border-b border-gold/30 px-6 py-6 max-h-[calc(100vh-5rem)] overflow-y-auto flex flex-col gap-1">
          <Link to="/" onClick={() => setOpen(false)} className="text-cream/90 hover:text-gold py-2 text-[15px]" activeProps={{ className: "text-gold" }}>
            Home
          </Link>

          {/* Menu section with sub-items */}
          <div className="py-2">
            <Link to="/menu" onClick={() => setOpen(false)} className="text-cream/90 hover:text-gold text-[15px]" activeProps={{ className: "text-gold" }}>
              Menu
            </Link>
            <div className="flex flex-col gap-2.5 mt-2 pl-3 border-l border-gold/25">
              {menuDropdownItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className="text-cream/60 hover:text-gold text-[13px]" activeProps={{ className: "text-gold" }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {restMobileNav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="flex items-center gap-2 text-cream/90 hover:text-gold py-2 text-[15px]" activeProps={{ className: "text-gold" }}>
              {n.label}
              {n.to === "/birthday-package" && (
                <span className="bg-saffron text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Popular</span>
              )}
            </Link>
          ))}

          <div className="flex gap-3 pt-4">
            <Link to="/book-a-table" onClick={() => setOpen(false)} className="btn-outline-gold flex-1 justify-center">Book</Link>
            <a href="https://the-grand-palace-indian-restaurant.square.site/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} className="btn-gold flex-1 justify-center">Order</a>
          </div>
        </div>
      )}
    </header>
  );
}
