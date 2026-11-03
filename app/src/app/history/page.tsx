"use client";

import { useState } from "react";
import TabBar from "@/components/TabBar";
import CalendarView from "@/components/CalendarView";
import TimelineView from "@/components/TimelineView";
import { Grid3X3, List } from "lucide-react";

type ViewMode = "calendar" | "timeline";

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <div className="flex-1 px-6 pb-6">
        {/* Header */}
        <div className="py-4">
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-primary">
            History
          </h1>
        </div>

        {/* View toggle — segmented control */}
        <div className="flex h-10 gap-1 rounded-xl bg-bg-muted p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] transition-all ${
              viewMode === "calendar"
                ? "bg-bg-card font-semibold text-text-primary shadow-sm"
                : "font-medium text-text-tertiary"
            }`}
          >
            <Grid3X3 size={14} />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg text-[13px] transition-all ${
              viewMode === "timeline"
                ? "bg-bg-card font-semibold text-text-primary shadow-sm"
                : "font-medium text-text-tertiary"
            }`}
          >
            <List size={14} />
            Timeline
          </button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {viewMode === "calendar" ? <CalendarView /> : <TimelineView />}
        </div>
      </div>

      <TabBar />
    </div>
  );
}
