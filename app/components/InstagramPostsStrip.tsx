'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

type InstagramPost = {
  id: string;
  permalink: string;
  caption: string;
  mediaType: string;
  previewImageUrl?: string;
};

type LatestPostsResponse = {
  posts?: InstagramPost[];
};

const FALLBACK_CARD_COUNT = 3;
const DEFAULT_PROFILE_URL = 'https://www.instagram.com/eatsourboo/';
const DEFAULT_HANDLE = '@sourboosnacks';
const INSTAGRAM_PROFILE_URL = process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE_URL?.trim() || DEFAULT_PROFILE_URL;
const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.trim() || DEFAULT_HANDLE;

function captionPreview(caption: string) {
  const singleLine = caption.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= 95) return singleLine;
  return `${singleLine.slice(0, 92)}...`;
}

export default function InstagramPostsStrip() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      try {
        const response = await fetch('/api/instagram/latest?limit=3', {
          method: 'GET',
          cache: 'no-store',
        });
        if (!response.ok) return;

        const payload = (await response.json()) as LatestPostsResponse;
        if (!active || !Array.isArray(payload.posts)) return;

        setPosts(payload.posts);
      } catch {
        // Keep fallback cards on fetch failure.
      }
    }

    loadPosts();
    return () => {
      active = false;
    };
  }, []);

  const hasPosts = posts.length > 0;

  return (
    <section className="w-full pb-14 pt-12 md:pb-18 md:pt-14">
      <div className="mx-auto w-full max-w-[1500px] px-4 md:px-8">
        <p className="mx-auto max-w-[900px] text-center text-[clamp(2.1rem,4.5vw,5.1rem)] leading-[0.96] text-[#E61E6E] font-coolvetica">
          get to know
          <br />
          {INSTAGRAM_HANDLE}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:grid-cols-3 md:gap-7">
          {hasPosts
            ? posts.map((item, index) => (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-[20px] border-[3px] border-[#171717] bg-[#E6D8CA] transition-transform hover:scale-[1.01]"
                  aria-label={`Open Instagram post ${index + 1}`}
                >
                  <div className="relative aspect-[4/5] w-full">
                    {item.previewImageUrl ? (
                      // Use native img here so remote Instagram domains don't require next/image config.
                      <img
                        src={item.previewImageUrl}
                        alt={item.caption ? captionPreview(item.caption) : `Instagram post ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#EEDBC8] px-6 text-center text-[clamp(1.2rem,1.4vw,1.8rem)] leading-[1.05] text-[#201A17] font-schoolbell">
                        Open on Instagram
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111111]/78 via-[#111111]/24 to-transparent p-4">
                      <p className="text-[clamp(1.05rem,1.2vw,1.35rem)] leading-[1.05] text-white font-schoolbell">
                        {item.caption ? captionPreview(item.caption) : 'watch on instagram'}
                      </p>
                    </div>
                  </div>
                </a>
              ))
            : Array.from({ length: FALLBACK_CARD_COUNT }, (_, index) => (
                <a
                  key={`fallback-${index}`}
                  href={INSTAGRAM_PROFILE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-[20px] border-[3px] border-[#171717] bg-[#E6D8CA]"
                  aria-label="Open Instagram profile"
                >
                  <div className="flex aspect-[4/5] w-full items-center justify-center px-8 text-center text-[clamp(1.5rem,2.4vw,2.8rem)] leading-[1.04] text-[#201A17] font-schoolbell">
                    connect instagram feed
                  </div>
                </a>
              ))}
        </div>
      </div>
    </section>
  );
}
