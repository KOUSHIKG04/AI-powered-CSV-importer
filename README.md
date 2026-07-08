# AI-powered CSV Importer

An AI-assisted CSV importer for converting messy lead exports into GrowEasy CRM
records. The app supports arbitrary CSV column names, previews uploaded rows
before AI processing, and maps confirmed imports into a normalized CRM schema.

## Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn-style components
- Backend: Node.js, Express, TypeScript
- AI: Gemini via `@google/generative-ai`

## Features

- Drag and drop CSV upload
- Backend CSV parsing with preview before AI processing
- Responsive preview table with horizontal and vertical scrolling
- Confirm-before-import workflow
- AI batch processing with retry handling
- Streaming import progress with Server-Sent Events
- Successful and skipped record tabs
- Virtualized result table for larger imports
- Dark mode

## CRM Output Fields

The AI maps each row into these GrowEasy CRM fields when available:

`created_at`, `name`, `email`, `country_code`,
`mobile_without_country_code`, `company`, `city`, `state`, `country`,
`lead_owner`, `crm_status`, `crm_note`, `data_source`, `possession_time`,
`description`.

Invalid rows with neither email nor mobile number are marked as skipped.

## API Endpoints

Backend base URL defaults to `http://localhost:5000`.

- `POST /api/v1/parse`
  - Multipart upload field: `file`
  - Parses a CSV and returns `headers`, `rows`, and `total`
  - Does not run AI

- `POST /api/v1/import`
  - JSON body: `{ "records": [...] }`
  - Returns all mapped records as structured JSON

- `POST /api/v1/import-stream`
  - JSON body: `{ "records": [...] }`
  - Streams batch results as Server-Sent Events for progress updates

## Setup

Install dependencies for both apps:

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

Set `GEMINI_API_KEY` in `backend/.env`.

Run the backend:

```bash
cd backend
npm run dev
```

Run the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the frontend URL printed by Next.js, usually `http://localhost:3000`.

## Validation

```bash
cd backend
npm run typecheck

cd ../frontend
npm run typecheck
npm run lint
```
