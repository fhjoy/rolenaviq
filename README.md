# RoleNaviq

I built RoleNaviq to keep the moving parts of a job search in one place. Save opportunities, follow each application through the hiring process, and see what is coming next.

[Try the live app](https://rolenaviq.vercel.app/)

## What it does

- Track applications from saved roles through interviews and offers.
- Switch between a searchable list that loads as you scroll, a board, a calendar, and a dashboard.
- Keep job links, technologies, salary details, notes, and interview dates together.
- Prepare for interviews with a checklist, a question bank, saved notes, and practice sessions.
- Use your own account or take a guided tour with the demo login. Each demo visitor gets a separate workspace that expires after seven days.

## Architecture

This is one repository with two frontends and one API:

| Part | Location | What it does | Production |
| --- | --- | --- | --- |
| React workspace | `client/src/` | Applications, board, calendar, dashboard, account | Vercel |
| Angular Interview Prep | `client/prep/` | Plans, questions, notes, practice sessions | Separate Vercel project |
| Express API | `server/src/` | Authentication, application and prep data, dashboard stats | Render + MongoDB Atlas |

The React site serves `/` and rewrites `/prep/` to Angular and `/api/` to Express. Both frontends use the same API and signed-in cookie. This is a **route-based micro-frontend** setup: React and Angular have separate builds and deployments, while sharing this repository and backend. There is no Module Federation or separate Python service today. Python/FastAPI job analysis and AI features are future work.

## Tech

- **React workspace:** React, TypeScript, Vite, React Router, Tailwind CSS, TanStack Query, React Hook Form and Zod.
- **Interview Prep:** Angular, TypeScript, Angular Router and NgRx Store/Effects.
- **API and data:** Node.js, Express, MongoDB Atlas, Mongoose, Zod and JWT in HttpOnly cookies.
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

## Checks

```bash
npm --prefix server test
npm --prefix client test
npm --prefix client/prep test -- --watch=false
```

GitHub Actions also runs build checks, Cypress browser tests, and a Docker stack smoke test on pull requests.
