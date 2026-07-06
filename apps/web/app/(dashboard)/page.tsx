"use client";

import { CalendarCard } from "@/components/dashboard/calendar-card";
import { ActivePatientQueueCard } from "@/components/dashboard/active-patient-queue-card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <CalendarCard />
        <ActivePatientQueueCard />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
