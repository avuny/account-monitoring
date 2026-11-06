# AGENTS.md

Guidance for AI coding agents working on **Accounts monitoring**. Read this before changing code.

## What the app does
Signed-in users keep a list of emails. Each email has many accounts. An account has a name, an optional quota (0–100 %) and an optional next reset time. The Accounts page shows every account in a sortable table; the Emails page shows emails with expandable rows listing their accounts. Accounts whose reset time has passed get a green "Reset … ago" label, accounts resetting within 24 h get an amber label.

## Stack
Next.js (App Router) · TypeScript (strict) · Tailwind CSS v4 · shadcn-style components · next-themes (light/dark) · Next.js route handlers for the API · Zod + react-hook-form · TanStack Table · Sonner · Drizzle ORM + Postgres (Neon) · jose (JWT) + bcryptjs.

## Layout
- `src/app/(auth)` – login and signup pages (public).
- `src/app/(app)` – protected pages: `dashboard` (accounts table) and `emails`.
- `src/app/api/**/route.ts` – API. Every handler except signup/login starts with `getSession()` and returns 401 without it.
- `src/middleware.ts` – redirects guests to `/login` and signed-in users away from the auth pages.
- `src/db/schema.ts` – Drizzle schema. `src/db/index.ts` – client.
- `src/lib/validators.ts` – server-side Zod schemas. Forms have their own Zod schema next to the form component.
- `src/lib/jwt.ts` (edge-safe) and `src/lib/auth.ts` (cookies) – access token handling. The token lives in an httpOnly cookie named `access_token`.
- `src/lib/time.ts` – duration, reset status and date helpers. `src/lib/use-monitor-data.ts` – client data hook.
- `src/components/ui` – primitives. `src/components` – feature components.

## Rules
1. **Theme colors only.** Use `bg-background`, `text-foreground`, `bg-muted`, `border-border`, `text-success`, `text-warning`, etc. Never `bg-black`, `text-white`, `bg-gray-*` or hex values. Add new colors as CSS variables in `src/app/globals.css` (both `:root` and `.dark`) and register them in `@theme inline`.
2. **Validate every input with Zod**, on the client form and again in the route handler.
3. **Scope every query to the signed-in user** (`userId` in the `where`). Never trust ids from the client.
4. **Toasts:** use Sonner (`toast.success` / `toast.error`) for results of user actions.
5. **Dates:** the database stores UTC (`timestamptz`); the API sends ISO strings; formatting happens in the browser so users see their own time zone. Do not format dates in server components.
6. **Schema changes:** edit `src/db/schema.ts`, then run `npm run db:push` (or `db:generate` + `db:migrate`).
7. New shadcn components: `npx shadcn@latest add <name>` (config in `components.json`).
8. Keep route handlers thin: parse → authorize → query → respond with `{ error }` and a proper status on failure.

## Commands
`npm run dev` · `npm run build` · `npm run db:push` · `npm run db:studio`
