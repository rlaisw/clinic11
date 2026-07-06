export interface Medication {
  id: string;
  name: string;
  stockStatus: 'In Stock' | 'Out of Stock';
  stockValue: number;
  outOfStockThreshold: number;
  lowStockThreshold: number;
  expiryDate: string;
  dosageLabel: string;
}

export function getOutOfStockStats(meds: Medication[]) {
  const total = meds.length;
  if (total === 0) {
    return { outOfStockPct: 0, inStockPct: 0, outOfStockCount: 0, total };
  }

  const outOfStockCount = meds.filter(
    m => m.stockStatus === 'Out of Stock' || m.stockValue <= m.outOfStockThreshold
  ).length;

  const outOfStockPct = Math.round((outOfStockCount / total) * 100);
  const inStockPct = 100 - outOfStockPct;

  return { outOfStockPct, inStockPct, outOfStockCount, total };
}

export function getLowStockStats(meds: Medication[]) {
  const lowStockCount = meds.filter(
    m => m.stockValue > m.outOfStockThreshold && m.stockValue <= m.lowStockThreshold
  ).length;

  return { lowStockCount };
}

export function getExpiringSoonStats(meds: Medication[], daysThreshold = 30) {
  const expiringSoonCount = meds.filter((m) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
  }).length;

  return { expiringSoonCount };
}

export function getFullInventoryStats(meds: Medication[]) {
  const outOfStock = getOutOfStockStats(meds);
  const lowStock = getLowStockStats(meds);
  const expiringSoon = getExpiringSoonStats(meds);
  const healthyCount = meds.length - outOfStock.outOfStockCount - lowStock.lowStockCount - expiringSoon.expiringSoonCount;

  return {
    total: meds.length,
    outOfStock: outOfStock.outOfStockCount,
    lowStock: lowStock.lowStockCount,
    expiringSoon: expiringSoon.expiringSoonCount,
    healthy: Math.max(0, healthyCount),
    percentages: {
      outOfStock: outOfStock.outOfStockPct,
      inStock: outOfStock.inStockPct,
      lowStock: meds.length > 0 ? Math.round((lowStock.lowStockCount / meds.length) * 100) : 0,
      expiringSoon: meds.length > 0 ? Math.round((expiringSoon.expiringSoonCount / meds.length) * 100) : 0,
      healthy: meds.length > 0 ? Math.round((Math.max(0, healthyCount) / meds.length) * 100) : 0,
    }
  };
}