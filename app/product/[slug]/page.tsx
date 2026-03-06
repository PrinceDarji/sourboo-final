import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../components/about/AboutNavbar';
import SiteFooter from '../../components/SiteFooter';
import ProductDetailCartActions from '@/app/components/cart/ProductDetailCartActions';
import ProductImageCarousel from '@/app/components/product/ProductImageCarousel';
import ProductShareButton from '@/app/components/product/ProductShareButton';
import { sanityClient } from '@/src/lib/sanity/client';
import { urlFor } from '@/src/lib/sanity/image';

export const dynamic = 'force-dynamic';

type StyleVariant = 'primary' | 'secondary';

type SanityProductDetail = {
  slug?: string;
  titleWord?: string;
  accentWord?: string;
  suffixWord?: string;
  price?: string;
  jarImage?: unknown;
  galleryImages?: unknown[];
  titleColor?: string;
  accentColor?: string;
  styleVariant?: StyleVariant;
  detailInJarTitle?: string;
  detailInJarSummary?: string;
  detailInJarIngredients?: string;
  detailOnTongueTitle?: string;
  detailOnTongueBody?: string;
  detailAfterOpeningTitle?: string;
  detailAfterOpeningBody?: string;
  detailDispatchNote?: string;
};

type ProductDetail = {
  slug: string;
  title: string;
  accent: string;
  suffix?: string;
  price: string;
  jarImage: string;
  carouselImages: string[];
  titleColor: string;
  accentColor: string;
  styleVariant: StyleVariant;
  detailInJarTitle: string;
  detailInJarSummary: string;
  detailInJarIngredients: string;
  detailOnTongueTitle: string;
  detailOnTongueBody: string;
  detailAfterOpeningTitle: string;
  detailAfterOpeningBody: string;
  detailDispatchNote: string;
};

const PRODUCT_DETAIL_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  "slug": slug.current,
  titleWord,
  accentWord,
  suffixWord,
  price,
  jarImage,
  galleryImages,
  titleColor,
  accentColor,
  styleVariant,
  detailInJarTitle,
  detailInJarSummary,
  detailInJarIngredients,
  detailOnTongueTitle,
  detailOnTongueBody,
  detailAfterOpeningTitle,
  detailAfterOpeningBody,
  detailDispatchNote
}`;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function imageSrc(source: unknown, fallback: string) {
  try {
    return source ? urlFor(source).width(1800).quality(90).url() : fallback;
  } catch {
    return fallback;
  }
}

function defaultDetailContent(styleVariant: StyleVariant) {
  if (styleVariant === 'secondary') {
    return {
      detailInJarTitle: 'In the jar',
      detailInJarSummary: 'Snackable pickled gherkins',
      detailInJarIngredients:
        'Quantity- 350 grams\n\nGherkins (60/100 grade), Water, Vinegar, Tamarind pulp, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Sugar, Ginger powder, Calcium chloride',
      detailOnTongueTitle: 'On the tongue',
      detailOnTongueBody:
        "It’s sweet-sour at the first bite proper imli, the kind that makes your mouth water instantly.\nYou get the full crunch of the whole gherkin, juicy and tangy, with spice slowly building as you chew. Teasing, mouth-watering, and hard to stop.",
      detailAfterOpeningTitle: 'After opening',
      detailAfterOpeningBody:
        'Store in the fridge for max crunch - keep it where you can see it.\nEat it straight from the jar, with chaat, or next to anything that needs a bold kick.',
      detailDispatchNote: 'Dispatched within 2-4 working days. Delivery timelines vary by location.',
    };
  }

  return {
    detailInJarTitle: 'In the jar',
    detailInJarSummary: 'Snackable pickled gherkins',
    detailInJarIngredients:
      'Quantity- 350 grams\n\nGherkins (60/100 grade),Water, Vinegar, Sugar, Lemon slices, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Ginger powder, Calcium chloride',
    detailOnTongueTitle: 'On the tongue',
    detailOnTongueBody:
      "It's properly khatta and stings at the first bite and makes you squint a little.\nJuicy, spicy, sour, with more flavour coming out as you chew the crinkle-cut slices.\nPerfect for when you want to be extra and a lil hot.",
    detailAfterOpeningTitle: 'After opening',
    detailAfterOpeningBody:
      'Store it in the fridge for max crunch - keep it where you can see it.\nEat it when your mouth wants to misbehave, or with any meal you love.',
    detailDispatchNote: 'Dispatched within 2-4 working days. Delivery timelines vary by location.',
  };
}

function toProductDetail(doc: SanityProductDetail): ProductDetail {
  const styleVariant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
  const isSecondary = styleVariant === 'secondary';
  const defaults = defaultDetailContent(styleVariant);
  const jarFallback = isSecondary ? '/product/tamarin-jar.svg' : '/product/side-eye-jar.svg';
  const jarImage = imageSrc(doc.jarImage, jarFallback);
  const gallerySources = Array.isArray(doc.galleryImages) ? doc.galleryImages : [];
  const cmsGallery = gallerySources
    .map((source) => imageSrc(source, ''))
    .filter((src): src is string => src.length > 0);
  const carouselImages = cmsGallery.length > 0 ? cmsGallery : [jarImage];

  return {
    slug: asNonEmptyString(doc.slug) || 'product',
    title: asNonEmptyString(doc.titleWord) || (isSecondary ? "tamarin'" : 'side'),
    accent: asNonEmptyString(doc.accentWord) || (isSecondary ? 'tease' : 'eye'),
    suffix: asNonEmptyString(doc.suffixWord) || (isSecondary ? undefined : 'sour'),
    price: '₹399',
    jarImage,
    carouselImages,
    titleColor: asNonEmptyString(doc.titleColor) || (isSecondary ? '#3E6A18' : '#E61E6E'),
    accentColor: asNonEmptyString(doc.accentColor) || (isSecondary ? '#7FA16D' : '#F18BB7'),
    styleVariant,
    detailInJarTitle: asNonEmptyString(doc.detailInJarTitle) || defaults.detailInJarTitle,
    detailInJarSummary: asNonEmptyString(doc.detailInJarSummary) || defaults.detailInJarSummary,
    detailInJarIngredients:
      asNonEmptyString(doc.detailInJarIngredients) || defaults.detailInJarIngredients,
    detailOnTongueTitle: asNonEmptyString(doc.detailOnTongueTitle) || defaults.detailOnTongueTitle,
    detailOnTongueBody: asNonEmptyString(doc.detailOnTongueBody) || defaults.detailOnTongueBody,
    detailAfterOpeningTitle:
      asNonEmptyString(doc.detailAfterOpeningTitle) || defaults.detailAfterOpeningTitle,
    detailAfterOpeningBody:
      asNonEmptyString(doc.detailAfterOpeningBody) || defaults.detailAfterOpeningBody,
    detailDispatchNote: asNonEmptyString(doc.detailDispatchNote) || defaults.detailDispatchNote,
  };
}

async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const doc = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<SanityProductDetail | null>(PRODUCT_DETAIL_QUERY, { slug }, { cache: 'no-store' });
    if (!doc) return null;
    return toProductDetail(doc);
  } catch {
    return null;
  }
}

function ProductName({ product }: { product: ProductDetail }) {
  if (product.suffix) {
    return (
      <p
        className="text-center text-[clamp(2.6rem,5.5vw,4.9rem)] leading-[0.92] font-coolvetica"
        style={{ color: product.titleColor }}
      >
        {product.title}
        <span className="mx-2 font-rascal" style={{ color: product.accentColor }}>
          {product.accent}
        </span>
        {product.suffix}
      </p>
    );
  }

  return (
    <p className="text-center text-[clamp(2.6rem,5.5vw,4.9rem)] leading-[0.92] font-coolvetica">
      <span style={{ color: product.titleColor }}>{product.title}</span>{' '}
      <span className="font-rascal" style={{ color: product.accentColor }}>
        {product.accent}
      </span>
    </p>
  );
}

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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productName = `${product.title} ${product.accent}${product.suffix ? ` ${product.suffix}` : ''}`;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#ECECEC] pt-24 md:pt-28">
      <Navbar />

      <section className="mx-auto w-full max-w-[430px] px-4 pb-24 md:max-w-[1100px] md:px-8 md:pb-32">
        <div className="mt-2 flex md:mt-4">
          <Link
            href="/product"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#E61E6E] bg-[#F8E2EE] px-4 py-2 text-[clamp(1.2rem,2.2vw,1.9rem)] leading-none text-[#E61E6E] font-schoolbell transition-transform hover:scale-[1.02]"
          >
            <span aria-hidden>←</span>
            back to products
          </Link>
        </div>

        <ProductImageCarousel images={product.carouselImages} productName={productName} />

        <div className="mt-3 md:mt-6">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <ProductName product={product} />
            <ProductShareButton productName={productName} />
          </div>
          <div className="relative mx-auto mt-2 h-[34px] w-[194px] md:h-[42px] md:w-[240px]">
            <Image src="/product/reviewstars.svg" alt="5 star reviews" fill className="object-contain" />
          </div>
          <p className="mt-2 text-center text-[clamp(2.1rem,3.8vw,3.3rem)] leading-none text-[#1D1D1D] font-coolvetica">
            {product.price}
          </p>
          <ProductDetailCartActions
            slug={product.slug}
            name={productName}
            priceLabel={product.price}
            image={product.jarImage}
          />
        </div>

        <details className="relative mx-auto mt-8 w-full max-w-[400px] pl-9 pr-5 pb-7 pt-14 md:mt-12 md:max-w-[960px] md:pl-14 md:pr-10 md:pb-10 md:pt-16">
          <HandDrawnSideBorder side="left" color="#A8D64A" className="left-0 top-10 bottom-5" />
          <summary className="absolute left-0 top-0 z-20 -translate-y-1/2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="relative inline-flex h-[44px] w-[190px] items-center justify-center md:h-[66px] md:w-[300px]">
              <Image src="/product/inthejarbg.svg" alt="" fill aria-hidden className="object-contain" />
              <span className="relative z-10 text-[clamp(1.9rem,3.2vw,3rem)] leading-none text-[#171717] font-schoolbell md:text-[clamp(2.3rem,3vw,3.6rem)]">
                {product.detailInJarTitle}
              </span>
            </span>
          </summary>
          <div className="mt-3 md:mt-4">
            <p className="whitespace-pre-line text-[clamp(2rem,3.5vw,3.4rem)] leading-[1.03] text-[#1A1A1A] font-schoolbell">
              {product.detailInJarSummary}
            </p>
            <p className="mt-4 whitespace-pre-line text-[clamp(1.85rem,3.2vw,3.1rem)] leading-[1.07] text-[#1C2B08] font-schoolbell">
              {product.detailInJarIngredients}
            </p>
          </div>
        </details>

        <details className="relative mx-auto mt-7 w-full max-w-[400px] px-9 pb-8 pt-14 md:mt-10 md:max-w-[960px] md:px-14 md:pb-11 md:pt-16">
          <HandDrawnSideBorder side="left" color="#EFE86D" className="left-0 top-11 bottom-5" />
          <HandDrawnSideBorder side="right" color="#EFE86D" className="right-0 top-11 bottom-5" />
          <summary className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className="relative inline-flex h-[58px] w-[106px] items-center justify-center md:h-[84px] md:w-[158px]">
              <Image src="/product/onthetonguebg.svg" alt="" fill aria-hidden className="object-contain" />
              <span className="relative z-10 max-w-[84px] text-center text-[clamp(1.55rem,2.3vw,2.5rem)] leading-[0.95] text-[#171717] font-schoolbell md:max-w-[130px] md:text-[clamp(1.9rem,2.6vw,3rem)]">
                {product.detailOnTongueTitle}
              </span>
            </span>
          </summary>
          <div className="mt-3 md:mt-4">
            <p className="mx-auto max-w-[86%] whitespace-pre-line text-center text-[clamp(1.92rem,3.1vw,3rem)] leading-[1.08] text-[#1A1A1A] font-schoolbell">
              {product.detailOnTongueBody}
            </p>
          </div>
        </details>

        <details className="relative mx-auto mt-7 w-full max-w-[400px] pl-5 pr-9 pb-8 pt-14 md:mt-10 md:max-w-[960px] md:pl-10 md:pr-14 md:pb-11 md:pt-16">
          <HandDrawnSideBorder side="right" color="#C96A00" className="right-0 top-11 bottom-5" />
          <summary className="absolute right-8 top-0 z-20 -translate-y-1/2 cursor-pointer list-none [&::-webkit-details-marker]:hidden md:right-14">
            <span className="relative inline-flex h-[56px] w-[102px] items-center justify-center md:h-[80px] md:w-[154px]">
              <Image src="/product/afteropeningbg.svg" alt="" fill aria-hidden className="object-contain" />
              <span className="relative z-10 max-w-[84px] text-center text-[clamp(1.5rem,2.2vw,2.45rem)] leading-[0.95] text-[#171717] font-schoolbell md:max-w-[122px] md:text-[clamp(1.9rem,2.6vw,3rem)]">
                {product.detailAfterOpeningTitle}
              </span>
            </span>
          </summary>
          <div className="mt-3 md:mt-4">
            <p className="whitespace-pre-line text-[clamp(1.95rem,3.2vw,3rem)] leading-[1.08] text-[#1A1A1A] font-schoolbell">
              {product.detailAfterOpeningBody}
            </p>
          </div>
        </details>

        <p className="mx-auto mt-8 max-w-[390px] whitespace-pre-line text-center text-[clamp(2rem,3.2vw,3rem)] leading-[1.08] text-[#E63182] font-schoolbell md:mt-12 md:max-w-[930px]">
          {product.detailDispatchNote}
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
