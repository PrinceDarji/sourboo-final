const productionSiteUrl = 'https://www.sourboo.com';

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configuredUrl) return productionSiteUrl;

  try {
    const url = new URL(configuredUrl);
    if (url.hostname.endsWith('.vercel.app')) return productionSiteUrl;
    return url.origin;
  } catch {
    return productionSiteUrl;
  }
}

export const siteUrl = getSiteUrl();
