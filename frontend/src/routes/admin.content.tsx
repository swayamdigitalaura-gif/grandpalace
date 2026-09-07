import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, type PageContent } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { CONTENT_REGISTRY, pageDef, type ContentField } from "@/lib/contentRegistry";

// Injected into the preview iframe's document (same-origin) so hovering an
// editable element shows the WordPress-style dashed orange outline.
const EDIT_HOVER_STYLE_ID = "tgp-edit-hover-style";
const EDIT_HOVER_CSS = `
  [data-tgp-key] { cursor: pointer; transition: outline-color .15s; }
  [data-tgp-key]:hover { outline: 2px dashed #f97316; outline-offset: 3px; }
  [data-tgp-key].tgp-active { outline: 2px solid #f97316 !important; outline-offset: 3px; background: rgba(249,115,22,0.06); }
`;

// Wires up click-to-edit inside a same-origin preview iframe: hovering an
// editable element outlines it, clicking it scrolls/focuses the matching
// sidebar field, and focusing a field highlights the element back in the
// iframe — the two-way link that makes this feel like the reference editor.
function useIframeClickToEdit(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  onElementClick: (key: string) => void,
  reattachToken: number,
) {
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupClick: (() => void) | undefined;

    // The iframe's native "load" event waits for every last resource (fonts,
    // background images, third-party embeds) and can take seconds or never
    // fire cleanly — so instead we poll the same-origin document directly and
    // attach the moment its DOM is actually ready to be queried.
    function tryAttach(): boolean {
      const doc = iframe!.contentDocument;
      // about:blank is the placeholder document the iframe starts on before
      // its real navigation lands — it also reports readyState "complete"
      // with a body immediately, so without this check we'd wire up the
      // throwaway document and never retry once the real page arrives.
      if (!doc || doc.readyState === "loading" || !doc.body || doc.URL === "about:blank") return false;
      if (!doc.getElementById(EDIT_HOVER_STYLE_ID)) {
        const style = doc.createElement("style");
        style.id = EDIT_HOVER_STYLE_ID;
        style.textContent = EDIT_HOVER_CSS;
        doc.head.appendChild(style);
      }
      function handleClick(e: MouseEvent) {
        const target = (e.target as HTMLElement).closest("[data-tgp-key]") as HTMLElement | null;
        if (!target) return;
        e.preventDefault();
        e.stopPropagation();
        onElementClick(target.getAttribute("data-tgp-key")!);
      }
      doc.addEventListener("click", handleClick, true);
      cleanupClick = () => doc.removeEventListener("click", handleClick, true);
      return true;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (!tryAttach()) {
      intervalId = setInterval(() => {
        if (tryAttach() && intervalId) clearInterval(intervalId);
      }, 150);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      cleanupClick?.();
    };
  }, [iframeRef, onElementClick, reattachToken]);
}

// Scrolls + flashes the matching element inside the iframe when a sidebar
// field is focused — the reverse direction of the click-to-edit link above.
function highlightInIframe(iframe: HTMLIFrameElement | null, key: string) {
  const doc = iframe?.contentDocument;
  if (!doc) return;
  doc.querySelectorAll(".tgp-active").forEach((el) => el.classList.remove("tgp-active"));
  const el = doc.querySelector(`[data-tgp-key="${key}"]`);
  if (el) {
    el.classList.add("tgp-active");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Posts every keystroke into the preview iframe, where useLiveContent() (in
// pageContent.ts) merges it into the page's own React state and lets it
// re-render itself normally. A raw DOM write here would get silently undone
// the next time React reconciles that same iframe — this is same-origin, so
// postMessage is instant, no round-trip to the backend or a Save click needed.
function updatePreviewLive(iframe: HTMLIFrameElement | null, path: string, key: string, value: string) {
  iframe?.contentWindow?.postMessage({ type: "tgp-preview-update", path, key, value }, window.location.origin);
}

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border";
const inputStyle = { borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" } as const;
const labelCls = "text-[11px] uppercase tracking-wider font-semibold block mb-1.5";
const labelStyle = { color: "#7a5020" } as const;

// Tabs: legacy Home editor, every registry page, then the Theme panel.
type Tab = { id: string; label: string; path?: string; kind: "home" | "page" | "theme" };
const TABS: Tab[] = [
  { id: "home", label: "Home", path: "/", kind: "home" },
  ...CONTENT_REGISTRY.map((p) => ({ id: p.path, label: p.label, path: p.path, kind: "page" as const })),
  { id: "theme", label: "🎨 Theme", kind: "theme" },
];

function AdminContent() {
  const [tabId, setTabId] = useState<string | null>(null);
  const tab = tabId ? TABS.find((t) => t.id === tabId)! : null;

  if (!tab) {
    return (
      <div className="p-8">
        <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Pages</h1>
        <p className="text-sm text-stone-500 mb-6">
          Every page on the site. Click the pencil to edit its text, images and layout with a live preview.
        </p>
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 max-w-2xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTabId(t.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-50/60 transition group"
            >
              <div>
                <p className="text-[14px] font-semibold" style={{ color: "#1a0e00" }}>{t.label}</p>
                {t.path && <p className="text-[11px] text-stone-400 mt-0.5">{t.path}</p>}
              </div>
              <span
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition"
                style={{ background: "rgba(200,140,30,0.1)", color: "#c8860a" }}
              >
                <PencilIcon />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-white flex flex-col">
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-stone-200 shrink-0">
        <button onClick={() => setTabId(null)} className="text-[12px] font-semibold text-stone-500 hover:text-amber-700 transition inline-flex items-center gap-1">
          ← All Pages
        </button>
        <span className="text-[13px] font-semibold" style={{ color: "#1a0e00" }}>{tab.label}</span>
      </div>
      <div className="flex-1 min-h-0">
        {tab.kind === "home" && <HomeEditor />}
        {tab.kind === "page" && <PageEditor key={tab.path} path={tab.path!} label={tab.label} />}
        {tab.kind === "theme" && <ThemeEditor />}
      </div>
    </div>
  );
}

/* ───────────── Live-preview iframe (shared) ───────────── */
function PreviewPane({ path, previewKey, onRefresh, iframeRef, clickToEdit }: {
  path: string; label: string; previewKey: number; onRefresh: () => void;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>; clickToEdit?: boolean;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between shrink-0">
        <span className="text-[12px] font-semibold text-stone-600">Live preview</span>
        <div className="flex items-center gap-3">
          {clickToEdit && <span className="text-[11px] text-orange-600 font-medium">Click any orange-outlined element to edit it</span>}
          <button onClick={onRefresh} className="text-[11px] font-semibold text-amber-700">Refresh</button>
        </div>
      </div>
      <iframe ref={iframeRef} key={previewKey} src={path} title="Page preview" className="w-full flex-1" style={{ border: 0 }} />
    </div>
  );
}

/* ───────────── Career page's job listings: add/remove, not just edit text ───────────── */
type Job = {
  title: string; subtitle: string; badge1: string; badge2: string;
  requirements: string[]; responsibilities: string[];
};
const DEFAULT_JOBS: Job[] = [
  {
    title: "Chef / Cook",
    subtitle: "The Grand Palace Indian Restaurant · Sydney CBD",
    badge1: "Full Time",
    badge2: "Current Opening",
    requirements: [
      "Minimum 3–4 years culinary experience with Tandoor and Curry cooking",
      "Certificate III or IV in Commercial Cookery (preferred)",
      "Ability to prepare breads and meats in the Tandoor (Indian style clay oven)",
      "Knowledge of Indian regional cuisines and spice blending techniques",
      "Passion for authentic Indian cooking and commitment to quality",
    ],
    responsibilities: [
      "Plan and oversee food preparation and cooking activities",
      "Prepare breads and meats in the Tandoor (Indian style clay oven)",
      "Estimate food requirements and maintain inventory records",
      "Ensure portion control and food quality standards at all times",
      "Maintain cleanliness to meet health and safety requirements",
      "Assist with menu planning and garnishing techniques",
      "Work collaboratively with the kitchen team during service",
    ],
  },
];
const BLANK_JOB: Job = { title: "New Role", subtitle: "The Grand Palace Indian Restaurant · Sydney CBD", badge1: "Full Time", badge2: "Current Opening", requirements: [], responsibilities: [] };

function JobsEditor({ jobs, onChange }: { jobs: Job[]; onChange: (jobs: Job[]) => void }) {
  function update(i: number, patch: Partial<Job>) {
    onChange(jobs.map((j, idx) => (idx === i ? { ...j, ...patch } : j)));
  }
  function remove(i: number) {
    onChange(jobs.filter((_, idx) => idx !== i));
  }
  return (
    <div className="space-y-4">
      {jobs.map((job, i) => (
        <div key={i} className="rounded-lg border border-stone-200 p-3 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Role {i + 1}</span>
            <button onClick={() => remove(i)} className="text-[11px] font-semibold text-red-500 hover:text-red-700">Remove</button>
          </div>
          <div><label className={labelCls} style={labelStyle}>Title</label><input className={inputCls} style={inputStyle} value={job.title} onChange={(e) => update(i, { title: e.target.value })} /></div>
          <div><label className={labelCls} style={labelStyle}>Subtitle</label><input className={inputCls} style={inputStyle} value={job.subtitle} onChange={(e) => update(i, { subtitle: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelCls} style={labelStyle}>Badge 1</label><input className={inputCls} style={inputStyle} value={job.badge1} onChange={(e) => update(i, { badge1: e.target.value })} placeholder="Full Time" /></div>
            <div><label className={labelCls} style={labelStyle}>Badge 2</label><input className={inputCls} style={inputStyle} value={job.badge2} onChange={(e) => update(i, { badge2: e.target.value })} placeholder="Current Opening" /></div>
          </div>
          <div><label className={labelCls} style={labelStyle}>Requirements (one per line)</label><textarea className={`${inputCls} resize-none`} style={inputStyle} rows={4} value={job.requirements.join("\n")} onChange={(e) => update(i, { requirements: e.target.value.split("\n") })} /></div>
          <div><label className={labelCls} style={labelStyle}>Responsibilities (one per line)</label><textarea className={`${inputCls} resize-none`} style={inputStyle} rows={5} value={job.responsibilities.join("\n")} onChange={(e) => update(i, { responsibilities: e.target.value.split("\n") })} /></div>
        </div>
      ))}
      <button onClick={() => onChange([...jobs, { ...BLANK_JOB }])} className="w-full text-center text-[12px] font-semibold text-amber-700 border border-dashed border-amber-300 rounded-lg py-2.5 hover:bg-amber-50 transition">
        + Add Role
      </button>
    </div>
  );
}

/* ───────────── Generic registry-driven page editor ───────────── */
function PageEditor({ path, label }: { path: string; label: string }) {
  const def = pageDef(path)!;
  const isCareer = path === "/career";
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Record<string, string>>({});
  const [jobs, setJobs] = useState<Job[]>(DEFAULT_JOBS);
  const [loaded, setLoaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  useIframeClickToEdit(iframeRef, (key) => {
    setSelectedKey(key);
    highlightInIframe(iframeRef.current, key);
  }, previewKey);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-blocks", path],
    queryFn: () => api.get<Record<string, string>>(`/api/content/blocks/lookup?path=${encodeURIComponent(path)}`),
  });

  useEffect(() => {
    if (existing && !loaded) {
      const init: Record<string, string> = {};
      for (const f of def.fields) init[f.key] = existing[f.key] || f.fallback || "";
      setForm(init);
      if (isCareer) {
        try {
          const parsed = existing["jobs.list"] ? JSON.parse(existing["jobs.list"]) : null;
          setJobs(Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_JOBS);
        } catch { setJobs(DEFAULT_JOBS); }
      }
      setLoaded(true);
    }
  }, [existing, loaded, def.fields, isCareer]);

  function setJobsAndPreview(next: Job[]) {
    setJobs(next);
    updatePreviewLive(iframeRef.current, path, "jobs.list", JSON.stringify(next));
  }

  const save = useMutation({
    mutationFn: () => {
      const blocks = def.fields.map((f) => ({ key: f.key, value: form[f.key] ?? "", type: f.type }));
      if (isCareer) blocks.push({ key: "jobs.list", value: JSON.stringify(jobs), type: "text" });
      return api.put("/api/content/blocks", { path, blocks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blocks", path] });
      setPreviewKey((k) => k + 1);
      setSavedAt(Date.now());
    },
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    updatePreviewLive(iframeRef.current, path, key, value);
  }

  // Group fields for a tidier form.
  const groups = useMemo(() => {
    const g: Record<string, ContentField[]> = {};
    for (const f of def.fields) (g[f.group || "General"] ??= []).push(f);
    return g;
  }, [def.fields]);

  const selectedField = selectedKey ? def.fields.find((f) => f.key === selectedKey) ?? null : null;

  return (
    <div className="h-full grid lg:grid-cols-[380px_1fr]">
      <div className="border-r border-stone-200 p-5 h-full overflow-y-auto" style={{ background: "#fafaf8" }}>
        {isLoading ? (
          <p className="text-sm text-stone-500">Loading…</p>
        ) : selectedField ? (
          <div>
            <button onClick={() => setSelectedKey(null)} className="text-[12px] font-semibold text-stone-500 hover:text-amber-700 transition mb-4 inline-flex items-center gap-1">
              ← Back
            </button>
            <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: "#c8860a" }}>Element Selected</p>
            <h3 className="text-lg font-semibold mb-0.5" style={{ color: "#1a0e00" }}>{selectedField.label}</h3>
            <p className="text-[11px] text-stone-400 font-mono mb-5">Key: {selectedField.key}</p>

            {selectedField.type === "image" ? (
              <ImageUploadField label={selectedField.label} value={form[selectedField.key] ?? ""} onChange={(v) => set(selectedField.key, v)} wide />
            ) : (
              <>
                <label className={labelCls} style={labelStyle}>Text content</label>
                <textarea
                  autoFocus
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                  rows={selectedField.type === "textarea" ? 8 : 3}
                  value={form[selectedField.key] ?? ""}
                  onChange={(e) => set(selectedField.key, e.target.value)}
                />
              </>
            )}

            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-3">
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2">
                {save.isPending ? "Saving…" : "Save"}
              </button>
              {savedAt && !save.isPending && <span className="text-[12px] text-green-600">✓ Saved</span>}
            </div>
            <p className="text-[11px] text-stone-400 mt-3">Changes preview instantly in the page once saved.</p>
          </div>
        ) : (
          <>
            {Object.entries(groups).map(([group, fields]) => (
              <div key={group} className="pt-4 first:pt-0 border-t first:border-t-0 border-stone-100">
                <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">{group}</p>
                <div className="space-y-3">
                  {fields.map((f) => (
                    <button
                      key={f.key}
                      ref={(el) => { fieldRefs.current[f.key] = el; }}
                      onClick={() => { setSelectedKey(f.key); highlightInIframe(iframeRef.current, f.key); }}
                      className="w-full text-left rounded-lg border border-stone-200 px-3 py-2.5 hover:border-amber-300 hover:bg-amber-50/50 transition"
                    >
                      <span className={labelCls} style={labelStyle}>{f.label}</span>
                      <span className="block text-[13px] text-stone-700 truncate mt-0.5">
                        {f.type === "image" ? (form[f.key] ? "Custom image set" : "Default image") : (form[f.key] || "—")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {isCareer && (
              <div className="pt-4 first:pt-0 border-t first:border-t-0 border-stone-100">
                <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Job Openings — add or remove roles</p>
                <JobsEditor jobs={jobs} onChange={setJobsAndPreview} />
              </div>
            )}
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2">
                {save.isPending ? "Saving…" : "Save All"}
              </button>
              {savedAt && !save.isPending && <span className="text-[12px] text-green-600">Saved — preview updated</span>}
            </div>
          </>
        )}
      </div>
      <PreviewPane path={path} label={label} previewKey={previewKey} onRefresh={() => setPreviewKey((k) => k + 1)} iframeRef={iframeRef} clickToEdit />
    </div>
  );
}

/* ───────────── Legacy Home editor (PageContent model) ───────────── */
type HomeForm = {
  heroKicker: string; heroHeadlineTop: string; heroHeadlineBottom: string; heroSubtext: string;
  aboutHeading: string; aboutBody: string;
  menuSectionHeading: string; menuSectionBody: string; menuSectionImage: string;
};
const HOME_EMPTY: HomeForm = {
  heroKicker: "", heroHeadlineTop: "", heroHeadlineBottom: "", heroSubtext: "",
  aboutHeading: "", aboutBody: "", menuSectionHeading: "", menuSectionBody: "", menuSectionImage: "",
};
// Mirrors the exact default text baked into index.tsx's cms(content, key, "default")
// calls, so the admin box always shows the real current text, not an empty box.
const HOME_FALLBACKS: Record<Exclude<keyof HomeForm, "menuSectionImage">, string> = {
  heroKicker: "Sydney CBD · Est. 2021",
  heroHeadlineTop: "A True Taste",
  heroHeadlineBottom: "of India",
  heroSubtext: "Bold flavours, fresh curries and a dining room that channels the glamour of India's majestic palaces — right in the heart of Sydney.",
  aboutHeading: "The Grand Palace | Indian Restaurant in Sydney CBD\nDining | Events | Catering",
  aboutBody: "The Grand Palace - Indian Restaurant brings the most authentic Indian Cuisine to Australian shores. Our food is full of bold flavours as our chefs prepare the fresh curries in our kitchen everyday. Our carefully crafted interior is a reminiscence of glamorous majestic palaces of India. Our attentive service is here to offer you an unforgettable dining experience.\n\nHACCP Food certificate is an epitome of authority about food hygiene, handling, and preparation methods. The Grand Palace - Indian Restaurant is proudly HACCP certified. We are also Gold Licensed allowing us to cater to many high end prestigious venues.",
  menuSectionHeading: "Our Delicious Menu",
  menuSectionBody: "The Grand Palace - Indian Restaurant offers authentic Indian cuisine, celebrating the rich and diverse flavours of India. Using premium Indian spices, we craft dishes that delight Sydney's food lovers.\n\nRenowned as the best Indian restaurant in Sydney CBD, we provide a grand dining experience with exquisite food, vibrant ambiance, and attentive service.\n\nAt The Grand Palace - Indian Restaurant, savour the true taste of India.\n\nWe also serve gluten free, vegetarian, vegan, no onion no garlic dishes. We use halal certified meat.",
};

// Newer Home sections (Birthday teaser, Host Your Events, Gallery teaser)
// are wired through the generic ContentBlock system instead of the legacy
// PageContent columns — same path ("/"), different storage, both editable
// from this one Home tab.
const HOME_BLOCK_FIELDS: { key: string; label: string; type: "text" | "textarea"; fallback: string }[] = [
  { key: "birthday.heading", label: "Birthday heading", type: "text", fallback: "Celebrate Your Birthday at TGP with Cake & Decoration" },
  { key: "birthday.body1", label: "Birthday paragraph 1", type: "textarea", fallback: "When you celebrate your birthday at The Grand Palace - Indian Restaurant, you can enjoy the moment whilst we take care of cake and decoration." },
  { key: "birthday.body2", label: "Birthday paragraph 2", type: "textarea", fallback: "Our special Birthday packages allow you to choose the cake, the decoration, or both — we do it for you so you don't have to." },
  { key: "hostevents.heading", label: "Host Your Events heading", type: "text", fallback: "Host Your Events" },
  { key: "hostevents.subtitle", label: "Host Your Events subtitle", type: "textarea", fallback: "From private venue hire to corporate functions and milestone celebrations, host your next event with The Grand Palace - Indian Restaurant — traditional recipes, bold flavours, and seamless coordination from start to finish." },
  { key: "gallery.heading", label: "Gallery heading", type: "text", fallback: "A look inside The Grand Palace Indian Restaurant" },
  { key: "gallery.subtitle", label: "Gallery subtitle", type: "textarea", fallback: "Explore our gallery, featuring rich ambiance, delectable cuisine and refreshing drinks that define our signature experience" },
];

function HomeEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HomeForm>(HOME_EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  useIframeClickToEdit(iframeRef, (key) => {
    const el = fieldRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
    highlightInIframe(iframeRef.current, key);
  }, previewKey);

  function fieldWrap(key: keyof HomeForm) {
    return {
      ref: (el: HTMLDivElement | null) => { fieldRefs.current[key] = el; },
      tabIndex: -1 as const,
      onFocus: () => highlightInIframe(iframeRef.current, key),
      className: "rounded-lg -mx-1 px-1 py-1 transition focus-within:bg-orange-50",
    };
  }

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-content", "/"],
    queryFn: () => api.get<PageContent | null>(`/api/content/pages/lookup?path=/`),
  });

  useEffect(() => {
    if (existing !== undefined && !loaded) {
      setForm({
        heroKicker: existing?.heroKicker || HOME_FALLBACKS.heroKicker, heroHeadlineTop: existing?.heroHeadlineTop || HOME_FALLBACKS.heroHeadlineTop,
        heroHeadlineBottom: existing?.heroHeadlineBottom || HOME_FALLBACKS.heroHeadlineBottom, heroSubtext: existing?.heroSubtext || HOME_FALLBACKS.heroSubtext,
        aboutHeading: existing?.aboutHeading || HOME_FALLBACKS.aboutHeading, aboutBody: existing?.aboutBody || HOME_FALLBACKS.aboutBody,
        menuSectionHeading: existing?.menuSectionHeading || HOME_FALLBACKS.menuSectionHeading, menuSectionBody: existing?.menuSectionBody || HOME_FALLBACKS.menuSectionBody,
        menuSectionImage: existing?.menuSectionImage ?? "",
      });
      setLoaded(true);
    }
  }, [existing, loaded]);

  const save = useMutation({
    mutationFn: () => api.put("/api/content/pages", { path: "/", ...form }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-content", "/"] });
      setPreviewKey((k) => k + 1);
      setSavedAt(Date.now());
    },
  });
  const up = (k: keyof HomeForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    updatePreviewLive(iframeRef.current, "/", k, v);
  };

  const [blockForm, setBlockForm] = useState<Record<string, string>>({});
  const [blockLoaded, setBlockLoaded] = useState(false);
  const { data: existingBlocks } = useQuery({
    queryKey: ["admin-blocks", "/"],
    queryFn: () => api.get<Record<string, string>>(`/api/content/blocks/lookup?path=${encodeURIComponent("/")}`),
  });
  useEffect(() => {
    if (existingBlocks && !blockLoaded) {
      const init: Record<string, string> = {};
      for (const f of HOME_BLOCK_FIELDS) init[f.key] = existingBlocks[f.key] || f.fallback;
      setBlockForm(init);
      setBlockLoaded(true);
    }
  }, [existingBlocks, blockLoaded]);
  const saveBlocks = useMutation({
    mutationFn: () => api.put("/api/content/blocks", { path: "/", blocks: HOME_BLOCK_FIELDS.map((f) => ({ key: f.key, value: blockForm[f.key] ?? "", type: f.type })) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blocks", "/"] }),
  });
  function bset(key: string, value: string) {
    setBlockForm((f) => ({ ...f, [key]: value }));
    updatePreviewLive(iframeRef.current, "/", key, value);
  }
  function saveAll() {
    save.mutate();
    saveBlocks.mutate(undefined, { onSuccess: () => { setPreviewKey((k) => k + 1); setSavedAt(Date.now()); } });
  }

  return (
    <div className="h-full grid lg:grid-cols-[380px_1fr]">
      <div className="border-r border-stone-200 p-5 space-y-5 h-full overflow-y-auto" style={{ background: "#fafaf8" }}>
        {isLoading ? <p className="text-sm text-stone-500">Loading…</p> : (
          <>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Hero</p>
              <div className="space-y-3">
                <div {...fieldWrap("heroKicker")}><label className={labelCls} style={labelStyle}>Kicker</label><input className={inputCls} style={inputStyle} value={form.heroKicker} onChange={(e) => up("heroKicker", e.target.value)} placeholder="Sydney CBD · Est. 2021" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div {...fieldWrap("heroHeadlineTop")}><label className={labelCls} style={labelStyle}>Headline line 1</label><input className={inputCls} style={inputStyle} value={form.heroHeadlineTop} onChange={(e) => up("heroHeadlineTop", e.target.value)} placeholder="A True Taste" /></div>
                  <div {...fieldWrap("heroHeadlineBottom")}><label className={labelCls} style={labelStyle}>Headline line 2</label><input className={inputCls} style={inputStyle} value={form.heroHeadlineBottom} onChange={(e) => up("heroHeadlineBottom", e.target.value)} placeholder="of India" /></div>
                </div>
                <div {...fieldWrap("heroSubtext")}><label className={labelCls} style={labelStyle}>Subtext</label><textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3} value={form.heroSubtext} onChange={(e) => up("heroSubtext", e.target.value)} /></div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">About Section</p>
              <div className="space-y-3">
                <div {...fieldWrap("aboutHeading")}><label className={labelCls} style={labelStyle}>Heading</label><input className={inputCls} style={inputStyle} value={form.aboutHeading} onChange={(e) => up("aboutHeading", e.target.value)} /></div>
                <div {...fieldWrap("aboutBody")}><label className={labelCls} style={labelStyle}>Body</label><textarea className={`${inputCls} resize-none`} style={inputStyle} rows={6} value={form.aboutBody} onChange={(e) => up("aboutBody", e.target.value)} placeholder="Separate paragraphs with a blank line." /></div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Menu Section</p>
              <div className="space-y-3">
                <div {...fieldWrap("menuSectionHeading")}><label className={labelCls} style={labelStyle}>Heading</label><input className={inputCls} style={inputStyle} value={form.menuSectionHeading} onChange={(e) => up("menuSectionHeading", e.target.value)} placeholder="Our Delicious Menu" /></div>
                <div {...fieldWrap("menuSectionBody")}><label className={labelCls} style={labelStyle}>Body</label><textarea className={`${inputCls} resize-none`} style={inputStyle} rows={5} value={form.menuSectionBody} onChange={(e) => up("menuSectionBody", e.target.value)} placeholder="Separate paragraphs with a blank line." /></div>
                <div {...fieldWrap("menuSectionImage")}><label className={labelCls} style={labelStyle}>Photo</label><ImageUploadField label="Menu section photo" value={form.menuSectionImage} onChange={(v) => up("menuSectionImage", v)} wide /></div>
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Birthday Teaser</p>
              <div className="space-y-3">
                {HOME_BLOCK_FIELDS.filter((f) => f.key.startsWith("birthday.")).map((f) => (
                  <div key={f.key} ref={(el) => { fieldRefs.current[f.key] = el; }} tabIndex={-1} onFocus={() => highlightInIframe(iframeRef.current, f.key)} className="rounded-lg -mx-1 px-1 py-1 transition focus-within:bg-orange-50">
                    <label className={labelCls} style={labelStyle}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    ) : (
                      <input className={inputCls} style={inputStyle} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Host Your Events</p>
              <div className="space-y-3">
                {HOME_BLOCK_FIELDS.filter((f) => f.key.startsWith("hostevents.")).map((f) => (
                  <div key={f.key} ref={(el) => { fieldRefs.current[f.key] = el; }} tabIndex={-1} onFocus={() => highlightInIframe(iframeRef.current, f.key)} className="rounded-lg -mx-1 px-1 py-1 transition focus-within:bg-orange-50">
                    <label className={labelCls} style={labelStyle}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    ) : (
                      <input className={inputCls} style={inputStyle} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Gallery Teaser</p>
              <div className="space-y-3">
                {HOME_BLOCK_FIELDS.filter((f) => f.key.startsWith("gallery.")).map((f) => (
                  <div key={f.key} ref={(el) => { fieldRefs.current[f.key] = el; }} tabIndex={-1} onFocus={() => highlightInIframe(iframeRef.current, f.key)} className="rounded-lg -mx-1 px-1 py-1 transition focus-within:bg-orange-50">
                    <label className={labelCls} style={labelStyle}>{f.label}</label>
                    {f.type === "textarea" ? (
                      <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    ) : (
                      <input className={inputCls} style={inputStyle} value={blockForm[f.key] ?? ""} onChange={(e) => bset(f.key, e.target.value)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button onClick={saveAll} disabled={save.isPending || saveBlocks.isPending} className="btn-gold !text-[12px] !px-4 !py-2">{save.isPending || saveBlocks.isPending ? "Saving…" : "Save"}</button>
              {savedAt && !save.isPending && !saveBlocks.isPending && <span className="text-[12px] text-green-600">Saved — preview updated</span>}
            </div>
          </>
        )}
      </div>
      <PreviewPane path="/" label="Home" previewKey={previewKey} onRefresh={() => setPreviewKey((k) => k + 1)} iframeRef={iframeRef} clickToEdit />
    </div>
  );
}

/* ───────────── Theme editor (site-wide colours + fonts) ───────────── */
type ThemeForm = {
  colorSaffron: string; colorGold: string; colorPalace: string; colorCream: string;
  fontDisplay: string; fontBody: string; baseFontScale: string;
};
const THEME_EMPTY: ThemeForm = { colorSaffron: "", colorGold: "", colorPalace: "", colorCream: "", fontDisplay: "", fontBody: "", baseFontScale: "" };

const GOOGLE_FONTS = ["Josefin Sans", "Playfair Display", "Cormorant Garamond", "Poppins", "Montserrat", "Lora", "Merriweather", "Raleway", "Marcellus", "EB Garamond"];

function ThemeEditor() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ThemeForm>(THEME_EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-theme"],
    queryFn: () => api.get<Partial<ThemeForm>>("/api/content/theme/admin"),
  });

  useEffect(() => {
    if (existing && !loaded) {
      setForm({
        colorSaffron: existing.colorSaffron ?? "", colorGold: existing.colorGold ?? "",
        colorPalace: existing.colorPalace ?? "", colorCream: existing.colorCream ?? "",
        fontDisplay: existing.fontDisplay ?? "", fontBody: existing.fontBody ?? "",
        baseFontScale: existing.baseFontScale ?? "",
      });
      setLoaded(true);
    }
  }, [existing, loaded]);

  const save = useMutation({
    mutationFn: () => api.put("/api/content/theme", {
      colorSaffron: form.colorSaffron || null, colorGold: form.colorGold || null,
      colorPalace: form.colorPalace || null, colorCream: form.colorCream || null,
      fontDisplay: form.fontDisplay ? `"${form.fontDisplay}", serif` : null,
      fontBody: form.fontBody ? `"${form.fontBody}", sans-serif` : null,
      baseFontScale: form.baseFontScale || null,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-theme"] }); setPreviewKey((k) => k + 1); setSavedAt(Date.now()); },
  });
  const up = (k: keyof ThemeForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const colorRow = (k: keyof ThemeForm, label: string, fallback: string) => (
    <div className="flex items-center justify-between gap-3">
      <label className="text-[13px] text-stone-700">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={form[k] || fallback} onChange={(e) => up(k, e.target.value)} className="w-9 h-9 rounded cursor-pointer border border-stone-200" />
        <input value={form[k]} onChange={(e) => up(k, e.target.value)} placeholder={fallback} className="w-24 rounded-lg px-2 py-1.5 text-[12px] bg-white outline-none border font-mono" style={inputStyle} />
      </div>
    </div>
  );

  return (
    <div className="h-full grid lg:grid-cols-[380px_1fr]">
      <div className="border-r border-stone-200 p-5 space-y-5 h-full overflow-y-auto" style={{ background: "#fafaf8" }}>
        {isLoading ? <p className="text-sm text-stone-500">Loading…</p> : (
          <>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Brand Colours</p>
              <div className="space-y-3">
                {colorRow("colorSaffron", "Saffron (accent)", "#d47800")}
                {colorRow("colorGold", "Gold", "#c8860a")}
                {colorRow("colorPalace", "Palace (dark)", "#1a0e00")}
                {colorRow("colorCream", "Cream (light)", "#fdf6e8")}
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-400 mb-3">Typography</p>
              <div className="space-y-3">
                <div>
                  <label className={labelCls} style={labelStyle}>Heading font</label>
                  <select className={inputCls} style={inputStyle} value={form.fontDisplay} onChange={(e) => up("fontDisplay", e.target.value)}>
                    <option value="">Default (Josefin Sans)</option>
                    {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Body font</label>
                  <select className={inputCls} style={inputStyle} value={form.fontBody} onChange={(e) => up("fontBody", e.target.value)}>
                    <option value="">Default (Josefin Sans)</option>
                    {GOOGLE_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Overall text size ({form.baseFontScale || "1.0"}×)</label>
                  <input type="range" min="0.85" max="1.2" step="0.05" value={form.baseFontScale || "1"} onChange={(e) => up("baseFontScale", e.target.value)} className="w-full" />
                </div>
              </div>
              <p className="text-[11px] text-amber-600 mt-2">Note: custom Google fonts need the font loaded site-wide — tell me the font and I'll add it. Colours & size work immediately.</p>
            </div>
            <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
              <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2">{save.isPending ? "Saving…" : "Save"}</button>
              {savedAt && !save.isPending && <span className="text-[12px] text-green-600">Saved — applied site-wide</span>}
            </div>
          </>
        )}
      </div>
      <PreviewPane path="/" label="Home (theme preview)" previewKey={previewKey} onRefresh={() => setPreviewKey((k) => k + 1)} />
    </div>
  );
}
