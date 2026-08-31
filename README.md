# DesignTouch+ Frontend

Next.js frontend for the DesignTouch+ creative agency website.

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Framer Motion (animations)
- lucide-react (icons)

## Local setup

1. Install dependencies:
   ```
   npm install
   ```

2. Point the frontend at your backend:
   ```
   cp .env.local.example .env.local
   ```
   Edit `.env.local` -- for local dev this should already be
   `http://localhost:8080` (make sure the backend is running first).

3. Run the dev server:
   ```
   npm run dev
   ```
   Opens at `http://localhost:3000`.

## Project structure

```
app/
├── layout.js         Root layout — fonts, global metadata
├── page.js           Home page
├── globals.css        Tailwind base + global styles
├── about/page.js
├── services/page.js
├── portfolio/page.js
├── pricing/page.js
├── blog/page.js
└── contact/page.js

components/
├── layout/    Navbar, Footer (shared across all pages)
├── home/      Home-page-specific sections
└── ui/        Small reusable pieces (buttons, cards, etc.)

lib/
└── api.js     Every backend call goes through here — see this file for
               the full list of available functions (getTeam, getBlogPosts,
               submitContactMessage, etc.)
```

## Why Server Components for data fetching

Pages like `app/page.js` fetch data directly in the component (no `useEffect`,
no client-side loading spinner) because they're **Server Components** -- Next.js
runs them on the server, fetches from the Spring Boot backend there, and sends
fully-rendered HTML to the browser. This is better for SEO (a real crawler
concern for this agency site) and faster first paint than client-side fetching.

Only mark a component `"use client"` when it needs interactivity (forms,
dropdowns, animations that respond to user input, etc.).

## Status

- [x] Project skeleton (Next.js + Tailwind + Framer Motion)
- [x] `lib/api.js` -- full backend API wrapper
- [x] Root layout + Home page (fetches real data from backend, verified working)
- [ ] Navbar + Footer components
- [ ] Home page sections (Hero, Featured Projects, Services, Testimonials, Contact form)
- [ ] About, Services, Portfolio, Pricing, Blog, Contact pages
- [ ] Deploy to Vercel
