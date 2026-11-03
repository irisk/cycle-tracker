"use client";

import { useState, useEffect } from "react";
import TabBar from "@/components/TabBar";
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import { toDateKey } from "@/lib/cycle";
import { upsertLog, getLogForDate } from "@/lib/daily-logs";
import type { DailyLog } from "@/lib/daily-logs";
import {
  FLOW_OPTIONS,
  FLOW_COLORS,
  type FlowIntensity,
} from "@/lib/constants";
import ErrorBanner, { friendlyErrorMessage } from "@/components/ErrorBanner";

/**
 * Format a date as "Today, Feb 26" or "Wed, Feb 24" etc.
 */
function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  const isToday = compareDate.getTime() === today.getTime();
  const dayLabel = isToday
    ? "Today"
    : date.toLocaleDateString("en-US", { weekday: "short" });

  const monthDay = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${dayLabel}, ${monthDay}`;
}

export default function LogPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [flow, setFlow] = useState<FlowIntensity | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Track what was last loaded/saved so we can detect unsaved changes
  const [savedFlow, setSavedFlow] = useState<FlowIntensity | null>(null);
  const [savedNotes, setSavedNotes] = useState("");

  const isDirty = flow !== savedFlow || notes !== savedNotes;

  function loadEntry() {
    const dateKey = toDateKey(selectedDate);
    setLoading(true);
    setLoadError(null);
    setSaveStatus("idle");

    getLogForDate(dateKey)
      .then((log: DailyLog | null) => {
        if (log) {
          setFlow(log.flow as FlowIntensity);
          setNotes(log.note ?? "");
          setSavedFlow(log.flow as FlowIntensity);
          setSavedNotes(log.note ?? "");
        } else {
          setFlow(null);
          setNotes("");
          setSavedFlow(null);
          setSavedNotes("");
        }
      })
      .catch((err) => {
        setLoadError(friendlyErrorMessage(err));
        setFlow(null);
        setNotes("");
      })
      .finally(() => setLoading(false));
  }

  // Fetch existing entry when date changes — enables editing past entries
  useEffect(() => {
    loadEntry();
  }, [selectedDate]);

  const navigateDate = (direction: -1 | 1) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction);
      if (next > new Date()) return prev;
      return next;
    });
  };

  const handleSave = async () => {
    if (!flow) return;

    setSaving(true);
    setSaveStatus("idle");
    setSaveError(null);

    try {
      await upsertLog(
        toDateKey(selectedDate),
        flow,
        notes.trim() || null
      );
      setSaveStatus("saved");
      setSavedFlow(flow);
      setSavedNotes(notes.trim());
    } catch (err) {
      setSaveStatus("error");
      setSaveError(friendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <div className="flex-1 px-6 pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 py-4">
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-primary">
            Log Entry
          </h1>
        </div>

        {/* Date selector */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => navigateDate(-1)}
            className="p-1 text-text-tertiary active:text-text-primary"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            {formatDate(selectedDate)}
          </span>
          <button
            onClick={() => navigateDate(1)}
            className="p-1 text-text-tertiary active:text-text-primary"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green border-t-transparent" />
          </div>
        ) : loadError ? (
          <div className="mt-6">
            <ErrorBanner message={loadError} onRetry={loadEntry} />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {/* Flow intensity */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Flow Intensity
              </h2>
              <div className="flex gap-2">
                {FLOW_OPTIONS.map((option) => {
                  const isSelected = flow === option.value;
                  const color = FLOW_COLORS[option.value];
                  return (
                    <button
                      key={option.value}
                      onClick={() => setFlow(option.value)}
                      className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl py-4 transition-colors ${
                        isSelected
                          ? "border-2 bg-flow-bg-selected"
                          : "border-[1.5px] border-border-subtle bg-bg-card"
                      }`}
                      style={{
                        borderColor: isSelected ? color : undefined,
                      }}
                    >
                      <div
                        className="rounded-full"
                        style={{
                          width: option.size,
                          height: option.size,
                          backgroundColor: option.value === "none" ? "transparent" : color,
                          border:
                            option.value === "none"
                              ? "1.5px solid var(--border-strong)"
                              : "none",
                        }}
                      />
                      <span
                        className={`text-[11px] ${
                          isSelected
                            ? "font-semibold"
                            : "font-medium text-text-secondary"
                        }`}
                        style={{ color: isSelected ? color : undefined }}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                Notes
              </h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling today? Any symptoms, mood changes, or things you want to remember..."
                className="h-40 w-full resize-none rounded-xl border-[1.5px] border-border-subtle bg-bg-card p-4 text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary focus:border-border-strong focus:outline-none"
              />
            </div>

            {/* Save button — changes appearance based on state */}
            {saveStatus === "saved" && !isDirty ? (
              // Saved state: calm confirmation on the button itself
              <button
                disabled
                className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-green bg-bg-muted text-green"
              >
                <Check size={20} strokeWidth={2} />
                <span className="text-base font-semibold">Saved</span>
              </button>
            ) : (
              // Active state: save entry / save changes / saving
              <button
                onClick={handleSave}
                disabled={!flow || saving}
                className="flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-green text-white active:bg-green-dark disabled:opacity-60"
              >
                {saving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save size={20} strokeWidth={2} />
                )}
                <span className="text-base font-semibold">
                  {saving
                    ? "Saving..."
                    : isDirty && savedFlow !== null
                      ? "Save Changes"
                      : "Save Entry"}
                </span>
              </button>
            )}

            {/* Error feedback — only shown on failure */}
            {saveStatus === "error" && (
              <p className="text-center text-sm font-medium text-flow-heavy">
                {saveError ?? "Failed to save. Try again."}
              </p>
            )}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
}
