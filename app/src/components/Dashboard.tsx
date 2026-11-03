"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import CycleWheel from "./CycleWheel";
import PhaseGlyph from "./PhaseGlyph";
import {
  getCurrentPhase,
  getSeasonName,
  PHASES,
  toDateKey,
  detectCycleDay1,
  calculateAverageCycleLength,
} from "@/lib/cycle";
import { getAllFlowLogs } from "@/lib/daily-logs";
import ErrorBanner, { friendlyErrorMessage } from "@/components/ErrorBanner";

/**
 * Dashboard component — the main screen of the app.
 *
 * Fetches all flow logs on mount, then computes:
 * - Current cycle day (from detected Day 1)
 * - Average cycle length (from past cycle boundaries)
 * - Current phase / season
 * - Days until next period
 */
export default function Dashboard() {
  const [cycleDay, setCycleDay] = useState<number | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  function loadData() {
    setLoading(true);
    setFetchError(null);
    setCycleDay(null);

    getAllFlowLogs()
      .then((logs) => {
        const avgLength = calculateAverageCycleLength(logs);
        setCycleLength(avgLength);

        const day1 = detectCycleDay1(logs);
        if (day1) {
          const today = new Date();
          const start = new Date(day1 + "T00:00:00");
          const diffDays = Math.floor(
            (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          setCycleDay(diffDays + 1);
        }
      })
      .catch((err) => setFetchError(friendlyErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorBanner message={fetchError} onRetry={loadData} />;
  }

  // Empty state: no data yet
  if (cycleDay === null) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 rounded-[20px] bg-bg-card p-8 shadow-sm">
          <p className="text-center text-sm text-text-secondary">
            No cycle data yet. Log your first entry to see your cycle dashboard.
          </p>
        </div>
        <Link
          href="/log"
          className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-green text-white"
        >
          <Plus size={20} strokeWidth={2} />
          <span className="text-base font-semibold">Log Your First Entry</span>
        </Link>
      </div>
    );
  }

  const daysUntilPeriod = cycleLength - cycleDay;
  const phase = getCurrentPhase(cycleDay, cycleLength);
  const seasonName = getSeasonName(phase.season);

  // Predicted date for next period
  const nextPeriodDate = new Date();
  nextPeriodDate.setDate(nextPeriodDate.getDate() + daysUntilPeriod);
  const nextPeriodLabel = nextPeriodDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Legend items
  const legend = [
    { label: "Menstruation", color: PHASES.winter.color },
    { label: "Follicular", color: PHASES.spring.color },
    { label: "Ovulation", color: PHASES.summer.color },
    { label: "Luteal", color: PHASES.autumn.color },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Season Card — editorial phase header + hero wheel */}
      <div className="flex flex-col items-center gap-3 rounded-[20px] bg-bg-card p-4 shadow-sm">
        {/* Phase glyph + season name (editorial Light weight, phase-colored) */}
        <div className="flex flex-col items-center gap-2">
          <PhaseGlyph
            season={phase.season}
            size={36}
            strokeWidth={1.5}
            className="transition-colors"
          />
          <h1
            className="text-[40px] font-light leading-none tracking-[-0.03em]"
            style={{ color: phase.color }}
          >
            {seasonName}
          </h1>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-text-secondary">
            {phase.label} · Day {cycleDay} of {cycleLength}
          </span>
        </div>

        {/* Cycle wheel — hero size */}
        <CycleWheel cycleDay={cycleDay} cycleLength={cycleLength} displaySize={200} />

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] font-medium text-text-secondary">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next period card */}
      <div className="flex items-center justify-between rounded-2xl bg-bg-card p-[14px] shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-text-tertiary">
            Next period in
          </span>
          <span className="text-[22px] font-semibold tracking-tight text-text-primary">
            {daysUntilPeriod > 0
              ? `${daysUntilPeriod} days · ${nextPeriodLabel}`
              : "any day now"}
          </span>
        </div>
        <Calendar size={24} className="text-coral" strokeWidth={1.5} />
      </div>

      {/* Log today button */}
      <Link
        href="/log"
        className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-green text-white"
      >
        <Plus size={20} strokeWidth={2} />
        <span className="text-base font-semibold">Log Today</span>
      </Link>
    </div>
  );
}
