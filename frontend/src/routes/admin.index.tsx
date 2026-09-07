import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, type MenuCategory, type GalleryImage, type SitePage } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function useCount(menuType: string) {
  return useQuery({
    queryKey: ["admin-menu", menuType],
    queryFn: () => api.get<MenuCategory[]>(`/api/menu/${menuType}`),
  });
}

function AdminDashboard() {
  const alacarte = useCount("a-la-carte");
  const setMenu = useCount("set-menu");
  const beverages = useCount("beverages");
  const gallery = useQuery({ queryKey: ["admin-gallery"], queryFn: () => api.get<GalleryImage[]>("/api/gallery") });
  const pages = useQuery({ queryKey: ["admin-pages"], queryFn: () => api.get<SitePage[]>("/api/pages/admin/all") });
  const leadCounts = useQuery({ queryKey: ["admin-lead-counts"], queryFn: () => api.get<Record<string, number>>("/api/enquiries/counts") });

  const itemCount = (q: typeof alacarte) => q.data?.reduce((s, c) => s + c.items.length, 0) ?? "…";
  const totalLeads = leadCounts.data ? Object.values(leadCounts.data).reduce((s, n) => s + n, 0) : "…";

  const cards = [
    { label: "New Leads", value: totalLeads, to: "/admin/leads" },
    { label: "À la Carte Items", value: itemCount(alacarte), to: "/admin/menu" },
    { label: "Set Menu Courses", value: itemCount(setMenu), to: "/admin/menu" },
    { label: "Beverage Items", value: itemCount(beverages), to: "/admin/menu" },
    { label: "Gallery Photos", value: gallery.data?.length ?? "…", to: "/admin/gallery" },
    { label: "What's On Pages", value: pages.data?.length ?? "…", to: "/admin/pages" },
    { label: "Site Images", value: "→", to: "/admin/site-images" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-3xl" style={{ color: "#1a0e00" }}>Dashboard</h1>
      <p className="text-sm text-stone-500 mt-1">Manage The Grand Palace website content.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className="rounded-xl p-5 bg-white border border-stone-200 hover:border-amber-300 transition-colors"
          >
            <p className="text-3xl font-display" style={{ color: "#c8860a" }}>{c.value}</p>
            <p className="text-xs uppercase tracking-wider text-stone-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
