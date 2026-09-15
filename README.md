# SEO Portal — Frontend

React + TypeScript + Vite. Talks to the Django backend (`../backend`) only
through REST — see `../README.md` for the overall picture.

## Structure

```
src/
├── api/            # apiClient.ts (axios + auth/refresh interceptor), one service per domain
├── contexts/        # AuthContext + AuthProvider
├── hooks/           # useAuth, useForm
├── components/
│   └── ui/          # Button, Field, Card, EmptyState/ErrorText/LoadingState — the design system
├── pages/           # SignInPage, SignUpPage, DashboardPage
└── types/            # mirrors the backend's serializers
```

## Rules this codebase follows (don't break these when adding features)

- **No component calls `fetch`/`axios` directly.** Every request goes through
  a `*Service` in `src/api/`. If a new domain needs API calls, add a new
  service file — don't inline requests in a component.
- **The access token never touches localStorage/sessionStorage.** It lives in
  a module-level variable in `apiClient.ts`, reset on every full page load,
  silently re-derived from the httpOnly refresh cookie by
  `authService.bootstrapSession()` at startup. This is intentional — see the
  comment in `apiClient.ts`.
- **Forms use `useForm`** for consistent loading/error/field-error state,
  including automatically mapping the backend's
  `{error: {details: {field: [...]}}}` validation shape onto per-field
  errors. Don't hand-roll `useState` triplets for every form.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173, expects the backend on :8000 (see .env)
```

```bash
npm run lint       # oxlint
npx tsc -b         # typecheck
npm run build      # production build
```
