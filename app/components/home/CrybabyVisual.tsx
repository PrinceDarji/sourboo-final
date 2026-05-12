'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { shouldSimplifyMotion } from '../clientMotionPreferences';

type CrybabyVisualProps = {
  mirrored?: boolean;
  rotateClass: string;
  fluidPositionClass: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function CrybabyVisual({
  mirrored = false,
  rotateClass,
  fluidPositionClass,
  imageSrc = '/home/readmyrant.webp',
  imageAlt = 'crybaby challenge visual placeholder',
}: CrybabyVisualProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const reveal = () => {
      setHasEnteredView(true);
    };

    if (shouldSimplifyMotion()) {
      reveal();
      return;
    }

    const parentSection = node.closest('section');
    if (parentSection) {
      if (parentSection.classList.contains('scroll-reveal-visible')) {
        reveal();
        return;
      }

      const classObserver = new MutationObserver(() => {
        if (!parentSection.classList.contains('scroll-reveal-visible')) return;
        reveal();
        classObserver.disconnect();
      });

      classObserver.observe(parentSection, { attributes: true, attributeFilter: ['class'] });
      return () => classObserver.disconnect();
    }

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        });
      },
      {
        threshold: 0.25,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={`relative w-[min(74vw,420px)] aspect-[4/5] md:w-[min(90vw,560px)] ${rotateClass}`}>
      <div className={`relative h-full w-full overflow-hidden rounded-[10px]  ${mirrored ? '-scale-x-100' : ''}`}>
        <div className={`absolute inset-0 ${hasEnteredView ? 'home-readmyrant-slide-in-active' : 'home-readmyrant-slide-in-start'}`}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 74vw, 560px"
            quality={78}
            className="object-cover"
          />
        </div>
        <p
          className={`absolute z-20 text-[clamp(0.95rem,1.8vw,1.4rem)] leading-none tracking-[0.22em] text-[#F2E84A] font-coolvetica ${fluidPositionClass}`}
        >
          the sour baby
        </p>

        <span className="absolute bottom-[31%] left-1/2 z-30 -translate-x-1/2 text-[clamp(3.2rem,8vw,7rem)] leading-none text-[#EA2A2A] blur-[0.5px]">
          ✹
        </span>
      </div>
    </div>
  );
}
