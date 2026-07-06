import React from 'react';
import { Pie } from 'recharts';

const CategoryDistributionChart = () => {
  const categoryData = [
    { category: 'Antibiotics', value: 40 },
    { category: 'Pain Relievers', value: 30 },
    { category: 'Vitamins', value: 20 },
    { category: 'Other', value: 10 }
  ];

  return (
    <Pie dataKey="value" name="category">
      {categoryData.map((item) => (
        <Pie.Data label={item.category} value={item.value} />
      ))}
    </Pie>
  );
};

export default CategoryDistributionChart;