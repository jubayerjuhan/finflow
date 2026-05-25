# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev        # Start dev server on 0.0.0.0:3000 (all interfaces)

# Production
npm run build      # Build for production (TypeScript and ESLint errors are suppressed — see next.config.mjs)
npm run start      # Start production server

# Linting
npm run lint       # Run Next.js ESLint
```

There are no test commands configured — `@playwright/test` is installed as a dev dependency but no test scripts exist in `package.json`.

## Environment

Requires `MONGODB_URI` environment variable pointing to a MongoDB instance. The app will throw at startup if this is missing (`lib/db.ts`).

## Architecture Overview

FinFlow is a **Next.js 14 App Router** personal finance PWA with an Apple HIG-inspired design system. It is a full-stack monorepo — the API and frontend live together.

### Request Lifecycle

```
Browser (React + Redux)
  → services/*.ts           (axios wrappers, baseURL: /api)
  → app/api/**/route.ts     (Next.js Route Handlers)
  → lib/db.ts               (singleton Mongoose connection)
  → models/*.ts             (Mongoose schemas)
  → MongoDB
```

Redux state is populated by dispatching `createAsyncThunk` actions from the `store/slices/` directory; those thunks call service functions which hit the API routes.

### Layer Responsibilities

| Layer | Location | Role |
|---|---|---|
| Pages | `app/**/page.tsx` | Client components; dispatch Redux thunks on mount |
| API Routes | `app/api/**/route.ts` | Server-side; call `connectDB()`, use Mongoose models directly |
| Redux Slices | `store/slices/*.ts` | Client state + async thunks |
| Services | `services/*.ts` | Typed axios helpers; used only by Redux thunks |
| Models | `models/*.ts` | Mongoose schemas and TypeScript interfaces |
| Shared lib | `lib/` | `db.ts` (DB connection), `axios.ts` (client instance), `utils.ts` (`cn()` helper) |

### Redux Store

Configured in `store/index.ts` with `redux-persist`. Only `wallets`, `categories`, and `theme` slices are persisted to `localStorage` (key: `finflow-root`). Other slices (`transactions`, `budgets`, `upcoming`, `reports`) are always re-fetched.

Always use the typed hooks from `store/hooks.ts`:
```ts
const dispatch = useAppDispatch();
const wallets = useAppSelector((s) => s.wallets.items);
```

### Data Models

- **Wallet** — name, icon (emoji), color (hex), currency (default `BDT`), balance
- **Category** — name, icon (emoji), color (hex), `isDefault` flag
- **Transaction** — type: `income | expense | transfer`, links `walletId` + optional `toWalletId`, `categoryId`, amount, date, note
- **Budget** — `categoryId` + `month` (`YYYY-MM`) with a unique compound index; stores spending limit only (actual spend is calculated from transactions at query time)
- **UpcomingExpense** — scheduled bills with `status: pending | paid | skipped`, `recurring: none | weekly | monthly | yearly`; paying one creates a real Transaction and links back via `paidTransactionId`

### API Conventions

- All routes call `connectDB()` at the top.
- Successful responses: `{ data: ... }` (single) or `{ data: [...], total, page, totalPages }` (paginated).
- Error responses: `{ error: string }` with appropriate HTTP status.
- The axios client in `lib/axios.ts` automatically shows a `react-hot-toast` error for any failed response.
- `AppShell` calls `/api/seed` (POST) on every page load to ensure default categories exist — this is idempotent and intentional.

### Special API Endpoints

- `POST /api/wallets/transfer` — atomically moves funds between wallets, auto-creates a "Transfer" category if missing, records a transfer Transaction.
- `POST /api/upcoming/[id]/pay` — marks an UpcomingExpense as paid, deducts from wallet balance, and creates an expense Transaction.
- `GET /api/reports/summary` — aggregates income/expense totals, breakdown by category, 6-month trend, and wallet balances using MongoDB aggregation pipelines.

### Layout

`app/layout.tsx` wraps everything in `ReduxProvider` (Redux + PersistGate) → `AppShell`. `AppShell` handles:
- Seeding the database on first load
- Initial `fetchWallets` + `fetchCategories` dispatches
- `ThemeProvider` (reads `theme.mode` from Redux, applies `.dark` class to `<html>`)
- `Sidebar` (desktop, fixed left, 256px wide) + `BottomNav` (mobile)
- Global toast notifications via `react-hot-toast`

Desktop layout: `md:pl-64` offset on main content. Mobile: `pb-24` offset for bottom nav.

### Design System

The UI follows **Apple Human Interface Guidelines** throughout:
- Colors are defined as CSS HSL variables in `app/globals.css` with full light/dark token sets (e.g., `--primary: 211 100% 50%` = iOS Blue `#007AFF`).
- Custom Apple semantic tokens are exposed via Tailwind: `text-apple-green`, `text-apple-red`, `shadow-apple`, `shadow-apple-md`, etc.
- Utility classes: `.glass`, `.glass-dark`, `.glass-nav` for frosted-glass effects; `.tap-scale` for press animations.
- All UI primitives in `components/ui/` are **shadcn/ui** components — do not edit them directly; re-generate with `npx shadcn add <component>`.
- Font stack: SF Pro Display / SF Pro Text / system-ui (system fonts, no web font downloads).
- The default currency symbol displayed is `৳` (BDT — Bangladeshi Taka).

### Path Aliases

`@/` maps to the repository root (configured in `tsconfig.json`). Use `@/` for all internal imports.
