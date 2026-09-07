import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type SitePage } from "@/lib/admin-api";
import { WhatsOnPageEditor } from "@/components/admin/WhatsOnPageEditor";

export const Route = createFileRoute("/admin/pages")({
  component: AdminPages,
});

function AdminPages() {
  const queryClient = useQueryClient();
  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => api.get<SitePage[]>("/api/pages/admin/all"),
  });
  const [editingPage, setEditingPage] = useState<SitePage | "new" | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>What's On Pages</h1>
      <p className="text-sm text-stone-500 mb-6">
        These are the offer pages linked from the "What's On" menu (e.g. Birthday Packages, Order Online).
        All pages share the same template — hero banner, sidebar photo, intro, detail sections, and two
        call-to-action buttons. Edits here go live on the site immediately.
      </p>

      <button onClick={() => setEditingPage("new")} className="btn-outline-gold !text-[11px] !px-4 !py-2 mb-6">
        + New What's On Page
      </button>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {pages?.map((page) => (
          <div key={page.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="h-32 bg-stone-100 flex-shrink-0">
              {page.heroImage ? (
                <img src={page.heroImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No hero photo</div>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm" style={{ color: "#1a0e00" }}>{page.emoji} {page.title}</p>
                <ActiveToggle
                  active={page.published}
                  onToggle={() => api.patch(`/api/pages/${page.id}`, { published: !page.published }).then(invalidate)}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 flex-1">/whats-on/{page.slug}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-stone-100">
                <button onClick={() => setEditingPage(page)} className="text-[12px] text-amber-700 font-semibold">Edit</button>
                <DeleteButton page={page} onDeleted={invalidate} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingPage && (
        <WhatsOnPageEditor
          page={editingPage === "new" ? null : editingPage}
          onClose={() => setEditingPage(null)}
          onSaved={() => { invalidate(); setEditingPage(null); }}
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
      {active ? "● Active" : "○ Inactive"}
    </button>
  );
}

function DeleteButton({ page, onDeleted }: { page: SitePage; onDeleted: () => void }) {
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/pages/${page.id}`),
    onSuccess: onDeleted,
  });
  return (
    <button
      onClick={() => { if (confirm(`Delete page "${page.title}"?`)) remove.mutate(); }}
      className="text-[12px] text-red-600 font-semibold"
    >
      Delete
    </button>
  );
}
