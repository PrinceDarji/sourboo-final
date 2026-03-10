'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const EYES_SEQUENCE = [
  '/about/section-three-eyes.svg',
  '/about/eyes2.svg',
  '/about/eyes3.svg',
  '/about/section-three-eyes.svg',
] as const;

const STEP_DELAY_MS = 1000;
const LOOP_PAUSE_MS = 1000;
const REVEAL_THRESHOLD = 0.2;

export default function SectionThreeEyesSequence() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentEyeIndex, setCurrentEyeIndex] = useState(0);
  const isInViewRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const shouldRenderSmallerEyes = currentEyeIndex === 1 || currentEyeIndex === 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clearSequenceTimers = () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current = [];
    };

    const startSequence = () => {
      clearSequenceTimers();
      setCurrentEyeIndex(0);

      for (let index = 1; index < EYES_SEQUENCE.length; index += 1) {
        timersRef.current.push(window.setTimeout(() => setCurrentEyeIndex(index), STEP_DELAY_MS * index));
      }

      const cycleDuration = STEP_DELAY_MS * (EYES_SEQUENCE.length - 1) + LOOP_PAUSE_MS;
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 -top-20 h-[240px] w-[158%] -translate-x-1/2 md:-top-56 md:h-[820px] md:w-[320%]"
    >
      <Image
        src={EYES_SEQUENCE[currentEyeIndex]}
        alt="Eyes illustration"
        fill
        className={`object-contain transition-transform duration-300 ${
          shouldRenderSmallerEyes ? 'scale-64' : 'scale-94'
        }`}
      />
    </div>
  );
}
