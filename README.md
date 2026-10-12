# QIO Admin

Admin panel for the QIO store, built with Vite, React 19 and TypeScript. It talks to the
`qio-backend` REST API (`/api/v1/admin/*`) and covers the dashboard, products, brands, orders,
coupons, users, reviews, wallets, streaks and customer feedback.

## Requirements

- Node.js 20+
- A running `qio-backend` instance with an admin login configured (see below)

## Setup

```bash
npm install
cp .env.example .env   # then edit VITE_API_URL if the backend is not on localhost:4000
npm run dev
```

### Environment variables

| Variable       | Description                                   | Default                        |
| -------------- | --------------------------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backend API, including `/api/v1` | `http://localhost:4000/api/v1` |

`VITE_*` values are embedded in the built bundle at build time, so never put secrets in them.
`.env` is git-ignored; commit only `.env.example`.

## Backend requirements

Sign-in uses `POST /auth/admin-login` with a username and password. Admin accounts live in the
database (`users` collection, `role: "admin"`, bcrypt-hashed password) — nothing is hardcoded or kept
in `.env`. Create a new admin, or reset an existing one's password, from the backend folder
(idempotent; the account is created or updated):

```bash
cd ../qio-backend
npm run create-admin -- --username <name> --password '<password>' [--name "Display Name"]
```

Set `CORS_ORIGIN=http://localhost:5173` (the admin panel origin, comma separated) in `qio-backend/.env`.
The session token is a JWT kept in `localStorage`; on load the app verifies it with `GET /auth/me`
and signs out automatically on any 401 response or if the account is not an admin.

## Scripts

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server (http://localhost:5173) |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/`        |
| `npm run preview` | Serve the production build locally                |
| `npm run lint`    | Run oxlint                                        |

## Project layout

```
src/
  lib/apiClient.ts      fetch wrapper, central auth token, 401 handling, CSV downloads
  context/              AuthProvider (session) and useAuth hook
  hooks/                useApiData (loading/error/reload), useDashboard, useHashView, useDebouncedValue
  components/           layout (sidebar, topbar, header) and shared UI (tables, modals, pagination)
  features/<area>/      api.ts + types.ts (mirroring backend serializers) + page components
```

The current page is kept in the URL hash (`#orders`, `#wallets`, …), so refresh and the browser's
back/forward buttons work without a router.
