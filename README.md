# Grand Palace — combined app

Merged repo for the Grand Palace frontend (TanStack Start + Nitro) and backend
(Express + Prisma) so both run as **one Node.js app**, deployed to a Contabo
VPS under pm2 (process name `grand-palace`).

## Why merged

`server.js` at the root starts the backend Express API as an internal child
process (default port 4000, not publicly exposed) and starts the frontend's
built Nitro server as the process pm2 actually runs (public port 5005, proxied
by nginx). The frontend's `vite.config.ts` already proxies `/api/**` to
`BACKEND_URL` — pointing that at `http://127.0.0.1:4000` keeps both apps' code
completely unchanged from their standalone form. This design was originally
built for SiteGround (one Node.js app per site slot) but works identically on
a plain VPS, so it was kept as-is for the Contabo move.

## Structure

```
grandpalace/
├── frontend/     # TanStack Start + Vite + Nitro app (was grand-palace-frontend-main)
├── backend/      # Express + Prisma API (was grand-palace-backend-main)
├── server.js     # orchestrates both as one process
└── package.json  # root install/build/start scripts
```

## Required environment variables (set in `/home/grand-palace/shared/.env` on the server)

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
- `PORT` — set by pm2's `ecosystem.config.cjs` (5005), the port nginx proxies to

See `backend/.env.example` for the full list with descriptions.

## Local dev

Local dev still runs frontend and backend as two separate processes (simpler
for iterating on either independently) — this merge only matters for the
single-process deployment on the server:

```bash
cd backend && npm install && npm run dev     # http://localhost:4000
cd frontend && npm install && npm run dev    # http://localhost:8080 (or similar)
```

## Contabo deployment

Deploys automatically via [.github/workflows/deploy-contabo.yml](.github/workflows/deploy-contabo.yml)
on every push to `main`: builds the frontend on the GitHub Actions runner,
rsyncs a release to `/home/grand-palace/releases/<sha>` on the server,
symlinks it as `current`, runs `prisma migrate deploy`, and restarts the
`grand-palace` pm2 process.

- **Server**: `swayam@82.180.147.202`, directory `/home/grand-palace/`
- **Uploads** (`backend/uploads/`) and **`.env`** live in `/home/grand-palace/shared/`,
  symlinked into each release — they persist across deploys and are never
  overwritten by a new release.
- **Process**: `pm2 restart grand-palace` (no sudo needed); pm2 is registered
  as a systemd service (`pm2-swayam`) so it survives a server reboot.
- **Rollback**: re-point the `current` symlink at an older `releases/release-<sha>`
  directory and `pm2 restart grand-palace` — the last 3 releases are kept.
- **Manual deploy** (bypassing CI): SSH in, `cd /home/grand-palace`, then repeat
  the steps in the workflow's "Activate release and restart" step.

**Important**: `NITRO_PRESET`'s output path is Nitro-version-dependent — see
the comment in `frontend/vite.config.ts` above the `preset:` line. If the
Nitro version ever changes, confirm `frontend/.output/server/index.mjs`
still exists after a build before deploying, or `server.js` will fail to
start the frontend process.
