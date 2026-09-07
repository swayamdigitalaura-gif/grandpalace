import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type Review } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/reviews")({
  component: AdminReviews,
});

const inputCls = "w-full rounded-lg px-3 py-2 text-sm bg-white text-stone-900 placeholder:text-stone-400 border border-stone-200 outline-none focus:border-amber-500";
const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-stone-500 mb-1";

function AdminReviews() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => api.get<Review[]>("/api/reviews/admin/all"),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Reviews</h1>
      <p className="text-sm text-stone-500 mb-6">
        Real guest reviews shown in the homepage "What Our Guests Say" section. Inactive reviews stay saved here but
        won't appear on the live site. Order (top to bottom here) matches the order they appear on the site.
      </p>

      <NewReviewForm nextSort={reviews?.length ?? 0} onSaved={invalidate} />

      {isLoading && <p className="text-sm text-stone-500 mt-6">Loading…</p>}

      <div className="space-y-3 mt-6">
        {reviews?.map((r) => (
          <ReviewCard key={r.id} review={r} onChanged={invalidate} />
        ))}
      </div>
    </div>
  );
}

function NewReviewForm({ nextSort, onSaved }: { nextSort: number; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [reviewerMeta, setReviewerMeta] = useState("");
  const [quote, setQuote] = useState("");
  const [stars, setStars] = useState(5);

  const create = useMutation({
    mutationFn: () => api.post("/api/reviews", { name, reviewerMeta: reviewerMeta || null, quote, stars, source: "Google", active: true, sortOrder: nextSort }),
    onSuccess: () => { setName(""); setReviewerMeta(""); setQuote(""); setStars(5); setOpen(false); onSaved(); },
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline-gold !text-[11px] !px-4 !py-2">
        + Add Review
      </button>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div><label className={labelCls}>Reviewer Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tyra L" required /></div>
        <div><label className={labelCls}>Meta line (optional)</label><input className={inputCls} value={reviewerMeta} onChange={(e) => setReviewerMeta(e.target.value)} placeholder="e.g. Local Guide · 18 reviews" /></div>
      </div>
      <div><label className={labelCls}>Review Text</label><textarea className={inputCls} rows={4} value={quote} onChange={(e) => setQuote(e.target.value)} required /></div>
      <div className="flex items-center gap-3">
        <div><label className={labelCls}>Stars</label>
          <select className={inputCls} value={stars} onChange={(e) => setStars(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-gold !text-[11px] !px-4 !py-2 mt-5" disabled={create.isPending}>{create.isPending ? "Saving…" : "Save Review"}</button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-500 mt-5">Cancel</button>
      </div>
    </form>
  );
}

function ReviewCard({ review, onChanged }: { review: Review; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(review.name);
  const [reviewerMeta, setReviewerMeta] = useState(review.reviewerMeta ?? "");
  const [quote, setQuote] = useState(review.quote);
  const [stars, setStars] = useState(review.stars);

  const save = useMutation({
    mutationFn: () => api.patch(`/api/reviews/${review.id}`, { name, reviewerMeta: reviewerMeta || null, quote, stars }),
    onSuccess: () => { setEditing(false); onChanged(); },
  });
  const toggleActive = useMutation({
    mutationFn: () => api.patch(`/api/reviews/${review.id}`, { active: !review.active }),
    onSuccess: onChanged,
  });
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/reviews/${review.id}`),
    onSuccess: onChanged,
  });

  if (editing) {
    return (
      <div className="bg-white rounded-xl border border-amber-300 p-4 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={labelCls}>Reviewer Name</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className={labelCls}>Meta line (optional)</label><input className={inputCls} value={reviewerMeta} onChange={(e) => setReviewerMeta(e.target.value)} /></div>
        </div>
        <div><label className={labelCls}>Review Text</label><textarea className={inputCls} rows={4} value={quote} onChange={(e) => setQuote(e.target.value)} /></div>
        <div className="flex items-center gap-3">
          <div><label className={labelCls}>Stars</label>
            <select className={inputCls} value={stars} onChange={(e) => setStars(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => save.mutate()} disabled={save.isPending} className="btn-gold !text-[11px] !px-4 !py-2 mt-5">{save.isPending ? "Saving…" : "Save"}</button>
          <button onClick={() => setEditing(false)} className="text-xs text-stone-500 mt-5">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 ${review.active ? "bg-white border-stone-200" : "bg-stone-100 border-stone-200 opacity-60"}`}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <p className="font-semibold text-sm text-stone-900">{review.name} <span className="text-amber-500">{"★".repeat(review.stars)}</span></p>
          {review.reviewerMeta && <p className="text-[11px] text-stone-400">{review.reviewerMeta}</p>}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
          style={review.active
            ? { background: "rgba(74,140,58,0.12)", color: "#4a8c3a", border: "1px solid rgba(74,140,58,0.3)" }
            : { background: "rgba(160,90,10,0.1)", color: "#a05a0a", border: "1px solid rgba(160,90,10,0.3)" }}>
          {review.active ? "● Live" : "○ Hidden"}
        </span>
      </div>
      <p className="text-[13px] text-stone-600 leading-relaxed mb-3">{review.quote}</p>
      <div className="flex gap-4 pt-3 border-t border-stone-100">
        <button onClick={() => setEditing(true)} className="text-[12px] text-amber-700 font-semibold">Edit</button>
        <button onClick={() => toggleActive.mutate()} className="text-[12px] text-stone-600 font-semibold">{review.active ? "Hide" : "Show"}</button>
        <button onClick={() => { if (confirm(`Delete review from "${review.name}"?`)) remove.mutate(); }} className="text-[12px] text-red-600 font-semibold">Delete</button>
      </div>
    </div>
  );
}
