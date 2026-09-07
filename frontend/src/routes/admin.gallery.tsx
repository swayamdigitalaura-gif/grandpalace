import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, type GalleryImage } from "@/lib/admin-api";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

const COLLECTIONS = [
  { id: "gallery-page", label: "Our Gallery Page", page: "/gallery", categories: ["Interior", "Food", "Events", "Platter Box"] },
  { id: "homepage", label: "Homepage Gallery", page: "/ (homepage)", categories: ["Food", "Interior", "Birthday Celebration", "Events", "Catering", "Platter Box"] },
];

function AdminGallery() {
  const [collectionId, setCollectionId] = useState(COLLECTIONS[0].id);
  const collection = COLLECTIONS.find((c) => c.id === collectionId)!;
  const queryClient = useQueryClient();

  const { data: images, isLoading } = useQuery({
    queryKey: ["admin-gallery", collectionId],
    queryFn: () => api.get<GalleryImage[]>(`/api/gallery?collection=${collectionId}`),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["admin-gallery", collectionId] });
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="font-display text-3xl mb-1" style={{ color: "#1a0e00" }}>Gallery</h1>
      <p className="text-sm text-stone-500 mb-6">
        The site has two separate photo sets — the homepage's own gallery section, and the full <strong>/gallery</strong> page.
        Pick which one to edit below.
      </p>

      <div className="flex gap-2 mb-6">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCollectionId(c.id)}
            className="px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-wide transition"
            style={
              collectionId === c.id
                ? { background: "linear-gradient(90deg,#c8860a,#e6a020)", color: "#fff" }
                : { background: "#fff", color: "#7a5020", border: "1px solid rgba(200,140,30,0.25)" }
            }
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-stone-500 mb-4">Shown on {collection.page}</p>

      <NewImageForm collection={collection} nextSort={images?.length ?? 0} onSaved={invalidate} />

      {isLoading && <p className="text-sm text-stone-500 mt-6">Loading…</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
        {images?.map((img) => (
          <ImageCard key={img.id} image={img} onChanged={invalidate} />
        ))}
      </div>
    </div>
  );
}

function NewImageForm({
  collection, nextSort, onSaved,
}: {
  collection: { id: string; categories: string[] };
  nextSort: number;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(collection.categories[0]);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");

  const create = useMutation({
    mutationFn: () => api.post("/api/gallery", { collection: collection.id, category, url, alt, sortOrder: nextSort }),
    onSuccess: () => { setUrl(""); setAlt(""); setOpen(false); onSaved(); },
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline-gold !text-[11px] !px-4 !py-2">
        + Add Photo
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
      className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap gap-4 items-end"
    >
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#7a5020" }}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm bg-white outline-none border"
          style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
        >
          {collection.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <ImageUploadField label="Photo" value={url} onChange={setUrl} />
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#7a5020" }}>Alt text</label>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm bg-white outline-none border w-56"
          style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
        />
      </div>
      <button type="submit" className="btn-gold !text-[11px] !px-4 !py-2" disabled={create.isPending}>Save</button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-500">Cancel</button>
    </form>
  );
}

function ImageCard({ image, onChanged }: { image: GalleryImage; onChanged: () => void }) {
  const remove = useMutation({
    mutationFn: () => api.delete(`/api/gallery/${image.id}`),
    onSuccess: onChanged,
  });

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-stone-200">
      <img src={image.url} alt={image.alt ?? ""} className="w-full h-32 object-cover" />
      <div className="p-2">
        <p className="text-[11px] font-semibold text-stone-600">{image.category}</p>
        <button
          onClick={() => { if (confirm("Delete this photo?")) remove.mutate(); }}
          className="text-[11px] text-red-600 font-semibold mt-1"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
