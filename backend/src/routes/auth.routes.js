import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid email or password" });

  const token = signToken(user);
  // Requests now arrive proxied through the frontend's own domain (see
  // vite.config.ts routeRules), so this cookie is first-party from the
  // browser's perspective — "lax" works everywhere and avoids relying on
  // "none", which modern browsers increasingly block by default for
  // genuinely cross-domain cookies.
  // `req.secure` (not NODE_ENV) reflects whether the *original* browser
  // request was HTTPS, via X-Forwarded-Proto — see "trust proxy" in
  // index.js. A cookie marked Secure is silently dropped by the browser
  // over plain HTTP, which made admin login appear to succeed (200 from
  // this route) but never actually log in when accessed without SSL yet
  // (e.g. testing by server IP before DNS/SSL are set up) — NODE_ENV is
  // "production" in that case too, so it can't tell the two apart.
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: req.secure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ email: user.email });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", { sameSite: "lax", secure: req.secure });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ email: req.admin.email });
});

export default router;
