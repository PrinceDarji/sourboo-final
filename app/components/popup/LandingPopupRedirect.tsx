'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isLandingPopupDismissed } from './landingPopupStorage';

type LandingPopupRedirectProps = {
  enabled: boolean;
  delaySeconds: number;
};

export default function LandingPopupRedirect({
  enabled,
  delaySeconds,
}: LandingPopupRedirectProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    // Marketing prompts must never interrupt payment or order confirmation.
    if (pathname !== '/' && pathname !== '/home') return;
    if (isLandingPopupDismissed()) return;

    const currentQuery = window.location.search;
    const fromPath = `${pathname}${currentQuery}`;

    const timer = window.setTimeout(() => {
      router.push(`/popup?from=${encodeURIComponent(fromPath)}`);
    }, Math.max(0, delaySeconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [delaySeconds, enabled, pathname, router]);

  return null;
}
