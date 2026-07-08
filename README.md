# AI-powered CSV Importer

AI-powered CSV importer for converting messy lead exports into GrowEasy CRM
records. Users can upload arbitrary CSV files, preview rows before AI work
starts, confirm import, and then receive normalized CRM records with skipped
record reporting.

## Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn-style components
- Backend: Node.js, Express, TypeScript
- AI: Gemini via `@google/generative-ai`
- Runtime: Stateless, no database required

## Features

- Drag and drop CSV upload
- File picker upload
- Browser-side CSV preview before backend/AI calls
- Responsive preview table with horizontal and vertical scrolling
- Confirm-before-import workflow
- AI batch extraction with Gemini
- Retry handling for failed AI batches
- Streaming import updates with Server-Sent Events
- Indeterminate frontend loading indicator during AI processing
- Imported and skipped result tabs
- Virtualized result table for larger imports
- Dark mode
- Docker setup
- Basic backend unit test coverage

## CRM Output Fields

The AI maps each row into these GrowEasy CRM fields when available:

`created_at`, `name`, `email`, `country_code`,
`mobile_without_country_code`, `company`, `city`, `state`, `country`,
`lead_owner`, `crm_status`, `crm_note`, `data_source`, `possession_time`,
`description`.

Invalid rows with neither email nor mobile number are marked as skipped.

## AI Rules

- `crm_status` is restricted to:
  `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`
- `data_source` is restricted to:
  `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`,
  `sarjapur_plots`, or blank
- `created_at` must be valid for `new Date(created_at)`
- Extra emails, extra phone numbers, remarks, and unknown useful values go into
  `crm_note`
- Line breaks are escaped so each result remains CSV-compatible
- Rows without email and mobile number are skipped

## API Endpoints

Backend base URL defaults to `http://localhost:5000`.

- `POST /api/v1/parse`
  - Multipart upload field: `file`
  - Parses a CSV and returns `headers`, `rows`, and `total`
  - Does not run AI

- `POST /api/v1/import-csv`
  - Multipart upload field: `file`
  - Parses the uploaded CSV, maps records with AI in batches, and returns
    structured JSON

- `POST /api/v1/import-stream`
  - JSON body: `{ "records": [...] }`
  - Streams AI batch results as Server-Sent Events
  - Used by the frontend after the user confirms import

## Environment

Backend `.env`:

```env
PORT_NUMBER=5000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Local Setup

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
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

Open `http://localhost:3000`.

## Docker

From the repository root:

```bash
docker compose up --build
```

Pass Gemini credentials through your shell environment:

```bash
GEMINI_API_KEY=your_key docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Validation

Backend:

```bash
cd backend
npm run typecheck
npm test
```

Frontend:

```bash
cd frontend
npm run typecheck
npm run lint
```



