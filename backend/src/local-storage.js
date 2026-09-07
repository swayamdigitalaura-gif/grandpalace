import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Mirrors the old @vercel/blob `put(..., { addRandomSuffix: true })` behaviour:
// saves the buffer under uploads/ with a random suffix appended to the
// original filename (collision-proof, keeps the extension), and returns the
// public URL path it's served at (see the `/uploads` static mount in
// src/index.js). PUBLIC_URL, if set, is prefixed so the DB stores an absolute
// URL (matches how Blob URLs were always absolute); otherwise a relative
// "/uploads/..." path is stored and resolved against whichever origin serves
// this API.
export async function saveBufferToDisk(originalName, buffer) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const ext = path.extname(originalName);
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);
  const suffix = crypto.randomBytes(4).toString("hex");
  const filename = `${base}-${suffix}${ext}`;

  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  const base_url = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
  return `${base_url}/uploads/${filename}`;
}
