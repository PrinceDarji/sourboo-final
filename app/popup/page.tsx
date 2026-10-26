import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CoolRascalText } from '@/app/components/MixedFont';
import {
  getLandingPopupContent,
  type LandingPopupOption,
} from '@/src/lib/sanity/landingPopup';
import PopupPageViewportLock from '../components/popup/PopupPageViewportLock';
import LandingPopupCloseButton from '../components/popup/LandingPopupCloseButton';
import LandingPopupDismissGuard from '../components/popup/LandingPopupDismissGuard';
import LandingPopupTextExitButton from '../components/popup/LandingPopupTextExitButton';

export const revalidate = 0;

function asSafeFromPath(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== 'string') return undefined;
  return first.startsWith('/') ? first : undefined;
}

function toOfferStepHref(optionIndex: number, fromPath?: string): string {
  const params = new URLSearchParams();
  params.set('choice', String(optionIndex));
  if (fromPath) {
    params.set('from', fromPath);
  }

  return `/popup/coupon?${params.toString()}`;
}

function PopupOptionButton({
  option,
  optionIndex,
  fromPath,
}: {
  option: LandingPopupOption;
  optionIndex: number;
  fromPath?: string;
}) {
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
        className="relative z-10 inline-block px-6 text-center leading-none font-schoolbell"
        style={{
          color: option.textColor,
          fontSize: 'clamp(1.2rem, 3.2vw, 2.1rem)',
          transform: `translate(${option.textOffsetX}px, ${option.textOffsetY}px)`,
        }}
      >
        {option.label}
      </span>
    </>
  );

  const className = 'relative mx-auto flex items-center justify-center';
  const style = {
    width: 'min(92vw, 520px)',
    height: 'clamp(62px, 8vw, 96px)',
  } as const;

  return (
    <Link href={toOfferStepHref(optionIndex, fromPath)} className={className} style={style}>
      {content}
    </Link>
  );
}

export default async function PopupPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const config = await getLandingPopupContent(300);
  const params = await searchParams;
  const fromPath = asSafeFromPath(params.from);
  const headingText = `${config.headingStart} ${config.headingMain}`.trim();

  if (!config.enabled) {
    redirect('/home');
  }

  return (
    <>
      <PopupPageViewportLock />
      <LandingPopupDismissGuard />
      <main
        className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <LandingPopupCloseButton
          closeIconSrc={config.closeIcon.src}
          closeIconAlt={config.closeIcon.alt}
          fromPath={fromPath}
        />
        <LandingPopupTextExitButton
          fromPath={fromPath}
          className="absolute bottom-[calc(3rem+env(safe-area-inset-bottom))] left-1/2 z-30 -translate-x-1/2 md:bottom-5"
        />

        {config.images.topLeft.src ? (
          <Image
            src={config.images.topLeft.src}
            alt={config.images.topLeft.alt}
            width={360}
            height={520}
            sizes="(max-width: 640px) 170px, 300px"
            className="pointer-events-none absolute left-0 top-0 z-10 h-auto w-[22vw] min-w-[110px] max-w-[290px] select-none"
          />
        ) : null}
        {config.images.thirdOilDrip.src ? (
          <Image
            src={config.images.thirdOilDrip.src}
            alt={config.images.thirdOilDrip.alt}
            width={360}
            height={520}
            sizes="(max-width: 640px) 220px, 380px"
            className="pointer-events-none absolute bottom-0 right-0 z-10 h-auto w-[30vw] min-w-[160px] max-w-[380px] select-none"
            style={{ transform: 'rotateY(180deg)' }}
          />
        ) : null}
        {config.images.bottomLeft.src ? (
          <Image
            src={config.images.bottomLeft.src}
            alt={config.images.bottomLeft.alt}
            width={210}
            height={90}
            sizes="(max-width: 700px) 160px, 100px"
            className="pointer-events-none absolute z-10 select-none"
            style={{
              left: '-2%',
              bottom: '-1%',
              width: 'clamp(102px, 18vw, 700px)',
              height: 'auto',
            }}
          />
        ) : null}
        {config.images.center.src ? (
          <Image
            src={config.images.center.src}
            alt={config.images.center.alt}
            width={960}
            height={620}
            sizes="(max-width: 640px) 82vw, (max-width: 820px) 72vw, 960px"
            className="pointer-events-none absolute left-1/2 top-[28%] z-0 h-auto -translate-x-1/2 -translate-y-1/2 select-none md:top-[57%]"
            style={{
              width: 'clamp(380px, 72vw, 960px)',
              height: 'auto',
            }}
          />
        ) : null}

        <div className="relative z-20 mx-auto h-full w-full max-w-[1220px] px-6 pb-8 pt-8 sm:px-8 md:px-10">
          <div className="relative mx-auto w-full max-w-[1080px] text-center">
            <h1
              className="text-center"
              style={{
                fontSize: 'clamp(32px, 6.4vw, 80px)',
                lineHeight: 0.86,
                color: '#E61E6E',
              }}
            >
              <CoolRascalText
                as="span"
                text={headingText}
                pattern="alternate"
                startWith="base"
                baseClassName="text-[#E61E6E]"
                accentClassName="text-[#E61E6E]"
              />
            </h1>

            <div className="mt-1 flex justify-end">
              <div className="relative inline-block">
                <p
                  className="text-right font-schoolbell"
                  style={{
                    fontSize: 'clamp(30px, 3.2vw, 52px)',
                    lineHeight: 1,
                    color: '#E61E6E',
                  }}
                >
                  {config.subheading}
                </p>

                {config.images.topRight.src ? (
                  <Image
                    src={config.images.topRight.src}
                    alt={config.images.topRight.alt}
                    width={240}
                    height={280}
                    sizes="(max-width: 640px) 120px, 210px"
                    className="pointer-events-none absolute right-[-6vw] top-full z-10 h-auto w-[16vw] min-w-[100px] max-w-[200px] select-none md:right-[-7vw]"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-[55%] z-20 w-full -translate-x-1/2 -translate-y-1/2 space-y-2 text-center sm:space-y-3 md:space-y-4">
            {config.options.map((option, optionIndex) => (
              <PopupOptionButton
                key={`${option.label}-${option.href}-${optionIndex}`}
                option={option}
                optionIndex={optionIndex}
                fromPath={fromPath}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
