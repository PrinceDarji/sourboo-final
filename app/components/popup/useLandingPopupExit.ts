'use client';

import { useRouter } from 'next/navigation';
import { setLandingPopupDismissed } from './landingPopupStorage';

export default function useLandingPopupExit(fromPath?: string) {
  const router = useRouter();

  return () => {
    setLandingPopupDismissed();

    if (fromPath && fromPath.startsWith('/')) {
      router.replace(fromPath);
      return;
    }

    router.back();
  };
}
