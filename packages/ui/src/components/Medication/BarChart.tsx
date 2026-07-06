'use client';

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  color?: string;
}

export function BarChart({ data, color = '#ff4444' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart data={data}>
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={color} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}