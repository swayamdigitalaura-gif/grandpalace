export type PageSection = { heading: string; priceTag?: string; intro?: string; items: string[]; description?: string; tags?: string[]; character?: string; itemIcons?: ("pin" | "clock" | "phone" | "navigation" | "message" | "mail")[] };

export function SectionsEditor({ sections, onChange }: { sections: PageSection[]; onChange: (s: PageSection[]) => void }) {
  function updateSection(i: number, patch: Partial<PageSection>) {
    onChange(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSection(i: number) {
    onChange(sections.filter((_, idx) => idx !== i));
  }
  function addSection() {
    onChange([...sections, { heading: "New Section", priceTag: "", intro: "", items: ["First detail"] }]);
  }

  function updateItem(sIdx: number, iIdx: number, value: string) {
    const items = sections[sIdx].items.map((it, idx) => (idx === iIdx ? value : it));
    updateSection(sIdx, { items });
  }
  function removeItem(sIdx: number, iIdx: number) {
    updateSection(sIdx, { items: sections[sIdx].items.filter((_, idx) => idx !== iIdx) });
  }
  function addItem(sIdx: number) {
    updateSection(sIdx, { items: [...sections[sIdx].items, ""] });
  }

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-semibold block mb-2" style={{ color: "#7a5020" }}>
        Detail Sections
      </label>
      <div className="space-y-3">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="rounded-lg border p-3" style={{ borderColor: "rgba(200,140,30,0.25)", background: "#fdf6e4" }}>
            <div className="flex gap-2 mb-2">
              <input
                value={section.heading}
                onChange={(e) => updateSection(sIdx, { heading: e.target.value })}
                placeholder="Section heading"
                className="flex-1 rounded-lg px-3 py-2 text-sm bg-white outline-none border font-semibold"
                style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
              />
              <input
                value={section.priceTag ?? ""}
                onChange={(e) => updateSection(sIdx, { priceTag: e.target.value })}
                placeholder="Price tag (optional)"
                className="w-36 rounded-lg px-3 py-2 text-sm bg-white outline-none border"
                style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
              />
              <button type="button" onClick={() => removeSection(sIdx)} className="text-red-600 text-xs font-semibold px-2">
                Remove
              </button>
            </div>
            <input
              value={section.intro ?? ""}
              onChange={(e) => updateSection(sIdx, { intro: e.target.value })}
              placeholder="Section intro (optional, one line)"
              className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border mb-2"
              style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
            />
            <div className="space-y-1.5">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateItem(sIdx, iIdx, e.target.value)}
                    placeholder="Detail line"
                    className="flex-1 rounded-lg px-3 py-1.5 text-sm bg-white outline-none border"
                    style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
                  />
                  <button type="button" onClick={() => removeItem(sIdx, iIdx)} className="text-red-600 text-xs px-1">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => addItem(sIdx)} className="text-[11px] text-amber-700 font-semibold mt-2">
              + Add detail line
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addSection} className="btn-outline-gold !text-[11px] !px-3 !py-1.5 mt-3">
        + Add Section
      </button>
    </div>
  );
}
