'use client';

import { useEffect, useState } from 'react';
import SiteFooterClient from '@/app/components/SiteFooterClient';
import type { InstagramPostLink, SocialLinksConfig } from '@/src/lib/sanity/siteSettings';

const DEFAULT_SOCIAL_LINKS_CONFIG: SocialLinksConfig = {
  instagramProfileUrl: 'https://www.instagram.com/eatsourboo/',
  instagramHandle: '@sourboosnacks',
  instagramPosts: [],
  whatsappUrl: 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN',
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizePosts(value: unknown): InstagramPostLink[] {
  if (!Array.isArray(value)) return [];

  const posts: InstagramPostLink[] = [];
  for (const entry of value) {
    const id = asNonEmptyString((entry as { id?: unknown })?.id);
    const permalink = asNonEmptyString((entry as { permalink?: unknown })?.permalink);
    const caption = asNonEmptyString((entry as { caption?: unknown })?.caption);
    const backgroundImageUrl = asNonEmptyString(
      (entry as { backgroundImageUrl?: unknown })?.backgroundImageUrl,
    );

    if (!id || !permalink) continue;

    posts.push({
      id,
      permalink,
      caption: caption || 'watch on instagram',
      backgroundImageUrl,
    });
  }

  return posts.slice(0, 3);
}

function sanitizePayload(value: unknown): SocialLinksConfig {
  const payload = (value as Partial<SocialLinksConfig> | null) || null;

  return {
    instagramProfileUrl:
      asNonEmptyString(payload?.instagramProfileUrl) || DEFAULT_SOCIAL_LINKS_CONFIG.instagramProfileUrl,
    instagramHandle: asNonEmptyString(payload?.instagramHandle) || DEFAULT_SOCIAL_LINKS_CONFIG.instagramHandle,
    instagramPosts: sanitizePosts(payload?.instagramPosts),
    whatsappUrl: asNonEmptyString(payload?.whatsappUrl) || DEFAULT_SOCIAL_LINKS_CONFIG.whatsappUrl,
  };
}

export default function SiteFooter() {
  const [social, setSocial] = useState<SocialLinksConfig>(DEFAULT_SOCIAL_LINKS_CONFIG);

  useEffect(() => {
    let active = true;

    async function loadSocialLinks() {
      try {
        const response = await fetch('/api/site-settings', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) return;

        const payload = (await response.json()) as unknown;
        if (!active) return;

        setSocial(sanitizePayload(payload));
      } catch {
        // Keep defaults when settings cannot be loaded.
      }
    }

    void loadSocialLinks();

    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteFooterClient
      instagram={{
        profileUrl: social.instagramProfileUrl,
        handle: social.instagramHandle,
        posts: social.instagramPosts,
      }}
    />
  );
}
