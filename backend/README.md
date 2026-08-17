# LaunchLab Backend

LaunchLab Backend is a small REST API for generating and persisting structured campaign plans. It uses Express, SQLite, and Gemini, with deterministic campaign logic kept separate from the AI service.

## Architecture

```text
Frontend
   ↓
POST /api/campaigns
   ↓
Validation
   ↓
AI Service
   ↓
Logic Layer
   ↓
SQLite
   ↓
Structured Response
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Deployment and debugging health check |
| POST | `/api/campaigns` | Validate input, generate a campaign, run deterministic logic, save it, and return structured JSON |
| GET | `/api/campaigns` | Return all saved campaigns from SQLite |
| GET | `/api/campaigns/:id` | Return one complete saved campaign |

### Create campaign

```json
{
  "product": "Protein Bar",
  "audience": "College students aged 18-24",
  "budget": 10000
}
```

The response includes campaign ideas, ad copy variants, channel scores, budget allocation, budget tier, recommended channels, risk, and the creation timestamp. Raw Gemini text is never returned.

## Environment variables

- `GEMINI_API_KEY` — preferred direct Gemini API key when running outside Replit
- `OPENAI_API_KEY` — compatibility alias accepted by the backend because the original project brief used this name
- `PORT` — server port, default `3000`
- `AI_INTEGRATIONS_GEMINI_BASE_URL` and `AI_INTEGRATIONS_GEMINI_API_KEY` — provisioned automatically when using Replit's managed Gemini integration
- `SQLITE_DB_PATH` — optional custom SQLite file path

The backend starts without a Gemini key so health checks remain available, but campaign creation returns a clear configuration error until Gemini is configured.

## Running locally

From this directory:

```bash
cp .env.example .env
npm install
npm start
```

The SQLite database is created automatically at `data/launchlab.sqlite`.

For development:

```bash
npm run dev
```

## Testing

Run deterministic unit tests with:

```bash
npm test
```

The full API pipeline can be exercised with the route examples above after configuring Gemini.