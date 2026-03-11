# Sales Insight Automator

> **Rabbitt AI — AI Cloud DevOps Engineer Assignment**
> A secure, containerised tool that transforms raw sales CSV/Excel data into AI-generated executive summaries delivered straight to your inbox.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | _Add your Vercel URL here_ |
| Swagger / API Docs | _Add your Render URL_ `/api-docs` |

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Quick Start — Docker Compose](#quick-start--docker-compose)
5. [Quick Start — Local Dev](#quick-start--local-dev)
6. [Environment Variables](#environment-variables)
7. [Security](#security)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [API Documentation](#api-documentation)
10. [Project Structure](#project-structure)

---

## Overview

The sales team at Rabbitt AI deals with large quarterly CSV/Excel files that are difficult to distil into leadership-ready summaries. This tool solves that in three steps:

1. **Upload** — A team member uploads a `.csv` or `.xlsx` sales file via the SPA.
2. **Analyse** — The backend parses the data and sends it to **Gemini 2.5 Flash**, which produces a professional executive narrative.
3. **Deliver** — The AI-generated summary is emailed directly to the specified recipient via SMTP.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│               Next.js 15 SPA  (port 3000)                    │
│          Upload form → real-time feedback UI                 │
└────────────────────────┬─────────────────────────────────────┘
                         │  POST /api/upload (multipart)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              Express + TypeScript API  (port 8000)           │
│                                                              │
│  Security layer : Helmet · CORS · Rate Limiter               │
│  Validation     : Multer (file) · express-validator (email)  │
│                                                              │
│   ┌──────────┐    ┌──────────────────┐    ┌──────────────┐  │
│   │  Parser  │───▶│  Gemini 2.5      │───▶│  Nodemailer  │  │
│   │ (SheetJS)│    │  Flash (LLM)     │    │  (SMTP)      │  │
│   └──────────┘    └──────────────────┘    └──────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| **Backend** | Node.js, Express, TypeScript |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| **Email** | Nodemailer — works with Gmail App Passwords or any SMTP provider |
| **File Parsing** | SheetJS (`xlsx`) — handles both `.csv` and `.xlsx` natively |
| **Security** | Helmet, express-rate-limit, CORS, express-validator, Multer |
| **API Docs** | Swagger UI / OpenAPI 3.0 (`swagger-jsdoc` + `swagger-ui-express`) |
| **Containerisation** | Docker multi-stage builds, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Quick Start — Docker Compose

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier available)
- SMTP credentials — Gmail [App Password](https://myaccount.google.com/apppasswords) recommended

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd cloudwach
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Open .env and fill in GEMINI_API_KEY and SMTP_* values
```

### 3. Build and start

```bash
docker compose up --build
```

The first build installs all dependencies inside the containers and compiles the code. Subsequent starts skip the build:

```bash
docker compose up
```

### 4. Open the app

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| Swagger Docs | http://localhost:8000/api-docs |
| Health Check | http://localhost:8000/health |

### 5. Stop

```bash
docker compose down
```

**Other useful commands**

```bash
docker compose up -d            # run in background
docker compose logs -f          # stream logs
docker compose up --build       # rebuild after a code change
```

---

## Quick Start — Local Dev

**Terminal 1 — Backend**

```bash
cd backend
npm install
npm run dev        # ts-node-dev hot-reload on port 8000
```

**Terminal 2 — Frontend**

```bash
cd frontend
npm install
npm run dev        # Next.js hot-reload on port 3000
```

The backend reads `.env` from the project root automatically.

---

## Environment Variables

Copy `.env.example` to `.env` at the **project root** and fill in the values below.

```env
# ── Server ────────────────────────────────────────────────────
PORT=8000

# ── CORS ──────────────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000

# ── Rate Limiting ─────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000   # 15 minutes in milliseconds
RATE_LIMIT_MAX=20             # Max requests per window per IP

# ── AI / LLM ──────────────────────────────────────────────────
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── Email / SMTP ──────────────────────────────────────────────
# Gmail: enable 2FA → https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM=your_gmail@gmail.com

# ── Frontend ──────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> `.env` is in `.gitignore` and will never be committed. Only `.env.example` (with no real values) is tracked.

---

## Security

The API is hardened at multiple independent layers:

| Layer | Mechanism | What it does |
|---|---|---|
| **HTTP Security Headers** | `helmet` | Automatically sets `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, and other OWASP-recommended headers on every response |
| **CORS** | `cors` | Only the origin defined in `CORS_ORIGIN` is permitted. All other origins are blocked at the browser |
| **Rate Limiting** | `express-rate-limit` | 20 requests per 15-minute window per IP. Exceeding the limit returns `HTTP 429` |
| **File Type Validation** | `multer` fileFilter | Both the **MIME type** and the **file extension** must match `.csv` or `.xlsx`. Files failing either check are rejected before any processing begins |
| **File Size Cap** | `multer` limits | Maximum upload is **5 MB**. Larger payloads are rejected with `HTTP 400` |
| **Input Validation** | `express-validator` | The `email` field is strictly validated and normalised before reaching business logic |
| **In-Memory Only** | `multer.memoryStorage()` | Uploaded files are never written to disk — held in memory, processed, and immediately discarded |
| **Non-Root Container** | Dockerfile `USER node` | Both containers drop from root to the unprivileged `node` user before the process starts |

---

## CI/CD Pipeline

A GitHub Actions workflow at `.github/workflows/ci.yml` runs automatically on every **Pull Request to `main`**.

```
PR opened / updated
        │
        ├──▶ Backend job
        │      ├── npm ci
        │      ├── eslint  (lint)
        │      └── tsc     (build — zero type errors required)
        │
        └──▶ Frontend job
               ├── npm ci
               ├── next lint
               └── next build
```

Both jobs must pass before a PR can be merged, ensuring no broken builds or lint regressions reach the main branch.

---

## API Documentation

A live Swagger UI is available at **`/api-docs`** when the backend is running.

### `POST /api/upload`

Accepts a `multipart/form-data` request with two fields:

| Field | Type | Constraint | Description |
|---|---|---|---|
| `file` | `binary` | `.csv` or `.xlsx`, max 5 MB | Sales data file |
| `email` | `string` | Valid email format | Recipient for the AI summary |

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Summary generated and sent to user@example.com.",
  "summary": "Q1 2026 showed strong performance in Electronics..."
}
```

**Error responses**

| Status | Reason |
|---|---|
| `400` | Missing file · invalid file type · file too large · invalid email |
| `429` | Rate limit exceeded |
| `500` | LLM or SMTP failure |

### `GET /health`

```json
{ "status": "ok", "timestamp": "2026-03-11T12:00:00.000Z" }
```

---

## Project Structure

```
cloudwach/
├── .env.example                   # Environment variable template (safe to commit)
├── .gitignore
├── docker-compose.yml             # Orchestrates backend + frontend containers
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions — lint & build on PR to main
│
├── backend/
│   ├── Dockerfile                 # Multi-stage production image (builder + runner)
│   ├── .dockerignore
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts               # Express app entry point + dotenv bootstrap
│       ├── swagger.ts             # OpenAPI 3.0 spec configuration
│       ├── middleware/
│       │   └── security.ts        # Helmet · CORS · Rate limiter setup
│       ├── routes/
│       │   └── upload.ts          # POST /api/upload — Swagger-annotated handler
│       └── services/
│           ├── parser.ts          # SheetJS CSV/XLSX → structured JSON
│           ├── llm.ts             # Gemini 2.5 Flash prompt + response
│           └── email.ts           # Nodemailer SMTP dispatch + HTML template
│
└── frontend/
    ├── Dockerfile                 # Multi-stage Next.js standalone image
    ├── .dockerignore
    ├── components.json            # shadcn/ui configuration
    ├── next.config.ts             # standalone output for Docker
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx           # Hero, steps, and UploadForm composition
        │   └── globals.css        # Tailwind v4 + shadcn CSS variable theme
        ├── components/
        │   ├── UploadForm.tsx     # SPA form: drag & drop, loading/success/error states
        │   └── ui/                # shadcn/ui components (no external CDN)
        │       ├── alert.tsx
        │       ├── badge.tsx
        │       ├── button.tsx
        │       ├── card.tsx
        │       └── input.tsx
        └── lib/
            └── utils.ts           # cn() — clsx + tailwind-merge utility
```
