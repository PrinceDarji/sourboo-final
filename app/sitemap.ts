import type { MetadataRoute } from 'next';
import { sanityClient } from '@/src/lib/sanity/client';
import { siteUrl } from '@/src/lib/siteUrl';

export const revalidate = 3600;

const PRODUCT_SLUGS_QUERY = `*[_type == "product" && defined(slug.current)]{
  "slug": slug.current,
  _updatedAt
}`;

type ProductSlugRow = {
  slug?: string;
  _updatedAt?: string;
};

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

async function getProductSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await sanityClient.fetch<ProductSlugRow[]>(PRODUCT_SLUGS_QUERY, {}, { next: { revalidate } });
    if (!Array.isArray(rows)) return [];

    return rows
      .map((row) => ({
        slug: typeof row.slug === 'string' ? row.slug.trim() : '',
        updatedAt: row._updatedAt,
      }))
      .filter((row) => row.slug.length > 0)
      .map((row) => ({
        url: absoluteUrl(`/product/${row.slug}`),
        lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/home'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/product'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/shipping-policy'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/refund-policy'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/privacy-policy'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms-and-conditions'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  return [...staticEntries, ...(await getProductSitemapEntries())];
}
