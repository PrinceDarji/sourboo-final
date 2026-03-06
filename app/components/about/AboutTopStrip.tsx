'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const REVEAL_RATIO = 0.35;

const TOP_STRIP_IMAGES = [
  { src: '/about/section-six-top-1.JPEG', alt: 'Sourboo event tasting moment' },
  { src: '/about/section-six-top-2.JPEG', alt: 'Sourboo event team shot' },
  { src: '/about/section-six-top-3.JPEG', alt: 'Sourboo event customer tasting moment' },
] as const;

export default function AboutTopStrip() {
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
    <div ref={containerRef} className="about-top-strip left-1/2 w-screen -translate-x-1/2">
      {TOP_STRIP_IMAGES.map((image, index) => (
        <div
          key={image.src}
          className={`about-top-strip-item about-top-strip-item-${index + 1} relative w-full overflow-hidden`}
        >
          <Image src={image.src} alt={image.alt} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
