import { findCatalogProduct } from '../catalog/products';

export type CartItem = {
  slug: string; name: string; price: number; image: string; quantity: number;
};

export function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<CartItem>;
  if (typeof item.slug !== 'string') return null;
  const product = findCatalogProduct(item.slug);
  if (!product) return null;
  const quantity = Number(item.quantity);
  return {
    slug: product.slug, name: product.name, image: product.jarImage,
    price: product.pricePaise / 100,
    quantity: Number.isFinite(quantity) ? Math.min(99, Math.max(1, Math.floor(quantity))) : 1,
  };
}

export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const items = new Map<string, CartItem>();
  for (const candidate of value) {
    const item = normalizeCartItem(candidate);
    if (!item) continue;
    const existing = items.get(item.slug);
    item.quantity = Math.min(99, item.quantity + (existing?.quantity ?? 0));
    items.set(item.slug, item);
  }
  return [...items.values()];
}
