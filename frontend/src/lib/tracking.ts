// Analytics helpers: push events to the GTM dataLayer.
//
// Design rules (so tracking can never break the site):
//  - every function is wrapped in try/catch and never throws
//  - nothing here is awaited by the UI; network calls are fire-and-forget
//  - events are inert until a GTM tag listens for them
import { api } from "@/lib/admin-api";

type Dict = Record<string, unknown>;
type DataLayerWindow = Window & { dataLayer?: Dict[] };

/** Push a plain event to the dataLayer. */
export function track(event: string, params: Dict = {}): void {
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  } catch {
    /* tracking must never break the page */
  }
}

/** Push an ecommerce event (GA4 format). Clears the previous ecommerce object first. */
export function trackEcommerce(event: string, ecommerce: Dict, params: Dict = {}): void {
  try {
    const w = window as DataLayerWindow;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ ecommerce: null });
    w.dataLayer.push({ event, ecommerce, ...params });
  } catch {
    /* ignore */
  }
}

/* ── Where did the visitor come from? Saved (first touch) and stored with the lead/order. ── */
const ATTR_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];
const ATTR_STORAGE_KEY = "tgp_attr";

export function captureAttribution(): void {
  try {
    const q = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    ATTR_KEYS.forEach((k) => {
      const v = q.get(k);
      if (v) found[k] = v.slice(0, 200);
    });
    if (Object.keys(found).length === 0) return;
    // Keep the first touch unless a new Google Ads click id arrives.
    const existing = getAttribution();
    if (existing && !found.gclid && !found.gbraid && !found.wbraid) return;
    localStorage.setItem(
      ATTR_STORAGE_KEY,
      JSON.stringify({ ...found, landing_page: window.location.pathname, ts: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function getAttribution(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(ATTR_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/* ── Office Catering platter boxes ── */
export const PLATTER_VEG = {
  item_id: "platter-veg-75",
  item_name: "Veg Platter Box",
  item_category: "Office Catering",
  price: 75,
};
export const PLATTER_NONVEG = {
  item_id: "platter-nonveg-85",
  item_name: "Non-Veg Platter Box",
  item_category: "Office Catering",
  price: 85,
};

export function platterItems(vegQty: number, nonVegQty: number): Dict[] {
  const items: Dict[] = [];
  if (vegQty > 0) items.push({ ...PLATTER_VEG, quantity: vegQty });
  if (nonVegQty > 0) items.push({ ...PLATTER_NONVEG, quantity: nonVegQty });
  return items;
}

type OrderSummary = {
  paid: boolean;
  total: number;
  vegQty: number;
  nonVegQty: number;
  pickupDate: string;
  pickupTime: string;
  delivery: string;
  email: string;
  phone: string;
};

/**
 * Called when Stripe sends the customer back with ?payment=success&session_id=cs_...
 * Asks the server (which asks Stripe) what was actually paid, then fires ONE `purchase` event.
 * Amounts never come from the browser, and a refresh can't send the same order twice.
 */
export function reportPlatterPurchase(sessionId: string | null): void {
  try {
    if (!sessionId || !sessionId.startsWith("cs_")) return;
    const key = `tgp_purchase_${sessionId}`;
    if (sessionStorage.getItem(key)) return;
    api
      .get<OrderSummary>(`/api/stripe/order-summary?session_id=${encodeURIComponent(sessionId)}`)
      .then((o) => {
        if (!o || !o.paid) return;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
        trackEcommerce(
          "purchase",
          {
            transaction_id: sessionId,
            currency: "AUD",
            value: o.total,
            items: platterItems(o.vegQty, o.nonVegQty),
          },
          {
            offer: "office_platter",
            pickup_date: o.pickupDate,
            pickup_time: o.pickupTime,
            fulfillment: o.delivery,
            user_data: { email: o.email, phone_number: o.phone },
          },
        );
      })
      .catch(() => {});
  } catch {
    /* ignore */
  }
}
