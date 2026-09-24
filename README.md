# RoleNaviq

I built RoleNaviq to keep the moving parts of a job search in one place. Save opportunities, follow each application through the hiring process, and see what is coming next.

[Try the live app](https://rolenaviq.vercel.app/)

## What it does

- Track applications from saved roles through interviews and offers.
- Switch between a searchable list, a board, a calendar, and a dashboard.
- Keep job links, technologies, salary details, notes, and interview dates together.
- Use your own account or explore the app with the demo login.

## Built with

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT authentication.
- **Testing and delivery:** Vitest, React Testing Library, Supertest, Cypress, Docker Compose, GitHub Actions.

## Run locally

The quickest way is with Docker:

```bash
git clone https://github.com/fhjoy/rolenaviq.git
cd rolenaviq
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). MongoDB data is kept in a Docker volume.

For development without Docker, use Node.js 24 and a MongoDB database. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Set `MONGODB_URI` and a private `JWT_SECRET` in `server/.env`, then run:

```bash
npm ci --prefix server
npm ci --prefix client
npm --prefix server run dev
npm --prefix client run dev
```

Run the last two commands in separate terminals, then open [http://localhost:5173](http://localhost:5173).

## Checks

```bash
npm --prefix server test
npm --prefix client test
```

GitHub Actions also runs build checks, Cypress browser tests, and a Docker stack smoke test on pull requests.
