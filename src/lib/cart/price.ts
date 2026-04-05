export function parsePriceLabel(value: string): number {
  const numeric = value.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(numeric);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

export function normalizeDiscountPercent(value: unknown): number | null {
  let numeric: number | null = null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    numeric = value;
  } else if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed)) {
      numeric = parsed;
    }
  }

  if (numeric === null) return null;

  const rounded = Math.round(numeric);
  if (rounded < 10 || rounded > 50) return null;
  return rounded;
}

export function calculateDiscountedRupees(originalRupees: number, discountPercent: number): number {
  const percent = normalizeDiscountPercent(discountPercent);
  if (!percent) return Math.max(0, Math.round(originalRupees));
  return Math.max(0, Math.round((originalRupees * (100 - percent)) / 100));
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
