'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveMedications, usePastMedications } from '@/hooks/use-patient-background';
import { PieChart } from '@repo/ui';
import { MedicationGanttChart } from '@/components/doctor/medication-gantt-chart';

interface DataVisualizationTabProps {
  patientId: string;
}

export function DataVisualizationTab({ patientId }: DataVisualizationTabProps) {
  const { data: activeMeds = [], isLoading: activeLoading } = useActiveMedications(patientId);
  const { data: pastMeds = [], isLoading: pastLoading } = usePastMedications(patientId);

  const allMeds = useMemo(() => [...activeMeds, ...pastMeds], [activeMeds, pastMeds]);

  const diagnosticResultData = useMemo(() => {
    const counts: Record<string, number> = {};
    allMeds.forEach((med) => {
      const result = med.diagnostic_result?.trim();
      if (result) {
        counts[result] = (counts[result] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [allMeds]);

  const totalMeds = diagnosticResultData.reduce((sum, item) => sum + item.value, 0);

  if (activeLoading || pastLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Results Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticResultData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No diagnostic results recorded for this patient.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <PieChart data={diagnosticResultData} />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Total Medications with Diagnostic Results: {totalMeds}</p>
                <div className="space-y-2">
                  {diagnosticResultData.map((item, index) => {
                    const percentage = totalMeds > 0 ? ((item.value / totalMeds) * 100).toFixed(1) : 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-sm"
                            style={{
                              backgroundColor: [
                                '#ff4444',
                                '#4499ee',
                                '#33cc33',
                                '#ffcc00',
                                '#9933cc',
                                '#6699ff',
                              ][index % 6],
                            }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MedicationGanttChart patientId={patientId} />
    </div>
  );
}
