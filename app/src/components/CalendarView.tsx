"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey, predictFuturePeriods, type PredictionWindow } from "@/lib/cycle";
import { getLogsByDateRange, getAllFlowLogs } from "@/lib/daily-logs";
import { FLOW_HEX, FLOW_LABELS, PREDICTION_COLORS } from "@/lib/constants";
import ErrorBanner, { friendlyErrorMessage } from "@/components/ErrorBanner";

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Get all days to display in a month grid.
 * Returns a 2D array of weeks, where each day is either a Date or null (empty cell).
 * Weeks start on Monday (ISO standard).
 */
function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week: 0=Sun, adjust so Mon=0
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  // Fill leading empty cells
  for (let i = 0; i < startDow; i++) {
    currentWeek.push(null);
  }

  // Fill days
  for (let day = 1; day <= lastDay.getDate(); day++) {
    currentWeek.push(new Date(year, month, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill trailing empty cells
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default function CalendarView() {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [flowData, setFlowData] = useState<
    Record<string, { flow: string; note?: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionWindow[]>([]);
  // Lookup: dateKey → prediction type for O(1) access during render
  const [predictionMap, setPredictionMap] = useState<
    Record<string, "period" | "ovulation">
  >({});

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const weeks = getMonthGrid(year, month);

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function loadMonth() {
    const startDate = toDateKey(new Date(year, month, 1));
    const endDate = toDateKey(new Date(year, month + 1, 0));
    setLoading(true);
    setFetchError(null);

    getLogsByDateRange(startDate, endDate)
      .then((logs) => {
        const map: Record<string, { flow: string; note?: string }> = {};
        for (const log of logs) {
          map[log.date] = {
            flow: log.flow,
            note: log.note ?? undefined,
          };
        }
        setFlowData(map);
      })
      .catch((err) => setFetchError(friendlyErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  // Load predictions once on mount (needs full history for cycle detection)
  useEffect(() => {
    getAllFlowLogs()
      .then((logs) => {
        const windows = predictFuturePeriods(logs);
        setPredictions(windows);

        // Build a date → type lookup map for all predicted days
        const map: Record<string, "period" | "ovulation"> = {};
        for (const w of windows) {
          const start = new Date(w.startDate + "T00:00:00");
          const end = new Date(w.endDate + "T00:00:00");
          const cursor = new Date(start);
          while (cursor <= end) {
            const key = toDateKey(cursor);
            // Period takes priority over ovulation if they somehow overlap
            if (!map[key] || w.type === "period") {
              map[key] = w.type;
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }
        setPredictionMap(map);
      })
      .catch(() => {
        // Predictions are non-critical — if they fail, calendar still works
      });
  }, []);

  // Fetch logs when the displayed month changes
  useEffect(() => {
    loadMonth();
  }, [year, month]);

  const navigateMonth = (direction: -1 | 1) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const selectedEntry = selectedDate
    ? flowData[toDateKey(selectedDate)]
    : null;
  const selectedPrediction = selectedDate
    ? predictionMap[toDateKey(selectedDate)]
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 text-text-tertiary active:text-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-semibold tracking-tight text-text-primary">
          {monthLabel}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 text-text-tertiary active:text-text-primary"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {/* Day headers */}
        <div className="flex justify-between">
          {DAY_HEADERS.map((day) => (
            <div key={day} className="w-11 text-center text-xs font-medium text-text-tertiary">
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {loading ? (
          <div className="flex h-[264px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
          </div>
        ) : fetchError ? (
          <div className="py-6">
            <ErrorBanner message={fetchError} onRetry={loadMonth} />
          </div>
        ) : (
          weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex justify-between">
              {week.map((date, dayIdx) => {
                if (!date) {
                  return <div key={dayIdx} className="h-11 w-11" />;
                }

                const dateKey = toDateKey(date);
                const entry = flowData[dateKey];
                const flowColor = entry && entry.flow !== "none"
                  ? FLOW_HEX[entry.flow]
                  : undefined;
                const prediction = !flowColor ? predictionMap[dateKey] : undefined;
                const today = isToday(date);
                const isSelected =
                  selectedDate && toDateKey(selectedDate) === dateKey;

                const isPredictedPeriod = prediction === "period" && !flowColor;
                const isPredictedOvulation = prediction === "ovulation" && !flowColor;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => setSelectedDate(date)}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors ${
                      isSelected ? "ring-2 ring-text-primary ring-offset-1" : ""
                    } ${
                      flowColor
                        ? "font-semibold text-white"
                        : isPredictedPeriod
                          ? "font-medium"
                          : isPredictedOvulation
                            ? "font-medium"
                            : today
                              ? "font-semibold text-green border-2 border-green"
                              : "text-text-primary"
                    }`}
                    style={{
                      backgroundColor: flowColor || undefined,
                      ...(isPredictedPeriod
                        ? {
                            background: "var(--flow-bg-selected)",
                            border: "1px solid rgba(139,39,35,0.25)",
                            color: PREDICTION_COLORS.period,
                          }
                        : {}),
                      ...(isPredictedOvulation
                        ? {
                            background: "#F9EED0",
                            border: "1px solid rgba(214,147,39,0.35)",
                            color: "#8C5F14",
                          }
                        : {}),
                    }}
                  >
                    <span>{date.getDate()}</span>
                    {/* Period pip — below (descending) */}
                    {isPredictedPeriod && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                          bottom: 3,
                          width: 12,
                          height: 2,
                          background: PREDICTION_COLORS.period,
                        }}
                      />
                    )}
                    {/* Ovulation pip — above (peak) */}
                    {isPredictedOvulation && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 rounded-full"
                        style={{
                          top: 3,
                          width: 5,
                          height: 5,
                          background: PREDICTION_COLORS.ovulation,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      {/* Flow legend */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center gap-3">
          {[
            { label: "Heavy", className: "bg-flow-heavy" },
            { label: "Light", className: "bg-flow-light" },
            { label: "Spotting", className: "bg-flow-spotting" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${item.className}`} />
              <span className="text-[11px] font-medium text-text-secondary">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-transparent border-2 border-green" />
            <span className="text-[11px] font-medium text-text-secondary">
              Today
            </span>
          </div>
          {predictions.length > 0 && (
            <>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: PREDICTION_COLORS.period }}
                />
                <span className="text-[11px] font-medium text-text-secondary">
                  Predicted
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ background: PREDICTION_COLORS.ovulation }}
                />
                <span className="text-[11px] font-medium text-text-secondary">
                  Ovulation
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Day detail card */}
      {selectedDate && (
        <div className="rounded-2xl bg-bg-card p-[18px] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-text-primary">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
            {selectedEntry && selectedEntry.flow !== "none" ? (
              <div className="flex items-center gap-1.5 rounded-full bg-flow-bg-selected px-2.5 py-1">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: FLOW_HEX[selectedEntry.flow],
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{ color: FLOW_HEX[selectedEntry.flow] }}
                >
                  {FLOW_LABELS[selectedEntry.flow]}
                </span>
              </div>
            ) : selectedPrediction ? (
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{
                  background:
                    selectedPrediction === "period"
                      ? "var(--flow-bg-selected)"
                      : "#F9EED0",
                  border:
                    selectedPrediction === "period"
                      ? "1px solid rgba(139,39,35,0.25)"
                      : "1px solid rgba(214,147,39,0.35)",
                }}
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background:
                      PREDICTION_COLORS[selectedPrediction],
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color:
                      selectedPrediction === "period"
                        ? PREDICTION_COLORS.period
                        : "#8C5F14",
                  }}
                >
                  {selectedPrediction === "period" ? "Predicted" : "Ovulation"}
                </span>
              </div>
            ) : null}
          </div>
          {selectedEntry?.note ? (
            <p className="mt-2.5 text-[13px] leading-relaxed text-text-secondary">
              {selectedEntry.note}
            </p>
          ) : selectedPrediction && !(selectedEntry && selectedEntry.flow !== "none") ? (
            <p className="mt-2.5 text-[13px] text-text-tertiary italic">
              {selectedPrediction === "period"
                ? "Predicted period day (based on your recent cycles)"
                : "Predicted ovulation window (based on your recent cycles)"}
            </p>
          ) : (
            <p className="mt-2.5 text-[13px] text-text-tertiary italic">
              No notes for this day.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
