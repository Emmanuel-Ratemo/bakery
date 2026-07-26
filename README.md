# Bee's Blossom Bakes

Angular storefront with cart and WhatsApp ordering.

**Tagline:** Blooming delights in every bite

## Run locally

```bash
npm install
cp .env.example .env
# edit .env and set ADMIN_PASSWORD
npm start
```

For uploads that write into the repo on your machine:

```bash
npm run admin-api
```

Open http://127.0.0.1:4200/

## GitHub Pages secrets

Add these under **Settings → Environments → github-pages → Environment secrets** (or Actions repository secrets):

| Secret | Purpose |
|--------|---------|
| `ADMIN_PASSWORD` | Admin login (hashed into the build) |
| `ADMIN_GITHUB_TOKEN` | Fine-grained PAT with **Contents: Read and write** on this repo only — lets live Admin commit image/price updates |

Then push to `main` (or re-run the deploy workflow).

Live site: https://emmanuel-ratemo.github.io/bakery/

## Admin

Open `/admin`.

**Password:** not stored in source. CI writes a SHA-256 hash into the app at build time.

**Live image uploads:** when `ADMIN_GITHUB_TOKEN` is set in the github-pages environment, deploy bakes it into the admin client so uploads can commit to `main` and Pages redeploys. Prefer a **fine-grained** token limited to this repo. Anyone who can download the built JS could extract that token — rotate it if the site is compromised. For stronger security, only change images locally with `npm run admin-api` and push.
