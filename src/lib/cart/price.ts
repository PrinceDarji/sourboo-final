export function parsePriceLabel(value: string): number {
  const numeric = value.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(numeric);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
