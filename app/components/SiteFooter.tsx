'use client';

import { useEffect, useState } from 'react';
import SiteFooterClient from '@/app/components/SiteFooterClient';
import {
  DEFAULT_SOCIAL_LINKS_CONFIG,
  type FooterContent,
  type FooterLink,
  type InstagramPostLink,
  type SocialLinksConfig,
} from '@/src/lib/sanity/siteSettings';

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asValidUrlOrFallback(value: unknown, fallback: string): string {
  const maybeUrl = asNonEmptyString(value);
  if (!maybeUrl) return fallback;

  try {
    return new URL(maybeUrl).toString();
  } catch {
    return fallback;
  }
}

function asValidHref(value: unknown): string | undefined {
  const maybeHref = asNonEmptyString(value);
  if (!maybeHref) return undefined;
  if (maybeHref.startsWith('/')) return maybeHref;

  try {
    return new URL(maybeHref).toString();
  } catch {
    return undefined;
  }
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

function sanitizeFooterLinks(value: unknown, fallback: FooterLink[], maxCount: number): FooterLink[] {
  if (!Array.isArray(value)) return fallback.slice(0, maxCount);

  const links: FooterLink[] = [];
  for (const entry of value) {
    const label = asNonEmptyString((entry as { label?: unknown })?.label);
    const href = asValidHref((entry as { href?: unknown })?.href);
    if (!label || !href) continue;
    links.push({ label, href });
  }

  if (links.length === 0) return fallback.slice(0, maxCount);
  return links.slice(0, maxCount);
}

function sanitizeFooter(value: unknown): FooterContent {
  const payload = (value as Partial<FooterContent> | null) || null;

  return {
    instagramHeadingPrefix:
      asNonEmptyString(payload?.instagramHeadingPrefix) ||
      DEFAULT_SOCIAL_LINKS_CONFIG.footer.instagramHeadingPrefix,
    instagramFallbackCardLabel:
      asNonEmptyString(payload?.instagramFallbackCardLabel) ||
      DEFAULT_SOCIAL_LINKS_CONFIG.footer.instagramFallbackCardLabel,
    backgroundImageUrl: asNonEmptyString(payload?.backgroundImageUrl),
    logoImageUrl:
      asNonEmptyString(payload?.logoImageUrl) || DEFAULT_SOCIAL_LINKS_CONFIG.footer.logoImageUrl,
    logoAlt: asNonEmptyString(payload?.logoAlt) || DEFAULT_SOCIAL_LINKS_CONFIG.footer.logoAlt,
    tagline: asNonEmptyString(payload?.tagline) || DEFAULT_SOCIAL_LINKS_CONFIG.footer.tagline,
    primaryLinks: sanitizeFooterLinks(
      payload?.primaryLinks,
      DEFAULT_SOCIAL_LINKS_CONFIG.footer.primaryLinks,
      2,
    ),
    secondaryLinks: sanitizeFooterLinks(
      payload?.secondaryLinks,
      DEFAULT_SOCIAL_LINKS_CONFIG.footer.secondaryLinks,
      2,
    ),
    policyLinks: sanitizeFooterLinks(
      payload?.policyLinks,
      DEFAULT_SOCIAL_LINKS_CONFIG.footer.policyLinks,
      5,
    ),
  };
}

function sanitizePayload(value: unknown): SocialLinksConfig {
  const payload = (value as Partial<SocialLinksConfig> | null) || null;

  return {
    instagramProfileUrl: asValidUrlOrFallback(
      payload?.instagramProfileUrl,
      DEFAULT_SOCIAL_LINKS_CONFIG.instagramProfileUrl,
    ),
    instagramHandle: asNonEmptyString(payload?.instagramHandle) || DEFAULT_SOCIAL_LINKS_CONFIG.instagramHandle,
    instagramPosts: sanitizePosts(payload?.instagramPosts),
    whatsappUrl: asValidUrlOrFallback(payload?.whatsappUrl, DEFAULT_SOCIAL_LINKS_CONFIG.whatsappUrl),
    footer: sanitizeFooter(payload?.footer),
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
        headingPrefix: social.footer.instagramHeadingPrefix,
        fallbackCardLabel: social.footer.instagramFallbackCardLabel,
      }}
      footer={{
        backgroundImageUrl: social.footer.backgroundImageUrl,
        logoImageUrl: social.footer.logoImageUrl,
        logoAlt: social.footer.logoAlt,
        tagline: social.footer.tagline,
        primaryLinks: social.footer.primaryLinks,
        secondaryLinks: social.footer.secondaryLinks,
        policyLinks: social.footer.policyLinks,
      }}
    />
  );
}
