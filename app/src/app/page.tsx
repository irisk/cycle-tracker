import TabBar from "@/components/TabBar";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      {/* Content */}
      <div className="flex-1 px-6 pb-3">
        {/* Header */}
        <div className="py-2">
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-primary">
            Cycle Tracker
          </h1>
        </div>

        <Dashboard />
      </div>

      <TabBar />
    </div>
  );
}
