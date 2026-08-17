# LaunchLab Frontend

LaunchLab is a frontend-only campaign planning workspace. Enter a product, target audience, and budget to generate a structured mock campaign plan, or review five realistic mock campaigns in the dashboard.

## Routes

- / — Campaign Generator
- /admin — Campaign Dashboard

## Run locally

Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm run dev
```

Then open http://localhost:5173.

## Build

```bash
pnpm run typecheck
pnpm run build
```

This stage intentionally has no backend, database, authentication, AI integration, or real API calls.
