# Cycle Tracker

**Where am I in my cycle? One glance, and room to write.**

A small, private cycle tracker built for one person. It shows your phase as a season, predicts your next period, and lets you log flow and a note in under 30 seconds.

[Live app](https://cycle-tracker-mu.vercel.app) (login only: it's a single-user app)

<img width="425" height="747" alt="cycle-tracker" src="https://github.com/user-attachments/assets/c7f5e63b-60cf-4fef-8f54-29177dd924d0" />

## Why I built it

The popular tracking apps either have weak privacy, too many features, or no real room for notes. I wanted the opposite: one question answered at a glance, my data in my own database, and space to write how I feel.

## Seasons instead of phases

| Season | Phase | Roughly |
|---|---|---|
| Winter | Menstruation | Rest, lower energy |
| Spring | Follicular | Rising energy |
| Summer | Ovulation | Peak energy |
| Autumn | Luteal | Winding down |

Seasons are easier to feel than phase names, and they make the cycle wheel readable at a glance.

## Design decisions

- **Day 1 is the first day of light flow or heavier.** Spotting is logged, but doesn't start a new cycle. Telling the two apart is the trickiest part of tracking, so the rule is explicit.
- **Predictions use a rolling average** of your recent cycles, with a default of 27 days until there's enough data.
- **Two history views:** a calendar for the overview, a timeline for reading back notes.
- **One account, no sign-up flow.** It's built for a single person, and the database only returns your own rows.

## Not yet

Apple Health import, patterns over time ("low energy on days 20 to 24"), and export.

## How it's built

Next.js 16, React 19, TypeScript and Tailwind CSS. Supabase for auth and Postgres, as a PWA on Vercel. Built with Claude Code.

## Run it

```bash
cd app
npm install
npm run dev
```

Set `NEXT_PUBLIC_USE_MOCK=true` in `app/.env.local` to run with mock data instead of Supabase.
