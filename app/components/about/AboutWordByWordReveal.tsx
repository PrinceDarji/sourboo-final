'use client';

import { useEffect } from 'react';
import { shouldSimplifyMotion } from '../clientMotionPreferences';

const TARGET_SELECTOR = 'main > section h1, main > section h2, main > section h3, main > section p';
const LOW_OPACITY_CLASS = 'about-word-reveal-token';
const VISIBLE_CLASS = 'about-word-reveal-token-visible';

type RevealItem = {
  block: HTMLElement;
  words: HTMLSpanElement[];
  revealedCount: number;
  maxProgress: number;
};

function shouldSkipElement(element: HTMLElement): boolean {
  return Boolean(
    element.closest('.about-flavor-word') ||
      element.classList.contains('india-callout-text') ||
      element.closest('[data-word-reveal-skip]'),
  );
}

function tokenizeTextNode(node: Text): (string | { word: string })[] {
  return (node.textContent ?? '')
    .split(/(\s+)/)
    .filter((token) => token.length > 0)
    .map((token) => (/^\s+$/u.test(token) ? token : { word: token }));
}

function wrapWords(element: HTMLElement): HTMLSpanElement[] {
  if (element.dataset.wordRevealPrepared === 'true') {
    return Array.from(element.querySelectorAll<HTMLSpanElement>(`.${LOW_OPACITY_CLASS}`));
  }

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const currentNode = walker.currentNode as Text;
    if (!currentNode.textContent?.trim()) continue;

    const parent = currentNode.parentElement;
    if (!parent) continue;
    if (parent.closest('[data-word-reveal-skip]')) continue;
    if (parent.classList.contains(LOW_OPACITY_CLASS)) continue;

    textNodes.push(currentNode);
  }

  textNodes.forEach((textNode) => {
    const tokens = tokenizeTextNode(textNode);
    const fragment = document.createDocumentFragment();

    tokens.forEach((token) => {
      if (typeof token === 'string') {
        fragment.appendChild(document.createTextNode(token));
        return;
      }

      const span = document.createElement('span');
      span.className = LOW_OPACITY_CLASS;
      span.textContent = token.word;
      fragment.appendChild(span);
    });

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  element.dataset.wordRevealPrepared = 'true';
  return Array.from(element.querySelectorAll<HTMLSpanElement>(`.${LOW_OPACITY_CLASS}`));
}

function revealByScroll(items: RevealItem[]) {
  const viewportHeight = window.innerHeight || 1;
  const revealStart = viewportHeight * 0.94;
  const revealEnd = viewportHeight * 0.28;
  const revealRange = Math.max(1, revealStart - revealEnd);
  let canRevealNext = true;

  items.forEach((item) => {
    if (item.words.length === 0) return;
    if (!canRevealNext) return;

    const rect = item.block.getBoundingClientRect();
    let progress = (revealStart - rect.top) / revealRange;
    if (rect.bottom <= revealEnd) {
      progress = 1;
    }
    progress = Math.max(0, Math.min(1, progress));

    if (progress > item.maxProgress) {
      item.maxProgress = progress;
    }

    const nextVisible = Math.min(item.words.length, Math.ceil(item.maxProgress * item.words.length));

    if (nextVisible > item.revealedCount) {
      for (let index = item.revealedCount; index < nextVisible; index += 1) {
        item.words[index]?.classList.add(VISIBLE_CLASS);
      }
      item.revealedCount = nextVisible;
    }

    if (item.revealedCount < item.words.length) {
      canRevealNext = false;
    }
  });
}

export default function AboutWordByWordReveal() {
  useEffect(() => {
    if (shouldSimplifyMotion()) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)).filter(
      (element) => !shouldSkipElement(element),
    );

    const items: RevealItem[] = targets
      .map((element) => {
        const words = wrapWords(element);
        words.forEach((word) => word.classList.remove(VISIBLE_CLASS));
        return {
          block: element,
          words,
          revealedCount: 0,
          maxProgress: 0,
        };
      })
      .filter((item) => item.words.length > 0);

    if (items.length === 0) return;

    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        revealByScroll(items);
      });
    };

    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return null;
}
