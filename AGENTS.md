<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

### Project overview

Single Next.js 16 (App Router) portfolio site — no monorepo, no database, no Docker.

### Running the dev server

```bash
npm run dev          # starts on http://localhost:3000
```

### Lint / Build / Test

```bash
npm run lint         # ESLint (has 3 pre-existing warnings/errors)
npm run build        # production build
```

There are no automated test suites in this project.

### Environment variables

Copy `.env.example` to `.env.local`. All external API integrations (GitHub, BearBlog, Raindrop.io, Resend) are **optional** — the app gracefully degrades with empty arrays or console logs when keys are missing. The dev server runs fine with placeholder values.

### Gotchas

- Next.js 16 has breaking changes vs. what you may know from training data. Always check `node_modules/next/dist/docs/` before writing Next.js code.
- `npm run lint` exits non-zero due to pre-existing `react-hooks/set-state-in-effect` errors in `not-found.tsx` and `Navigation.tsx`. This is expected and not caused by your changes.
