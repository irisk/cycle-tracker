# Cycle Tracker

A minimal, privacy-first menstrual cycle tracker for a single user. It answers one question at a glance: where am I in my cycle?

It maps the four phases to seasons: winter (menstruation), spring (follicular), summer (ovulation) and autumn (luteal). Logging is a flow level plus a free-text note, because most tracking apps either have too many features, weak privacy, or no real room for notes.

<img width="425" height="747" alt="cycle-tracker" src="https://github.com/user-attachments/assets/c7f5e63b-60cf-4fef-8f54-29177dd924d0" />


## How it's built

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Supabase for auth and Postgres (one account, no sign-up flow)
- PWA, deployed on Vercel
- Built with Claude Code

## Run it

```bash
cd app
npm install
npm run dev
```

Set `NEXT_PUBLIC_USE_MOCK=true` in `app/.env.local` to run with mock data instead of Supabase.
