import { useRef, useState } from "react";
import { api } from "@/lib/admin-api";

type FieldEl = HTMLTextAreaElement | HTMLInputElement;

/** Wraps the current selection in `before`/`after` (or inserts at the cursor
 *  if nothing is selected), then restores focus + selection so the user can
 *  keep typing without losing their place. */
function wrapSelection(el: FieldEl, value: string, onChange: (v: string) => void, before: string, after: string, fallback = "text") {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || fallback;
  const insert = `${before}${selected}${after}`;
  onChange(value.slice(0, start) + insert + value.slice(end));
  requestAnimationFrame(() => {
    el.focus();
    const from = start + before.length;
    el.setSelectionRange(from, from + selected.length);
  });
}

function insertLink(el: FieldEl, value: string, onChange: (v: string) => void) {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "link text";
  const url = window.prompt("Link to (e.g. /menu/a-la-carte or https://...)", "/");
  if (!url) return;
  const insert = `[${selected}](${url})`;
  onChange(value.slice(0, start) + insert + value.slice(end));
  requestAnimationFrame(() => {
    el.focus();
    const cursor = start + insert.length;
    el.setSelectionRange(cursor, cursor);
  });
}

// The native colour picker steals focus/selection the moment it opens, so the
// field's current selection is captured up front and reused once the user
// actually picks a colour (the picker's change event fires later, async).
function insertColor(el: FieldEl, value: string, onChange: (v: string) => void, colorInput: HTMLInputElement) {
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? value.length;
  const selected = value.slice(start, end) || "text";
  colorInput.onchange = () => {
    const insert = `{{color:${colorInput.value}}}${selected}{{/color}}`;
    onChange(value.slice(0, start) + insert + value.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + insert.length;
      el.setSelectionRange(cursor, cursor);
    });
  };
  colorInput.click();
}

const FONT_SIZES = [12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48];

function applySize(el: FieldEl, value: string, onChange: (v: string) => void, px: string) {
  wrapSelection(el, value, onChange, `{{size:${px}px}}`, "{{/size}}");
}

/** Line-based formatting (headings, bullets) — unlike wrapSelection, this
 *  operates on whole lines rather than an inline span, since a heading or a
 *  bullet is a block-level thing. Expands the current selection out to full
 *  line boundaries, strips any existing heading/bullet prefix from each
 *  line (so re-applying doesn't stack "### - text"), then prepends the new
 *  prefix to every affected line. Only meaningful on a multi-line
 *  <textarea> — single-line <input> fields can't contain a line break. */
function applyLinePrefix(el: FieldEl, value: string, onChange: (v: string) => void, prefix: string) {
  if (!(el instanceof HTMLTextAreaElement)) return;
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? start;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = value.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = value.length;
  const block = value.slice(lineStart, lineEnd);
  const newBlock = block
    .split("\n")
    .map((line) => prefix + line.replace(/^(#{1,3}\s+|[-*]\s+)/, ""))
    .join("\n");
  const newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(lineStart, lineStart + newBlock.length);
  });
}

/** Inserts an uploaded image on its own isolated line at the cursor
 *  position, using the same "{{image:URL}}" line syntax the renderer looks
 *  for — surrounding newlines keep it from merging into the text around it
 *  (stray extra blank lines this creates are harmless, the renderer skips
 *  blank lines). Can be called repeatedly to place several images. */
function insertImageMarkup(el: FieldEl, value: string, onChange: (v: string) => void, url: string) {
  if (!(el instanceof HTMLTextAreaElement)) return;
  const start = el.selectionStart ?? value.length;
  const end = el.selectionEnd ?? start;
  const insert = `\n{{image:${url}}}\n`;
  const newValue = value.slice(0, start) + insert + value.slice(end);
  onChange(newValue);
  requestAnimationFrame(() => {
    el.focus();
    const cursor = start + insert.length;
    el.setSelectionRange(cursor, cursor);
  });
}

const toolbarBtnCls = "h-6 min-w-[24px] px-1.5 rounded border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-300 text-[11px] font-semibold text-stone-600 hover:text-amber-700 transition disabled:opacity-50 disabled:pointer-events-none";

/** A toolbar of formatting buttons that operate on the selected text (or
 *  current line, for block-level ones) of whatever field ref is passed in —
 *  select some words, click a button, done. No need to hand-type markup.
 *  `allowBlocks` gates the line-based controls (Heading/Bullets/Image) —
 *  they only make sense on a multi-line <textarea>, not a single-line title
 *  <input>, so RichTextInput doesn't render them. */
function RichToolbar({ fieldRef, value, onChange, allowBlocks }: {
  fieldRef: React.RefObject<FieldEl | null>;
  value: string;
  onChange: (v: string) => void;
  allowBlocks: boolean;
}) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (!file || !fieldRef.current) return;
    setUploadingImage(true);
    try {
      const { url } = await api.uploadDirect(file);
      insertImageMarkup(fieldRef.current, value, onChange, url);
    } catch (err) {
      alert(err instanceof Error ? `Image upload failed: ${err.message}` : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="flex items-center gap-1 mb-1 min-w-0 flex-wrap">
      {allowBlocks && (
        <select
          title="Turn the current line into a heading"
          defaultValue=""
          className={`${toolbarBtnCls} shrink-0 pr-0.5`}
          onChange={(e) => {
            if (!e.target.value) return;
            if (fieldRef.current) applyLinePrefix(fieldRef.current, value, onChange, `${e.target.value} `);
            e.target.value = "";
          }}
        >
          <option value="" disabled>Heading…</option>
          <option value="#">H1</option>
          <option value="##">H2</option>
          <option value="###">H3</option>
        </select>
      )}
      <button type="button" title="Highlight selected text" className={`${toolbarBtnCls} shrink-0`}
        onClick={() => fieldRef.current && wrapSelection(fieldRef.current, value, onChange, "**", "**")}>
        <b>B</b>
      </button>
      <button type="button" title="Turn selected text into a link" className={`${toolbarBtnCls} shrink-0 whitespace-nowrap`}
        onClick={() => fieldRef.current && insertLink(fieldRef.current, value, onChange)}>
        🔗 Link
      </button>
      {allowBlocks && (
        <button type="button" title="Turn the current line(s) into a bullet list" className={`${toolbarBtnCls} shrink-0 whitespace-nowrap`}
          onClick={() => fieldRef.current && applyLinePrefix(fieldRef.current, value, onChange, "- ")}>
          • Bullets
        </button>
      )}
      <button type="button" title="Colour selected text" className={`${toolbarBtnCls} shrink-0 whitespace-nowrap`}
        onClick={() => fieldRef.current && colorInputRef.current && insertColor(fieldRef.current, value, onChange, colorInputRef.current)}>
        🎨 Colour
      </button>
      <input ref={colorInputRef} type="color" defaultValue="#c8860a" className="sr-only" tabIndex={-1} aria-hidden />
      {allowBlocks && (
        <>
          <button type="button" title="Insert an image at the cursor position" disabled={uploadingImage} className={`${toolbarBtnCls} shrink-0 whitespace-nowrap`}
            onClick={() => imageInputRef.current?.click()}>
            {uploadingImage ? "Uploading…" : "🖼️ Image"}
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageFile} className="hidden" disabled={uploadingImage} />
        </>
      )}
      <select
        title="Set selected text's font size"
        defaultValue=""
        className={`${toolbarBtnCls} shrink-0 pr-0.5`}
        onChange={(e) => {
          if (!e.target.value) return;
          if (fieldRef.current) applySize(fieldRef.current, value, onChange, e.target.value);
          e.target.value = "";
        }}
      >
        <option value="" disabled>Size…</option>
        {FONT_SIZES.map((px) => <option key={px} value={px}>{px}px</option>)}
      </select>
      <span className="text-[10px] text-stone-400 truncate hidden lg:inline" title="Select text, then click a button">Select text, then click a button</span>
    </div>
  );
}

export function RichTextArea({
  value, onChange, rows = 3, placeholder, className, allowBlocks = true,
}: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; className?: string;
  /** Set false for a field that's itself a heading/title (e.g. the guide's
   *  H1) — nesting another heading, bullet list, or image inside a heading
   *  element would be invalid HTML, so those fields opt out of the
   *  line-based block controls and keep only inline formatting (Bold/Link/
   *  Colour/Size). Defaults to true for ordinary body/paragraph fields. */
  allowBlocks?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="min-w-0">
      <RichToolbar fieldRef={ref} value={value} onChange={onChange} allowBlocks={allowBlocks} />
      <textarea ref={ref} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
    </div>
  );
}

export function RichTextInput({
  value, onChange, placeholder, className,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="min-w-0">
      <RichToolbar fieldRef={ref} value={value} onChange={onChange} allowBlocks={false} />
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={className} />
    </div>
  );
}
