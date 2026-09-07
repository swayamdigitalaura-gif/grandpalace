import { useRef, useState } from "react";
import { api } from "@/lib/admin-api";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

function looksLikeValidUrl(value: string): boolean {
  if (!value) return true; // empty is fine (falls back to default)
  return /^(https?:\/\/|\/|data:image\/)/i.test(value.trim());
}

// Downscales/compresses large phone-camera photos client-side before upload —
// keeps uploads fast and keeps the live site from serving multi-MB images.
// GIFs are skipped (canvas re-encode would kill animation).
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file; // already small enough

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
  );
  if (!blob || blob.size >= file.size) return file; // compression didn't help, keep original

  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export function ImageUploadField({
  label, value, onChange, wide,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  wide?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewBroken, setPreviewBroken] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await api.uploadDirect(compressed);
      setPreviewBroken(false);
      onChange(res.url);
    } catch (err) {
      alert(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!uploading) setDragOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
  }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  const urlLooksInvalid = !looksLikeValidUrl(value);

  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "w-full" : ""}`}>
      <label className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#7a5020" }}>{label}</label>
      <div className="flex items-start gap-3">
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="w-20 h-20 rounded-lg flex-shrink-0 border-2 overflow-hidden flex items-center justify-center bg-stone-50 cursor-pointer transition-colors"
          style={{ borderColor: dragOver ? "#c8860a" : "rgba(200,140,30,0.25)", borderStyle: dragOver ? "dashed" : "solid", background: dragOver ? "rgba(200,140,30,0.1)" : undefined }}
        >
          {value && !urlLooksInvalid && !previewBroken ? (
            <img src={value} alt="" className="w-full h-full object-cover" onError={() => setPreviewBroken(true)} />
          ) : value ? (
            <span className="text-[9px] text-red-500 text-center px-1 font-semibold">⚠ Broken image</span>
          ) : (
            <span className="text-[9px] text-stone-400 text-center px-1">{dragOver ? "Drop here" : "No image set"}</span>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" disabled={uploading} />
        </label>
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <input
            value={value}
            onChange={(e) => { setPreviewBroken(false); onChange(e.target.value); }}
            placeholder="/path/to/image.jpg"
            className="rounded-lg px-3 py-2 text-sm bg-white outline-none border w-full"
            style={{ borderColor: urlLooksInvalid ? "#dc2626" : "rgba(200,140,30,0.25)", color: "#1a0e00" }}
          />
          {urlLooksInvalid ? (
            <p className="text-[11px] text-red-600 font-medium">
              ⚠ This isn't a web address — it looks like a file path from your computer. Use the box on the left to upload the actual photo instead.
            </p>
          ) : (
            <p className="text-[11px] text-stone-500">
              {uploading ? "Uploading…" : "Drag & drop a photo onto the thumbnail — don't paste a file path here"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
