import { Router } from "express";
import multer from "multer";
import { saveBufferToDisk } from "../local-storage.js";

const router = Router();

// Public (no requireAuth) — job applicants attach a resume/CV without an
// admin login, unlike every other upload route (admin image fields, gallery
// photos, etc.), which all require auth. Restricted to common resume formats
// and a small size cap since this is the one upload endpoint the public can
// hit directly.
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error("Only PDF or Word documents are accepted"));
    }
    cb(null, true);
  },
});

router.post("/", (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = await saveBufferToDisk(req.file.originalname, req.file.buffer);
    res.status(201).json({ url });
  });
});

export default router;
