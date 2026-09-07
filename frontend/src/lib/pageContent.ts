import { useEffect, useState } from "react";
import { API_URL } from "@/lib/admin-api";

// Flat map of editable content for one page: { "hero.headline": "…", … }.
export type ContentMap = Record<string, string>;

// Fetch a page's editable content overrides. Called from a route loader so the
// values are available during SSR (no flash of default → edited text). A
// backend hiccup returns {} so the page silently keeps its hardcoded defaults.
export async function fetchPageContent(path: string): Promise<ContentMap> {
  try {
    const res = await fetch(`${API_URL}/api/content/blocks/lookup?path=${encodeURIComponent(path)}`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// Text/image accessor: returns the edited value for `key` if set (and
// non-empty), otherwise the hardcoded fallback. Keeps every wiring site a
// one-liner: c("hero.headline", "A True Taste").
export function makeContent(map: ContentMap | undefined | null) {
  return (key: string, fallback: string): string => {
    const v = map?.[key];
    return v !== undefined && v !== "" ? v : fallback;
  };
}

// Splits a textarea value into paragraphs (blank-line separated), falling back
// to the provided default paragraphs when unset.
export function contentParagraphs(map: ContentMap | undefined | null, key: string, fallback: string[]): string[] {
  const v = map?.[key];
  if (v === undefined || v.trim() === "") return fallback;
  return v.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
}

// Layers live edits from the admin's preview iframe on top of the loaded
// content — the admin posts {type:"tgp-preview-update", path, key, value} on
// every keystroke, and this merges it into real React state so the page
// re-renders itself normally instead of fighting a raw DOM mutation (which
// React's own reconciliation would otherwise silently undo). Outside the
// admin iframe no message ever arrives, so this is a no-op on the live site.
export function useLiveContent(path: string, base: ContentMap): ContentMap {
  const [overrides, setOverrides] = useState<ContentMap>({});
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data || e.data.type !== "tgp-preview-update" || e.data.path !== path) return;
      setOverrides((o) => ({ ...o, [e.data.key]: e.data.value }));
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [path]);
  return Object.keys(overrides).length ? { ...base, ...overrides } : base;
}
