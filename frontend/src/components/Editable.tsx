import type { ReactNode } from "react";

// Invisible marker around a piece of editable text so the admin's live
// preview can find it in the iframe and highlight/scroll to it on click —
// `display:contents` means this wrapper never affects layout or styling.
export function Editable({ k, children }: { k: string; children: ReactNode }) {
  return (
    <span data-tgp-key={k} style={{ display: "contents" }}>
      {children}
    </span>
  );
}
