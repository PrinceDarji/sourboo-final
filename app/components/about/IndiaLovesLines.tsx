'use client';

import { useEffect, useRef } from 'react';

const REVEAL_RATIO = 0.3;

export default function IndiaLovesLines() {
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
    <div ref={containerRef} className="india-lines absolute inset-0 z-20">
      <div className="india-tongue-overlay">
        <div className="india-tongue-core">
          <div className="india-lines-item india-lines-item-1 india-callout india-callout-1">
            <span className="india-marker india-marker-square" aria-hidden="true" />
            <span className="india-callout-line" aria-hidden="true" />
            <p className="india-callout-text">India loves chaaat</p>
          </div>

          <div className="india-lines-item india-lines-item-2 india-callout india-callout-2">
            <p className="india-callout-text">India loves flavour</p>
            <span className="india-callout-line" aria-hidden="true" />
            <span className="india-marker india-marker-square" aria-hidden="true" />
          </div>

          <div className="india-lines-item india-lines-item-3 india-callout india-callout-3">
            <span className="india-marker india-marker-square" aria-hidden="true" />
            <span className="india-callout-line" aria-hidden="true" />
            <p className="india-callout-text">India loves that sour &amp; spicy hit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
