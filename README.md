# Volunteer Coordination Platform

Centralized tooling for pairing volunteers to community events. The project is split into a React frontend (`src/`) and an Express/Mongoose backend (`server/`).

## Quick Start
- **Install dependencies** (front+back): `npm install`
- **Environment variables**: copy `server/.env.example` to `server/.env` and provide `MONGO_URI`, `JWT_SECRET`, and optional `ALLOWED_ORIGINS`.
- **Run backend API**: `node server/server.js`
- **Run frontend dev server**: `npm start`

## Architecture
```
volunteer-1/
├── src/                # React app and client-side tests
├── server/             # Express server, routes, controllers, models
│   ├── controllers/    # auth, volunteer, event, notification, assignments
│   ├── routes/         # express.Router definitions
│   ├── models/         # Mongoose schemas
│   └── utils/          # password helpers, etc.
└── coverage/           # Jest coverage outputs (`npm test -- --coverage`)
```

### Core Models
- **UserCredentials** (`server/models/UserCredentials.js`): name, email (unique), hashed password, role (`admin | volunteer`).
- **UserProfile** (`server/models/UserProfile.js`): one-to-one with credentials; stores demographics, skills, preferences, availability.
- **EventDetails** (`server/models/EventDetails.js`): volunteer opportunities with scheduling and staffing counts.
- **VolunteerAssignment** (`server/models/VolunteerAssignment.js`): links user + event, tracks status (`Assigned`, `Confirmed`, `Declined`, `Completed`, `Cancelled`), ensures user/event uniqueness.
- **VolunteerHistoryUser** (`server/models/VolunteerHistoryUser.js`): audit log of completed participation.

## Scripts
| Command | Description |
| --- | --- |
| `npm start` | React dev server on port 3000. |
| `npm run build` | Production build of the frontend. |
| `node server/server.js` | Launches the Express API (defaults to port 5050). |
| `npm run seed:demo` | Seeds sample data (requires valid MongoDB connection). |
| `npm test` | Jest in watch mode (client-side default). |
| `CI=true npm test -- --coverage --watchAll=false` | Single-pass test run with combined client + backend coverage report. |

### Coverage Output
- Summary printed to console after the coverage run.
- Detailed HTML report: `coverage/lcov-report/index.html`
- Raw data: `coverage/lcov.info`, `coverage/coverage-final.json`

## API Overview

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create credentials and bootstrap profile. |
| `POST` | `/api/auth/login` | Issue JWT for valid credentials. |
| `GET` | `/api/volunteers` | List profiles with optional `role`, `email` filters. |
| `POST` | `/api/volunteers` | Create profile tied to existing user credentials. |
| `PUT` | `/api/volunteers/:id` | Update profile fields. |
| `DELETE` | `/api/volunteers/:id` | Remove a volunteer profile. |
| `GET` | `/api/events` | Fetch all events ordered by date. |
| `POST` | `/api/events` | Create event (requires name, description, location, urgency, date). |
| `PATCH` | `/api/assignments/:id/status` | Update volunteer assignment status and optionally log history. |
| `GET` | `/api/volunteers/:userId/assignments` | Volunteer’s upcoming/past assignments (`?tab=upcoming|past`). |
| `POST` | `/api/assignments` | Match a volunteer to an event (enforces capacity + duplicates). |

> Authentication middleware (`authMiddleware` + `adminMiddleware`) protects selected admin endpoints. Add `Authorization: Bearer <token>` from `/api/auth/login`.

## Testing Strategy
- Jest covers React components under `src/components/**/__tests__` and server logic under `src/__tests__/**`.
- Backend suites stub Mongoose models and focus on controller/route behavior without touching a real database.
- CI coverage target is ≥ 80% statements/lines. Current metrics sit around ~85% lines / ~80% branches.

## Development Notes
- Node version ≥ 18 recommended.
- MongoDB connection string must be reachable from your machine (Atlas IP allowlist or local instance).
- CORS defaults to `http://localhost:3000`; override via `ALLOWED_ORIGINS` in `.env`.
- For production, serve the React build via a dedicated host (e.g., Netlify, Vercel) and deploy the Express API separately (e.g., Render, Railway, Heroku).

## Troubleshooting
- **`MONGO_URI not set`**: ensure `server/.env` is created and accessible before starting the server.
- **Tests stuck in watch mode**: run with `CI=true` to enforce single pass.
- **Coverage below threshold**: target uncovered branches highlighted in `coverage/lcov-report/index.html`.

## Contributing
1. Create a feature branch.
2. Ensure `npm test` and coverage pass.
3. Submit PR with summary of changes, tests run, and screenshots if UI changes were made.

Happy volunteering! 🎉
