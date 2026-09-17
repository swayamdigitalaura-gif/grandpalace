import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public: published job postings only, for /career.
router.get("/", async (req, res) => {
  const jobs = await prisma.jobPosting.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  res.json(jobs);
});

// ── Admin-only from here ──────────────────────────────────────────
router.use(requireAuth);

// Admin: same list but includes unpublished postings too.
router.get("/admin", async (req, res) => {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { sortOrder: "asc" },
  });
  res.json(jobs);
});

router.post("/", async (req, res) => {
  const { title, subtitle, badge1, badge2, requirements, responsibilities, published, sortOrder } = req.body;
  const job = await prisma.jobPosting.create({
    data: {
      title,
      subtitle: subtitle || null,
      badge1: badge1 || null,
      badge2: badge2 || null,
      requirements: requirements ?? [],
      responsibilities: responsibilities ?? [],
      published: published ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
  res.status(201).json(job);
});

router.patch("/:id", async (req, res) => {
  const job = await prisma.jobPosting.update({ where: { id: req.params.id }, data: req.body });
  res.json(job);
});

router.delete("/:id", async (req, res) => {
  await prisma.jobPosting.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
