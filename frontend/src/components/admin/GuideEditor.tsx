import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  api, type Guide, type GuideSection, type GuideBlockType, type GuideQuickFact,
  type GuideComparisonRow, type GuideFAQ, type GuideExternalLink,
} from "@/lib/admin-api";
import { EditableImage } from "@/components/admin/EditableImage";
import { RichTextArea, RichTextInput } from "@/components/admin/RichTextField";
import mandala from "@/assets/mandala.png";

const FALLBACK_IMAGE = "https://placehold.co/1200x700/2a1500/e6a020?text=Click+to+add+photo";
const TAGS = ["Local", "Catering", "Events", "Dining"];
const BANNER_ICONS = [
  "", "fine-dining", "ramen", "pizza", "smallplates", "bakery", "pub", "thai", "vietnamese", "malaysian", "middleeastern", "lebanese",
];

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 outline-none focus:border-amber-500";
const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1";
const cardCls = "rounded-2xl bg-white border border-stone-200 shadow-sm p-5 md:p-6 mb-5";
const heroInputBase = "bg-transparent outline-none border-b-2 border-dashed border-transparent hover:border-white/30 focus:border-white/70 transition-colors";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function todayDisplay() {
  return new Date().toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export function GuideEditor({
  guide, onClose, onSaved,
}: {
  guide: Guide | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [slug, setSlug] = useState(guide?.slug ?? "");
  const [title, setTitle] = useState(guide?.title ?? "");
  const [metaTitle, setMetaTitle] = useState(guide?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(guide?.metaDescription ?? "");
  const [tag, setTag] = useState(guide?.tag ?? "Dining");
  const [guideType, setGuideType] = useState<"normal" | "listicle">(guide?.guideType ?? "normal");
  const [publishedDate, setPublishedDate] = useState(guide?.publishedDate ?? todayIso());
  const [publishedDateDisplay, setPublishedDateDisplay] = useState(guide?.publishedDateDisplay ?? todayDisplay());
  const [updatedDate, setUpdatedDate] = useState(guide?.updatedDate ?? todayIso());
  const [updatedDateDisplay, setUpdatedDateDisplay] = useState(guide?.updatedDateDisplay ?? todayDisplay());
  const [excerpt, setExcerpt] = useState(guide?.excerpt ?? "");
  const [intro, setIntro] = useState(guide?.intro ?? "");
  const [quickAnswer, setQuickAnswer] = useState(guide?.quickAnswer ?? "");
  const [quickAnswerVisible, setQuickAnswerVisible] = useState(!!guide?.quickAnswer);
  const [heroImage, setHeroImage] = useState(guide?.heroImage ?? "");
  const [heroImageAlt, setHeroImageAlt] = useState(guide?.heroImageAlt ?? "");
  const [ctaLabel, setCtaLabel] = useState(guide?.ctaLabel ?? "Book a Table");
  const [ctaHref, setCtaHref] = useState(guide?.ctaHref ?? "/book-a-table");
  const [published, setPublished] = useState(guide?.published ?? true);

  const [quickFacts, setQuickFacts] = useState<GuideQuickFact[]>(guide?.quickFacts ?? []);
  const [compTitle, setCompTitle] = useState(guide?.comparisonTable?.title ?? "Compare at a Glance");
  const [compNote, setCompNote] = useState(guide?.comparisonTable?.note ?? "");
  const [compRows, setCompRows] = useState<GuideComparisonRow[]>(guide?.comparisonTable?.rows ?? []);
  const [sections, setSections] = useState<GuideSection[]>(guide?.sections ?? [
    { heading: "1. Restaurant Name — Suburb", body: ["A short description."], bullets: ["Best for: ..."] },
  ]);
  const [faq, setFaq] = useState<GuideFAQ[]>(guide?.faq ?? []);
  const [externalLinks, setExternalLinks] = useState<GuideExternalLink[]>(guide?.externalLinks ?? []);
  const [relatedSlugsText, setRelatedSlugsText] = useState((guide?.relatedSlugs ?? []).join(", "));

  const [validationError, setValidationError] = useState("");

  const save = useMutation({
    mutationFn: () => {
      const data = {
        title, metaTitle, metaDescription, tag, guideType,
        publishedDate, publishedDateDisplay, updatedDate, updatedDateDisplay,
        excerpt, intro,
        quickAnswer: quickAnswer || null,
        heroImage: heroImage || null,
        heroImageAlt: heroImageAlt || null,
        quickFacts: quickFacts.length ? quickFacts : null,
        comparisonTable: compRows.length ? { title: compTitle, note: compNote || undefined, rows: compRows } : null,
        sections,
        externalLinks: externalLinks.length ? externalLinks : null,
        faq,
        relatedSlugs: relatedSlugsText.split(",").map((s) => s.trim()).filter(Boolean),
        ctaLabel, ctaHref, published,
      };
      return guide
        ? api.patch(`/api/guides/${guide.id}`, data)
        : api.post("/api/guides", { ...data, slug });
    },
    onSuccess: onSaved,
    onError: (err: unknown) => {
      setValidationError(err instanceof Error ? err.message : "Could not save guide — please try again.");
    },
  });

  function handleSaveClick() {
    if (!title.trim()) { setValidationError("Title is required before saving."); return; }
    if (!guide && !slug.trim()) { setValidationError("A URL slug is required for a new guide (top-left field)."); return; }
    setValidationError("");
    save.mutate();
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-y-auto">
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3" style={{ background: "#1a0e00" }}>
        <div className="flex items-center gap-4">
          <p className="text-cream text-sm font-semibold tracking-wide uppercase">{guide ? "Editing" : "New"} Guide</p>
          {!guide && (
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
              placeholder="url-slug-for-this-guide"
              className="rounded-lg px-3 py-1.5 text-sm bg-white/10 text-white placeholder:text-white/40 outline-none border border-white/20 w-72"
            />
          )}
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (shown on the live site)
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-sm text-white/60 hover:text-white">Cancel</button>
          <button
            onClick={handleSaveClick}
            disabled={save.isPending}
            className="btn-gold !text-[12px] !px-5 !py-2"
          >
            {save.isPending ? "Saving…" : "Save Guide"}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-2.5">{validationError}</div>
        </div>
      )}

      {/* Live hero preview — styled exactly like the real guide page hero, edited in place */}
      <div className="relative bg-palace overflow-hidden pt-10 pb-8 px-6">
        <img src={mandala} alt="" aria-hidden className="pointer-events-none absolute -right-40 -top-32 w-[420px] opacity-[0.07]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="text-[11px] tracking-[0.3em] uppercase font-bold bg-transparent outline-none border border-white/20 rounded px-2 py-1"
              style={{ color: "#f5c14a" }}
            >
              {TAGS.map((t) => <option key={t} value={t} style={{ color: "#1a0e00" }}>{t}</option>)}
            </select>
            <span className="text-[11px] tracking-[0.3em] uppercase font-bold" style={{ color: "#f5c14a" }}>Guide · The Grand Palace, Sydney CBD</span>
          </div>
          <RichTextArea
            value={title}
            onChange={setTitle}
            placeholder="Guide Title (H1)"
            allowBlocks={false}
            rows={2}
            className={`font-display text-3xl md:text-[2.4rem] leading-[1.15] text-gold-gradient w-full resize-none ${heroInputBase}`}
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Excerpt — shown on the /guides listing card and under the title"
            rows={2}
            className={`text-cream/60 text-[14.5px] leading-relaxed w-full resize-none mt-3 ${heroInputBase}`}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Guide Type */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-1">Guide Type</p>
          <p className="text-[12px] text-stone-500 mb-4">Controls which template renders this guide on the live site. Switching types is safe — no content is lost.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {([
              { value: "normal" as const, title: "Normal Guide", desc: "Simple single-column article — intro, sections, FAQ. No ranked cards or comparison table." },
              { value: "listicle" as const, title: "Listicle Guide", desc: "Ranked-card grid + \"Compare at a Glance\" table — the \"Best N Restaurants\" style layout." },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGuideType(opt.value)}
                className={`text-left rounded-xl border-2 p-4 transition ${
                  guideType === opt.value ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <p className="font-semibold text-sm text-stone-900 mb-1">{opt.title}</p>
                <p className="text-[12px] text-stone-500 leading-relaxed">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-1">Hero Image</p>
          <p className="text-[12px] text-stone-500 mb-4">Full-width photo shown below the hero band, and used as the og:image / social share image. Optional, but strongly recommended.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Photo</label>
              <EditableImage
                value={heroImage}
                onChange={setHeroImage}
                placeholder={FALLBACK_IMAGE}
                className="w-full aspect-[21/9] rounded-lg overflow-hidden border border-stone-200"
                imgClassName="w-full h-full object-cover"
              />
            </div>
            <div>
              <label className={labelCls}>Image alt text</label>
              <input className={inputCls} value={heroImageAlt} onChange={(e) => setHeroImageAlt(e.target.value)} placeholder="Describe what's actually in the photo" />
            </div>
          </div>
        </div>

        {/* Basics */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-4">Basics & SEO</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Meta Title</label><input className={inputCls} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
            <div><label className={labelCls}>CTA Link</label><input className={inputCls} value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/book-a-table" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Meta Description</label><textarea className={inputCls} rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></div>
            <div><label className={labelCls}>Published Date (ISO)</label><input className={inputCls} value={publishedDate} onChange={(e) => setPublishedDate(e.target.value)} placeholder="2026-07-27" /></div>
            <div><label className={labelCls}>Published Date (display)</label><input className={inputCls} value={publishedDateDisplay} onChange={(e) => setPublishedDateDisplay(e.target.value)} placeholder="Jul 27, 2026" /></div>
            <div><label className={labelCls}>Updated Date (ISO)</label><input className={inputCls} value={updatedDate} onChange={(e) => setUpdatedDate(e.target.value)} /></div>
            <div><label className={labelCls}>Updated Date (display)</label><input className={inputCls} value={updatedDateDisplay} onChange={(e) => setUpdatedDateDisplay(e.target.value)} /></div>
            <div><label className={labelCls}>CTA Label</label><input className={inputCls} value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Related guide slugs (comma-separated)</label><input className={inputCls} value={relatedSlugsText} onChange={(e) => setRelatedSlugsText(e.target.value)} placeholder="best-vegan-restaurant-sydney, jain-restaurants-sydney" /></div>
          </div>
        </div>

        {/* Intro + optional Quick Answer callout — styled like the real page body */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-3">Intro</p>
          <RichTextArea className={inputCls} rows={3} value={intro} onChange={setIntro} placeholder="Intro paragraph, shown right under the hero" />

          <div className="mt-4">
            {quickAnswer || quickAnswerVisible ? (
              <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Quick Answer (AEO callout)</p>
                  <button className="text-red-500 text-xs font-semibold" onClick={() => { setQuickAnswer(""); setQuickAnswerVisible(false); }}>Remove</button>
                </div>
                <RichTextArea className={inputCls} rows={2} value={quickAnswer} onChange={setQuickAnswer} placeholder="A direct, quotable answer to the guide's main question" />
              </div>
            ) : (
              <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setQuickAnswerVisible(true)}>+ Add Quick Answer callout</button>
            )}
          </div>
        </div>

        {/* Quick Facts */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-1">Quick Facts</p>
          <p className="text-[12px] text-stone-500 mb-4">Small label/value pairs shown in the hero "At a Glance" style panel.</p>
          {quickFacts.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className={inputCls} placeholder="Label" value={f.label} onChange={(e) => setQuickFacts((prev) => prev.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
              <input className={inputCls} placeholder="Value" value={f.value} onChange={(e) => setQuickFacts((prev) => prev.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} />
              <button className="text-red-500 text-xs shrink-0" onClick={() => setQuickFacts((prev) => prev.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setQuickFacts((prev) => [...prev, { label: "", value: "" }])}>+ Add Fact</button>
        </div>

        {/* Comparison Table — fully optional, matches the real page: no rows = no table rendered */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-1">
            <p className="font-display text-lg text-stone-900">Comparison Table</p>
            {compRows.length > 0 && (
              <button className="text-red-500 text-xs font-semibold" onClick={() => setCompRows([])}>Remove Table</button>
            )}
          </div>
          <p className="text-[12px] text-stone-500 mb-4">Optional — leave with no rows to skip this section entirely on the live page.</p>
          {compRows.length === 0 ? (
            <button className="btn-outline-gold !text-[11px] !px-4 !py-2" onClick={() => setCompRows([{ name: "", area: "", style: "", dietary: "", goodForGroups: false }])}>+ Add Comparison Table</button>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Table Title</label><input className={inputCls} value={compTitle} onChange={(e) => setCompTitle(e.target.value)} /></div>
                <div><label className={labelCls}>Note (optional)</label><input className={inputCls} value={compNote} onChange={(e) => setCompNote(e.target.value)} /></div>
              </div>
              {compRows.map((row, i) => (
                <div key={i} className="rounded-lg border border-stone-200 p-3 mb-2 grid sm:grid-cols-6 gap-2 items-center">
                  <input className={inputCls} placeholder="Restaurant name" value={row.name} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                  <input className={inputCls} placeholder="Area" value={row.area} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, area: e.target.value } : x))} />
                  <input className={inputCls} placeholder="Style" value={row.style} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, style: e.target.value } : x))} />
                  <input className={`${inputCls} sm:col-span-2`} placeholder="Dietary highlights" value={row.dietary} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, dietary: e.target.value } : x))} />
                  <div className="flex items-center gap-2 text-[11px]">
                    <label className="flex items-center gap-1"><input type="checkbox" checked={row.goodForGroups} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, goodForGroups: e.target.checked } : x))} />Groups</label>
                    <label className="flex items-center gap-1"><input type="checkbox" checked={!!row.highlight} onChange={(e) => setCompRows((prev) => prev.map((x, idx) => idx === i ? { ...x, highlight: e.target.checked } : x))} />Our Pick</label>
                  </div>
                  <button className="text-red-500 text-xs sm:col-span-6 text-right" onClick={() => setCompRows((prev) => prev.filter((_, idx) => idx !== i))}>Remove Row</button>
                </div>
              ))}
              <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setCompRows((prev) => [...prev, { name: "", area: "", style: "", dietary: "", goodForGroups: false }])}>+ Add Row</button>
            </>
          )}
        </div>

        {/* Sections / Listings */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-1">Sections & Listings</p>
          <p className="text-[12px] text-stone-500 mb-4">
            Pick a block type per section: <strong>Listing</strong> is a numbered ranked card — pick it from the dropdown and it's auto-numbered by
            order, or type a heading like "1. Restaurant — Suburb" for exact numbering,
            <strong> Text</strong> is a plain heading + paragraphs section, <strong>Box</strong> is a highlighted callout, and{" "}
            <strong>Row</strong> lays out short items side by side. In any paragraph, start a line with <code>## </code> for a subheading
            or <code>### </code> for a smaller one. Select text in any field's toolbar to add a link, a highlight, a custom colour, or
            resize it — headings and paragraphs both support all of these.
          </p>
          {sections.map((sec, i) => {
            const blockType = sec.blockType ?? (/^\d+\.\s*/.test(sec.heading) ? "listing" : "text");
            const setSec = (patch: Partial<typeof sec>) => setSections((prev) => prev.map((x, idx) => idx === i ? { ...x, ...patch } : x));
            return (
              <div key={i} className="rounded-xl border border-stone-200 p-4 mb-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <select className={`${inputCls} w-44 shrink-0`} value={blockType} onChange={(e) => setSec({ blockType: e.target.value as GuideBlockType })}>
                    <option value="listing">Listing (ranked card)</option>
                    <option value="text">Text section</option>
                    <option value="box">Box / Callout</option>
                    <option value="row">Row (side-by-side items)</option>
                  </select>
                  <button className="text-red-500 text-xs font-semibold shrink-0" onClick={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}>Remove Section</button>
                </div>
                <div className="mb-3">
                  <RichTextInput className={inputCls} placeholder={blockType === "listing" ? "Heading (e.g. 1. Restaurant Name — Suburb)" : "Heading"} value={sec.heading} onChange={(v) => setSec({ heading: v })} />
                </div>

                {blockType === "listing" && (
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>Photo (optional — overrides icon banner)</label>
                      <EditableImage
                        value={sec.image ?? ""}
                        onChange={(url) => setSec({ image: url })}
                        placeholder={FALLBACK_IMAGE}
                        className="w-full aspect-[21/9] rounded-lg overflow-hidden border border-stone-200"
                        imgClassName="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Cuisine icon banner (used when no photo)</label>
                      <select className={inputCls} value={sec.bannerIcon ?? ""} onChange={(e) => setSec({ bannerIcon: e.target.value || undefined })}>
                        {BANNER_ICONS.map((b) => <option key={b} value={b}>{b || "(none)"}</option>)}
                      </select>
                      <label className={`${labelCls} mt-3`}>Image alt text</label>
                      <input className={inputCls} value={sec.imageAlt ?? ""} onChange={(e) => setSec({ imageAlt: e.target.value })} />
                    </div>
                  </div>
                )}

                {blockType === "listing" && (
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>Address</label>
                      <input className={inputCls} value={sec.address ?? ""} onChange={(e) => setSec({ address: e.target.value })} placeholder="e.g. 12 George St, Surry Hills NSW" />
                    </div>
                    <div>
                      <label className={labelCls}>Timing</label>
                      <input className={inputCls} value={sec.timing ?? ""} onChange={(e) => setSec({ timing: e.target.value })} placeholder="e.g. Lunch & dinner, 7 days" />
                    </div>
                  </div>
                )}

                {blockType === "listing" && (
                  <label className="flex items-center gap-2 mb-3 text-[12.5px] text-stone-600">
                    <input
                      type="checkbox"
                      checked={sec.showFactsTable !== false}
                      onChange={(e) => setSec({ showFactsTable: e.target.checked })}
                    />
                    Show the Address/Timing facts table above (only appears if at least one of them has a value).
                  </label>
                )}

                {blockType !== "row" && (
                  <>
                    <label className={labelCls}>Body paragraph(s)</label>
                    {sec.body.map((p, j) => (
                      <div key={j} className="flex items-start gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <RichTextArea className={inputCls} rows={2} value={p} onChange={(v) => setSec({ body: sec.body.map((b, bi) => bi === j ? v : b) })} />
                        </div>
                        <button className="text-red-500 text-xs shrink-0 mt-6" onClick={() => setSec({ body: sec.body.filter((_, bi) => bi !== j) })}>✕</button>
                      </div>
                    ))}
                    <button className="text-[12px] text-amber-700 font-semibold mb-3" onClick={() => setSec({ body: [...sec.body, ""] })}>+ Add paragraph</button>

                    <label className={`${labelCls} mt-2`}>
                      Bullet points — each one gets a Title and a Description, shown as a styled card (same look as Features/Dietary).
                    </label>
                    {(sec.bulletItems ?? []).map((item, j) => {
                      const items = sec.bulletItems ?? [];
                      const moveItem = (dir: -1 | 1) => {
                        const target = j + dir;
                        if (target < 0 || target >= items.length) return;
                        const next = [...items];
                        [next[j], next[target]] = [next[target], next[j]];
                        setSec({ bulletItems: next });
                      };
                      return (
                        <div key={j} className="flex items-start gap-2 mb-2 rounded-lg border border-stone-200 p-2.5">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <RichTextInput
                              className={inputCls}
                              value={item.title}
                              onChange={(v) => setSec({ bulletItems: items.map((it, ii) => ii === j ? { ...it, title: v } : it) })}
                              placeholder="Title (e.g. Free Parking)"
                            />
                            <RichTextArea
                              className={inputCls}
                              rows={2}
                              value={item.description}
                              onChange={(v) => setSec({ bulletItems: items.map((it, ii) => ii === j ? { ...it, description: v } : it) })}
                              placeholder="Description (e.g. Plenty of parking spaces available for visitors.)"
                            />
                          </div>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button className="text-stone-400 hover:text-stone-700 text-xs disabled:opacity-30" disabled={j === 0} onClick={() => moveItem(-1)} title="Move up">↑</button>
                            <button className="text-stone-400 hover:text-stone-700 text-xs disabled:opacity-30" disabled={j === items.length - 1} onClick={() => moveItem(1)} title="Move down">↓</button>
                            <button className="text-red-500 text-xs" onClick={() => setSec({ bulletItems: items.filter((_, ii) => ii !== j) })} title="Delete">✕</button>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      className="text-[12px] text-amber-700 font-semibold"
                      onClick={() => setSec({ bulletItems: [...(sec.bulletItems ?? []), { title: "", description: "" }] })}
                    >
                      + Add bullet point
                    </button>
                  </>
                )}

                {blockType === "row" && (
                  <>
                    <label className={labelCls}>Items — each renders as one card in the row</label>
                    {(sec.items ?? []).map((it, j) => (
                      <div key={j} className="flex gap-2 mb-1.5">
                        <input className={inputCls} value={it} onChange={(e) => setSec({ items: (sec.items ?? []).map((x, xi) => xi === j ? e.target.value : x) })} />
                        <button className="text-red-500 text-xs shrink-0" onClick={() => setSec({ items: (sec.items ?? []).filter((_, xi) => xi !== j) })}>✕</button>
                      </div>
                    ))}
                    <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setSec({ items: [...(sec.items ?? []), ""] })}>+ Add item</button>
                  </>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-outline-gold !text-[11px] !px-4 !py-2"
              onClick={() => setSections((prev) => [...prev, { blockType: "listing", heading: `${prev.length + 1}. New Restaurant — Suburb`, body: [""], bulletItems: [{ title: "", description: "" }] }])}
            >
              + Add Listing
            </button>
            <button
              className="btn-outline-gold !text-[11px] !px-4 !py-2"
              onClick={() => setSections((prev) => [...prev, { blockType: "text", heading: "New Section", body: [""] }])}
            >
              + Add Text Section
            </button>
            <button
              className="btn-outline-gold !text-[11px] !px-4 !py-2"
              onClick={() => setSections((prev) => [...prev, { blockType: "box", heading: "New Callout", body: [""] }])}
            >
              + Add Box / Callout
            </button>
            <button
              className="btn-outline-gold !text-[11px] !px-4 !py-2"
              onClick={() => setSections((prev) => [...prev, { blockType: "row", heading: "New Row", body: [], items: ["Item one", "Item two", "Item three"] }])}
            >
              + Add Row
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-4">FAQ</p>
          {faq.map((f, i) => (
            <div key={i} className="rounded-lg border border-stone-200 p-3 mb-2">
              <input className={`${inputCls} mb-2`} placeholder="Question" value={f.q} onChange={(e) => setFaq((prev) => prev.map((x, idx) => idx === i ? { ...x, q: e.target.value } : x))} />
              <RichTextArea className={inputCls} rows={2} placeholder="Answer" value={f.a} onChange={(v) => setFaq((prev) => prev.map((x, idx) => idx === i ? { ...x, a: v } : x))} />
              <button className="text-red-500 text-xs mt-1" onClick={() => setFaq((prev) => prev.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          ))}
          <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setFaq((prev) => [...prev, { q: "", a: "" }])}>+ Add FAQ</button>
        </div>

        {/* External Links */}
        <div className={cardCls}>
          <p className="font-display text-lg text-stone-900 mb-1">External Resources</p>
          <p className="text-[12px] text-stone-500 mb-4">Real, authoritative outbound links only — used for SEO/trust, not filler.</p>
          {externalLinks.map((l, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-2 mb-2">
              <input className={inputCls} placeholder="Label" value={l.label} onChange={(e) => setExternalLinks((prev) => prev.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} />
              <input className={inputCls} placeholder="https://..." value={l.href} onChange={(e) => setExternalLinks((prev) => prev.map((x, idx) => idx === i ? { ...x, href: e.target.value } : x))} />
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Source name" value={l.source} onChange={(e) => setExternalLinks((prev) => prev.map((x, idx) => idx === i ? { ...x, source: e.target.value } : x))} />
                <button className="text-red-500 text-xs shrink-0" onClick={() => setExternalLinks((prev) => prev.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            </div>
          ))}
          <button className="text-[12px] text-amber-700 font-semibold" onClick={() => setExternalLinks((prev) => [...prev, { label: "", href: "", source: "" }])}>+ Add Link</button>
        </div>

        {validationError && (
          <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4 text-center">{validationError}</div>
        )}
        <div className="flex justify-center gap-3 pb-8">
          <button
            onClick={handleSaveClick}
            disabled={save.isPending}
            className="btn-gold !text-[13px] !px-8 !py-3"
          >
            {save.isPending ? "Saving…" : "Save Guide"}
          </button>
          <button onClick={onClose} className="text-sm text-stone-500 hover:text-stone-800 self-center">Cancel</button>
        </div>
      </div>
    </div>
  );
}
