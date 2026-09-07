import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/admin-api";
import { LEAD_TYPES } from "./admin.leads.$type";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/content", label: "Pages" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/site-images", label: "Site Images" },
  { to: "/admin/pages", label: "What's On Pages" },
  { to: "/admin/guides", label: "Guides" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/seo", label: "SEO" },
];

function LeadsNavSection({ active, activeType }: { active: boolean; activeType?: string }) {
  const { data: counts } = useQuery({
    queryKey: ["admin-lead-counts"],
    queryFn: () => api.get<Record<string, number>>("/api/enquiries/counts"),
    refetchInterval: 30_000,
  });
  const total = counts ? Object.values(counts).reduce((s, n) => s + n, 0) : 0;

  return (
    <div className="mb-1">
      <Link
        to="/admin/leads/$type"
        params={{ type: "contact" }}
        className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
        style={active ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" } : { color: "rgba(253,246,232,0.75)" }}
      >
        Leads
        {!!total && (
          <span
            className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center"
            style={active ? { background: "rgba(255,255,255,0.3)" } : { background: "rgba(230,160,32,0.2)", color: "#e6a020" }}
          >
            {total}
          </span>
        )}
      </Link>
      {active && (
        <div className="mt-1 ml-2 pl-3 space-y-0.5" style={{ borderLeft: "1px solid rgba(230,160,32,0.2)" }}>
          {LEAD_TYPES.map((t) => {
            const isActive = activeType === t.id;
            return (
              <Link
                key={t.id}
                to="/admin/leads/$type"
                params={{ type: t.id }}
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                style={isActive ? { background: "rgba(230,160,32,0.18)", color: "#fdf6e8" } : { color: "rgba(253,246,232,0.55)" }}
              >
                {t.label}
                {!!counts?.[t.id] && (
                  <span className="text-[10px]" style={{ color: isActive ? "#e6a020" : "rgba(253,246,232,0.4)" }}>
                    {counts[t.id]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  const { data: me, isLoading, error } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => api.get<{ email: string }>("/api/auth/me"),
    // Retry transient failures (cold serverless start, a brief network/proxy
    // blip) instead of instantly treating them as "logged out" — only a
    // genuine 401 from the server means the session is actually invalid.
    // Without this, any one-off hiccup talking to /api/auth/me bounced the
    // admin to the login screen mid-edit, which could discard unsaved work
    // (e.g. a new guide that was never actually saved).
    retry: (failureCount, err) => !(err instanceof ApiError && err.status === 401) && failureCount < 2,
    retryDelay: 800,
    enabled: !isLoginPage,
  });
  const sessionInvalid = error instanceof ApiError && error.status === 401;

  useEffect(() => {
    if (!isLoginPage && !isLoading && sessionInvalid) {
      navigate({ to: "/admin/login" });
    }
  }, [isLoginPage, isLoading, sessionInvalid, navigate]);

  if (isLoginPage) return <Outlet />;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0500" }}>
        <p className="text-[#e6a020] text-sm tracking-widest uppercase">Loading…</p>
      </div>
    );
  }

  if (sessionInvalid) return null; // redirecting

  if (error) {
    // A genuinely non-auth error (network/server failure after retries) —
    // don't silently discard the admin's place in the app or their unsaved
    // work by redirecting to login; let them retry instead.
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0c0500" }}>
        <div className="text-center">
          <p className="text-[#e6a020] text-sm mb-3">Couldn't reach the server. Check your connection and try again.</p>
          <button
            className="text-[12px] uppercase tracking-widest font-bold px-4 py-2 rounded-lg"
            style={{ background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const onLeads = pathname.startsWith("/admin/leads");
  const activeLeadType = pathname.split("/")[3]; // /admin/leads/<type>

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f2e8" }}>
      <aside
        className="w-56 flex-shrink-0 flex flex-col text-cream"
        style={{ background: "linear-gradient(180deg,#1a0e00 0%,#0c0500 100%)" }}
      >
        <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(230,160,32,0.2)" }}>
          <p className="text-[9px] tracking-[0.5em] uppercase font-semibold" style={{ color: "#e6a020" }}>
            The Grand Palace
          </p>
          <p className="font-display text-xl mt-1" style={{ color: "#fdf6e8" }}>Admin</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <LeadsNavSection active={onLeads} activeType={activeLeadType} />
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="block px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all"
                style={
                  active
                    ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                    : { color: "rgba(253,246,232,0.75)" }
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(230,160,32,0.2)" }}>
          <p className="px-3 text-[11px] mb-2" style={{ color: "rgba(253,246,232,0.5)" }}>{me?.email}</p>
          <button
            onClick={async () => {
              await api.post("/api/auth/logout");
              navigate({ to: "/admin/login" });
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium"
            style={{ color: "rgba(253,246,232,0.75)" }}
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
