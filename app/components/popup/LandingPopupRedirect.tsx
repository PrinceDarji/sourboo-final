'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { isLandingPopupDismissed } from './landingPopupStorage';

type LandingPopupRedirectProps = {
  enabled: boolean;
};

export default function LandingPopupRedirect({ enabled }: LandingPopupRedirectProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    if (pathname.startsWith('/popup')) return;
    if (isLandingPopupDismissed()) return;

    const currentQuery = searchParams.toString();
    const fromPath = `${pathname}${currentQuery ? `?${currentQuery}` : ''}`;
    const effectiveDelaySeconds = 4;

    const timer = window.setTimeout(() => {
      router.push(`/popup?from=${encodeURIComponent(fromPath)}`);
    }, Math.max(0, effectiveDelaySeconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [enabled, pathname, router, searchParams]);

  return null;
}
