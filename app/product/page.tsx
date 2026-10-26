import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import { CoolRascalText } from '../components/MixedFont';
import QuickBuyButton from '../components/cart/QuickBuyButton';
import { CATALOG_PRODUCTS } from '@/src/lib/catalog/products';
import { sanityClient } from '@/src/lib/sanity/client';
import { sanityImageOrFileUrl } from '@/src/lib/sanity/image';
import { calculateDiscountedRupees, formatInr, normalizeDiscountPercent, parsePriceLabel } from '@/src/lib/cart/price';
import AnimatedFlavorMeters, { type FlavorMeter } from '../components/product/AnimatedFlavorMeters';
import ProductWordByWordReveal from '../components/product/ProductWordByWordReveal';
import HomeReviewPhoneSection from '../components/home/HomeReviewPhoneSection';
import type { Metadata } from 'next';

export const revalidate = 300;

const productPageTitle = 'Sourboo | Spicy Sour Gherkin Snacks & Pickled Snacks';
const productPageDescription =
  'Sourboo makes spicy-sour gherkin snacks and snackable pickles for people obsessed with tangy munchies, cocktails and bold snacking. Perfect for burgers, sandwiches and cocktail garnishes.';

export const metadata: Metadata = {
  alternates: { canonical: '/product' },
  title: {
    absolute: productPageTitle,
  },
  description: productPageDescription,
  openGraph: {
    title: productPageTitle,
    description: productPageDescription,
    url: '/product',
  },
  twitter: {
    title: productPageTitle,
    description: productPageDescription,
  },
};

type StyleVariant = 'primary' | 'secondary';

type ProductCard = {
  slug: string;
  title: string;
  accent: string;
  suffix?: string;
  price: string;
  discountedPrice?: string;
  cartPrice: string;
  hoverLabel: string;
  alwaysShowLabel?: boolean;
  jarCount?: number;
  splashImage: string;
  jarImage: string;
  leafImage: string;
  titleColor: string;
  accentColor: string;
  styleVariant: StyleVariant;
};

type SanityProduct = {
  slug?: string;
  titleWord?: string;
  accentWord?: string;
  suffixWord?: string;
  price?: string;
  discountPercent?: number;
  hoverLabel?: string;
  alwaysShowLabel?: boolean;
  jarCount?: number;
  styleVariant?: StyleVariant;
  splashImage?: unknown;
  jarImage?: unknown;
  leafImage?: unknown;
  titleColor?: string;
  accentColor?: string;
};

type ProductPageMeterQuery = {
  label?: string;
  fill?: number;
  showTail?: boolean;
};

type ProductPageFaqItemQuery = {
  question?: string;
  answer?: string;
};

type ProductPageReviewBubbleQuery = {
  text?: string;
};

type ProductPageQueryResult = {
  emptyStateText?: string;
  showFlavorMatchSection?: boolean;
  matchIntroHeadingTop?: string;
  matchIntroHeadingBottom?: string;
  matchIntroPathImage?: unknown;
  matchIntroPathImageAlt?: string;
  matchIntroBody?: string;

  primaryPlayerImage?: unknown;
  primaryPlayerImageAlt?: string;
  primaryMeters?: ProductPageMeterQuery[];
  primarySelectionPathImage?: unknown;
  primarySelectionPathImageAlt?: string;
  primarySelectionHeading?: string;
  primarySelectionJarImage?: unknown;
  primarySelectionJarImageAlt?: string;
  primarySelectionCtaBackgroundImage?: unknown;
  primarySelectionCtaBackgroundImageAlt?: string;
  primarySelectionCtaText?: string;
  primarySelectionCtaAriaLabel?: string;

  secondaryPromptPathImage?: unknown;
  secondaryPromptPathImageAlt?: string;
  secondaryPromptText?: string;
  secondaryPlayerImage?: unknown;
  secondaryPlayerImageAlt?: string;
  secondaryMeters?: ProductPageMeterQuery[];
  secondarySelectionPathImage?: unknown;
  secondarySelectionPathImageAlt?: string;
  secondarySelectionJarImage?: unknown;
  secondarySelectionJarImageAlt?: string;
  secondarySelectionCtaBackgroundImage?: unknown;
  secondarySelectionCtaBackgroundImageAlt?: string;
  secondarySelectionCtaText?: string;
  secondarySelectionCtaAriaLabel?: string;
  secondaryClosingText?: string;

  faqHeadingPart1?: string;
  faqHeadingPart2?: string;
  faqHeadingPart3?: string;
  faqHeadingPart4?: string;
  faqItems?: ProductPageFaqItemQuery[];

  reviewBubbles?: ProductPageReviewBubbleQuery[];
} | null;

type ProductImage = {
  src: string;
  alt: string;
};

type ProductFaqItem = {
  question: string;
  answer: string;
};

type ProductPageContent = {
  emptyStateText: string;
  showFlavorMatchSection: boolean;
  matchIntro: {
    headingTop: string;
    headingBottom: string;
    pathImage: ProductImage;
    body: string;
  };
  primaryMatch: {
    playerImage: ProductImage;
    meters: FlavorMeter[];
    pathImage: ProductImage;
    selectionHeading: string;
    jarImage: ProductImage;
    ctaBackgroundImage: ProductImage;
    ctaText: string;
    ctaAriaLabel: string;
  };
  secondaryMatch: {
    promptPathImage: ProductImage;
    promptText: string;
    playerImage: ProductImage;
    meters: FlavorMeter[];
    pathImage: ProductImage;
    jarImage: ProductImage;
    ctaBackgroundImage: ProductImage;
    ctaText: string;
    ctaAriaLabel: string;
    closingText: string;
  };
  faq: {
    headingPart1: string;
    headingPart2: string;
    headingPart3: string;
    headingPart4: string;
    items: ProductFaqItem[];
  };
  reviewBubbleTexts: string[];
};

const PRODUCT_PAGE_CONTENT_QUERY = `*[_type == "productPage"] | order(_updatedAt desc)[0]{
  emptyStateText,
  showFlavorMatchSection,
  matchIntroHeadingTop,
  matchIntroHeadingBottom,
  "matchIntroPathImage": coalesce(matchIntroPathImageSvg.asset->url, matchIntroPathImage),
  matchIntroPathImageAlt,
  matchIntroBody,

  "primaryPlayerImage": coalesce(primaryPlayerImageSvg.asset->url, primaryPlayerImage),
  primaryPlayerImageAlt,
  primaryMeters[]{
    label,
    fill,
    showTail
  },
  "primarySelectionPathImage": coalesce(primarySelectionPathImageSvg.asset->url, primarySelectionPathImage),
  primarySelectionPathImageAlt,
  primarySelectionHeading,
  "primarySelectionJarImage": coalesce(primarySelectionJarImageSvg.asset->url, primarySelectionJarImage),
  primarySelectionJarImageAlt,
  "primarySelectionCtaBackgroundImage": coalesce(primarySelectionCtaBackgroundImageSvg.asset->url, primarySelectionCtaBackgroundImage),
  primarySelectionCtaBackgroundImageAlt,
  primarySelectionCtaText,
  primarySelectionCtaAriaLabel,

  "secondaryPromptPathImage": coalesce(secondaryPromptPathImageSvg.asset->url, secondaryPromptPathImage),
  secondaryPromptPathImageAlt,
  secondaryPromptText,
  "secondaryPlayerImage": coalesce(secondaryPlayerImageSvg.asset->url, secondaryPlayerImage),
  secondaryPlayerImageAlt,
  secondaryMeters[]{
    label,
    fill,
    showTail
  },
  "secondarySelectionPathImage": coalesce(secondarySelectionPathImageSvg.asset->url, secondarySelectionPathImage),
  secondarySelectionPathImageAlt,
  "secondarySelectionJarImage": coalesce(secondarySelectionJarImageSvg.asset->url, secondarySelectionJarImage),
  secondarySelectionJarImageAlt,
  "secondarySelectionCtaBackgroundImage": coalesce(secondarySelectionCtaBackgroundImageSvg.asset->url, secondarySelectionCtaBackgroundImage),
  secondarySelectionCtaBackgroundImageAlt,
  secondarySelectionCtaText,
  secondarySelectionCtaAriaLabel,
  secondaryClosingText,

  faqHeadingPart1,
  faqHeadingPart2,
  faqHeadingPart3,
  faqHeadingPart4,
  faqItems[]{
    question,
    answer
  },

  reviewBubbles[]{
    text
  }
}`;

const DEFAULT_PRIMARY_MATCH_METERS: FlavorMeter[] = [
  { label: 'spice', fill: 82, showTail: true },
  { label: 'sour', fill: 100, showTail: false },
  { label: 'crunch', fill: 68, showTail: true },
  { label: 'attitude', fill: 100, showTail: false },
];

const DEFAULT_SECONDARY_MATCH_METERS: FlavorMeter[] = [
  { label: 'spice', fill: 84, showTail: true },
  { label: 'tang', fill: 100, showTail: false },
  { label: 'hit', fill: 84, showTail: true },
  { label: 'snaps', fill: 100, showTail: false },
];

const DEFAULT_FAQ_ITEMS: ProductFaqItem[] = [
  {
    question: '1. what is it made of?',
    answer:
      'sourboo is made using sliced gherkins, flavoured for that sharp, mouth-watering hit.',
  },
  {
    question: '2. is sourboo vegetarian?',
    answer: 'yes!! 100% vegetarian',
  },
  {
    question: '3. is this a pickle?',
    answer: "nope not in the traditional sense. it's not meant to sit quietly next to your meal.",
  },
  {
    question: '4. how do i eat it?',
    answer:
      'straight from the jar. no cooking needed. add it to chaat or snacks if you want but it holds its own.',
  },
  {
    question: '5. how should i store it?',
    answer:
      'store in a cool, dry place and once opened, refrigerate and keep the lid closed properly.',
  },
];

const DEFAULT_PRODUCT_PAGE_CONTENT: ProductPageContent = {
  emptyStateText: 'No products yet.',
  showFlavorMatchSection: true,
  matchIntro: {
    headingTop: "can't decide?",
    headingBottom: "let's match you with your flavour ;)",
    pathImage: {
      src: '/product/productpath1.svg',
      alt: 'green path illustration',
    },
    body: 'if you dislike sweet snacks\nand you add extra chilli\nwithout tasting',
  },
  primaryMatch: {
    playerImage: {
      src: '/product/player1.svg',
      alt: 'girl illustration',
    },
    meters: DEFAULT_PRIMARY_MATCH_METERS,
    pathImage: {
      src: '/product/productpath.svg',
      alt: 'green path illustration',
    },
    selectionHeading: 'selection locked:',
    jarImage: {
      src: '/product/side-eye-jar.svg',
      alt: 'Side eye jar illustration',
    },
    ctaBackgroundImage: {
      src: '/product/sideeyectabg.svg',
      alt: 'Primary selection background card',
    },
    ctaText: 'get side eye sour\n¬‿¬',
    ctaAriaLabel: 'Open side eye sour',
  },
  secondaryMatch: {
    promptPathImage: {
      src: '/product/productpath.svg',
      alt: 'green path illustration',
    },
    promptText: 'you want tang?\nyou handle spice!',
    playerImage: {
      src: '/product/player2.svg',
      alt: 'girl illustration',
    },
    meters: DEFAULT_SECONDARY_MATCH_METERS,
    pathImage: {
      src: '/product/productpath.svg',
      alt: 'green path illustration',
    },
    jarImage: {
      src: '/product/tamarin-jar.svg',
      alt: 'Tamarin jar illustration',
    },
    ctaBackgroundImage: {
      src: '/product/tamarinteasectabg.svg',
      alt: 'Secondary selection background card',
    },
    ctaText: 'tamarin tease',
    ctaAriaLabel: 'Open tamarin tease',
    closingText: 'makes sense ;)',
  },
  faq: {
    headingPart1: 'get your',
    headingPart2: 'FAQs',
    headingPart3: 'of what',
    headingPart4: 'you put in ur mouth',
    items: DEFAULT_FAQ_ITEMS,
  },
  reviewBubbleTexts: ['', '', '', ''],
};

const sanityClientLive = sanityClient;
const SANITY_FETCH_OPTIONS = { next: { revalidate: 300 } };

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

function toImage(
  source: unknown,
  altValue: unknown,
  fallback: ProductImage,
  options?: { width?: number; quality?: number },
): ProductImage {
  const src = asNonEmptyString(imageSrc(source, '', options)) || fallback.src;
  const alt = asNonEmptyString(altValue) || fallback.alt;

  return { src, alt };
}

function toMeterFill(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toOverridableMeters(
  entries: ProductPageMeterQuery[] | undefined,
  fallbacks: FlavorMeter[],
): FlavorMeter[] {
  return fallbacks.map((fallback, index) => {
    const entry = entries?.[index];

    return {
      label: asNonEmptyString(entry?.label) || fallback.label,
      fill: toMeterFill(entry?.fill, fallback.fill),
      showTail: typeof entry?.showTail === 'boolean' ? entry.showTail : fallback.showTail,
    };
  });
}

function toOverridableFaqItems(
  entries: ProductPageFaqItemQuery[] | undefined,
  fallbacks: ProductFaqItem[],
): ProductFaqItem[] {
  return fallbacks.map((fallback, index) => {
    const entry = entries?.[index];

    return {
      question: asNonEmptyString(entry?.question) || fallback.question,
      answer: asNonEmptyString(entry?.answer) || fallback.answer,
    };
  });
}

function toReviewBubbleTexts(entries: ProductPageReviewBubbleQuery[] | undefined, maxCount: number): string[] {
  return Array.from({ length: maxCount }, (_, index) => asNonEmptyString(entries?.[index]?.text) || '');
}

function toProductCard(doc: SanityProduct, index: number): ProductCard {
  const styleVariant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
  const isSecondary = styleVariant === 'secondary';
  const price = asNonEmptyString(doc.price) || '₹399';
  const parsedPrice = parsePriceLabel(price);
  const discountPercent = normalizeDiscountPercent(doc.discountPercent);
  const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const discountedRupees =
    hasValidPrice && discountPercent
      ? calculateDiscountedRupees(parsedPrice, discountPercent)
      : Math.round(parsedPrice);
  const hasDiscount = Boolean(
    hasValidPrice && discountPercent && discountedRupees > 0 && discountedRupees < Math.round(parsedPrice),
  );
  const discountedPrice = hasDiscount ? formatInr(discountedRupees) : undefined;
  const cartPrice = discountedPrice || price;

  return {
    slug: asNonEmptyString(doc.slug) || `product-${index + 1}`,
    title: asNonEmptyString(doc.titleWord) || (isSecondary ? "tamarin'" : 'side'),
    accent: asNonEmptyString(doc.accentWord) || (isSecondary ? 'tease' : 'eye'),
    suffix: asNonEmptyString(doc.suffixWord) || (isSecondary ? undefined : ''),
    price,
    discountedPrice,
    cartPrice,
    hoverLabel: asNonEmptyString(doc.hoverLabel) || (isSecondary ? 'imli' : 'lemon and\nchaat masala'),
    alwaysShowLabel: Boolean(doc.alwaysShowLabel),
    jarCount: doc.jarCount,
    styleVariant,
    splashImage: imageSrc(doc.splashImage, isSecondary ? '/product/splash-orange.svg' : '/product/splash-green.svg'),
    jarImage: imageSrc(doc.jarImage, isSecondary ? '/product/tamarin-jar.svg' : '/product/side-eye-jar.svg'),
    leafImage: imageSrc(doc.leafImage, isSecondary ? '/product/leaf-mid.svg' : '/product/leaf-top.svg'),
    titleColor: asNonEmptyString(doc.titleColor) || (isSecondary ? '#3E6A18' : '#E61E6E'),
    accentColor: asNonEmptyString(doc.accentColor) || (isSecondary ? '#7FA16D' : '#F18BB7'),
  };
}

async function getProducts(): Promise<ProductCard[]> {
  return CATALOG_PRODUCTS.map((doc, index) => toProductCard(doc, index));
}

async function getProductPageContent(): Promise<ProductPageContent> {
  try {
    const data = await sanityClientLive.fetch<ProductPageQueryResult>(
      PRODUCT_PAGE_CONTENT_QUERY,
      {},
      SANITY_FETCH_OPTIONS,
    );

    return {
      emptyStateText:
        asNonEmptyString(data?.emptyStateText) || DEFAULT_PRODUCT_PAGE_CONTENT.emptyStateText,
      showFlavorMatchSection: data?.showFlavorMatchSection !== false,
      matchIntro: {
        headingTop:
          asNonEmptyString(data?.matchIntroHeadingTop) || DEFAULT_PRODUCT_PAGE_CONTENT.matchIntro.headingTop,
        headingBottom:
          asNonEmptyString(data?.matchIntroHeadingBottom) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.matchIntro.headingBottom,
        pathImage: toImage(
          data?.matchIntroPathImage,
          data?.matchIntroPathImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.matchIntro.pathImage,
          { width: 900, quality: 80 },
        ),
        body: asNonEmptyString(data?.matchIntroBody) || DEFAULT_PRODUCT_PAGE_CONTENT.matchIntro.body,
      },
      primaryMatch: {
        playerImage: toImage(
          data?.primaryPlayerImage,
          data?.primaryPlayerImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.playerImage,
          { width: 900, quality: 80 },
        ),
        meters: toOverridableMeters(data?.primaryMeters, DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.meters),
        pathImage: toImage(
          data?.primarySelectionPathImage,
          data?.primarySelectionPathImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.pathImage,
          { width: 900, quality: 80 },
        ),
        selectionHeading:
          asNonEmptyString(data?.primarySelectionHeading) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.selectionHeading,
        jarImage: toImage(
          data?.primarySelectionJarImage,
          data?.primarySelectionJarImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.jarImage,
          { width: 900, quality: 80 },
        ),
        ctaBackgroundImage: toImage(
          data?.primarySelectionCtaBackgroundImage,
          data?.primarySelectionCtaBackgroundImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.ctaBackgroundImage,
          { width: 1200, quality: 80 },
        ),
        ctaText:
          asNonEmptyString(data?.primarySelectionCtaText) || DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.ctaText,
        ctaAriaLabel:
          asNonEmptyString(data?.primarySelectionCtaAriaLabel) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.primaryMatch.ctaAriaLabel,
      },
      secondaryMatch: {
        promptPathImage: toImage(
          data?.secondaryPromptPathImage,
          data?.secondaryPromptPathImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.promptPathImage,
          { width: 900, quality: 80 },
        ),
        promptText:
          asNonEmptyString(data?.secondaryPromptText) || DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.promptText,
        playerImage: toImage(
          data?.secondaryPlayerImage,
          data?.secondaryPlayerImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.playerImage,
          { width: 900, quality: 80 },
        ),
        meters: toOverridableMeters(data?.secondaryMeters, DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.meters),
        pathImage: toImage(
          data?.secondarySelectionPathImage,
          data?.secondarySelectionPathImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.pathImage,
          { width: 900, quality: 80 },
        ),
        jarImage: toImage(
          data?.secondarySelectionJarImage,
          data?.secondarySelectionJarImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.jarImage,
          { width: 900, quality: 80 },
        ),
        ctaBackgroundImage: toImage(
          data?.secondarySelectionCtaBackgroundImage,
          data?.secondarySelectionCtaBackgroundImageAlt,
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.ctaBackgroundImage,
          { width: 1200, quality: 80 },
        ),
        ctaText:
          asNonEmptyString(data?.secondarySelectionCtaText) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.ctaText,
        ctaAriaLabel:
          asNonEmptyString(data?.secondarySelectionCtaAriaLabel) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.ctaAriaLabel,
        closingText:
          asNonEmptyString(data?.secondaryClosingText) ||
          DEFAULT_PRODUCT_PAGE_CONTENT.secondaryMatch.closingText,
      },
      faq: {
        headingPart1:
          asNonEmptyString(data?.faqHeadingPart1) || DEFAULT_PRODUCT_PAGE_CONTENT.faq.headingPart1,
        headingPart2:
          asNonEmptyString(data?.faqHeadingPart2) || DEFAULT_PRODUCT_PAGE_CONTENT.faq.headingPart2,
        headingPart3:
          asNonEmptyString(data?.faqHeadingPart3) || DEFAULT_PRODUCT_PAGE_CONTENT.faq.headingPart3,
        headingPart4:
          asNonEmptyString(data?.faqHeadingPart4) || DEFAULT_PRODUCT_PAGE_CONTENT.faq.headingPart4,
        items: toOverridableFaqItems(data?.faqItems, DEFAULT_PRODUCT_PAGE_CONTENT.faq.items),
      },
      reviewBubbleTexts: toReviewBubbleTexts(data?.reviewBubbles, 4),
    };
  } catch {
    return DEFAULT_PRODUCT_PAGE_CONTENT;
  }
}

function ProductTitle({ product }: { product: ProductCard }) {
  if (product.suffix) {
    return (
      <p className="mt-1 text-center text-[52px] leading-[0.9] font-coolvetica md:text-[66px]" style={{ color: product.titleColor }}>
        {product.title}
        <span className="mx-2 font-rascal" style={{ color: product.accentColor }}>
          {product.accent}
        </span>
        {product.suffix}
      </p>
    );
  }

  return (
    <p className="mt-1 text-center text-[52px] leading-[0.9] font-coolvetica md:text-[66px]">
      <span style={{ color: product.titleColor }}>{product.title}</span>{' '}
      <span className="font-rascal" style={{ color: product.accentColor }}>
        {product.accent}
      </span>
    </p>
  );
}

function ProductCard({
  product,
  index,
  productCount,
  mode,
}: {
  product: ProductCard;
  index: number;
  productCount: number;
  mode: 'mobile' | 'desktop';
}) {
  const isDesktop = mode === 'desktop';
  const isSecondary = product.styleVariant === 'secondary';
  const labelBaseClass = isDesktop
    ? !isSecondary
      ? 'left-[5%] top-12 -rotate-[13deg] text-[46px]'
      : 'left-[5%] top-12 -rotate-[13deg] text-[42px]'
    : !isSecondary
      ? 'left-[2%] top-12 -rotate-[14deg] text-[48px]'
      : 'left-[2%] top-12 -rotate-[14deg] text-[48px]';

  const cardMarginClass = isDesktop ? 'mt-0' : index === 0 ? 'mt-0' : 'mt-10';

  const labelStateClass = product.alwaysShowLabel
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100';

  const cardSizeClass = isDesktop ? 'h-[530px] w-[500px]' : 'h-[420px] w-[360px]';
  const shouldShrinkMobileJar = !isDesktop && index < 2;
  const jarSizeClass = (product.jarCount ?? 1) > 1
    ? isDesktop ? 'h-[300px] w-[420px]' : 'h-[245px] w-[310px]'
    : isDesktop
    ? 'h-[300px] w-[231px]'
    : shouldShrinkMobileJar
      ? 'h-[245px] w-[181px]'
      : 'h-[305px] w-[226px]';
  const shouldShiftMobileSplashRight = !isDesktop && productCount > 2 && index >= productCount - 2;
  const splashTransform = isDesktop
    ? isSecondary
      ? 'translate(7%, 5%) scale(1.6)'
      : 'translate(7%, 9%) scale(1.45)'
    : shouldShiftMobileSplashRight
      ? isSecondary
        ? 'translate(20%, 4%) scale(1.55)'
        : 'translate(20%, 8%) scale(1.82)'
    : isSecondary
      ? 'translate(0%, 4%) scale(1.4)'
      : 'translate(0%, 8%) scale(1.65)';
  const titleSizeClass = isDesktop ? 'md:text-[72px]' : '';
  const priceSizeClass = isDesktop ? 'text-[40px]' : 'text-[36px]';
  const buyWrapperClass = isDesktop ? 'h-[112px] w-[350px]' : 'h-[98px] w-[300px]';
  const isAboveFoldCard = index === 0;
  const productName = `${product.title} ${product.accent}${product.suffix ? ` ${product.suffix}` : ''}`;
  const hoverLabelText =
    !isSecondary && !product.hoverLabel.includes('\n')
      ? product.hoverLabel.replace(/\s+and\s+/i, ' and\n')
      : product.hoverLabel;

  return (
    <article className={`group relative ${cardMarginClass}`}>
      <p
        className={`pointer-events-none absolute z-20 whitespace-pre-line leading-[1.02] text-[#9f1c74] font-rascal transition-opacity duration-200 ${labelBaseClass} ${labelStateClass}`}
      >
        {hoverLabelText}
      </p>

      <Link
        href={`/product/${product.slug}`}
        aria-label={`Open ${product.title} ${product.accent}`}
        className={`relative mx-auto block ${cardSizeClass}`}
      >
        <Image
          src={product.splashImage}
          alt="paint splash"
          fill
          priority={isAboveFoldCard}
          loading={isAboveFoldCard ? 'eager' : 'lazy'}
          sizes={isDesktop ? '500px' : '360px'}
          quality={80}
          className="object-contain"
          style={{ transform: splashTransform, transformOrigin: 'center center' }}
        />
        <div className={`absolute inset-0 flex items-center justify-center ${isDesktop ? 'pt-8' : 'pt-7'}`}>
          <div className={`relative ${jarSizeClass}`}>
            <Image
              src={product.jarImage}
              alt={`${product.title} product jar`}
              fill
              loading={isAboveFoldCard ? 'eager' : 'lazy'}
              sizes={(product.jarCount ?? 1) > 1 ? '(min-width: 768px) 420px, 310px' : isDesktop ? '231px' : shouldShrinkMobileJar ? '181px' : '226px'}
              quality={82}
              className="object-contain"
            />
          </div>
        </div>
      </Link>

      <div className={titleSizeClass}>
        <ProductTitle product={product} />
      </div>
      <div className={`relative mx-auto mt-1 ${isDesktop ? 'h-[32px] w-[186px]' : 'h-[28px] w-[164px]'}`}>
        <Image
          src="/product/reviewstars.svg"
          alt="5 star reviews"
          fill
          sizes={isDesktop ? '186px' : '164px'}
          className="object-contain"
        />
      </div>
      {product.discountedPrice ? (
        <div className="mt-2 flex items-center justify-center gap-3 leading-none">
          <p
            className="inline-block text-[#8A7F74] font-coolvetica"
            style={{
              fontSize: isDesktop ? '34px' : '32px',
              lineHeight: 1,
              textDecorationLine: 'line-through',
              textDecorationColor: '#DC2626',
              textDecorationThickness: '3px',
            }}
          >
            {product.price}
          </p>
          <p className={`text-[#4a4743] font-coolvetica ${priceSizeClass}`}>{product.discountedPrice}</p>
        </div>
      ) : (
        <p className={`mt-2 text-center leading-none text-[#4a4743] font-coolvetica ${priceSizeClass}`}>{product.price}</p>
      )}

      <p className="mt-2 text-center text-[#4a4743] font-schoolbell">+ ₹100 shipping per order</p>
      <div className={`flex justify-center ${isDesktop ? 'mt-6' : 'mt-5'}`}>
        <QuickBuyButton
          slug={product.slug}
          name={productName}
          priceLabel={product.cartPrice}
          image={product.jarImage}
          className={`group/buy relative inline-flex cursor-pointer items-center justify-center overflow-hidden ${buyWrapperClass}`}
        >
          <Image
            src="/product/buynowbutton.svg"
            alt={`Buy ${productName} now`}
            fill
            sizes={isDesktop ? '350px' : '300px'}
            className="pointer-events-none object-contain transition-opacity duration-200 group-hover/buy:opacity-0 group-focus-visible/buy:opacity-0"
          />
          <Image
            src="/product/buynowbuttonhover.svg"
            alt=""
            fill
            aria-hidden
            sizes={isDesktop ? '350px' : '300px'}
            className="pointer-events-none translate-x-[10%] translate-y-[10%] scale-[1.9] object-cover opacity-0 transition-opacity duration-200 group-hover/buy:opacity-100 group-focus-visible/buy:opacity-100 md:translate-x-[13%] md:translate-y-[40%] md:scale-[1.8]"
            style={{ objectPosition: 'center center' }}
          />
        </QuickBuyButton>
      </div>
    </article>
  );
}

export default async function ProductPage() {
  const [products, pageContent] = await Promise.all([getProducts(), getProductPageContent()]);
  const hasProducts = products.length > 0;
  const primaryMatchProduct = products.find((product) => product.styleVariant === 'primary') ?? products[0];
  const secondaryMatchProduct =
    products.find((product) => product.styleVariant === 'secondary') ?? products[1] ?? products[0];
  const primaryMatchHref = primaryMatchProduct ? `/product/${primaryMatchProduct.slug}` : '/product';
  const secondaryMatchHref = secondaryMatchProduct ? `/product/${secondaryMatchProduct.slug}` : '/product';

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9] pt-24 md:pt-28">
      <h1 className="sr-only">Shop Sourboo pickled gherkins and bundles</h1>
      <Navbar />
      <ProductWordByWordReveal />

      <section className="mx-auto w-full max-w-[430px] px-4 pb-12 md:hidden">
        {hasProducts ? (
          <div className="mt-4 grid grid-cols-1 gap-12">
            {products.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
                productCount={products.length}
                mode="mobile"
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[44px] leading-[1.1] text-[#4a4743] font-coolvetica">
            {pageContent.emptyStateText}
          </p>
        )}
      </section>

      <section className="hidden md:block">
        <div className="mx-auto w-full max-w-[1440px] px-14 pb-24">
          {hasProducts ? (
            <div className="grid grid-cols-2 items-start gap-8 pt-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  index={index}
                  productCount={products.length}
                  mode="desktop"
                />
              ))}
            </div>
          ) : (
            <p className="pt-16 text-center text-[42px] leading-[1.1] text-[#4a4743] font-coolvetica">
              {pageContent.emptyStateText}
            </p>
          )}
        </div>
      </section>

      {pageContent.showFlavorMatchSection ? (
        <>
          <section className="w-full pb-10 pt-14 md:pb-14 md:pt-24">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <CoolRascalText
                as="p"
                text={pageContent.matchIntro.headingTop}
                className="product-word-reveal text-center text-[clamp(2.8rem,6.1vw,6.2rem)] leading-[0.95]"
                pattern="alternate"
                startWith="accent"
                baseClassName="text-[#C46C00]"
                accentClassName="text-[#C46C00]"
              />

              <CoolRascalText
                as="p"
                text={pageContent.matchIntro.headingBottom}
                className="product-word-reveal mt-7 text-center text-[clamp(2.4rem,5.4vw,5.4rem)] leading-[1.03] md:mt-8"
                pattern="alternate"
                startWith="accent"
                baseClassName="text-[#76B10F]"
                accentClassName="text-[#76B10F]"
              />

              <div className="relative mx-auto mt-6 h-[110px] w-[150px] md:mt-8 md:h-[150px] md:w-[200px]">
                <Image
                  src={pageContent.matchIntro.pathImage.src}
                  alt={pageContent.matchIntro.pathImage.alt}
                  fill
                  sizes="(max-width: 768px) 150px, 200px"
                  className="object-contain"
                />
              </div>

              <p className="product-word-reveal mx-auto mt-2 max-w-[390px] whitespace-pre-line text-center text-[clamp(2rem,4.9vw,4.9rem)] leading-[1.03] text-[#A46BC4] font-schoolbell md:mt-4 md:max-w-[860px]">
                {pageContent.matchIntro.body}
              </p>
            </div>
          </section>

          <section className="w-full pb-10 pt-2 md:pb-14 md:pt-4">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <div className="flex items-end gap-2 md:items-center md:gap-12">
                <div className="relative h-[300px] w-[211px] shrink-0 md:h-[380px] md:w-[276px]">
                  <Image
                    src={pageContent.primaryMatch.playerImage.src}
                    alt={pageContent.primaryMatch.playerImage.alt}
                    fill
                    sizes="(max-width: 768px) 211px, 276px"
                    className="object-contain"
                  />
                </div>

                <AnimatedFlavorMeters
                  meters={pageContent.primaryMatch.meters}
                  className="flex-1 space-y-4 md:space-y-5"
                />
              </div>
            </div>
          </section>

          <section className="w-full pb-28 pt-2 md:pb-36 md:pt-4">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <div className="relative mx-auto h-[112px] w-[152px] md:h-[146px] md:w-[210px]">
                <Image
                  src={pageContent.primaryMatch.pathImage.src}
                  alt={pageContent.primaryMatch.pathImage.alt}
                  fill
                  sizes="(max-width: 768px) 152px, 210px"
                  className="object-contain"
                />
              </div>

              <p className="mt-3 text-center text-[1.95rem] leading-[1.02] text-[#E61E6E] font-schoolbell md:mt-6 md:text-[clamp(2.3rem,4.8vw,5.2rem)]">
                {pageContent.primaryMatch.selectionHeading}
              </p>
              <div className="relative mx-auto w-full max-w-[250px] md:max-w-[500px] lg:max-w-[580px]">
                <div className="pointer-events-none absolute -left-[17%] top-[52%] z-20 h-[132px] w-[101px] -translate-y-1/2 -rotate-[20deg] md:-left-[15%] md:h-[180px] md:w-[135px] lg:-left-[14%] lg:h-[180px] lg:w-[138px]">
                  <Image
                    src={pageContent.primaryMatch.jarImage.src}
                    alt={pageContent.primaryMatch.jarImage.alt}
                    fill
                    sizes="(max-width: 768px) 101px, 138px"
                    className="object-contain"
                  />
                </div>

                <Link
                  href={primaryMatchHref}
                  aria-label={pageContent.primaryMatch.ctaAriaLabel}
                  className="group block w-full transition-transform duration-200 hover:scale-[1.015] focus-visible:scale-[1.015]"
                >
                  <div className="relative w-full aspect-[363/229]">
                    <Image
                      src={pageContent.primaryMatch.ctaBackgroundImage.src}
                      alt=""
                      fill
                      aria-hidden
                      sizes="(max-width: 768px) 250px, (max-width: 1280px) 500px, 580px"
                      className="object-contain"
                    />
                    <div className="relative z-10 flex h-full items-center justify-center px-6 py-8 text-center md:px-12 md:py-10">
                      <p className="whitespace-pre-line text-[1.75rem] leading-[1.02] text-[#E61E6E] font-rascal md:text-[clamp(2.3rem,4.8vw,5.6rem)]">
                        {pageContent.primaryMatch.ctaText}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <section className="w-full pb-6 pt-10 md:pb-10 md:pt-16">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <div className="relative mx-auto w-full max-w-[920px]">
                <div className="pointer-events-none absolute left-18 -top-32 h-[74px] w-[108px] -rotate-[190deg] md:h-[230px] md:w-[232px]">
                  <Image
                    src={pageContent.secondaryMatch.promptPathImage.src}
                    alt={pageContent.secondaryMatch.promptPathImage.alt}
                    fill
                    sizes="(max-width: 768px) 108px, 232px"
                    className="object-contain"
                  />
                </div>

                <p className="product-word-reveal whitespace-pre-line text-center text-[clamp(2.2rem,4.8vw,4.6rem)] leading-[1.03] text-[#A46BC4] font-schoolbell">
                  {pageContent.secondaryMatch.promptText}
                </p>
              </div>
            </div>
          </section>

          <section className="w-full pb-10 pt-2 md:pb-14 md:pt-4">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <div className="relative mx-auto w-full max-w-[920px]">
                <div className="pointer-events-none absolute right-[-25%] -top-8 z-20 h-[285px] w-[254px] md:-right-16 md:-top-10 md:h-[390px] md:w-[343px] ">
                  <Image
                    src={pageContent.secondaryMatch.playerImage.src}
                    alt={pageContent.secondaryMatch.playerImage.alt}
                    fill
                    sizes="(max-width: 768px) 254px, 343px"
                    className="object-contain"
                  />
                </div>

                <AnimatedFlavorMeters
                  meters={pageContent.secondaryMatch.meters}
                  className="w-[205px] space-y-3 [&>div>div]:h-3 [&>div>p]:mb-0.5 [&>div>p]:text-[1.45rem] md:w-auto md:space-y-5 md:pr-[210px] md:[&>div>div]:h-5 md:[&>div>p]:mb-1 md:[&>div>p]:text-[clamp(1.65rem,2.4vw,2.6rem)]"
                />
              </div>
            </div>
          </section>

          <section className="w-full pb-28 pt-2 md:pb-36 md:pt-4">
            <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
              <div className="relative mx-auto h-[120px] w-[170px] md:h-[170px] md:w-[230px]">
                <Image
                  src={pageContent.secondaryMatch.pathImage.src}
                  alt={pageContent.secondaryMatch.pathImage.alt}
                  fill
                  sizes="(max-width: 768px) 170px, 230px"
                  className="object-contain"
                />
              </div>

              <div className="relative mx-auto mt-4 w-full max-w-[290px] md:mt-6 md:max-w-[520px] lg:max-w-[600px]">
                <div className="pointer-events-none absolute -right-[16%] top-[66%] z-20 h-[136px] w-[96px] -translate-y-1/2 rotate-[18deg] md:-right-[16%] md:h-[180px] md:w-[137px] lg:-right-[15%] lg:h-[180px] lg:w-[140px]">
                  <Image
                    src={pageContent.secondaryMatch.jarImage.src}
                    alt={pageContent.secondaryMatch.jarImage.alt}
                    fill
                    sizes="(max-width: 768px) 96px, 140px"
                    className="object-contain"
                  />
                </div>

                <Link
                  href={secondaryMatchHref}
                  aria-label={pageContent.secondaryMatch.ctaAriaLabel}
                  className="group block w-full transition-transform duration-200 hover:scale-[1.015] focus-visible:scale-[1.015]"
                >
                  <div className="relative w-full aspect-[390/179]">
                    <Image
                      src={pageContent.secondaryMatch.ctaBackgroundImage.src}
                      alt=""
                      fill
                      aria-hidden
                      sizes="(max-width: 768px) 290px, (max-width: 1280px) 520px, 600px"
                      className="object-contain"
                    />
                    <div className="relative z-10 flex h-full items-center justify-center px-6 py-8 text-center md:px-14 md:py-12">
                      <p className="whitespace-pre-line text-[2rem] leading-[1.02] text-[#E61E6E] font-rascal md:text-[clamp(2.4rem,4.9vw,5.8rem)]">
                        {pageContent.secondaryMatch.ctaText}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
              <p className="mt-2 text-center text-[1.9rem] leading-[1.02] text-[#E61E6E] font-schoolbell md:text-[clamp(2.2rem,4.5vw,5.1rem)]">
                {pageContent.secondaryMatch.closingText}
              </p>
            </div>
          </section>
        </>
      ) : null}

      <section className="w-full pb-28 -pt-8 md:pb-40 md:pt-20">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1280px] md:px-10">
          <h2 className="mx-auto max-w-[290px] text-center text-[clamp(1.9rem,5.4vw,5.5rem)] leading-[0.95] md:max-w-[920px]">
            <CoolRascalText
              as="span"
              text={pageContent.faq.headingPart1}
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />{' '}
            <CoolRascalText
              as="span"
              text={pageContent.faq.headingPart2}
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#63A40F]"
              accentClassName="text-[#63A40F]"
            />{' '}
            <CoolRascalText
              as="span"
              text={pageContent.faq.headingPart3}
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />
            <br />
            <CoolRascalText
              as="span"
              text={pageContent.faq.headingPart4}
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />
          </h2>

          <div className="mx-auto mt-8 md:mt-12">
            {pageContent.faq.items.map((item, index) => (
              <details key={item.question} className={`${index === 0 ? '' : 'mt-8 md:mt-12'}`}>
                <summary
                  className="mx-auto w-full max-w-[430px] cursor-pointer list-none bg-[url('/product/faqquestionbg.svg')] bg-center bg-no-repeat bg-[length:100%_100%] px-7 py-6 text-center md:w-[min(96vw,1280px)] md:max-w-none md:px-20 md:py-12 md:min-h-[180px] [&::-webkit-details-marker]:hidden"
                >
                  <p className="text-[clamp(1.1rem,3.9vw,4rem)] leading-[1.02] text-[#151515] font-schoolbell">
                    {item.question}
                  </p>
                </summary>

                <div className="mx-auto mt-4 w-full max-w-[420px] px-3 md:mt-6 md:max-w-[940px] md:px-10">
                  <p
                    className="mx-auto max-w-[88%] break-words text-center text-[#1F1F1F] font-schoolbell"
                    style={{ fontSize: 'clamp(1.1rem, 2.45vw, 3.1rem)', lineHeight: 1.12 }}
                  >
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <HomeReviewPhoneSection bubbleTexts={pageContent.reviewBubbleTexts} />

      <SiteFooter />
    </main>
  );
}
