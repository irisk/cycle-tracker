/**
 * Data access layer for daily logs.
 *
 * Delegates to either the real Supabase layer or the in-memory mock
 * layer, based on the NEXT_PUBLIC_USE_MOCK env var.
 *
 * All components import from "@/lib/daily-logs" — no changes needed.
 */

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  flow: "none" | "spotting" | "light" | "medium" | "heavy";
  note: string | null;
  created_at: string;
  updated_at: string;
}

import * as real from "./daily-logs.real";
import * as mock from "./daily-logs.mock";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const source = useMock ? mock : real;

export const upsertLog = source.upsertLog;
export const getLogsByDateRange = source.getLogsByDateRange;
export const getRecentLogs = source.getRecentLogs;
export const getAllFlowLogs = source.getAllFlowLogs;
export const getLogForDate = source.getLogForDate;
