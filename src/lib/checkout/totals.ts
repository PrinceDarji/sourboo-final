export const SHIPPING_CHARGE_PAISE = 10000; // ₹100
export const SHIPPING_CHARGE_INR = SHIPPING_CHARGE_PAISE / 100;

const SHIPPING_ELIGIBLE_SINGLE_SLUGS = new Set([
  'side-eye-sour',
  'tamarin-tease',
  'tamarind-tease',
]);

const BUNDLE_HINT_PATTERN = /\b(bundle|combo|pack|duo|set|box|hamper)\b/;
const SINGLE_SLUG_PATTERNS = [/side[-_]?eye[-_]?sour/, /(tamarin|tamarind)[-_]?tease/];
const SINGLE_NAME_PATTERNS = [/\bside\s*eye\s*sour\b/, /\btamarin(d)?\s*tease\b/];

function normalizeSlug(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function normalizeName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasBundleHint(value: string): boolean {
  if (!value) return false;
  return BUNDLE_HINT_PATTERN.test(value);
}

export function shouldApplyShippingForSlug(slug: string): boolean {
  const normalizedSlug = normalizeSlug(slug);
  if (!normalizedSlug) return false;

  if (hasBundleHint(normalizedSlug.replace(/[-_]/g, ' '))) {
    return false;
  }

  if (SHIPPING_ELIGIBLE_SINGLE_SLUGS.has(normalizedSlug)) {
    return true;
  }

  return SINGLE_SLUG_PATTERNS.some((pattern) => pattern.test(normalizedSlug));
}

function shouldApplyShippingForItem(item: { slug?: string; name?: string }): boolean {
  const normalizedName = normalizeName(item.name);
  if (normalizedName && !hasBundleHint(normalizedName)) {
    if (SINGLE_NAME_PATTERNS.some((pattern) => pattern.test(normalizedName))) {
      return true;
    }
  }

  if (!item.slug) return false;
  return shouldApplyShippingForSlug(item.slug);
}

export function calculateShippingPaiseForItems(items: Array<{ slug?: string; name?: string }>): number {
  return items.some((item) => shouldApplyShippingForItem(item)) ? SHIPPING_CHARGE_PAISE : 0;
}

export function calculatePayableTotalPaise(
  subtotalPaise: number,
  shippingPaise: number,
  discountPaise = 0,
): number {
  return Math.max(0, subtotalPaise + Math.max(0, shippingPaise) - Math.max(0, discountPaise));
}
