'use client';

import { useEffect } from 'react';
import { shouldSimplifyMotion } from './clientMotionPreferences';

/** Animate existing elements without rewriting React-owned text or attributes. */
export function useTextReveal(selector: string) {
  useEffect(() => {
    if (shouldSimplifyMotion() || !('IntersectionObserver' in window)) return;
    const seen = new WeakSet<Element>();
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (shouldSimplifyMotion()) continue;
        const spans = Array.from(entry.target.querySelectorAll('span')).filter(
          (span) => !span.children.length && Boolean(span.textContent?.trim()),
        );
        const targets = spans.length ? spans : [entry.target];
        targets.forEach((target, index) => {
          if (typeof target.animate !== 'function') return;
          const animation = target.animate([{ opacity: 0.35 }, { opacity: 1 }], {
            duration: 450,
            delay: Math.min(index * 18, 350),
            easing: 'ease-out',
          });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      }
    }, { threshold: 0.01 });

    const discover = () => {
      for (const target of document.querySelectorAll(selector)) {
        if (seen.has(target)) continue;
        seen.add(target);
        if (target.closest('.about-flavor-word, .india-callout-text, [data-word-reveal-skip]')) continue;
        observer.observe(target);
      }
    };
    discover();
    // Streaming can insert marketing content after this effect mounts.
    // Observe insertions only; never modify the DOM or hydration attributes.
    const insertions = new MutationObserver(discover);
    insertions.observe(document.body, { childList: true, subtree: true });
    return () => {
      insertions.disconnect();
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [selector]);
}
