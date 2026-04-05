import { sanityClient } from '@/src/lib/sanity/client';
import { calculateDiscountedRupees, normalizeDiscountPercent, parsePriceLabel } from '@/src/lib/cart/price';

export type CheckoutItemInput = {
  slug: string;
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

const PRODUCT_PRICING_QUERY = `*[_type == "product" && slug.current in $slugs] | order(sortOrder asc, _createdAt asc) {
  "slug": slug.current,
  titleWord,
  accentWord,
  suffixWord,
  price,
  discountPercent
}`;

function toCleanSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
  const quantitiesBySlug = new Map<string, number>();

  for (const item of items) {
    const slug = toCleanSlug(item.slug);
    const quantity = toPositiveQuantity(item.quantity);

    if (!slug || !quantity) {
      throw new Error('Invalid item payload. Each item must include slug and quantity (1-99).');
    }

    quantitiesBySlug.set(slug, (quantitiesBySlug.get(slug) || 0) + quantity);
  }

  return Array.from(quantitiesBySlug.entries()).map(([slug, quantity]) => ({ slug, quantity }));
}

export async function priceCheckoutItems(items: CheckoutItemInput[]): Promise<PricedCart> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty.');
  }

  const normalized = normalizeItems(items);
  const slugs = normalized.map((item) => item.slug);

  const docs = await sanityClient.fetch<ProductPricingDoc[]>(
    PRODUCT_PRICING_QUERY,
    { slugs },
    { next: { revalidate: 60 } },
  );

  const bySlug = new Map<string, ProductPricingDoc>();
  for (const doc of docs || []) {
    const slug = toCleanSlug(doc.slug);
    if (!slug) continue;
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, doc);
  }

  const pricedItems: PricedCheckoutItem[] = normalized.map((item) => {
    const productDoc = bySlug.get(item.slug);
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
