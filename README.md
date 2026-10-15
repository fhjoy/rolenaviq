# RoleNaviq

I built RoleNaviq to keep the moving parts of a job search in one place. Save opportunities, follow each application through the hiring process, and see what is coming next.

[Try the live app](https://rolenaviq.vercel.app/)

## What it does

- Track applications from saved roles through interviews and offers.
- Switch between a searchable list that loads as you scroll, a board, a calendar, and a dashboard.
- Keep job links, technologies, salary details, notes, and interview dates together.
- Plan several follow-ups per application, complete them, and see the next ones on the dashboard and calendar.
- Export applications and actions to CSV, or preview and import a RoleNaviq CSV.
- Prepare for interviews with a checklist, a question bank, saved notes, and practice sessions.
- Use your own account or take a guided tour with the demo login. Each demo visitor gets a separate workspace that expires after seven days.
- Optionally sign in with Google, or connect Google to an existing password account from Settings.
- Verify new password accounts by email when transactional email is configured.

## Architecture

This is one repository with two frontends and one API:

| Part | Location | What it does | Production |
| --- | --- | --- | --- |
| React workspace | `client/src/` | Applications, board, calendar, dashboard, account | Vercel |
| Angular Interview Prep | `client/prep/` | Plans, questions, notes, practice sessions | Separate Vercel project |
| Express API | `server/src/` | Authentication, application and prep data, dashboard stats | Render + MongoDB Atlas |

The React site serves `/` and rewrites `/prep/` to Angular and `/api/` to Express. Both frontends use the same API and signed-in cookie. This is a **route-based micro-frontend** setup: React and Angular have separate builds and deployments, while sharing this repository and backend. There is no Module Federation or separate Python service today. Python/FastAPI job analysis and AI features are future work.

The [OpenAPI contract](server/openapi.yaml) documents the current Express endpoints for both frontends and future services. CI validates the spec against the route inventory and checks real API responses against its schemas. The dashboard also shows progress from the Angular Interview Prep data saved in the shared API.

CSV import expects the headers from RoleNaviq's export. It previews row errors and duplicate applications before import, then skips duplicates based on company, position, job URL and application date. The export includes follow-up actions. Interview Prep notes and practice sessions are outside this CSV.

## Tech

- **React workspace:** React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form and Zod.
- **Interview Prep:** Angular, TypeScript, Angular Router and NgRx Store/Effects.
- **API and data:** Node.js, Express, MongoDB Atlas, Mongoose, Zod and JWT in HttpOnly cookies.
- **Optional sign-in:** Google OpenID Connect (OAuth 2.0 authorization code flow with PKCE).
- **Email verification:** Brevo transactional API over HTTPS; one-use hashed tokens.
- **Tests and delivery:** Vitest, React Testing Library, Supertest, mongodb-memory-server, Cypress, Docker Compose, GitHub Actions, Vercel and Render.

## Run locally

The quickest way is with Docker:

```bash
git clone https://github.com/fhjoy/rolenaviq.git
cd rolenaviq
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). MongoDB data is kept in a Docker volume.
The Docker frontend image serves both React and Angular through Nginx; production uses their separate Vercel projects instead.

For development without Docker, use Node.js 24 and a MongoDB database. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set `MONGODB_URI` and a private `JWT_SECRET` in `server/.env`, then run:

```bash
npm ci --prefix server
npm ci --prefix client
npm ci --prefix client/prep
npm --prefix server run dev
npm --prefix client run dev
npm --prefix client run dev:prep
```

Run the last three commands in separate terminals, then open [http://localhost:5173](http://localhost:5173). Angular is served under `/prep/` through the React development server.

### Optional Google sign-in

RoleNaviq keeps password and demo sign-in available. To enable Google sign-in, create a **Web application** OAuth client in Google Cloud, configure its consent screen, and add the exact authorized redirect URI for the environment:

| Environment | Authorized redirect URI |
| --- | --- |
| Local Node/Vite | `http://localhost:5173/api/auth/google/callback` |
| Local Docker | `http://localhost:8080/api/auth/google/callback` |
| Production | `https://rolenaviq.vercel.app/api/auth/google/callback` |

Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `server/.env` for local Node, in the repository root `.env` for Docker Compose, and in the **Render backend** environment for production. Keep the secret out of Git, Vercel, and browser variables. The API builds the redirect URI from `CLIENT_URL`; in production the Vercel `/api/` rewrite sends the callback to Render and keeps the browser cookie on the Vercel origin. If you use another site URL, register that exact URL with Google and set `CLIENT_URL` to match.

Keep `COOKIE_SAME_SITE=lax` so the browser includes the short-lived sign-in cookie on Google's return navigation.

Only the `openid email profile` scopes are requested. RoleNaviq does not store Google access or refresh tokens. Google-only users have no RoleNaviq password. Existing password users must sign in with their password first, then use **Settings → Connect Google account** with the same verified email. A verified email by itself never links accounts automatically.

### Email verification

To enable verification, verify a sender address in Brevo and set **both** `BREVO_API_KEY` and `EMAIL_FROM` on the **Render backend**. `EMAIL_FROM` must be that verified sender. Do not put the API key in Vercel or any `VITE_` variable. Render sends mail over Brevo's HTTPS API, so it does not need outbound SMTP ports. After changing Render environment variables, redeploy the backend.

For local Docker, put the same two variables in a repository root `.env` file, then run `docker compose up --build`. For local Node, put them in `server/.env`. Without both values, password registration keeps the earlier flow; Google and demo sign-in work either way. Set the two values before asking real users to register, then create a test account and confirm the email actually arrives.

New password accounts cannot sign in until the user opens the emailed link. Links expire after 30 minutes and work once; resend has a one-minute cooldown. Unverified accounts expire after seven days. Existing accounts stay usable. While verification is enabled, changing an account email in Settings is paused until a separate verify-new-address flow exists. Brevo receives the destination address and verification email content; check its transactional log retention settings as part of the privacy setup.

## Checks

```bash
npm --prefix server test
npm --prefix server run contract
npm --prefix client test
npm --prefix client/prep test -- --watch=false
```

GitHub Actions also runs build checks, Cypress browser tests, and a Docker stack smoke test on pull requests.
