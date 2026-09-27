# Interview Preparation Center

This Angular app handles RoleNaviq interview preparation at `/prep/`. The React app remains the main workspace. Both frontends use the existing Express API and its HttpOnly session cookie.

- `src/app/app.ts`: checks the signed-in session and displays the Angular router.
- `src/app/app.routes.ts`: maps the interview list and detail pages.
- `src/app/core/prep-api.ts`: calls `/api/prep` through the same site.
- `src/app/interviews/`: checklist, practice questions, notes, and saving.

From `client/`, run `npm run dev:prep` alongside `npm run dev` and the Express server. Open `http://localhost:5173/prep/`. Run tests with `npm --prefix prep test -- --watch=false`.
