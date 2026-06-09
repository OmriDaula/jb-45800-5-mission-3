# Dev Teams Meetings

A full-stack web application for managing the meetings of development teams at a tech company.

Built for **Mission 3** — MySQL / TypeScript / Node.js / React.

**Author:** Omri Abu Daula — a full-stack web development student at John Bryce, passionate
about building clean, well-architected web apps with TypeScript and React.

## Structure

```
.
├── Database/   # MySQL schema + seed data export (.sql)
├── Backend/    # Node.js + Express + TypeScript REST API (Sequelize)
│   └── postman/  # Postman collection for all routes
└── Frontend/   # Vite + React + TypeScript client
```

## 1. Database

Import `Database/dev_meetings.sql` into MySQL (or MariaDB). It creates the
`dev_meetings` database with two tables — `dev_teams` and `meetings` — and seeds
them with sample teams and a mix of past and future meetings.

```bash
mysql -u root -p < Database/dev_meetings.sql
```

## 2. Backend

```bash
cd Backend
npm install
npm run build   # type-check / compile (tsc)
npm run dev     # start on http://localhost:3000 (ts-node-dev)
# or: npm start  (runs the compiled dist/app.js)
```

DB connection settings live in `config/default.json` and can be overridden with
environment variables (see `config/custom-environment-variables.json`).

### Routes

| Method | Route                    | Description                                  |
| ------ | ------------------------ | -------------------------------------------- |
| GET    | `/teams`                 | all dev teams                                |
| GET    | `/teams/:code/meetings`  | meetings of one team, ordered by start time  |
| GET    | `/meetings/:code`        | a single meeting (404 if missing)            |
| POST   | `/meetings`              | create a meeting                             |
| PUT    | `/meetings/:code`        | update a meeting                             |
| DELETE | `/meetings/:code`        | delete a meeting (204)                       |

Validation (HTTP 422 on failure): all fields required; `end_time` must be after
`start_time`; on **create** `start_time` may not be in the past; on **update** a
past meeting may be edited; the referenced `dev_team_code` must exist.

## 3. Frontend

```bash
cd Frontend
npm install
npm run dev     # http://localhost:5173
npm run build   # type-check + production build
```

The backend base URL is read from `import.meta.env.VITE_REST_SERVER_URL`
(see `Frontend/.env`, default `http://localhost:3000`).

## 4. Docker (optional — run everything with one command)

From the project root:

```bash
docker compose up --build
```

This starts three containers:

| Service    | Build         | Reach it at                         |
| ---------- | ------------- | ----------------------------------- |
| `database` | `./Database`  | internal `database:3306` (MySQL, seeded on first start) |
| `backend`  | `./Backend`   | `http://localhost:3000`             |
| `frontend` | `./Frontend`  | `http://localhost:6123` (nginx)     |

How the pieces talk:

- Browser &rarr; Frontend (nginx) at `http://localhost:6123`.
- Browser &rarr; Backend at `http://localhost:3000` (this is why `Frontend/.env.docker`
  uses `localhost`, not the compose service name).
- Backend &rarr; Database at host `database:3306` (via `NODE_ENV=compose` +
  `config/compose.json`). The backend waits for the DB's healthcheck before starting.

> Note: ports `3000` and `6123` must be free on the host.
