# AI-powered CSV Importer

An AI-assisted CSV importer that converts messy lead exports into normalized
GrowEasy CRM records. Users can upload any valid CSV, preview the raw rows,
confirm the import, and receive AI-mapped CRM records with skipped-record
reporting.

Live app: https://ai-powered-csv-importer-xi.vercel.app/

Backend health check: https://ai-powered-csv-importer-xi.vercel.app/health

Repository: https://github.com/KOUSHIKG04/AI-powered-CSV-importer

## What It Solves

CSV exports from Facebook, Google Ads, CRMs, sales sheets, and manually created
spreadsheets rarely use the same column names. This project uses Gemini to infer
CRM lead fields from arbitrary column names and values, then normalizes the
result into the GrowEasy CRM format.

The important workflow is:

1. Upload a CSV.
2. Preview raw CSV rows without AI processing.
3. Confirm import.
4. Backend sends records to Gemini in batches.
5. Frontend streams and displays imported/skipped CRM records.

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| UI | Base UI, shadcn-style components, lucide-react |
| CSV Preview | PapaParse in browser |
| Result Table | TanStack Virtual |
| Backend | Node.js, Express, TypeScript |
| CSV Parsing | csv-parse |
| AI | Gemini via `@google/generative-ai` |
| Tests | Vitest |
| Deployment | Vercel Services |
| Containerization | Docker, Docker Compose |

## Features

- Drag and drop CSV upload
- File picker upload
- Client-side CSV preview before backend or AI work
- Responsive preview table with horizontal and vertical scrolling
- Sticky preview table headers
- Confirm-before-import flow
- Gemini-powered field mapping
- AI batch processing
- Retry mechanism for failed AI batches
- Server-Sent Events streaming for import progress/results
- Imported and skipped result tabs
- Virtualized result table for larger imports
- Dark mode
- Docker setup
- Backend unit tests
- Vercel multi-service deployment config

## CRM Fields

The AI extracts as many of these GrowEasy CRM fields as possible:

```txt
created_at
name
email
country_code
mobile_without_country_code
company
city
state
country
lead_owner
crm_status
crm_note
data_source
possession_time
description
```

## AI Rules

`crm_status` is restricted to:

```txt
GOOD_LEAD_FOLLOW_UP
DID_NOT_CONNECT
BAD_LEAD
SALE_DONE
```

`data_source` is restricted to:

```txt
leads_on_demand
meridian_tower
eden_park
varah_swamy
sarjapur_plots
```

Other AI normalization rules:

- `created_at` must be valid with `new Date(created_at)`.
- If multiple emails exist, the first email is used and the rest go into
  `crm_note`.
- If multiple mobile numbers exist, the first mobile is used and the rest go
  into `crm_note`.
- Remarks, follow-up notes, extra contact details, and unmatched useful values
  go into `crm_note`.
- Line breaks are escaped as `\n` to keep records CSV-compatible.
- Rows with neither email nor mobile number are skipped.

## Project Structure

```txt
.
├── backend
│   ├── src
│   │   ├── controllers
│   │   │   └── csvController.ts
│   │   ├── middleware
│   │   │   └── errorHandler.ts
│   │   ├── routes
│   │   │   └── csvRoutes.ts
│   │   ├── services
│   │   │   ├── aiService.ts
│   │   │   ├── batchService.ts
│   │   │   └── csvImportService.ts
│   │   ├── types
│   │   │   └── crm.ts
│   │   ├── utils
│   │   │   └── csvParser.ts
│   │   ├── validators
│   │   │   └── csvValidator.ts
│   │   ├── application.ts
│   │   └── server.ts
│   └── tests
│       ├── services
│       └── utils
├── frontend
│   ├── app
│   │   └── manage-leads
│   ├── components
│   ├── hooks
│   └── lib
├── docker-compose.yml
└── vercel.json
```

## API Endpoints

Local backend base URL:

```txt
http://localhost:5000
```

Production routes are handled through Vercel rewrites.

### `GET /health`

Health check endpoint.

Expected response:

```json
{
  "success": true,
  "status": "ok"
}
```

### `POST /api/v1/parse`

Parses a CSV file and returns raw preview data. This endpoint does not run AI.

Multipart field:

```txt
file
```

### `POST /api/v1/import-csv`

Accepts a CSV file, parses it, sends records to Gemini in batches, and returns
structured JSON.

Multipart field:

```txt
file
```

### `POST /api/v1/import-stream`

Accepts parsed records as JSON and streams AI results using Server-Sent Events.
This is the endpoint used by the frontend after the user confirms import.

Request body:

```json
{
  "records": []
}
```

Stream event types:

```txt
batch_result
done
error
```

## Environment Variables

Create `backend/.env`:

```env
PORT_NUMBER=5000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
AI_BATCH_SIZE=10
```

Optional frontend local override:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

For Vercel, add these environment variables:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
AI_BATCH_SIZE=10
FRONTEND_URL=https://ai-powered-csv-importer-xi.vercel.app
```

`PORT_NUMBER` is not required on Vercel because Vercel provides `PORT`.

## Local Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Validation Commands

Backend:

```bash
cd backend
npm run typecheck
npm test -- run
npm run build
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

## Docker

From the repository root:

```bash
docker compose up --build
```

If your shell supports inline environment variables:

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

Services:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## Deployment

This project uses Vercel Services for the monorepo.

`vercel.json` routes:

- `/health` to the backend service
- `/api/*` to the backend service
- all other routes to the frontend service

Backend service:

```json
{
  "root": "backend",
  "framework": "node",
  "buildCommand": "npm run build",
  "entrypoint": "server.js"
}
```

Frontend service:

```json
{
  "root": "frontend",
  "framework": "nextjs"
}
```

After deployment, verify:

```txt
https://ai-powered-csv-importer-xi.vercel.app/
https://ai-powered-csv-importer-xi.vercel.app/health
```

## Notes For Reviewers

- The frontend parses and previews CSV data before AI processing.
- The backend is only called after the user confirms import.
- AI output is normalized and validated before being returned.
- Invalid rows are retained as skipped records with reasons.
- Result rendering uses virtualization for better large-table performance.
- The application is stateless and does not require a database.

## Security Note

Do not commit real `.env` files. If an API key is exposed, rotate it immediately
in Google AI Studio and update the deployment environment variables.
