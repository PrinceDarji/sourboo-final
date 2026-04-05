'use client';

import { useRouter } from 'next/navigation';
import { setLandingPopupDismissed } from './landingPopupStorage';

type LandingPopupCloseButtonProps = {
  closeIconSrc?: string;
  closeIconAlt: string;
  fromPath?: string;
};

export default function LandingPopupCloseButton({
  closeIconSrc,
  closeIconAlt,
  fromPath,
}: LandingPopupCloseButtonProps) {
  const router = useRouter();

  const handleClose = () => {
    setLandingPopupDismissed();

    if (fromPath && fromPath.startsWith('/')) {
      router.replace(fromPath);
      return;
    }

    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label="Close popup"
      className="absolute right-3 top-2 z-30 flex h-12 w-12 items-center justify-center transition hover:opacity-80 sm:right-4 md:right-7 md:top-3 md:h-14 md:w-14"
    >
      {closeIconSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={closeIconSrc}
          alt={closeIconAlt}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-[62px] leading-none text-[#EC1B79] font-coolvetica md:text-[72px]">
          ×
        </span>
      )}
    </button>
  );
}
