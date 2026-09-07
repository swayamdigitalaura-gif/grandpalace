import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { api, type SitePage } from "@/lib/admin-api";
import { EditableImage } from "@/components/admin/EditableImage";
import { EditableVideo } from "@/components/admin/EditableVideo";
import { LinkField } from "@/components/admin/LinkField";
import { RichTextArea, RichTextInput } from "@/components/admin/RichTextField";
import type { PageSection } from "@/components/admin/SectionsEditor";

const FALLBACK_IMAGE = "https://placehold.co/1200x800/2a1500/e6a020?text=Click+to+add+photo";

const DEFAULT_SECTIONS: PageSection[] = [
  { heading: "Section Heading", priceTag: "", intro: "", items: ["First detail", "Second detail", "Third detail"] },
];

type ContentBlock = { subtitle: string; body: string };

const BADGE_COLORS = ["#c8860a", "#e05454", "#16a085", "#6366f1", "#9333ea", "#0891b2"];

export function WhatsOnPageEditor({
  page, onClose, onSaved,
}: {
  page: SitePage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [emoji, setEmoji] = useState(page?.emoji ?? "");
  const [badge, setBadge] = useState(page?.badge ?? "");
  const [badgeColor, setBadgeColor] = useState(page?.badgeColor ?? BADGE_COLORS[0]);
  const [title, setTitle] = useState(page?.title ?? "");
  const [subtitle, setSubtitle] = useState(page?.subtitle ?? "");
  const [intro, setIntro] = useState(page?.intro ?? "");
  const [highlightLine, setHighlightLine] = useState(page?.highlightLine ?? "");
  const [heroImage, setHeroImage] = useState(page?.heroImage ?? "");
  const [heroVideo, setHeroVideo] = useState(page?.heroVideo ?? "");
  const [galleryImages, setGalleryImages] = useState<string[]>(page?.galleryImages ?? []);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    page?.contentBlocks?.map((b) => ({ subtitle: b.subtitle ?? "", body: b.body })) ?? []
  );
  const [cardImageHeight, setCardImageHeight] = useState(page?.cardImageHeight ?? 200);
  const [sidebarImage, setSidebarImage] = useState(page?.sidebarImage ?? "");
  const [sidebarVideo, setSidebarVideo] = useState(page?.sidebarVideo ?? "");
  const [ctaLabel, setCtaLabel] = useState(page?.ctaLabel ?? "Book a Table");
  const [ctaHref, setCtaHref] = useState(page?.ctaHref ?? "/book-a-table");
  const [cta2Label, setCta2Label] = useState(page?.cta2Label ?? "");
  const [cta2Href, setCta2Href] = useState(page?.cta2Href ?? "");
  const [published, setPublished] = useState(page?.published ?? false);
  const [sections, setSections] = useState<PageSection[]>(page?.sections ?? DEFAULT_SECTIONS);

  function updateSection(i: number, patch: Partial<PageSection>) {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function updateItem(sIdx: number, iIdx: number, value: string) {
    updateSection(sIdx, { items: sections[sIdx].items.map((it, idx) => (idx === iIdx ? value : it)) });
  }
  function updateContentBlock(i: number, patch: Partial<ContentBlock>) {
    setContentBlocks((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  const save = useMutation({
    mutationFn: () => {
      const data = {
        emoji: emoji || null, badge: badge || null, badgeColor,
        title, subtitle, intro, highlightLine,
        heroImage, heroVideo: heroVideo || null,
        galleryImages: galleryImages.length ? galleryImages : null,
        contentBlocks: contentBlocks.length ? contentBlocks : null,
        cardImageHeight, sidebarImage, sidebarVideo: sidebarVideo || null, ctaLabel, ctaHref,
        cta2Label: cta2Label || null, cta2Href: cta2Href || null,
        published, sections,
      };
      return page
        ? api.patch(`/api/pages/${page.id}`, data)
        : api.post("/api/pages", { ...data, slug });
    },
    onSuccess: onSaved,
  });

  const inputBase = "bg-transparent outline-none border-b-2 border-dashed border-transparent hover:border-white/30 focus:border-white/70 transition-colors";
  const inputBaseDark = "bg-transparent outline-none border-b-2 border-dashed border-transparent hover:border-amber-300 focus:border-amber-500 transition-colors";

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
      {/* ── sticky toolbar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3" style={{ background: "#1a0e00" }}>
        <div className="flex items-center gap-4">
          <p className="text-cream text-sm font-semibold tracking-wide uppercase">
            {page ? "Editing" : "New"} What's On Page
          </p>
          {!page && (
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug-for-this-page"
              required
              className="rounded-lg px-3 py-1.5 text-sm bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 w-64"
            />
          )}
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Active (shown on the live site)
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-sm text-white/60 hover:text-white">Cancel</button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending || !title || (!page && !slug)}
            className="btn-gold !text-[12px] !px-5 !py-2"
          >
            {save.isPending ? "Saving…" : "Save Page"}
          </button>
        </div>
      </div>

      {/* ── the actual template, editable in place ── */}
      <div className="bg-white">
        <PageShell crumbs={[{ label: "What's On", to: "/whats-on" }, { label: title || "New Page" }]}>
          {/* HERO */}
          <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "46vh" }}>
            <EditableImage
              value={heroImage}
              onChange={setHeroImage}
              placeholder={FALLBACK_IMAGE}
              className="absolute inset-0"
              imgClassName="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(6,2,0,0.82) 0%, rgba(8,3,0,0.78) 50%, rgba(10,4,0,0.85) 100%)" }} />
            <div className="relative z-30 flex flex-col items-center gap-4 px-6 py-10 w-full pointer-events-none [&_input]:pointer-events-auto [&_button]:pointer-events-auto">
              <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a", textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>
                The Grand Palace · Sydney CBD
              </p>
              <div className="flex items-center gap-2 w-full justify-center">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page Title"
                  className={`font-display leading-none text-center ${inputBase}`}
                  style={{ fontSize: "clamp(38px,7vw,80px)", color: "#fdf6e8", textShadow: "0 2px 20px rgba(0,0,0,0.5)", width: "min(90%, 700px)" }}
                />
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🎉"
                  className={`font-display leading-none text-center ${inputBase}`}
                  style={{ fontSize: "clamp(28px,5vw,60px)", width: "70px" }}
                />
              </div>
              <div className="flex items-center gap-4" style={{ width: "10rem" }}>
                <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
                <span style={{ color: "rgba(210,165,65,0.8)", fontSize: "9px" }}>◆</span>
                <span className="h-px flex-1" style={{ background: "rgba(210,165,65,0.65)" }} />
              </div>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Subtitle — one enticing sentence about the offer"
                className={`text-[13px] md:text-[15px] text-center ${inputBase}`}
                style={{ color: "rgba(255,235,190,0.9)", width: "min(90%, 500px)" }}
              />
            </div>
          </div>

          {/* HERO VIDEO — optional, shown instead of the static hero image on the live page when set */}
          <div className="bg-white px-6 py-5 border-b border-stone-100">
            <div className="max-w-6xl mx-auto">
              <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 mb-2">Hero video (optional — overrides the hero photo above when set)</p>
              <EditableVideo
                value={heroVideo}
                onChange={setHeroVideo}
                className="relative rounded-xl overflow-hidden border border-stone-200 h-40 max-w-md"
                videoClassName="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* GALLERY STRIP — extra photos shown below the hero */}
          <div className="bg-white px-6 py-5 border-b border-stone-100">
            <div className="max-w-6xl mx-auto">
              <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 mb-2">Extra photos below the hero (optional)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {galleryImages.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-[4/3]">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1.5 right-1.5 text-[10px] font-bold px-2 py-1 rounded-full bg-black/60 text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <EditableImage
                  value=""
                  onChange={(url) => setGalleryImages((prev) => [...prev, url])}
                  placeholder="https://placehold.co/400x300/2a1500/e6a020?text=+"
                  className="rounded-xl overflow-hidden border border-dashed border-stone-300 aspect-[4/3]"
                  imgClassName="w-full h-full object-cover opacity-0"
                />
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <section className="bg-white py-12 md:py-20 px-6">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_360px] gap-12 items-start">
              <div className="order-3 lg:order-1">
                <div className="block rounded-lg px-4 py-2.5 mb-6 border w-full max-w-xl" style={{ background: "rgba(200,134,10,0.08)", borderColor: "rgba(200,134,10,0.25)" }}>
                  <RichTextInput
                    value={highlightLine}
                    onChange={setHighlightLine}
                    placeholder="Highlight line — e.g. Limited Time Offer!"
                    className={`text-amber-800 font-semibold text-[14px] md:text-[15px] w-full ${inputBaseDark}`}
                  />
                </div>
                <div className="mb-8 max-w-2xl">
                  <RichTextArea
                    value={intro}
                    onChange={setIntro}
                    placeholder="Intro paragraph — a sentence or two introducing this offer"
                    rows={2}
                    className={`text-stone-800 leading-relaxed text-[15px] w-full ${inputBaseDark}`}
                  />
                </div>

                {/* Extra description/subtitle blocks — repeatable, each with its own optional subtitle and rich body */}
                {contentBlocks.map((block, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 md:p-7 mb-6 relative max-w-2xl">
                    <button
                      type="button"
                      onClick={() => setContentBlocks((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 text-red-500 text-xs font-semibold"
                    >
                      Remove Block
                    </button>
                    <div className="pr-24 mb-2">
                      <RichTextInput
                        value={block.subtitle}
                        onChange={(v) => updateContentBlock(i, { subtitle: v })}
                        placeholder="Subtitle (optional)"
                        className={`font-display text-lg md:text-xl text-stone-900 w-full ${inputBaseDark}`}
                      />
                    </div>
                    <RichTextArea
                      value={block.body}
                      onChange={(v) => updateContentBlock(i, { body: v })}
                      placeholder="Description text — use the toolbar for headings, bullets, links, colour, size, or inline images"
                      rows={4}
                      className={`text-stone-700 leading-relaxed text-[15px] w-full ${inputBaseDark}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setContentBlocks((prev) => [...prev, { subtitle: "", body: "" }])}
                  className="btn-outline-gold !text-[11px] !px-4 !py-2 mb-8"
                >
                  + Add Description Block
                </button>

                {sections.map((sec, i) => (
                  <div key={i} className="rounded-2xl bg-white border border-stone-200 shadow-sm p-6 md:p-7 mb-6 relative">
                    <button
                      type="button"
                      onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-3 right-3 text-red-500 text-xs font-semibold"
                    >
                      Remove Section
                    </button>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-1 pr-24">
                      <div className="flex-1 min-w-[160px]">
                        <RichTextInput
                          value={sec.heading}
                          onChange={(v) => updateSection(i, { heading: v })}
                          placeholder="Section heading"
                          className={`font-display text-xl md:text-2xl text-stone-900 w-full ${inputBaseDark}`}
                        />
                      </div>
                      {sec.priceTag ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <input
                            value={sec.priceTag}
                            onChange={(e) => updateSection(i, { priceTag: e.target.value })}
                            placeholder="$Price"
                            className="font-display text-lg px-3 py-1 rounded-full text-white text-center w-28 bg-transparent outline-none"
                            style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}
                          />
                          <button
                            type="button"
                            onClick={() => updateSection(i, { priceTag: "" })}
                            className="text-red-500 text-xs"
                            title="Remove price tag"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateSection(i, { priceTag: "$" })}
                          className="text-[12px] text-amber-700 font-semibold flex-shrink-0"
                        >
                          + Add Price Tag
                        </button>
                      )}
                    </div>
                    <RichTextInput
                      value={sec.intro ?? ""}
                      onChange={(v) => updateSection(i, { intro: v })}
                      placeholder="Category pill (optional) — e.g. Indian Whisky"
                      className={`text-stone-500 text-[14px] mb-4 w-full ${inputBaseDark}`}
                    />
                    <RichTextArea
                      value={sec.description ?? ""}
                      onChange={(v) => updateSection(i, { description: v })}
                      placeholder="Description paragraph (optional) — renders as prose, not a bullet"
                      rows={2}
                      className={`text-stone-700 text-[14px] leading-relaxed mb-3 w-full ${inputBaseDark}`}
                    />
                    <input
                      value={(sec.tags ?? []).join(", ")}
                      onChange={(e) => updateSection(i, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                      placeholder="Spec chips, comma separated (optional) — e.g. Himalayan Barley, American Oak, Lightly Peated"
                      className={`text-[13px] mb-3 w-full ${inputBaseDark}`}
                    />
                    <RichTextInput
                      value={sec.character ?? ""}
                      onChange={(v) => updateSection(i, { character: v })}
                      placeholder="Tasting-note callout (optional) — e.g. Tropical fruit, light peat smoke, long warming finish"
                      className={`text-[13px] mb-4 w-full ${inputBaseDark}`}
                    />
                    <ul className="grid sm:grid-cols-2 gap-2.5 mt-4">
                      {sec.items.map((item, j) => (
                        <li key={j}
                            className="flex items-start gap-2.5 text-stone-700 text-[14px] leading-relaxed rounded-lg px-3.5 py-2.5"
                            style={{ background: j % 2 === 0 ? "rgba(200,140,30,0.06)" : "transparent" }}>
                          <span className="text-amber-600 mt-0.5 flex-shrink-0">●</span>
                          <div className="flex-1">
                            <RichTextInput
                              value={item}
                              onChange={(v) => updateItem(i, j, v)}
                              placeholder="Detail line"
                              className={`w-full ${inputBaseDark}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSection(i, { items: sec.items.filter((_, idx) => idx !== j) })}
                            className="text-red-500 text-xs flex-shrink-0"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => updateSection(i, { items: [...sec.items, ""] })}
                      className="text-[12px] text-amber-700 font-semibold mt-3"
                    >
                      + Add detail line
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setSections((prev) => [...prev, { heading: "New Section", priceTag: "", intro: "", items: ["First detail"] }])}
                  className="btn-outline-gold !text-[11px] !px-4 !py-2 mb-8"
                >
                  + Add Section
                </button>

                <div className="flex flex-nowrap gap-2 sm:gap-3 mt-4">
                  <div className="flex-1 sm:flex-initial">
                    <div
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-7 py-2.5 sm:py-3 w-full"
                      style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}
                    >
                      <input
                        value={ctaLabel}
                        onChange={(e) => setCtaLabel(e.target.value)}
                        placeholder="Button label"
                        className="bg-transparent outline-none text-white text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-center w-full"
                      />
                    </div>
                    <div className="mt-1.5">
                      <LinkField label="" value={ctaHref} onChange={setCtaHref} />
                    </div>
                  </div>
                  <div className="flex-1 sm:flex-initial">
                    <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-7 py-2.5 sm:py-3 border-2 border-amber-600 w-full">
                      <input
                        value={cta2Label}
                        onChange={(e) => setCta2Label(e.target.value)}
                        placeholder="2nd button (optional)"
                        className="bg-transparent outline-none text-amber-700 text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-center w-full"
                      />
                    </div>
                    <div className="mt-1.5">
                      <LinkField label="" value={cta2Href} onChange={setCta2Href} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-2 lg:order-2 mt-4 lg:mt-14 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 mb-2">Sidebar video (optional — shown above the sidebar photo)</p>
                  <EditableVideo
                    value={sidebarVideo}
                    onChange={setSidebarVideo}
                    className="relative rounded-2xl overflow-hidden border border-stone-200 h-40"
                    videoClassName="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <EditableImage
                  value={sidebarImage}
                  onChange={setSidebarImage}
                  placeholder={FALLBACK_IMAGE}
                  className="rounded-2xl overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] border border-stone-200"
                  imgClassName="w-full h-auto object-cover"
                />
              </div>
            </div>
          </section>
        </PageShell>
      </div>

      {/* ── listing card preview — exactly how this page's tile looks on /whats-on ── */}
      <div className="px-6 py-10" style={{ background: "#241300" }}>
        <p className="text-white/60 text-[11px] uppercase tracking-widest font-bold mb-3 text-center">
          How this appears on the What's On listing page
        </p>
        <div className="max-w-sm mx-auto bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-lg">
          <div className="relative">
            <EditableImage
              value={heroImage}
              onChange={setHeroImage}
              placeholder={FALLBACK_IMAGE}
              className="w-full overflow-hidden"
              imgClassName="w-full h-full object-cover"
              resizeHeight={cardImageHeight}
              onResizeHeight={setCardImageHeight}
              minHeight={100}
              maxHeight={500}
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Badge text"
                className="text-[10px] font-bold uppercase tracking-widest text-white px-3 py-1 rounded-full outline-none w-32"
                style={{ background: badgeColor }}
              />
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1 z-10">
              {BADGE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBadgeColor(c)}
                  className="w-4 h-4 rounded-full border-2"
                  style={{ background: c, borderColor: badgeColor === c ? "#fff" : "transparent" }}
                />
              ))}
            </div>
          </div>
          <div className="p-5">
            <p className="font-display text-xl text-stone-900 leading-snug mb-2">{title || "Page Title"}</p>
            <p className="text-amber-700 text-[13px] font-semibold leading-snug mb-2">{subtitle || "Subtitle line"}</p>
            <p className="text-stone-500 text-[13px] leading-relaxed mb-4 line-clamp-2">{intro || "Intro paragraph…"}</p>
            <div className="border-t border-stone-100 pt-4 flex items-center gap-2">
              <span className="flex-1 text-center text-[12px] font-bold uppercase tracking-wider py-2.5 rounded-lg border border-stone-900 text-stone-900">
                Learn More
              </span>
              <span
                className="flex-1 text-center text-[12px] font-bold uppercase tracking-wider py-2.5 rounded-lg text-white"
                style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)" }}
              >
                {ctaLabel || "Button"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending || !title || (!page && !slug)}
            className="btn-gold !text-[13px] !px-8 !py-3"
          >
            {save.isPending ? "Saving…" : "Save Page"}
          </button>
          <button onClick={onClose} className="text-sm text-white/60 hover:text-white self-center">Cancel</button>
        </div>
      </div>
    </div>
  );
}
