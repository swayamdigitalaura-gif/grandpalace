import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, MapPin, Clock, Phone, Navigation, MessageCircle, Mail } from "lucide-react";
import { PageShell } from "@/components/PageShell";

const ITEM_ICONS = { pin: MapPin, clock: Clock, phone: Phone, navigation: Navigation, message: MessageCircle, mail: Mail } as const;
export type WhatsOnItemIcon = keyof typeof ITEM_ICONS;

/* ── data shape — designed so a backend/CMS can populate this 1:1 later ──
 * Rich-text fields (highlightLine, intro, section intro/items, contentBlocks)
 * are typed as ReactNode: the raw markup ({{color}}/{{size}}/links/headings/
 * bullets, same convention as Guides) is resolved by the caller via
 * renderRich/renderBlockText before it reaches this component, which stays
 * purely presentational. */
export type WhatsOnCta = { label: string; to?: string; href?: string; external?: boolean };

export type WhatsOnSection = {
  heading: string;
  priceTag?: string;
  intro?: ReactNode;
  items: ReactNode[];
  /* optional richer layout — used for spec-card style sections (e.g. tasting cards).
   * When `description` is set, it renders as prose above a chip row (`tags`) and a
   * highlighted tasting-note callout (`character`), instead of the plain bullet grid. */
  description?: ReactNode;
  tags?: string[];
  character?: ReactNode;
  /* optional icon per item (parallel array, same index as `items`) — replaces the
   * plain bullet dot with a lucide icon, e.g. for address/hours/phone info rows. */
  itemIcons?: WhatsOnItemIcon[];
};

export type WhatsOnContentBlock = {
  subtitle?: ReactNode;
  body: ReactNode;
};

export type WhatsOnSimplePageData = {
  crumbLabel: string;
  emoji?: string;
  title: string;
  subtitle: string;
  heroImage: string;
  heroVideo?: string;
  galleryImages?: string[];
  highlightLine?: ReactNode;
  intro?: ReactNode;
  contentBlocks?: WhatsOnContentBlock[];
  sections: WhatsOnSection[];
  sidebarImage: string;
  sidebarVideo?: string;
  cta: WhatsOnCta;
  cta2?: WhatsOnCta;
};

function CtaButton({ cta, solid }: { cta: WhatsOnCta; solid: boolean }) {
  const className = `flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] font-bold uppercase tracking-wider px-3 sm:px-7 py-2.5 sm:py-3 rounded-lg transition whitespace-nowrap ${
    solid ? "text-white hover:brightness-110" : "border-2 border-amber-600 text-amber-700 hover:bg-amber-50"
  }`;
  const style = solid ? { background: "linear-gradient(90deg,#c8860a,#e6a020)" } : undefined;

  if (cta.to) {
    return <Link to={cta.to} className={className} style={style}>{cta.label}</Link>;
  }
  return (
    <a href={cta.href} target={cta.external ? "_blank" : undefined} rel={cta.external ? "noreferrer" : undefined}
       className={className} style={style}>
      {cta.label} {cta.external && <ExternalLink className="h-3.5 w-3.5" />}
    </a>
  );
}

export function WhatsOnSimpleTemplate({ title, subtitle, heroImage, heroVideo, galleryImages, emoji, highlightLine, intro, contentBlocks, sections, sidebarImage, sidebarVideo, cta, cta2, crumbLabel }: WhatsOnSimplePageData) {
  return (
    <PageShell crumbs={[{ label: "What's On", to: "/whats-on" }, { label: crumbLabel }]}>

      {/* ══ HERO — same height/style as the menu pages ══ */}
      <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
        {heroVideo ? (
          <video src={heroVideo} poster={heroImage} className="absolute inset-0 w-full h-full object-cover"
                 autoPlay muted loop playsInline />
        ) : (
          <img src={heroImage} alt={title} className="absolute inset-0 w-full h-full object-cover"
               fetchPriority="high" decoding="async" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10">
          <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
            The Grand Palace · Sydney CBD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(38px,7vw,80px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            {title} {emoji}
          </h1>
          <div className="flex items-center gap-4" style={{ width: "10rem" }}>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
            <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
            <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
          </div>
          <p className="text-[13px] md:text-[15px] max-w-xl" style={{ color: "rgba(255,235,190,0.9)" }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* ══ GALLERY STRIP — extra photos beneath the hero ══ */}
      {galleryImages && galleryImages.length > 0 && (
        <div className="bg-white px-6 py-6 border-b border-stone-100">
          <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.map((src, i) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-[4/3] border border-stone-200">
                <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTENT ══ */}
      <section className="py-12 md:py-20 px-6" style={{ background: "linear-gradient(180deg, #fdf6e6 0%, #ffffff 380px)" }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-12 items-start">

          {/* mobile-only highlight — shown above the image; hidden on desktop where it lives in the content column below */}
          {highlightLine && (
            <div className="order-1 lg:hidden inline-block rounded-lg px-4 py-2.5 border" style={{ background: "rgba(200,134,10,0.08)", borderColor: "rgba(200,134,10,0.25)" }}>
              <p className="text-amber-800 font-semibold text-[14px]">{highlightLine}</p>
            </div>
          )}

          <div className="order-3 lg:order-1">
            {highlightLine && (
              <div className="hidden lg:inline-block rounded-lg px-4 py-2.5 mb-6 border" style={{ background: "rgba(200,134,10,0.08)", borderColor: "rgba(200,134,10,0.25)" }}>
                <p className="text-amber-800 font-semibold text-[14px] md:text-[15px]">{highlightLine}</p>
              </div>
            )}
            {intro && (
              <div className="text-stone-800 leading-relaxed mb-8 max-w-2xl text-[15px]">{intro}</div>
            )}

            {contentBlocks && contentBlocks.length > 0 && (
              <div className="space-y-8 mb-8 max-w-2xl">
                {contentBlocks.map((block, i) => (
                  <div key={i}>
                    {block.subtitle && (
                      <p className="font-display text-lg md:text-xl text-stone-900 mb-2">{block.subtitle}</p>
                    )}
                    <div className="text-stone-700 leading-relaxed text-[15px]">{block.body}</div>
                  </div>
                ))}
              </div>
            )}

            {sections.map((sec, i) => {
              const richCard = Boolean(sec.description || sec.tags?.length || sec.character);
              return (
                <div key={i} className="relative rounded-2xl bg-white border border-stone-200 shadow-sm p-6 md:p-7 mb-6 overflow-hidden">
                  {richCard && (
                    <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: "linear-gradient(90deg,#c8860a,#e6a020,#c8860a)" }} />
                  )}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                    <div>
                      {sec.intro && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 mb-2">
                          {sec.intro}
                        </span>
                      )}
                      <h3 className="font-display text-xl md:text-2xl text-stone-900">{sec.heading}</h3>
                    </div>
                    {sec.priceTag && (
                      <span className="font-display text-lg px-4 py-1.5 rounded-full text-white flex-shrink-0 shadow-sm"
                            style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}>
                        {sec.priceTag}
                      </span>
                    )}
                  </div>

                  {sec.description && (
                    <p className="text-stone-700 text-[14.5px] leading-relaxed mt-3">{sec.description}</p>
                  )}

                  {sec.tags && sec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {sec.tags.map((tag, j) => (
                        <span key={j}
                              className="text-[12px] font-semibold text-amber-800 rounded-full px-3 py-1 border"
                              style={{ background: "rgba(200,134,10,0.07)", borderColor: "rgba(200,134,10,0.28)" }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {sec.character && (
                    <div className="mt-4 rounded-xl px-4 py-3 border-l-4"
                         style={{ background: "linear-gradient(90deg, rgba(200,134,10,0.08), rgba(200,134,10,0.02))", borderColor: "#c8860a" }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">Tasting Notes</p>
                      <p className="text-stone-800 text-[14px] italic leading-relaxed">{sec.character}</p>
                    </div>
                  )}

                  {sec.items.length > 0 && (
                    <ul className="grid sm:grid-cols-2 gap-2.5 mt-4">
                      {sec.items.map((item, j) => {
                        const IconComp = sec.itemIcons?.[j] ? ITEM_ICONS[sec.itemIcons[j]] : null;
                        return (
                          <li key={j}
                              className="flex items-start gap-2.5 text-stone-700 text-[14px] leading-relaxed rounded-lg px-3.5 py-2.5"
                              style={{ background: "rgba(200,140,30,0.06)" }}>
                            {IconComp ? (
                              <IconComp className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2.25} />
                            ) : (
                              <span className="text-amber-600 mt-0.5 flex-shrink-0">●</span>
                            )}
                            <span className="flex-1 min-w-0">{item}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}

            <div className="flex flex-nowrap gap-2 sm:gap-3 mt-8">
              <CtaButton cta={cta} solid />
              {cta2 && <CtaButton cta={cta2} solid={false} />}
            </div>
          </div>

          {/* ── sidebar media (static, not sticky — avoids detaching from short content columns) ── */}
          <div className="order-2 lg:order-2 mt-4 lg:mt-14 space-y-4">
            {sidebarVideo && (
              <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] border border-stone-200">
                <video src={sidebarVideo} poster={sidebarImage} className="w-full h-auto object-cover"
                       autoPlay muted loop playsInline />
              </div>
            )}
            <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] border border-stone-200">
              <img src={sidebarImage} alt={title} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
            </div>
          </div>

        </div>
      </section>
    </PageShell>
  );
}
