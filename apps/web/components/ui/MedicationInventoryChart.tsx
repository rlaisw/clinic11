'use client';

import React from 'react';
import { PieChart } from '@repo/ui';
import { apiClient } from '@/lib/api';

interface Medication {
  id: string;
  name: string;
  stockStatus: string;
  stockValue: number;
  outOfStockThreshold: number;
  [key: string]: any;
}

async function fetchMedications(): Promise<Medication[]> {
  try {
    const response = await apiClient.get('/medications/');
    const raw: any[] = response.data;

    const data = raw.map(m => ({
      id: m.id ?? m.name,
      name: m.name ?? (m as any).generic_name,
      stockStatus: m.stock_status ?? m.stockStatus,
      stockValue: typeof m.stock_value === 'number' ? m.stock_value : Number(m.stock_value ?? 0),
      outOfStockThreshold: typeof m.threshold_stock_value === 'number' ? m.threshold_stock_value : Number(m.threshold_stock_value ?? 0),
    }));

    console.log('Fetched medications:', data.length, 'items');
    if (data.length > 0) {
      console.log('First item:', data[0]);
      console.log('Stock status values:', [...new Set(data.map(m => String(m.stockStatus)))]);
    }
    return data;
  } catch (error) {
    console.error('Error fetching medications:', error);
    throw error;
  }
}

const MedicationInventoryChart = () => {
  const [meds, setMeds] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetchMedications()
      .then(data => {
        if (isMounted) {
          setMeds(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4">Loading inventory chart...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (meds.length === 0) {
    return <div className="p-4">No medication data available</div>;
  }

  const outOfStockCount = meds.reduce((count, med) => {
    const status = med.stockStatus?.toString().trim() || '';
    const isOutByStatus = status.toLowerCase() === 'out of stock';
    const isOutByValue = med.outOfStockThreshold > 0 && med.stockValue < med.outOfStockThreshold;
    return count + (isOutByStatus || isOutByValue ? 1 : 0);
  }, 0);

  const outOfStockPercentage = Math.round((outOfStockCount / meds.length) * 100);
  const inStockPercentage = 100 - outOfStockPercentage;

  console.log(`Calculated: ${outOfStockCount} out of ${meds.length} = ${outOfStockPercentage}%`);

  const outOfStockData = [
    { name: 'Out of Stock', value: outOfStockPercentage },
    { name: 'In Stock', value: inStockPercentage }
  ];

  return (
    <div>
      <h2>Medication Inventory Status ({meds.length} total)</h2>
      <div className="mb-4">
        <PieChart data={outOfStockData} colors={['#ff4444', '#4499ee']} />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Out of Stock:</span> {outOfStockPercentage}%
        </div>
        <div>
          <span className="font-medium">In Stock:</span> {inStockPercentage}%
        </div>
      </div>
    </div>
  );
};

export default MedicationInventoryChart;
