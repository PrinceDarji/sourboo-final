import Navbar from '../components/about/AboutNavbar';
import Image from 'next/image';
import { sanityClient } from '@/src/lib/sanity/client';
import SiteFooter from '../components/SiteFooter';
import { CoolRascalText } from '../components/MixedFont';
import AboutTopStrip from '../components/about/AboutTopStrip';
import IndiaLovesLines from '../components/about/IndiaLovesLines';
import AboutFlavorWords from '../components/about/AboutFlavorWords';
import AboutWordByWordReveal from '../components/about/AboutWordByWordReveal';
import AboutEnvelopeText from '../components/about/AboutEnvelopeText';
import SectionThreeEyesSequence from '../components/about/SectionThreeEyesSequence';

export const dynamic = 'force-dynamic';

const ABOUT_ENVELOPE_QUERY = `coalesce(
  *[_id == "drafts.aboutPage"][0],
  *[_id == "aboutPage"][0],
  *[_type == "aboutPage"] | order(_updatedAt desc)[0]
){
  envelopeHeading,
  envelopeBody,
  envelopeSignoff,
  envelopeText
}`;

type EnvelopeContent = {
  heading: string;
  body: string;
  signoff: string;
};

type AboutEnvelopeQueryResult = {
  envelopeHeading?: string;
  envelopeBody?: string;
  envelopeSignoff?: string;
  envelopeText?: string;
} | null;

const DEFAULT_ENVELOPE_CONTENT: EnvelopeContent = {
  heading: "hellooo",
  body: "i am sakshi the founder of sourboo\n\nwe are hosting an event at 27th!\ncome through",
  signoff: "xx",
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseLegacyEnvelopeText(legacyText: string): EnvelopeContent {
  const lines = legacyText
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return DEFAULT_ENVELOPE_CONTENT;
  }

  if (lines.length === 1) {
    return {
      heading: DEFAULT_ENVELOPE_CONTENT.heading,
      body: lines[0],
      signoff: DEFAULT_ENVELOPE_CONTENT.signoff,
    };
  }

  if (lines.length === 2) {
    return {
      heading: lines[0],
      body: lines[1],
      signoff: DEFAULT_ENVELOPE_CONTENT.signoff,
    };
  }

  return {
    heading: lines[0],
    body: lines.slice(1, -1).join('\n'),
    signoff: lines[lines.length - 1],
  };
}

async function getEnvelopeContent(): Promise<EnvelopeContent> {
  try {
    const data = await sanityClient
      .withConfig({ useCdn: false })
      .fetch<AboutEnvelopeQueryResult>(ABOUT_ENVELOPE_QUERY, {}, { cache: 'no-store' });
    const heading = asNonEmptyString(data?.envelopeHeading);
    const body = asNonEmptyString(data?.envelopeBody);
    const signoff = asNonEmptyString(data?.envelopeSignoff);

    if (heading && body && signoff) {
      return { heading, body, signoff };
    }

    const legacy = asNonEmptyString(data?.envelopeText);
    if (legacy) {
      return parseLegacyEnvelopeText(legacy);
    }

    return DEFAULT_ENVELOPE_CONTENT;
  } catch {
    return DEFAULT_ENVELOPE_CONTENT;
  }
}

export default async function Home() {
  const envelopeContent = await getEnvelopeContent();

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7FEE7]">
      {/* Navbar */}
      <Navbar />
      <AboutWordByWordReveal />

      {/* Section 1 */}
      <section className="relative w-full">
        <div className="relative h-[72vh] w-full md:h-[82vh]">
          <div className="absolute inset-0">
            <Image
              src="/about/about-cover.JPG"
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-1/2">
            <div className="mx-auto w-full max-w-[1220px] px-6 md:px-12">
              <CoolRascalText
                as="h1"
                text="hi i am sakshi,"
                className="break-words text-4xl font-bold leading-[0.95] sm:text-5xl md:text-7xl lg:text-8xl"
                pattern="everyThird"
                baseClassName="text-[#F9A8D4] opacity-70"
                accentClassName="text-[#F9A8D4] opacity-70"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1220px] px-6 pb-12 pt-14 md:px-12 md:pb-16 md:pt-20">
          <CoolRascalText
            as="h2"
            text="and i am really glad you are here"
            className="mb-8 break-words text-4xl font-bold leading-[0.95] text-[#E61E6E] sm:text-5xl md:mb-12 md:text-7xl lg:text-8xl"
            pattern="alternate"
            startWith="accent"
          />

          <p
            className="ml-auto max-w-md break-words text-right text-base text-[#1C1917] md:max-w-lg md:text-lg lg:text-xl"
            style={{ fontFamily: 'schoolbell' }}
          >
            if u are here, i am assuming, you like sour or curious enough to try it
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mx-auto w-full max-w-[420px] pb-16 md:max-w-[1100px] md:pb-24">
        <p className="mx-auto max-w-[350px] text-center text-[52px] leading-[1.02] text-[#E61E6E] font-coolvetica md:max-w-[1040px] md:text-[78px]">
          I&apos;ve always been (annoyingly) obsessed with flavours.
        </p>

        <div className="relative mx-auto mt-8 h-[530px] w-full md:mt-14 md:h-[760px]">
          <p className="absolute right-0 top-0 z-20 rotate-[16deg] text-[46px] text-[#1E1E1E] font-schoolbell md: -right-[4%] md:text-[52px]">
            Mixing things
          </p>
          <div className="absolute right-2 top-14 h-[210px] w-[62%] overflow-hidden md:top-20 md:h-[340px] md:w-[44%]">
            <Image
              src="/about/section-two-1.svg"
              alt="Mixing drinks"
              fill
              className="object-cover object-top"
            />
          </div>

          <p className="absolute left-[-6px] top-[40%] z-20 -rotate-[14deg] text-[48px] text-[#A8AC1A] font-schoolbell md: -left-[32%] md:top-[44%] md:text-[52px]">
            Tasting everything
          </p>
          <div className="absolute left-0 top-[48%] h-[210px] w-[73%] overflow-hidden md:left-[2%] md:top-[52%] md:h-[380px] md:w-[54%]">
            <Image
              src="/about/section-two-2.svg"
              alt="Tasting everything"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-0 right-0 h-[200px] w-[34%] overflow-hidden md:h-[360px] md:w-[25%]">
            <Image
              src="/about/section-two-3.svg"
              alt="Third collage visual"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-[64px] leading-[0.95] text-[#E61E6E] font-schoolbell md:mt-14 md:text-[72px]">
          spent 5 years
        </p>
        <p className="mx-auto mt-4 max-w-[360px] text-center text-[46px] leading-[1.03] text-[#E61E6E] font-schoolbell md:max-w-[920px] md:text-[52px]">
          around food and drinks from london bar shifts to a 9-5 desk job in India
        </p>
      </section>

      {/* Section 3 */}
      <section className="mx-auto w-full max-w-[520px] px-4 pb-2 md:max-w-[1320px] md:px-10 md:pb-28">
        <p className="text-center text-[52px] leading-[1.02] text-[#E61E6E] font-schoolbell md:text-[76px]">
          different lives, same cravings
        </p>

        <div className="relative mx-auto h-[620px] w-full overflow-hidden md:h-[1280px]">
          <SectionThreeEyesSequence />

          <div className="about-tongue-position absolute left-1/2 h-[780px] w-[138%] -translate-x-1/2 md:h-[900px] md:w-[68%]">
            <Image
              src="/about/section-three-tongue.svg"
              alt="Tongue illustration"
              fill
              className="object-contain z-10"
            />
            <IndiaLovesLines />
          </div>
        
        </div>
          <p className="-mt-20 text-center text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:-mt-64 md:text-[48px]">
            Nothing worked for a desi palate that loves
          </p>
      </section>

      {/* Section 4 */}
      <section className="relative -mt-12 w-full bg-[#F6AE5A] pb-20 pt-6 md:mt-0 md:pb-28 md:pt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-10 h-12 md:-top-14 md:h-16"
        >
          <svg className="h-full w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="#F6AE5A"
              d="M0 78C85 28 172 18 262 48C351 79 431 106 525 90C616 74 678 24 772 32C867 40 931 94 1024 96C1118 98 1228 41 1322 34C1374 30 1413 36 1440 44V120H0V78Z"
            />
          </svg>
        </div>
        <div className="mx-auto w-full max-w-[430px] md:max-w-[1100px] md:px-10">
         
          <AboutFlavorWords />

          <p className="mx-auto mt-7 max-w-[390px] text-center text-[48px] leading-[1.03] text-[#E61E6E] font-schoolbell md:mt-12 md:max-w-[740px] md:text-[62px]">
            but doesn&apos;t want to feel weighed down after snacking.
          </p>

          <div className="relative mx-auto mt-16 w-fit md:mt-8">
            <svg
              className="pointer-events-none absolute -inset-x-8 -inset-y-4 h-[calc(100%+2rem)] w-[calc(100%+4rem)] md:-inset-x-12 md:-inset-y-7 md:h-[calc(100%+3.5rem)] md:w-[calc(100%+6rem)]"
              viewBox="0 0 1000 320"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M180 210C80 145 165 72 350 58C560 43 790 47 915 94C970 116 965 154 886 180C740 230 455 272 254 254C145 244 82 220 82 188C82 150 170 103 360 82"
                stroke="#FF1F1F"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M336 112C440 65 640 54 790 68"
                stroke="#FF1F1F"
                strokeWidth="10"
                strokeLinecap="round"
              />
            </svg>
            <p className="relative z-10 text-center text-[72px] leading-none text-[#15803D] font-coolvetica md:text-[128px]">
              MY BIGGEST ISSUE?
            </p>
        
          </div>

          <p className="mx-auto mt-16 max-w-[390px] text-center text-[48px] leading-[1.02] text-[#E61E6E] font-schoolbell md:mt-16 md:max-w-[760px] md:text-[64px]">
            Sour was always treated like a side.
          </p>

          <div className="relative mt-16 md:mt-16">
            <div className="pointer-events-none absolute left-0 top-6 z-0 h-[200px] w-[250px] -translate-x-[40%] -translate-y-1/2 md:top-8 md:h-[260px] md:w-[300px] md:-translate-x-[38%] md:-translate-y-1/2">
              <Image
                src="/about/lemonsqueze.gif"
                alt="Lemon drop illustration"
                fill
                className="object-contain"
              />
            </div>
            <p className="relative z-10 pl-10 text-left text-[32px] leading-[1.02] text-[#E61E6E] font-schoolbell md:pl-16 md:text-[36px]">
              A squeeze here.
            </p>
          </div>
          <div className="relative mt-16 md:mt-12">
            <div className="pointer-events-none absolute right-0 top-[48%] z-0 h-[200px] w-[250px] translate-x-[40%] -translate-y-1/2 md:top-[48%] md:h-[260px] md:w-[300px] md:translate-x-[38%]">
              <Image
                src="/about/spoonofpickle.gif"
                alt="Spoon of pickle illustration"
                fill
                className="object-contain rotate-[8deg]"
              />
            </div>
            <p className="relative z-10 pr-10 text-right text-[32px] leading-[1.02] text-[#E61E6E] font-schoolbell md:pr-16 md:text-[36px]">
              A spoon of pickle there.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section className="relative -mt-12 w-full overflow-hidden bg-[#F7FEE7] pb-0 md:-mt-24 md:pb-0">
        <div
          className="relative left-1/2 h-[124px] w-screen -translate-x-1/2 md:h-[240px]"
          style={{
            background:
              'linear-gradient(to bottom, #F6AE5A 0%, #e8e0eb 46%, #F7FEE7 46%, #F7FEE7 100%)',
          }}
        >
          <Image
            src="/about/paper-tear.svg"
            alt="Paper tear top"
            fill
            className="object-cover"
          />
        </div>

        <div className="mx-auto max-w-[430px] px-5 pt-6 text-center md:max-w-[1100px] md:px-12 md:pt-10">
          <p className="text-[24px] leading-none text-[#b68ad9] font-schoolbell md:text-[48px]">
            Introducing
          </p>

          <div className="relative mx-auto h-[72px] w-[250px] md:h-[116px] md:w-[360px]">
            <Image
              src="/logo.svg"
              alt="Sourboo logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative mx-auto -mt-1 h-[190px] w-[520px] max-w-full md:-mt-2 md:h-[250px] md:w-[900px]">
            <Image
              src="/tagline.svg"
              alt="Tagline illustration"
              fill
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-1 flex max-w-[390px] flex-col gap-16 text-center md:mt-2 md:max-w-[740px] md:gap-14">
            <p className="text-[52px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[52px]">
              sour first snack, made for people who don&apos;t eat quietly.
            </p>

            <p className="text-[52px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[48px]">
              for women who love{" "}
              <span className="text-[#A8CF3D]">loud flavours, strong opinions, and fully indulging.</span>
            </p>

            <div className="flex flex-col gap-6 md:gap-4">
              <p className="text-[52px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[36px]">
                The kind who make faces when they eat.
              </p>

              <p className="text-[52px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[36px]">
                The kind who ask for extra nimbu.
              </p>
            </div>

            <p className="text-[50px] leading-[1.02] text-[#F18BB7] font-rascal md:text-[62px]">
              A new way of snacking.
            </p>
          </div>
        </div>

        <div
          className="relative mt-10 h-[88px] w-full md:mt-14 md:h-[130px]"
          style={{
            background:
              'linear-gradient(to bottom, #F7FEE7 0%, #F7FEE7 54%, #e8e0eb 54%, #F6AE5A 100%)',
          }}
        >
          <Image
            src="/about/paper-tear.svg"
            alt="Paper tear bottom"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Section 6 */}
      <section data-scroll-reveal="off" className="w-full bg-[#F6AE5A] pb-20 md:pb-28">
        <AboutTopStrip />

        <div className="mx-auto w-full max-w-[430px] md:max-w-[1100px]">
          <p className="mx-auto mt-8 max-w-[360px] text-center text-[44px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-10 md:max-w-[620px] md:text-[62px]">
            That&apos;s Sourboo to me.
            <br />
            And I hope you love it as much as I do
          </p>

          <div className="mx-auto mt-14 w-[92%] md:mt-20 md:w-[82%]">
            <p className="ml-auto w-fit translate-y-3 text-right text-[36px] leading-none text-[#4f4956] font-coolvetica md:translate-y-12 md:text-[64px]">
              join more
            </p>
          </div>

          <div className="relative mx-auto mt-2 h-[600px] w-[88%] md:mt-4 md:h-[680px] md:w-[76%]">
            <Image
              src="/about/section-six-envelope.svg"
              alt="Envelope card"
              fill
              className="object-contain"
            />

            <AboutEnvelopeText
              heading={envelopeContent.heading}
              body={envelopeContent.body}
              signoff={envelopeContent.signoff}
            />
          </div>


        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none relative left-1/2 mt-2 h-12 w-screen -translate-x-1/2 -mb-20 md:mt-6 md:h-16 md:-mb-28"
        >
          <svg className="h-full w-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              fill="#F7FEE7"
              d="M0 78C85 28 172 18 262 48C351 79 431 106 525 90C616 74 678 24 772 32C867 40 931 94 1024 96C1118 98 1228 41 1322 34C1374 30 1413 36 1440 44V120H0V78Z"
            />
          </svg>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
