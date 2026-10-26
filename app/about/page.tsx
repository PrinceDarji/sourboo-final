import { pageMetadata } from '@/src/lib/seo/metadata';
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
import { sanityImageOrFileUrl } from '@/src/lib/sanity/image';

export const revalidate = 300;

type AboutImageItemQuery = {
  image?: unknown;
  alt?: string;
};

type AboutFlavorWordQuery = {
  label?: string;
  backgroundImage?: unknown;
};

type AboutPageQueryResult = {
  heroImage?: unknown;
  heroImageAlt?: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroIntroBody?: string;

  section2Heading?: string;
  section2MixingLabel?: string;
  section2TastingLabel?: string;
  section2Image1?: unknown;
  section2Image1Alt?: string;
  section2Image2?: unknown;
  section2Image2Alt?: string;
  section2Image3?: unknown;
  section2Image3Alt?: string;
  section2SpentYearsText?: string;
  section2JourneyText?: string;

  section3Heading?: string;
  section3EyesSequence?: AboutImageItemQuery[];
  section3TongueImage?: unknown;
  section3TongueImageAlt?: string;
  section3IndiaCallout1?: string;
  section3IndiaCallout2?: string;
  section3IndiaCallout3?: string;
  section3ClosingText?: string;

  section4FlavorWords?: AboutFlavorWordQuery[];
  section4BodyText?: string;
  section4IssueHeading?: string;
  section4SideText?: string;
  section4LemonImage?: unknown;
  section4LemonImageAlt?: string;
  section4LemonCaption?: string;
  section4SpoonImage?: unknown;
  section4SpoonImageAlt?: string;
  section4SpoonCaption?: string;

  section5TearImage?: unknown;
  section5TearImageAlt?: string;
  section5IntroducingText?: string;
  section5LogoImage?: unknown;
  section5LogoImageAlt?: string;
  section5TaglineImage?: unknown;
  section5TaglineImageAlt?: string;
  section5Paragraph1?: string;
  section5Paragraph2Prefix?: string;
  section5Paragraph2Accent?: string;
  section5Paragraph3?: string;
  section5Paragraph4?: string;
  section5ClosingText?: string;

  section6TopStripImages?: AboutImageItemQuery[];
  section6HeadingLine1?: string;
  section6HeadingLine2?: string;
  section6JoinMoreText?: string;
  section6EnvelopeImage?: unknown;
  section6EnvelopeImageAlt?: string;

  envelopeHeading?: string;
  envelopeBody?: string;
  envelopeSignoff?: string;
  envelopeText?: string;
} | null;

type AboutImage = {
  src: string;
  alt: string;
};

type AboutFlavorWord = {
  label: string;
  bgSrc: string;
};

type EnvelopeContent = {
  heading: string;
  body: string;
  signoff: string;
};

type AboutPageContent = {
  hero: {
    image: AboutImage;
    heading: string;
    subheading: string;
    introBody: string;
  };
  section2: {
    heading: string;
    mixingLabel: string;
    tastingLabel: string;
    image1: AboutImage;
    image2: AboutImage;
    image3: AboutImage;
    spentYearsText: string;
    journeyText: string;
  };
  section3: {
    heading: string;
    eyesSequence: string[];
    tongueImage: AboutImage;
    indiaLines: string[];
    closingText: string;
  };
  section4: {
    flavorWords: AboutFlavorWord[];
    bodyText: string;
    issueHeading: string;
    sideText: string;
    lemonImage: AboutImage;
    lemonCaption: string;
    spoonImage: AboutImage;
    spoonCaption: string;
  };
  section5: {
    tearImage: AboutImage;
    introducingText: string;
    logoImage: AboutImage;
    taglineImage: AboutImage;
    paragraph1: string;
    paragraph2Prefix: string;
    paragraph2Accent: string;
    paragraph3: string;
    paragraph4: string;
    closingText: string;
  };
  section6: {
    topStripImages: AboutImage[];
    headingLine1: string;
    headingLine2: string;
    joinMoreText: string;
    envelopeImage: AboutImage;
    envelope: EnvelopeContent;
  };
};

const ABOUT_PAGE_QUERY = `*[_type == "aboutPage"] | order(_updatedAt desc)[0]{
  "heroImage": coalesce(heroImageSvg.asset->url, heroImage),
  heroImageAlt,
  heroHeading,
  heroSubheading,
  heroIntroBody,

  section2Heading,
  section2MixingLabel,
  section2TastingLabel,
  "section2Image1": coalesce(section2Image1Svg.asset->url, section2Image1),
  section2Image1Alt,
  "section2Image2": coalesce(section2Image2Svg.asset->url, section2Image2),
  section2Image2Alt,
  "section2Image3": coalesce(section2Image3Svg.asset->url, section2Image3),
  section2Image3Alt,
  section2SpentYearsText,
  section2JourneyText,

  section3Heading,
  section3EyesSequence[]{
    "image": coalesce(imageSvg.asset->url, image),
    alt
  },
  "section3TongueImage": coalesce(section3TongueImageSvg.asset->url, section3TongueImage),
  section3TongueImageAlt,
  section3IndiaCallout1,
  section3IndiaCallout2,
  section3IndiaCallout3,
  section3ClosingText,

  section4FlavorWords[]{
    label,
    "backgroundImage": coalesce(backgroundImageSvg.asset->url, backgroundImage)
  },
  section4BodyText,
  section4IssueHeading,
  section4SideText,
  "section4LemonImage": coalesce(section4LemonImageSvg.asset->url, section4LemonImage),
  section4LemonImageAlt,
  section4LemonCaption,
  "section4SpoonImage": coalesce(section4SpoonImageSvg.asset->url, section4SpoonImage),
  section4SpoonImageAlt,
  section4SpoonCaption,

  "section5TearImage": coalesce(section5TearImageSvg.asset->url, section5TearImage),
  section5TearImageAlt,
  section5IntroducingText,
  "section5LogoImage": coalesce(section5LogoImageSvg.asset->url, section5LogoImage),
  section5LogoImageAlt,
  "section5TaglineImage": coalesce(section5TaglineImageSvg.asset->url, section5TaglineImage),
  section5TaglineImageAlt,
  section5Paragraph1,
  section5Paragraph2Prefix,
  section5Paragraph2Accent,
  section5Paragraph3,
  section5Paragraph4,
  section5ClosingText,

  section6TopStripImages[]{
    "image": coalesce(imageSvg.asset->url, image),
    alt
  },
  section6HeadingLine1,
  section6HeadingLine2,
  section6JoinMoreText,
  "section6EnvelopeImage": coalesce(section6EnvelopeImageSvg.asset->url, section6EnvelopeImage),
  section6EnvelopeImageAlt,

  envelopeHeading,
  envelopeBody,
  envelopeSignoff,
  envelopeText
}`;

const sanityClientLive = sanityClient;
const SANITY_FETCH_OPTIONS = { next: { revalidate: 300 } };

const DEFAULT_ENVELOPE_CONTENT: EnvelopeContent = {
  heading: 'hellooo',
  body: 'i am sakshi the founder of sourboo\n\nwe are hosting an event at 27th!\ncome through',
  signoff: 'xx',
};

const DEFAULT_SECTION3_EYES_SEQUENCE = [
  '/about/section-three-eyes.webp',
  '/about/eyes2.webp',
  '/about/eyes3.webp',
  '/about/section-three-eyes.webp',
];

const DEFAULT_SECTION4_FLAVOR_WORDS: AboutFlavorWord[] = [
  { label: 'BOLD', bgSrc: '/about/boldbg.svg' },
  { label: 'spicy', bgSrc: '/about/spicybg.svg' },
  { label: 'sour', bgSrc: '/about/sourbg.svg' },
];

const DEFAULT_SECTION6_TOP_STRIP_IMAGES: AboutImage[] = [
  { src: '/about/section-six-top-1.webp', alt: 'Sourboo event tasting moment' },
  { src: '/about/section-six-top-2.webp', alt: 'Sourboo event team shot' },
  { src: '/about/section-six-top-3.webp', alt: 'Sourboo event customer tasting moment' },
];

const DEFAULT_ABOUT_CONTENT: AboutPageContent = {
  hero: {
    image: { src: '/about/about-cover.JPG', alt: 'Hero' },
    heading: 'hi i am sakshi,',
    subheading: 'and i am really glad you are here',
    introBody: 'if u are here, i am assuming, you like sour or curious enough to try it',
  },
  section2: {
    heading: "I've always been (annoyingly) obsessed with flavours.",
    mixingLabel: 'Mixing things',
    tastingLabel: 'Tasting everything',
    image1: { src: '/about/section-two-1.svg', alt: 'Mixing drinks' },
    image2: { src: '/about/section-two-2.svg', alt: 'Tasting everything' },
    image3: { src: '/about/section-two-3.svg', alt: 'Third collage visual' },
    spentYearsText: 'spent 5 years',
    journeyText: 'around food and drinks from london bar shifts to a 9-5 desk job in India',
  },
  section3: {
    heading: 'different lives, same cravings',
    eyesSequence: DEFAULT_SECTION3_EYES_SEQUENCE,
    tongueImage: { src: '/about/section-three-tongue.svg', alt: 'Tongue illustration' },
    indiaLines: [
      'India loves chaaat',
      'India loves flavour',
      'India loves that sour & spicy hit',
    ],
    closingText: 'Nothing worked for a desi palate that loves',
  },
  section4: {
    flavorWords: DEFAULT_SECTION4_FLAVOR_WORDS,
    bodyText: "but doesn't want to feel weighed down after snacking",
    issueHeading: 'MY BIGGEST ISSUE?',
    sideText: 'Sour was always treated like a side.',
    lemonImage: { src: '/about/lemonsqueze.gif', alt: 'Lemon drop illustration' },
    lemonCaption: 'A squeeze here.',
    spoonImage: { src: '/about/spoonofpickle.gif', alt: 'Spoon of pickle illustration' },
    spoonCaption: 'A spoon of pickle there.',
  },
  section5: {
    tearImage: { src: '/about/paper-tear.svg', alt: 'Paper tear' },
    introducingText: 'Introducing',
    logoImage: { src: '/logo.svg', alt: 'Sourboo logo' },
    taglineImage: { src: '/tagline.svg', alt: 'Tagline illustration' },
    paragraph1: "sour first snack, made for people who don't eat quietly.",
    paragraph2Prefix: 'for women who love',
    paragraph2Accent: 'loud flavours, strong opinions, and fully indulging.',
    paragraph3: 'The kind who make faces when they eat.',
    paragraph4: 'The kind who ask for extra nimbu.',
    closingText: 'A new way of snacking.',
  },
  section6: {
    topStripImages: DEFAULT_SECTION6_TOP_STRIP_IMAGES,
    headingLine1: "That's Sourboo to me.",
    headingLine2: 'And I hope you love it as much as I do',
    joinMoreText: 'join more',
    envelopeImage: { src: '/about/section-six-envelope.svg', alt: 'Envelope card' },
    envelope: DEFAULT_ENVELOPE_CONTENT,
  },
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
  const width = options?.width ?? 1800;
  const quality = options?.quality ?? 78;

  return sanityImageOrFileUrl(source, fallback, { width, quality });
}

function toImage(
  source: unknown,
  altValue: unknown,
  fallback: AboutImage,
  options?: { width?: number; quality?: number },
): AboutImage {
  const src = asNonEmptyString(imageSrc(source, '', options)) || fallback.src;
  const alt = asNonEmptyString(altValue) || fallback.alt;

  return { src, alt };
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

function toOverridableImageList(
  entries: AboutImageItemQuery[] | undefined,
  fallbacks: AboutImage[],
  options?: { width?: number; quality?: number },
): AboutImage[] {
  return fallbacks.map((fallback, index) => {
    const entry = entries?.[index];
    return toImage(entry?.image, entry?.alt, fallback, options);
  });
}

function toOverridableImageSequence(
  entries: AboutImageItemQuery[] | undefined,
  fallbacks: string[],
  options?: { width?: number; quality?: number },
): string[] {
  return fallbacks.map((fallback, index) => {
    const overrideSrc = asNonEmptyString(imageSrc(entries?.[index]?.image, '', options));
    return overrideSrc || fallback;
  });
}

function toOverridableFlavorWords(
  entries: AboutFlavorWordQuery[] | undefined,
  fallbacks: AboutFlavorWord[],
): AboutFlavorWord[] {
  return fallbacks.map((fallback, index) => {
    const entry = entries?.[index];
    return {
      label: asNonEmptyString(entry?.label) || fallback.label,
      bgSrc:
        asNonEmptyString(imageSrc(entry?.backgroundImage, '', { width: 900, quality: 80 })) ||
        fallback.bgSrc,
    };
  });
}

async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    const data = await sanityClientLive.fetch<AboutPageQueryResult>(
      ABOUT_PAGE_QUERY,
      {},
      SANITY_FETCH_OPTIONS,
    );

    const legacyEnvelope = asNonEmptyString(data?.envelopeText)
      ? parseLegacyEnvelopeText(asNonEmptyString(data?.envelopeText) || '')
      : undefined;

    const envelope: EnvelopeContent = {
      heading:
        asNonEmptyString(data?.envelopeHeading) ||
        legacyEnvelope?.heading ||
        DEFAULT_ABOUT_CONTENT.section6.envelope.heading,
      body:
        asNonEmptyString(data?.envelopeBody) ||
        legacyEnvelope?.body ||
        DEFAULT_ABOUT_CONTENT.section6.envelope.body,
      signoff:
        asNonEmptyString(data?.envelopeSignoff) ||
        legacyEnvelope?.signoff ||
        DEFAULT_ABOUT_CONTENT.section6.envelope.signoff,
    };

    return {
      hero: {
        image: toImage(data?.heroImage, data?.heroImageAlt, DEFAULT_ABOUT_CONTENT.hero.image, {
          width: 2200,
          quality: 78,
        }),
        heading: asNonEmptyString(data?.heroHeading) || DEFAULT_ABOUT_CONTENT.hero.heading,
        subheading: asNonEmptyString(data?.heroSubheading) || DEFAULT_ABOUT_CONTENT.hero.subheading,
        introBody: asNonEmptyString(data?.heroIntroBody) || DEFAULT_ABOUT_CONTENT.hero.introBody,
      },
      section2: {
        heading: asNonEmptyString(data?.section2Heading) || DEFAULT_ABOUT_CONTENT.section2.heading,
        mixingLabel:
          asNonEmptyString(data?.section2MixingLabel) || DEFAULT_ABOUT_CONTENT.section2.mixingLabel,
        tastingLabel:
          asNonEmptyString(data?.section2TastingLabel) || DEFAULT_ABOUT_CONTENT.section2.tastingLabel,
        image1: toImage(data?.section2Image1, data?.section2Image1Alt, DEFAULT_ABOUT_CONTENT.section2.image1, {
          width: 1400,
          quality: 78,
        }),
        image2: toImage(data?.section2Image2, data?.section2Image2Alt, DEFAULT_ABOUT_CONTENT.section2.image2, {
          width: 1400,
          quality: 78,
        }),
        image3: toImage(data?.section2Image3, data?.section2Image3Alt, DEFAULT_ABOUT_CONTENT.section2.image3, {
          width: 1200,
          quality: 78,
        }),
        spentYearsText:
          asNonEmptyString(data?.section2SpentYearsText) || DEFAULT_ABOUT_CONTENT.section2.spentYearsText,
        journeyText:
          asNonEmptyString(data?.section2JourneyText) || DEFAULT_ABOUT_CONTENT.section2.journeyText,
      },
      section3: {
        heading: asNonEmptyString(data?.section3Heading) || DEFAULT_ABOUT_CONTENT.section3.heading,
        eyesSequence: toOverridableImageSequence(
          data?.section3EyesSequence,
          DEFAULT_ABOUT_CONTENT.section3.eyesSequence,
          { width: 1600, quality: 78 },
        ),
        tongueImage: toImage(
          data?.section3TongueImage,
          data?.section3TongueImageAlt,
          DEFAULT_ABOUT_CONTENT.section3.tongueImage,
          { width: 1500, quality: 78 },
        ),
        indiaLines: [
          asNonEmptyString(data?.section3IndiaCallout1) || DEFAULT_ABOUT_CONTENT.section3.indiaLines[0],
          asNonEmptyString(data?.section3IndiaCallout2) || DEFAULT_ABOUT_CONTENT.section3.indiaLines[1],
          asNonEmptyString(data?.section3IndiaCallout3) || DEFAULT_ABOUT_CONTENT.section3.indiaLines[2],
        ],
        closingText:
          asNonEmptyString(data?.section3ClosingText) || DEFAULT_ABOUT_CONTENT.section3.closingText,
      },
      section4: {
        flavorWords: toOverridableFlavorWords(
          data?.section4FlavorWords,
          DEFAULT_ABOUT_CONTENT.section4.flavorWords,
        ),
        bodyText: asNonEmptyString(data?.section4BodyText) || DEFAULT_ABOUT_CONTENT.section4.bodyText,
        issueHeading:
          asNonEmptyString(data?.section4IssueHeading) || DEFAULT_ABOUT_CONTENT.section4.issueHeading,
        sideText: asNonEmptyString(data?.section4SideText) || DEFAULT_ABOUT_CONTENT.section4.sideText,
        lemonImage: toImage(
          data?.section4LemonImage,
          data?.section4LemonImageAlt,
          DEFAULT_ABOUT_CONTENT.section4.lemonImage,
          { width: 900, quality: 80 },
        ),
        lemonCaption:
          asNonEmptyString(data?.section4LemonCaption) || DEFAULT_ABOUT_CONTENT.section4.lemonCaption,
        spoonImage: toImage(
          data?.section4SpoonImage,
          data?.section4SpoonImageAlt,
          DEFAULT_ABOUT_CONTENT.section4.spoonImage,
          { width: 900, quality: 80 },
        ),
        spoonCaption:
          asNonEmptyString(data?.section4SpoonCaption) || DEFAULT_ABOUT_CONTENT.section4.spoonCaption,
      },
      section5: {
        tearImage: toImage(
          data?.section5TearImage,
          data?.section5TearImageAlt,
          DEFAULT_ABOUT_CONTENT.section5.tearImage,
          { width: 1800, quality: 78 },
        ),
        introducingText:
          asNonEmptyString(data?.section5IntroducingText) ||
          DEFAULT_ABOUT_CONTENT.section5.introducingText,
        logoImage: toImage(
          data?.section5LogoImage,
          data?.section5LogoImageAlt,
          DEFAULT_ABOUT_CONTENT.section5.logoImage,
          { width: 1200, quality: 82 },
        ),
        taglineImage: toImage(
          data?.section5TaglineImage,
          data?.section5TaglineImageAlt,
          DEFAULT_ABOUT_CONTENT.section5.taglineImage,
          { width: 1600, quality: 80 },
        ),
        paragraph1:
          asNonEmptyString(data?.section5Paragraph1) || DEFAULT_ABOUT_CONTENT.section5.paragraph1,
        paragraph2Prefix:
          asNonEmptyString(data?.section5Paragraph2Prefix) ||
          DEFAULT_ABOUT_CONTENT.section5.paragraph2Prefix,
        paragraph2Accent:
          asNonEmptyString(data?.section5Paragraph2Accent) ||
          DEFAULT_ABOUT_CONTENT.section5.paragraph2Accent,
        paragraph3:
          asNonEmptyString(data?.section5Paragraph3) || DEFAULT_ABOUT_CONTENT.section5.paragraph3,
        paragraph4:
          asNonEmptyString(data?.section5Paragraph4) || DEFAULT_ABOUT_CONTENT.section5.paragraph4,
        closingText:
          asNonEmptyString(data?.section5ClosingText) || DEFAULT_ABOUT_CONTENT.section5.closingText,
      },
      section6: {
        topStripImages: toOverridableImageList(
          data?.section6TopStripImages,
          DEFAULT_ABOUT_CONTENT.section6.topStripImages,
          { width: 1400, quality: 76 },
        ),
        headingLine1:
          asNonEmptyString(data?.section6HeadingLine1) || DEFAULT_ABOUT_CONTENT.section6.headingLine1,
        headingLine2:
          asNonEmptyString(data?.section6HeadingLine2) || DEFAULT_ABOUT_CONTENT.section6.headingLine2,
        joinMoreText:
          asNonEmptyString(data?.section6JoinMoreText) || DEFAULT_ABOUT_CONTENT.section6.joinMoreText,
        envelopeImage: toImage(
          data?.section6EnvelopeImage,
          data?.section6EnvelopeImageAlt,
          DEFAULT_ABOUT_CONTENT.section6.envelopeImage,
          { width: 1400, quality: 82 },
        ),
        envelope,
      },
    };
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

export default async function Home() {
  const aboutContent = await getAboutPageContent();

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#F7FEE7]">
      <Navbar />
      <AboutWordByWordReveal />

      <section
        className="relative max-w-none"
        style={{
          width: '100vw',
          maxWidth: '100vw',
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
      >
        <div
          className="relative aspect-video max-w-none md:aspect-auto md:h-[82vh] md:min-h-[760px]"
          style={{ width: '100vw', maxWidth: '100vw' }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={aboutContent.hero.image.src}
              alt={aboutContent.hero.image.alt}
              fill
              sizes="100vw"
              className="object-cover object-center"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              priority
              loading="eager"
              fetchPriority="high"
              quality={74}
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-[48%] md:translate-y-1/2">
            <div className="mx-auto w-full max-w-[1220px] px-6 md:px-12">
              <CoolRascalText
                as="h1"
                text={aboutContent.hero.heading}
                className="break-words text-4xl font-bold leading-[0.95] sm:text-5xl md:text-7xl lg:text-8xl"
                pattern="everyThird"
                baseClassName="text-[#F9A8D4] opacity-70"
                accentClassName="text-[#F9A8D4] opacity-70"
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1220px] px-6 pb-12 pt-6 md:px-12 md:pb-16 md:pt-20">
          <CoolRascalText
            as="h2"
            text={aboutContent.hero.subheading}
            className="mb-8 break-words text-4xl font-bold leading-[0.95] text-[#E61E6E] sm:text-5xl md:mb-12 md:text-7xl lg:text-8xl"
            pattern="alternate"
            startWith="accent"
          />

          <p
            className="ml-auto max-w-md break-words text-right text-base text-[#1C1917] md:max-w-lg md:text-lg lg:text-xl"
            style={{ fontFamily: 'schoolbell' }}
          >
            {aboutContent.hero.introBody}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[420px] pb-16 md:max-w-[1100px] md:pb-24">
        <p className="mx-auto max-w-[350px] text-center text-[32px] leading-[1.02] text-[#E61E6E] font-coolvetica md:max-w-[1040px] md:text-[78px]">
          {aboutContent.section2.heading}
        </p>

        <div className="relative mx-auto mt-8 h-[760px] w-full md:mt-14 md:h-[760px]">
          <p className="absolute right-0 top-12 z-20 rotate-[16deg] text-[24px] text-[#1E1E1E] font-schoolbell md: -right-[4%] md:text-[52px]">
            {aboutContent.section2.mixingLabel}
          </p>
          <div className="absolute right-2 top-14 h-[310px] w-[90%] overflow-hidden md:top-20 md:h-[340px] md:w-[44%]">
            <Image
              src={aboutContent.section2.image1.src}
              alt={aboutContent.section2.image1.alt}
              fill
              sizes="(max-width: 768px) 90vw, 44vw"
              className="object-cover object-top"
            />
          </div>

          <p className="absolute left-[6px] top-[47%] z-20 -rotate-[14deg] text-[24px] text-[#A8AC1A] font-schoolbell md: -left-[32%] md:top-[44%] md:text-[52px]">
            {aboutContent.section2.tastingLabel}
          </p>
          <div className="absolute left-0 top-[50%] h-[320px] w-[98%] overflow-hidden md:left-[2%] md:top-[52%] md:h-[380px] md:w-[54%]">
            <Image
              src={aboutContent.section2.image2.src}
              alt={aboutContent.section2.image2.alt}
              fill
              sizes="(max-width: 768px) 98vw, 54vw"
              className="object-cover"
            />
          </div>

          <div className="absolute top-[82%] right-0 h-[300px] w-[58%] overflow-hidden md:h-[360px] md:w-[25%]">
            <Image
              src={aboutContent.section2.image3.src}
              alt={aboutContent.section2.image3.alt}
              fill
              sizes="(max-width: 768px) 58vw, 25vw"
              className="object-cover"
            />
          </div>
        </div>

        <p className="mt-44 text-center text-[42px] leading-[0.95] text-[#E61E6E] font-schoolbell md:mt-14 md:text-[72px]">
          {aboutContent.section2.spentYearsText}
        </p>
        <p className="mx-auto mt-4 max-w-[360px] text-center text-[32px] leading-[1.03] text-[#E61E6E] font-schoolbell md:max-w-[920px] md:text-[52px]">
          {aboutContent.section2.journeyText}
        </p>
      </section>

      <section className="mx-auto w-full max-w-[520px] px-4 pb-2 md:max-w-[1320px] md:px-10 md:pb-28">
        <p className="text-center text-[26px] leading-[1.02] text-[#E61E6E] font-schoolbell md:text-[76px]">
          {aboutContent.section3.heading}
        </p>

        <div className="relative mx-auto h-[720px] w-full overflow-visible md:h-[1280px]">
          <div className="absolute inset-0 overflow-hidden">
            <SectionThreeEyesSequence imageSrcs={aboutContent.section3.eyesSequence} />
          </div>

          <div className="about-tongue-position absolute left-1/2 h-[380px] w-[108%] -translate-x-1/2 md:h-[900px] md:w-[68%]">
            <Image
              src={aboutContent.section3.tongueImage.src}
              alt={aboutContent.section3.tongueImage.alt}
              fill
              sizes="(max-width: 768px) 108vw, 68vw"
              className="object-contain z-10"
            />
            <IndiaLovesLines lines={aboutContent.section3.indiaLines} />
          </div>
        </div>
        <p className="-mt-90 text-center text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:-mt-64 md:text-[48px]">
          {aboutContent.section3.closingText}
        </p>
      </section>

      <section className="relative mt-12 w-full bg-[#F6AE5A] pb-20 pt-6 md:mt-0 md:pb-28 md:pt-10">
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
          <AboutFlavorWords words={aboutContent.section4.flavorWords} />

          <p className="mx-auto mt-7 max-w-[390px] text-center text-[32px] leading-[1.03] text-[#E61E6E] font-schoolbell md:mt-12 md:max-w-[740px] md:text-[62px]">
            {aboutContent.section4.bodyText}
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
            <p className="relative z-10 text-center text-[32px] leading-none text-[#15803D] font-coolvetica md:text-[128px]">
              {aboutContent.section4.issueHeading}
            </p>
          </div>

          <p className="mx-auto mt-16 max-w-[390px] text-center text-[32px] leading-[1.02] text-[#E61E6E] font-schoolbell md:mt-16 md:max-w-[760px] md:text-[64px]">
            {aboutContent.section4.sideText}
          </p>

          <div className="relative mt-16 md:mt-16">
            <div className="pointer-events-none absolute left-6 top-6 z-0 h-[120px] w-[250px] -translate-x-[40%] -translate-y-1/2 md:top-8 md:h-[260px] md:w-[300px] md:-translate-x-[38%] md:-translate-y-1/2">
              <Image
                src={aboutContent.section4.lemonImage.src}
                alt={aboutContent.section4.lemonImage.alt}
                fill
                sizes="(max-width: 768px) 250px, 300px"
                className="object-contain"
              />
            </div>
            <p className="relative z-10 pl-22 text-left text-[24px] leading-[1.02] text-[#E61E6E] font-schoolbell md:pl-16 md:text-[36px]">
              {aboutContent.section4.lemonCaption}
            </p>
          </div>
          <div className="relative mt-16 md:mt-12">
            <div className="pointer-events-none absolute right-8 top-[48%] z-0 h-[120px] w-[250px] translate-x-[40%] -translate-y-1/2 md:top-[48%] md:h-[260px] md:w-[300px] md:translate-x-[38%]">
              <Image
                src={aboutContent.section4.spoonImage.src}
                alt={aboutContent.section4.spoonImage.alt}
                fill
                sizes="(max-width: 768px) 250px, 300px"
                className="object-contain rotate-[8deg]"
              />
            </div>
            <p className="relative z-10 pr-24 text-right text-[24px] leading-[1.02] text-[#E61E6E] font-schoolbell md:pr-16 md:text-[36px]">
              {aboutContent.section4.spoonCaption}
            </p>
          </div>
        </div>
      </section>

      <section className="relative -mt-12 w-full overflow-hidden bg-[#F7FEE7] pb-0 md:-mt-24 md:pb-0">
        <div
          className="relative left-1/2 h-[124px] w-screen -translate-x-1/2 md:h-[240px]"
          style={{
            background:
              'linear-gradient(to bottom, #F6AE5A 0%, #e8e0eb 46%, #F7FEE7 46%, #F7FEE7 100%)',
          }}
        >
          <Image
            src={aboutContent.section5.tearImage.src}
            alt={aboutContent.section5.tearImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="mx-auto max-w-[430px] px-5 pt-6 text-center md:max-w-[1100px] md:px-12 md:pt-10">
          <p className="text-[24px] leading-none text-[#b68ad9] font-schoolbell md:text-[48px]">
            {aboutContent.section5.introducingText}
          </p>

          <div className="relative mx-auto h-[62px] w-[250px] md:h-[116px] md:w-[360px]">
            <Image
              src={aboutContent.section5.logoImage.src}
              alt={aboutContent.section5.logoImage.alt}
              fill
              sizes="(max-width: 768px) 250px, 360px"
              className="object-contain"
            />
          </div>

          <div className="relative mx-auto -mt-1 h-[120px] w-[420px] max-w-full md:-mt-2 md:h-[250px] md:w-[900px]">
            <Image
              src={aboutContent.section5.taglineImage.src}
              alt={aboutContent.section5.taglineImage.alt}
              fill
              sizes="(max-width: 768px) 420px, 900px"
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-1 flex max-w-[390px] flex-col gap-16 text-center md:mt-2 md:max-w-[740px] md:gap-14">
            <p className="text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[52px]">
              {aboutContent.section5.paragraph1}
            </p>

            <p className="text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[48px]">
              {aboutContent.section5.paragraph2Prefix}{' '}
              <span className="text-[#A8CF3D]">{aboutContent.section5.paragraph2Accent}</span>
            </p>

            <div className="flex flex-col gap-6 md:gap-4">
              <p className="text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[36px]">
                {aboutContent.section5.paragraph3}
              </p>

              <p className="text-[24px] leading-[1.03] text-[#E61E6E] font-schoolbell md:text-[36px]">
                {aboutContent.section5.paragraph4}
              </p>
            </div>

            <p className="text-[32px] leading-[1.04] text-[#F18BB7] font-rascal md:text-[62px]">
              {aboutContent.section5.closingText}
            </p>
          </div>
        </div>

        <div
          className="relative mt-10 h-[104px] w-full md:mt-14 md:h-[130px]"
          style={{
            background:
              'linear-gradient(to bottom, #F7FEE7 0%, #F7FEE7 54%, #e8e0eb 54%, #F6AE5A 100%)',
          }}
        >
          <Image
            src={aboutContent.section5.tearImage.src}
            alt={aboutContent.section5.tearImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section data-scroll-reveal="off" className="w-full bg-[#F6AE5A] pb-0 md:pb-28">
        <AboutTopStrip items={aboutContent.section6.topStripImages} />

        <div className="mx-auto w-full max-w-[430px] md:max-w-[1100px]">
          <p className="mx-auto mt-8 max-w-[360px] text-center text-[32px] leading-[1.03] text-[#E61E6E] font-coolvetica md:mt-10 md:max-w-[620px] md:text-[62px]">
            {aboutContent.section6.headingLine1}
            <br />
            {aboutContent.section6.headingLine2}
          </p>

          <div className="mx-auto mt-14 w-[92%] md:mt-20 md:w-[82%]">
            <p className="ml-auto w-fit translate-y-1 text-right text-[32px] leading-none text-[#4f4956] font-coolvetica md:translate-y-12 md:text-[64px]">
              {aboutContent.section6.joinMoreText}
            </p>
          </div>

          <div className="relative mx-auto mt-2 h-[300px] w-[88%] md:mt-4 md:h-[680px] md:w-[76%]">
            <Image
              src={aboutContent.section6.envelopeImage.src}
              alt={aboutContent.section6.envelopeImage.alt}
              fill
              sizes="(max-width: 768px) 88vw, 76vw"
              className="object-contain"
            />

            <AboutEnvelopeText
              heading={aboutContent.section6.envelope.heading}
              body={aboutContent.section6.envelope.body}
              signoff={aboutContent.section6.envelope.signoff}
            />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none relative left-1/2 mt-2 h-12 w-screen -translate-x-1/2 md:mt-6 md:h-16 md:-mb-28"
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

export const metadata = pageMetadata("About Sourboo", "Meet Sourboo: bold, sour and spicy snackable pickled gherkins, made for mouths that misbehave.", "/about");
