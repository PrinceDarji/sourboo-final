'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLandingPopupDismissed } from './landingPopupStorage';

export default function LandingPopupDismissGuard() {
  const router = useRouter();

  useEffect(() => {
    if (!isLandingPopupDismissed()) return;
    router.replace('/home');
  }, [router]);

  return null;
}
