import Navbar from '../components/about/AboutNavbar';
import Image from 'next/image';
import { sanityClient } from '@/src/lib/sanity/client';
import SiteFooter from '../components/SiteFooter';

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

      {/* Section 1 */}
      <section className="relative w-full">
        <div className="relative h-[72vh] w-full md:h-[82vh]">
          <div className="absolute inset-0 bg-[#FF9B9B]">
            <Image
              src="/about/about-cover.JPG"
              alt="Hero"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1220px] px-6 py-12 md:px-12 md:py-16">
          <h1 className="mb-4 break-words text-4xl font-bold sm:text-5xl md:mb-6 md:text-7xl lg:text-8xl">
            <span className="text-[#F9A8D4] opacity-70" style={{ fontFamily: 'rascal' }}>
              hi i am sakshi
            </span>
            <span className="ml-2 text-[#E61E6E]" style={{ fontFamily: 'rascal' }}>
              and am really
            </span>
          </h1>

          <h2
            className="mb-8 break-words text-4xl font-bold text-[#E61E6E] sm:text-5xl md:mb-12 md:text-7xl lg:text-8xl"
            style={{ fontFamily: 'rascal' }}
          >
            glad you are here
          </h2>

          <p
            className="ml-auto max-w-md break-words text-right text-base text-[#1C1917] md:max-w-lg md:text-lg lg:text-xl"
            style={{ fontFamily: 'schoolbell' }}
          >
            if u are here, i am assuming, you like sour or curious enough to try it
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section className="mx-auto w-full max-w-[390px] px-6 pb-16 md:max-w-[1040px] md:px-12 md:pb-24">
        <p className="mx-auto max-w-[350px] text-center text-[52px] leading-[1.02] text-[#E61E6E] font-coolvetica md:max-w-[780px] md:text-[84px]">
          I&apos;ve always been (annoyingly) obsessed with flavours.
        </p>

        <div className="relative mx-auto mt-8 h-[530px] w-full md:mt-14 md:h-[760px]">
          <p className="absolute right-2 top-0 z-20 rotate-[16deg] text-[46px] text-[#1E1E1E] font-rascal md:right-[14%] md:text-[66px]">
            Mixing things
          </p>
          <div className="absolute right-0 top-14 h-[210px] w-[62%] overflow-hidden md:top-20 md:h-[340px] md:w-[44%]">
            <Image
              src="/about/section-two-1.svg"
              alt="Mixing drinks"
              fill
              className="object-cover"
            />
            <div className="absolute left-0 top-0 h-14 w-14 rounded-br-[46px] bg-[#F7FEE7] md:h-24 md:w-24 md:rounded-br-[80px]" />
          </div>

          <p className="absolute left-[-6px] top-[44%] z-20 -rotate-[14deg] text-[48px] text-[#A8AC1A] font-rascal md: -left-[24%] md:top-[49%] md:text-[72px]">
            Tasting everything
          </p>
          <div className="absolute left-0 top-[48%] h-[210px] w-[73%] overflow-hidden md:left-[2%] md:top-[52%] md:h-[320px] md:w-[54%]">
            <Image
              src="/about/section-two-2.svg"
              alt="Tasting everything"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-0 right-0 h-[200px] w-[34%] overflow-hidden bg-[#9B999D] md:h-[270px] md:w-[25%]">
            <Image
              src="/about/section-two-3.svg"
              alt="Third collage visual"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-[64px] leading-[0.95] text-[#E61E6E] font-coolvetica md:mt-14 md:text-[96px]">
          spent 5 years
        </p>
        <p className="mx-auto mt-2 max-w-[360px] text-center text-[46px] leading-[1.03] text-[#E61E6E] font-coolvetica md:max-w-[920px] md:text-[66px]">
          around food and drinks from london bar shifts to a 9-5 desk job in India
        </p>
      </section>

      {/* Section 3 */}
      <section className="mx-auto w-full max-w-[520px] px-4 pb-2 md:max-w-[1320px] md:px-10 md:pb-28">
        <p className="text-center text-[52px] leading-[1.02] text-[#E61E6E] font-coolvetica md:text-[76px]">
          different lives, same cravings
        </p>

        <div className="relative mx-auto mt-2 h-[620px] w-full overflow-hidden md:mt-8 md:h-[1280px]">
          <div className="absolute left-1/2 top-0 h-[240px] w-[138%] -translate-x-1/2 md:h-[640px] md:w-[190%]">
            <Image
              src="/about/section-three-eyes.svg"
              alt="Eyes illustration"
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute left-1/2 top-[4px] h-[780px] w-[138%] -translate-x-1/2 md:top-[400px] md:h-[900px] md:w-[72%]">
            <Image
              src="/about/section-three-tongue.svg"
              alt="Tongue illustration"
              fill
              className="object-contain z-10"
            />

            <p className="absolute left-1/2 top-[40%] z-20 w-[86%] -translate-x-1/2 text-center text-[24px] leading-none text-[#FFEE77] font-coolvetica md:text-[62px] md:top-[32%] ">
              India loves chaaat
            </p>
            <p className="absolute left-1/2 top-[48%] z-20 w-[86%] -translate-x-1/2 text-center text-[24px] leading-none text-[#FFEE77] font-coolvetica md:text-[66px] md:top-[44%]">
              India loves flavour
            </p>
            <p className="absolute left-1/2 top-[56%] z-20 w-[90%] -translate-x-1/2 text-center text-[24px] leading-[0.95] text-[#FFEE77] font-coolvetica md:text-[86px]">
              India loves that sour and spicy hit
            </p>

          </div>
          
        </div>
          <p className="text-center text-[46px] leading-[1.03] text-[#E61E6E] font-coolvetica md:text-[66px]">
            Nothing worked for a desi palate that loves
          </p>
      </section>

      {/* Section 4 */}
      <section className="-mt-12 w-full bg-[#e8e0eb] pb-20 pt-6 md:mt-0 md:pb-28 md:pt-10">
        <div className="mx-auto w-full max-w-[430px] md:max-w-[1100px] md:px-10">
         
          <div className="relative mx-auto mt-5 h-[300px] w-full overflow-hidden md:mt-8 md:h-[390px]">
           
            <p className="absolute left-4 top-8 text-[62px] leading-none text-[#4e7805] font-coolvetica md:left-8 md:top-10 md:text-[94px]">
              BOLD
            </p>
            <p className="absolute left-1/2 top-[43%] -translate-x-1/2 text-[58px] leading-none text-[#4e7805] font-rascal md:text-[82px]">
              spicy
            </p>
            <p className="absolute right-5 top-[63%] text-[58px] leading-none text-[#4e7805] font-rascal md:right-10 md:text-[82px]">
              sour
            </p>
          </div>

          <p className="mx-auto mt-7 max-w-[390px] text-center text-[56px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-10 md:max-w-[740px] md:text-[76px]">
            but doesn&apos;t want to feel weighed down after snacking.
          </p>

          <div className="relative mx-auto mt-12 w-fit md:mt-16">
            <p className="text-center text-[72px] leading-none text-[#F2EE72] font-coolvetica md:text-[128px]">
              MY BIGGEST ISSUE?
            </p>
        
          </div>

          <p className="mx-auto mt-12 max-w-[390px] text-center text-[48px] leading-[1.02] text-[#E61E6E] font-coolvetica md:mt-16 md:max-w-[760px] md:text-[84px]">
            Sour was always treated like a side.
          </p>

          <p className="mt-12 text-left text-[32px] leading-[1.02] text-[#E61E6E] font-coolvetica md:mt-16 md:text-[64px]">
            A squeeze here.
          </p>
          <p className="mt-8 text-right text-[32px] leading-[1.02] text-[#E61E6E] font-coolvetica md:mt-12 md:text-[64px]">
            A spoon of pickle there.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section className="relative mx-auto w-full max-w-[430px] overflow-hidden bg-[#F7FEE7] pb-20 md:max-w-[1100px] md:pb-28">
        <div className="relative h-[124px] w-full md:h-[240px]">
          <Image
            src="/about/paper-tear.svg"
            alt="Paper tear top"
            fill
            className="object-cover"
          />
        </div>

        <div className="px-5 pt-6 text-center md:px-12 md:pt-10">
          <p className="text-[24px] leading-none text-[#b68ad9] font-schoolbell md:text-[48px]">
            Introducing
          </p>

          <div className="relative mx-auto mt-2 h-[72px] w-[250px] md:h-[116px] md:w-[360px]">
            <Image
              src="/logo.svg"
              alt="Sourboo logo"
              fill
              className="object-contain"
            />
          </div>

          <div className="relative mx-auto h-[300px] w-[460px] max-w-full md:h-[420px] md:w-[2200px]">
            <Image
              src="/tagline.svg"
              alt="Tagline illustration"
              fill
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-6 max-w-[390px] text-center md:mt-10 md:max-w-[740px]">
            <p className="text-[52px] leading-[1.03] text-[#E61E6E] font-coolvetica md:text-[62px]">
              sour first snack, made for people who don&apos;t eat quietly.
            </p>

            <p className="mt-6 text-[52px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-8 md:text-[62px]">
              for women who love{" "}
              <span className="text-[#A8CF3D]">loud flavours, strong opinions, and fully indulging.</span>
            </p>

            <p className="mt-6 text-[52px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-8 md:text-[62px]">
              The kind who make faces when they eat.
            </p>

            <p className="mt-4 text-[52px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-6 md:text-[62px]">
              The kind who ask for extra nimbu.
            </p>

            <p className="mt-6 text-[50px] leading-[1.02] text-[#F18BB7] font-rascal md:mt-8 md:text-[60px]">
              A new way of snacking.
            </p>
          </div>
        </div>

        <div className="relative mt-10 h-[88px] w-full md:mt-14 md:h-[130px]">
          <Image
            src="/about/paper-tear-2.svg"
            alt="Paper tear bottom"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Section 6 */}
      <section className="w-full bg-[#e8e0eb] pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-[430px] md:max-w-[1100px]">
          <div className="grid w-full grid-cols-3">
            {['section-six-top-1.JPEG', 'section-six-top-2.JPEG', 'section-six-top-3.JPEG'].map((imgName) => (
              <div key={imgName} className="relative aspect-[3/4.2] w-full overflow-hidden">
                <Image
                  src={`/about/${imgName}`}
                  alt="Section top visual"
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-[360px] text-center text-[44px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-10 md:max-w-[620px] md:text-[62px]">
            That&apos;s Sourboo to me.
            <br />
            And I hope you love it as much as I do
          </p>

          <div className="mt-8 px-4 md:mt-12 md:px-8">
            <p className="text-right text-[36px] leading-none text-[#4f4956] font-coolvetica md:text-[64px]">
              join more
            </p>
          </div>

          <div className="relative mx-auto mt-2 h-[420px] w-[92%] md:mt-4 md:h-[560px] md:w-[82%]">
            <Image
              src="/about/section-six-envelope.svg"
              alt="Envelope card"
              fill
              className="object-contain"
            />

            <div className="absolute left-1/2 top-[55%] w-[66%] -translate-x-1/2 -translate-y-1/2 text-start text-[#1f1a1a]">
              <p className="text-[24px] leading-[1.12] font-schoolbell md:text-[46px]">
                {envelopeContent.heading}
              </p>
              <p className="mt-5 whitespace-pre-line text-[24px] leading-[1.16] font-schoolbell md:mt-7 md:text-[46px]">
                {envelopeContent.body}
              </p>
              <p className="mt-5 text-[20px] leading-[1.1] font-schoolbell md:mt-6 md:text-[30px]">
                {envelopeContent.signoff}
              </p>
            </div>
          </div>

          <div className="-mt-8 px-4 pb-2 md:-mt-12 md:px-10">
            <p className="w-fit text-left text-[36px] leading-[0.92] text-[#4f4956] font-coolvetica md:text-[64px]">
              of
              <br />
              sourboo
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
