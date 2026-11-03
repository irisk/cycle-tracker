"use client";

import { useState, useEffect } from "react";
import {
  getCurrentPhase,
  getSeasonName,
  detectAllCycleStarts,
  calculateAverageCycleLength,
  toDateKey,
} from "@/lib/cycle";
import { getRecentLogs, getAllFlowLogs } from "@/lib/daily-logs";
import type { DailyLog } from "@/lib/daily-logs";
import { FLOW_HEX, FLOW_LABELS } from "@/lib/constants";
import ErrorBanner, { friendlyErrorMessage } from "@/components/ErrorBanner";

/**
 * Compute cycle day for a given date relative to a cycle start date.
 */
function getCycleDay(dateStr: string, cycleStartDate: string): number {
  const date = new Date(dateStr + "T00:00:00");
  const start = new Date(cycleStartDate + "T00:00:00");
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Find the cycle start date that applies to a given entry date.
 * Returns the most recent cycle start that is on or before the entry date.
 */
function findCycleStartForDate(
  dateStr: string,
  cycleStarts: string[]
): string | null {
  // cycleStarts is sorted ascending — find the last one <= dateStr
  let result: string | null = null;
  for (const start of cycleStarts) {
    if (start <= dateStr) {
      result = start;
    } else {
      break;
    }
  }
  return result;
}

export default function TimelineView() {
  const [entries, setEntries] = useState<DailyLog[]>([]);
  const [cycleStarts, setCycleStarts] = useState<string[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    setFetchError(null);

    Promise.all([getRecentLogs(60), getAllFlowLogs()])
      .then(([recent, flowLogs]) => {
        setEntries(recent);
        setCycleStarts(detectAllCycleStarts(flowLogs));
        setCycleLength(calculateAverageCycleLength(flowLogs));
      })
      .catch((err) => setFetchError(friendlyErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorBanner message={fetchError} onRetry={loadData} />;
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-text-tertiary">
          No entries yet. Start by logging today.
        </p>
      </div>
    );
  }

  const today = new Date();
  const todayKey = toDateKey(today);
  const currentCycleStart = findCycleStartForDate(todayKey, cycleStarts);
  const currentCycleDay = currentCycleStart
    ? getCycleDay(todayKey, currentCycleStart)
    : null;

  // Track which cycle start we've seen, so we can insert separators
  let lastCycleStart: string | null = null;

  return (
    <div className="flex flex-col gap-5">
      {/* Cycle header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-text-primary">
          Current Cycle
        </span>
        <span className="text-[13px] font-medium text-text-tertiary">
          {currentCycleDay
            ? `Day ${currentCycleDay} of ${cycleLength}`
            : `~${cycleLength} day cycle`}
        </span>
      </div>

      {/* Timeline entries — newest first */}
      <div className="flex flex-col">
        {[...entries].reverse().map((entry, index) => {
          const entryCycleStart = findCycleStartForDate(
            entry.date,
            cycleStarts
          );
          const cycleDay =
            entryCycleStart != null
              ? getCycleDay(entry.date, entryCycleStart)
              : null;
          const phase =
            cycleDay != null && cycleDay > 0
              ? getCurrentPhase(cycleDay, cycleLength)
              : null;
          const seasonName = phase ? getSeasonName(phase.season) : null;
          const date = new Date(entry.date + "T00:00:00");
          const dateLabel = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          // Show a separator when we cross into an older cycle
          const showSeparator =
            lastCycleStart !== null &&
            entryCycleStart !== lastCycleStart;
          lastCycleStart = entryCycleStart;

          return (
            <div key={entry.date}>
              {showSeparator && (
                <div className="flex items-center gap-3 py-3">
                  <div className="h-px flex-1 bg-border-subtle" />
                  <span className="text-[11px] font-semibold tracking-[1px] text-text-tertiary">
                    PREVIOUS CYCLE
                  </span>
                  <div className="h-px flex-1 bg-border-subtle" />
                </div>
              )}
              <div className="flex gap-3.5 border-b border-border-subtle py-3.5">
                {/* Left column: date + flow dot */}
                <div className="flex w-10 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-text-tertiary">
                    {dateLabel}
                  </span>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: FLOW_HEX[entry.flow] }}
                  />
                </div>

                {/* Right column: flow badge, phase, note */}
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{
                        backgroundColor:
                          entry.flow === "none"
                            ? "var(--bg-muted)"
                            : "var(--flow-bg-selected)",
                        color:
                          entry.flow === "none"
                            ? "var(--text-tertiary)"
                            : FLOW_HEX[entry.flow],
                      }}
                    >
                      {FLOW_LABELS[entry.flow]}
                    </span>
                    {seasonName && cycleDay != null && cycleDay > 0 && phase && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: phase.color }}
                      >
                        {seasonName} · Day {cycleDay}
                      </span>
                    )}
                  </div>
                  {entry.note && (
                    <p className="text-[13px] leading-relaxed text-text-secondary">
                      {entry.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
