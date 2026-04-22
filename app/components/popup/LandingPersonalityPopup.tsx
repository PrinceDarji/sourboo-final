'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { LandingPopupContent, LandingPopupOption } from '@/src/lib/sanity/landingPopup';

type LandingPersonalityPopupProps = {
  config: LandingPopupContent;
};

type PopupOptionButtonProps = {
  option: LandingPopupOption;
  onSelect: () => void;
};

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function PopupOptionButton({ option, onSelect }: PopupOptionButtonProps) {
  const content = (
    <>
      {option.backgroundImageSrc ? (
        <Image
          src={option.backgroundImageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 520px"
          className="pointer-events-none object-contain select-none"
        />
      ) : null}
      <span
        className="relative z-10 px-6 text-center text-[clamp(1.8rem,3.4vw,2.9rem)] leading-none font-schoolbell"
        style={{ color: option.textColor }}
      >
        {option.label}
      </span>
    </>
  );

  const className =
    'relative flex h-[62px] w-full items-center justify-center sm:h-[68px] md:h-[72px]';

  if (isExternalHref(option.href)) {
    return (
      <a
        href={option.href}
        target="_blank"
        rel="noreferrer"
        onClick={onSelect}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={option.href} onClick={onSelect} className={className}>
      {content}
    </Link>
  );
}

export default function LandingPersonalityPopup({ config }: LandingPersonalityPopupProps) {
  const pathname = usePathname();
  const [isDelayDone, setIsDelayDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const shouldRunOnPage = useMemo(() => pathname === '/' || pathname === '/home', [pathname]);
  const isOpen = isDelayDone && !dismissed && config.enabled && shouldRunOnPage;

  useEffect(() => {
    if (!config.enabled || !shouldRunOnPage || dismissed || isDelayDone) return;

    const timer = window.setTimeout(() => {
      setIsDelayDone(true);
    }, Math.max(0, config.delaySeconds) * 1000);

    return () => window.clearTimeout(timer);
  }, [config.delaySeconds, config.enabled, dismissed, isDelayDone, shouldRunOnPage]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const closePopup = () => {
    setDismissed(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] isolate" aria-hidden={!isOpen}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sour personality popup"
        className="relative h-full w-full overflow-hidden"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <button
          type="button"
          aria-label="Close popup"
          onClick={closePopup}
          className="absolute right-3 top-2 z-30 text-[62px] leading-none text-[#EC1B79] font-coolvetica transition hover:opacity-80 sm:right-4 md:right-7 md:top-3 md:text-[72px]"
        >
          ×
        </button>

        {config.images.topLeft.src ? (
          <Image
            src={config.images.topLeft.src}
            alt={config.images.topLeft.alt}
            width={380}
            height={440}
            sizes="(max-width: 640px) 180px, 320px"
            className="pointer-events-none absolute -left-7 -top-4 z-10 h-auto w-[43vw] max-w-[330px] select-none md:w-[32vw]"
          />
        ) : null}
        {config.images.topRight.src ? (
          <Image
            src={config.images.topRight.src}
            alt={config.images.topRight.alt}
            width={240}
            height={280}
            sizes="(max-width: 640px) 150px, 230px"
            className="pointer-events-none absolute right-[2%] top-[18%] z-10 h-auto w-[28vw] max-w-[230px] select-none md:right-[6%] md:top-[22%]"
          />
        ) : null}
        {config.images.bottomLeft.src ? (
          <Image
            src={config.images.bottomLeft.src}
            alt={config.images.bottomLeft.alt}
            width={210}
            height={90}
            sizes="(max-width: 640px) 130px, 210px"
            className="pointer-events-none absolute bottom-6 left-3 z-10 h-auto w-[24vw] min-w-[110px] max-w-[210px] select-none md:bottom-8 md:left-6"
          />
        ) : null}
        {config.images.center.src ? (
          <Image
            src={config.images.center.src}
            alt={config.images.center.alt}
            width={520}
            height={420}
            sizes="(max-width: 520px) 72vw, 520px"
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-auto w-[76vw] max-w-[420px] -translate-x-1/2 -translate-y-[28%] select-none"
          />
        ) : null}

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[820px] flex-col items-center px-4 pb-12 pt-14 sm:px-8 sm:pt-16 md:px-10 md:pb-16 md:pt-20">
          <h2 className="text-center leading-[0.92]">
            <span className="text-[clamp(3rem,8vw,6.5rem)] tracking-[0.01em] text-[#EC1B79] font-coolvetica">
              {config.headingStart}{' '}
            </span>
            <span className="text-[clamp(2.7rem,7.3vw,6.1rem)] text-[#EC1B79] font-schoolbell">
              {config.headingMain}
            </span>
          </h2>

          <p className="mt-1 w-full max-w-[640px] text-right text-[clamp(1.55rem,3.2vw,3.15rem)] leading-none text-[#EC1B79] font-schoolbell">
            {config.subheading}
          </p>

          <div className="mt-8 w-full max-w-[560px] space-y-2 sm:mt-10 sm:space-y-3 md:space-y-4">
            {config.options.map((option) => (
              <PopupOptionButton key={`${option.label}-${option.href}`} option={option} onSelect={closePopup} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={closePopup}
          className="absolute bottom-[calc(3rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 px-4 text-center font-schoolbell text-[clamp(1rem,1.5vw,1.35rem)] leading-none text-[#2A2A2A] transition hover:opacity-70 md:bottom-5"
        >
          no thanks take me to the website
        </button>
      </div>
    </div>
  );
}
