import { useRef, useState } from "react";
import { api } from "@/lib/admin-api";

/** Same upload/drag-drop pattern as EditableImage, for an optional hero
 *  background video. Kept as a separate component (rather than teaching
 *  EditableImage to handle both) since the preview element, accepted file
 *  types, and "remove video" affordance are different enough to make a
 *  shared implementation more confusing than two small ones. */
export function EditableVideo({
  value, onChange, className, videoClassName,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  videoClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hasVideo = !!value;

  async function uploadFile(file: File) {
    if (!file.type.startsWith("video/")) return;
    setUploading(true);
    try {
      const { url } = await api.uploadDirect(file);
      onChange(url);
    } catch (err) {
      alert(err instanceof Error ? `Video upload failed: ${err.message}` : "Video upload failed");
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

  const hasOwnPosition = /\b(absolute|fixed|sticky|static)\b/.test(className ?? "");

  return (
    <label
      className={`group block cursor-pointer ${hasOwnPosition ? "" : "relative"} ${className ?? ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {hasVideo && (
        <video src={value} className={videoClassName} muted loop playsInline autoPlay />
      )}

      {!hasVideo && (
        <div className={`absolute inset-0 z-20 flex items-center justify-center transition-colors ${dragOver ? "bg-amber-600/60" : "bg-black/55"}`}>
          <span className="text-white text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full border-2 border-dashed border-white/70 text-center">
            {uploading ? "Uploading…" : dragOver ? "Drop to upload" : "🎬 Click or Drag & Drop a Video (optional)"}
          </span>
        </div>
      )}

      {hasVideo && (
        <>
          <div className={`absolute inset-0 z-20 transition-colors flex items-center justify-center ${dragOver ? "bg-amber-600/60" : "bg-black/0 group-hover:bg-black/50"}`}>
            <span className={`text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-black/60 transition-opacity ${dragOver ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {uploading ? "Uploading…" : dragOver ? "Drop to replace" : "🎬 Change or Drag & Drop Video"}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(""); }}
            className="absolute top-2 right-2 z-30 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ✕ Remove video
          </button>
        </>
      )}

      <input ref={fileRef} type="file" accept="video/*" onChange={handleFileInput} className="hidden" disabled={uploading} />
    </label>
  );
}
