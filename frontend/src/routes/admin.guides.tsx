import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Guide } from "@/lib/admin-api";
import { GuideEditor } from "@/components/admin/GuideEditor";

export const Route = createFileRoute("/admin/guides")({
  component: AdminGuides,
});

function AdminGuides() {
  const queryClient = useQueryClient();
  const { data: guides, isLoading } = useQuery({
    queryKey: ["admin-guides"],
    queryFn: () => api.get<Guide[]>("/api/guides/admin/all"),
  });
  const [editingGuide, setEditingGuide] = useState<Guide | "new" | null>(null);
  const [search, setSearch] = useState("");

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-guides"] });
  }

  const filtered = (guides ?? []).filter((g) =>
    !search.trim() || g.title.toLowerCase().includes(search.toLowerCase()) || g.slug.toLowerCase().includes(search.toLowerCase())
  );

  const reorder = useMutation({
    mutationFn: async ({ a, b }: { a: Guide; b: Guide }) => {
      await Promise.all([
        api.patch(`/api/guides/${a.id}`, { sortOrder: b.sortOrder }),
        api.patch(`/api/guides/${b.id}`, { sortOrder: a.sortOrder }),
      ]);
    },
    onSuccess: invalidate,
  });

  function moveUp(i: number) {
    if (i === 0 || search.trim()) return; // reordering only makes sense on the full, unfiltered list
    reorder.mutate({ a: filtered[i], b: filtered[i - 1] });
  }
  function moveDown(i: number) {
    if (i === filtered.length - 1 || search.trim()) return;
    reorder.mutate({ a: filtered[i], b: filtered[i + 1] });
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Dining Guides</h1>
      <p className="text-sm text-stone-500 mb-1">
        Ranked-listicle guide articles (/guides/$slug) — hero, quick answer, comparison table, numbered
        restaurant cards, FAQ. Add a new guide to open the same editable template used by the existing ones.
      </p>
      <p className="text-sm text-stone-500 mb-6">
        Every guide shown on the live /guides page is listed here too — the ↑↓ arrows control the order they
        appear in on the site. "Draft" guides are only visible here until you publish them.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setEditingGuide("new")} className="btn-outline-gold !text-[11px] !px-4 !py-2 shrink-0">
          + Add Guide
        </button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides by title or slug…"
          className="flex-1 rounded-lg px-3 py-2 text-sm bg-white outline-none border border-stone-200 focus:border-amber-500"
        />
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {!isLoading && <p className="text-[11px] text-stone-400 mb-3">{filtered.length} guide{filtered.length === 1 ? "" : "s"}{search.trim() ? " matching" : " total"}</p>}

      <div className="space-y-2">
        {filtered.map((guide, i) => (
          <div key={guide.id} className="bg-white rounded-xl border border-stone-200 p-3 flex items-center gap-3">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => moveUp(i)} disabled={i === 0 || !!search.trim()} title="Move up"
                className="h-5 w-5 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 disabled:hover:border-stone-200 disabled:hover:text-stone-500 text-[10px]">▲</button>
              <button onClick={() => moveDown(i)} disabled={i === filtered.length - 1 || !!search.trim()} title="Move down"
                className="h-5 w-5 flex items-center justify-center rounded border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-30 disabled:hover:border-stone-200 disabled:hover:text-stone-500 text-[10px]">▼</button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm truncate" style={{ color: "#1a0e00" }}>{guide.title}</p>
                <ActiveToggle
                  active={guide.published}
                  onToggle={() => api.patch(`/api/guides/${guide.id}`, { published: !guide.published }).then(invalidate)}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                /guides/{guide.slug} · {guide.tag} · <span className={guide.guideType === "listicle" ? "text-amber-700 font-semibold" : ""}>{guide.guideType === "listicle" ? "Listicle" : "Normal"}</span>
              </p>
              <div className="flex gap-4 mt-2">
                <button onClick={() => setEditingGuide(guide)} className="text-[12px] text-amber-700 font-semibold">Edit</button>
                <DeleteButton guide={guide} onDeleted={invalidate} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingGuide && (
        <GuideEditor
          guide={editingGuide === "new" ? null : editingGuide}
          onClose={() => setEditingGuide(null)}
          onSaved={() => { invalidate(); setEditingGuide(null); }}
        />
      )}
    </div>
  );
}

function ActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
      style={active
        ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a", border: "1px solid rgba(74,140,58,0.3)" }
        : { background: "rgba(160,90,10,0.1)", color: "#a05a0a", border: "1px solid rgba(160,90,10,0.3)" }}
    >
      {active ? "● Published" : "○ Draft"}
    </button>
  );
}

function DeleteButton({ guide, onDeleted }: { guide: Guide; onDeleted: () => void }) {
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/guides/${guide.id}`),
    onSuccess: onDeleted,
  });
  return (
    <button
      onClick={() => { if (confirm(`Delete guide "${guide.title}"?`)) remove.mutate(); }}
      className="text-[12px] text-red-600 font-semibold"
    >
      Delete
    </button>
  );
}
