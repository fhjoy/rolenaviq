# Interview Preparation Center

This Angular app handles RoleNaviq interview preparation at `/prep/`. The React app remains the main workspace. Both frontends use the existing Express API and its HttpOnly session cookie.

- `src/app/app.ts`: checks the signed-in session and displays the Angular router.
- `src/app/app.routes.ts`: maps the overview, plan, question bank, and practice pages.
- `src/app/core/prep-api.ts`: calls `/api/prep` through the same site.
- `src/app/interviews/`: checklist, question bank, practice session, notes, and progress.
- `src/app/state/`: NgRx Store and Effects keep plans and saving state consistent across pages.

In development, NgRx Store DevTools shows the load, edit, save, and practice actions. The question bank keeps unsaved edits in the Angular store while you navigate between its pages; use Save to persist them in MongoDB.

From `client/`, run `npm run dev:prep` alongside `npm run dev` and the Express server. Open `http://localhost:5173/prep/`. Run tests with `npm --prefix prep test -- --watch=false`.

## Deployment

The Angular app has its own Vercel project, `rolenaviq-prep`, built from `client/prep` on `main` with Node.js 24. Build it locally with:

```bash
npm ci
npm run build:site
```

`dist/site/prep/` contains the page and its assets. The main React Vercel project proxies `/prep/` to the Angular project, so users stay on [rolenaviq.vercel.app/prep/](https://rolenaviq.vercel.app/prep/). Angular calls `/api/` on that same domain, keeping the existing HttpOnly session cookie and Express API. Its own [Vercel domain](https://rolenaviq-prep.vercel.app/prep/) is useful for checking static files, but sign-in runs through the main site.

The React Vercel build contains only React; the Docker build still bundles both frontends for local Compose. GitHub Actions builds and tests both apps, and both Vercel projects use the four CI checks for production promotion.
