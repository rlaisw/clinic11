"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListOrderedIcon, HourglassIcon, CheckCircleIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueue } from "@/hooks/use-queue";
import { cn } from "@/lib/utils";

interface ActivePatientQueueCardProps {
  className?: string;
}

export function ActivePatientQueueCard({ className }: ActivePatientQueueCardProps) {
  const { data: queue = [], isLoading } = useQueue();

  const stats = useMemo(() => {
    const waiting = queue.filter((q) => q.status === "waiting").length;
    const completed = queue.filter((q) => q.status === "completed").length;
    return { waiting, completed };
  }, [queue]);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          <ListOrderedIcon className="h-4 w-4 text-muted-foreground" />
          Active Patient Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 ring-1 ring-amber-200 dark:ring-amber-900/30">
              <HourglassIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-1" />
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.waiting}</span>
              <span className="text-[10px] font-medium text-amber-600/80 dark:text-amber-400/80 uppercase tracking-wide">Waiting</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4 ring-1 ring-emerald-200 dark:ring-emerald-900/30">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</span>
              <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wide">Completed</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
