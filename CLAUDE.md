# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:8080
npm run build        # Production build
npm run build:dev    # Dev-mode build
npm run lint         # ESLint check
npm run test         # Run unit tests (Vitest, single run)
npm run test:watch   # Run unit tests in watch mode
npm run preview      # Preview production build locally
```

Run a single test file:
```bash
npx vitest run src/__tests__/transfer.test.ts
```

## Architecture

**Onda Finance** is a client-side-only React SPA (no backend). All data is mocked and persisted in `localStorage`.

### Data flow

```
Page component
  → React Query (useQuery / useMutation)
    → Service function (src/services/api.ts)     ← mock axios, no real HTTP
      → Zustand store update (src/store/)
        → localStorage persistence
```

- **`src/services/api.ts`** — all "API" calls live here (`loginRequest`, `fetchTransactions`, `submitTransfer`). They return hardcoded fake data. Swapping to a real backend only requires changing this file.
- **`src/store/authStore.ts`** — auth state with `persist` middleware (localStorage key: `onda-auth`). Drives route protection.
- **`src/store/financeStore.ts`** — balance and transactions with `persist` middleware (localStorage key: `onda-finance`). Initial balance is R$ 15,000.00 hardcoded here.
- **React Query** is configured with `staleTime: Infinity` — mock data never refetches.

### Routing (`src/App.tsx`)

| Path | Component | Protected |
|---|---|---|
| `/` | redirect → `/login` | no |
| `/login` | Login | no |
| `/dashboard` | Dashboard | yes |
| `/transfer` | Transfer | yes |
| `*` | NotFound | no |

`ProtectedRoute` checks `authStore` and redirects to `/login` if unauthenticated.

### UI system

- **shadcn/ui** pre-installed in `src/components/ui/` — use existing components before building custom ones.
- **Tailwind CSS** with CSS variable–based theming; dark mode is class-based.
- **CVA** (`class-variance-authority`) used for type-safe component variants (shadcn pattern).
- **Sonner** for toasts; **next-themes** for theme switching.

### Forms & validation

- **React Hook Form + Zod** — schemas defined inline in each page component.
- Transfer schema validates that amount does not exceed current balance (cross-field rule in Zod's `.refine()`).

### Path alias

`@/*` resolves to `./src/*` (configured in `tsconfig.json` and `vite.config.ts`).

### TypeScript notes

The project uses loose TypeScript settings (`strict: false`, `noImplicitAny: false`, `skipLibCheck: true`). Don't tighten these project-wide.

## Testing

- **Vitest** with jsdom — global test APIs enabled, no explicit imports needed.
- `src/test/setup.ts` provides a `window.matchMedia` polyfill required by Radix UI components.
- Tests live in `src/__tests__/`. Current coverage: Zod schema validation for the transfer form.
- **Playwright** is configured (`playwright.config.ts`) but no E2E tests exist yet.

## Demo credentials

- Email: `gabriel@onda.finance`
- Password: `senha123`
