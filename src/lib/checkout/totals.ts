export const SHIPPING_CHARGE_PAISE = 10000; // ₹100
export const SHIPPING_CHARGE_INR = SHIPPING_CHARGE_PAISE / 100;

export function calculatePayableTotalPaise(subtotalPaise: number): number {
  return subtotalPaise + SHIPPING_CHARGE_PAISE;
}
