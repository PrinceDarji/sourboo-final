import { findCatalogProduct } from '../catalog/products';

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

/** The server owns all prices. Client-provided names and prices are never trusted. */
export async function priceCheckoutItems(items: CheckoutItemInput[]): Promise<PricedCart> {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Cart is empty.');
  const bySlug = new Map<string, PricedCheckoutItem>();
  for (const item of items) {
    if (!item || typeof item.slug !== 'string' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error('Invalid item payload. Each item must include slug and quantity (1-99).');
    }
    const product = findCatalogProduct(item.slug);
    if (!product) throw new Error(`Product not found for slug: ${item.slug}`);
    const quantity = (bySlug.get(product.slug)?.quantity ?? 0) + item.quantity;
    if (quantity > 99) throw new Error('Maximum quantity per product is 99.');
    if (!Number.isSafeInteger(product.pricePaise) || product.pricePaise <= 0) {
      throw new Error(`Invalid catalog price for slug: ${product.slug}`);
    }
    bySlug.set(product.slug, {
      slug: product.slug,
      name: product.name,
      quantity,
      unitPricePaise: product.pricePaise,
      lineTotalPaise: product.pricePaise * quantity,
    });
  }
  const pricedItems = Array.from(bySlug.values());
  return {
    items: pricedItems,
    subtotalPaise: pricedItems.reduce((sum, item) => sum + item.lineTotalPaise, 0),
  };
}
