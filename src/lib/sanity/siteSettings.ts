import { sanityClient } from '@/src/lib/sanity/client';
import { urlFor } from '@/src/lib/sanity/image';

const DEFAULT_INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/eatsourboo/';
const DEFAULT_INSTAGRAM_HANDLE = '@sourboosnacks';
const DEFAULT_WHATSAPP_URL = 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN';
const DEFAULT_INSTAGRAM_CARD_LABEL = 'watch on instagram';

export type InstagramPostLink = {
  id: string;
  permalink: string;
  caption: string;
  backgroundImageUrl?: string;
};

export type SocialLinksConfig = {
  instagramProfileUrl: string;
  instagramHandle: string;
  instagramPosts: InstagramPostLink[];
  whatsappUrl: string;
};

type SiteSettingsQueryLink = {
  _key?: string;
  label?: string;
  url?: string;
  backgroundImage?: unknown;
};

type SiteSettingsQueryResult = {
  instagramProfileUrl?: string;
  instagramHandle?: string;
  whatsappUrl?: string;
  instagramFeedLinks?: SiteSettingsQueryLink[];
} | null;

const SITE_SETTINGS_QUERY = `coalesce(
  *[_id == "drafts.siteSettings"][0],
  *[_id == "siteSettings"][0],
  *[_type == "siteSettings"] | order(_updatedAt desc)[0]
){
  instagramProfileUrl,
  instagramHandle,
  whatsappUrl,
  instagramFeedLinks[]{
    _key,
    label,
    url,
    backgroundImage
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

function toBackgroundImageUrl(source: unknown): string | undefined {
  if (!source) return undefined;
  try {
    return urlFor(source).width(960).height(1200).fit('crop').quality(80).url();
  } catch {
    return undefined;
  }
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

export const DEFAULT_SOCIAL_LINKS_CONFIG: SocialLinksConfig = {
  instagramProfileUrl: DEFAULT_INSTAGRAM_PROFILE_URL,
  instagramHandle: DEFAULT_INSTAGRAM_HANDLE,
  instagramPosts: [],
  whatsappUrl: DEFAULT_WHATSAPP_URL,
};

export async function getSocialLinksConfig(revalidate = 300): Promise<SocialLinksConfig> {
  try {
    const data = await sanityClient.fetch<SiteSettingsQueryResult>(
      SITE_SETTINGS_QUERY,
      {},
      { next: { revalidate } },
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
    };
  } catch {
    return DEFAULT_SOCIAL_LINKS_CONFIG;
  }
}
