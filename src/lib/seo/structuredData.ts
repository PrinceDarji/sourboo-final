import type { CatalogProduct } from '../catalog/products';

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function productStructuredData(product: CatalogProduct, origin: string) {
  const url = new URL(`/product/${product.slug}`, origin).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.detailInJarSummary.replace(/\n/g, ' '),
    image: product.galleryImages.map(image => new URL(image, origin).href),
    sku: product.slug,
    brand: { '@type': 'Brand', name: 'Sourboo' },
    url,
    offers: {
      '@type': 'Offer', url, priceCurrency: 'INR',
      price: (product.pricePaise / 100).toFixed(2),
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Sourboo' },
    },
  };
}
