import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { saveBufferToDisk } from "../local-storage.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(requireAuth);

// Generic image upload used by every admin image field (menu items/categories,
// gallery photos, site banners, page hero images). Saved to local disk under
// backend/uploads/, served statically at /uploads/<file> (see src/index.js).
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = await saveBufferToDisk(req.file.originalname, req.file.buffer);
  res.status(201).json({ url });
});

export default router;
