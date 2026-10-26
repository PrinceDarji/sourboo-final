import type { MetadataRoute } from 'next';
import { CATALOG_PRODUCTS } from '@/src/lib/catalog/products';
import { siteUrl } from '@/src/lib/siteUrl';

export const revalidate = 3600;

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

async function getProductSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  return CATALOG_PRODUCTS.map(({ slug }) => ({
    url: absoluteUrl(`/product/${slug}`),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/product'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/about'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/shipping-policy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/refund-policy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms-and-conditions'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [...staticEntries, ...(await getProductSitemapEntries())];
}
