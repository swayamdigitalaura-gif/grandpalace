import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, type Enquiry } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/leads/$type")({
  loader: ({ params }) => {
    if (!LEAD_TYPES.some((t) => t.id === params.type)) throw notFound();
  },
  component: AdminLeads,
});

// Single source of truth for the lead-type tabs — also imported by the admin
// sidebar (admin.tsx) so it can render them as sub-links with count badges.
export const LEAD_TYPES: { id: string; label: string }[] = [
  { id: "contact", label: "Contact" },
  { id: "events", label: "Events" },
  { id: "office-catering", label: "Office Catering" },
  { id: "venue-catering", label: "Venue Catering" },
  { id: "venue-for-hire", label: "Venue Hire" },
  { id: "birthday", label: "Birthday" },
];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  "new": { bg: "rgba(200,60,60,0.12)", color: "#b03030", dot: "#d64545" },
  "in-progress": { bg: "rgba(200,140,10,0.12)", color: "#a05a0a", dot: "#c8860a" },
  "completed": { bg: "rgba(74,140,58,0.12)", color: "#4a8c3a", dot: "#4a8c3a" },
  "contacted": { bg: "rgba(60,110,200,0.12)", color: "#3060b0", dot: "#3060b0" },
  "closed": { bg: "rgba(120,120,120,0.12)", color: "#707070", dot: "#a8a29e" },
};

// Ordered wizard steps for the Birthday form — index drives the progress bar.
const BIRTHDAY_STEPS = [
  { id: "reserve", label: "Details" },
  { id: "cake", label: "Cake" },
  { id: "confirm", label: "Payment" },
];

// Human-friendly labels for known `data` fields — falls back to a generic
// camelCase-splitter for anything not listed here.
const FIELD_LABELS: Record<string, string> = {
  amountPaidAud: "Amount Paid",
  stripeSessionId: "Stripe Session ID",
  eventType: "Event Type",
  preferredDate: "Preferred Date",
  preferredTime: "Preferred Time",
};

function fieldLabel(key: string) {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

function fieldValue(key: string, value: unknown) {
  if (key === "amountPaidAud") return `A$${value}`;
  return String(value);
}

const DATE_FILTERS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
] as const;

function withinFilter(iso: string, filter: (typeof DATE_FILTERS)[number]["id"]) {
  if (filter === "all") return true;
  const date = new Date(iso).getTime();
  const now = Date.now();
  if (filter === "today") {
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    return date >= startOfDay;
  }
  const days = filter === "7d" ? 7 : 30;
  return date >= now - days * 24 * 60 * 60 * 1000;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function AdminLeads() {
  const { type: tab } = Route.useParams();
  const queryClient = useQueryClient();
  const tabInfo = LEAD_TYPES.find((t) => t.id === tab)!;
  const [dateFilter, setDateFilter] = useState<(typeof DATE_FILTERS)[number]["id"]>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads", tab],
    queryFn: () => api.get<Enquiry[]>(`/api/enquiries?type=${tab}`),
    refetchInterval: 30_000,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-leads", tab] });
    queryClient.invalidateQueries({ queryKey: ["admin-lead-counts"] });
  }

  // Latest activity first, always — simplest to scan and matches how you'd
  // expect a lead list to behave. Use the Status filter to isolate
  // unfinished leads instead of relying on sort order for that.
  const filtered = useMemo(() => {
    return (leads ?? [])
      .filter((l) => withinFilter(l.updatedAt, dateFilter))
      .filter((l) => statusFilter === "all" || l.status === statusFilter)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [leads, dateFilter, statusFilter]);

  const statusesPresent = useMemo(
    () => Array.from(new Set((leads ?? []).map((l) => l.status))),
    [leads]
  );

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Leads — {tabInfo.label}</h1>
      <p className="text-sm text-stone-500 mb-5">
        Every enquiry form on the site saves here automatically, newest first.
        {tab === "birthday" && " Birthday leads update live as the customer moves through the booking steps — even if they never finish."}
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition"
              style={
                dateFilter === f.id
                  ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                  : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        {statusesPresent.length > 1 && (
          <div className="flex gap-1.5 flex-wrap items-center border-l border-stone-200 pl-4">
            <button
              onClick={() => setStatusFilter("all")}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition"
              style={statusFilter === "all" ? { background: "#3a2a10", color: "#fff" } : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }}
            >
              All statuses
            </button>
            {statusesPresent.map((s) => {
              const style = STATUS_STYLE[s] ?? STATUS_STYLE.new;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition"
                  style={statusFilter === s ? { background: style.color, color: "#fff" } : { background: style.bg, color: style.color }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
        <span className="text-[12px] text-stone-400 ml-auto">{filtered.length} of {leads?.length ?? 0}</span>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-stone-400 italic">No leads match this filter.</p>
      )}

      <div className="space-y-2.5">
        {filtered.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onChanged={invalidate} />
        ))}
      </div>
    </div>
  );
}

// Small inline progress bar — the whole point is you can tell exactly where a
// Birthday customer dropped off without opening the card.
function BirthdayProgress({ step, status }: { step: string | null; status: string }) {
  const completed = status === "completed";
  const currentIndex = completed ? BIRTHDAY_STEPS.length - 1 : BIRTHDAY_STEPS.findIndex((s) => s.id === step);
  const reachedIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {BIRTHDAY_STEPS.map((s, i) => {
        const isDone = completed || i < reachedIndex;
        const isCurrent = !completed && i === reachedIndex;
        return (
          <div key={s.id} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center gap-1">
              <div
                className="h-2.5 w-2.5 rounded-full transition-colors"
                style={{
                  background: isDone ? "#4a8c3a" : isCurrent ? "#c8860a" : "#e7e0d4",
                  boxShadow: isCurrent ? "0 0 0 3px rgba(200,134,10,0.18)" : "none",
                }}
              />
              <span
                className="text-[9px] font-semibold uppercase tracking-wide whitespace-nowrap"
                style={{ color: isDone ? "#4a8c3a" : isCurrent ? "#a05a0a" : "#b8ada0" }}
              >
                {s.label}
              </span>
            </div>
            {i < BIRTHDAY_STEPS.length - 1 && (
              <div className="w-6 h-[2px] rounded mb-3.5" style={{ background: (completed || i < reachedIndex) ? "#4a8c3a" : "#e7e0d4" }} />
            )}
          </div>
        );
      })}
      {!completed && (
        <span
          className="ml-3 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
          style={{ background: "rgba(200,60,60,0.1)", color: "#b03030" }}
        >
          Dropped off here
        </span>
      )}
    </div>
  );
}

function LeadCard({ lead, onChanged }: { lead: Enquiry; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const statusStyle = STATUS_STYLE[lead.status] ?? STATUS_STYLE.new;
  const isBirthday = lead.type === "birthday";

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/api/enquiries/${lead.id}`, { status }),
    onSuccess: onChanged,
  });

  const remove = useMutation({
    mutationFn: () => api.delete(`/api/enquiries/${lead.id}`),
    onSuccess: onChanged,
  });

  const extraFields = lead.data && Object.keys(lead.data).length > 0
    ? Object.entries(lead.data).filter(([, v]) => v !== null && v !== "")
    : [];

  // Pull the 1-2 most useful fields (e.g. date/guests) into the collapsed row
  // so you don't have to open every card just to see the essentials.
  const quickFacts = extraFields
    .filter(([k]) => ["date", "guests", "eventDate", "preferredDate"].includes(k))
    .slice(0, 2);

  return (
    <div
      className="bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-[0_4px_16px_-6px_rgba(0,0,0,0.12)]"
      style={{ borderColor: "rgba(0,0,0,0.08)", borderLeft: `4px solid ${statusStyle.dot}` }}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-start justify-between gap-4 p-4 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[15px]" style={{ color: "#1a0e00" }}>{lead.name || "(no name yet)"}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: statusStyle.bg, color: statusStyle.color }}>
              {lead.status}
            </span>
            {quickFacts.length > 0 && (
              <span className="text-[11px] text-stone-500">
                {quickFacts.map(([k, v]) => `${fieldLabel(k)}: ${v}`).join(" · ")}
              </span>
            )}
          </div>
          <p className="text-[12px] text-stone-500 mt-0.5 truncate">
            {[lead.email, lead.phone].filter(Boolean).join(" · ") || "No contact details yet"}
            {lead.subject ? ` — ${lead.subject}` : ""}
          </p>
          {isBirthday && <BirthdayProgress step={lead.step} status={lead.status} />}
        </div>
        <div className="text-[11px] text-stone-400 whitespace-nowrap shrink-0 text-right">
          <div className="font-medium" style={{ color: "#8a7a60" }}>{timeAgo(lead.updatedAt)}</div>
          <div className="mt-0.5">{formatDate(lead.updatedAt)}</div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-stone-100 pt-3 space-y-3">
          {lead.message && (
            <p className="text-[13px] text-stone-700 bg-stone-50 rounded-lg p-3 whitespace-pre-wrap">{lead.message}</p>
          )}
          {extraFields.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
              {extraFields.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-stone-100 py-1">
                  <span className="text-stone-400 shrink-0">{fieldLabel(k)}</span>
                  <span className="text-stone-800 font-medium text-right break-all">{fieldValue(k, v)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] text-stone-400 mr-1">Mark as:</span>
            {["new", "contacted", "completed", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus.mutate(s)}
                disabled={updateStatus.isPending || lead.status === s}
                className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full disabled:opacity-40"
                style={lead.status === s ? { background: statusStyle.bg, color: statusStyle.color } : { background: "#f5f5f4", color: "#78716c" }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => { if (confirm("Delete this lead permanently?")) remove.mutate(); }}
              disabled={remove.isPending}
              className="text-[11px] text-red-500 font-semibold ml-auto"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
