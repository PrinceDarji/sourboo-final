'use client';

/* eslint-disable @next/next/no-img-element */

import type { InstagramPostLink } from '@/src/lib/sanity/siteSettings';

type InstagramPostsStripProps = {
  profileUrl: string;
  handle: string;
  posts: InstagramPostLink[];
  headingPrefix: string;
  fallbackCardLabel: string;
};

const FALLBACK_CARD_COUNT = 3;

function captionPreview(caption: string) {
  const singleLine = caption.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 95) return singleLine;
  return `${singleLine.slice(0, 92)}...`;
}

export default function InstagramPostsStrip({
  profileUrl,
  handle,
  posts,
  headingPrefix,
  fallbackCardLabel,
}: InstagramPostsStripProps) {
  const visiblePosts = posts.slice(0, 3);
  const hasPosts = visiblePosts.length > 0;

  return (
    <section className="w-full pb-14 md:pb-18 md:pt-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        <p className="mx-auto max-w-[900px] text-center text-[clamp(2.1rem,4.5vw,5.1rem)] leading-[0.96] text-[#E61E6E] font-coolvetica">
          {headingPrefix}
          <br />
          {handle}
        </p>

        <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [touch-action:pan-x] md:mx-0 md:mt-10 md:grid md:grid-cols-3 md:gap-7 md:overflow-visible md:px-0 md:pb-0 md:[touch-action:auto]">
          {hasPosts
            ? visiblePosts.map((item, index) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="group block min-w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[20px] border-[3px] border-[#171717] bg-[#E6D8CA] transition-transform hover:scale-[1.01] md:min-w-0 md:max-w-none"
                  aria-label={`Open Instagram post ${index + 1}`}
                >
                  <div className="relative aspect-[4/5] w-full">
                    {item.backgroundImageUrl ? (
                      // Native img avoids next/image remote-domain config for Sanity CDN.
                      <img
                        src={item.backgroundImageUrl}
                        alt={item.caption ? captionPreview(item.caption) : `Instagram post ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-b from-[#F4E8DE] to-[#E5D5C6]" />
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111111]/72 via-[#111111]/24 to-transparent p-5 md:p-6">
                      <p className="text-[clamp(1.15rem,1.5vw,1.55rem)] leading-[1.08] text-white font-schoolbell">
                        {captionPreview(item.caption || 'watch on instagram')}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            : Array.from({ length: FALLBACK_CARD_COUNT }, (_, index) => (
                <a
                  key={`fallback-${index}`}
                  href={profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block min-w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[20px] border-[3px] border-[#171717] bg-[#E6D8CA] md:min-w-0 md:max-w-none"
                  aria-label="Open Instagram profile"
                >
                  <div className="flex aspect-[4/5] w-full items-center justify-center px-8 text-center text-[clamp(1.5rem,2.4vw,2.8rem)] leading-[1.04] text-[#201A17] font-schoolbell">
                    {fallbackCardLabel}
                  </div>
                </a>
              ))}
        </div>
      </div>
    </section>
  );
}
