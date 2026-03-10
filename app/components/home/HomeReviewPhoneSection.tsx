'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

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

const reviewBubbles: ReviewBubble[] = [
  {
    id: 'addictive',
    text: 'addictive',
    background: '#E6E8BD',
    textColor: '#141414',
    positionClassName: 'left-[1%] top-[4%] md:left-[2%] md:top-[10%]',
    sizeClassName: 'w-[min(46vw,300px)] md:w-[320px] lg:w-[370px]',
    tailClassName: 'bottom-[-12px] right-[16%] rotate-[18deg]',
    delayMs: 120,
    rotationDeg: -4,
  },
  {
    id: 'super-punchy',
    text: 'super punchy\n& sour',
    background: '#ECE5F0',
    textColor: '#121212',
    positionClassName: 'right-[0%] top-[16%] md:right-[2%] md:top-[20%]',
    sizeClassName: 'w-[min(44vw,290px)] md:w-[300px] lg:w-[360px]',
    tailClassName: 'bottom-[-12px] left-[18%] rotate-[-22deg]',
    delayMs: 480,
    rotationDeg: 3,
  },
  {
    id: 'perfect-spicy',
    text: 'perfect spicy',
    background: '#EDE6F0',
    textColor: '#141414',
    positionClassName: 'left-[2%] top-[58%] md:left-[6%] md:top-[57%]',
    sizeClassName: 'w-[min(43vw,280px)] md:w-[300px] lg:w-[355px]',
    tailClassName: 'top-[-12px] right-[12%] rotate-[138deg]',
    delayMs: 840,
    rotationDeg: -3,
  },
  {
    id: 'instant-fav',
    text: 'instant fav',
    background: '#E6E8BD',
    textColor: '#141414',
    positionClassName: 'right-[1%] top-[66%] md:right-[4%] md:top-[63%]',
    sizeClassName: 'w-[min(42vw,270px)] md:w-[280px] lg:w-[340px]',
    tailClassName: 'top-[-12px] left-[14%] rotate-[-138deg]',
    delayMs: 1180,
    rotationDeg: 4,
  },
];

export default function HomeReviewPhoneSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEnteredView, setHasEnteredView] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.requestAnimationFrame(() => {
        setHasEnteredView(true);
      });
    };

    const checkInView = () => {
      if (revealed) return;
      const rect = node.getBoundingClientRect();
      const topTrigger = window.innerHeight * 0.82;
      const bottomTrigger = window.innerHeight * 0.18;
      if (rect.top <= topTrigger && rect.bottom >= bottomTrigger) {
        reveal();
      }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }

    checkInView();

    const handleScroll = () => checkInView();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal();
            observer?.disconnect();
          });
        },
        {
          threshold: 0.01,
          rootMargin: '0px 0px -16% 0px',
        },
      );

      observer.observe(node);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-scroll-reveal="off"
      className={`home-review-bubbles w-full px-4 pb-18 pt-8 md:px-10 md:pb-10 md:pt-12 ${hasEnteredView ? 'home-review-visible' : ''}`}
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="relative mx-auto min-h-[820px] w-full max-w-[1240px] md:min-h-[700px]">
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
                  className={`home-review-bubble absolute rounded-[44%_56%_51%_49%/49%_45%_55%_51%] px-5 py-4 shadow-[0_14px_24px_rgba(44,22,10,0.14)] md:px-7 md:py-5 ${bubble.positionClassName} ${bubble.sizeClassName}`}
                  style={style}
                >
                  <p
                    className="whitespace-pre-line text-center text-[clamp(2rem,2.4vw,3rem)] leading-[0.96] font-schoolbell"
                    style={{ color: bubble.textColor }}
                  >
                    {bubble.text}
                  </p>
                  <span
                    className={`home-review-bubble-tail absolute h-7 w-7 rounded-[25%_70%_20%_85%] ${bubble.tailClassName}`}
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
              height={8227}
              className="h-auto w-full object-contain drop-shadow-[0_20px_28px_rgba(52,20,28,0.26)]"
              sizes="(max-width: 768px) 40vw, (max-width: 1364px) 22vw, 300px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
