# ModelLedger frontend

Standalone Next.js App Router frontend for ModelLedger. It uses React, TypeScript, Tailwind CSS, Recharts, and React Flow. The approved visual direction is a warm beige-and-red palette, tactile outlined cards and buttons, and playful pictographic page marks; the supplied HTML is used as a layout/navigation reference, not as the dark color theme. This project contains no backend, database, AI/ML implementation, smart contract, blockchain client, or secret credentials.

## Run locally

Requires Node.js 20+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development and production servers bind to `0.0.0.0`. Validate with:

```bash
npm run lint
npm run typecheck
npm run build
```

## Project structure

```text
app/                    App Router pages and global styles
components/layout/      Sidebar, top bar, and app shell
components/ui/           Shared controls, data display, status, and visualization components
components/features/     Dashboard, resource, and detail page compositions
lib/api/                 Read-only FastAPI client
lib/hooks/               Typed resource hooks
lib/mock/                Deliberately fixture-free placeholder
lib/types/               Frontend view types (not a confirmed backend schema)
lib/utils/               Formatting, class-name, and status helpers
public/                  Static public assets
```

The root route `/` is the dashboard. Additional views are `/models`, `/models/[id]`, `/artifacts`, `/artifacts/[artifactId]`, `/verification`, `/provenance`, `/testing`, `/lifecycle`, `/history`, and `/activity`.

## FastAPI integration boundary

The browser uses a read-only JSON client to call the FastAPI service. It does not call AI or blockchain services directly. Endpoint paths are intentionally blank in `.env.example`; fill them in only after receiving the backend's API.md/OpenAPI contract. A blank endpoint displays an explicit configuration state—there are no seeded records, sample metrics, inferred statuses, or fabricated verification results.

The TypeScript types in `lib/types/index.ts` are frontend display types based only on the requested product concepts; they are not a declaration of the final backend response schema. If the documented API payload differs, add a frontend adapter in `lib/api/client.ts` (or a dedicated adapter module) without changing or guessing the backend contract. Detail endpoint templates can use `{modelId}` and `{artifactId}` placeholders when those exact routes are documented.

For cross-origin deployments, configure FastAPI CORS for the frontend origin. Requests use `credentials: 'include'` for cookie-based sessions. Never expose bearer tokens, RPC credentials, or private keys through `NEXT_PUBLIC_*` variables. Same-origin deployments may use a reverse proxy.

Write actions are not sent: registration, testing, approval/rejection, and verification-request endpoints and payloads have not been specified. Artifacts remain evidence linked to models and versions. Trust, provenance, testing, lifecycle, and blockchain fields are displayed only when supplied by the backend.
