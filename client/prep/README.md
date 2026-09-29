# Interview Preparation Center

This Angular app handles RoleNaviq interview preparation at `/prep/`. The React app remains the main workspace. Both frontends use the existing Express API and its HttpOnly session cookie.

- `src/app/app.ts`: checks the signed-in session and displays the Angular router.
- `src/app/app.routes.ts`: maps the interview list and detail pages.
- `src/app/core/prep-api.ts`: calls `/api/prep` through the same site.
- `src/app/interviews/`: checklist, practice questions, notes, and saving.

From `client/`, run `npm run dev:prep` alongside `npm run dev` and the Express server. Open `http://localhost:5173/prep/`. Run tests with `npm --prefix prep test -- --watch=false`.

## Independent Vercel project

This app can now build on its own:

```bash
npm ci
npm run build:site
```

`dist/site/prep/` contains the Angular page and its assets under the same `/prep/` path used by the main RoleNaviq site. `vercel.json` sets the build command, output directory, SPA fallback, and a proxy for `/api/` when visiting the Angular project's own domain.

To set up the second deployment:

1. Merge the preparation PR after CI passes. The main Vercel project still bundles Angular at this point, so its current `/prep/` route keeps working.
2. In Vercel, import the **same GitHub repository** again as a new project named `rolenaviq-prep`. Set the Root Directory to `client/prep`, the Production Branch to `main`, and Node.js to 24. The `vercel.json` in this directory selects the Other framework preset, `npm run build:site`, and `dist/site`.
3. Check that `https://rolenaviq-prep.vercel.app/prep/`, the logo, and a built JavaScript asset are served from the new project. Use the actual assigned domain if Vercel gives this project a different one. The direct project domain is for verifying static assets; users will access Interview Prep through the main domain.
4. Make a second PR that changes the main project's `/prep` rewrites to the verified Angular project domain and removes Angular from the main Vercel build. Keep Angular in the Docker image for the existing local Compose setup.
5. After that PR passes CI and is merged, verify demo login, interview list, detail, save, and navigation at `https://rolenaviq.vercel.app/prep/`. The Angular page calls `/api/` on the **main domain**, which keeps the existing HttpOnly session cookie and Express API.

The two Vercel projects deploy independently after step 4. Until then, the original single-project route remains live. Each Vercel preview of the main project will use the configured Angular origin; coordinate frontend and API changes when testing previews.
