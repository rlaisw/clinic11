'use client';

import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { type ReactNode } from 'react';

export interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  colors?: string[];
  textAlign?: 'center' | 'start' | 'end';
  labelsVisibility?: 'auto' | 'hidden' | 'visible';
  children?: ReactNode;
}

export function PieChart({
  data,
  colors = ['#ff4444', '#4499ee', '#33cc33', '#ffcc00', '#9933cc', '#6699ff'],
  textAlign = 'center',
  labelsVisibility = 'auto',
  children,
}: PieChartProps) {
  const COLORS = colors;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
           label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        {children}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}