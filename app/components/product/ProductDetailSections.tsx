'use client';

import Image from 'next/image';
import { useState } from 'react';

type ProductDetailSectionsProps = {
  detailInJarTitle: string;
  detailInJarSummary: string;
  detailInJarIngredients: string;
  detailOnTongueTitle: string;
  detailOnTongueBody: string;
  detailAfterOpeningTitle: string;
  detailAfterOpeningBody: string;
};

type DetailPanel = 'inJar' | 'onTongue' | 'afterOpening';
type HandDrawnSide = 'left' | 'right';

type BrushSegment = {
  top: number;
  height: number;
  offset: number;
  tilt: number;
  thickness: number;
  opacity: number;
};

const BRUSH_SEGMENTS: BrushSegment[] = [
  { top: 2, height: 14, offset: 8, tilt: -18, thickness: 9, opacity: 0.96 },
  { top: 11, height: 13, offset: 3, tilt: 12, thickness: 8, opacity: 0.92 },
  { top: 19, height: 16, offset: 9, tilt: -9, thickness: 10, opacity: 0.95 },
  { top: 31, height: 13, offset: 2, tilt: 8, thickness: 8, opacity: 0.88 },
  { top: 41, height: 16, offset: 8, tilt: -11, thickness: 10, opacity: 0.98 },
  { top: 53, height: 14, offset: 3, tilt: 7, thickness: 8, opacity: 0.9 },
  { top: 63, height: 16, offset: 9, tilt: -10, thickness: 10, opacity: 0.95 },
  { top: 76, height: 12, offset: 4, tilt: 6, thickness: 8, opacity: 0.9 },
  { top: 84, height: 13, offset: 7, tilt: -8, thickness: 9, opacity: 0.92 },
];

const BRUSH_DABS = [
  { top: 6, offset: 1, size: 7, opacity: 0.75 },
  { top: 24, offset: 10, size: 6, opacity: 0.65 },
  { top: 39, offset: 0, size: 8, opacity: 0.7 },
  { top: 58, offset: 9, size: 7, opacity: 0.68 },
  { top: 74, offset: 2, size: 6, opacity: 0.64 },
  { top: 90, offset: 8, size: 7, opacity: 0.72 },
];

const PANEL_IDS: Record<DetailPanel, string> = {
  inJar: 'detail-panel-in-jar',
  onTongue: 'detail-panel-on-tongue',
  afterOpening: 'detail-panel-after-opening',
};

function HandDrawnSideBorder({
  side,
  color,
  className,
}: {
  side: HandDrawnSide;
  color: string;
  className: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute w-9 md:w-11 ${className}`}>
      {BRUSH_SEGMENTS.map((segment, index) => {
        const position = side === 'left' ? { left: `${segment.offset}px` } : { right: `${segment.offset}px` };
        const signedTilt = side === 'left' ? segment.tilt : -segment.tilt;

        return (
          <span
            key={`stroke-${side}-${index}`}
            className="absolute"
            style={{
              ...position,
              top: `${segment.top}%`,
              width: `clamp(${segment.thickness - 2}px, 1vw, ${segment.thickness + 1}px)`,
              height: `${segment.height}%`,
              opacity: segment.opacity,
              transform: `rotate(${signedTilt}deg)`,
              borderRadius: '999px',
              background: `linear-gradient(180deg, ${color} 0%, ${color} 70%, ${color}C4 100%)`,
              clipPath:
                'polygon(14% 0%, 87% 4%, 100% 12%, 92% 88%, 78% 100%, 24% 96%, 0% 84%, 9% 16%)',
              boxShadow: `0 0 0 0.8px ${color}A8`,
            }}
          />
        );
      })}

      {BRUSH_DABS.map((dab, index) => {
        const position = side === 'left' ? { left: `${dab.offset}px` } : { right: `${dab.offset}px` };

        return (
          <span
            key={`dab-${side}-${index}`}
            className="absolute rounded-full"
            style={{
              ...position,
              top: `${dab.top}%`,
              width: `${dab.size}px`,
              height: `${Math.max(5, dab.size - 1)}px`,
              opacity: dab.opacity,
              backgroundColor: `${color}BF`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function ProductDetailSections({
  detailInJarTitle,
  detailInJarSummary,
  detailInJarIngredients,
  detailOnTongueTitle,
  detailOnTongueBody,
  detailAfterOpeningTitle,
  detailAfterOpeningBody,
}: ProductDetailSectionsProps) {
  const [openPanel, setOpenPanel] = useState<DetailPanel>('inJar');

  const togglePanel = (panel: DetailPanel) => {
    setOpenPanel(panel);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-[960px] md:mt-12">
      <div className="flex w-full flex-nowrap items-start justify-between gap-2 md:gap-6">
          <button
            type="button"
            onClick={() => togglePanel('inJar')}
            aria-expanded={openPanel === 'inJar'}
            aria-controls={PANEL_IDS.inJar}
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E9A19]"
          >
          <span className="relative inline-flex h-[44px] w-[132px] items-center justify-center md:h-[66px] md:w-[300px]">
            <Image
              src="/product/inthejarbg.svg"
              alt=""
              fill
              aria-hidden
              sizes="(max-width: 768px) 132px, 300px"
              className="object-contain"
            />
            <span className="relative z-10 text-[clamp(1.45rem,4.6vw,2.05rem)] leading-none text-[#171717] font-schoolbell md:text-[clamp(2.3rem,3vw,3.6rem)]">
              {detailInJarTitle}
            </span>
          </span>
        </button>

          <button
            type="button"
            onClick={() => togglePanel('onTongue')}
            aria-expanded={openPanel === 'onTongue'}
            aria-controls={PANEL_IDS.onTongue}
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BBB123]"
          >
          <span className="relative inline-flex h-[50px] w-[102px] items-center justify-center md:h-[84px] md:w-[158px]">
            <Image
              src="/product/onthetonguebg.svg"
              alt=""
              fill
              aria-hidden
              sizes="(max-width: 768px) 102px, 158px"
              className="object-contain"
            />
            <span className="relative z-10 max-w-[84px] text-center text-[clamp(1.15rem,3.6vw,1.6rem)] leading-[0.95] text-[#171717] font-schoolbell md:max-w-[130px] md:text-[clamp(1.9rem,2.6vw,3rem)]">
              {detailOnTongueTitle}
            </span>
          </span>
        </button>

          <button
            type="button"
            onClick={() => togglePanel('afterOpening')}
            aria-expanded={openPanel === 'afterOpening'}
            aria-controls={PANEL_IDS.afterOpening}
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A35A0A]"
          >
          <span className="relative inline-flex h-[50px] w-[102px] items-center justify-center md:h-[80px] md:w-[154px]">
            <Image
              src="/product/afteropeningbg.svg"
              alt=""
              fill
              aria-hidden
              sizes="(max-width: 768px) 102px, 154px"
              className="object-contain"
            />
            <span className="relative z-10 max-w-[84px] text-center text-[clamp(1.1rem,3.5vw,1.55rem)] leading-[0.95] text-[#171717] font-schoolbell md:max-w-[122px] md:text-[clamp(1.9rem,2.6vw,3rem)]">
              {detailAfterOpeningTitle}
            </span>
          </span>
        </button>
      </div>

      {openPanel === 'inJar' ? (
        <section
          id={PANEL_IDS.inJar}
          className="relative mx-auto mt-7 w-full max-w-[400px] pl-9 pr-5 pb-7 pt-6 md:mt-9 md:max-w-[960px] md:pl-14 md:pr-10 md:pb-10 md:pt-8"
        >
          <HandDrawnSideBorder side="left" color="#A8D64A" className="left-0 top-3 bottom-5" />
          <div>
            <p className="whitespace-pre-line text-[clamp(1.64rem,2.1vw,1.95rem)] leading-[1.03] text-[#1A1A1A] font-schoolbell">
              {detailInJarSummary}
            </p>
            <p className="mt-4 whitespace-pre-line text-[clamp(1.64rem,2.1vw,1.95rem)] leading-[1.07] text-[#1C2B08] font-schoolbell">
              {detailInJarIngredients}
            </p>
          </div>
        </section>
      ) : null}

      {openPanel === 'onTongue' ? (
        <section
          id={PANEL_IDS.onTongue}
          className="relative mx-auto mt-7 w-full max-w-[400px] px-9 pb-8 pt-6 md:mt-9 md:max-w-[960px] md:px-14 md:pb-11 md:pt-8"
        >
          <HandDrawnSideBorder side="left" color="#EFE86D" className="left-0 top-3 bottom-5" />
          <HandDrawnSideBorder side="right" color="#EFE86D" className="right-0 top-3 bottom-5" />
          <div>
            <p className="mx-auto max-w-[86%] whitespace-pre-line text-center text-[clamp(1.64rem,2.1vw,1.95rem)] leading-[1.08] text-[#1A1A1A] font-schoolbell">
              {detailOnTongueBody}
            </p>
          </div>
        </section>
      ) : null}

      {openPanel === 'afterOpening' ? (
        <section
          id={PANEL_IDS.afterOpening}
          className="relative mx-auto mt-7 w-full max-w-[400px] pl-5 pr-9 pb-8 pt-6 md:mt-9 md:max-w-[960px] md:pl-10 md:pr-14 md:pb-11 md:pt-8"
        >
          <HandDrawnSideBorder side="right" color="#C96A00" className="right-0 top-3 bottom-5" />
          <div>
            <p className="whitespace-pre-line text-[clamp(1.64rem,2.1vw,1.95rem)] leading-[1.08] text-[#1A1A1A] font-schoolbell">
              {detailAfterOpeningBody}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
