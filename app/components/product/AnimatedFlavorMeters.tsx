'use client';

import { useEffect, useRef, useState } from 'react';
import { shouldSimplifyMotion } from '../clientMotionPreferences';

export type FlavorMeter = {
  label: string;
  fill: number;
  showTail?: boolean;
};

const REVEAL_THRESHOLD = 0.3;

function AnimatedPixelMeter({
  label,
  fill,
  isActive,
  showTail = true,
}: {
  label: string;
  fill: number;
  isActive: boolean;
  showTail?: boolean;
}) {
  const safeFill = Math.max(0, Math.min(fill, 100));

  return (
    <div>
      <p className="mb-1 text-center text-[clamp(1.65rem,2.4vw,2.6rem)] leading-none text-[#E61E6E] font-rascal">
        {label}
      </p>
      <div className="relative h-4 overflow-hidden border border-[#E61E6E]/40 bg-[#FFE6F2] shadow-[inset_0_0_0_1px_#FFC7DE] md:h-5">
        <div
          className="absolute inset-y-0 left-0 bg-[#E61E6E] transition-[width] ease-out"
          style={{
            width: `${isActive ? safeFill : 0}%`,
            transitionDuration: '1700ms',
            backgroundImage: 'repeating-linear-gradient(90deg, #E61E6E 0 8px, #D8156A 8px 16px)',
            imageRendering: 'pixelated',
          }}
        />
        {showTail ? (
          <div
            className="absolute inset-y-0 right-0 w-[18%]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #FFD8EA 0 3px, #FFF2F8 3px 6px)',
              imageRendering: 'pixelated',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

const DEFAULT_CLASS_NAME = 'space-y-4 md:space-y-5';

export default function AnimatedFlavorMeters({
  meters,
  className,
}: {
  meters: FlavorMeter[];
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) return;

    const section = sectionRef.current;
    if (!section) return;

    if (shouldSimplifyMotion()) {
      const frameId = requestAnimationFrame(() => {
        setIsActive(true);
      });
      return () => cancelAnimationFrame(frameId);
    }

    if (!('IntersectionObserver' in window)) {
      const frameId = requestAnimationFrame(() => {
        setIsActive(true);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.intersectionRatio < REVEAL_THRESHOLD) return;
          setIsActive(true);
          observer.disconnect();
        });
      },
      {
        threshold: [0, REVEAL_THRESHOLD],
        rootMargin: '0px 0px -6% 0px',
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [isActive]);

  return (
    <div ref={sectionRef} className={className ?? DEFAULT_CLASS_NAME}>
      {meters.map((meter) => (
        <AnimatedPixelMeter
          key={meter.label}
          label={meter.label}
          fill={meter.fill}
          showTail={meter.showTail}
          isActive={isActive}
        />
      ))}
    </div>
  );
}
