import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import { CoolRascalText } from '../components/MixedFont';
import QuickBuyButton from '../components/cart/QuickBuyButton';
import { sanityClient } from '@/src/lib/sanity/client';
import { urlFor } from '@/src/lib/sanity/image';
import AnimatedFlavorMeters, { type FlavorMeter } from '../components/product/AnimatedFlavorMeters';
import ProductWordByWordReveal from '../components/product/ProductWordByWordReveal';
import HomeReviewPhoneSection from '../components/home/HomeReviewPhoneSection';

export const dynamic = 'force-dynamic';

type StyleVariant = 'primary' | 'secondary';

type ProductCard = {
  slug: string;
  title: string;
  accent: string;
  suffix?: string;
  price: string;
  hoverLabel: string;
  alwaysShowLabel?: boolean;
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
  hoverLabel?: string;
  alwaysShowLabel?: boolean;
  styleVariant?: StyleVariant;
  splashImage?: unknown;
  jarImage?: unknown;
  leafImage?: unknown;
  titleColor?: string;
  accentColor?: string;
};

const PRODUCTS_QUERY = `*[_type == "product"] | order(sortOrder asc, _createdAt asc) {
  "slug": slug.current,
  titleWord,
  accentWord,
  suffixWord,
  price,
  hoverLabel,
  alwaysShowLabel,
  styleVariant,
  splashImage,
  jarImage,
  leafImage,
  titleColor,
  accentColor
}`;

const FAQ_ITEMS = [
  {
    question: '1. what is it made of?',
    answer:
      'sourboo is made using Cucumis a type of small cucumber (similar to gherkins), sliced and flavoured for that sharp, mouth-watering hit.',
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
] as const;

const PRIMARY_MATCH_METERS: FlavorMeter[] = [
  { label: 'spice', fill: 82, showTail: true },
  { label: 'sour', fill: 100, showTail: false },
  { label: 'crunch', fill: 68, showTail: true },
  { label: 'attitude', fill: 100, showTail: false },
];

const SECONDARY_MATCH_METERS: FlavorMeter[] = [
  { label: 'spice', fill: 84, showTail: true },
  { label: 'tang', fill: 100, showTail: false },
  { label: 'hit', fill: 84, showTail: true },
  { label: 'snaps', fill: 100, showTail: false },
];

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function imageSrc(source: unknown, fallback: string) {
  try {
    return source ? urlFor(source).width(1600).quality(90).url() : fallback;
  } catch {
    return fallback;
  }
}

function toProductCard(doc: SanityProduct, index: number): ProductCard {
  const styleVariant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
  const isSecondary = styleVariant === 'secondary';

  return {
    slug: asNonEmptyString(doc.slug) || `product-${index + 1}`,
    title: asNonEmptyString(doc.titleWord) || (isSecondary ? "tamarin'" : 'side'),
    accent: asNonEmptyString(doc.accentWord) || (isSecondary ? 'tease' : 'eye'),
    suffix: asNonEmptyString(doc.suffixWord) || (isSecondary ? undefined : ''),
    price: asNonEmptyString(doc.price) || '₹399',
    hoverLabel: asNonEmptyString(doc.hoverLabel) || (isSecondary ? 'imli' : 'lemon and\nchaat masala'),
    alwaysShowLabel: Boolean(doc.alwaysShowLabel),
    styleVariant,
    splashImage: imageSrc(doc.splashImage, isSecondary ? '/product/splash-orange.svg' : '/product/splash-green.svg'),
    jarImage: imageSrc(doc.jarImage, isSecondary ? '/product/tamarin-jar.svg' : '/product/side-eye-jar.svg'),
    leafImage: imageSrc(doc.leafImage, isSecondary ? '/product/leaf-mid.svg' : '/product/leaf-top.svg'),
    titleColor: asNonEmptyString(doc.titleColor) || (isSecondary ? '#3E6A18' : '#E61E6E'),
    accentColor: asNonEmptyString(doc.accentColor) || (isSecondary ? '#7FA16D' : '#F18BB7'),
  };
}

async function getProducts(): Promise<ProductCard[]> {
  try {
    const docs = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<SanityProduct[]>(PRODUCTS_QUERY, {}, { cache: 'no-store' });

    if (!Array.isArray(docs) || docs.length === 0) return [];
    return docs.map((doc, index) => toProductCard(doc, index));
  } catch {
    return [];
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
  mode,
}: {
  product: ProductCard;
  index: number;
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
  const jarSizeClass = isDesktop
    ? 'h-[455px] w-[350px] scale-[1.06]'
    : 'h-[385px] w-[285px] scale-[0.9] translate-x-[-6px]';
  const splashTransform = isDesktop
    ? isSecondary
      ? 'translate(7%, 5%) scale(1.3)'
      : 'translate(7%, 9%) scale(1.45)'
    : isSecondary
      ? 'translate(-2%, 4%) scale(1.4)'
      : 'translate(-2%, 8%) scale(1.65)';
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
          unoptimized
          priority={isAboveFoldCard}
          loading={isAboveFoldCard ? 'eager' : 'lazy'}
          className="object-contain"
          style={{ transform: splashTransform, transformOrigin: 'center center' }}
        />
        <div className={`absolute inset-0 flex items-center justify-center ${isDesktop ? 'pt-8' : 'pt-7'}`}>
          <div className={`relative ${jarSizeClass}`}>
            <Image
              src={product.jarImage}
              alt={`${product.title} product jar`}
              fill
              unoptimized
              loading={isAboveFoldCard ? 'eager' : 'lazy'}
              className="object-contain"
            />
          </div>
        </div>
      </Link>

      <div className={titleSizeClass}>
        <ProductTitle product={product} />
      </div>
      <div className={`relative mx-auto mt-1 ${isDesktop ? 'h-[32px] w-[186px]' : 'h-[28px] w-[164px]'}`}>
        <Image src="/product/reviewstars.svg" alt="5 star reviews" fill className="object-contain" />
      </div>
      <p className={`mt-2 text-center leading-none text-[#4a4743] font-coolvetica ${priceSizeClass}`}>{product.price}</p>

      <div className={`flex justify-center ${isDesktop ? 'mt-6' : 'mt-5'}`}>
        <QuickBuyButton
          slug={product.slug}
          name={productName}
          priceLabel={product.price}
          image={product.jarImage}
          className={`group/buy relative inline-flex cursor-pointer items-center justify-center overflow-hidden ${buyWrapperClass}`}
        >
          <Image
            src="/product/buynowbutton.svg"
            alt={`Buy ${productName} now`}
            fill
            className="pointer-events-none object-contain transition-opacity duration-200 group-hover/buy:opacity-0 group-focus-visible/buy:opacity-0"
          />
          <Image
            src="/product/buynowbuttonhover.svg"
            alt=""
            fill
            aria-hidden
            className="pointer-events-none translate-x-[10%] translate-y-[10%] scale-[1.9] object-cover opacity-0 transition-opacity duration-200 group-hover/buy:opacity-100 group-focus-visible/buy:opacity-100 md:translate-x-[13%] md:translate-y-[40%] md:scale-[1.8]"
            style={{ objectPosition: 'center center' }}
          />
        </QuickBuyButton>
      </div>
    </article>
  );
}

export default async function ProductPage() {
  const products = await getProducts();
  const hasProducts = products.length > 0;
  const primaryMatchProduct = products.find((product) => product.styleVariant === 'primary') ?? products[0];
  const secondaryMatchProduct =
    products.find((product) => product.styleVariant === 'secondary') ?? products[1] ?? products[0];
  const primaryMatchHref = primaryMatchProduct ? `/product/${primaryMatchProduct.slug}` : '/product';
  const secondaryMatchHref = secondaryMatchProduct ? `/product/${secondaryMatchProduct.slug}` : '/product';

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9] pt-24 md:pt-28">
      <Navbar />
      <ProductWordByWordReveal />

      <section className="mx-auto w-full max-w-[430px] px-4 pb-12 md:hidden">

        {hasProducts ? (
          <div className="mt-4 grid grid-cols-1 gap-12">
            {products.map((product, index) => (
              <ProductCard key={product.slug} product={product} index={index} mode="mobile" />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-[44px] leading-[1.1] text-[#4a4743] font-coolvetica">
            No products yet.
          </p>
        )}
      </section>

      <section className="hidden md:block">
        <div className="mx-auto w-full max-w-[1440px] px-14 pb-24">
          {hasProducts ? (
            <div className="grid grid-cols-2 items-start gap-8 pt-4">
              {products.map((product, index) => (
                <ProductCard key={product.slug} product={product} index={index} mode="desktop" />
              ))}
            </div>
          ) : (
            <p className="pt-16 text-center text-[42px] leading-[1.1] text-[#4a4743] font-coolvetica">
              No products yet. 
            </p>
          )}
        </div>
      </section>

      <section className="w-full pb-10 pt-14 md:pb-14 md:pt-24">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <CoolRascalText
            as="p"
            text="can't decide?"
            className="product-word-reveal text-center text-[clamp(2.8rem,6.1vw,6.2rem)] leading-[0.95]"
            pattern="alternate"
            startWith="accent"
            baseClassName="text-[#C46C00]"
            accentClassName="text-[#C46C00]"
          />

          <CoolRascalText
            as="p"
            text="let's match you with your flavour ;)"
            className="product-word-reveal mt-7 text-center text-[clamp(2.4rem,5.4vw,5.4rem)] leading-[1.03] md:mt-8"
            pattern="alternate"
            startWith="accent"
            baseClassName="text-[#76B10F]"
            accentClassName="text-[#76B10F]"
          />

          <div className="relative mx-auto mt-6 h-[110px] w-[150px] md:mt-8 md:h-[150px] md:w-[200px]">
            <Image src="/product/productpath1.svg" alt="green path illustration" fill className="object-contain" />
          </div>

          <p className="product-word-reveal mx-auto mt-2 max-w-[390px] text-center text-[clamp(2rem,4.9vw,4.9rem)] leading-[1.03] text-[#A46BC4] font-schoolbell md:mt-4 md:max-w-[860px]">
            if you dislike sweet snacks
            <br />
            and you add extra chilli
            <br />
            without tasting
          </p>
        </div>
      </section>

      <section className="w-full pb-10 pt-2 md:pb-14 md:pt-4">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <div className="flex items-end gap-2 md:items-center md:gap-12">
            <div className="relative h-[185px] w-[130px] shrink-0 md:h-[320px] md:w-[232px]">
              <Image src="/product/player1.svg" alt="girl illustration" fill className="object-contain" />
            </div>

            <AnimatedFlavorMeters meters={PRIMARY_MATCH_METERS} className="flex-1 space-y-4 md:space-y-5" />
          </div>
        </div>
      </section>

      <section className="w-full pb-28 pt-2 md:pb-36 md:pt-4">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <div className="relative mx-auto h-[112px] w-[152px] md:h-[146px] md:w-[210px]">
            <Image
              src="/product/productpath.svg"
              alt="green path illustration"
              fill
              className="object-contain"
            />
          </div>

          <p className="mt-3 text-center text-[1.95rem] leading-[1.02] text-[#E61E6E] font-schoolbell md:mt-6 md:text-[clamp(2.3rem,4.8vw,5.2rem)]">
            selection locked:
          </p>
          <div className="relative mx-auto w-full max-w-[250px] md:max-w-[500px] lg:max-w-[580px]">
            <div className="pointer-events-none absolute -left-[21%] top-[52%] z-20 h-[178px] w-[136px] -translate-y-1/2 -rotate-[20deg] md:-left-[19%] md:h-[280px] md:w-[210px] lg:-left-[18%] lg:h-[320px] lg:w-[240px]">
              <Image src="/product/side-eye-jar.svg" alt="" fill aria-hidden className="object-contain" />
            </div>

            <Link
              href={primaryMatchHref}
              aria-label="Open side eye sour"
              className="group block w-full transition-transform duration-200 hover:scale-[1.015] focus-visible:scale-[1.015]"
            >
              <div className="relative w-full aspect-[363/229]">
                <Image src="/product/sideeyectabg.svg" alt="" fill aria-hidden className="object-contain" />
                <div className="relative z-10 flex h-full items-center justify-center px-6 py-8 text-center md:px-12 md:py-10">
                  <p className="whitespace-pre-line text-[1.75rem] leading-[1.02] text-[#E61E6E] font-rascal md:text-[clamp(2.3rem,4.8vw,5.6rem)]">
                    get side eye sour
                    {'\n'}
                    ¬‿¬
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
              <Image src="/product/productpath.svg" alt="green path illustration" fill className="object-contain" />
            </div>

            <p className="product-word-reveal text-center text-[clamp(2.2rem,4.8vw,4.6rem)] leading-[1.03] text-[#A46BC4] font-schoolbell">
              you want tang?
              <br />
              you handle spice!
            </p>
          </div>
        </div>
      </section>

      <section className="w-full pb-10 pt-2 md:pb-14 md:pt-4">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <div className="relative mx-auto w-full max-w-[920px]">
            <div className="pointer-events-none absolute -right-5 top-2 z-20 h-[190px] w-[170px] md:-right-12 md:-top-7 md:h-[330px] md:w-[290px] ">
              <Image src="/product/player2.svg" alt="girl illustration" fill className="object-contain" />
            </div>

            <AnimatedFlavorMeters
              meters={SECONDARY_MATCH_METERS}
              className="space-y-4 pr-10 md:space-y-5 md:pr-[210px]"
            />
          </div>
        </div>
      </section>

      <section className="w-full pb-28 pt-2 md:pb-36 md:pt-4">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <div className="relative mx-auto h-[120px] w-[170px] md:h-[170px] md:w-[230px]">
            <Image src="/product/productpath.svg" alt="green path illustration" fill className="object-contain" />
          </div>

          <div className="relative mx-auto mt-4 w-full max-w-[290px] md:mt-6 md:max-w-[520px] lg:max-w-[600px]">
            <div className="pointer-events-none absolute -right-[20%] top-[66%] z-20 h-[188px] w-[142px] -translate-y-1/2 rotate-[18deg] md:-right-[20%] md:h-[280px] md:w-[212px] lg:-right-[19%] lg:h-[320px] lg:w-[244px]">
              <Image src="/product/tamarin-jar.svg" alt="" fill aria-hidden className="object-contain" />
            </div>

            <Link
              href={secondaryMatchHref}
              aria-label="Open tamarin tease"
              className="group block w-full transition-transform duration-200 hover:scale-[1.015] focus-visible:scale-[1.015]"
            >
              <div className="relative w-full aspect-[390/179]">
                <Image src="/product/tamarinteasectabg.svg" alt="" fill aria-hidden className="object-contain" />
                <div className="relative z-10 flex h-full items-center justify-center px-6 py-8 text-center md:px-14 md:py-12">
                  <p className="whitespace-pre-line text-[2rem] leading-[1.02] text-[#E61E6E] font-rascal md:text-[clamp(2.4rem,4.9vw,5.8rem)]">
                    tamarin tease
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <p className="mt-2 text-center text-[1.9rem] leading-[1.02] text-[#E61E6E] font-schoolbell md:text-[clamp(2.2rem,4.5vw,5.1rem)]">
            makes sense ;)
          </p>
        </div>
      </section>

      <section className="w-full pb-28 -pt-8 md:pb-40 md:pt-20">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1280px] md:px-10">
          <h2 className="mx-auto max-w-[290px] text-center text-[clamp(1.9rem,5.4vw,5.5rem)] leading-[0.95] md:max-w-[920px]">
            <CoolRascalText
              as="span"
              text="get your"
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />{' '}
            <CoolRascalText
              as="span"
              text="FAQs"
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#63A40F]"
              accentClassName="text-[#63A40F]"
            />{' '}
            <CoolRascalText
              as="span"
              text="of what"
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />
            <br />
            <CoolRascalText
              as="span"
              text="you put in ur mouth"
              pattern="alternate"
              startWith="accent"
              baseClassName="text-[#7A3A12]"
              accentClassName="text-[#7A3A12]"
            />
          </h2>

          <div className="mx-auto mt-8 md:mt-12">
            {FAQ_ITEMS.map((item, index) => (
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

      <HomeReviewPhoneSection />

      <SiteFooter />
    </main>
  );
}
