import { useRef, useState } from "react";
import { api } from "@/lib/admin-api";

export function EditableImage({
  value, onChange, className, imgClassName, placeholder,
  resizeHeight, onResizeHeight, minHeight = 100, maxHeight = 600,
}: {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  imgClassName?: string;
  placeholder: string;
  /** current custom height in px — pass with onResizeHeight to enable a drag handle */
  resizeHeight?: number;
  onResizeHeight?: (heightPx: number) => void;
  minHeight?: number;
  maxHeight?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLLabelElement>(null);
  const hasImage = !!value;
  const resizable = !!onResizeHeight;

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const res = await api.uploadDirect(file);
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

  function startResize(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startHeight = boxRef.current?.getBoundingClientRect().height ?? minHeight;
    setResizing(true);

    function onMove(ev: PointerEvent) {
      const next = Math.round(startHeight + (ev.clientY - startY));
      onResizeHeight!(Math.min(maxHeight, Math.max(minHeight, next)));
    }
    function onUp() {
      setResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // The caller's className controls positioning (e.g. "absolute inset-0" for a
  // full-bleed hero image). Only default to `relative` when the caller hasn't
  // specified their own position, otherwise the two conflict and the box
  // collapses to near-zero size.
  const hasOwnPosition = /\b(absolute|fixed|sticky|static)\b/.test(className ?? "");

  return (
    <label
      ref={boxRef}
      className={`group block cursor-pointer ${hasOwnPosition ? "" : "relative"} ${className ?? ""}`}
      style={resizable ? { height: `${resizeHeight ?? minHeight}px` } : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <img src={value || placeholder} alt="" className={imgClassName} />

      {/* always-visible prompt when there's no photo yet */}
      {!hasImage && (
        <div className={`absolute inset-0 z-20 flex items-center justify-center transition-colors ${dragOver ? "bg-amber-600/60" : "bg-black/55"}`}>
          <span className="text-white text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full border-2 border-dashed border-white/70 text-center">
            {uploading ? "Uploading…" : dragOver ? "Drop to upload" : "📷 Click or Drag & Drop a Photo"}
          </span>
        </div>
      )}

      {/* hover-to-change once a photo is set, plus an always-visible small badge as a hint */}
      {hasImage && (
        <>
          <div className={`absolute inset-0 z-20 transition-colors flex items-center justify-center ${dragOver ? "bg-amber-600/60" : "bg-black/0 group-hover:bg-black/50"}`}>
            <span className={`text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-black/60 transition-opacity ${dragOver ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              {uploading ? "Uploading…" : dragOver ? "Drop to replace" : "📷 Change or Drag & Drop Photo"}
            </span>
          </div>
          <span className="absolute bottom-2 right-2 z-20 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-black/60 text-white group-hover:opacity-0 transition-opacity">
            📷 Edit
          </span>
        </>
      )}

      {resizable && (
        <div
          onPointerDown={startResize}
          onClick={(e) => e.preventDefault()}
          className={`absolute bottom-0 left-0 right-0 z-30 h-3 flex items-center justify-center cursor-ns-resize ${resizing ? "" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
          title="Drag to resize"
        >
          <div className="w-10 h-1.5 rounded-full bg-white shadow" />
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" disabled={uploading} />
    </label>
  );
}
