import { sanityClient } from '@/src/lib/sanity/client';
import { calculateDiscountedRupees, normalizeDiscountPercent, parsePriceLabel } from '@/src/lib/cart/price';

export type CheckoutItemInput = {
  slug: string;
  name?: string;
  quantity: number;
};

export type PricedCheckoutItem = {
  slug: string;
  name: string;
  quantity: number;
  unitPricePaise: number;
  lineTotalPaise: number;
};

export type PricedCart = {
  items: PricedCheckoutItem[];
  subtotalPaise: number;
};

type ProductPricingDoc = {
  slug?: string;
  titleWord?: string;
  accentWord?: string;
  suffixWord?: string;
  price?: string;
  discountPercent?: number;
};

const PRODUCT_PRICING_QUERY = `*[_type == "product"] | order(sortOrder asc, _createdAt asc) {
  "slug": slug.current,
  titleWord,
  accentWord,
  suffixWord,
  price,
  discountPercent
}`;

const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'side-eye-sour': 'sideeyesour',
  'tamarin-tease': 'tamarintease',
  'tamarind-tease': 'tamarintease',
};

function toCleanSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

function toCanonicalProductSlug(slug: string): string {
  return PRODUCT_SLUG_ALIASES[slug] || slug;
}

function toLookupKey(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function toPositiveQuantity(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 99) {
    return null;
  }
  return numeric;
}

function toProductName(doc: ProductPricingDoc): string {
  const title = typeof doc.titleWord === 'string' ? doc.titleWord.trim() : '';
  const accent = typeof doc.accentWord === 'string' ? doc.accentWord.trim() : '';
  const suffix = typeof doc.suffixWord === 'string' ? doc.suffixWord.trim() : '';
  const name = [title, accent, suffix].filter(Boolean).join(' ').trim();
  return name || doc.slug || 'Product';
}

function toUnitPricePaise(doc: ProductPricingDoc, slug: string): number {
  const priceLabel = typeof doc.price === 'string' ? doc.price.trim() : '';
  if (!priceLabel) {
    throw new Error(`Missing price for slug: ${slug}`);
  }

  const originalRupees = parsePriceLabel(priceLabel);
  const discountPercent = normalizeDiscountPercent(doc.discountPercent);
  const rupees =
    discountPercent && originalRupees > 0
      ? calculateDiscountedRupees(originalRupees, discountPercent)
      : originalRupees;
  const paise = Math.round(rupees * 100);
  if (!Number.isFinite(paise) || paise <= 0) {
    throw new Error(`Invalid price for slug: ${slug}`);
  }

  return paise;
}

function normalizeItems(items: CheckoutItemInput[]): CheckoutItemInput[] {
  const itemsByCanonicalSlug = new Map<string, CheckoutItemInput>();

  for (const item of items) {
    const slug = toCleanSlug(item.slug);
    const quantity = toPositiveQuantity(item.quantity);

    if (!slug || !quantity) {
      throw new Error('Invalid item payload. Each item must include slug and quantity (1-99).');
    }

    const canonicalSlug = toCanonicalProductSlug(slug);
    const existing = itemsByCanonicalSlug.get(canonicalSlug);
    itemsByCanonicalSlug.set(canonicalSlug, {
      slug: canonicalSlug,
      name: existing?.name || item.name,
      quantity: (existing?.quantity || 0) + quantity,
    });
  }

  return Array.from(itemsByCanonicalSlug.values());
}

export async function priceCheckoutItems(items: CheckoutItemInput[]): Promise<PricedCart> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty.');
  }

  const normalized = normalizeItems(items);
  const docs = await sanityClient.fetch<ProductPricingDoc[]>(
    PRODUCT_PRICING_QUERY,
    {},
    { next: { revalidate: 60 } },
  );

  const bySlug = new Map<string, ProductPricingDoc>();
  const byLookupKey = new Map<string, ProductPricingDoc>();
  for (const doc of docs || []) {
    const slug = toCleanSlug(doc.slug);
    if (!slug) continue;
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, doc);

    const lookupKeys = new Set([toLookupKey(slug), toLookupKey(toProductName(doc))]);
    for (const key of lookupKeys) {
      if (!key || byLookupKey.has(key)) continue;
      byLookupKey.set(key, doc);
    }
  }

  const pricedItems: PricedCheckoutItem[] = normalized.map((item) => {
    const productDoc =
      bySlug.get(item.slug) ||
      byLookupKey.get(toLookupKey(item.slug)) ||
      byLookupKey.get(toLookupKey(item.name));
    if (!productDoc) {
      throw new Error(`Product not found for slug: ${item.slug}`);
    }

    const unitPricePaise = toUnitPricePaise(productDoc, item.slug);
    const lineTotalPaise = unitPricePaise * item.quantity;

    return {
      slug: item.slug,
      name: toProductName(productDoc),
      quantity: item.quantity,
      unitPricePaise,
      lineTotalPaise,
    };
  });

  const subtotalPaise = pricedItems.reduce((sum, item) => sum + item.lineTotalPaise, 0);

  return {
    items: pricedItems,
    subtotalPaise,
  };
}
