'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_EYES_SEQUENCE = [
  '/about/section-three-eyes.webp',
  '/about/eyes2.webp',
  '/about/eyes3.webp',
  '/about/section-three-eyes.webp',
];

const STEP_DELAY_MS = 1000;
const LOOP_PAUSE_MS = 1000;
const REVEAL_THRESHOLD = 0.2;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type SectionThreeEyesSequenceProps = {
  imageSrcs?: string[];
};

export default function SectionThreeEyesSequence({ imageSrcs }: SectionThreeEyesSequenceProps) {
  const eyesSequence = useMemo(
    () =>
      DEFAULT_EYES_SEQUENCE.map(
        (defaultSrc, index) => asNonEmptyString(imageSrcs?.[index]) || defaultSrc,
      ),
    [imageSrcs],
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentEyeIndex, setCurrentEyeIndex] = useState(0);
  const isInViewRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const shouldRenderSmallerEyes = currentEyeIndex === 1 || currentEyeIndex === 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const clearSequenceTimers = () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };

    const startSequence = () => {
      clearSequenceTimers();
      setCurrentEyeIndex(0);

      for (let index = 1; index < eyesSequence.length; index += 1) {
        timersRef.current.push(window.setTimeout(() => setCurrentEyeIndex(index), STEP_DELAY_MS * index));
      }

      const cycleDuration = STEP_DELAY_MS * (eyesSequence.length - 1) + LOOP_PAUSE_MS;
      timersRef.current.push(
        window.setTimeout(() => {
          if (isInViewRef.current) {
            startSequence();
          }
        }, cycleDuration),
      );
    };

    if (!('IntersectionObserver' in window)) {
      startSequence();
      return () => {
        clearSequenceTimers();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio >= REVEAL_THRESHOLD;

          if (isVisible && !isInViewRef.current) {
            isInViewRef.current = true;
            startSequence();
          }

          if (!isVisible && isInViewRef.current) {
            isInViewRef.current = false;
            clearSequenceTimers();
            setCurrentEyeIndex(0);
          }
        });
      },
      {
        threshold: [0, REVEAL_THRESHOLD],
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      clearSequenceTimers();
    };
  }, [eyesSequence.length]);

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 -top-20 h-[240px] w-[158%] -translate-x-1/2 md:-top-56 md:h-[820px] md:w-[320%]"
    >
      <Image
        src={eyesSequence[currentEyeIndex] || eyesSequence[0]}
        alt="Eyes illustration"
        fill
        sizes="(max-width: 768px) 158vw, 320vw"
        quality={78}
        className={`object-contain transition-transform duration-300 ${
          shouldRenderSmallerEyes ? 'scale-64' : 'scale-94'
        }`}
      />
    </div>
  );
}
