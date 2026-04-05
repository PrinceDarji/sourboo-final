'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

const REVEAL_RATIO = 0.34;

type FlavorWordOverride = {
  label?: string;
  bgSrc?: string;
};

type FlavorWordLayout = {
  wrapperClassName: string;
  itemClassName: string;
  textClassName: string;
  defaultLabel: string;
  defaultBgSrc: string;
};

function FlavorWord({
  wrapperClassName,
  itemClassName,
  textClassName,
  label,
  bgSrc,
}: {
  wrapperClassName: string;
  itemClassName: string;
  textClassName: string;
  label: string;
  bgSrc: string;
}) {
  return (
    <div className={wrapperClassName}>
      <div className={`about-flavor-word ${itemClassName} relative h-full w-full`}>
        <Image
          src={bgSrc}
          alt=""
          fill
          className="about-flavor-word-blob object-contain"
          aria-hidden="true"
        />
        <p className={`relative z-10 flex h-full w-full items-center justify-center ${textClassName}`}>
          {label}
        </p>
      </div>
    </div>
  );
}

const FLAVOR_WORD_LAYOUTS: FlavorWordLayout[] = [
  {
    wrapperClassName:
      'absolute left-3 top-4 w-[150px] aspect-[213/217] sm:w-[178px] md:left-8 md:top-6 lg:top-10 md:w-[228px]',
    itemClassName: 'about-flavor-word-1',
    textClassName: 'text-[52px] leading-none text-[#4e7805] font-coolvetica md:text-[86px]',
    defaultLabel: 'BOLD',
    defaultBgSrc: '/about/boldbg.svg',
  },
  {
    wrapperClassName:
      'absolute left-1/2 top-[42%] w-[220px] aspect-[303/153] -translate-x-1/2 sm:w-[252px] md:w-[336px]',
    itemClassName: 'about-flavor-word-2',
    textClassName: 'text-[58px] leading-none text-[#E61E6E] font-rascal md:text-[82px]',
    defaultLabel: 'spicy',
    defaultBgSrc: '/about/spicybg.svg',
  },
  {
    wrapperClassName:
      'absolute right-3 top-[55%] w-[188px] aspect-[264/186] sm:w-[210px] md:right-8 md:w-[240px]',
    itemClassName: 'about-flavor-word-3',
    textClassName: 'text-[54px] leading-none text-[#4e7805] font-rascal md:text-[74px]',
    defaultLabel: 'sour',
    defaultBgSrc: '/about/sourbg.svg',
  },
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type AboutFlavorWordsProps = {
  words?: FlavorWordOverride[];
};

export default function AboutFlavorWords({ words }: AboutFlavorWordsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const setVisible = (visible: boolean) => {
      container.classList.toggle('about-flavor-words-visible', visible);
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
          if (entry.intersectionRatio >= REVEAL_RATIO) {
            setVisible(true);
            observer.disconnect();
          }
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
    <div
      ref={containerRef}
      className="about-flavor-words relative left-1/2 mt-5 h-[300px] w-screen -translate-x-1/2 overflow-hidden md:mt-8 md:h-[390px]"
    >
      {FLAVOR_WORD_LAYOUTS.map((layout, index) => {
        const override = words?.[index];
        return (
          <FlavorWord
            key={layout.itemClassName}
            wrapperClassName={layout.wrapperClassName}
            itemClassName={layout.itemClassName}
            textClassName={layout.textClassName}
            label={asNonEmptyString(override?.label) || layout.defaultLabel}
            bgSrc={asNonEmptyString(override?.bgSrc) || layout.defaultBgSrc}
          />
        );
      })}
    </div>
  );
}
