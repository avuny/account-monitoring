# Accounts monitoring

Track emails, the accounts attached to each one, their current quota and when they reset.

- Sign up / sign in with email and password (JWT access token in an httpOnly cookie)
- Add emails; add many accounts per email with an optional quota (0–100 %) and next reset time
- Reset time can be relative (days / hours / minutes from now) or an exact date and time in your local time
- Accounts table sorted by quota or by nearest/farthest reset; colored labels show "Reset … ago" once the time has passed
- Emails page with expandable rows showing each email's accounts
- Light and dark mode

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn-style UI, Zod, react-hook-form, TanStack Table, Sonner, Drizzle ORM, Postgres (Neon).

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the two values
npm run db:push                # creates the tables in your database
npm run dev                    # http://localhost:3000
```

### Environment variables

| Name           | Description                                                                                  |
| -------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string. With Neon, copy the pooled connection string from the dashboard. |
| `AUTH_SECRET`  | Random string of 32+ characters used to sign access tokens. `openssl rand -base64 32`        |

## Set up Neon

1. Create a project at https://neon.tech and copy the connection string.
2. Put it in `.env.local` as `DATABASE_URL`.
3. Run `npm run db:push` once to create the tables (`users`, `emails`, `accounts`).

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository (framework preset: Next.js, no other settings needed).
3. Add `DATABASE_URL` and `AUTH_SECRET` under **Environment Variables**.
4. Deploy. Run `npm run db:push` against the same database (from your machine) before first use, and again whenever the schema changes.

## API

| Method        | Path                                                      | Notes                                   |
| ------------- | --------------------------------------------------------- | --------------------------------------- |
| POST          | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout` | Public; sets / clears the cookie        |
| GET, POST     | `/api/emails`                                             | List / add an email                     |
| DELETE        | `/api/emails/:id`                                         | Also deletes its accounts               |
| GET, POST     | `/api/accounts`                                           | List all / add an account               |
| PATCH, DELETE | `/api/accounts/:id`                                       | Update quota, name, reset time / delete |

All routes except the auth ones require a valid access token.

## Notes

- Label colors: green = reset time has passed, amber = resets within 24 h, neutral = later, outline = no reset set.
- `AGENTS.md` describes the conventions for AI coding agents.

## neom

Set up this app on Neon.

1. `npm i -g neon@latest`. If that fails, use `npx neon@latest` in place of `neon`.
   If a neon command opens a browser sign-in, tell me to finish it there. If that times out or fails, ask me to run `neon login`, then retry.
2. In the project root:
   neon init -y --org-id org-silent-firefly-15522876 --project-id soft-resonance-74424108 --branch production --services postgres
3. `neon deploy`. It provisions the services in neon.ts and pulls their env vars into `.env.local` (or `.env` if it exists).
4. Wire each service into the app's code using those env vars. Consult the installed Neon agent skills for best practices, e.g., what database driver to use given the app architecture and hosting runtime.
5. Prove it works: `npm run build` must pass, then start the app, each wired service must be tested to prove it works end to end.
6. Report what changed, the command output that proves step 5, and anything that failed.
