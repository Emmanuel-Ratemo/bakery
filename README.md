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

For uploads that write into the repo:

```bash
npm run admin-api
```

Open http://127.0.0.1:4200/

## Build

```bash
npm run build
```

## GitHub Pages

1. In the GitHub repo: **Settings → Secrets and variables → Actions**
2. Add secret `ADMIN_PASSWORD` (same value you use in local `.env`)
3. Push to `main` — deploy uses that secret at **build time** only

Live site: https://emmanuel-ratemo.github.io/bakery/

## Admin

Open `/admin`.

The live site never receives the GitHub Secret itself. The deploy job turns the secret into a **SHA-256 hash** baked into the app. Login compares hashes in the browser.

- Password is **not** stored in the public source repo
- A determined person can still try passwords against the public hash (use a long unique password)
- File writes still need `npm run admin-api` on your machine with `.env`
