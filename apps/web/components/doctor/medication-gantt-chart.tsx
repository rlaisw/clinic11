'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveMedications, usePastMedications, usePrescriptions } from '@/hooks/use-patient-background';

const MED_COLOR_MAP: Record<string, string> = {
  Lisinopril: '#4285f4',
  Atorvastatin: '#10b981',
  Metformin: '#8b5cf6',
  Omeprazole: '#f59e0b',
  Aspirin: '#ef4444',
};

const FALLBACK_COLORS = ['#06b6d4', '#d946ef', '#84cc16', '#f43f5e', '#6366f1', '#f97316'];

const MEDICATION_ORDER = ['Lisinopril', 'Atorvastatin', 'Metformin', 'Omeprazole', 'Aspirin'];

interface MedicationRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: number;
  daysSupply: number;
  startDate: string;
  type: 'active' | 'past' | 'prescription';
}

interface VisitGroup {
  date: string;
  displayDate: string;
  medications: MedicationRow[];
  totalDays: number;
}

function getMedicationColor(name: string, index: number): string {
  const lowerName = name.toLowerCase();
  const matched = Object.entries(MED_COLOR_MAP).find(
    ([key]) => key.toLowerCase() === lowerName || lowerName.includes(key.toLowerCase()),
  );
  if (matched) return matched[1];
  return FALLBACK_COLORS[index % FALLBACK_COLORS.length]!;
}

function getMedicationDuration(start: string, end: string, daysSupply?: number): number {
  if (daysSupply && daysSupply > 0) return daysSupply;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

function formatInlineLabel(dosage: string, frequency: string): string {
  const cleanDosage = dosage.trim();
  const cleanFrequency = frequency.trim();
  if (cleanDosage.endsWith(',')) return `${cleanDosage} ${cleanFrequency}`;
  return `${cleanDosage}, ${cleanFrequency}`;
}

export function MedicationGanttChart({ patientId }: { patientId: string }) {
  const { data: activeMeds = [] } = useActiveMedications(patientId);
  const { data: pastMeds = [] } = usePastMedications(patientId);
  const { data: prescriptions = [] } = usePrescriptions(patientId);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: VisitGroup } | null>(null);

  const visitGroups = useMemo<VisitGroup[]>(() => {
    const map = new Map<string, MedicationRow[]>();
    const today = new Date().toISOString().split('T')[0]!;

    const process = (startDate: string, med: MedicationRow) => {
      const key = startDate || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(med);
    };

    activeMeds.forEach((m) => {
      const start = m.start_date;
      if (!start) return;
      const duration = getMedicationDuration(start as string, today, m.days_supply);
      process(start, {
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration,
        daysSupply: m.days_supply && m.days_supply > 0 ? m.days_supply : duration,
        startDate: start,
        type: 'active',
      });
    });

    pastMeds.forEach((m) => {
      const start = m.start_date;
      if (!start) return;
      const end = m.end_date;
      const duration = (end as string)
        ? getMedicationDuration(start as string, end as string, m.days_supply)
        : (m.days_supply || 1);
      process(start, {
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration,
        daysSupply: m.days_supply && m.days_supply > 0 ? m.days_supply : duration,
        startDate: start,
        type: 'past',
      });
    });

    prescriptions.forEach((m) => {
      const start = m.start_date;
      if (!start) return;
      const end = m.end_date || today;
      const duration = getMedicationDuration(start as string, end, m.days_supply);
      process(start, {
        id: m.id,
        name: m.medication_name,
        dosage: `${m.dosage_amount}${m.dosage_unit}`,
        frequency: m.frequency,
        duration,
        daysSupply: m.days_supply && m.days_supply > 0 ? m.days_supply : duration,
        startDate: start,
        type: 'prescription',
      });
    });

    const sorted = Array.from(map.entries())
      .map(([date, medications]) => ({
        date,
        displayDate: date,
        medications: [...medications].sort((a, b) => {
          const idxA = MEDICATION_ORDER.findIndex(
            (m) => m.toLowerCase() === a.name.toLowerCase() || a.name.toLowerCase().includes(m.toLowerCase()),
          );
          const idxB = MEDICATION_ORDER.findIndex(
            (m) => m.toLowerCase() === b.name.toLowerCase() || b.name.toLowerCase().includes(m.toLowerCase()),
          );
          if (idxA === -1 && idxB === -1) return a.name.localeCompare(b.name);
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        }),
        totalDays:
          medications.find((med) => med.daysSupply > 0)?.daysSupply ??
          (medications.reduce((sum, med) => sum + med.duration, 0) || 1),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted;
  }, [activeMeds, pastMeds, prescriptions]);

  const uniqueMedications = useMemo(() => {
    const names = new Set<string>();
    visitGroups.forEach((group) => group.medications.forEach((med) => names.add(med.name)));
    return Array.from(names).sort();
  }, [visitGroups]);

  const { minDays, maxDays } = useMemo(() => {
    if (visitGroups.length === 0) return { minDays: 1, maxDays: 1 };
    const totals = visitGroups.map((g) => g.totalDays);
    return {
      minDays: Math.min(...totals),
      maxDays: Math.max(...totals),
    };
  }, [visitGroups]);

  const tickValues = useMemo(() => {
    if (maxDays <= 1) return [1];
    const step = Math.max(1, Math.ceil(maxDays / 8));
    const count = Math.floor(maxDays / step);
    return Array.from({ length: count }, (_, i) => (i + 1) * step);
  }, [maxDays]);

  const leftMargin = 150;
  const rightMargin = 40;
  const topMargin = 30;
  const bottomMargin = 130;
  const rowHeight = 64;
  const barHeight = 42;
  const chartWidth = 960;
  const chartHeight = topMargin + visitGroups.length * rowHeight + bottomMargin;
  const usableWidth = chartWidth - leftMargin - rightMargin;

  const axisY = topMargin + visitGroups.length * rowHeight;

  const handleMouseMove = (group: VisitGroup, event: React.MouseEvent) => {
    setTooltip({ x: event.clientX, y: event.clientY, data: group });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  if (visitGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Medication History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No medication history to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Patient Medication History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="h-auto w-full"
            role="img"
            aria-label="Patient Medication History"
          >
            <defs>
              <clipPath id="gantt-clip">
                <rect x={leftMargin} y={topMargin} width={usableWidth} height={visitGroups.length * rowHeight} />
              </clipPath>
            </defs>

            <g clipPath="url(#gantt-clip)">
              {visitGroups.map((group, groupIndex) => {
                const y = topMargin + groupIndex * rowHeight;
                const barWidth = (group.totalDays / maxDays) * usableWidth;
                let currentX = leftMargin;

                return (
                  <g key={group.date}>
                    <rect
                      x={leftMargin}
                      y={y + 4}
                      width={usableWidth}
                      height={barHeight}
                      fill="transparent"
                      onMouseMove={(e) => handleMouseMove(group, e)}
                      onMouseLeave={handleMouseLeave}
                      style={{ cursor: 'pointer' }}
                    />

                    {group.medications.map((med, medIndex) => {
                      const segWidth = barWidth / group.medications.length;
                      const color = getMedicationColor(med.name, medIndex);
                      const labelText = formatInlineLabel(med.dosage, med.frequency);
                      const showLabel = segWidth > 50;

                      const x = currentX;
                      currentX += segWidth;

                      return (
                        <g key={med.id}>
                          <rect
                            x={x}
                            y={y + 4}
                            width={Math.max(segWidth, 2)}
                            height={barHeight}
                            rx={4}
                            fill={color}
                            onMouseMove={(e) => handleMouseMove(group, e)}
                            onMouseLeave={handleMouseLeave}
                            style={{ cursor: 'pointer' }}
                          />
                          {showLabel && segWidth > 0 && (
                            <text
                              x={x + segWidth / 2}
                              y={y + barHeight / 2 + 11}
                              textAnchor="middle"
                              className="text-[13px] font-semibold fill-white pointer-events-none select-none"
                            >
                              {labelText}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>

            {visitGroups.map((group, groupIndex) => {
              const y = topMargin + groupIndex * rowHeight;
              return (
                <text
                  key={`label-${group.date}`}
                  x={leftMargin - 12}
                  y={y + barHeight / 2 + 8}
                  textAnchor="end"
                  className="text-sm font-medium fill-gray-700 select-none"
                >
                  {group.displayDate}
                </text>
              );
            })}

            <line
              x1={leftMargin}
              y1={topMargin}
              x2={leftMargin}
              y2={axisY}
              stroke="#d1d5db"
              strokeWidth={1}
            />

            <line
              x1={leftMargin}
              y1={axisY}
              x2={chartWidth - rightMargin}
              y2={axisY}
              stroke="#9ca3af"
              strokeWidth={1}
            />

            {tickValues.map((value) => {
              const x = leftMargin + (value / maxDays) * usableWidth;
              return (
                <g key={`x-${value}`}>
                  <line x1={x} y1={axisY} x2={x} y2={axisY + 5} stroke="#9ca3af" strokeWidth={1} />
                  <text x={x} y={axisY + 22} textAnchor="middle" className="text-sm fill-gray-600 select-none">
                    {value}
                  </text>
                </g>
              );
            })}

            <text
              x={leftMargin + usableWidth / 2}
              y={axisY + 46}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700 select-none"
            >
              Days Supply:
            </text>
            <text
              x={leftMargin + usableWidth / 2}
              y={axisY + 64}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700 select-none"
            >
              Days Patient Takes
            </text>

            <text
              x={20}
              y={topMargin + (visitGroups.length * rowHeight) / 2}
              textAnchor="middle"
              transform={`rotate(-90, 20, ${topMargin + (visitGroups.length * rowHeight) / 2})`}
              className="text-sm font-medium fill-gray-700 select-none"
            >
              Doctor Visit Date
            </text>
          </svg>

          {tooltip && (
            <div
              className="fixed z-50 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg"
              style={{ left: tooltip.x + 14, top: tooltip.y + 14, pointerEvents: 'none' }}
            >
              <p className="mb-1 text-xs font-medium text-gray-500">{tooltip.data.displayDate}</p>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {tooltip.data.medications.map((med, idx) => (
                  <div key={med.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: getMedicationColor(med.name, idx) }}
                    />
                    <span className="min-w-[140px] truncate font-medium">{med.name}</span>
                    <span className="text-gray-500">{med.dosage}</span>
                    <span className="text-gray-500">{med.frequency}</span>
                    <span className="text-xs text-gray-400">{med.daysSupply}d</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {uniqueMedications.map((name, index) => (
              <div key={name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: getMedicationColor(name, index) }} />
                <span className="text-sm text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">How to read:</span> Each horizontal bar represents a doctor visit
          and its length equals the visit&apos;s days supply ({minDays}-{maxDays} range). Colored segments show the
          medications taken concurrently during that period, with dosage &amp; frequency inside. Hover over any segment to
          see a summary of ALL medications for that visit.
        </p>
      </CardContent>
    </Card>
  );
}
