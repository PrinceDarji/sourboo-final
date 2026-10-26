'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { shouldSimplifyMotion } from '../clientMotionPreferences';

type ReviewBubble = {
  id: string;
  text: string;
  background: string;
  textColor: string;
  positionClassName: string;
  sizeClassName: string;
  tailClassName: string;
  delayMs: number;
  rotationDeg: number;
};

type ReviewBubbleTemplate = Omit<ReviewBubble, 'text'> & {
  defaultText: string;
};

const reviewBubbleTemplates: ReviewBubbleTemplate[] = [
  {
    id: 'addictive',
    defaultText: 'addictive',
    background: '#BFEA5A',
    textColor: '#141414',
    positionClassName: 'left-[0%] -top-[2%] md:left-[2%] md:top-[10%]',
    sizeClassName: 'w-[min(40vw,255px)] md:w-[320px] lg:w-[370px]',
    tailClassName: 'bottom-[-12px] right-[16%] rotate-[18deg]',
    delayMs: 120,
    rotationDeg: -4,
  },
  {
    id: 'super-punchy',
    defaultText: 'super punchy\n& sour',
    background: '#E61E6E',
    textColor: '#121212',
    positionClassName: 'right-[0%] -top-[12%] md:right-[2%] md:top-[20%]',
    sizeClassName: 'w-[min(39vw,248px)] md:w-[300px] lg:w-[360px]',
    tailClassName: 'bottom-[-12px] left-[18%] rotate-[-22deg]',
    delayMs: 480,
    rotationDeg: 3,
  },
  {
    id: 'perfect-spicy',
    defaultText: 'perfect spicy',
    background: '#E61E6E',
    textColor: '#141414',
    positionClassName: 'left-[2%] top-[86%] md:left-[6%] md:top-[57%]',
    sizeClassName: 'w-[min(38vw,242px)] md:w-[300px] lg:w-[355px]',
    tailClassName: 'top-[-12px] right-[12%] rotate-[138deg]',
    delayMs: 840,
    rotationDeg: -3,
  },
  {
    id: 'instant-fav',
    defaultText: 'instant fav',
    background: '#BFEA5A',
    textColor: '#141414',
    positionClassName: 'right-[1%] top-[78%] md:right-[4%] md:top-[63%]',
    sizeClassName: 'w-[min(37vw,236px)] md:w-[280px] lg:w-[340px]',
    tailClassName: 'top-[-12px] left-[14%] rotate-[-138deg]',
    delayMs: 1180,
    rotationDeg: 4,
  },
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type HomeReviewPhoneSectionProps = {
  bubbleTexts?: string[];
};

export default function HomeReviewPhoneSection({ bubbleTexts }: HomeReviewPhoneSectionProps) {
  const reviewBubbles: ReviewBubble[] = reviewBubbleTemplates.map((bubble, index) => ({
    ...bubble,
    text: asNonEmptyString(bubbleTexts?.[index]) || bubble.defaultText,
  }));

  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setHasEnteredView(true);
    };

    if (shouldSimplifyMotion()) {
      reveal();
      return;
    }

    if (!('IntersectionObserver' in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal();
          observer.disconnect();
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -12% 0px',
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-scroll-reveal="off"
      className={`home-review-bubbles w-full px-4  pt-3 md:px-10 md:pb-10 md:pt-12 ${hasEnteredView ? 'home-review-visible' : ''}`}
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="relative mx-auto min-h-[560px] w-full max-w-[1240px] md:min-h-[700px]">
          <div className="absolute inset-0">
            {reviewBubbles.map((bubble) => {
              const style = {
                '--review-delay': `${bubble.delayMs}ms`,
                '--review-rotation': `${bubble.rotationDeg}deg`,
                '--review-bg': bubble.background,
              } as CSSProperties;

              return (
                <article
                  key={bubble.id}
                  className={`home-review-bubble absolute rounded-[44%_56%_51%_49%/49%_45%_55%_51%] px-4 py-3 md:px-7 md:py-5 md:shadow-[0_14px_24px_rgba(44,22,10,0.14)] ${bubble.positionClassName} ${bubble.sizeClassName}`}
                  style={style}
                >
                  <p
                    className="whitespace-pre-line text-center text-[clamp(1.55rem,5.2vw,2.2rem)] leading-[0.94] font-schoolbell md:text-[clamp(2rem,2.4vw,3rem)] md:leading-[0.96]"
                    style={{ color: bubble.textColor }}
                  >
                    {bubble.text}
                  </p>
                  <span
                    className={`home-review-bubble-tail absolute h-6 w-6 rounded-[25%_70%_20%_85%] md:h-7 md:w-7 ${bubble.tailClassName}`}
                    aria-hidden
                  />
                </article>
              );
            })}
          </div>

          <div className="relative z-20 mx-auto w-[min(40vw,290px)] pt-12 md:w-[min(22vw,300px)] md:pt-0">
            <Image
              src="/review-phone.svg"
              alt="Phone showing what people say about Sourboo"
              width={3663}
              height={8222}
              quality={82}

              className="h-auto w-full -rotate-3 object-contain md:-rotate-4 md:drop-shadow-[0_20px_28px_rgba(52,20,28,0.26)] lg:rotate-4"
              sizes="(max-width: 768px) 40vw, (max-width: 1364px) 22vw, 300px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
