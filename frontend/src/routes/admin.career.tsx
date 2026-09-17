import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/career")({
  component: AdminCareer,
});

type JobPosting = {
  id: string;
  title: string;
  subtitle: string | null;
  badge1: string | null;
  badge2: string | null;
  requirements: string[];
  responsibilities: string[];
  published: boolean;
  sortOrder: number;
};

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 outline-none focus:border-amber-500";
const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1";

// Requirements/responsibilities are edited as one line per item in a
// textarea — simpler than a dynamic add/remove-row list, and matches how
// admins already edit multi-paragraph text elsewhere (Content editor's
// "blank line between" fields).
function linesToList(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}
function listToLines(list: string[]): string {
  return (list ?? []).join("\n");
}

function AdminCareer() {
  const queryClient = useQueryClient();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => api.get<JobPosting[]>("/api/jobs/admin"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Career — Job Openings</h1>
      <p className="text-sm text-stone-500 mb-6">
        Openings shown on the /career page. Unpublished postings stay saved here but won't appear on the live site.
        Order (top to bottom here) matches the order they appear on the site.
      </p>

      <NewJobForm nextSort={jobs?.length ?? 0} onSaved={invalidate} />

      {isLoading && <p className="text-sm text-stone-500 mt-6">Loading…</p>}

      <div className="space-y-3 mt-6">
        {jobs?.map((job) => (
          <JobCard key={job.id} job={job} onChanged={invalidate} />
        ))}
      </div>
    </div>
  );
}

function JobFields({
  title, setTitle, subtitle, setSubtitle, badge1, setBadge1, badge2, setBadge2,
  requirements, setRequirements, responsibilities, setResponsibilities,
}: {
  title: string; setTitle: (v: string) => void;
  subtitle: string; setSubtitle: (v: string) => void;
  badge1: string; setBadge1: (v: string) => void;
  badge2: string; setBadge2: (v: string) => void;
  requirements: string; setRequirements: (v: string) => void;
  responsibilities: string; setResponsibilities: (v: string) => void;
}) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Job Title</label><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chef / Cook" required /></div>
        <div><label className={labelCls}>Subtitle</label><input className={inputCls} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. The Grand Palace Indian Restaurant · Sydney CBD" /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Badge 1 (e.g. Full Time)</label><input className={inputCls} value={badge1} onChange={(e) => setBadge1(e.target.value)} placeholder="Full Time" /></div>
        <div><label className={labelCls}>Badge 2 (e.g. Current Opening)</label><input className={inputCls} value={badge2} onChange={(e) => setBadge2(e.target.value)} placeholder="Current Opening" /></div>
      </div>
      <div><label className={labelCls}>Requirements (one per line)</label><textarea className={inputCls} rows={5} value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder={"Minimum 3 years experience\nCertificate III or IV in Commercial Cookery"} /></div>
      <div><label className={labelCls}>Responsibilities (one per line)</label><textarea className={inputCls} rows={5} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder={"Plan and oversee food preparation\nEnsure portion control and food quality standards"} /></div>
    </>
  );
}

function NewJobForm({ nextSort, onSaved }: { nextSort: number; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [badge1, setBadge1] = useState("Full Time");
  const [badge2, setBadge2] = useState("Current Opening");
  const [requirements, setRequirements] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  const create = useMutation({
    mutationFn: () => api.post("/api/jobs", {
      title, subtitle: subtitle || null, badge1: badge1 || null, badge2: badge2 || null,
      requirements: linesToList(requirements), responsibilities: linesToList(responsibilities),
      published: true, sortOrder: nextSort,
    }),
    onSuccess: () => {
      setTitle(""); setSubtitle(""); setBadge1("Full Time"); setBadge2("Current Opening");
      setRequirements(""); setResponsibilities(""); setOpen(false); onSaved();
    },
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline-gold !text-[11px] !px-4 !py-2">
        + Add Job Opening
      </button>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
      <JobFields
        title={title} setTitle={setTitle}
        subtitle={subtitle} setSubtitle={setSubtitle}
        badge1={badge1} setBadge1={setBadge1}
        badge2={badge2} setBadge2={setBadge2}
        requirements={requirements} setRequirements={setRequirements}
        responsibilities={responsibilities} setResponsibilities={setResponsibilities}
      />
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-gold !text-[11px] !px-4 !py-2" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save Opening"}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-500">Cancel</button>
      </div>
    </form>
  );
}

function JobCard({ job, onChanged }: { job: JobPosting; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(job.title);
  const [subtitle, setSubtitle] = useState(job.subtitle ?? "");
  const [badge1, setBadge1] = useState(job.badge1 ?? "");
  const [badge2, setBadge2] = useState(job.badge2 ?? "");
  const [requirements, setRequirements] = useState(listToLines(job.requirements));
  const [responsibilities, setResponsibilities] = useState(listToLines(job.responsibilities));

  const save = useMutation({
    mutationFn: () => api.patch(`/api/jobs/${job.id}`, {
      title, subtitle: subtitle || null, badge1: badge1 || null, badge2: badge2 || null,
      requirements: linesToList(requirements), responsibilities: linesToList(responsibilities),
    }),
    onSuccess: () => { setEditing(false); onChanged(); },
  });
  const togglePublished = useMutation({
    mutationFn: () => api.patch(`/api/jobs/${job.id}`, { published: !job.published }),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/jobs/${job.id}`),
    onSuccess: onChanged,
  });

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-amber-300 p-4 space-y-3">
        <JobFields
          title={title} setTitle={setTitle}
          subtitle={subtitle} setSubtitle={setSubtitle}
          badge1={badge1} setBadge1={setBadge1}
          badge2={badge2} setBadge2={setBadge2}
          requirements={requirements} setRequirements={setRequirements}
          responsibilities={responsibilities} setResponsibilities={setResponsibilities}
        />
        <div className="flex items-center gap-3">
          <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[11px] !px-4 !py-2">{save.isPending ? "Saving…" : "Save"}</button>
          <button onClick={() => setEditing(false)} className="text-xs text-stone-500">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${job.published ? "bg-white border-stone-200" : "bg-stone-100 border-stone-200 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="font-semibold text-sm text-stone-900">{job.title}</p>
          {job.subtitle && <p className="text-[11px] text-stone-400">{job.subtitle}</p>}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
          style={job.published
            ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a", border: "1px solid rgba(74,140,58,0.3)" }
            : { background: "rgba(160,90,10,0.1)", color: "#a05a0a", border: "1px solid rgba(160,90,10,0.3)" }}>
          {job.published ? "● Live" : "○ Hidden"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {job.badge1 && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-amber-100 text-amber-800">{job.badge1}</span>}
        {job.badge2 && <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-green-100 text-green-800">{job.badge2}</span>}
      </div>
      <p className="text-[12px] text-stone-500 mb-1">{job.requirements.length} requirement{job.requirements.length === 1 ? "" : "s"} · {job.responsibilities.length} responsibilit{job.responsibilities.length === 1 ? "y" : "ies"}</p>
      <div className="flex gap-4 pt-3 border-t border-stone-100 mt-2">
        <button onClick={() => setEditing(true)} className="text-[12px] text-amber-700 font-semibold">Edit</button>
        <button onClick={() => togglePublished.mutate()} className="text-[12px] text-stone-600 font-semibold">{job.published ? "Hide" : "Show"}</button>
        <button onClick={() => { if (confirm(`Delete "${job.title}"?`)) remove.mutate(); }} className="text-[12px] text-red-600 font-semibold">Delete</button>
      </div>
    </div>
  );
}
