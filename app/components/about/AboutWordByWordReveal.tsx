'use client';

import { useTextReveal } from '../useTextReveal';

export default function AboutWordByWordReveal() {
  useTextReveal('main > section h1, main > section h2, main > section h3, main > section p');
  return null;
}
