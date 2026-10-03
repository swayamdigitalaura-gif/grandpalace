import { Router } from "express";
import Stripe from "stripe";
import express from "express";
import { prisma } from "../db.js";
import { sendMail, birthdayCustomerEmail, birthdayBookingsEmail, cateringCustomerEmail, cateringBookingsEmail, diwaliCustomerEmail, diwaliBookingsEmail } from "../lib/mailer.js";

const router = Router();

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const BIRTHDAY_PACKAGE_PRICE_AUD = 150;
const PLATTER_PRICES_AUD = { veg: 75, nonVeg: 85 };
const DIWALI_BOX_PRICE_AUD = 99;

// Public: creates a Stripe Checkout Session for the $150 birthday package
// fee. The frontend redirects the browser straight to the returned URL —
// no Stripe.js/publishable key needed for this hosted-checkout flow.
router.post("/create-checkout-session", async (req, res) => {
  const { sessionId, name, email, mobile, guests, date, time, cake, message } = req.body;
  if (!sessionId || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Reuse whichever origin the request actually came from (local dev,
  // a Vercel preview URL, or production) so this works everywhere without
  // hardcoding a single frontend URL.
  const origin = req.headers.origin || (process.env.FRONTEND_URL || "").split(",")[0];

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "aud",
          product_data: {
            name: "TGP Celebrate Birthday Package",
            description: `${guests || ""} guests · ${date || ""} · ${time || ""}`.trim(),
          },
          unit_amount: BIRTHDAY_PACKAGE_PRICE_AUD * 100,
        },
        quantity: 1,
      }],
      success_url: `${origin}/birthday-package?payment=success`,
      cancel_url: `${origin}/birthday-package?payment=cancelled`,
      metadata: { sessionId, name, mobile: mobile || "", guests: guests || "", date: date || "", time: time || "", cake: cake || "", message: message || "" },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err.message);
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Public: creates a Stripe Checkout Session for a TGP Platter Box order
// (Office Catering page). Quantity/price is computed server-side from
// vegQty/nonVegQty so the amount charged can't be tampered with client-side.
router.post("/create-catering-checkout-session", async (req, res) => {
  const { sessionId, name, email, mobile, vegQty, nonVegQty, pickupDate, pickupTime, delivery, message } = req.body;
  const veg = Math.max(0, parseInt(vegQty, 10) || 0);
  const nonVeg = Math.max(0, parseInt(nonVegQty, 10) || 0);
  if (!sessionId || !name || !email || (veg === 0 && nonVeg === 0)) {
    return res.status(400).json({ error: "Missing required fields or empty order" });
  }

  const origin = req.headers.origin || (process.env.FRONTEND_URL || "").split(",")[0];
  const line_items = [];
  if (veg > 0) {
    line_items.push({
      price_data: {
        currency: "aud",
        product_data: { name: "TGP Veg Platter Box", description: "5 varieties of veg rolls" },
        unit_amount: PLATTER_PRICES_AUD.veg * 100,
      },
      quantity: veg,
    });
  }
  if (nonVeg > 0) {
    line_items.push({
      price_data: {
        currency: "aud",
        product_data: { name: "TGP Non-Veg Platter Box", description: "5 varieties of non-veg rolls" },
        unit_amount: PLATTER_PRICES_AUD.nonVeg * 100,
      },
      quantity: nonVeg,
    });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      success_url: `${origin}/office-catering?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/office-catering?payment=cancelled`,
      metadata: {
        orderType: "catering", sessionId, name, mobile: mobile || "",
        vegQty: String(veg), nonVegQty: String(nonVeg),
        pickupDate: pickupDate || "", pickupTime: pickupTime || "",
        delivery: delivery || "", message: message || "",
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe catering checkout session error:", err.message);
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Public: creates a Stripe Checkout Session for a TGP Diwali Catering Box
// order (What's On → Diwali Catering Box page). Quantity is computed
// server-side and the price is hardcoded here — never trust a client-sent
// price or amount.
router.post("/create-diwali-checkout-session", async (req, res) => {
  const { sessionId, name, email, mobile, boxes, collectionDate, collectionTime, message } = req.body;
  const qty = Math.max(1, parseInt(boxes, 10) || 1);
  if (!sessionId || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const origin = req.headers.origin || (process.env.FRONTEND_URL || "").split(",")[0];

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "aud",
          product_data: {
            name: "TGP Diwali Catering Box",
            description: `${qty} box(es) · ${collectionDate || ""} ${collectionTime || ""}`.trim(),
          },
          unit_amount: DIWALI_BOX_PRICE_AUD * 100,
        },
        quantity: qty,
      }],
      success_url: `${origin}/whats-on/diwali-catering-box?payment=success`,
      cancel_url: `${origin}/whats-on/diwali-catering-box?payment=cancelled`,
      metadata: {
        orderType: "diwali-catering-box", sessionId, name, mobile: mobile || "",
        boxes: String(qty), collectionDate: collectionDate || "", collectionTime: collectionTime || "",
        message: message || "",
      },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe diwali checkout session error:", err.message);
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Read-only order summary used for analytics after Stripe sends the customer back.
// Amounts come from Stripe, never from the browser. Returns no personal data except
// the email/phone the customer just typed (needed for enhanced conversions).
router.get("/order-summary", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    const id = String(req.query.session_id || "");
    if (!id.startsWith("cs_")) return res.json({ paid: false });
    const session = await getStripe().checkout.sessions.retrieve(id);
    if (session.payment_status !== "paid") return res.json({ paid: false });
    const m = session.metadata || {};
    if (m.orderType !== "catering") return res.json({ paid: false });
    res.json({
      paid: true,
      total: (session.amount_total || 0) / 100,
      vegQty: Number(m.vegQty || 0),
      nonVegQty: Number(m.nonVegQty || 0),
      pickupDate: m.pickupDate || "",
      pickupTime: m.pickupTime || "",
      delivery: m.delivery || "pickup",
      email: session.customer_email || "",
      phone: m.mobile || "",
    });
  } catch (err) {
    console.error("Order summary error:", err.message);
    res.json({ paid: false });
  }
});

// Stripe webhook — needs the raw body to verify the signature, so this
// route parses it itself (the app-level JSON parser skips this path).
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata || {};

    if (meta.orderType === "catering" && meta.sessionId) {
      const { sessionId, name, mobile, vegQty, nonVegQty, pickupDate, pickupTime, delivery, message } = meta;
      const amountPaidAud = (session.amount_total || 0) / 100;
      const data = { vegQty, nonVegQty, pickupDate, pickupTime, delivery, stripeSessionId: session.id, amountPaidAud };

      // Keep anything saved while the visitor was typing (e.g. traffic source), then add the paid details.
      const previous = await prisma.enquiry.findUnique({ where: { sessionId } }).catch(() => null);
      const previousData = previous && previous.data && typeof previous.data === "object" ? previous.data : {};

      await prisma.enquiry.upsert({
        where: { sessionId },
        create: {
          sessionId, type: "office-catering", status: "completed",
          name: name || null, email: session.customer_email || null, phone: mobile || null,
          subject: "TGP Platter Box Order", message: message || null, step: "confirm", data,
        },
        update: { status: "completed", data: { ...previousData, ...data } },
      });

      const emailPayload = {
        name, email: session.customer_email, mobile, vegQty, nonVegQty, pickupDate, pickupTime, delivery,
        message, amountPaid: amountPaidAud, stripeSessionId: session.id,
      };
      if (session.customer_email) await sendMail(cateringCustomerEmail(emailPayload));
      await sendMail(cateringBookingsEmail(emailPayload));

      return res.json({ received: true });
    }

    if (meta.orderType === "diwali-catering-box" && meta.sessionId) {
      const { sessionId, name, mobile, boxes, collectionDate, collectionTime, message } = meta;
      const amountPaidAud = (session.amount_total || 0) / 100;
      const data = { boxes, collectionDate, collectionTime, stripeSessionId: session.id, amountPaidAud };

      await prisma.enquiry.upsert({
        where: { sessionId },
        create: {
          sessionId, type: "diwali-catering-box", status: "completed",
          name: name || null, email: session.customer_email || null, phone: mobile || null,
          subject: "Diwali Catering Box Order", message: message || null, step: "confirm", data,
        },
        update: { status: "completed", data },
      });

      const emailPayload = {
        name, email: session.customer_email, mobile, boxes, collectionDate, collectionTime,
        message, amountPaid: amountPaidAud, stripeSessionId: session.id,
      };
      if (session.customer_email) await sendMail(diwaliCustomerEmail(emailPayload));
      await sendMail(diwaliBookingsEmail(emailPayload));

      return res.json({ received: true });
    }

    const { sessionId, name, mobile, guests, date, time, cake, message } = meta;

    if (sessionId) {
      await prisma.enquiry.upsert({
        where: { sessionId },
        create: {
          sessionId,
          type: "birthday",
          status: "completed",
          name: name || null,
          email: session.customer_email || null,
          phone: mobile || null,
          subject: "Celebrate Birthday Package Enquiry",
          message: message || null,
          step: "confirm",
          data: { guests, date, time, cake, stripeSessionId: session.id, amountPaidAud: BIRTHDAY_PACKAGE_PRICE_AUD },
        },
        update: {
          status: "completed",
          data: { guests, date, time, cake, stripeSessionId: session.id, amountPaidAud: BIRTHDAY_PACKAGE_PRICE_AUD },
        },
      });

      // Keep the dedicated BirthdayEnquiry table in sync too — some parts
      // of the admin may still read from it.
      if (name && session.customer_email) {
        await prisma.birthdayEnquiry.create({
          data: {
            name, email: session.customer_email, mobile: mobile || "",
            guests: guests || "", date: date || "", time: time || "",
            cake: cake || null, message: message || null,
          },
        }).catch(() => {}); // non-critical — don't fail the webhook over this
      }

      // Confirmation emails — full summary to the customer, notification to
      // bookings@. Fire-and-forget; sendMail never throws, so a mail failure
      // can't cause Stripe to retry the (already-processed) webhook.
      const emailPayload = {
        name, email: session.customer_email, mobile, guests, date, time, cake, message,
        amountPaid: BIRTHDAY_PACKAGE_PRICE_AUD, stripeSessionId: session.id,
      };
      if (session.customer_email) {
        await sendMail(birthdayCustomerEmail(emailPayload));
      }
      await sendMail(birthdayBookingsEmail(emailPayload));
    }
  }

  res.json({ received: true });
});

export default router;
