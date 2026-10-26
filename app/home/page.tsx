import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import HomeHorizontalImageScroll from '../components/home/HomeHorizontalImageScroll';
import CrybabyVisual from '../components/home/CrybabyVisual';
import HomePosterPinboard from '../components/home/HomePosterPinboard';
import HomeReviewPhoneSection from '../components/home/HomeReviewPhoneSection';
import { CATALOG_PRODUCTS } from '@/src/lib/catalog/products';
import { sanityClient } from '@/src/lib/sanity/client';
import { CoolRascalText } from '../components/MixedFont';
import { sanityImageOrFileUrl } from '@/src/lib/sanity/image';
import { calculateDiscountedRupees, formatInr, normalizeDiscountPercent, parsePriceLabel } from '@/src/lib/cart/price';
import type { Metadata } from 'next';

export const revalidate = 300;

const homeTitle = 'Sourboo | Spicy Sour Gherkin Snacks & Pickled Snacks';
const homeDescription =
  'Sourboo makes spicy-sour gherkin snacks and snackable pickles for people obsessed with tangy munchies, cocktails and bold snacking. Perfect for burgers, sandwiches and cocktail garnishes.';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  title: {
    absolute: homeTitle,
  },
  description: homeDescription,
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: '/home',
  },
  twitter: {
    title: homeTitle,
    description: homeDescription,
  },
};

type StyleVariant = 'primary' | 'secondary';

type SanityHomeProduct = {
  slug?: string;
  styleVariant?: StyleVariant;
  price?: string;
  discountPercent?: number;
};

type HomeVariantPrice = {
  priceLabel: string;
  discountedPriceLabel?: string;
};

type HomePageProductBandQuery = {
  variant?: StyleVariant;
  ctaLabel?: string;
  sectionBackgroundImage?: unknown;
  productLabelImage?: unknown;
  productLabelMobileImage?: unknown;
  ctaBackgroundImage?: unknown;
};

type HomePageImageItemQuery = {
  image?: unknown;
  alt?: string;
};

type HomePageReviewBubbleQuery = {
  text?: string;
};

type HomePageQueryResult = {
  heroImage?: unknown;
  heroImageAlt?: string;
  heroTitleLine1?: string;
  heroTitleLine2?: string;
  productBands?: HomePageProductBandQuery[];
  introHeadlineLine1?: string;
  introHeadlineLine2?: string;
  introBodyLine1?: string;
  introBodyLine2?: string;
  readRantImage?: unknown;
  readRantImageAlt?: string;
  readRantCtaLabel?: string;
  posters?: HomePageImageItemQuery[];
  horizontalGallery?: HomePageImageItemQuery[];
  reviewBubbles?: HomePageReviewBubbleQuery[];
} | null;

type HomeBand = {
  id: string;
  bgImage: string;
  packageImage: string;
  packageAspectRatio: number;
  mobilePackageWidthClass: string;
  mobilePackageSizes: string;
  priceLabel: string;
  ctaLabel: string;
  fallbackHref: string;
  styleVariant: StyleVariant;
  ctaBackgroundImage: string;
  ctaClassName: string;
  ctaAlignClass: string;
  ctaOffsetClass: string;
  showTopWave?: boolean;
  showBottomWave?: boolean;
};

type ProductBandProps = Omit<HomeBand, 'fallbackHref' | 'styleVariant'> & {
  href: string;
  discountedPriceLabel?: string;
  mobilePackageImage?: string;
};

type HomeBandCmsContent = {
  ctaLabel?: string;
  bgImage?: string;
  packageImage?: string;
  mobilePackageImage?: string;
  ctaBackgroundImage?: string;
};

type HomeCmsImageItem = {
  src: string;
  alt?: string;
};

type HomeCmsContent = {
  hero: {
    src: string;
    alt: string;
    titleLine1: string;
    titleLine2: string;
  };
  intro: {
    headlineLine1: string;
    headlineLine2: string;
    bodyLine1: string;
    bodyLine2: string;
    readRantImage: HomeCmsImageItem;
    readRantCtaLabel: string;
  };
  bandByVariant: Partial<Record<StyleVariant, HomeBandCmsContent>>;
  posterItems: HomeCmsImageItem[];
  horizontalItems: HomeCmsImageItem[];
  reviewBubbleTexts: string[];
};

const homeBands: HomeBand[] = [
  {
    id: 'side-eye',
    bgImage: '/home/packagingbg.webp',
    packageImage: '/home/sideeyepackage.png',
    packageAspectRatio: 1210 / 274,
    mobilePackageWidthClass: 'w-[138vw]',
    mobilePackageSizes: '138vw',
    priceLabel: '₹399',
    ctaLabel: 'side eye sour →',
    fallbackHref: '/product/side-eye-sour',
    styleVariant: 'primary',
    ctaBackgroundImage: '/home/ctabg.svg',
    ctaClassName: 'text-[#2F4918] hover:brightness-105',
    ctaAlignClass: 'justify-center',
    ctaOffsetClass: 'mt-4 sm:mt-5 md:mt-6',
    showBottomWave: true,
    showTopWave: true,
  },
  {
    id: 'tamarin-tease',
    bgImage: '/home/packagingbg.webp',
    packageImage: '/home/tamarinpackage.png',
    packageAspectRatio: 2314 / 408,
    mobilePackageWidthClass: 'w-[172vw]',
    mobilePackageSizes: '172vw',
    priceLabel: '₹399',
    ctaLabel: 'tamarind tease →',
    fallbackHref: '/product/tamarin-tease',
    styleVariant: 'secondary',
    ctaBackgroundImage: '/home/ctabg2.svg',
    ctaClassName: 'text-[#26140A] whitespace-nowrap hover:brightness-105',
    ctaAlignClass: 'justify-start pl-4 sm:pl-20 md:pl-28 lg:pl-36',
    ctaOffsetClass: 'mt-5 sm:mt-6 md:mt-7',
    showTopWave: true,
    showBottomWave: true,
  },
];

const HOME_PAGE_CONTENT_QUERY = `*[_type == "homePage"] | order(_updatedAt desc)[0]{
  "heroImage": coalesce(heroImageSvg.asset->url, heroImage),
  heroImageAlt,
  heroTitleLine1,
  heroTitleLine2,
  productBands[]{
    variant,
    ctaLabel,
    "sectionBackgroundImage": coalesce(sectionBackgroundImageSvg.asset->url, sectionBackgroundImage),
    "productLabelImage": coalesce(productLabelImageSvg.asset->url, productLabelImage),
    "productLabelMobileImage": coalesce(productLabelMobileImageSvg.asset->url, productLabelMobileImage),
    "ctaBackgroundImage": coalesce(ctaBackgroundImageSvg.asset->url, ctaBackgroundImage)
  },
  introHeadlineLine1,
  introHeadlineLine2,
  introBodyLine1,
  introBodyLine2,
  "readRantImage": coalesce(readRantImageSvg.asset->url, readRantImage),
  readRantImageAlt,
  readRantCtaLabel,
  posters[]{
    "image": coalesce(imageSvg.asset->url, image),
    alt
  },
  horizontalGallery[]{
    "image": coalesce(imageSvg.asset->url, image),
    alt
  },
  reviewBubbles[]{
    text
  }
}`;

const sanityClientLive = sanityClient;
const SANITY_FETCH_OPTIONS = { next: { revalidate: 300 } };

const DEFAULT_HOME_CONTENT: HomeCmsContent = {
  hero: {
    src: '/home/hero-placeholder.webp',
    alt: 'hero placeholder',
    titleLine1: 'the sourboo way,',
    titleLine2: 'cravings comes first',
  },
  intro: {
    headlineLine1: 'sourboo made for people who eat',
    headlineLine2: 'with intent',
    bodyLine1: 'who like flavour loud and immediate',
    bodyLine2: 'food that fits into real moments',
    readRantImage: {
      src: '/home/readmyrant.webp',
      alt: 'crybaby challenge visual placeholder',
    },
    readRantCtaLabel: 'read my rant →',
  },
  bandByVariant: {},
  posterItems: [],
  horizontalItems: [],
  reviewBubbleTexts: [],
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function imageSrc(
  source: unknown,
  fallback: string,
  options?: { width?: number; quality?: number },
): string {
  const width = options?.width ?? 1600;
  const quality = options?.quality ?? 78;

  return sanityImageOrFileUrl(source, fallback, { width, quality });
}

function toCmsImageItems(
  entries: HomePageImageItemQuery[] | undefined,
  options: { width: number; quality: number },
): HomeCmsImageItem[] {
  if (!Array.isArray(entries)) return [];

  const items: HomeCmsImageItem[] = [];
  for (const entry of entries) {
    const src = asNonEmptyString(imageSrc(entry?.image, '', options));
    if (!src) continue;

    items.push({
      src,
      alt: asNonEmptyString(entry?.alt),
    });
  }

  return items;
}

async function getHomeCtaByVariant(): Promise<{
  hrefByVariant: Partial<Record<StyleVariant, string>>;
  priceByVariant: Partial<Record<StyleVariant, HomeVariantPrice>>;
}> {
  try {
    const docs: readonly SanityHomeProduct[] = CATALOG_PRODUCTS.filter((product) => product.jarCount === 1);

    if (!Array.isArray(docs) || docs.length === 0) {
      return { hrefByVariant: {}, priceByVariant: {} };
    }

    const hrefByVariant: Partial<Record<StyleVariant, string>> = {};
    const priceByVariant: Partial<Record<StyleVariant, HomeVariantPrice>> = {};
    for (const doc of docs) {
      const variant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
      if (!priceByVariant[variant]) {
        const originalPriceLabel = asNonEmptyString(doc.price);
        if (originalPriceLabel) {
          const parsedPrice = parsePriceLabel(originalPriceLabel);
          const discountPercent = normalizeDiscountPercent(doc.discountPercent);
          const discountedRupees =
            discountPercent && parsedPrice > 0
              ? calculateDiscountedRupees(parsedPrice, discountPercent)
              : Math.round(parsedPrice);
          const shouldShowDiscount = Boolean(
            discountPercent && parsedPrice > 0 && discountedRupees > 0 && discountedRupees < Math.round(parsedPrice),
          );

          priceByVariant[variant] = {
            priceLabel: originalPriceLabel,
            discountedPriceLabel: shouldShowDiscount ? formatInr(discountedRupees) : undefined,
          };
        }
      }

      if (hrefByVariant[variant]) continue;
      const slug = asNonEmptyString(doc.slug);
      if (!slug) continue;
      hrefByVariant[variant] = `/product/${slug}`;
    }
    return { hrefByVariant, priceByVariant };
  } catch {
    return { hrefByVariant: {}, priceByVariant: {} };
  }
}

async function getHomeCmsContent(): Promise<HomeCmsContent> {
  try {
    const data = await sanityClientLive.fetch<HomePageQueryResult>(
      HOME_PAGE_CONTENT_QUERY,
      {},
      SANITY_FETCH_OPTIONS,
    );

    const bandByVariant: HomeCmsContent['bandByVariant'] = {};
    if (Array.isArray(data?.productBands)) {
      for (const band of data.productBands) {
        if (band?.variant !== 'primary' && band?.variant !== 'secondary') continue;
        if (bandByVariant[band.variant]) continue;

        bandByVariant[band.variant] = {
          ctaLabel: asNonEmptyString(band?.ctaLabel),
          bgImage: asNonEmptyString(
            imageSrc(band?.sectionBackgroundImage, '', { width: 2400, quality: 76 }),
          ),
          packageImage: asNonEmptyString(
            imageSrc(band?.productLabelImage, '', { width: 2400, quality: 80 }),
          ),
          mobilePackageImage: asNonEmptyString(
            imageSrc(band?.productLabelMobileImage, '', { width: 1800, quality: 80 }),
          ),
          ctaBackgroundImage: asNonEmptyString(
            imageSrc(band?.ctaBackgroundImage, '', { width: 1400, quality: 80 }),
          ),
        };
      }
    }

    const reviewBubbleTexts = Array.isArray(data?.reviewBubbles)
      ? data.reviewBubbles
          .map((bubble) => asNonEmptyString(bubble?.text))
          .filter((text): text is string => Boolean(text))
          .slice(0, 4)
      : [];

    return {
      hero: {
        src: imageSrc(data?.heroImage, DEFAULT_HOME_CONTENT.hero.src),
        alt: asNonEmptyString(data?.heroImageAlt) || DEFAULT_HOME_CONTENT.hero.alt,
        titleLine1: asNonEmptyString(data?.heroTitleLine1) || DEFAULT_HOME_CONTENT.hero.titleLine1,
        titleLine2: asNonEmptyString(data?.heroTitleLine2) || DEFAULT_HOME_CONTENT.hero.titleLine2,
      },
      intro: {
        headlineLine1:
          asNonEmptyString(data?.introHeadlineLine1) || DEFAULT_HOME_CONTENT.intro.headlineLine1,
        headlineLine2:
          asNonEmptyString(data?.introHeadlineLine2) || DEFAULT_HOME_CONTENT.intro.headlineLine2,
        bodyLine1: asNonEmptyString(data?.introBodyLine1) || DEFAULT_HOME_CONTENT.intro.bodyLine1,
        bodyLine2: asNonEmptyString(data?.introBodyLine2) || DEFAULT_HOME_CONTENT.intro.bodyLine2,
        readRantImage: {
          src: imageSrc(data?.readRantImage, DEFAULT_HOME_CONTENT.intro.readRantImage.src, {
            width: 1400,
            quality: 80,
          }),
          alt:
            asNonEmptyString(data?.readRantImageAlt) ||
            DEFAULT_HOME_CONTENT.intro.readRantImage.alt,
        },
        readRantCtaLabel:
          asNonEmptyString(data?.readRantCtaLabel) || DEFAULT_HOME_CONTENT.intro.readRantCtaLabel,
      },
      bandByVariant,
      posterItems: toCmsImageItems(data?.posters, { width: 1400, quality: 80 }).slice(0, 4),
      horizontalItems: toCmsImageItems(data?.horizontalGallery, { width: 1400, quality: 80 }).slice(
        0,
        7,
      ),
      reviewBubbleTexts,
    };
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

function TopWave() {
  return (
    <svg
      viewBox="0 0 1440 140"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-0 top-0 z-20 h-[90px] w-full md:h-[120px]"
      aria-hidden
    >
      <path
        d="M0 0H1440V74C1310 96 1220 40 1096 62C908 95 730 120 538 74C348 30 184 100 0 74V0Z"
        fill="#E9ECD9"
      />
    </svg>
  );
}

function BottomWave() {
  return (
    <svg
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-0 left-0 z-20 h-[92px] w-full md:h-[130px]"
      aria-hidden
    >
      <path
        d="M0 44C118 10 252 78 424 52C622 22 760 92 980 50C1154 16 1308 70 1440 44V160H0V44Z"
        fill="#E9ECD9"
      />
    </svg>
  );
}

function ProductBand({
  bgImage,
  packageImage,
  mobilePackageImage,
  packageAspectRatio,
  priceLabel,
  discountedPriceLabel,
  ctaLabel,
  href,
  ctaBackgroundImage,
  ctaClassName,
  ctaAlignClass,
  ctaOffsetClass,
  mobilePackageWidthClass,
  mobilePackageSizes,
  showTopWave,
  showBottomWave,
}: ProductBandProps) {
  const mobileImage = mobilePackageImage || packageImage;

  return (
    <article className="relative w-full overflow-hidden">
      <div className="relative h-[560px] w-full sm:h-[620px] md:h-[760px] lg:h-[840px]">
        <Image
          src={bgImage}
          alt="product section background"
          fill
          sizes="100vw"
          quality={72}
          className="object-cover object-center"
        />

        {showTopWave ? <TopWave /> : null}

        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
          <div
            className={`relative left-1/2 max-w-none -translate-x-1/2 md:left-auto md:mx-auto md:w-[min(86vw,1360px)] md:translate-x-0 lg:w-[min(80vw,1420px)] ${mobilePackageWidthClass}`}
            style={{ aspectRatio: packageAspectRatio }}
          >
            <Image
              src={packageImage}
              alt="product packaging strip"
              fill
              sizes="(max-width: 768px) 96vw, (max-width: 1024px) 86vw, 80vw"
              quality={78}
              className="hidden object-contain object-center md:block"
            />
            <Image
              src={mobileImage}
              alt="product packaging strip"
              fill
              sizes={mobilePackageSizes}
              quality={78}
              className="object-contain object-center md:hidden"
            />
          </div>

          <div
            className={`mx-auto flex w-[min(88vw,1120px)] md:w-[min(78vw,1160px)] lg:w-[min(72vw,1220px)] ${ctaOffsetClass} ${ctaAlignClass}`}
          >
            <Link
              href={href}
              className={`inline-flex min-h-[54px] items-center rounded-full bg-cover bg-center bg-no-repeat px-8 py-3 text-[clamp(1.7rem,3.1vw,2.9rem)] leading-[1] font-schoolbell transition md:min-h-[70px] md:px-12 ${ctaClassName}`}
              style={{ backgroundImage: `url(${ctaBackgroundImage})` }}
            >
              <span className="text-[0.88em] sm:text-[0.92em] md:text-[0.95em] lg:text-[1em]">{ctaLabel}</span>
              {discountedPriceLabel ? (
                <span className="ml-2 inline-flex flex-col items-start leading-none">
                  <span
                    className="inline-block text-[0.44em] text-[#7F1818] opacity-90"
                    style={{
                      textDecorationLine: 'line-through',
                      textDecorationColor: '#DC2626',
                      textDecorationThickness: '2px',
                    }}
                  >
                    {priceLabel}
                  </span>
                  <span className="text-[0.6em] opacity-95">{discountedPriceLabel}</span>
                </span>
              ) : (
                <span className="ml-2 text-[0.6em] leading-none opacity-90">{priceLabel}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {showBottomWave ? <BottomWave /> : null}
    </article>
  );
}

export default async function HomePage() {
  const [{ hrefByVariant, priceByVariant }, homeContent] = await Promise.all([
    getHomeCtaByVariant(),
    getHomeCmsContent(),
  ]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="relative mx-auto w-full max-w-[1600px]">
        <div className="relative aspect-video w-full md:aspect-auto md:h-[78vh] md:min-h-[660px]">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={homeContent.hero.src}
              alt={homeContent.hero.alt}
              fill
              priority
              sizes="100vw"
              quality={78}
              className="object-contain object-center md:object-cover"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
            <div className="mx-auto w-full max-w-[1260px] px-4 text-left sm:px-6 md:px-10">
              <h1 className="leading-[0.9]">
                <CoolRascalText
                  as="span"
                  text={homeContent.hero.titleLine1}
                  className="block text-[clamp(2.25rem,8vw,3.25rem)] md:text-[clamp(2rem,5vw,4.8rem)]"
                  pattern="alternate"
                  startWith="base"
                  baseClassName="text-[#4C8B1D]"
                  accentClassName="text-[#EA1970]"
                />
                <CoolRascalText
                  as="span"
                  text={homeContent.hero.titleLine2}
                  className="block text-[clamp(2.55rem,9vw,3.45rem)] md:text-[clamp(2.2rem,6vw,5.6rem)]"
                  pattern="everyThird"
                  offset={1}
                  baseClassName="text-[#4C8B1D]"
                  accentClassName="text-[#EA1970]"
                />
              </h1>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full pb-10 pt-14 md:pb-20 md:pt-20">
        <div className="w-full">
          {homeBands.map((band) => {
            const href = hrefByVariant[band.styleVariant] ?? band.fallbackHref;
            const variantPrice = priceByVariant[band.styleVariant];
            const priceLabel = variantPrice?.priceLabel ?? band.priceLabel;
            const cmsBand = homeContent.bandByVariant[band.styleVariant];

            return (
              <ProductBand
                key={band.id}
                {...band}
                href={href}
                priceLabel={priceLabel}
                discountedPriceLabel={variantPrice?.discountedPriceLabel}
                ctaLabel={cmsBand?.ctaLabel ?? band.ctaLabel}
                bgImage={cmsBand?.bgImage ?? band.bgImage}
                packageImage={cmsBand?.packageImage ?? band.packageImage}
                mobilePackageImage={cmsBand?.mobilePackageImage}
                ctaBackgroundImage={cmsBand?.ctaBackgroundImage ?? band.ctaBackgroundImage}
              />
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-2 md:px-10 md:pb-28 md:pt-12">
        <div className="max-w-[820px] text-left text-[clamp(2rem,3.6vw,4.6rem)] leading-[1.06]">
          <CoolRascalText
            as="span"
            text={homeContent.intro.headlineLine1}
            className="block"
            pattern="alternate"
            startWith="base"
            baseClassName="text-[#191919]"
            accentClassName="text-[#191919]"
          />
          <CoolRascalText
            as="span"
            text={homeContent.intro.headlineLine2}
            className="block"
            pattern="alternate"
            startWith="accent"
            baseClassName="text-[#191919]"
            accentClassName="text-[#191919]"
          />
        </div>

        <div className="mt-8 md:mt-12">
          <div className="flex flex-col items-center gap-7 md:flex-row md:items-center md:justify-start md:gap-12 lg:gap-16">
            <div className="w-full md:w-auto md:shrink-0">
              <CrybabyVisual
                rotateClass="home-readmyrant-edge-align"
                fluidPositionClass="left-[63%] top-[44%]"
                imageSrc={homeContent.intro.readRantImage.src}
                imageAlt={homeContent.intro.readRantImage.alt}
              />
            </div>

            <div className="flex w-full max-w-[760px] flex-col items-center gap-6 md:items-center md:gap-8">
              <p className="text-center text-[clamp(2rem,3.2vw,4rem)] leading-[1.1] text-[#1D1D1D] font-schoolbell md:text-left">
                {homeContent.intro.bodyLine1}
                <br />
                {homeContent.intro.bodyLine2}
              </p>

              <Link
                href="/about"
                className="inline-flex w-[min(92vw,540px)] aspect-[256/67] items-center justify-center bg-[url('/home/readmyrantcta.svg')] bg-contain bg-center bg-no-repeat px-8 text-center text-[clamp(1.65rem,2.8vw,2.9rem)] leading-none text-[#FFF8F8] font-schoolbell transition duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E61E7A] md:text-[clamp(1.8rem,3vw,3.3rem)]"
              >
                <span className="relative -translate-y-[4px] md:-translate-y-px">
                  {homeContent.intro.readRantCtaLabel}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-2 pb-0 md:px-8 md:pb-10">
        <HomePosterPinboard items={homeContent.posterItems} />
      </section>

      <section className="w-full  md:pb-12">
        <div className="relative mx-auto h-[220px] w-full max-w-[1240px] sm:h-[260px] md:h-[320px] lg:h-[390px]">
          <Image
            src="/home/freshingredients.svg"
            alt="Fresh ingredients visual"
            fill
            className="object-cover object-[center_46%]"
          />
        </div>
      </section>

      <HomeHorizontalImageScroll items={homeContent.horizontalItems} />
      <HomeReviewPhoneSection bubbleTexts={homeContent.reviewBubbleTexts} />

      <SiteFooter />
    </main>
  );
}
