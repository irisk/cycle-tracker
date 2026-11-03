/**
 * Mock data layer — same interface as daily-logs.ts but returns
 * in-memory data. Used for local dev, screenshots, and testing.
 *
 * Activated by setting NEXT_PUBLIC_USE_MOCK=true in .env.local.
 *
 * Contains 3 realistic cycles (~85 days) with varied flow patterns,
 * notes, and natural cycle length variation (27-29 days).
 */

import type { DailyLog } from "./daily-logs.real";

// ---------- Mock data: 3 cycles ----------

function log(
  date: string,
  flow: DailyLog["flow"],
  note: string | null = null
): DailyLog {
  return {
    id: `mock-${date}`,
    date,
    flow,
    note,
    created_at: `${date}T08:00:00Z`,
    updated_at: `${date}T08:00:00Z`,
  };
}

const MOCK_LOGS: DailyLog[] = [
  // --- Cycle 1: starts Jan 4 (28 days) ---
  log("2026-01-04", "medium", "Period started, cramps in the morning"),
  log("2026-01-05", "heavy"),
  log("2026-01-06", "heavy", "Tired, stayed home"),
  log("2026-01-07", "medium"),
  log("2026-01-08", "light"),
  log("2026-01-09", "none"),
  log("2026-01-10", "none", "Energy coming back"),
  log("2026-01-12", "none"),
  log("2026-01-14", "none", "Good run, felt strong"),
  log("2026-01-17", "none"),
  log("2026-01-19", "none", "Ovulation cramps"),
  log("2026-01-22", "none"),
  log("2026-01-25", "none", "PMS starting, bloated"),
  log("2026-01-28", "none", "Irritable, cravings"),
  log("2026-01-30", "none"),
  log("2026-01-31", "spotting"),

  // --- Cycle 2: starts Feb 1 (27 days) ---
  log("2026-02-01", "medium"),
  log("2026-02-02", "heavy", "Heavy day, lower back pain"),
  log("2026-02-03", "heavy"),
  log("2026-02-04", "medium"),
  log("2026-02-05", "light"),
  log("2026-02-06", "spotting"),
  log("2026-02-07", "none"),
  log("2026-02-09", "none", "Mood lifting"),
  log("2026-02-11", "none"),
  log("2026-02-13", "none", "Lots of energy, great workout"),
  log("2026-02-15", "none"),
  log("2026-02-17", "none", "Slight ovulation pain, left side"),
  log("2026-02-19", "none"),
  log("2026-02-21", "none"),
  log("2026-02-23", "none", "Feeling slower, luteal fog"),
  log("2026-02-25", "none", "Sore breasts, tired"),
  log("2026-02-27", "spotting"),

  // --- Cycle 3 (current): starts Feb 28 ---
  log("2026-02-28", "light"),
  log("2026-03-01", "heavy", "Cramps, took ibuprofen"),
  log("2026-03-02", "heavy"),
  log("2026-03-03", "medium"),
  log("2026-03-04", "light"),
  log("2026-03-05", "spotting"),
  log("2026-03-06", "none"),
  log("2026-03-07", "none", "Feeling good again"),
  log("2026-03-09", "none"),
  log("2026-03-11", "none", "Long walk, lots of energy"),
  log("2026-03-13", "none"),
  log("2026-03-15", "none", "Mild cramps, probably ovulation"),
  log("2026-03-17", "none"),
  log("2026-03-19", "none"),
  log("2026-03-20", "none", "Slept badly"),
  log("2026-03-22", "none"),
  log("2026-03-24", "none", "Cravings, low energy"),
];

// ---------- Mock implementations ----------

export async function upsertLog(
  date: string,
  flow: DailyLog["flow"],
  note: string | null
): Promise<DailyLog> {
  const existing = MOCK_LOGS.findIndex((l) => l.date === date);
  const entry = log(date, flow, note);
  if (existing >= 0) {
    MOCK_LOGS[existing] = entry;
  } else {
    MOCK_LOGS.push(entry);
    MOCK_LOGS.sort((a, b) => a.date.localeCompare(b.date));
  }
  return entry;
}

export async function getLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyLog[]> {
  return MOCK_LOGS.filter((l) => l.date >= startDate && l.date <= endDate);
}

export async function getRecentLogs(limit: number): Promise<DailyLog[]> {
  return MOCK_LOGS.slice(-limit);
}

export async function getAllFlowLogs(): Promise<
  Pick<DailyLog, "date" | "flow">[]
> {
  return MOCK_LOGS.map(({ date, flow }) => ({ date, flow }));
}

export async function getLogForDate(
  date: string
): Promise<DailyLog | null> {
  return MOCK_LOGS.find((l) => l.date === date) ?? null;
}
