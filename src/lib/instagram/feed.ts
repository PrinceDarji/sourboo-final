export type InstagramPost = {
  id: string;
  permalink: string;
  caption: string;
  mediaType: string;
  previewImageUrl?: string;
};

type InstagramApiChild = {
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
};

type InstagramApiMediaItem = {
  id?: string;
  permalink?: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  children?: { data?: InstagramApiChild[] };
};

type InstagramMediaResponse = {
  data?: InstagramApiMediaItem[];
};

const DEFAULT_PROFILE_URL = 'https://www.instagram.com/eatsourboo/';
const DEFAULT_HANDLE = '@sourboosnacks';

export const INSTAGRAM_PROFILE_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE_URL?.trim() || DEFAULT_PROFILE_URL;

export const INSTAGRAM_HANDLE =
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim() || DEFAULT_HANDLE;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getPreviewImageUrl(item: InstagramApiMediaItem): string | undefined {
  const thumbnail = asNonEmptyString(item.thumbnail_url);
  if (thumbnail) return thumbnail;

  const media = asNonEmptyString(item.media_url);
  if (media) return media;

  const children = Array.isArray(item.children?.data) ? item.children?.data : [];
  for (const child of children) {
    const childThumbnail = asNonEmptyString(child.thumbnail_url);
    if (childThumbnail) return childThumbnail;
    const childMedia = asNonEmptyString(child.media_url);
    if (childMedia) return childMedia;
  }

  return undefined;
}

function toInstagramPost(item: InstagramApiMediaItem): InstagramPost | null {
  const id = asNonEmptyString(item.id);
  const permalink = asNonEmptyString(item.permalink);

  if (!id || !permalink) {
    return null;
  }

  return {
    id,
    permalink,
    caption: asNonEmptyString(item.caption) || '',
    mediaType: asNonEmptyString(item.media_type) || 'IMAGE',
    previewImageUrl: getPreviewImageUrl(item),
  };
}

function getCredentials() {
  const userId =
    process.env.INSTAGRAM_IG_USER_ID?.trim() || process.env.INSTAGRAM_USER_ID?.trim();
  const accessToken =
    process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || process.env.INSTAGRAM_TOKEN?.trim();

  if (!userId || !accessToken) {
    return null;
  }

  return { userId, accessToken };
}

export async function getInstagramLatestPosts(limit = 3): Promise<InstagramPost[]> {
  const credentials = getCredentials();
  if (!credentials) {
    return [];
  }

  const { userId, accessToken } = credentials;
  const apiBase = process.env.INSTAGRAM_GRAPH_API_BASE?.trim() || 'https://graph.facebook.com/v22.0';
  const safeLimit = Math.max(1, Math.min(limit, 10));
  const fields =
    'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}';

  const url = `${apiBase}/${encodeURIComponent(userId)}/media?fields=${encodeURIComponent(fields)}&limit=${safeLimit}&access_token=${encodeURIComponent(accessToken)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as InstagramMediaResponse;
    const items = Array.isArray(payload.data) ? payload.data : [];

    return items
      .map(toInstagramPost)
      .filter((post): post is InstagramPost => Boolean(post))
      .slice(0, safeLimit);
  } catch {
    return [];
  }
}
