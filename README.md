# Sales Insight Automator — Rabbitt AI

Upload a `.csv` or `.xlsx` sales file, and instantly receive an AI-generated executive summary in your inbox.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Node.js, Express, TypeScript |
| AI | Google Gemini 1.5 Flash |
| Email | Nodemailer (SMTP) |
| Docs | Swagger / OpenAPI 3.0 |
| DevOps | Docker, docker-compose, GitHub Actions |

---

## Running locally with Docker Compose

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd cloudwach
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

- `GEMINI_API_KEY` — get one free at <https://aistudio.google.com/app/apikey>
- `SMTP_*` — any SMTP provider. For Gmail, [generate an App Password](https://myaccount.google.com/apppasswords)

### 3. Spin up the full stack

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | <http://localhost:3000> |
| Backend API | <http://localhost:8000> |
| Swagger docs | <http://localhost:8000/api-docs> |

---

## Running without Docker (development)

### Backend

```bash
cd backend
npm install
cp ../.env.example .env   # then fill in values
npm run dev               # ts-node-dev on port 8000
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## How the endpoints are secured

| Measure | Implementation |
|---|---|
| **HTTP security headers** | `helmet` — sets `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, CSP, and more |
| **CORS** | Only the origin defined in `CORS_ORIGIN` is allowed; blocked by the browser for all others |
| **Rate limiting** | `express-rate-limit` — 20 requests per 15 min per IP; returns `429` when exceeded |
| **File validation** | MIME type **and** extension must match `.csv`/`.xlsx`; enforced by multer `fileFilter` |
| **File size cap** | 5 MB hard limit in multer |
| **Input validation** | `express-validator` validates and normalises the `email` field |

---

## API

`POST /api/upload` — multipart form with `file` (CSV/XLSX) + `email`

Full interactive docs: `GET /api-docs`

---

## Environment variables reference

See [`.env.example`](.env.example) for every required key and its description.

---

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`) triggers on every PR to `main`:

1. Installs dependencies
2. Runs `eslint` linting
3. Compiles TypeScript / builds Next.js
