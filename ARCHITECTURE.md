# Architecture — Dev Teams Meetings

This document explains how the **Dev Teams Meetings** system is designed and built:
the data model, the backend, the frontend, how validation is enforced on both layers,
how the pieces talk to each other, and how everything is containerized with Docker.

It is meant to be read top-to-bottom by anyone who needs to understand, run, grade, or
extend the project.

---

## 1. What the system does

A web application for managing the meetings of development teams at a tech company.

- Every **development team** (e.g. "UI Team", "React Team") has many **meetings**.
- Every **meeting** belongs to exactly one team and has a start time, end time,
  description and room.
- Users can browse a team's meetings, see each meeting's **duration** and whether it is
  **upcoming (orange)** or **past (green)**, and **create / edit / delete** meetings.

There is no authentication — the assignment does not require it.

---

## 2. High-level architecture

Three independent, separately-deployable layers:

```
┌──────────────────────┐      HTTP/JSON       ┌──────────────────────┐      TCP/SQL       ┌──────────────────────┐
│      Frontend        │  ───────────────▶    │      Backend         │  ──────────────▶   │      Database        │
│  React + TS (Vite)   │   axios requests     │  Express + TS        │   Sequelize ORM    │  MySQL               │
│  served by nginx     │  ◀───────────────    │  REST API            │  ◀──────────────   │  dev_teams,meetings  │
└──────────────────────┘    JSON responses    └──────────────────────┘    result sets     └──────────────────────┘
   browser (port 6123)                            Node.js (port 3000)                         MySQL (port 3306)
```

- **Frontend** is a Single Page Application. It holds all UI state and talks to the
  backend purely over HTTP using `axios`.
- **Backend** is a stateless REST API. It owns all business rules and is the single
  source of truth for validation. It never renders HTML.
- **Database** stores the data. The backend reaches it through the Sequelize ORM; the
  schema and seed data are versioned as a `.sql` export.

This separation means each layer can be developed, tested, and scaled on its own, and
the frontend could be swapped (mobile app, etc.) without touching the backend.

---

## 3. Technology stack

| Layer    | Technology                                                                 |
| -------- | -------------------------------------------------------------------------- |
| Database | MySQL (MariaDB-compatible export)                                           |
| Backend  | Node.js, TypeScript, Express 5, `sequelize-typescript` + `mysql2` driver, `Joi`, `config`, `cors` |
| Frontend | TypeScript, React 19, Vite, `react-router-dom`, `axios`, `react-hook-form` |
| DevOps   | Docker, docker-compose, nginx (to serve the built SPA)                      |

The whole codebase mirrors the course reference repo `Betterx/01-betterx` conventions.

---

## 4. Repository layout

```
jb-45800-5-mission-3/
├── Database/
│   ├── dev_meetings.sql        # schema + seed export (utf8mb4, MySQL/MariaDB safe)
│   └── Dockerfile              # mysql image that auto-imports the .sql on first boot
├── Backend/
│   ├── src/
│   │   ├── app.ts              # composition root: wires middlewares + routers, starts server
│   │   ├── db/sequelize.ts     # Sequelize instance + model registration
│   │   ├── models/             # DevTeam.ts, Meeting.ts (sequelize-typescript decorators)
│   │   ├── controllers/        # business logic + Joi validators, one folder per resource
│   │   │   ├── teams/{controller.ts, validator.ts}
│   │   │   └── meetings/{controller.ts, validator.ts}
│   │   ├── routers/            # teams.ts, meetings.ts (route → middleware → controller)
│   │   └── middlewares/        # body/params validation, not-found, error pipeline
│   ├── config/                 # default/docker/compose + env-var mapping (config package)
│   ├── postman/                # Postman collection covering all 6 routes
│   ├── Dockerfile              # standalone container (NODE_ENV=docker)
│   └── Dockerfile.compose      # compose container (NODE_ENV=compose)
├── Frontend/
│   ├── src/
│   │   ├── main.tsx            # React entry point
│   │   ├── components/         # one folder per component: Component.tsx + Component.css
│   │   ├── services/           # class-singleton axios services
│   │   ├── models/             # TypeScript interfaces
│   │   ├── utils/              # dates (duration/isPast), error extraction
│   │   └── assets/             # hero SVG
│   ├── .env / .env.development / .env.docker   # VITE_REST_SERVER_URL
│   ├── nginx.conf              # SPA routing for the nginx stage
│   └── Dockerfile              # multi-stage: node build → nginx serve
├── docker-compose.yaml         # orchestrates database + backend + frontend
├── README.md                   # quick start
└── ARCHITECTURE.md             # this file
```

---

## 5. Data model

### 5.1 Tables

**`dev_teams`**

| Column | Type         | Constraints                       |
| ------ | ------------ | --------------------------------- |
| `code` | INT          | PRIMARY KEY, AUTO_INCREMENT       |
| `name` | VARCHAR(255) | NOT NULL                          |

**`meetings`**

| Column          | Type         | Constraints                                         |
| --------------- | ------------ | --------------------------------------------------- |
| `code`          | INT          | PRIMARY KEY, AUTO_INCREMENT                         |
| `dev_team_code` | INT          | NOT NULL, FOREIGN KEY → `dev_teams.code`            |
| `start_time`    | DATETIME     | NOT NULL (date + time in one field)                 |
| `end_time`      | DATETIME     | NOT NULL                                            |
| `description`   | TEXT         | NOT NULL                                            |
| `room`          | VARCHAR(255) | NOT NULL                                            |

### 5.2 Relationship

```
dev_teams (1) ───────< (many) meetings
        code  ◀── dev_team_code
```

One team has many meetings; each meeting belongs to one team. A meeting cannot be
created/updated with a `dev_team_code` that does not exist.

### 5.3 ORM mapping (the `underscored` + `timestamps:false` choice)

The Sequelize models use `@Table({ underscored: true, timestamps: false })`. This is
the key glue between the TypeScript world and the SQL world:

- `underscored: true` → camelCase TS fields map to snake_case columns automatically:
  `devTeamCode` ↔ `dev_team_code`, `startTime` ↔ `start_time`, `endTime` ↔ `end_time`.
- `timestamps: false` → Sequelize does **not** add/expect `created_at` / `updated_at`
  columns, so the model matches the assignment's exact table shape.
- The PK uses `@PrimaryKey @AutoIncrement @Column(DataType.INTEGER)`.

```ts
// Backend/src/models/Meeting.ts (essence)
@Table({ tableName: 'meetings', underscored: true, timestamps: false })
export default class Meeting extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER) code: number
  @ForeignKey(() => DevTeam) @AllowNull(false) @Column(DataType.INTEGER) devTeamCode: number
  @AllowNull(false) @Column(DataType.DATE) startTime: Date
  @AllowNull(false) @Column(DataType.DATE) endTime: Date
  @AllowNull(false) @Column(DataType.TEXT) description: string
  @AllowNull(false) @Column(DataType.STRING) room: string
  @BelongsTo(() => DevTeam) devTeam: DevTeam
}
```

`DevTeam` declares the inverse side with `@HasMany(() => Meeting)`.

### 5.4 Seed data

`dev_meetings.sql` seeds 6 teams (UI, Mobile, React, Backend, DevOps, QA) and 12 meetings
deliberately split into **past** and **future** (6 each, relative to June 2026) across rooms
("Blue Room", "New York Room", "Large Board Room"), so the orange/green coloring and the team
filter are immediately visible without manually adding data.

> **Charset note:** the export uses `DEFAULT CHARSET=utf8mb4` *without* a MySQL-8-only
> collation (`utf8mb4_0900_ai_ci`), so it imports cleanly on both MySQL and MariaDB.

---

## 6. Backend architecture

### 6.1 Layered design

```
HTTP request
   │
   ▼
Router (routers/*.ts)            ── declares the route + which middlewares run
   │
   ▼
Validation middleware            ── paramsValidation(schema) / bodyValidation(schema)
   │                                rejects bad input with 422 BEFORE the controller runs
   ▼
Controller (controllers/*/controller.ts)
   │                              ── business logic + DB access via Sequelize models
   ▼
Model (models/*.ts) ──▶ Sequelize ──▶ MySQL
   │
   ▼
response.json(...) / next({status, message})
   │
   ▼
Error pipeline (only on next(err)): log-error → error-responder
```

Each layer has one job. Controllers never parse/validate raw input (that already
happened in middleware) and never format error responses (that is the error pipeline's
job). This keeps controllers small and focused on the use case.

### 6.2 The composition root — `app.ts`

`app.ts` is the only place that knows about *all* the pieces. It wires them in order:

```ts
app.use('/', cors())          // allow the browser (different origin) to call us
app.use('/', json())          // parse JSON request bodies
app.use('/teams', teamsRouter)
app.use('/meetings', meetingsRouter)
app.use('/', notFound)        // anything unmatched → 404
app.use('/', logError)        // error pipeline: tag + log
app.use('/', respondError)    // error pipeline: send the HTTP response
await sequelize.sync({ force: !!config.get('app.sync.force') })  // connect & verify models vs tables
app.listen(port)
```

The `force` flag is read from config (`app.sync.force`, default `false`), so the table-drop
behaviour is configurable per environment / via the `DEV_MEETINGS_SYNC_FORCE` env var rather
than hard-coded — in practice it stays `false` so the imported seed data is never dropped.

Middleware **order matters**: CORS and JSON parsing come first, resource routers next,
then the not-found catch-all, and finally the two error-handling middlewares (Express
recognizes them as error handlers because they take 4 arguments).

### 6.3 Controllers — the course pattern

Every handler is an `async` function with the exact same skeleton:

```ts
export async function getSingleMeeting(request, response, next) {
  try {
    const { code } = request.params            // destructure inputs
    const meeting = await Meeting.findByPk(code, { include: [DevTeam] })
    if (!meeting) {
      return next({ status: 404, message: `meeting with code ${code} not found` })
    }
    response.json(meeting)
  } catch (e) {
    next(e)                                     // unexpected error → error pipeline (500)
  }
}
```

Rules followed throughout:

- **Always `async/await`**, never `.then()` chains.
- **Destructure** `request.params` / `request.body`.
- **Expected errors** are raised with `next({ status, message })` (404, 422).
- **Unexpected errors** are forwarded with `next(e)` and become a generic 500.

The meetings controller additionally guards referential integrity: before create/update
it calls `assertDevTeamExists(devTeamCode, next)`. That helper returns a `boolean` (and
calls `next({ status: 422, ... })` when the team is missing), so the handler bails out with
`if (!(await assertDevTeamExists(devTeamCode, next))) return`.

### 6.4 Validation — `Joi` + reusable middleware

Validation schemas live next to the controller in `validator.ts`. Two tiny, reusable
middlewares apply any schema:

```ts
// middlewares/body-validation.ts
export default function bodyValidation(validator) {
  return async (request, response, next) => {
    try {
      request.body = await validator.validateAsync(request.body) // also coerces types
      next()
    } catch (e) {
      next({ status: 422, message: e.message })
    }
  }
}
```

`paramsValidation` is the same idea for `request.params`. Because the validated result is
written **back** onto the request, downstream code receives already-coerced values (e.g.
`:code` becomes a number, dates become `Date` objects).

The meeting schemas encode the business rules declaratively:

```ts
const baseFields = {
  devTeamCode: Joi.number().integer().positive().required(),
  description: Joi.string().trim().required(),
  room:        Joi.string().trim().required(),
  endTime:     Joi.date().greater(Joi.ref('startTime')).required(),  // end strictly after start
}
export const newMeetingValidator    = Joi.object({ startTime: Joi.date().min('now').required(), ...baseFields }) // create: no past start
export const updateMeetingValidator = Joi.object({ startTime: Joi.date().required(),            ...baseFields }) // update: past allowed
```

So the difference between create and update (whether a past start is allowed) is captured
purely in the schema — the controllers stay identical in shape.

### 6.5 Error handling pipeline

Two middlewares, mirroring the reference repo:

- `log-error.ts` — assigns a random `eventId`, logs the full error server-side, forwards.
- `error-responder.ts` — sends the HTTP response. For **expected** errors (422 / 404) it
  returns the human-readable `message`; for anything else it returns a generic message
  plus the `eventId` (so internal details never leak to the client, but support can trace
  it via the logged id).

### 6.6 Configuration — the `config` package

No ports, hosts, or credentials are hard-coded. The `config` package layers JSON files by
`NODE_ENV` and overlays environment variables:

| File                                  | Purpose                                                        |
| ------------------------------------- | ------------------------------------------------------------- |
| `config/default.json`                 | base values — `app` (`port` 3000, `name`, `sync.force` false) and the full `db` block (host `localhost`, port 3306, username `root`, empty password, database `dev_meetings`) |
| `config/docker.json`                  | `NODE_ENV=docker` → db host `host.docker.internal` (+ app name) |
| `config/compose.json`                 | `NODE_ENV=compose` → db host `database` (compose service name) (+ app name) |
| `config/custom-environment-variables.json` | maps env vars onto config so anything can be injected at runtime: `DEV_MEETINGS_PORT`, `DEV_MEETINGS_SYNC_FORCE`, and the full db set `DEV_MEETINGS_DB_{HOST,PORT,USERNAME,PASSWORD,DATABASE}` |

`db/sequelize.ts` spreads the resolved `db` config into the Sequelize constructor
(`...config.get('db')`), so the same code connects correctly in every environment. It also
pins datetime handling to **wall-clock** semantics with `timezone: '+00:00'` and
`dialectOptions: { dateStrings: true }`, so `DATETIME`s are written and read with their
literal digits (no per-timezone re-interpretation) and come back as plain strings rather
than JS `Date` objects. This is the server half of the date strategy described in §8.6.

---

## 7. REST API reference

Base URL: `http://localhost:3000`. All bodies and responses are JSON.

| # | Method | Route                   | Success      | Purpose                                         |
| - | ------ | ----------------------- | ------------ | ----------------------------------------------- |
| 1 | GET    | `/teams`                | 200          | all development teams, ordered by `name`        |
| 2 | GET    | `/teams/:code/meetings` | 200          | meetings of one team, ordered by `start_time`   |
| 3 | GET    | `/meetings/:code`       | 200 / 404    | a single meeting (+ its team)                   |
| 4 | POST   | `/meetings`             | 201          | create a meeting (returns the created entity)   |
| 5 | PUT    | `/meetings/:code`       | 200 / 404    | update a meeting                                |
| 6 | DELETE | `/meetings/:code`       | 204 / 404    | delete a meeting                                |

Meeting request body shape (create & update):

```json
{
  "devTeamCode": 1,
  "startTime": "2026-12-01T10:00:00",
  "endTime":   "2026-12-01T11:30:00",
  "description": "Planning the next sprint.",
  "room": "Blue Room"
}
```

Error responses are plain-text messages with the appropriate status:
`422` for validation failures, `404` for missing resources, `500` for unexpected errors.
A ready-to-import Postman collection covering all six routes lives in `Backend/postman/`.

---

## 8. Frontend architecture

### 8.1 Routing & layout

`react-router-dom` drives navigation inside a persistent shell:

```
App (BrowserRouter)
 └── Layout
      ├── Header   (nav: Home · Meetings · New Meeting · About)
      ├── Main     (Routes)
      │     /home                 → Home
      │     /about                → About
      │     /meetings             → Meetings        (select + list)
      │     /meetings/new         → NewMeeting      (form)
      │     /meetings/:code/edit  → UpdateMeeting   (form)
      │     *                     → NotFound
      └── Footer
```

`Layout` renders the header, the routed `Main`, and the footer on every page; only the
middle changes as you navigate.

### 8.2 Component conventions

- **Functional components only**, one folder per component containing `Component.tsx` +
  `Component.css`, with the root `className` equal to the component name.
- **Typed state hooks**: `const [meetings, setMeetings] = useState<Meeting[]>([])`.
- **Data loading inside `useEffect`** via an async IIFE with `try/catch(/finally)`.
- **Lists render with `.map(... key=...)`** — never classic `for` loops.

### 8.3 Models & services (HTTP access)

`src/models/` holds plain TypeScript `interface`s (`DevTeam`, `Meeting`, `MeetingDraft`),
imported with `import type`.

`src/services/` holds **class-singleton** services that wrap `axios` and read the backend
URL from `import.meta.env.VITE_REST_SERVER_URL`:

```ts
class MeetingsService {
  async createMeeting(draft: MeetingDraft): Promise<Meeting> {
    const { data } = await axios.post<Meeting>(`${import.meta.env.VITE_REST_SERVER_URL}/meetings`, draft)
    return data
  }
  // getSingleMeeting / updateMeeting / deleteMeeting ...
}
export default new MeetingsService()
```

Components never call `axios` directly — they call a service. This keeps all HTTP details
(URLs, verbs) in one place and makes components easy to read and test.

### 8.4 Key feature mechanics

All in `src/utils/dates.ts`, used by the Meetings page (all helpers operate on **wall-clock**
strings — see §8.6):

- **Duration** — `formatDuration(start, end)` computes the millisecond difference and
  formats it human-readably, e.g. `1h 30m`, `45m`, `2h`.
- **Color coding** — `isPast(startTime)` compares the start to `Date.now()`. The card gets
  class `is-past` (**green**) or `is-future` (**orange**); the colors are defined as CSS
  variables in `index.css` and applied in `Meetings.css`.
- **Display** — `displayDateTime(dateTime)` renders the stored value as e.g.
  `May 4, 2026, 10:00 AM`, formatted in UTC so the wall-clock digits are preserved exactly.
- **Team filtering** — the `<select>` is populated from `GET /teams`; choosing a team calls
  `GET /teams/:code/meetings` and renders only that team's meetings.
- **Delete** — calls `DELETE /meetings/:code`, then removes the row from local state so the
  list refreshes instantly.

### 8.5 Forms — shared component + `react-hook-form`

Create and Update share one `MeetingForm` component to avoid duplication. It is configured
by props:

- `allowPastStart` — `false` for create (past start rejected), `true` for update.
- `initialDraft` — when provided (update), the form is pre-filled via `reset(...)`.
- `onSubmit` — what to do with a valid draft (create vs update + navigate back).

Validation uses `register('field', { required, validate })`, shows messages from
`formState.errors.field?.message`, and disables the submit button via
`formState.isSubmitting`. The cross-field rule (end after start) validates against the
**watched** start value and re-triggers when start changes:

```ts
const watchedStart = watch('startTime')
useEffect(() => { if (watchedStart && getValues('endTime')) trigger('endTime') }, [watchedStart, ...])
// endTime rule: new Date(value) > new Date(watchedStart) || 'end time must be after start time'
```

If the server still rejects a submission (it is the source of truth), the service throws,
and `MeetingForm` surfaces the server's message via a small `extractErrorMessage` helper.

### 8.6 Date handling between layers — the wall-clock strategy

Datetimes are treated as **wall-clock** values: the digits a user types (e.g. `14:00`)
must show up everywhere — list, update form, database — without ever being shifted by the
browser's or server's timezone. This is enforced on both sides:

- **Server** (`db/sequelize.ts`): `timezone: '+00:00'` + `dialectOptions.dateStrings: true`
  so MySQL stores/returns the literal digits as strings like `"2026-05-04 10:00:00"`.
- **Client** (`utils/dates.ts`): every helper parses the string with a regex
  (`parseWallClock`) and, for arithmetic/comparison, treats the wall-clock as UTC via
  `Date.UTC(...)` (`wallClockToUtcMillis`). Nothing goes through the timezone-sensitive
  `new Date("...")` parsing path.

The form uses `<input type="datetime-local">`, whose value is a string like
`2026-12-01T10:00`:

- **Pre-fill (update):** `toDateTimeLocal(stored)` extracts the wall-clock digits into the
  `YYYY-MM-DDTHH:mm` shape the input expects.
- **Submit:** `fromDateTimeLocal(value)` stamps the typed value as UTC by appending `:00Z`
  (e.g. `2026-05-04T14:00` → `2026-05-04T14:00:00Z`), so the server stores the exact digits
  the user typed regardless of its own timezone. Joi then coerces the string to a `Date`.

---

## 9. Validation: two layers, one contract

The same rules are enforced **twice**, on purpose:

| Rule                                   | Client (react-hook-form)                  | Server (Joi)                          |
| -------------------------------------- | ----------------------------------------- | ------------------------------------- |
| All fields required                    | `required` per field                      | `.required()` per field               |
| `endTime` strictly after `startTime`   | cross-field `validate` vs watched start   | `Joi.date().greater(Joi.ref(...))`    |
| No past `startTime` **on create**      | `validate` vs `new Date()` (create only)  | `Joi.date().min('now')` (create only) |
| Past start **allowed on update**       | `allowPastStart = true`                   | update schema omits `min('now')`      |
| `devTeamCode` references a real team   | select only lists real teams              | `assertDevTeamExists()` → 422         |
| `:code` is a positive integer          | links only use real codes                 | `Joi.number().integer().positive()`   |

- The **client** check exists for instant UX (inline messages, no round-trip).
- The **server** check is the real gate — it cannot be bypassed by curl/Postman or a
  modified client. Both must agree, and they do.

---

## 10. Docker architecture

`docker compose up --build` builds and runs three containers.

```
                          host machine
   browser
     │  http://localhost:6123                http://localhost:3000
     ▼                                                 ▲
┌──────────────┐                               ┌──────────────┐
│  frontend    │   (browser-side calls go to host:3000, NOT the service name)
│  nginx :80   │                               │  backend     │
│  6123 → 80   │                               │  3000 → 3000 │
└──────────────┘                               └──────┬───────┘
                                                       │ database:3306 (compose network)
                                                       ▼
                                                ┌──────────────┐
                                                │  database    │
                                                │  mysql :3306 │  (exposed only inside the network)
                                                └──────────────┘
```

### 10.1 Service-by-service

- **database** — built from `Database/Dockerfile` (`FROM mysql:latest`). The `.sql` export
  is copied into `/docker-entrypoint-initdb.d/`, so MySQL **auto-imports the schema + seed
  on first startup**. Started with `MYSQL_ALLOW_EMPTY_PASSWORD=1` and
  `MYSQL_DATABASE=dev_meetings`. A `healthcheck` runs `mysqladmin ping` so other services
  can wait for it to be truly ready. Port 3306 is `expose`d (reachable inside the compose
  network) but not published to the host.

- **backend** — built from `Backend/Dockerfile.compose`, whose `CMD` runs
  `NODE_ENV=compose`, selecting `config/compose.json` → DB host `database` (the compose
  service name resolves via Docker's internal DNS). It publishes `3000:3000` and uses
  `depends_on: database (condition: service_healthy)`, so it boots **only after** the DB
  passes its healthcheck.

- **frontend** — built from `Frontend/Dockerfile`, a **multi-stage** build:
  1. `node:24-alpine` stage runs `npm run build:docker` (Vite, mode `docker`) producing
     static files in `/app/dist`.
  2. `nginx:alpine` stage copies those files and `nginx.conf`, then serves them.
  Published as `6123:80`. `nginx.conf` uses `try_files $uri /index.html` so client-side
  routes (e.g. `/about`) resolve to the SPA instead of 404.

### 10.2 The critical networking subtlety

There are **two different perspectives**:

- The **backend container** reaches the database using the compose service name
  `database:3306` — that name only resolves *inside* the Docker network.
- The **frontend code runs in the user's browser**, *outside* Docker. So it must reach the
  backend via the **host port mapping**, i.e. `http://localhost:3000` — never
  `http://backend:3000` (the browser can't resolve `backend`).

That is exactly why `Frontend/.env.docker` sets `VITE_REST_SERVER_URL=http://localhost:3000`
and why the backend keeps `cors()` enabled (the browser calls it from the nginx origin,
a cross-origin request).

### 10.3 Layer caching in the Dockerfiles

Each Dockerfile copies `package*.json` and runs `npm install` **before** copying the rest
of the source. Dependencies change rarely, source changes often — so the (slow) install
layer is reused from cache on most rebuilds.

### 10.4 Standalone vs compose

`Backend/Dockerfile` (`NODE_ENV=docker`, host `host.docker.internal`) is for running the
backend container alone against a MySQL running on the host machine.
`Backend/Dockerfile.compose` (`NODE_ENV=compose`, host `database`) is for the full
compose stack. Same image build, different `CMD`/config.

---

## 11. Build, run, and verify

### Local (no Docker)

```bash
# Database
mysql -u root -p < Database/dev_meetings.sql

# Backend
cd Backend && npm install && npm run build && npm run dev      # http://localhost:3000

# Frontend
cd Frontend && npm install && npm run dev                      # http://localhost:5173
```

### Docker (all three at once)

```bash
docker compose up --build      # frontend http://localhost:6123, backend http://localhost:3000
```

### What was verified

- `tsc` build passes for the backend and `tsc -b && vite build` for the frontend, both with
  zero errors.
- Every route and validation rule was exercised (valid create → 201; past-start → 422;
  end<start → 422; missing field → 422; bad team → 422; update past meeting → 200;
  delete → 204 then 404; unknown route → 404).
- The full Docker stack was built and run: the DB became healthy, the backend connected to
  it over the compose network and served seeded data, and nginx served the SPA with
  client-side routing working.

---

## 12. Design decisions & notes

- **INT auto-increment PKs (task sheet vs reference):** the reference repo uses UUID
  primary keys; the assignment requires INT auto-increment keys, so this project uses
  `@PrimaryKey @AutoIncrement @Column(DataType.INTEGER)`. Where the task sheet and the
  reference conflict, the task sheet wins.
- **`timestamps: false`** keeps the tables exactly as specified (no `created_at` /
  `updated_at`).
- **Validation duplicated on both layers** intentionally — client for UX, server as the
  enforceable source of truth.
- **No auth / AWS / sockets / redux** — these exist in the reference repo but are out of
  scope for this assignment and were deliberately left out.
- **Developer info** (Omri Abu Daula) is shown on the About page and footer, and in
  `README.md`.
- **`node_modules` and `dist`** are git-ignored and Docker-ignored; the student deletes
  `node_modules` before zipping the submission.
```
