import { sanityClient } from '@/src/lib/sanity/client';
import { sanityImageOrFileUrl } from '@/src/lib/sanity/image';

const DEFAULT_INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/eatsourboo/';
const DEFAULT_INSTAGRAM_HANDLE = '@sourboosnacks';
const DEFAULT_WHATSAPP_URL = 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN';
const DEFAULT_INSTAGRAM_CARD_LABEL = 'watch on instagram';
const DEFAULT_INSTAGRAM_HEADING_PREFIX = 'get to know';
const DEFAULT_INSTAGRAM_FALLBACK_CARD_LABEL = 'connect instagram feed';
const DEFAULT_FOOTER_TAGLINE = 'stay sour';

const DEFAULT_PRIMARY_FOOTER_LINKS = [
  { label: 'HOME', href: '/' },
  { label: 'OUR STORY', href: '/about' },
] as const;

const DEFAULT_SECONDARY_FOOTER_LINKS = [
  { label: 'SHOP', href: '/product' },
  { label: 'JOIN US', href: '/join' },
] as const;

const DEFAULT_POLICY_FOOTER_LINKS = [
  { label: 'TERMS & CONDITIONS', href: '/terms-and-conditions' },
  { label: 'PRIVACY POLICY', href: '/privacy-policy' },
  { label: 'REFUND POLICY', href: '/refund-policy' },
  { label: 'SHIPPING POLICY', href: '/shipping-policy' },
  { label: 'CONTACT', href: '/contact' },
] as const;

export type InstagramPostLink = {
  id: string;
  permalink: string;
  caption: string;
  backgroundImageUrl?: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterContent = {
  instagramHeadingPrefix: string;
  instagramFallbackCardLabel: string;
  backgroundImageUrl?: string;
  logoImageUrl: string;
  logoAlt: string;
  tagline: string;
  primaryLinks: FooterLink[];
  secondaryLinks: FooterLink[];
  policyLinks: FooterLink[];
};

export type SocialLinksConfig = {
  instagramProfileUrl: string;
  instagramHandle: string;
  instagramPosts: InstagramPostLink[];
  whatsappUrl: string;
  footer: FooterContent;
};

type SiteSettingsQueryLink = {
  _key?: string;
  label?: string;
  url?: string;
  backgroundImage?: unknown;
};

type SiteSettingsFooterLink = {
  label?: string;
  href?: string;
};

type SiteSettingsQueryResult = {
  instagramProfileUrl?: string;
  instagramHandle?: string;
  whatsappUrl?: string;
  instagramFeedLinks?: SiteSettingsQueryLink[];
  instagramHeadingPrefix?: string;
  instagramFallbackCardLabel?: string;
  footerBackgroundImage?: unknown;
  footerLogoImage?: unknown;
  footerLogoAlt?: string;
  footerTagline?: string;
  footerPrimaryLinks?: SiteSettingsFooterLink[];
  footerSecondaryLinks?: SiteSettingsFooterLink[];
  footerPolicyLinks?: SiteSettingsFooterLink[];
} | null;

const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
  instagramProfileUrl,
  instagramHandle,
  whatsappUrl,
  instagramHeadingPrefix,
  instagramFallbackCardLabel,
  "footerBackgroundImage": coalesce(footerBackgroundImageSvg.asset->url, footerBackgroundImage),
  "footerLogoImage": coalesce(footerLogoImageSvg.asset->url, footerLogoImage),
  footerLogoAlt,
  footerTagline,
  instagramFeedLinks[]{
    _key,
    label,
    url,
    "backgroundImage": coalesce(backgroundImageSvg.asset->url, backgroundImage)
  },
  footerPrimaryLinks[]{
    label,
    href
  },
  footerSecondaryLinks[]{
    label,
    href
  },
  footerPolicyLinks[]{
    label,
    href
  }
}`;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asValidUrlOrFallback(value: unknown, fallback: string): string {
  const maybeUrl = asNonEmptyString(value);
  if (!maybeUrl) return fallback;

  try {
    // Ensure we only return absolute URLs.
    const normalized = new URL(maybeUrl);
    return normalized.toString();
  } catch {
    return fallback;
  }
}

function asValidHref(value: unknown): string | undefined {
  const maybeHref = asNonEmptyString(value);
  if (!maybeHref) return undefined;

  if (maybeHref.startsWith('/')) {
    return maybeHref;
  }

  try {
    return new URL(maybeHref).toString();
  } catch {
    return undefined;
  }
}

function toBackgroundImageUrl(source: unknown): string | undefined {
  if (!source) return undefined;
  return sanityImageOrFileUrl(source, '', {
    width: 960,
    height: 1200,
    fit: 'crop',
    quality: 80,
  }) || undefined;
}

function toFooterBackgroundImageUrl(source: unknown): string | undefined {
  if (!source) return undefined;
  return sanityImageOrFileUrl(source, '', { width: 2400, quality: 82 }) || undefined;
}

function toFooterLogoImageUrl(source: unknown): string | undefined {
  if (!source) return undefined;
  return sanityImageOrFileUrl(source, '', { width: 900, quality: 90 }) || undefined;
}

function toInstagramPosts(links: unknown): InstagramPostLink[] {
  if (!Array.isArray(links)) return [];

  const posts: InstagramPostLink[] = [];
  for (const entry of links) {
    const link = entry as SiteSettingsQueryLink;
    const permalink = asNonEmptyString(link?.url);
    if (!permalink) continue;

    let normalizedPermalink = permalink;
    try {
      normalizedPermalink = new URL(permalink).toString();
    } catch {
      continue;
    }

    posts.push({
      id: asNonEmptyString(link?._key) || normalizedPermalink,
      permalink: normalizedPermalink,
      caption: asNonEmptyString(link?.label) || DEFAULT_INSTAGRAM_CARD_LABEL,
      backgroundImageUrl: toBackgroundImageUrl(link?.backgroundImage),
    });
  }

  return posts.slice(0, 3);
}

function defaultFooterLinks(
  source: readonly { label: string; href: string }[],
): FooterLink[] {
  return source.map((item) => ({ ...item }));
}

function toFooterLinks(
  links: unknown,
  fallback: readonly { label: string; href: string }[],
  maxCount: number,
): FooterLink[] {
  if (!Array.isArray(links)) {
    return defaultFooterLinks(fallback).slice(0, maxCount);
  }

  const parsed: FooterLink[] = [];
  for (const entry of links) {
    const label = asNonEmptyString((entry as SiteSettingsFooterLink | null)?.label);
    const href = asValidHref((entry as SiteSettingsFooterLink | null)?.href);
    if (!label || !href) continue;
    parsed.push({ label, href });
  }

  if (parsed.length === 0) {
    return defaultFooterLinks(fallback).slice(0, maxCount);
  }

  return parsed.slice(0, maxCount);
}

export const DEFAULT_SOCIAL_LINKS_CONFIG: SocialLinksConfig = {
  instagramProfileUrl: DEFAULT_INSTAGRAM_PROFILE_URL,
  instagramHandle: DEFAULT_INSTAGRAM_HANDLE,
  instagramPosts: [],
  whatsappUrl: DEFAULT_WHATSAPP_URL,
  footer: {
    instagramHeadingPrefix: DEFAULT_INSTAGRAM_HEADING_PREFIX,
    instagramFallbackCardLabel: DEFAULT_INSTAGRAM_FALLBACK_CARD_LABEL,
    backgroundImageUrl: undefined,
    logoImageUrl: '/logo.svg',
    logoAlt: 'Sourboo logo',
    tagline: DEFAULT_FOOTER_TAGLINE,
    primaryLinks: defaultFooterLinks(DEFAULT_PRIMARY_FOOTER_LINKS),
    secondaryLinks: defaultFooterLinks(DEFAULT_SECONDARY_FOOTER_LINKS),
    policyLinks: defaultFooterLinks(DEFAULT_POLICY_FOOTER_LINKS),
  },
};

export async function getSocialLinksConfig(revalidate = 300): Promise<SocialLinksConfig> {
  const client = revalidate === 0 ? sanityClient.withConfig({ useCdn: false }) : sanityClient;
  const fetchOptions = revalidate === 0 ? { cache: 'no-store' as const } : { next: { revalidate } };

  try {
    const data = await client.fetch<SiteSettingsQueryResult>(
      SITE_SETTINGS_QUERY,
      {},
      fetchOptions,
    );

    return {
      instagramProfileUrl: asValidUrlOrFallback(
        data?.instagramProfileUrl,
        DEFAULT_SOCIAL_LINKS_CONFIG.instagramProfileUrl,
      ),
      instagramHandle:
        asNonEmptyString(data?.instagramHandle) || DEFAULT_SOCIAL_LINKS_CONFIG.instagramHandle,
      instagramPosts: toInstagramPosts(data?.instagramFeedLinks),
      whatsappUrl: asValidUrlOrFallback(data?.whatsappUrl, DEFAULT_SOCIAL_LINKS_CONFIG.whatsappUrl),
      footer: {
        instagramHeadingPrefix:
          asNonEmptyString(data?.instagramHeadingPrefix) ||
          DEFAULT_SOCIAL_LINKS_CONFIG.footer.instagramHeadingPrefix,
        instagramFallbackCardLabel:
          asNonEmptyString(data?.instagramFallbackCardLabel) ||
          DEFAULT_SOCIAL_LINKS_CONFIG.footer.instagramFallbackCardLabel,
        backgroundImageUrl: toFooterBackgroundImageUrl(data?.footerBackgroundImage),
        logoImageUrl:
          toFooterLogoImageUrl(data?.footerLogoImage) ||
          DEFAULT_SOCIAL_LINKS_CONFIG.footer.logoImageUrl,
        logoAlt:
          asNonEmptyString(data?.footerLogoAlt) || DEFAULT_SOCIAL_LINKS_CONFIG.footer.logoAlt,
        tagline:
          asNonEmptyString(data?.footerTagline) || DEFAULT_SOCIAL_LINKS_CONFIG.footer.tagline,
        primaryLinks: toFooterLinks(
          data?.footerPrimaryLinks,
          DEFAULT_PRIMARY_FOOTER_LINKS,
          2,
        ),
        secondaryLinks: toFooterLinks(
          data?.footerSecondaryLinks,
          DEFAULT_SECONDARY_FOOTER_LINKS,
          2,
        ),
        policyLinks: toFooterLinks(
          data?.footerPolicyLinks,
          DEFAULT_POLICY_FOOTER_LINKS,
          5,
        ),
      },
    };
  } catch {
    return DEFAULT_SOCIAL_LINKS_CONFIG;
  }
}
