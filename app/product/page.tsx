import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import QuickBuyButton from '@/app/components/cart/QuickBuyButton';
import { sanityClient } from '@/src/lib/sanity/client';
import { urlFor } from '@/src/lib/sanity/image';

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
    suffix: asNonEmptyString(doc.suffixWord) || (isSecondary ? undefined : 'sour'),
    price: '₹399',
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
      ? 'left-[5%] top-2 -rotate-[13deg] text-[50px]'
      : 'left-[40%] top-[58%] -rotate-[8deg] text-[46px]'
    : !isSecondary
      ? 'left-[10%] top-2 -rotate-[14deg] text-[52px]'
      : 'left-[28%] top-[56%] -rotate-[8deg] text-[52px]';

  const cardMarginClass = isDesktop ? 'mt-0' : index === 0 ? 'mt-0' : 'mt-10';

  const labelStateClass = product.alwaysShowLabel
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100';

  const cardSizeClass = isDesktop ? 'h-[530px] w-[500px]' : 'h-[420px] w-[360px]';
  const jarSizeClass = isDesktop
    ? 'h-[430px] w-[330px] scale-[0.95]'
    : 'h-[360px] w-[265px] scale-[0.82] translate-x-[-6px]';
  const splashTransform = isDesktop
    ? isSecondary
      ? 'translate(7%, 5%) scale(1.6)'
      : 'translate(7%, 9%) scale(1.9)'
    : isSecondary
      ? 'translate(-2%, 4%) scale(1.6)'
      : 'translate(-2%, 8%) scale(1.88)';
  const titleSizeClass = isDesktop ? 'md:text-[72px]' : '';
  const priceSizeClass = isDesktop ? 'text-[40px]' : 'text-[36px]';
  const buyWrapperClass = isDesktop ? 'h-[112px] w-[350px]' : 'h-[98px] w-[300px]';
  const buyTextClass = isDesktop ? 'text-[82px]' : 'text-[74px]';
  const isAboveFoldCard = index === 0;

  return (
    <article className={`group relative ${cardMarginClass}`}>
      <p
        className={`pointer-events-none absolute z-20 whitespace-pre-line leading-[1.02] text-[#9f1c74] font-rascal transition-opacity duration-200 ${labelBaseClass} ${labelStateClass}`}
      >
        {product.hoverLabel}
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
      <p className={`mt-2 text-center leading-none text-[#4a4743] font-coolvetica ${priceSizeClass}`}>{product.price}</p>

      <div className={`flex justify-center ${isDesktop ? 'mt-6' : 'mt-5'}`}>
        <QuickBuyButton
          slug={product.slug}
          name={`${product.title} ${product.accent}${product.suffix ? ` ${product.suffix}` : ''}`}
          priceLabel={product.price}
          image={product.jarImage}
          className={`relative inline-flex items-center justify-center ${buyWrapperClass}`}
        >
          <Image src="/product/buy-now-brush.svg" alt="buy now brush" fill className="object-contain" />
          <span className={`relative z-10 leading-none text-[#FFF87A] font-coolvetica ${buyTextClass}`}>
            BUY NOW
          </span>
        </QuickBuyButton>
      </div>
    </article>
  );
}

function PixelMeter({
  label,
  fill,
  showTail = true,
}: {
  label: string;
  fill: number;
  showTail?: boolean;
}) {
  const safeFill = Math.max(0, Math.min(fill, 100));

  return (
    <div>
      <p className="mb-1 text-center text-[clamp(1.65rem,2.4vw,2.6rem)] leading-none text-[#E61E6E] font-rascal">
        {label}
      </p>
      <div className="relative h-4 overflow-hidden border border-[#E61E6E]/40 bg-[#FFE6F2] shadow-[inset_0_0_0_1px_#FFC7DE] md:h-5">
        <div
          className="absolute inset-y-0 left-0 bg-[#E61E6E]"
          style={{
            width: `${safeFill}%`,
            backgroundImage: 'repeating-linear-gradient(90deg, #E61E6E 0 8px, #D8156A 8px 16px)',
            imageRendering: 'pixelated',
          }}
        />
        {showTail ? (
          <div
            className="absolute inset-y-0 right-0 w-[18%]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #FFD8EA 0 3px, #FFF2F8 3px 6px)',
              imageRendering: 'pixelated',
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export default async function ProductPage() {
  const products = await getProducts();
  const hasProducts = products.length > 0;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9] pt-24 md:pt-28">
      <Navbar />

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

      <section className="w-full pb-24 pt-14 md:pb-36 md:pt-24">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <p className="text-center text-[clamp(2.4rem,5.3vw,5.25rem)] leading-[0.95] text-[#C46C00] font-coolvetica">
            can&apos;t decide?
          </p>

          <p className="mt-7 text-center text-[clamp(2.1rem,4.6vw,4.5rem)] leading-[1.03] text-[#76B10F] font-rascal md:mt-8">
            let&apos;s match you with your flavour ;)
          </p>

          <div className="relative mx-auto mt-6 h-[110px] w-[150px] md:mt-8 md:h-[150px] md:w-[200px]">
            <Image src="/product/match-path-top.svg" alt="green path illustration" fill className="object-contain" />
          </div>

          <p className="mx-auto mt-2 max-w-[390px] text-center text-[clamp(2rem,4.9vw,4.9rem)] leading-[1.03] text-[#A46BC4] font-coolvetica md:mt-4 md:max-w-[860px]">
            if you dislike sweet snacks
            <br />
            and you add extra chilli
            <br />
            without tasting
          </p>

          <div className="mt-8 flex items-end gap-2 md:mt-12 md:items-center md:gap-12">
            <div className="relative h-[185px] w-[130px] shrink-0 md:h-[320px] md:w-[232px]">
              <Image src="/product/player1.svg" alt="girl illustration" fill className="object-contain" />
            </div>

            <div className="flex-1 space-y-4 md:space-y-5">
              <PixelMeter label="spice" fill={82} showTail />
              <PixelMeter label="sour" fill={100} showTail={false} />
              <PixelMeter label="crunch" fill={68} showTail />
              <PixelMeter label="attitude" fill={100} showTail={false} />
            </div>
          </div>

          <div className="relative mx-auto mt-4 h-[112px] w-[152px] md:mt-8 md:h-[146px] md:w-[210px]">
            <Image
              src="/product/match-path-bottom.svg"
              alt="green path illustration"
              fill
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-3 max-w-[390px] rounded-[42%_58%_51%_49%/44%_40%_60%_56%] border-[5px] border-[#E61E6E] bg-[#F0F574] px-6 py-8 text-center md:mt-6 md:max-w-[880px] md:border-[6px] md:px-12 md:py-10">
            <p className="whitespace-pre-line text-[clamp(2.3rem,4.8vw,5.6rem)] leading-[1.02] text-[#E61E6E] font-rascal">
              selection locked:
              {'\n'}
              side eye sour
              {'\n'}
              ^_^
            </p>
          </div>
        </div>
      </section>

      <section className="w-full pb-28 pt-10 md:pb-36 md:pt-16">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1360px] md:px-12">
          <div className="relative mx-auto w-full max-w-[920px]">
            <div className="pointer-events-none absolute -left-2 -top-18 h-[84px] w-[92px] -rotate-[18deg] md:h-[120px] md:w-[132px]">
              <Image src="/product/match-path-top.svg" alt="green path illustration" fill className="object-contain" />
            </div>

            <p className="text-center text-[clamp(2.2rem,4.8vw,4.6rem)] leading-[1.03] text-[#A46BC4] font-rascal">
              you want tang?
              <br />
              you handle spice!
            </p>

            <div className="relative mt-4 md:mt-6">
              <div className="pointer-events-none absolute -right-5 top-2 z-20 h-[190px] w-[170px] md:-right-12 md:-top-7 md:h-[330px] md:w-[290px] ">
                <Image src="/product/player2.svg" alt="girl illustration" fill className="object-contain" />
              </div>

              <div className="space-y-4 pr-10 md:space-y-5 md:pr-[210px]">
                <PixelMeter label="spice" fill={84} showTail />
                <PixelMeter label="tang" fill={100} showTail={false} />
                <PixelMeter label="hit" fill={84} showTail />
                <PixelMeter label="snaps" fill={100} showTail={false} />
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-6 h-[120px] w-[170px] md:mt-8 md:h-[170px] md:w-[230px]">
            <Image src="/product/match-path-bottom.svg" alt="green path illustration" fill className="object-contain" />
          </div>

          <div className="mx-auto mt-4 max-w-[430px] rounded-[42%_58%_51%_49%/44%_40%_60%_56%] border-[5px] border-[#E61E6E] bg-[#BFE65A] px-6 py-8 text-center md:mt-6 md:max-w-[920px] md:border-[6px] md:px-14 md:py-12">
            <p className="whitespace-pre-line text-[clamp(2.4rem,4.9vw,5.8rem)] leading-[1.02] text-[#E61E6E] font-rascal">
              tamarin tease.
              {'\n'}
              makes sense. ;)
            </p>
          </div>
        </div>
      </section>

      <section className="w-full pb-28 pt-10 md:pb-40 md:pt-20">
        <div className="mx-auto w-full max-w-[430px] px-4 md:max-w-[1080px] md:px-10">
          <h2 className="mx-auto max-w-[390px] text-center text-[clamp(2.8rem,5.4vw,5.5rem)] leading-[0.95] font-coolvetica text-[#7A3A12] md:max-w-[920px]">
            get your <span className="text-[#63A40F]">FAQs</span> of what
            <br />
            you put in ur mouth
          </h2>

          <div className="mx-auto mt-8 md:mt-12">
            {FAQ_ITEMS.map((item, index) => (
              <details key={item.question} className={`${index === 0 ? '' : 'mt-8 md:mt-12'}`}>
                <summary
                  className="mx-auto max-w-[400px] cursor-pointer list-none border-[5px] border-[#E61E6E] bg-[#DDF0B7] px-6 py-5 text-center md:max-w-[940px] md:border-[6px] md:px-10 md:py-7 [&::-webkit-details-marker]:hidden"
                  style={{ borderRadius: '57% 43% 52% 48% / 40% 62% 38% 60%' }}
                >
                  <p className="text-[clamp(2.1rem,3.9vw,4rem)] leading-[1.02] text-[#151515] font-schoolbell">
                    {item.question}
                  </p>
                </summary>

                <div className="mx-auto mt-4 w-full max-w-[420px] px-3 md:mt-6 md:max-w-[940px] md:px-10">
                  <p
                    className="mx-auto max-w-[88%] break-words text-center text-[#1F1F1F] font-schoolbell"
                    style={{ fontSize: 'clamp(1.55rem, 2.45vw, 3.1rem)', lineHeight: 1.12 }}
                  >
                    {item.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
