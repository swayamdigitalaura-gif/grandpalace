import { useState } from "react";

const PRESETS = [
  { label: "Book a Table", value: "/book-a-table" },
  { label: "À la Carte Menu", value: "/menu/a-la-carte" },
  { label: "Set Menu", value: "/menu/set-menu" },
  { label: "Beverages / Drinks Menu", value: "/beverages" },
  { label: "Menu Hub", value: "/menu" },
  { label: "Gallery", value: "/gallery" },
  { label: "Contact Us", value: "/contact" },
  { label: "Gift Card", value: "/gift-card" },
  { label: "Order Online (external)", value: "https://order.thegrandpalace.com.au" },
  { label: "Call the restaurant", value: "tel:+61280217696" },
  { label: "Email bookings", value: "mailto:bookings@thegrandpalace.com.au" },
];

export function LinkField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const preset = PRESETS.find((p) => p.value === value);
  const [forceCustom, setForceCustom] = useState(!!value && !preset);

  const showCustomInput = forceCustom || (!!value && !preset);

  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider font-semibold block mb-1" style={{ color: "#7a5020" }}>{label}</label>
      <select
        value={showCustomInput ? "__custom__" : value}
        onChange={(e) => {
          if (e.target.value === "__custom__") {
            setForceCustom(true);
          } else {
            setForceCustom(false);
            onChange(e.target.value);
          }
        }}
        className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border mb-1.5"
        style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
      >
        <option value="">— None —</option>
        {PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        <option value="__custom__">Custom link…</option>
      </select>
      {showCustomInput && (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/some-page, https://..., tel:..., or mailto:..."
          className="w-full rounded-lg px-3 py-2 text-sm bg-white outline-none border"
          style={{ borderColor: "rgba(200,140,30,0.25)", color: "#1a0e00" }}
        />
      )}
    </div>
  );
}
