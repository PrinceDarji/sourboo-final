import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';
import HomeHorizontalImageScroll from '../components/home/HomeHorizontalImageScroll';
import CrybabyVisual from '../components/home/CrybabyVisual';
import HomePosterPinboard from '../components/home/HomePosterPinboard';
import HomeReviewPhoneSection from '../components/home/HomeReviewPhoneSection';
import { sanityClient } from '@/src/lib/sanity/client';
import { CoolRascalText } from '../components/MixedFont';
import { urlFor } from '@/src/lib/sanity/image';

type StyleVariant = 'primary' | 'secondary';

type SanityHomeProduct = {
  slug?: string;
  styleVariant?: StyleVariant;
  price?: string;
};

type HomeHeroQueryResult = {
  heroImage?: unknown;
  heroImageAlt?: string;
} | null;

type HomeBand = {
  id: string;
  bgImage: string;
  packageImage: string;
  packageAspectRatio: number;
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
};

const homeBands: HomeBand[] = [
  {
    id: 'side-eye',
    bgImage: '/home/packagingbg.JPEG',
    packageImage: '/home/sideeyepackage.png',
    packageAspectRatio: 1210 / 274,
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
    bgImage: '/home/packagingbg.JPEG',
    packageImage: '/home/tamarinpackage.png',
    packageAspectRatio: 2314 / 408,
    priceLabel: '₹399',
    ctaLabel: 'tamarind tease →',
    fallbackHref: '/product/tamarin-tease',
    styleVariant: 'secondary',
    ctaBackgroundImage: '/home/ctabg2.svg',
    ctaClassName: 'text-[#26140A] hover:brightness-105',
    ctaAlignClass: 'justify-start pl-10 sm:pl-20 md:pl-28 lg:pl-36',
    ctaOffsetClass: 'mt-5 sm:mt-6 md:mt-7',
    showTopWave: true,
    showBottomWave: true,
  },
];

const HOME_CTA_PRODUCTS_QUERY = `*[_type == "product"] | order(sortOrder asc, _createdAt asc) {
  "slug": slug.current,
  styleVariant,
  price
}`;

const HOME_HERO_QUERY = `coalesce(
  *[_id == "drafts.homePage"][0],
  *[_id == "homePage"][0],
  *[_type == "homePage"] | order(_updatedAt desc)[0]
){
  heroImage,
  heroImageAlt
}`;

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function imageSrc(source: unknown, fallback: string) {
  try {
    return source ? urlFor(source).width(2200).quality(90).url() : fallback;
  } catch {
    return fallback;
  }
}

async function getHomeCtaByVariant(): Promise<{
  hrefByVariant: Partial<Record<StyleVariant, string>>;
  priceByVariant: Partial<Record<StyleVariant, string>>;
}> {
  try {
    const docs = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<SanityHomeProduct[]>(HOME_CTA_PRODUCTS_QUERY, {}, { cache: 'no-store' });

    if (!Array.isArray(docs) || docs.length === 0) {
      return { hrefByVariant: {}, priceByVariant: {} };
    }

    const hrefByVariant: Partial<Record<StyleVariant, string>> = {};
    const priceByVariant: Partial<Record<StyleVariant, string>> = {};
    for (const doc of docs) {
      const variant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
      if (!priceByVariant[variant]) {
        const priceLabel = asNonEmptyString(doc.price);
        if (priceLabel) {
          priceByVariant[variant] = priceLabel;
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

async function getHomeHeroContent(): Promise<{ src: string; alt: string }> {
  const fallbackSrc = '/home/hero-placeholder.JPEG';
  const fallbackAlt = 'hero placeholder';

  try {
    const data = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<HomeHeroQueryResult>(HOME_HERO_QUERY, {}, { cache: 'no-store' });

    return {
      src: imageSrc(data?.heroImage, fallbackSrc),
      alt: asNonEmptyString(data?.heroImageAlt) || fallbackAlt,
    };
  } catch {
    return { src: fallbackSrc, alt: fallbackAlt };
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
  packageAspectRatio,
  priceLabel,
  ctaLabel,
  href,
  ctaBackgroundImage,
  ctaClassName,
  ctaAlignClass,
  ctaOffsetClass,
  showTopWave,
  showBottomWave,
}: ProductBandProps) {
  return (
    <article className="relative w-full overflow-hidden">
      <div className="relative h-[560px] w-full sm:h-[620px] md:h-[760px] lg:h-[840px]">
        <Image src={bgImage} alt="product section background" fill className="object-cover object-center" />

        {showTopWave ? <TopWave /> : null}

        <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
          <div
            className="relative mx-auto w-[min(88vw,1120px)] md:w-[min(78vw,1160px)] lg:w-[min(72vw,1220px)]"
            style={{ aspectRatio: packageAspectRatio }}
          >
            <Image src={packageImage} alt="product packaging strip" fill className="object-contain object-center" />
          </div>

          <div
            className={`mx-auto flex w-[min(88vw,1120px)] md:w-[min(78vw,1160px)] lg:w-[min(72vw,1220px)] ${ctaOffsetClass} ${ctaAlignClass}`}
          >
            <Link
              href={href}
              className={`inline-flex min-h-[54px] items-center rounded-full bg-cover bg-center bg-no-repeat px-8 py-3 text-[clamp(1.7rem,3.1vw,2.9rem)] leading-[1] font-schoolbell transition md:min-h-[70px] md:px-12 ${ctaClassName}`}
              style={{ backgroundImage: `url(${ctaBackgroundImage})` }}
            >
              <span>{ctaLabel}</span>
              <span className="ml-2 text-[0.6em] leading-none opacity-90">{priceLabel}</span>
            </Link>
          </div>
        </div>
      </div>

      {showBottomWave ? <BottomWave /> : null}
    </article>
  );
}

export default async function HomePage() {
  const [{ hrefByVariant, priceByVariant }, hero] = await Promise.all([
    getHomeCtaByVariant(),
    getHomeHeroContent(),
  ]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="relative mx-auto w-full max-w-[1600px]">
        <div className="relative h-[64vh] min-h-[460px] w-full md:h-[78vh] md:min-h-[660px]">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
            <div className="mx-auto w-full max-w-[1260px] px-4 text-left sm:px-6 md:px-10">
              <h1 className="leading-[0.9]">
                <CoolRascalText
                  as="span"
                  text="the sourboo way,"
                  className="block text-[clamp(2rem,5vw,4.8rem)]"
                  pattern="alternate"
                  startWith="base"
                  baseClassName="text-[#4C8B1D]"
                  accentClassName="text-[#EA1970]"
                />
                <CoolRascalText
                  as="span"
                  text="cravings comes first"
                  className="block text-[clamp(2.2rem,6vw,5.6rem)]"
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
            const priceLabel = priceByVariant[band.styleVariant] ?? band.priceLabel;
            return <ProductBand key={band.id} {...band} href={href} priceLabel={priceLabel} />;
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-2 md:px-10 md:pb-28 md:pt-12">
        <div className="max-w-[820px] text-left text-[clamp(2rem,3.6vw,4.6rem)] leading-[1.06]">
          <CoolRascalText
            as="span"
            text="sourboo made for people who eat"
            className="block"
            pattern="alternate"
            startWith="base"
            baseClassName="text-[#191919]"
            accentClassName="text-[#191919]"
          />
          <CoolRascalText
            as="span"
            text="with intent"
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
              <CrybabyVisual rotateClass="mx-auto md:mx-0" fluidPositionClass="left-[63%] top-[44%]" />
            </div>

            <div className="flex w-full max-w-[760px] flex-col items-center gap-6 md:items-center md:gap-8">
              <p className="text-center text-[clamp(2rem,3.2vw,4rem)] leading-[1.1] text-[#1D1D1D] font-schoolbell md:text-left">
                who like flavour loud and immediate
                <br />
                food that fits into real moments
              </p>

              <Link
                href="/about"
                className="inline-flex w-[min(92vw,540px)] aspect-[256/67] items-center justify-center bg-[url('/home/readmyrantcta.svg')] bg-contain bg-center bg-no-repeat px-8 text-center text-[clamp(1.8rem,3vw,3.3rem)] leading-none text-[#FFF8F8] font-schoolbell transition duration-200 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E61E7A]"
              >
                read my rant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-2 pb-6 md:px-8 md:pb-10">
        <HomePosterPinboard />
      </section>

      <section className="w-full pb-8 md:pb-12">
        <div className="relative mx-auto h-[220px] w-full max-w-[1240px] sm:h-[260px] md:h-[320px] lg:h-[390px]">
          <Image
            src="/home/freshingredients.svg"
            alt="Fresh ingredients visual"
            fill
            className="object-cover object-[center_46%]"
          />
        </div>
      </section>

      <HomeHorizontalImageScroll />
      <HomeReviewPhoneSection />

      <SiteFooter />
    </main>
  );
}
