# Grand Palace — combined app

Merged repo for the Grand Palace frontend (TanStack Start + Nitro) and backend
(Express + Prisma) so both run as **one Node.js app** under a single SiteGround
Node.js deployment slot.

## Why merged

SiteGround's Node.js panel ties one Node.js app to one site slot / one GitHub
repo — there's no way to run two separate Node apps (frontend + backend) under
the same site. `server.js` at the root starts the backend Express API as an
internal child process (default port 4000, not publicly exposed) and starts
the frontend's built Nitro server as the process SiteGround actually listens
on. The frontend's `vite.config.ts` already proxies `/api/**` to `BACKEND_URL`
— pointing that at `http://127.0.0.1:4000` keeps both apps' code completely
unchanged from their standalone form.

## Structure

```
grandpalace/
├── frontend/     # TanStack Start + Vite + Nitro app (was grand-palace-frontend-main)
├── backend/      # Express + Prisma API (was grand-palace-backend-main)
├── server.js     # orchestrates both as one process
└── package.json  # root install/build/start scripts
```

## Required environment variables (set in SiteGround's Node.js → Environment Variables panel)

**Build-time** (must be set before `npm run build` runs, since `vite.config.ts`
bakes these into the Nitro output):
- `BACKEND_URL=http://127.0.0.1:4000`
- `NITRO_PRESET=node-server`

**Runtime** (read by the backend Express process at start):
- `DATABASE_URL` — SiteGround PostgreSQL connection string
- `JWT_SECRET`
- `FRONTEND_URL` — the site's own public URL (for CORS; same-origin in this
  merged setup, but the Express app also serves the same-origin proxy calls)
- `PUBLIC_URL` — this site's public URL, used to build absolute `/uploads/...`
  URLs for admin-uploaded images
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM_NAME`, `BOOKINGS_EMAIL`
- `VITE_API_URL=http://127.0.0.1:4000` — read by frontend SSR loaders at runtime

**Also**:
- `NODE_ENV=production`
- `PORT` — SiteGround sets this automatically for the public-facing process

See `backend/.env.example` for the full list with descriptions.

## Local dev

Local dev still runs frontend and backend as two separate processes (simpler
for iterating on either independently) — this merge only matters for the
single-process SiteGround deployment:

```bash
cd backend && npm install && npm run dev     # http://localhost:4000
cd frontend && npm install && npm run dev    # http://localhost:8080 (or similar)
```

## SiteGround deployment

1. Node.js app → Deploy method: GitHub, this repo, branch `main`
2. Build command: `npm install` (root `postinstall` installs both subfolders'
   deps; root `build` script builds the frontend)
3. Startup file: `server.js`
4. Set all environment variables listed above
5. Save and deploy

**Important**: `NITRO_PRESET`'s output path is Nitro-version-dependent — see
the comment in `frontend/vite.config.ts` above the `preset:` line. If the
Nitro version ever changes, confirm `frontend/.output/server/index.mjs`
still exists after a build before deploying, or `server.js` will fail to
start the frontend process.
