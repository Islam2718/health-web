# Deploying Ibnocare to Namecheap cPanel (Node.js Selector)

Target: Stellar Plus shared hosting, subdomain `health.phicsart.com`, cPanel
with **Setup Node.js App** (Phusion Passenger). Passenger runs the
**Application startup file** (`server.js`) directly — it does not run
`npm run`/`npm start`, so the app must already be built and self-contained
before upload.

## 1. Build locally

```
npm run build
```

`next.config.ts` has `output: "standalone"`, so this produces:

- `.next/standalone/` — `server.js`, a pruned `node_modules` (only packages
  Next.js can't bundle: `next`, `react`, `react-dom`, `sharp` + its native
  deps, `styled-jsx`, `@swc` helpers, `client-only`), and `.next/server`
  (compiled server code) + manifest files.
- `.next/static/` — hashed JS/CSS/font chunks. **Not** copied into
  `standalone` automatically — this is a manual step.
- `public/` — static assets. **Also not** copied automatically.

## 2. Assemble the deploy folder

Copy these into `.next/standalone` before uploading:
- `.next/static` → `.next/standalone/.next/static`
- `public` → `.next/standalone/public`

The contents of `.next/standalone/` are what map 1:1 onto the app root on
the server (`health.phicsart.com/`).

## 3. Upload via FTP — not the File Manager zip extractor

**Do not** zip `node_modules`/`.next/static` and extract via cPanel File
Manager. Its extractor is PHP-based and silently times out partway through
archives with many small files, leaving folders that look present in the
listing but are missing files inside (this caused two separate outages
during initial setup: `next/dist/server/next.js` missing, then
`.next/static/css` missing).

Use **FTP** instead — it fails loudly (shows in FileZilla's "Failed
transfers" tab) instead of silently truncating.

1. cPanel → **FTP Accounts** → create/use an account scoped to
   `health.phicsart.com`.
2. Connect with FileZilla (Host / Username / Password / Port 21).
3. Upload `.next/standalone/*` (server.js, package.json, `.next/`,
   `node_modules/`) → remote `health.phicsart.com/`.
4. Confirm the transfer queue empties with **0 failed transfers** before
   moving on.

## 4. cPanel → Setup Node.js App

- Node.js version: 22.x
- Application mode: Production
- Application root: `health.phicsart.com`
- Application URL: `health.phicsart.com`
- Application startup file: `server.js`
- Save/Create.

## 5. First-time / dependency-changed installs

If `node_modules` needs to be (re)installed, don't rely on FTP-uploading it
either — the file count is even larger than `.next/static`. Instead:

1. Delete `node_modules` in File Manager (or via FTP).
2. cPanel → Setup Node.js App → open the app → **Run NPM Install**. This
   runs real `npm install` on the server (pulling from the npm registry),
   which is reliable for large dependency trees, unlike the zip extractor.
3. Click **Restart**.

## 6. Verify

- Open `health.phicsart.com` in an **incognito window** (a 503 page can get
  cached by the browser).
- DevTools → Console: confirm no 404s on `/_next/static/...` (JS/CSS/font
  chunks) — that specifically means `.next/static` didn't fully upload.
- If the app still 503s, check `stderr.log` in the app root via File
  Manager — it's Passenger's actual crash log and is the fastest way to
  find the real error (as opposed to the "Detected configuration files"
  panel in the Node.js app UI, which can show stale/irrelevant
  `npm run dev` output).

## Redeploying after a code change

You don't need to repeat the whole process — only re-upload what changed:

| What changed | What to re-upload |
|---|---|
| Any page/component/style code | `.next/standalone/.next/server/` + the manifest files at `.next/standalone/.next/*.json` (`build-manifest.json`, `routes-manifest.json`, `prerender-manifest.json`, `app-path-routes-manifest.json`, `required-server-files.json`, `BUILD_ID`, `package.json`) |
| Any code (new CSS classes, components, etc.) | `.next/static/` (from the project root, not `standalone`) — delete the remote folder first since filenames are content-hashed, then upload fresh |
| Images/fonts/icons in `public/` | `public/` — same delete-then-reupload approach |
| `package.json` dependencies changed | Delete remote `node_modules`, use **Run NPM Install** in cPanel, then Restart |

Safe default habit: after every `npm run build`, delete remote `.next` and
`public` wholesale and re-upload the fresh local `.next/standalone/.next`
(with `.next/static` merged in) + `public`, then **Restart** the app in
cPanel.

## Environment variables

The app reads its API base URL from `NEXT_PUBLIC_API_BASE_URL` (see
`.env.example` / `src/lib/api-client.ts`). Since these are baked into the
client bundle at build time (`NEXT_PUBLIC_*`), changing them requires a
rebuild + redeploy of `.next/server` and `.next/static` — not just an env
edit on the server.
