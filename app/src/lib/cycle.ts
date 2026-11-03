/**
 * Cycle phase definitions and calculations.
 *
 * The four phases map to seasons:
 * - Winter = Menstruation (days 1-5)
 * - Spring = Follicular (days 6 to ovulation-1)
 * - Summer = Ovulation (~3 days around midpoint)
 * - Autumn = Luteal (ovulation+2 to cycle end)
 */

export type Season = "winter" | "spring" | "summer" | "autumn";

export interface PhaseInfo {
  season: Season;
  label: string;
  color: string;
}

const PHASES: Record<Season, PhaseInfo> = {
  winter: { season: "winter", label: "Menstruation", color: "#3E4F6B" },
  spring: { season: "spring", label: "Follicular Phase", color: "#5C9362" },
  summer: { season: "summer", label: "Ovulation", color: "#D69327" },
  autumn: { season: "autumn", label: "Luteal Phase", color: "#B85D3E" },
};

/**
 * Get phase boundaries as fractions of the cycle (0 to 1).
 * These proportions are based on a standard cycle structure.
 */
export function getPhaseBoundaries(cycleLength: number) {
  // Menstruation: ~5 days
  const winterEnd = 5 / cycleLength;
  // Ovulation: ~3 days around midpoint
  const ovulationStart = Math.round(cycleLength * 0.48) / cycleLength;
  const ovulationEnd = (Math.round(cycleLength * 0.48) + 3) / cycleLength;

  return {
    winter: { start: 0, end: winterEnd },
    spring: { start: winterEnd, end: ovulationStart },
    summer: { start: ovulationStart, end: ovulationEnd },
    autumn: { start: ovulationEnd, end: 1 },
  };
}

/**
 * Determine which season/phase the current cycle day falls in.
 */
export function getCurrentPhase(
  cycleDay: number,
  cycleLength: number
): PhaseInfo {
  const fraction = cycleDay / cycleLength;
  const boundaries = getPhaseBoundaries(cycleLength);

  if (fraction <= boundaries.winter.end) return PHASES.winter;
  if (fraction <= boundaries.spring.end) return PHASES.spring;
  if (fraction <= boundaries.summer.end) return PHASES.summer;
  return PHASES.autumn;
}

/**
 * Get the season display name (capitalized).
 */
export function getSeasonName(season: Season): string {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

/**
 * Shared date utility — formats a Date as YYYY-MM-DD using local time.
 *
 * Why not `date.toISOString().split("T")[0]`?
 * That converts to UTC first, which can shift the date backward
 * (e.g., Feb 1 at 23:00 CET becomes Jan 31 in UTC).
 * This function uses local year/month/day to avoid that bug.
 */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Cycle detection rules:
 *
 * 1. Day 1 = first day of flow >= light (spotting excluded).
 * 2. Merge window: any period flow within MERGE_WINDOW_DAYS of the last
 *    period flow day is part of the same period — handles mid-period
 *    spotting, missed logging days, and brief pauses.
 * 3. Minimum gap: a new cycle can't start within MIN_CYCLE_GAP_DAYS of
 *    the previous Day 1 — biological safety net.
 */
const MERGE_WINDOW_DAYS = 3;
const MIN_CYCLE_GAP_DAYS = 14;

/** Returns the number of days between two YYYY-MM-DD date strings. */
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

const isPeriodFlow = (flow: string) =>
  flow === "light" || flow === "medium" || flow === "heavy";

/**
 * Detect the start date (Day 1) of the current cycle.
 *
 * Uses detectAllCycleStarts() and returns the last entry.
 *
 * @param logs - Sorted ascending by date. Each has { date, flow }.
 * @returns The Day 1 date string (YYYY-MM-DD), or null if no period found.
 */
export function detectCycleDay1(
  logs: { date: string; flow: string }[]
): string | null {
  const starts = detectAllCycleStarts(logs);
  return starts.length > 0 ? starts[starts.length - 1] : null;
}

/**
 * Calculate average cycle length from the 3 most recent completed cycles.
 *
 * "Completed" means we have two consecutive Day 1 dates to measure between.
 * Uses only recent cycles so the prediction adapts if cycle length changes.
 * Falls back to 28 if fewer than 2 completed cycles exist.
 */
export function calculateAverageCycleLength(
  logs: { date: string; flow: string }[]
): number {
  const starts = detectAllCycleStarts(logs);
  // Need at least 2 starts to get 1 completed cycle length
  if (starts.length < 2) return 28;

  // Calculate gaps between consecutive starts (= cycle lengths)
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    lengths.push(daysBetween(starts[i - 1], starts[i]));
  }

  // Use the 3 most recent
  const recent = lengths.slice(-3);
  return Math.round(recent.reduce((sum, n) => sum + n, 0) / recent.length);
}

/**
 * Calculate average period duration from the 3 most recent *completed* periods.
 *
 * A period's duration = number of days from its Day 1 to the last consecutive
 * period-flow day (allowing the same merge window used in cycle detection).
 *
 * Skips the most recent period if it looks like it's still ongoing
 * (last flow day is within MERGE_WINDOW_DAYS of today). Including an
 * incomplete period would deflate the average.
 *
 * Falls back to 5 if no completed periods found.
 */
export function calculateAveragePeriodDuration(
  logs: { date: string; flow: string }[]
): number {
  const starts = detectAllCycleStarts(logs);
  if (starts.length === 0) return 5;

  const today = toDateKey(new Date());
  const durations: number[] = [];

  for (const start of starts) {
    // Find all period-flow days from this start date forward within merge window
    let lastFlowDate = start;
    for (const log of logs) {
      if (log.date <= start) continue;
      if (!isPeriodFlow(log.flow)) continue;
      if (daysBetween(lastFlowDate, log.date) <= MERGE_WINDOW_DAYS) {
        lastFlowDate = log.date;
      } else {
        break; // Gap too large, period ended
      }
    }

    // Skip if this period might still be ongoing (last flow is recent)
    if (daysBetween(lastFlowDate, today) <= MERGE_WINDOW_DAYS) continue;

    durations.push(daysBetween(start, lastFlowDate) + 1); // +1 because Day 1 counts
  }

  if (durations.length === 0) return 5;

  const recent = durations.slice(-3);
  return Math.round(recent.reduce((sum, n) => sum + n, 0) / recent.length);
}

export interface PredictionWindow {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: "period" | "ovulation";
}

/**
 * Project future period and ovulation windows based on cycle history.
 *
 * Requires at least 2 completed cycles (so we have a real average).
 * Projects forward from the most recent Day 1 by repeating the average
 * cycle length. Returns date windows for the next `cyclesAhead` cycles.
 */
export function predictFuturePeriods(
  logs: { date: string; flow: string }[],
  cyclesAhead: number = 6
): PredictionWindow[] {
  const starts = detectAllCycleStarts(logs);
  // Need at least 2 starts = 1 completed cycle for a meaningful average
  if (starts.length < 2) return [];

  // Clamp to biologically realistic ranges to avoid garbage predictions
  // from irregular data (e.g., logging gaps creating a 90-day "cycle")
  const avgLength = Math.min(Math.max(calculateAverageCycleLength(logs), 20), 45);
  const avgDuration = Math.min(Math.max(calculateAveragePeriodDuration(logs), 2), 8);
  const lastStart = starts[starts.length - 1];

  const predictions: PredictionWindow[] = [];
  // Ovulation offset = 48% mark, same logic as getPhaseBoundaries (3-day window)
  const ovulationDayOffset = Math.round(avgLength * 0.48);

  // Current cycle's ovulation — projected from the most recent Day 1.
  // Included even if the window has already passed, so the user can still
  // see where spring/summer fell in the cycle they're currently in.
  predictions.push({
    startDate: addDays(lastStart, ovulationDayOffset),
    endDate: addDays(lastStart, ovulationDayOffset + 2),
    type: "ovulation",
  });

  for (let i = 1; i <= cyclesAhead; i++) {
    // Predicted period start = last Day 1 + (i * average cycle length)
    const periodStartDate = addDays(lastStart, i * avgLength);
    const periodEndDate = addDays(periodStartDate, avgDuration - 1);

    predictions.push({
      startDate: periodStartDate,
      endDate: periodEndDate,
      type: "period",
    });

    const ovulationStart = addDays(periodStartDate, ovulationDayOffset);
    const ovulationEnd = addDays(ovulationStart, 2);

    predictions.push({
      startDate: ovulationStart,
      endDate: ovulationEnd,
      type: "ovulation",
    });
  }

  return predictions;
}

/** Add `days` to a YYYY-MM-DD string and return a new YYYY-MM-DD string. */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/**
 * Detect ALL cycle start dates from the full log history.
 *
 * Walks through logs chronologically, applying two rules:
 * - Merge window: period flow within MERGE_WINDOW_DAYS of the last
 *   period flow is part of the same period (handles spotting gaps,
 *   missed logging days, brief pauses).
 * - Minimum gap: a new Day 1 can't occur within MIN_CYCLE_GAP_DAYS
 *   of the previous Day 1.
 *
 * Returns an array of Day 1 date strings, sorted ascending.
 */
export function detectAllCycleStarts(
  logs: { date: string; flow: string }[]
): string[] {
  if (logs.length === 0) return [];

  const starts: string[] = [];
  let lastPeriodFlowDate: string | null = null; // most recent day with flow >= light
  let currentCycleStart: string | null = null;

  for (const log of logs) {
    if (!isPeriodFlow(log.flow)) continue;

    if (currentCycleStart === null) {
      // Very first period flow ever — this is Day 1 of the first cycle
      starts.push(log.date);
      currentCycleStart = log.date;
      lastPeriodFlowDate = log.date;
      continue;
    }

    const gapFromLastFlow = daysBetween(lastPeriodFlowDate!, log.date);
    const gapFromCycleStart = daysBetween(currentCycleStart, log.date);

    if (gapFromLastFlow <= MERGE_WINDOW_DAYS) {
      // Within merge window — same period, not a new cycle
      lastPeriodFlowDate = log.date;
    } else if (gapFromCycleStart < MIN_CYCLE_GAP_DAYS) {
      // Outside merge window but too close to current Day 1 — still same cycle
      lastPeriodFlowDate = log.date;
    } else {
      // New cycle
      starts.push(log.date);
      currentCycleStart = log.date;
      lastPeriodFlowDate = log.date;
    }
  }

  return starts;
}

export { PHASES };
