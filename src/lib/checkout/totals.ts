export const SHIPPING_CHARGE_PAISE = 10000; // ₹100
export const SHIPPING_CHARGE_INR = SHIPPING_CHARGE_PAISE / 100;

// Flat shipping once per non-empty order, including bundles.
export function shouldApplyShippingForSlug(slug: string): boolean {
  return typeof slug === 'string' && slug.trim().length > 0;
}

export function calculateShippingPaiseForItems(items: Array<{ slug?: string; name?: string }>): number {
  return items.length > 0 ? SHIPPING_CHARGE_PAISE : 0;
}

export function calculatePayableTotalPaise(
  subtotalPaise: number,
  shippingPaise: number,
  discountPaise = 0,
): number {
  return Math.max(0, subtotalPaise + Math.max(0, shippingPaise) - Math.max(0, discountPaise));
}
