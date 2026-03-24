'use client';

import { useState } from 'react';
import Image from 'next/image';

type ProductImageCarouselProps = {
  images: string[];
  productName: string;
};

export default function ProductImageCarousel({ images, productName }: ProductImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageCount = images.length;
  const hasMultiple = imageCount > 1;
  const safeActiveIndex = imageCount === 0 ? 0 : Math.min(activeIndex, imageCount - 1);

  if (imageCount === 0) {
    return null;
  }

  const previous = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const next = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative mx-auto mt-3 h-[220px] w-[335px] md:mt-8 md:h-[360px] md:w-[620px]">
      <div className="relative h-full w-full overflow-hidden">
        <Image
          src={images[safeActiveIndex]}
          alt={`${productName} image ${safeActiveIndex + 1}`}
          fill
          priority={safeActiveIndex === 0}
          sizes="(max-width: 768px) 335px, 620px"
          quality={82}
          className="object-contain drop-shadow-[0_0_0.5px_#F18BB7] md:drop-shadow-[0_0_1px_#F18BB7]"
        />
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={previous}
            aria-label="Previous image"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#E61E6E] bg-[#F8E2EE]/90 px-3 py-2 text-[1.35rem] leading-none text-[#E61E6E] font-coolvetica transition-transform hover:scale-105"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next image"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-[#E61E6E] bg-[#F8E2EE]/90 px-3 py-2 text-[1.35rem] leading-none text-[#E61E6E] font-coolvetica transition-transform hover:scale-105"
          >
            →
          </button>

          <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-1">
            {images.map((imgSrc, index) => (
              <button
                key={`${imgSrc}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to image ${index + 1}`}
                className={`h-2.5 w-2.5 rounded-full border border-[#E61E6E] transition-all ${
                  index === safeActiveIndex ? 'bg-[#E61E6E]' : 'bg-[#F8E2EE]'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
