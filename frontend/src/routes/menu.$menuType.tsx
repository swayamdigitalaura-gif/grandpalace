import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { API_URL, type MenuCategory } from "@/lib/admin-api";

// Server-rendered — this used to be a bare useQuery with no loader, so the
// SSR response was always a "Loading menu…" shell with an empty category
// list, and the *real* content (or the 404 for a genuinely unknown menu
// type) only ever resolved after client-side hydration. Any menu slug not
// covered by a dedicated route (set-menu.tsx, beverages.tsx, etc.) landed
// here, so it silently 200'd for crawlers even when there was nothing to
// show. Same class of gap as whats-on.$slug.tsx — check for this pattern
// on any new dynamic route.
async function fetchMenu(menuType: string): Promise<MenuCategory[]> {
  const res = await fetch(`${API_URL}/api/menu/${encodeURIComponent(menuType)}`);
  if (!res.ok) return [];
  return res.json();
}

export const Route = createFileRoute("/menu/$menuType")({
  loader: async ({ params }) => {
    const categories = await fetchMenu(params.menuType);
    if (categories.length === 0) throw notFound();
    return categories;
  },
  head: ({ loaderData, params }) => {
    const menuLabel = loaderData?.[0]?.menuLabel || params.menuType;
    return { meta: [{ title: `${menuLabel} — The Grand Palace` }] };
  },
  component: GenericMenuPage,
});

const tagDot: Record<string, string> = {
  veg: "bg-green-500 border-green-600",
  "non-veg": "bg-red-500 border-red-600",
  vegan: "bg-emerald-500 border-emerald-600",
  jain: "bg-amber-500 border-amber-600",
  mixed: "bg-stone-300 border-stone-400",
};

function GenericMenuPage() {
  const { menuType } = Route.useParams();
  const categories = Route.useLoaderData();
  const menuLabel = categories[0]?.menuLabel || menuType;

  return (
    <PageShell crumbs={[{ label: "Menu", to: "/menu" }, { label: menuLabel }]}>
      <div className="relative flex items-center justify-center text-center overflow-hidden" style={{ minHeight: "36vh", background: "linear-gradient(135deg,#1a0e00,#3d2610)" }}>
        <div className="relative flex flex-col items-center gap-4 px-6 py-10">
          <p className="text-[9px] tracking-[0.7em] uppercase font-bold" style={{ color: "#f5c14a" }}>
            The Grand Palace · Sydney CBD
          </p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(38px,7vw,72px)", color: "#fdf6e8" }}>
            {menuLabel}
          </h1>
        </div>
      </div>

      <div className="bg-stone-50 min-h-screen py-8 px-4 md:px-8 space-y-10">
        {categories.map((cat) => (
          <section key={cat.id} className="max-w-5xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white">
              <div className="flex items-center gap-3 px-6 py-5" style={{ background: "#fdf6e4" }}>
                {cat.tag && <span className={`w-3 h-3 rounded-sm border-2 ${tagDot[cat.tag] ?? tagDot.mixed}`} />}
                <h2 className="font-display text-2xl text-stone-900">{cat.label}</h2>
                <span className="text-amber-700 text-[12px] ml-auto">{cat.items.length} items</span>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 divide-stone-100">
                {cat.items.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex gap-4 px-6 py-5 items-start ${i % 2 === 1 ? "sm:border-l border-stone-100" : ""}`}
                  >
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-stone-800">{item.name}</span>
                        {item.badge && (
                          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-bold">
                            ★ {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && <p className="text-stone-500 text-[13px] mt-1 leading-relaxed">{item.description}</p>}
                      {item.price && <p className="font-bold text-amber-700 mt-1.5">{item.price}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
