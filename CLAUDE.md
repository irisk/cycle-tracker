# Cycle Tracker

## Purpose

Personal menstrual cycle tracking app. Privacy-first, minimal, phase-aware. Built for a single user who wants to see where they are in their cycle at a glance, with free-text notes and flow logging.

## Key Concept

Maps the four cycle phases to seasons:
- **Winter** = Menstruation
- **Spring** = Follicular
- **Summer** = Ovulation
- **Autumn** = Luteal

## Tech Stack

- Next.js + TypeScript + Tailwind CSS
- Supabase (auth + Postgres); project URL lives in Vercel env vars, not in the repo
- Deployed on Vercel (root directory: `app`)
- Vercel-Supabase integration manages env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — no manual env config needed
- GitHub: `github.com/irisk/cycle-tracker` (public; full history in the private `cycle-tracker-archive`)
- PWA-capable

## Project Structure

```
docs/
  requirements.md                 # Full v1 product spec
  design/
    screens.pen                   # Pencil design file (4 screens)
    mockup-dashboard-v2.html      # v2 design mockup (palette, glyphs, typography)
app/src/
  app/                            # Pages: layout, dashboard (/), log (/log), history (/history)
  components/                     # AuthGate, Dashboard, CalendarView, TimelineView, CycleWheel, PhaseGlyph, TabBar
  lib/                            # auth.ts, daily-logs.ts, cycle.ts, supabase.ts, constants.ts
```

## Design

- Style: **Embodied, editorial**. Deeper, confident palette — not pastel "wellness-app". Soft rounded shapes.
- Font: Outfit only. Weight contrast creates hierarchy — no second font.
- No gradients anywhere — flat fills only.
- Mockup reference: `docs/design/mockup-dashboard-v2.html`

### Color palette

The palette is **warm-leaning with one deliberate exception**: winter/menstruation is cool (navy) to carry the rest/cold metaphor. The other three seasons and all UI surfaces stay warm.

**Surfaces & text**

| Token | Hex | Role |
|-------|-----|------|
| `bg-page` | #F4EFE7 | Warm cream page background |
| `bg-card` | #FBF8F2 | Card/surface background |
| `bg-elevated` | #FFFDF8 | Slightly raised surfaces |
| `bg-muted` | #E8E2D6 | Muted backgrounds (toggles, disabled, quiet confirmations) |
| `text-primary` | #1D1C1A | Primary text |
| `text-secondary` | #6B6A66 | Secondary text |
| `text-tertiary` | #9A9893 | Helper / meta text |
| `border-subtle` | #E2DCD0 | Default borders |
| `border-strong` | #CDC5B5 | Focus / emphasized borders |

**Seasons** (also used directly in CycleWheel and phase headers)

| Token | Hex | Role |
|-------|-----|------|
| `winter` | #3E4F6B | Menstruation — deep navy (only cool color, rest metaphor) |
| `spring` | #5C9362 | Follicular — living green |
| `summer` | #D69327 | Ovulation — rich amber |
| `autumn` | #B85D3E | Luteal — deep terracotta |

**Accents**

| Token | Hex | Role |
|-------|-----|------|
| `green` | #3D8A5A | Primary action color (buttons, links) |
| `green-dark` | #4D9B6A | Active/pressed state for green |
| `green-light` | #C8F0D8 | Avoid for UI — mint, clashes with palette |
| `coral` / `coral-dark` | #B85D3E / #A04E33 | Aliases for autumn (season labels, accent) |
| `gold` | #D69327 | Alias for summer |

**Flow intensity** (pure reds — never use autumn terracotta for flow, they collide)

| Token | Hex | Role |
|-------|-----|------|
| `flow-heavy` | #8B2723 | Heavy flow, error text |
| `flow-medium` | #B43E38 | Medium flow |
| `flow-light` | #D46F75 | Light flow |
| `flow-spotting` | #EFC8CA | Spotting |
| `flow-bg-selected` | #F9E8E7 | Selection tint, error banner bg |

### Typography

Single font (Outfit), hierarchy through weight:

| Context | Weight | Size |
|---------|--------|------|
| **Display** — page titles, phase names, CycleWheel day number | Light 300 | 32-56px, tracking -0.02 to -0.05em |
| **Section headings** — "Flow Intensity", "Notes", "Current Cycle" | Semibold 600 | 18-20px |
| **Body** | Regular 400 | 13-15px |
| **Eyebrow / small caps** — "Luteal · Day 22 of 28" | Semibold 600 | 11px, tracking 0.18em uppercase |

### PhaseGlyph component

Custom SVG icons keyed by season: `<PhaseGlyph season="autumn" size={36} />`. Uses `currentColor`. Glyphs: winter=crescent moon, spring=sprout, summer=sun, autumn=leaf. Located at `components/PhaseGlyph.tsx`.

### Prediction styling (CalendarView)

- **Predicted period day**: flat `flow-bg-selected` bg + red-ish border + red number + small red bar pip **below** the number
- **Predicted ovulation day**: flat `#F9EED0` (pale gold) bg + gold-ish border + amber number + small gold dot pip **above** the number
- Pip position encodes meaning: below = descending/period, above = peak/ovulation.

### When to use what

- **Active buttons**: `bg-green` + white text
- **Disabled buttons**: same + `opacity-60`
- **Success/confirmed**: `bg-muted` + `green` text + `green` border (warm, quiet)
- **Error states**: `flow-bg-selected` bg + `flow-heavy` text
- **Borders**: `border-subtle` default, `border-strong` focus
- **Phase labels (Dashboard, Timeline)**: tint the season name with `phase.color` — don't use tertiary gray

## Current Status

- Requirements: complete (v1 spec finalized)
- Design: 4 screens designed in Pencil (Dashboard, Daily Log, History Calendar, History Timeline)
- Code: v1 functional — all 3 pages wired to Supabase with real data
- Auth: login gate with email/password (single user, account created in Supabase Dashboard)
- Database: `daily_logs` table with RLS, upsert on `(user_id, date)`, auto-updated `updated_at`
- Cycle detection: client-side — detects Day 1 from flow data, computes average cycle length (default 27 days)
- Deployed on Vercel (auto-deploy from GitHub)

## Gotchas

- Cycle day 1 = first real flow (not spotting)
- `toDateKey()` uses local time (not UTC) — timezone date-shift fix, don't revert to UTC
- `lib/constants.ts`: shared FLOW_COLORS/HEX/LABELS/OPTIONS + FlowIntensity type (single source of truth for flow styling)
- Cycle wheel: colored band ring (pie slices masked with inner circle), dark dot position marker
- History view: calendar grid + timeline with toggle (both kept)

## Public repo

This repo is public. Keep personal data out of tracked files: no health details, real logs, names or keys in docs, mock data or commits. Personal notes go in an untracked file.

`docs/` is local only (gitignored): the product spec and design files stay private. A snapshot from 3 Nov 2026 is in the private `cycle-tracker-archive` repo.
