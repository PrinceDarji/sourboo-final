'use client';

import { useEffect, useRef } from 'react';

const REVEAL_RATIO = 0.3;

const DEFAULT_LINES = [
  'India loves chaaat',
  'India loves flavour',
  'India loves that sour & spicy hit',
] as const;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNoWrapLabel(value: string): string {
  return value.replace(/\s+/g, '\u00A0');
}

type IndiaLovesLinesProps = {
  lines?: string[];
};

export default function IndiaLovesLines({ lines }: IndiaLovesLinesProps) {
  const line1 = asNonEmptyString(lines?.[0]) || DEFAULT_LINES[0];
  const line2 = asNonEmptyString(lines?.[1]) || DEFAULT_LINES[1];
  const line3 = asNonEmptyString(lines?.[2]) || DEFAULT_LINES[2];
  const label1 = asNoWrapLabel(line1);
  const label2 = asNoWrapLabel(line2);
  const label3 = asNoWrapLabel(line3);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const setVisible = (visible: boolean) => {
      container.classList.toggle('india-lines-visible', visible);
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
        rootMargin: '0px 0px -12% 0px',
      },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      setVisible(false);
    };
  }, []);

  return (
    <div ref={containerRef} className="india-lines absolute inset-0 z-20" data-word-reveal-skip>
      <div className="india-tongue-overlay">
        <div className="india-tongue-core">
          <div className="india-lines-item india-lines-item-1 india-callout india-callout-1">
            <span className="india-marker india-marker-square" aria-hidden="true" />
            <span className="india-callout-line" aria-hidden="true" />
            <span className="india-callout-text" aria-label={line1}>
              {label1}
            </span>
          </div>

          <div className="india-lines-item india-lines-item-2 india-callout india-callout-2">
            <span className="india-callout-text" aria-label={line2}>
              {label2}
            </span>
            <span className="india-callout-line" aria-hidden="true" />
            <span className="india-marker india-marker-square" aria-hidden="true" />
          </div>

          <div className="india-lines-item india-lines-item-3 india-callout india-callout-3">
            <span className="india-marker india-marker-square" aria-hidden="true" />
            <span className="india-callout-line" aria-hidden="true" />
            <span className="india-callout-text" aria-label={line3}>
              {label3}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
