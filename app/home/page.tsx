import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../components/about/AboutNavbar';
import SiteFooter from '../components/SiteFooter';

type HomeBand = {
  id: string;
  bgImage: string;
  packageImage: string;
  packageAspectRatio: number;
  priceLabel: string;
  ctaLabel: string;
  href: string;
  ctaClassName: string;
  ctaAlignClass: string;
  ctaOffsetClass: string;
  showTopWave?: boolean;
  showBottomWave?: boolean;
};

const homeBands: HomeBand[] = [
  {
    id: 'side-eye',
    bgImage: '/home/packagingbg.JPEG',
    packageImage: '/home/sideeyepackage.png',
    packageAspectRatio: 1210 / 274,
    priceLabel: '₹399',
    ctaLabel: 'side eye sour →',
    href: '/product/side-eye-sour',
    ctaClassName: 'bg-[#F1F07F] text-[#2F4918] hover:bg-[#F7F7A2]',
    ctaAlignClass: 'justify-center',
    ctaOffsetClass: '-mt-40 sm:mt-2 md:-mt-110',
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
    href: '/product/tamarin-tease',
    ctaClassName: 'bg-[#C96E0B] text-[#26140A] hover:bg-[#D77913]',
    ctaAlignClass: 'justify-start pl-10 sm:pl-20 md:pl-28 lg:pl-36',
    ctaOffsetClass: 'mt-4 sm:mt-5 md:mt-6',
    showTopWave: true,
    showBottomWave: true,
  },
];

const collageImages = [
  {
    id: 'post-cry-snack',
    src: '/home/postcrysnack.svg',
    alt: 'Post cry snack poster',
    className:
      'left-[1%] top-1 w-[57%] -rotate-[10deg] sm:left-[4%] sm:top-3 sm:w-[48%] md:left-[12%] md:-top-20 md:w-[36%]',
  },
  {
    id: 'late-night-munchies',
    src: '/home/latenightmunchies.svg',
    alt: 'Late night munchies poster',
    className:
      'right-[1%] top-0 w-[57%] rotate-[11deg] sm:right-[4%] sm:w-[48%] md:right-[8%] md:-top-36 md:w-[36%]',
  },
  {
    id: 'girl-dinner',
    src: '/home/girldinner.svg',
    alt: 'Girl dinner but sour poster',
    className:
      'left-[0%] top-[43%] w-[55%]  sm:left-[3%] sm:top-[41%] sm:w-[46%] md:left-[18%] md:top-[45%] md:w-[34%]',
  },
  {
    id: 'hangover-detox',
    src: '/home/deskcravings.svg',
    alt: 'Hangover detox poster',
    className:
      'right-[3%] top-[46%] w-[54%] -rotate-[8deg] sm:right-[6%] sm:top-[44%] sm:w-[45%] md:right-[12%] md:top-[47%] md:w-[28%]',
  },
];

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
  ctaClassName,
  ctaAlignClass,
  ctaOffsetClass,
  showTopWave,
  showBottomWave,
}: HomeBand) {
  return (
    <article className="relative w-full overflow-hidden">
      <div className="relative h-[560px] w-full sm:h-[620px] md:h-[760px] lg:h-[840px]">
        <Image src={bgImage} alt="product section background" fill className="object-cover object-center" />

        {showTopWave ? <TopWave /> : null}

        <div className="absolute inset-x-0 top-[44%] z-10 sm:top-[46%] md:top-[47%]">
          <div className="relative w-full" style={{ aspectRatio: packageAspectRatio }}>
            <Image src={packageImage} alt="product packaging strip" fill className="object-contain object-center" />
          </div>

          <div className={`${ctaOffsetClass} flex ${ctaAlignClass} px-4`}>
            <Link
              href={href}
              className={`inline-flex min-h-[54px] items-center rounded-full px-8 py-3 text-[clamp(1.7rem,3.1vw,2.9rem)] leading-[1] font-schoolbell transition md:min-h-[70px] md:px-12 ${ctaClassName}`}
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

function CrybabyVisual({
  mirrored = false,
  rotateClass,
  fluidPositionClass,
}: {
  mirrored?: boolean;
  rotateClass: string;
  fluidPositionClass: string;
}) {
  return (
    <div className={`relative w-[min(90vw,560px)] aspect-[4/5] ${rotateClass}`}>
      <div
        className={`relative h-full w-full overflow-hidden rounded-[10px]  ${mirrored ? '-scale-x-100' : ''}`}
      >
        <Image
          src="/home/readmyrant.svg"
          alt="crybaby challenge visual placeholder"
          fill
          className="object-cover"
        />
        <p
          className={`absolute z-20 text-[clamp(0.95rem,1.8vw,1.4rem)] leading-none tracking-[0.22em] text-[#F2E84A] font-coolvetica ${fluidPositionClass}`}
        >
          the sour baby
        </p>
     
        <span className="absolute bottom-[31%] left-1/2 z-30 -translate-x-1/2 text-[clamp(3.2rem,8vw,7rem)] leading-none text-[#EA2A2A] blur-[0.5px]">
          ✹
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#E9ECD9]">
      <Navbar />

      <section className="relative mx-auto w-full max-w-[1600px]">
        <div className="relative h-[64vh] min-h-[460px] w-full overflow-hidden md:h-[78vh] md:min-h-[660px]">
          <Image
            src="/home/hero-placeholder.JPEG"
            alt="hero placeholder"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
          <h1 className="absolute bottom-10 left-1/2 z-20 w-full max-w-[1260px] -translate-x-1/2 px-4 text-left leading-[0.86] sm:bottom-12 sm:px-6 md:bottom-16 md:px-10">
            <span className="block text-[clamp(2rem,5vw,4.8rem)]">
              <span className="text-[#4C8B1D] font-coolvetica">the </span>
              <span className="text-[#EA1970] font-coolvetica">sourboo </span>
              <span className="text-[#4C8B1D] font-coolvetica">way,</span>
            </span>
            <span className="block text-[clamp(2.2rem,6vw,5.6rem)]">
              <span className="text-[#4C8B1D] font-coolvetica">cr</span>
              <span className="text-[#4C8B1D] font-rascal">a</span>
              <span className="text-[#4C8B1D] font-coolvetica">vings </span>
              <span className="text-[#EA1970] font-coolvetica">comes </span>
              <span className="text-[#4C8B1D] font-coolvetica">fir</span>
              <span className="text-[#EA1970] font-rascal">s</span>
              <span className="text-[#4C8B1D] font-coolvetica">t</span>
            </span>
          </h1>
        </div>
      </section>

      <section className="w-full pb-10 pt-4 md:pb-20 md:pt-8">
        <div className="w-full">
          {homeBands.map((band) => (
            <ProductBand key={band.id} {...band} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-4 pb-20 pt-2 md:px-10 md:pb-28 md:pt-12">
        <p className="max-w-[820px] text-left text-[clamp(2rem,3.6vw,4.6rem)] leading-[1.06] text-[#191919] font-schoolbell">
          sourboo made for people who eat
          <br />
          with intent
        </p>

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
                className="inline-flex min-h-[62px] items-center justify-center rounded-[42%_58%_55%_45%/58%_44%_56%_42%] bg-[#E61E7A] px-11 py-3 text-center text-[clamp(2rem,3vw,3.4rem)] leading-none text-[#FFF8F8] font-schoolbell transition hover:bg-[#EB3187] md:min-h-[78px] md:px-16"
              >
                read my rant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1500px] px-2 pb-20 md:px-8 md:pb-28">
        <div className="relative mx-auto h-[640px] w-full sm:h-[760px] md:h-[900px] lg:h-[980px]">
          {collageImages.map((item) => (
            <div key={item.id} className={`absolute ${item.className}`}>
              <Image
                src={item.src}
                alt={item.alt}
                width={700}
                height={980}
                className="h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
