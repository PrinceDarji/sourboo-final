export const POPUP_DISCOUNT_CODE = 'SOURBABE05';
export const POPUP_DISCOUNT_PERCENT = 5;

export type AppliedDiscount = {
  code: string | null;
  discountPaise: number;
  discountPercent: number;
};

export function normalizeDiscountCode(value: unknown): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function resolveDiscountCode(value: unknown): string | null {
  const normalized = normalizeDiscountCode(value);
  return normalized === POPUP_DISCOUNT_CODE ? POPUP_DISCOUNT_CODE : null;
}

export function calculateDiscountPaise(subtotalPaise: number, value: unknown): AppliedDiscount {
  const safeSubtotalPaise = Math.max(0, Math.round(subtotalPaise));
  const code = resolveDiscountCode(value);

  if (!code || safeSubtotalPaise <= 0) {
    return {
      code: null,
      discountPaise: 0,
      discountPercent: 0,
    };
  }

  return {
    code,
    discountPaise: Math.round((safeSubtotalPaise * POPUP_DISCOUNT_PERCENT) / 100),
    discountPercent: POPUP_DISCOUNT_PERCENT,
  };
}

export function calculateDiscountRupees(subtotalRupees: number, value: unknown): number {
  const subtotalPaise = Math.round(Math.max(0, subtotalRupees) * 100);
  return calculateDiscountPaise(subtotalPaise, value).discountPaise / 100;
}
