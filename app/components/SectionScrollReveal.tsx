'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { shouldSimplifyMotion } from './clientMotionPreferences';

const SECTION_SELECTOR = 'main > section:not([data-scroll-reveal="off"])';
const BASE_CLASS = 'scroll-reveal';
const VISIBLE_CLASS = 'scroll-reveal-visible';
const DELAY_STEP_MS = 40;
const MAX_DELAY_MS = 160;
const INITIAL_VISIBLE_RATIO = 0.45;
const REVEAL_INTERSECTION_RATIO = 0.01;

function markVisible(section: HTMLElement) {
  section.classList.add(VISIBLE_CLASS);
}

export default function SectionScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    if (sections.length === 0) return;

    if (shouldSimplifyMotion()) {
      sections.forEach((section) => {
        section.classList.remove(BASE_CLASS, VISIBLE_CLASS);
        section.style.removeProperty('--scroll-reveal-delay');
      });
      return;
    }

    sections.forEach((section, index) => {
      section.classList.add(BASE_CLASS);
      section.classList.remove(VISIBLE_CLASS);
      section.style.setProperty('--scroll-reveal-delay', `${Math.min(index * DELAY_STEP_MS, MAX_DELAY_MS)}ms`);
    });

    const viewportHeight = window.innerHeight || 0;
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= viewportHeight * INITIAL_VISIBLE_RATIO) {
        markVisible(section);
      }
    });

    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => markVisible(section));
      return () => {
        sections.forEach((section) => {
          section.style.removeProperty('--scroll-reveal-delay');
        });
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;
          if (!entry.isIntersecting) return;
          markVisible(section);
          observer.unobserve(section);
        });
      },
      {
        threshold: [0, REVEAL_INTERSECTION_RATIO],
        rootMargin: '0px 0px -18% 0px',
      },
    );

    sections.forEach((section) => {
      if (section.classList.contains(VISIBLE_CLASS)) return;
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove(BASE_CLASS, VISIBLE_CLASS);
        section.style.removeProperty('--scroll-reveal-delay');
      });
    };
  }, [pathname]);

  return null;
}
