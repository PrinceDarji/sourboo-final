'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { shouldSimplifyMotion } from './clientMotionPreferences';

const SECTION_SELECTOR = 'main > section:not([data-scroll-reveal="off"])';

export default function SectionScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (shouldSimplifyMotion() || !('IntersectionObserver' in window)) return;

    const animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (shouldSimplifyMotion() || typeof entry.target.animate !== 'function') continue;
        // Web Animations do not alter React-owned class/style attributes.
        // Never hide content while a streamed boundary is still hydrating.
        animations.push(entry.target.animate([
          { opacity: 0, transform: 'translate3d(0, 48px, 0)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        ], { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }));
      }
    }, { threshold: 0.01 });

    for (const section of document.querySelectorAll<HTMLElement>(SECTION_SELECTOR)) {
      // Above-the-fold content stays immediately visible.
      if (section.getBoundingClientRect().top >= window.innerHeight) observer.observe(section);
    }

    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };
  }, [pathname]);

  return null;
}
