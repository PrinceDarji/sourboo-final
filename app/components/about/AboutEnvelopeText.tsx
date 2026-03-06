'use client';

import { useLayoutEffect, useRef } from 'react';

type AboutEnvelopeTextProps = {
  heading: string;
  body: string;
  signoff: string;
};

const MIN_SCALE = 0.42;

export default function AboutEnvelopeText({ heading, body, signoff }: AboutEnvelopeTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let frameId = 0;

    const setScale = (scale: number) => {
      content.style.setProperty('--about-envelope-scale', scale.toString());
    };

    const fits = (scale: number) => {
      setScale(scale);
      const widthFits = content.scrollWidth <= container.clientWidth + 1;
      const heightFits = content.scrollHeight <= container.clientHeight + 1;
      return widthFits && heightFits;
    };

    const refit = () => {
      setScale(1);

      if (fits(1)) return;

      let low = MIN_SCALE;
      let high = 1;
      let best = MIN_SCALE;

      if (!fits(MIN_SCALE)) {
        setScale(MIN_SCALE);
        return;
      }

      for (let i = 0; i < 12; i += 1) {
        const mid = (low + high) / 2;
        if (fits(mid)) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      setScale(best);
    };

    const scheduleRefit = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        refit();
      });
    };

    const observer = new ResizeObserver(scheduleRefit);
    observer.observe(container);

    // Refit once layout/fonts settle on mount and on content change.
    scheduleRefit();
    if ('fonts' in document) {
      document.fonts.ready.then(scheduleRefit).catch(() => undefined);
    }

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [heading, body, signoff]);

  return (
    <div
      ref={containerRef}
      data-word-reveal-skip
      className="absolute left-[30%] top-[6%] h-[60%] w-[36%] overflow-hidden text-[#1f1a1a]"
    >
      <div ref={contentRef} className="about-envelope-text-content">
        <p className="about-envelope-text-heading">{heading}</p>
        <p className="about-envelope-text-body">{body}</p>
        <p className="about-envelope-text-signoff">{signoff}</p>
      </div>
    </div>
  );
}
