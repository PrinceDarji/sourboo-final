'use client';

import { useEffect } from 'react';

const TARGET_SELECTOR = 'main > section h1, main > section h2, main > section h3, main > section p';
const LOW_OPACITY_CLASS = 'about-word-reveal-token';
const VISIBLE_CLASS = 'about-word-reveal-token-visible';

type RevealItem = {
  block: HTMLElement;
  words: HTMLSpanElement[];
  revealedCount: number;
  inView: boolean;
  entryTop: number | null;
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

function revealAll(items: RevealItem[]) {
  items.forEach((item) => {
    item.words.forEach((word) => word.classList.add(VISIBLE_CLASS));
    item.revealedCount = item.words.length;
  });
}

function resetItem(item: RevealItem) {
  item.words.forEach((word) => word.classList.remove(VISIBLE_CLASS));
  item.revealedCount = 0;
}

function revealByScroll(items: RevealItem[]) {
  const viewportHeight = window.innerHeight || 1;

  items.forEach((item) => {
    if (item.words.length === 0) return;

    const rect = item.block.getBoundingClientRect();
    const activeTop = viewportHeight * 0.92;
    const activeBottom = viewportHeight * 0.08;
    const isInActiveWindow = rect.top < activeTop && rect.bottom > activeBottom;

    if (!isInActiveWindow) {
      if (item.inView) {
        resetItem(item);
      }
      item.inView = false;
      item.entryTop = null;
      return;
    }

    if (!item.inView) {
      item.inView = true;
      item.entryTop = rect.top;
      resetItem(item);
    }

    if (item.entryTop === null) {
      item.entryTop = rect.top;
    }

    const traveled = Math.abs(rect.top - item.entryTop);
    const revealDistance = Math.max(120, viewportHeight * 0.45 + rect.height * 0.25);
    const progress = Math.max(0, Math.min(1, traveled / revealDistance));
    const nextVisible = Math.min(item.words.length, Math.floor(progress * item.words.length));

    if (nextVisible > item.revealedCount) {
      for (let index = item.revealedCount; index < nextVisible; index += 1) {
        item.words[index]?.classList.add(VISIBLE_CLASS);
      }
      item.revealedCount = nextVisible;
    }
  });
}

export default function AboutWordByWordReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(TARGET_SELECTOR)).filter(
      (element) => !shouldSkipElement(element),
    );

    const items: RevealItem[] = targets
      .map((element) => ({
        block: element,
        words: wrapWords(element),
        revealedCount: 0,
        inView: false,
        entryTop: null,
      }))
      .filter((item) => item.words.length > 0);

    if (items.length === 0) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      revealAll(items);
      return;
    }

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
