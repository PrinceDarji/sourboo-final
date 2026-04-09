'use client';

export const MOBILE_PERFORMANCE_MEDIA_QUERY = '(pointer: coarse), (max-width: 767px)';

const REDUCED_MOTION_MEDIA_QUERY = '(prefers-reduced-motion: reduce)';

function matchesMedia(query: string) {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
}

export function shouldSimplifyMotion() {
  return matchesMedia(REDUCED_MOTION_MEDIA_QUERY) || matchesMedia(MOBILE_PERFORMANCE_MEDIA_QUERY);
}

export function isMobilePerformanceMode() {
  return matchesMedia(MOBILE_PERFORMANCE_MEDIA_QUERY);
}
