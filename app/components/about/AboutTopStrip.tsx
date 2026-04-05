'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';

const REVEAL_RATIO = 0.35;

type TopStripImage = {
  src: string;
  alt?: string;
};

const DEFAULT_TOP_STRIP_IMAGES: TopStripImage[] = [
  { src: '/about/section-six-top-1.webp', alt: 'Sourboo event tasting moment' },
  { src: '/about/section-six-top-2.webp', alt: 'Sourboo event team shot' },
  { src: '/about/section-six-top-3.webp', alt: 'Sourboo event customer tasting moment' },
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type AboutTopStripProps = {
  items?: TopStripImage[];
};

export default function AboutTopStrip({ items }: AboutTopStripProps) {
  const images = useMemo(
    () =>
      DEFAULT_TOP_STRIP_IMAGES.map((defaultImage, index) => {
        const override = items?.[index];
        return {
          src: asNonEmptyString(override?.src) || defaultImage.src,
          alt: asNonEmptyString(override?.alt) || defaultImage.alt,
        };
      }),
    [items],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const setVisible = (visible: boolean) => {
      container.classList.toggle('about-top-strip-visible', visible);
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.intersectionRatio >= REVEAL_RATIO);
        });
      },
      {
        threshold: [0, REVEAL_RATIO],
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      setVisible(false);
    };
  }, []);

  return (
    <div ref={containerRef} className="about-top-strip relative -mt-10 left-1/2 w-screen -translate-x-1/2 md:mt-0">
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`about-top-strip-item about-top-strip-item-${index + 1} relative w-full overflow-hidden`}
        >
          <Image
            src={image.src}
            alt={image.alt || ''}
            fill
            sizes="(max-width: 1023px) 33vw, 33vw"
            quality={74}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
