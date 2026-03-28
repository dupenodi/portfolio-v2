# dupenodi.dev

Personal portfolio site built with Next.js, Framer Motion, and Tailwind CSS.

## Stack

- **Framework** — Next.js 15 (App Router)
- **Styling** — Tailwind CSS v4 + CSS custom properties
- **Animation** — Framer Motion
- **Email** — Resend
- **Fonts** — Fraunces (display), DM Sans (body)
- **Deployment** — Vercel

## Features

- GitHub projects pulled dynamically (tag repos with `portfolio` topic to feature them)
- Blog posts pulled from BearBlog Atom feed
- Bookmarks pulled from Raindrop.io (tag with `portfolio` to include)
- Contact form via Resend
- Dark/light mode
- OG image + favicon generated via Next.js
- `/now`, `/uses`, `/bookmarks` pages

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for contact form |
| `CONTACT_EMAIL` | Email address to receive contact form submissions |
| `GITHUB_USERNAME` | GitHub username for project fetching |
| `BLOG_FEED_URL` | Atom feed URL for blog posts |
| `RAINDROP_TOKEN` | Raindrop.io test token for bookmarks |
| `RAINDROP_COLLECTION_ID` | Raindrop.io collection ID (use `0` for all) |

## Deploying

Push to GitHub and import on [Vercel](https://vercel.com). Add all env vars in the Vercel dashboard. Point your domain in Vercel and update nameservers in your registrar.
