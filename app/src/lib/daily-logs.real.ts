import { supabase } from "./supabase";

/**
 * Data access layer for daily_logs table.
 *
 * All Supabase queries live here — components never call Supabase directly.
 * RLS ensures queries are scoped to the authenticated user automatically.
 */

export interface DailyLog {
  id: string;
  date: string; // YYYY-MM-DD
  flow: "none" | "spotting" | "light" | "medium" | "heavy";
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Upsert a log entry for a given date.
 * Uses the (user_id, date) unique constraint so editing a past day
 * updates instead of creating a duplicate.
 */
export async function upsertLog(
  date: string,
  flow: DailyLog["flow"],
  note: string | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_logs")
    .upsert(
      { user_id: user.id, date, flow, note },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) throw error;
  return data as DailyLog;
}

/**
 * Get logs for a date range (inclusive). Used by CalendarView.
 */
export async function getLogsByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return data as DailyLog[];
}

/**
 * Get recent logs up to a limit. Used by TimelineView.
 */
export async function getRecentLogs(limit: number): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  // Return in ascending order for timeline display
  return (data as DailyLog[]).reverse();
}

/**
 * Get all flow logs (date + flow only) for cycle detection.
 * Lightweight query — skips notes.
 */
export async function getAllFlowLogs(): Promise<
  Pick<DailyLog, "date" | "flow">[]
> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("date, flow")
    .order("date", { ascending: true });

  if (error) throw error;
  return data as Pick<DailyLog, "date" | "flow">[];
}

/**
 * Get a single log entry for a specific date. Used to pre-fill the log form.
 */
export async function getLogForDate(
  date: string
): Promise<DailyLog | null> {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data as DailyLog | null;
}
