'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const REVEAL_RATIO = 0.18;
const POSTER_STEP_MS = 1800;

const posterItems = [
  {
    id: 'post-cry-snack',
    src: '/home/postcrysnack.svg',
    alt: 'Post cry snack poster',
    className:
      'left-[1%] top-1 w-[57%] -rotate-[10deg] sm:left-[4%] sm:top-3 sm:w-[48%] md:left-[12%] md:-top-20 md:w-[36%]',
  },
  {
    id: 'late-night-munchies',
    src: '/home/latenightmunchies.svg',
    alt: 'Late night munchies poster',
    className:
      'right-[1%] top-0 w-[57%] rotate-[11deg] sm:right-[4%] sm:w-[48%] md:right-[8%] md:-top-36 md:w-[36%]',
  },
  {
    id: 'girl-dinner',
    src: '/home/girldinner.svg',
    alt: 'Girl dinner but sour poster',
    className:
      'left-[0%] top-[43%] w-[55%] sm:left-[3%] sm:top-[41%] sm:w-[46%] md:left-[18%] md:top-[45%] md:w-[34%]',
  },
  {
    id: 'hangover-detox',
    src: '/home/deskcravings.svg',
    alt: 'Hangover detox poster',
    className:
      'right-[3%] top-[46%] w-[54%] -rotate-[8deg] sm:right-[6%] sm:top-[44%] sm:w-[45%] md:right-[12%] md:top-[47%] md:w-[28%]',
  },
] as const;

export default function HomePosterPinboard() {
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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
  }, []);

  useEffect(() => {
    if (visiblePosterCount === 0 || visiblePosterCount >= posterItems.length) return;

    const timerId = window.setTimeout(() => {
      setVisiblePosterCount((current) => Math.min(current + 1, posterItems.length));
    }, POSTER_STEP_MS);

    return () => window.clearTimeout(timerId);
  }, [visiblePosterCount]);

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
                className="h-auto w-full object-contain"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
