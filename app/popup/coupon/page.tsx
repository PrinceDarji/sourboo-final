import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getLandingPopupContent } from '@/src/lib/sanity/landingPopup';
import LandingPopupCloseButton from '@/app/components/popup/LandingPopupCloseButton';
import PopupPageViewportLock from '@/app/components/popup/PopupPageViewportLock';
import LandingPopupLeadCaptureForm from '@/app/components/popup/LandingPopupLeadCaptureForm';
import LandingPopupTextExitButton from '@/app/components/popup/LandingPopupTextExitButton';

export const revalidate = 0;

function asSafeFromPath(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== 'string') return undefined;
  return first.startsWith('/') ? first : undefined;
}

function toChoiceIndex(
  value: string | string[] | undefined,
  totalOptions: number,
): number {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first !== 'string') return 0;

  const parsed = Number.parseInt(first, 10);
  if (!Number.isInteger(parsed)) return 0;
  if (totalOptions <= 0) return 0;
  if (parsed < 0 || parsed >= totalOptions) return 0;
  return parsed;
}

function cleanOptionLabel(value: string): string {
  return value.replace(/\s*(?:→|->|-\s*>|›|»)+\s*$/, '').trim();
}

export default async function PopupCouponPage({
  searchParams,
}: {
  searchParams: Promise<{ choice?: string | string[]; from?: string | string[] }>;
}) {
  const config = await getLandingPopupContent(300);
  const params = await searchParams;

  if (!config.enabled) {
    redirect('/home');
  }

  const choiceIndex = toChoiceIndex(params.choice, config.options.length);
  const selectedOption = config.options[choiceIndex] || config.options[0];
  const selectedOptionLabel = cleanOptionLabel(selectedOption?.label || 'Sour & Savage');
  const selectedOptionHref = selectedOption?.href || '/product';
  const sourcePath = asSafeFromPath(params.from);

  return (
    <>
      <PopupPageViewportLock />
      <main
        className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden"
        style={{ backgroundColor: config.backgroundColor }}
      >
        <LandingPopupCloseButton
          closeIconSrc={config.closeIcon.src}
          closeIconAlt={config.closeIcon.alt}
          fromPath={sourcePath}
        />
        <LandingPopupTextExitButton
          fromPath={sourcePath}
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
        {config.images.topRight.src ? (
          <Image
            src={config.images.topRight.src}
            alt={config.images.topRight.alt}
            width={240}
            height={280}
            sizes="(max-width: 640px) 120px, 210px"
            className="pointer-events-none absolute right-0 top-[17%] z-10 h-auto w-[16vw] min-w-[100px] max-w-[200px] select-none md:right-[1%]"
          />
        ) : null}

        <div className="relative z-20 mx-auto flex h-full w-full max-w-[1220px] items-center justify-center px-6 pb-8 pt-8 sm:px-8 md:px-10">
          <LandingPopupLeadCaptureForm
            copy={config.leadCapture}
            selectedOptionLabel={selectedOptionLabel}
            selectedOptionHref={selectedOptionHref}
            sourcePath={sourcePath}
          />
        </div>
      </main>
    </>
  );
}
