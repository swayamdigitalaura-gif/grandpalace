import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, SITE_URL, type SeoSetting, type Redirect, type SiteSeoConfig } from "@/lib/admin-api";
import { SITE_PAGES } from "@/lib/sitePages";

// Must be kept identical to robots[.]txt.ts's own DEFAULT_ROBOTS_TXT — not
// imported from there directly to avoid cross-importing between file-based
// route modules (TanStack Router's route generator expects each route file
// to be a standalone leaf). Shown here so the admin editor never looks
// blank just because nothing's been explicitly saved to the database yet
// (it was previously empty: config.robotsTxt is null until someone hits
// Save at least once, but /robots.txt itself was never actually broken —
// it already falls back to this same text).
const DEFAULT_ROBOTS_TXT = `User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

User-Agent: Googlebot
Allow: /

User-Agent: Bingbot
Allow: /

User-Agent: GPTBot
Allow: /

User-Agent: ChatGPT-User
Allow: /

User-Agent: Google-Extended
Allow: /

User-Agent: PerplexityBot
Allow: /

User-Agent: ClaudeBot
Allow: /

User-Agent: anthropic-ai
Allow: /

User-Agent: cohere-ai
Allow: /

User-Agent: CCBot
Allow: /

User-Agent: Diffbot
Allow: /

User-Agent: Bytespider
Allow: /

User-Agent: Applebot
Allow: /

User-Agent: Meta-ExternalAgent
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

export const Route = createFileRoute("/admin/seo")({
  component: AdminSeo,
});

const TABS = [
  { id: "pages", label: "Pages" },
  { id: "redirects", label: "Redirects" },
  { id: "robots", label: "Robots.txt" },
  { id: "sitemap", label: "Sitemap" },
  { id: "audit", label: "SEO Audit" },
  { id: "code", label: "Header & Footer Code" },
] as const;

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border";
const inputStyle = { borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" };
const labelCls = "text-[11px] uppercase tracking-wider font-semibold block mb-1.5";
const labelStyle = { color: "#7a5020" };

function AdminSeo() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("pages");

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>SEO</h1>
      <p className="text-sm text-stone-500 mb-6">
        Manage robots.txt, redirects, site-wide header/footer code, and per-page meta &amp; schema.
      </p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wide transition"
            style={
              tab === t.id
                ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "pages" && <PagesTab />}
      {tab === "redirects" && <RedirectsTab />}
      {tab === "robots" && <RobotsTab />}
      {tab === "sitemap" && <SitemapTab />}
      {tab === "audit" && <SeoAuditTab />}
      {tab === "code" && <CodeTab />}
    </div>
  );
}

/* ───────────────────── Pages tab ───────────────────── */

function PagesTab() {
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const { data: settings } = useQuery({
    queryKey: ["admin-seo-pages"],
    queryFn: () => api.get<SeoSetting[]>("/api/seo/pages"),
  });
  const byPath = new Map((settings ?? []).map((s) => [s.path, s]));

  return (
    <>
      <p className="text-[12px] text-stone-500 mb-4">
        Only <strong>Home</strong> currently applies these overrides live on the site — the rest save here as groundwork for a fast follow-up.
      </p>
      <div className="space-y-2">
        {SITE_PAGES.map((p) => {
          const setting = byPath.get(p.path);
          const isLive = p.path === "/";
          return (
            <div key={p.path} className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "#1a0e00" }}>{p.label}</span>
                  {isLive && (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: "rgba(74,140,58,0.12)", color: "#4a8c3a" }}>
                      Live
                    </span>
                  )}
                  {setting && (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: "rgba(200,140,10,0.12)", color: "#a05a0a" }}>
                      Customised
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400 truncate">{p.path}</p>
              </div>
              <button onClick={() => setEditingPath(p.path)} className="btn-gold !text-[11px] !px-3 !py-1.5 shrink-0">
                SEO Settings
              </button>
            </div>
          );
        })}
      </div>
      {editingPath && (
        <SeoSettingsModal
          path={editingPath}
          pageLabel={SITE_PAGES.find((p) => p.path === editingPath)?.label ?? editingPath}
          existing={byPath.get(editingPath)}
          onClose={() => setEditingPath(null)}
        />
      )}
    </>
  );
}

function SeoSettingsModal({
  path, pageLabel, existing, onClose,
}: {
  path: string;
  pageLabel: string;
  existing?: SeoSetting;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<"meta" | "schema" | "head">("meta");
  const [form, setForm] = useState({
    metaTitle: existing?.metaTitle ?? "",
    metaDescription: existing?.metaDescription ?? "",
    focusKeywords: existing?.focusKeywords ?? "",
    ogImage: existing?.ogImage ?? "",
    canonicalUrl: existing?.canonicalUrl ?? "",
    schema: existing?.schema ? JSON.stringify(existing.schema, null, 2) : "",
    headTags: existing?.headTags ?? "",
  });
  const [schemaError, setSchemaError] = useState("");

  const save = useMutation({
    mutationFn: () => {
      let schemaJson: unknown = undefined;
      if (form.schema.trim()) {
        schemaJson = JSON.parse(form.schema);
      }
      return api.put("/api/seo/pages", {
        path,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        focusKeywords: form.focusKeywords || null,
        ogImage: form.ogImage || null,
        canonicalUrl: form.canonicalUrl || null,
        schema: schemaJson ?? null,
        headTags: form.headTags || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      onClose();
    },
  });

  function handleSave() {
    setSchemaError("");
    if (form.schema.trim()) {
      try {
        JSON.parse(form.schema);
      } catch {
        setSchemaError("This isn't valid JSON — check for a missing comma or bracket.");
        setSubTab("schema");
        return;
      }
    }
    save.mutate();
  }

  const reset = useMutation({
    mutationFn: () => api.delete(`/api/seo/pages?path=${encodeURIComponent(path)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(20,12,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-display text-xl" style={{ color: "#1a0e00" }}>SEO Settings — {pageLabel}</h2>
          <p className="text-[11px] text-stone-400 mt-0.5">{path}</p>
          <div className="flex gap-1 mt-3">
            {(["meta", "schema", "head"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide"
                style={subTab === t ? { background: "rgba(200,140,10,0.12)", color: "#a05a0a" } : { color: "#a8a29e" }}
              >
                {t === "meta" ? "SEO & Meta" : t === "schema" ? "Schema" : "Head Tags"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4">
          {subTab === "meta" && (
            <>
              <div>
                <label className={labelCls} style={labelStyle}>
                  Meta Title <span className="float-right normal-case font-normal text-stone-400">{form.metaTitle.length}/60</span>
                </label>
                <input className={inputCls} style={inputStyle} value={form.metaTitle} maxLength={70}
                  onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} placeholder="SEO title (50-60 chars)" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>
                  Meta Description <span className="float-right normal-case font-normal text-stone-400">{form.metaDescription.length}/160</span>
                </label>
                <textarea className={`${inputCls} resize-none`} style={inputStyle} rows={3} value={form.metaDescription} maxLength={180}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} placeholder="SEO description (150-160 chars)" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Focus Keywords</label>
                <input className={inputCls} style={inputStyle} value={form.focusKeywords}
                  onChange={(e) => setForm((f) => ({ ...f, focusKeywords: e.target.value }))} placeholder="keyword1, keyword2, keyword3" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>OG Image URL</label>
                <input className={inputCls} style={inputStyle} value={form.ogImage}
                  onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} placeholder="https://... (1200x630px for social sharing)" />
              </div>
              <div>
                <label className={labelCls} style={labelStyle}>Canonical URL</label>
                <input className={inputCls} style={inputStyle} value={form.canonicalUrl}
                  onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} placeholder="Leave blank to use default." />
                <p className="text-[11px] text-stone-400 mt-1">Set only if duplicate content exists elsewhere.</p>
              </div>
            </>
          )}

          {subTab === "schema" && (
            <div>
              <label className={labelCls} style={labelStyle}>Custom JSON-LD Schema</label>
              <textarea className={`${inputCls} resize-none font-mono text-[12px]`} style={inputStyle} rows={12} value={form.schema}
                onChange={(e) => { setForm((f) => ({ ...f, schema: e.target.value })); setSchemaError(""); }}
                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "Restaurant",\n  ...\n}'} />
              {schemaError && <p className="text-[11px] text-red-500 mt-1">{schemaError}</p>}
              <p className="text-[11px] text-stone-400 mt-1">Paste raw JSON-LD. Leave blank to use the page's built-in schema.</p>
            </div>
          )}

          {subTab === "head" && (
            <div>
              <label className={labelCls} style={labelStyle}>Extra Head Tags</label>
              <textarea className={`${inputCls} resize-none font-mono text-[12px]`} style={inputStyle} rows={10} value={form.headTags}
                onChange={(e) => setForm((f) => ({ ...f, headTags: e.target.value }))}
                placeholder={'<meta name="robots" content="noindex" />'} />
              <p className="text-[11px] text-amber-600 mt-1">
                ⚠ Saved here, but not yet applied to the live page — this is groundwork for a follow-up build.
              </p>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-stone-100 flex items-center gap-3 sticky bottom-0 bg-white">
          <button onClick={handleSave} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2">
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button onClick={onClose} className="text-[12px] text-stone-500 font-semibold">Cancel</button>
          {existing && (
            <button onClick={() => reset.mutate()} disabled={reset.isPending} className="text-[12px] text-red-500 font-semibold ml-auto">
              Reset to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────── Redirects tab ───────────────────── */

function RedirectsTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ fromPath: "", toPath: "", statusCode: "301" });
  const [error, setError] = useState("");

  const { data: redirects } = useQuery({
    queryKey: ["admin-redirects"],
    queryFn: () => api.get<Redirect[]>("/api/seo/redirects"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-redirects"] });
  }

  const create = useMutation({
    mutationFn: () => api.post("/api/seo/redirects", { ...form, statusCode: Number(form.statusCode) }),
    onSuccess: () => { setForm({ fromPath: "", toPath: "", statusCode: "301" }); setError(""); invalidate(); },
    onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong"),
  });

  const toggle = useMutation({
    mutationFn: (r: Redirect) => api.patch(`/api/seo/redirects/${r.id}`, { active: !r.active }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/seo/redirects/${id}`),
    onSuccess: invalidate,
  });

  function normalizePath(v: string) {
    const trimmed = v.trim();
    if (!trimmed) return trimmed;
    return trimmed.startsWith("/") || trimmed.startsWith("http") ? trimmed : `/${trimmed}`;
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fromPath = normalizePath(form.fromPath);
    const toPath = normalizePath(form.toPath);
    if (!fromPath || !toPath) { setError("Both fields are required."); return; }
    if (fromPath === toPath) { setError("From and To can't be the same path."); return; }
    setForm((f) => ({ ...f, fromPath, toPath }));
    create.mutate();
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="bg-white rounded-xl border border-stone-200 p-4 mb-6">
        <p className="text-sm font-semibold mb-3" style={{ color: "#1a0e00" }}>Add a redirect</p>
        <div className="grid sm:grid-cols-[1fr_1fr_100px_auto] gap-3 items-end">
          <div>
            <label className={labelCls} style={labelStyle}>From path</label>
            <input className={inputCls} style={inputStyle} value={form.fromPath}
              onChange={(e) => setForm((f) => ({ ...f, fromPath: e.target.value }))} placeholder="/old-guide-url" />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>To path</label>
            <input className={inputCls} style={inputStyle} value={form.toPath}
              onChange={(e) => setForm((f) => ({ ...f, toPath: e.target.value }))} placeholder="/guides/new-guide-url" />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Type</label>
            <select className={inputCls} style={inputStyle} value={form.statusCode}
              onChange={(e) => setForm((f) => ({ ...f, statusCode: e.target.value }))}>
              <option value="301">301</option>
              <option value="302">302</option>
            </select>
          </div>
          <button type="submit" disabled={create.isPending} className="btn-gold !text-[12px] !px-4 !py-2">
            {create.isPending ? "Adding…" : "Add"}
          </button>
        </div>
        {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
      </form>

      <div className="space-y-2">
        {redirects?.length === 0 && <p className="text-sm text-stone-400 italic">No redirects yet.</p>}
        {redirects?.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-stone-200 p-3.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[13px] flex-wrap">
                <span className="font-mono text-stone-700">{r.fromPath}</span>
                <span className="text-stone-400">→</span>
                <span className="font-mono text-stone-700">{r.toPath}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(200,140,10,0.12)", color: "#a05a0a" }}>
                  {r.statusCode}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggle.mutate(r)}
              disabled={toggle.isPending}
              className="text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shrink-0"
              style={r.active ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a" } : { background: "rgba(120,120,120,0.1)", color: "#707070" }}
            >
              {r.active ? "Active" : "Inactive"}
            </button>
            <button
              onClick={() => { if (confirm("Delete this redirect?")) remove.mutate(r.id); }}
              disabled={remove.isPending}
              className="text-[11px] text-red-500 font-semibold shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────── Robots.txt tab ───────────────────── */

function RobotsTab() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["admin-seo-config"],
    queryFn: () => api.get<SiteSeoConfig>("/api/seo/config"),
  });
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (config && !loaded) {
      setValue(config.robotsTxt || DEFAULT_ROBOTS_TXT);
      setLoaded(true);
    }
  }, [config, loaded]);

  const save = useMutation({
    mutationFn: () => api.put("/api/seo/config", { robotsTxt: value, headerCode: config?.headerCode, footerCode: config?.footerCode }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-seo-config"] }),
  });

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <p className="text-sm font-semibold mb-1" style={{ color: "#1a0e00" }}>robots.txt content</p>
      <p className="text-[12px] text-stone-500 mb-3">Live at <a href="/robots.txt" target="_blank" rel="noreferrer" className="underline text-amber-700">/robots.txt</a></p>
      <textarea
        className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border font-mono resize-y"
        style={{ ...inputStyle, minHeight: 220 }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2 mt-3">
        {save.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

/* ───────────────────── Sitemap tab ───────────────────── */

// Escapes the raw XML text then wraps tag names, attribute names and
// attribute-ish string content in colour spans — a plain regex highlighter
// (no library), good enough for a read-only preview of our own
// server-generated XML (never untrusted user input).
function highlightXml(xml: string): string {
  const escaped = xml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/(&lt;\/?)([a-zA-Z0-9:]+)/g, '$1<span style="color:#f5c14a">$2</span>')
    .replace(/([a-zA-Z-]+)(=)(&quot;.*?&quot;)/g, '<span style="color:#7fd1ae">$1</span>$2<span style="color:#e08ac4">$3</span>');
}

function SitemapTab() {
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ["admin-sitemap"],
    queryFn: async () => {
      const res = await fetch("/sitemap.xml");
      const xml = await res.text();
      const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      return { xml, urls };
    },
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold" style={{ color: "#1a0e00" }}>Sitemap.xml</p>
      </div>
      <p className="text-[12px] text-stone-500 mb-4">
        Auto-generated — live at <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="underline text-amber-700">/sitemap.xml</a>.
        Every static page, guide, and What's On offer is included automatically; pages with an active redirect are excluded.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-gold !text-[12px] !px-4 !py-2 flex items-center gap-1.5"
        >
          {isFetching ? "Refreshing…" : "↻ Generate & Refresh Preview"}
        </button>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noreferrer"
          className="text-[12px] font-semibold px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition"
        >
          View Live Sitemap ↗
        </a>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {isError && <p className="text-sm text-red-500">Couldn't load the sitemap.</p>}

      {data && (
        <>
          <p className="text-[12px] text-stone-400 mb-3">
            {data.urls.length} URLs · last checked {new Date(dataUpdatedAt).toLocaleTimeString("en-AU")}
          </p>

          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-stone-400 mb-2">Sitemap.xml Preview</p>
          <pre
            className="rounded-xl p-4 mb-4 overflow-auto text-[12px] leading-relaxed font-mono"
            style={{ background: "#1a1a1a", color: "#d4d4d4", maxHeight: 320 }}
            dangerouslySetInnerHTML={{ __html: highlightXml(data.xml) }}
          />

          <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-stone-400 mb-2">All URLs</p>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-stone-100">
            {data.urls.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className={`block px-3 py-2 text-[13px] text-stone-700 hover:text-amber-700 hover:bg-amber-50 transition truncate ${i % 2 === 0 ? "bg-stone-50/60" : ""}`}
              >
                {url.replace(/^https?:\/\/[^/]+/, "")}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────── SEO Audit tab ───────────────────── */

type AuditCheck = { label: string; pass: boolean; points: number; maxPoints: number; detail: string };

// Pages spot-checked beyond the homepage — a representative spread across
// core nav, menu, and content sections rather than every page on the site.
const AUDIT_SAMPLE_PAGES = ["/", "/about", "/menu/a-la-carte", "/gallery", "/contact", "/events"];

async function runSeoAudit(): Promise<{ score: number; checks: AuditCheck[] }> {
  const checks: AuditCheck[] = [];
  const parser = new DOMParser();

  // robots.txt
  let robotsOk = false;
  let robotsHasSitemap = false;
  try {
    const res = await fetch("/robots.txt");
    const text = await res.text();
    robotsOk = res.ok && text.trim().length > 0;
    robotsHasSitemap = /Sitemap:\s*https?:\/\//i.test(text);
  } catch { /* leave both false */ }
  checks.push({ label: "robots.txt is reachable", pass: robotsOk, points: robotsOk ? 5 : 0, maxPoints: 5, detail: "/robots.txt" });
  checks.push({ label: "robots.txt references a Sitemap URL", pass: robotsHasSitemap, points: robotsHasSitemap ? 5 : 0, maxPoints: 5, detail: "Sitemap: line present" });

  // sitemap.xml
  let sitemapUrls: string[] = [];
  let sitemapOk = false;
  try {
    const res = await fetch("/sitemap.xml");
    const xml = await res.text();
    sitemapUrls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    sitemapOk = res.ok && sitemapUrls.length > 0;
  } catch { /* leave false */ }
  checks.push({ label: "sitemap.xml is reachable and valid", pass: sitemapOk, points: sitemapOk ? 10 : 0, maxPoints: 10, detail: "/sitemap.xml" });
  const enoughUrls = sitemapUrls.length >= 20;
  checks.push({ label: "sitemap has a healthy number of URLs", pass: enoughUrls, points: enoughUrls ? 10 : sitemapUrls.length > 0 ? 5 : 0, maxPoints: 10, detail: `${sitemapUrls.length} URLs listed` });

  // sample a few sitemap URLs for real 200s (page health, not just listed)
  const sample = sitemapUrls.slice(0, 6);
  let sampleOkCount = 0;
  await Promise.all(sample.map(async (url) => {
    try {
      const path = new URL(url).pathname;
      const res = await fetch(path, { method: "HEAD" });
      if (res.ok) sampleOkCount++;
    } catch { /* counts as not-ok */ }
  }));
  const sampleHealthy = sample.length > 0 && sampleOkCount === sample.length;
  checks.push({
    label: "Sampled sitemap URLs actually load",
    pass: sampleHealthy,
    points: sample.length ? Math.round((sampleOkCount / sample.length) * 10) : 0,
    maxPoints: 10,
    detail: sample.length ? `${sampleOkCount}/${sample.length} sampled URLs returned 200` : "no URLs to sample",
  });

  // per-page on-page checks
  let titlePoints = 0, descPoints = 0, canonicalPoints = 0, ogPoints = 0;
  const perPageMax = AUDIT_SAMPLE_PAGES.length;
  const seenTitles = new Set<string>();
  let duplicateTitles = false;
  for (const path of AUDIT_SAMPLE_PAGES) {
    try {
      const res = await fetch(path);
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");
      const title = doc.querySelector("title")?.textContent?.trim() ?? "";
      const desc = doc.querySelector('meta[name="description"]')?.getAttribute("content")?.trim() ?? "";
      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
      const og = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ?? "";

      if (title.length >= 10 && title.length <= 70) titlePoints++;
      if (desc.length >= 50 && desc.length <= 160) descPoints++;
      if (canonical) canonicalPoints++;
      if (og) ogPoints++;
      if (title) {
        if (seenTitles.has(title)) duplicateTitles = true;
        seenTitles.add(title);
      }
    } catch { /* page unreachable — counts as failing every check for it */ }
  }
  checks.push({ label: "Page titles are a healthy length (10–70 chars)", pass: titlePoints === perPageMax, points: Math.round((titlePoints / perPageMax) * 15), maxPoints: 15, detail: `${titlePoints}/${perPageMax} sampled pages` });
  checks.push({ label: "Meta descriptions are a healthy length (50–160 chars)", pass: descPoints === perPageMax, points: Math.round((descPoints / perPageMax) * 15), maxPoints: 15, detail: `${descPoints}/${perPageMax} sampled pages` });
  checks.push({ label: "No duplicate page titles", pass: !duplicateTitles, points: duplicateTitles ? 0 : 5, maxPoints: 5, detail: duplicateTitles ? "two or more sampled pages share a title" : "all sampled titles unique" });
  checks.push({ label: "Canonical tag present", pass: canonicalPoints === perPageMax, points: Math.round((canonicalPoints / perPageMax) * 10), maxPoints: 10, detail: `${canonicalPoints}/${perPageMax} sampled pages` });
  checks.push({ label: "Social preview image (og:image) present", pass: ogPoints === perPageMax, points: Math.round((ogPoints / perPageMax) * 5), maxPoints: 5, detail: `${ogPoints}/${perPageMax} sampled pages` });

  // viewport + https, checked once against the homepage response we already have context for
  let hasViewport = false;
  try {
    const res = await fetch("/");
    const html = await res.text();
    const doc = parser.parseFromString(html, "text/html");
    hasViewport = !!doc.querySelector('meta[name="viewport"]');
  } catch { /* leave false */ }
  checks.push({ label: "Mobile viewport meta tag present", pass: hasViewport, points: hasViewport ? 5 : 0, maxPoints: 5, detail: "homepage <head>" });
  const isHttps = window.location.protocol === "https:";
  checks.push({ label: "Served over HTTPS", pass: isHttps, points: isHttps ? 5 : 0, maxPoints: 5, detail: window.location.origin });

  const score = checks.reduce((s, c) => s + c.points, 0);
  return { score, checks };
}

function SeoAuditTab() {
  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["admin-seo-audit"],
    queryFn: runSeoAudit,
    staleTime: Infinity,
  });

  const score = data?.score ?? 0;
  const scoreColor = score >= 80 ? "#3f7d58" : score >= 50 ? "#c8860a" : "#c0392b";

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold" style={{ color: "#1a0e00" }}>SEO Audit</p>
        <button onClick={() => refetch()} disabled={isFetching} className="btn-gold !text-[12px] !px-4 !py-2">
          {isFetching ? "Running…" : "Run Audit"}
        </button>
      </div>
      <p className="text-[12px] text-stone-500 mb-5">
        A live check of robots.txt, sitemap.xml, and on-page SEO basics across {AUDIT_SAMPLE_PAGES.length} representative pages — run fresh each time, not stored.
      </p>

      {isLoading && <p className="text-sm text-stone-500">Running audit…</p>}

      {data && (
        <>
          <div className="flex items-center gap-5 mb-6 p-5 rounded-xl" style={{ background: "#fdf6e4" }}>
            <div
              className="flex items-center justify-center rounded-full font-display text-3xl flex-shrink-0"
              style={{ width: 84, height: 84, background: "#fff", color: scoreColor, border: `4px solid ${scoreColor}` }}
            >
              {score}
            </div>
            <div>
              <p className="font-display text-xl" style={{ color: "#1a0e00" }}>{score} / 100</p>
              <p className="text-[12px] text-stone-500">
                {score >= 80 ? "Strong — nothing urgent." : score >= 50 ? "Decent, but a few things worth fixing." : "Needs attention."}
                {dataUpdatedAt ? ` Last run ${new Date(dataUpdatedAt).toLocaleTimeString("en-AU")}.` : ""}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {data.checks.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg" style={{ background: i % 2 === 0 ? "#fafaf9" : "transparent" }}>
                <span
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: c.pass ? "#3f7d58" : c.points > 0 ? "#c8860a" : "#c0392b" }}
                >
                  {c.pass ? "✓" : c.points > 0 ? "!" : "✕"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-stone-800">{c.label}</p>
                  <p className="text-[11px] text-stone-500">{c.detail}</p>
                </div>
                <span className="text-[12px] font-semibold text-stone-400 flex-shrink-0">{c.points}/{c.maxPoints}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ───────────────────── Header/Footer Code tab ───────────────────── */

function CodeTab() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ["admin-seo-config"],
    queryFn: () => api.get<SiteSeoConfig>("/api/seo/config"),
  });
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (config && !loaded) {
      setHeader(config.headerCode ?? "");
      setFooter(config.footerCode ?? "");
      setLoaded(true);
    }
  }, [config, loaded]);

  const save = useMutation({
    mutationFn: () => api.put("/api/seo/config", { robotsTxt: config?.robotsTxt, headerCode: header, footerCode: footer }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-seo-config"] }),
  });

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <p className="text-sm font-semibold mb-1" style={{ color: "#1a0e00" }}>Header Code</p>
        <p className="text-[12px] text-stone-500 mb-3">Injected into every page's <code>&lt;head&gt;</code> — e.g. Google Tag Manager, verification tags.</p>
        <textarea
          className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border font-mono resize-y"
          style={{ ...inputStyle, minHeight: 140 }}
          value={header}
          onChange={(e) => setHeader(e.target.value)}
          placeholder="<!-- Google Tag Manager -->"
        />
      </div>
      <div className="bg-white rounded-xl border border-stone-200 p-5">
        <p className="text-sm font-semibold mb-1" style={{ color: "#1a0e00" }}>Footer Code</p>
        <p className="text-[12px] text-stone-500 mb-3">Injected right before <code>&lt;/body&gt;</code> on every page.</p>
        <textarea
          className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border font-mono resize-y"
          style={{ ...inputStyle, minHeight: 140 }}
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="<!-- GTM (noscript) -->"
        />
      </div>
      <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[12px] !px-4 !py-2">
        {save.isPending ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
