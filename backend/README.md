# Backend — black-classbooking API

Node 20 + Express 4 + Firebase Admin backend for the LINE LIFF yoga class booking app.

**Status: Phase 0 — skeleton only.** Auth, LINE verification, and all data endpoints are coming in later phases.

## Running locally

```bash
# From the repo ROOT (not this directory)
npm install                # installs all workspace deps (frontend + backend)
npm run dev:api            # starts backend with --watch on port 8080
```

## Environment setup

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

For Firebase credentials, choose one option:
- **Option A** — Set `FIREBASE_SERVICE_ACCOUNT` to the full JSON string of your service account key.
- **Option B** — Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of your key file.
- **Option C** — Place `backend/serviceAccount.json` locally (auto-detected, gitignored).

## Health check

```
GET http://localhost:8080/api/health
```

Returns `{ status: 'ok', uptime: <seconds>, env: 'development' }`.

## Roadmap

| Phase | Scope |
|-------|-------|
| 0 (now) | App bootstrap, middleware, Firebase Admin init, health check |
| 1 | LINE LIFF auth, JWT session, `/api/auth`, `/api/me` |
| 2 | Class listing, booking CRUD, `/api/classes`, `/api/bookings` |
| 3 | Check-in / QR, admin operations, `/api/checkins`, `/api/admin` |

## Docker

```bash
cd backend
docker build -t black-classbooking-backend .
docker run -p 8080:8080 --env-file .env black-classbooking-backend
```
