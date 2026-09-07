import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const Route = createFileRoute("/admin/site-images")({
  component: AdminPages,
});

type SiteImage = { key: string; label: string; url: string };
type SiteToggleData = { key: string; label: string; active: boolean };

// Every editable photo slot on the site, grouped by which page it lives on.
// Adding a slot here alone does nothing — the page also needs
// `useSiteImage("key", originalImport)` wired into that image before it
// will actually show up live. `toggleKey` (optional) adds a whole-page
// Active/Inactive switch, for bespoke pages that don't fit the Menu or
// What's On systems (e.g. Lunch Special's fixed pricing tiers).
const PAGES: { page: string; path: string; toggleKey?: string; toggleTitle?: string; toggleOnText?: string; toggleOffText?: string; slots: { key: string; label: string; defaultUrl: string }[] }[] = [
  {
    page: "Home",
    path: "/",
    slots: [
      // "Our Delicious Menu" photo moved to the Sanity CMS (SEO > homepage doc) — edit it there now.
      { key: "home-birthday-section", label: "Celebrate Birthday — section photo", defaultUrl: "/site-image-defaults/home-birthday-section.jpg" },
      { key: "home-venue-hire-section", label: "Venue for Hire — section photo", defaultUrl: "/site-image-defaults/home-venue-hire-section.png" },
      { key: "home-corporate-section", label: "Corporate Events — section photo", defaultUrl: "/site-image-defaults/home-corporate-section.jpg" },
      { key: "home-private-celebration-section", label: "Private Celebrations — section photo", defaultUrl: "/site-image-defaults/home-private-celebration-section.png" },
      { key: "home-office-catering-section", label: "Office Catering — section photo", defaultUrl: "/site-image-defaults/home-office-catering-section.jpg" },
      { key: "home-venue-catering-section", label: "Venue Catering — section photo", defaultUrl: "/site-image-defaults/home-venue-catering-section.jpg" },
    ],
  },
  {
    page: "Menu Hub",
    path: "/menu",
    slots: [{ key: "menu-index-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/menu-index-hero.jpg" }],
  },
  {
    page: "À la Carte Menu",
    path: "/menu/a-la-carte",
    slots: [{ key: "alacarte-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/alacarte-hero.jpg" }],
  },
  {
    page: "Set Menu",
    path: "/set-menu",
    slots: [{ key: "setmenu-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/setmenu-hero.jpg" }],
  },
  {
    page: "Beverages",
    path: "/beverages",
    slots: [{ key: "beverages-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/beverages-hero.jpg" }],
  },
  {
    page: "Gallery",
    path: "/gallery",
    slots: [{ key: "gallery-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/gallery-hero.jpg" }],
  },
  {
    page: "About Us",
    path: "/about",
    slots: [{ key: "about-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/about-hero.jpg" }],
  },
  {
    page: "Events",
    path: "/events",
    slots: [{ key: "events-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/events-hero.jpg" }],
  },
  {
    page: "Contact",
    path: "/contact",
    slots: [{ key: "contact-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/contact-hero.jpg" }],
  },
  {
    page: "Office Catering",
    path: "/office-catering",
    slots: [
      { key: "office-catering-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/office-catering-hero.jpg" },
      { key: "office-catering-corporate", label: "Full-Service Catering — card photo", defaultUrl: "/site-image-defaults/office-catering-corporate.jpg" },
      { key: "office-catering-platter-veg", label: "Veg Platter Box photo", defaultUrl: "/site-image-defaults/office-catering-platter-veg.jpg" },
      { key: "office-catering-platter-nonveg", label: "Non-Veg Platter Box photo", defaultUrl: "/site-image-defaults/office-catering-platter-nonveg.jpg" },
      { key: "office-catering-gallery-1", label: "Gallery strip photo 1", defaultUrl: "/site-image-defaults/office-catering-gallery-1.jpg" },
      { key: "office-catering-gallery-2", label: "Gallery strip photo 2", defaultUrl: "/site-image-defaults/office-catering-gallery-2.jpg" },
    ],
  },
  {
    page: "Lunch Special",
    path: "/lunch-special",
    toggleKey: "lunch-special",
    slots: [{ key: "lunch-special-hero", label: "Hero banner", defaultUrl: "/site-image-defaults/lunch-special-hero.jpg" }],
  },
  {
    page: "Site-Wide Settings",
    path: "multiple pages",
    toggleKey: "min-charge-notice",
    toggleTitle: "Minimum Charge Notice",
    toggleOnText: "Shown — \"Minimum charge per person $35 (Children 5–10: $25)\" appears on Footer, About, Contact, Events, Venue Catering, Venue for Hire and Celebrate Birthday pages.",
    toggleOffText: "Hidden — the $35/$25 minimum charge line is hidden everywhere it normally appears (other notices like BYO and surcharges stay visible).",
    slots: [],
  },
];

function AdminPages() {
  const queryClient = useQueryClient();
  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-site-images"],
    queryFn: () => api.get<SiteImage[]>("/api/site-images"),
  });
  const { data: toggles } = useQuery({
    queryKey: ["admin-site-toggles"],
    queryFn: () => api.get<SiteToggleData[]>("/api/site-toggles"),
  });
  const [activePage, setActivePage] = useState(PAGES[0].page);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-site-images"] });
    queryClient.invalidateQueries({ queryKey: ["site-images"] });
  }
  function invalidateToggles() {
    queryClient.invalidateQueries({ queryKey: ["admin-site-toggles"] });
    queryClient.invalidateQueries({ queryKey: ["site-toggles"] });
  }

  const current = PAGES.find((p) => p.page === activePage)!;
  const currentToggle = current.toggleKey ? toggles?.find((t) => t.key === current.toggleKey) : undefined;

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Pages</h1>
      <p className="text-sm text-stone-500 mb-6">
        Pick a page, then click any photo to replace it. Changes go live immediately — no rebuild needed.
        (What's On offer pages have their own full visual editor — see "What's On Pages" in the sidebar.)
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p) => (
          <button
            key={p.page}
            onClick={() => setActivePage(p.page)}
            className="px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wide transition"
            style={
              activePage === p.page
                ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }
            }
          >
            {p.page}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-stone-500 mb-4">Live at {current.path}</p>

      {current.toggleKey && (
        <PageToggle
          toggleKey={current.toggleKey}
          label={current.page}
          active={currentToggle?.active ?? true}
          onSaved={invalidateToggles}
          title={current.toggleTitle}
          onText={current.toggleOnText}
          offText={current.toggleOffText}
        />
      )}

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {current.slots.map((slot) => (
          <SlotCard
            key={slot.key}
            slot={slot}
            existing={images?.find((i) => i.key === slot.key)}
            onSaved={invalidate}
          />
        ))}
      </div>
    </div>
  );
}

function PageToggle({
  toggleKey, label, active, onSaved, title, onText, offText,
}: {
  toggleKey: string;
  label: string;
  active: boolean;
  onSaved: () => void;
  title?: string;
  onText?: string;
  offText?: string;
}) {
  const save = useMutation({
    mutationFn: (newActive: boolean) => api.put(`/api/site-toggles/${toggleKey}`, { label, active: newActive }),
    onSuccess: onSaved,
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold" style={{ color: "#1a0e00" }}>{title ?? "Whole Page Status"}</p>
        <p className="text-[11px] text-stone-500 mt-0.5">
          {active
            ? (onText ?? "Live — visitors can view this page and it's linked from the Menu.")
            : (offText ?? "Hidden — the page shows an \"unavailable\" message and its menu card is hidden.")}
        </p>
      </div>
      <button
        onClick={() => save.mutate(!active)}
        disabled={save.isPending}
        className="text-[11px] font-bold uppercase tracking-wide px-4 py-2 rounded-full flex-shrink-0"
        style={active
          ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a", border: "1px solid rgba(74,140,58,0.3)" }
          : { background: "rgba(160,90,10,0.1)", color: "#a05a0a", border: "1px solid rgba(160,90,10,0.3)" }}
      >
        {active ? "● Active" : "○ Inactive"}
      </button>
    </div>
  );
}

function SlotCard({
  slot, existing, onSaved,
}: {
  slot: { key: string; label: string; defaultUrl: string };
  existing?: SiteImage;
  onSaved: () => void;
}) {
  const [url, setUrl] = useState(existing?.url ?? "");
  const isCustom = !!existing?.url;
  const isValidUrl = !url || /^(https?:\/\/|\/|data:image\/)/i.test(url.trim());

  const save = useMutation({
    mutationFn: () => api.put(`/api/site-images/${slot.key}`, { label: slot.label, url }),
    onSuccess: onSaved,
  });

  const reset = useMutation({
    mutationFn: () => api.delete(`/api/site-images/${slot.key}`),
    onSuccess: () => { setUrl(""); onSaved(); },
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <p className="text-sm font-semibold mb-3" style={{ color: "#1a0e00" }}>{slot.label}</p>
      <ImageUploadField
        label={isCustom ? "Custom photo set" : "Using default photo"}
        value={url || slot.defaultUrl}
        onChange={setUrl}
        wide
      />
      <div className="flex items-center gap-3 mt-2">
        <button onClick={() => save.mutate()} className="btn-gold !text-[11px] !px-3 !py-1.5" disabled={save.isPending || !isValidUrl}>
          {save.isPending ? "Saving…" : "Save"}
        </button>
        {isCustom && (
          <button onClick={() => reset.mutate()} className="text-[11px] text-stone-500 font-semibold" disabled={reset.isPending}>
            Reset to default
          </button>
        )}
      </div>
    </div>
  );
}
