'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

type GalleryCard = {
  id: string;
  src: string;
  alt: string;
  frameClass: string;
  imageClass?: string;
  sizes: string;
};

// Replace only `src` values with your own assets; keep/tune `frameClass` to control collage shape + size.
const galleryCards: GalleryCard[] = [
  {
    id: 'img-1',
    src: '/home/recipe-1.jpg',
    alt: 'Food collage visual 1',
    frameClass:
      'z-[1] mt-[32vh] h-[170px] w-[min(66vw,290px)] overflow-hidden rounded-[20px] md:mt-[34vh] md:h-[250px] md:w-[420px] lg:h-[300px] lg:w-[500px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 66vw, 500px',
  },
  {
    id: 'img-2',
    src: '/home/postcrysnack.svg',
    alt: 'Food collage visual 2',
    frameClass:
      'z-[2] -ml-10 mt-[14vh] h-[210px] w-[180px] overflow-hidden rounded-[24px] -rotate-[4deg] md:-ml-16 md:mt-[12vh] md:h-[330px] md:w-[250px] lg:h-[400px] lg:w-[300px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 180px, 300px',
  },
  {
    id: 'img-3',
    src: '/home/girldinner.svg',
    alt: 'Food collage visual 3',
    frameClass:
      'z-[3] -ml-10 mt-[38vh] h-[190px] w-[190px] overflow-hidden rounded-full md:-ml-14 md:mt-[40vh] md:h-[280px] md:w-[280px] lg:h-[340px] lg:w-[340px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 190px, 340px',
  },
  {
    id: 'img-4',
    src: '/home/hangoverdetox.svg',
    alt: 'Food collage visual 4',
    frameClass:
      'z-[4] -ml-8 mt-[6vh] h-[200px] w-[200px] overflow-visible md:-ml-10 md:mt-[5vh] md:h-[290px] md:w-[290px] lg:h-[360px] lg:w-[360px]',
    imageClass: 'object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,0.22)]',
    sizes: '(max-width: 768px) 200px, 360px',
  },
  {
    id: 'img-5',
    src: '/home/deskcravings.svg',
    alt: 'Food collage visual 5',
    frameClass:
      'z-[1] -ml-16 mt-[26vh] h-[220px] w-[min(74vw,360px)] overflow-hidden rounded-[24px] md:-ml-24 md:mt-[22vh] md:h-[330px] md:w-[540px] lg:h-[420px] lg:w-[660px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 74vw, 660px',
  },
  {
    id: 'img-6',
    src: '/home/recipe-2.svg',
    alt: 'Food collage visual 6',
    frameClass:
      'z-[2] -ml-12 mt-[10vh] h-[160px] w-[220px] overflow-hidden rounded-[30px] rotate-[2deg] md:-ml-16 md:mt-[9vh] md:h-[240px] md:w-[330px] lg:h-[300px] lg:w-[410px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 220px, 410px',
  },
  {
    id: 'img-7',
    src: '/home/latenightmunchies.svg',
    alt: 'Food collage visual 7',
    frameClass:
      'z-[3] -ml-10 mt-[28vh] h-[190px] w-[190px] overflow-hidden rounded-[48%_52%_46%_54%/44%_48%_52%_56%] md:-ml-14 md:mt-[30vh] md:h-[280px] md:w-[280px] lg:h-[330px] lg:w-[330px]',
    imageClass: 'object-cover',
    sizes: '(max-width: 768px) 190px, 330px',
  },
];

const EDGE_EPSILON = 1;
const ACTIVATION_LINE_RATIO = 0.5;

export default function HomeHorizontalImageScroll() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    if (!section || !viewport) return;

    const handleWheel = (event: WheelEvent) => {
      const sectionRect = section.getBoundingClientRect();
      const activationLine = window.innerHeight * ACTIVATION_LINE_RATIO;
      const sectionIsActive =
        sectionRect.top <= activationLine && sectionRect.bottom >= activationLine;
      if (!sectionIsActive) return;

      const maxScrollLeft = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
      if (maxScrollLeft <= 0) return;

      const dominantDelta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (Math.abs(dominantDelta) < 0.1) return;

      const current = viewport.scrollLeft;
      const isForward = dominantDelta > 0;
      const atStart = current <= EDGE_EPSILON;
      const atEnd = current >= maxScrollLeft - EDGE_EPSILON;
      const canConsume = (isForward && !atEnd) || (!isForward && !atStart);
      if (!canConsume) return;

      event.preventDefault();
      const next = Math.min(Math.max(current + dominantDelta, 0), maxScrollLeft);
      viewport.scrollLeft = next;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      data-scroll-reveal="off"
      className="relative w-full py-2 md:py-4"
      aria-label="Horizontal image gallery"
    >
      <div className="mx-auto h-screen w-full max-w-[1500px] px-4 md:px-10">
        <div
          ref={viewportRef}
          className="flex h-full items-start gap-4 overflow-x-auto overflow-y-hidden pt-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:gap-6 md:pt-8"
        >
          {galleryCards.map((card) => (
            <article
              key={card.id}
              className={`relative shrink-0 ${card.frameClass}`}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                className={card.imageClass ?? 'object-cover'}
                sizes={card.sizes}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
