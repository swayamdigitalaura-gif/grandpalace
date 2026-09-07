import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, type MenuCategory, type MenuItem, type MenuTypeInfo } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Modal } from "@/components/admin/Modal";

export const Route = createFileRoute("/admin/menu")({
  component: AdminMenu,
});

// Friendly labels for the menus that ship with the site — any admin-created
// menu type falls back to whatever label was given when it was created.
const KNOWN_LABELS: Record<string, string> = {
  "a-la-carte": "À la Carte",
  "set-menu": "Set Menu",
  "beverages": "Beverages",
};

function AdminMenu() {
  const [menuType, setMenuType] = useState("a-la-carte");
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | "new" | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | "new" | null>(null);
  const [creatingMenu, setCreatingMenu] = useState(false);
  const queryClient = useQueryClient();

  const { data: menuTypes } = useQuery({
    queryKey: ["menu-types"],
    queryFn: () => api.get<MenuTypeInfo[]>("/api/menu"),
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-menu", menuType],
    queryFn: () => api.get<MenuCategory[]>(`/api/menu/admin/${menuType}`),
  });

  useEffect(() => {
    if (categories?.length && !categories.some((c) => c.id === activeCatId)) {
      setActiveCatId(categories[0].id);
    }
    if (categories?.length === 0) setActiveCatId(null);
  }, [categories, activeCatId]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-menu", menuType] });
  }
  function invalidateMenuTypes() {
    queryClient.invalidateQueries({ queryKey: ["menu-types"] });
  }

  const activeCategory = categories?.find((c) => c.id === activeCatId) ?? null;

  const tabs = (menuTypes ?? []).map((t) => ({ id: t.menuType, label: KNOWN_LABELS[t.menuType] ?? t.label }));

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Menu</h1>
      <p className="text-sm text-stone-500 mb-6">Edit the categories and dishes shown on the public menu pages.</p>

      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {tabs.map((mt) => (
          <button
            key={mt.id}
            onClick={() => { setMenuType(mt.id); setActiveCatId(null); }}
            className="px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wide transition"
            style={
              menuType === mt.id
                ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }
            }
          >
            {mt.label}
          </button>
        ))}
        <button onClick={() => setCreatingMenu(true)} className="btn-outline-gold !text-[11px] !px-4 !py-2">
          + New Menu
        </button>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}

      <div className="flex gap-6 items-start">
        {/* ── category list (left) ── */}
        <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="max-h-[560px] overflow-y-auto">
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className="w-full text-left px-4 py-3 border-b border-stone-100 last:border-0 flex items-center gap-3 transition-colors"
                style={activeCatId === cat.id ? { background: "#fdf6e4" } : undefined}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100" style={!cat.active ? { opacity: 0.4 } : undefined}>
                  {cat.imageUrl && <img src={cat.imageUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate flex items-center gap-1.5" style={{ color: cat.active ? "#1a0e00" : "#a8a29e" }}>
                    {cat.label}
                    {!cat.active && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-500">Inactive</span>}
                  </p>
                  <p className="text-[11px] text-stone-500">{cat.items.length} items</p>
                </div>
              </button>
            ))}
            {categories?.length === 0 && (
              <p className="px-4 py-6 text-[12px] text-stone-400 text-center">No categories yet</p>
            )}
          </div>
          <button
            onClick={() => setEditingCategory("new")}
            className="w-full text-center py-3 text-[12px] font-semibold text-amber-700 border-t border-stone-100"
          >
            + Add Category
          </button>
        </div>

        {/* ── active category detail (right) ── */}
        {activeCategory && (
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                {activeCategory.imageUrl && <img src={activeCategory.imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-xl" style={{ color: "#1a0e00" }}>{activeCategory.label}</p>
                <p className="text-[12px] text-stone-500">
                  {activeCategory.slug} {activeCategory.tag && `· ${activeCategory.tag}`} · {activeCategory.items.length} items
                </p>
              </div>
              <ActiveToggle
                active={activeCategory.active}
                onToggle={() => api.patch(`/api/menu/categories/${activeCategory.id}`, { active: !activeCategory.active }).then(invalidate)}
              />
              <button onClick={() => setEditingCategory(activeCategory)} className="btn-outline-gold !text-[11px] !px-4 !py-2">
                Edit Category
              </button>
              <button
                onClick={() => { if (confirm(`Delete category "${activeCategory.label}" and all its items?`)) {
                  api.delete(`/api/menu/categories/${activeCategory.id}`).then(invalidate);
                } }}
                className="text-[12px] text-red-600 font-semibold"
              >
                Delete
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCategory.items.map((item) => (
                <ItemCard key={item.id} item={item} onEdit={() => setEditingItem(item)} onChanged={invalidate} />
              ))}
              <button
                onClick={() => setEditingItem("new")}
                className="rounded-xl border-2 border-dashed border-amber-300 text-amber-700 text-sm font-semibold flex items-center justify-center min-h-[140px] hover:bg-amber-50 transition-colors"
              >
                + Add Item
              </button>
            </div>
          </div>
        )}
      </div>

      {editingCategory && (
        <CategoryModal
          menuType={menuType}
          category={editingCategory === "new" ? null : editingCategory}
          nextSort={categories?.length ?? 0}
          onClose={() => setEditingCategory(null)}
          onSaved={(newId) => { invalidate(); setEditingCategory(null); if (newId) setActiveCatId(newId); }}
        />
      )}

      {editingItem && activeCategory && (
        <ItemModal
          categoryId={activeCategory.id}
          item={editingItem === "new" ? null : editingItem}
          nextSort={activeCategory.items.length}
          onClose={() => setEditingItem(null)}
          onSaved={() => { invalidate(); setEditingItem(null); }}
        />
      )}

      {creatingMenu && (
        <NewMenuModal
          onClose={() => setCreatingMenu(false)}
          onCreated={(slug) => { invalidateMenuTypes(); setCreatingMenu(false); setMenuType(slug); setActiveCatId(null); }}
        />
      )}
    </div>
  );
}

function ActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full flex-shrink-0"
      style={active
        ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a", border: "1px solid rgba(74,140,58,0.3)" }
        : { background: "rgba(160,90,10,0.1)", color: "#a05a0a", border: "1px solid rgba(160,90,10,0.3)" }}
    >
      {active ? "● Active" : "○ Inactive"}
    </button>
  );
}

function NewMenuModal({ onClose, onCreated }: { onClose: () => void; onCreated: (slug: string) => void }) {
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");

  const create = useMutation({
    mutationFn: () =>
      api.post(`/api/menu/${slug}/categories`, {
        slug: "general",
        label: "General",
        menuLabel: label,
        sortOrder: 0,
      }),
    onSuccess: () => onCreated(slug),
  });

  return (
    <Modal title="New Menu" onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
        <p className="text-[13px] text-stone-500">
          Creates a new menu with a starter "General" category — rename or add more categories once it's created.
          It'll be visible at <code className="bg-stone-100 px-1 rounded">/menu/{slug || "your-slug"}</code> once that page is wired up.
        </p>
        <TextField label="Menu name" value={label} onChange={setLabel} placeholder="e.g. Kids Menu" required />
        <TextField label="URL slug" value={slug} onChange={setSlug} placeholder="e.g. kids-menu" required />
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-gold !text-[12px] !px-5 !py-2.5" disabled={create.isPending || !slug || !label}>
            {create.isPending ? "Creating…" : "Create Menu"}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function ItemCard({ item, onEdit, onChanged }: { item: MenuItem; onEdit: () => void; onChanged: () => void }) {
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/menu/items/${item.id}`),
    onSuccess: onChanged,
  });
  const toggleActive = useMutation({
    mutationFn: () => api.patch(`/api/menu/items/${item.id}`, { active: !item.active }),
    onSuccess: onChanged,
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col" style={!item.active ? { opacity: 0.55 } : undefined}>
      <div className="h-32 bg-stone-100 flex-shrink-0 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">No photo</div>
        )}
        {!item.active && (
          <span className="absolute top-2 left-2 text-[9px] uppercase font-bold px-2 py-1 rounded-full bg-stone-900/70 text-white">
            Inactive
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-sm font-semibold leading-snug" style={{ color: "#1a0e00" }}>
          {item.name} {item.badge && <span className="text-amber-600 text-[10px] ml-1">★ {item.badge}</span>}
        </p>
        {item.description && <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 flex-1">{item.description}</p>}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100">
          <p className="text-sm font-bold" style={{ color: "#c8860a" }}>{item.price}</p>
          <div className="flex gap-3 items-center">
            <button onClick={() => toggleActive.mutate()} className="text-[11px] text-stone-500 font-semibold">
              {item.active ? "Deactivate" : "Activate"}
            </button>
            <button onClick={onEdit} className="text-[11px] text-amber-700 font-semibold">Edit</button>
            <button
              onClick={() => { if (confirm(`Delete "${item.name}"?`)) remove.mutate(); }}
              className="text-[11px] text-red-600 font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({
  menuType, category, nextSort, onClose, onSaved,
}: {
  menuType: string;
  category: MenuCategory | null;
  nextSort: number;
  onClose: () => void;
  onSaved: (newId?: string) => void;
}) {
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [label, setLabel] = useState(category?.label ?? "");
  const [tag, setTag] = useState(category?.tag ?? "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [active, setActive] = useState(category?.active ?? true);

  const save = useMutation({
    mutationFn: async () => {
      if (category) {
        await api.patch(`/api/menu/categories/${category.id}`, { label, tag: tag || null, imageUrl: imageUrl || null, active });
        return category.id;
      }
      const created = await api.post<MenuCategory>(`/api/menu/${menuType}/categories`, { slug, label, tag: tag || null, imageUrl: imageUrl || null, active, sortOrder: nextSort });
      return created.id;
    },
    onSuccess: (id) => onSaved(id),
  });

  return (
    <Modal title={category ? "Edit Category" : "New Category"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
        <ImageUploadField label="Category Banner Photo" value={imageUrl} onChange={setImageUrl} wide />
        {!category && (
          <TextField label="URL slug" value={slug} onChange={setSlug} placeholder="e.g. app-veg" required />
        )}
        <TextField label="Label" value={label} onChange={setLabel} placeholder="e.g. Appetizers · Vegetarian" required />
        <TextField label="Tag" value={tag} onChange={setTag} placeholder="veg / non-veg / vegan / jain / mixed" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (shown on the live site)
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-gold !text-[12px] !px-5 !py-2.5" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function ItemModal({
  categoryId, item, nextSort, onClose, onSaved,
}: {
  categoryId: string;
  item: MenuItem | null;
  nextSort: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item?.price ?? "");
  const [badge, setBadge] = useState(item?.badge ?? "");
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? "");
  const [active, setActive] = useState(item?.active ?? true);
  const [extraJson, setExtraJson] = useState(JSON.stringify(item?.extra ?? {}, null, 2));
  const [extraError, setExtraError] = useState("");

  const save = useMutation({
    mutationFn: () => {
      let extra = item?.extra ?? null;
      try {
        extra = JSON.parse(extraJson);
        setExtraError("");
      } catch {
        setExtraError("Extra fields JSON was invalid, so it was left unchanged — everything else still saved.");
      }
      const data = { name, description: description || null, price: price || null, badge: badge || null, imageUrl: imageUrl || null, active, extra };
      return item
        ? api.patch(`/api/menu/items/${item.id}`, data)
        : api.post(`/api/menu/categories/${categoryId}/items`, { ...data, sortOrder: nextSort });
    },
    onSuccess: onSaved,
  });

  return (
    <Modal title={item ? "Edit Dish" : "New Dish"} onClose={onClose}>
      <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-4">
        <ImageUploadField label="Dish Photo" value={imageUrl} onChange={setImageUrl} wide />
        <TextField label="Name" value={name} onChange={setName} required />
        <div className="grid grid-cols-2 gap-4">
          <TextField label="Price" value={price} onChange={setPrice} placeholder="$24.90" />
          <TextField label="Badge" value={badge} onChange={setBadge} placeholder="Chef's Special" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "#7a5020" }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border"
            style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "#7a5020" }}>
            Extra Fields (JSON — used for wine region/glass/bottle, cocktail base, spirit notes, drink variants, etc.)
          </label>
          <textarea
            value={extraJson}
            onChange={(e) => setExtraJson(e.target.value)}
            rows={5}
            className="w-full rounded-lg px-3 py-2 text-xs font-mono bg-white outline-none border"
            style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
          />
          {extraError && <p className="text-red-600 text-xs mt-1">{extraError}</p>}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active (shown on the live site)
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-gold !text-[12px] !px-5 !py-2.5" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={onClose} className="text-sm text-stone-500">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function TextField({
  label, value, onChange, placeholder, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "#7a5020" }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border"
        style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
      />
    </div>
  );
}
