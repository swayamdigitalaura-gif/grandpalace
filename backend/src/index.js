import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";

import authRoutes from "./routes/auth.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import pagesRoutes from "./routes/pages.routes.js";
import guidesRoutes from "./routes/guides.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import siteImagesRoutes from "./routes/site-images.routes.js";
import siteTogglesRoutes from "./routes/site-toggles.routes.js";
import birthdayEnquiriesRoutes from "./routes/birthday-enquiries.routes.js";
import enquiriesRoutes from "./routes/enquiries.routes.js";
import seoRoutes from "./routes/seo.routes.js";
import contentRoutes from "./routes/content.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";
import mailTestRoutes from "./routes/mail-test.routes.js";

// None of the route handlers below wrap their `await prisma...` calls in
// try/catch, and there's no centralized Express error handler — an async
// route handler that throws becomes an unhandled promise rejection, and
// Node's default behaviour for that is to crash the entire process. This
// was invisible in every previous test because DB connectivity was already
// proven separately (row counts, admin-api round trips) — but a single
// slow/cold connection on first request, or any other one-off DB hiccup, was
// enough to kill the whole server: /api/health (no DB call) kept responding
// from a health check made moments earlier, then every subsequent request —
// including future /api/health calls, on a redeploy — 502'd because the
// process was simply gone. Catching it here at the process level converts a
// full crash into a single failed request, matching how the app is actually
// expected to behave.
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (request continues, process stays up):", err);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection (request continues, process stays up):", err);
});

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
// skip the JSON body parser for multipart file-upload endpoints — otherwise
// it can misfire on large multipart bodies and reject them as "too large"
// before multer ever sees them. Also skip it for the Stripe webhook, which
// needs the raw request body to verify the signature — that route parses
// it itself with express.raw().
app.use((req, res, next) => {
  if (req.path === "/api/uploads" || req.path === "/api/gallery/upload" || req.path === "/api/stripe/webhook") return next();
  express.json()(req, res, next);
});
app.use(cookieParser());

// serves uploaded photos at http://localhost:4000/uploads/<file>
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/guides", guidesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/site-images", siteImagesRoutes);
app.use("/api/site-toggles", siteTogglesRoutes);
app.use("/api/birthday-enquiries", birthdayEnquiriesRoutes);
app.use("/api/enquiries", enquiriesRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/mail-test", mailTestRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Centralized error handler — catches anything passed to next(err) or
// thrown/rejected inside an async route (Express 5's router forwards those
// here automatically; without this, the response just hangs or falls
// through to Express's default HTML error page). Keeps a route-level
// failure a clean 500 JSON response instead of relying solely on the
// process-level uncaughtException/unhandledRejection handlers above, which
// exist to keep the *server* alive, not to give a well-formed response to
// the *request* that triggered the error.
app.use((err, req, res, next) => {
  console.error(`Error handling ${req.method} ${req.path}:`, err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: "Internal server error" });
});

// Vercel imports `app` as a serverless handler; only listen when run directly (local dev).
if (process.env.VERCEL === undefined) {
  // Bind explicitly to the IPv4 loopback, not just PORT (which lets Node pick
  // any available interface, including the IPv6 wildcard `::`). In the
  // combined-app setup (see repo root server.js) the frontend reaches this
  // backend at http://127.0.0.1:<port> — an IPv4 address — so if this process
  // ends up bound only to the IPv6 stack on a given host, that connection
  // fails even though the process itself is running and healthy. This was
  // observed on SiteGround: the frontend served 200s while every proxied
  // /api/** call 502'd, with no crash in either process — a bind mismatch,
  // not an error, so nothing was thrown or logged either.
  const server = app.listen(PORT, "127.0.0.1", () => {
    console.log(`Grand Palace backend running on http://127.0.0.1:${PORT}`);
  });
  server.on("error", (err) => {
    console.error(`Failed to bind 127.0.0.1:${PORT}: ${err.message}`);
    console.error("Falling back to the default interface (all addresses).");
    app.listen(PORT, () => {
      console.log(`Grand Palace backend running on http://localhost:${PORT} (fallback bind)`);
    });
  });
}

export default app;
