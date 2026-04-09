'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { shouldSimplifyMotion } from '../clientMotionPreferences';

const REVEAL_RATIO = 0.18;
const POSTER_STEP_MS = 1800;

type PosterImageOverride = {
  src: string;
  alt?: string;
};

type PosterLayout = {
  id: string;
  fallbackSrc: string;
  fallbackAlt: string;
  sizes: string;
  className: string;
};

const posterLayouts: PosterLayout[] = [
  {
    id: 'post-cry-snack',
    fallbackSrc: '/home/postcrysnack.webp',
    fallbackAlt: 'Post cry snack poster',
    sizes: '(max-width: 768px) 57vw, 36vw',
    className:
      'left-[1%] top-1 w-[57%] -rotate-[10deg] sm:left-[4%] sm:top-3 sm:w-[48%] md:left-[12%] md:-top-20 md:w-[36%]',
  },
  {
    id: 'late-night-munchies',
    fallbackSrc: '/home/latenightmunchies.webp',
    fallbackAlt: 'Late night munchies poster',
    sizes: '(max-width: 768px) 57vw, 36vw',
    className:
      'right-[1%] top-0 w-[57%] rotate-[11deg] sm:right-[4%] sm:w-[48%] md:right-[8%] md:-top-36 md:w-[36%]',
  },
  {
    id: 'girl-dinner',
    fallbackSrc: '/home/girldinner.webp',
    fallbackAlt: 'Girl dinner but sour poster',
    sizes: '(max-width: 768px) 55vw, 34vw',
    className:
      'left-[0%] top-[43%] w-[55%] sm:left-[3%] sm:top-[41%] sm:w-[46%] md:left-[18%] md:top-[45%] md:w-[34%]',
  },
  {
    id: 'hangover-detox',
    fallbackSrc: '/home/deskcravings.webp',
    fallbackAlt: 'Hangover detox poster',
    sizes: '(max-width: 768px) 54vw, 28vw',
    className:
      'right-[3%] top-[46%] w-[54%] -rotate-[8deg] sm:right-[6%] sm:top-[44%] sm:w-[45%] md:right-[12%] md:top-[47%] md:w-[28%]',
  },
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type HomePosterPinboardProps = {
  items?: PosterImageOverride[];
};

export default function HomePosterPinboard({ items }: HomePosterPinboardProps) {
  const posterItems = useMemo(
    () =>
      posterLayouts.map((layout, index) => {
        const override = items?.[index];
        return {
          id: layout.id,
          src: asNonEmptyString(override?.src) || layout.fallbackSrc,
          alt: asNonEmptyString(override?.alt) || layout.fallbackAlt,
          sizes: layout.sizes,
          className: layout.className,
        };
      }),
    [items],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasStartedSequenceRef = useRef(false);
  const [visiblePosterCount, setVisiblePosterCount] = useState(0);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const startSequence = (showAllAtOnce = false) => {
      if (hasStartedSequenceRef.current) return;
      hasStartedSequenceRef.current = true;
      window.requestAnimationFrame(() => {
        if (showAllAtOnce) {
          setVisiblePosterCount(posterItems.length);
          return;
        }
        setVisiblePosterCount(1);
      });
    };

    if (shouldSimplifyMotion()) {
      startSequence(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      startSequence();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio < REVEAL_RATIO) return;
          startSequence();
          observer.disconnect();
        });
      },
      {
        threshold: [0, REVEAL_RATIO],
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [posterItems.length]);

  useEffect(() => {
    if (visiblePosterCount === 0 || visiblePosterCount >= posterItems.length) return;

    const timerId = window.setTimeout(() => {
      setVisiblePosterCount((current) => Math.min(current + 1, posterItems.length));
    }, POSTER_STEP_MS);

    return () => window.clearTimeout(timerId);
  }, [visiblePosterCount, posterItems.length]);

  return (
    <div ref={rootRef} className="relative mx-auto h-[520px] w-full sm:h-[760px] md:h-[900px] lg:h-[980px]">
      {posterItems.map((item, index) => {
        const isVisible = index < visiblePosterCount;

        return (
          <article key={item.id} className={`absolute ${item.className}`}>
            <span aria-hidden className={`home-poster-pin ${isVisible ? 'home-poster-pin-visible' : ''}`} />
            <div className={`home-poster-card ${isVisible ? 'home-poster-card-visible' : ''}`}>
              <Image
                src={item.src}
                alt={item.alt}
                width={700}
                height={980}
                sizes={item.sizes}
                quality={80}
                className="h-auto w-full object-contain"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
