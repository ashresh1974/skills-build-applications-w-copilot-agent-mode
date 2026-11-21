# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use React components backed by the shared API client, with explicit loading, empty, error, and success states for each capability.
- Logic tier decision: Keep validation, business rules, aggregation, and deliberate 4xx errors in Express services behind the existing `/api` routes.
- Data tier decision: Enforce required fields and sensible defaults in Mongoose schemas; use idempotent upserts for representative seed records without deleting unrelated data.
- Activity tracking approach: Validate `userId` and `teamId` before creating an activity, verify both referenced documents exist, compute points from submitted minutes, and store `occurredAt`.
- Team management approach: Require a team name, preserve the submitted name and mascot, and store member references through the Team model.
- Leaderboard approach: Aggregate activity points by team, join team names, sort totals descending, and assign 1-based ranks.
- Workout suggestions approach: Find the user by email, return a deliberate 4xx when absent, and prioritize workouts matching the user's goal or recent activity with an explanatory reason.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`
- Data-tier failures indicate missing schema requirements, defaults, relationships, or non-idempotent seed behavior.
- API command: `npm run test:api --prefix octofit-tracker/backend`
- API failures indicate incorrect request validation/status codes or incomplete activity, team, leaderboard, or suggestion service behavior.
- Frontend command: `npm test --prefix octofit-tracker/frontend`
- Frontend failures indicate missing API requests, rendering, or accessible loading, empty, and error states in the presentation components.
- Backend build command: `npm run build --prefix octofit-tracker/backend`
- Backend build failures indicate TypeScript errors or incompatible backend implementation changes.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`
- Frontend build failures indicate TypeScript, Vite, or production-bundle integration errors.
