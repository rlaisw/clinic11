import React from 'react';
import { Pie } from 'recharts';

const InventoryChart = () => {
  const outOfStockData = [
    { category: 'Out of Stock', count: 65 },
    { category: 'In Stock', count: 35 }
  ];

  return (
    <Pie dataKey="count" name="category">
      {outOfStockData.map((item) => (
        <Pie.Data label={item.category} value={item.count} />
      ))}
    </Pie>
  );
};

export default InventoryChart;