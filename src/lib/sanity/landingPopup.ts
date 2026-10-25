import { sanityClient } from '@/src/lib/sanity/client';
import { POPUP_DISCOUNT_CODE } from '@/src/lib/checkout/discountCodes';

export type LandingPopupOption = {
  label: string;
  href: string;
  backgroundImageSrc?: string;
  textColor: string;
  textOffsetX: number;
  textOffsetY: number;
};

export type LandingPopupLeadCaptureContent = {
  headingPrefix: string;
  discountPrefix: string;
  discountMain: string;
  prompt: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  ctaLabel: string;
  disclaimer: string;
  ctaBackgroundImageSrc?: string;
  successCode: string;
  successMessage: string;
};

export type LandingPopupContent = {
  enabled: boolean;
  delaySeconds: number;
  headingStart: string;
  headingMain: string;
  subheading: string;
  backgroundColor: string;
  closeIcon: {
    src?: string;
    alt: string;
  };
  // Keep recovered artwork local so the popup survives Sanity API/CDN outages.
  images: {
    topLeft: { src?: string; alt: string };
    center: { src?: string; alt: string };
    topRight: { src?: string; alt: string };
    bottomLeft: { src?: string; alt: string };
    thirdOilDrip: { src?: string; alt: string };
  };
  options: LandingPopupOption[];
  leadCapture: LandingPopupLeadCaptureContent;
};

type LandingPopupOptionQuery = {
  label?: string;
  href?: string;
  backgroundImage?: unknown;
  textColor?: string;
  textOffsetX?: number;
  textOffsetY?: number;
};

type LandingPopupQueryResult = {
  landingPopupEnabled?: boolean;
  landingPopupDelaySeconds?: number;
  landingPopupHeadingStart?: string;
  landingPopupHeadingMain?: string;
  landingPopupSubheading?: string;
  landingPopupBackgroundColor?: string;
  landingPopupCloseIconUrl?: string;
  landingPopupCloseIconAlt?: string;
  landingPopupTopLeftImage?: unknown;
  landingPopupTopLeftImageAlt?: string;
  landingPopupCenterImage?: unknown;
  landingPopupCenterImageAlt?: string;
  landingPopupTopRightImage?: unknown;
  landingPopupTopRightImageAlt?: string;
  landingPopupBottomLeftImage?: unknown;
  landingPopupBottomLeftImageAlt?: string;
  landingPopupThirdOilDripImage?: unknown;
  landingPopupThirdOilDripImageAlt?: string;
  landingPopupOptions?: LandingPopupOptionQuery[];
  landingPopupLeadHeadingPrefix?: string;
  landingPopupLeadDiscountPrefix?: string;
  landingPopupLeadDiscountMain?: string;
  landingPopupLeadPrompt?: string;
  landingPopupLeadEmailPlaceholder?: string;
  landingPopupLeadPhonePlaceholder?: string;
  landingPopupLeadCtaLabel?: string;
  landingPopupLeadDisclaimer?: string;
  landingPopupLeadCtaBackgroundImage?: unknown;
  landingPopupLeadSuccessCode?: string;
  landingPopupLeadSuccessMessage?: string;
} | null;

const DEFAULT_OPTIONS: LandingPopupOption[] = [
  {
    label: 'Sour & Savage →',
    href: '/product',
    backgroundImageSrc: '/popup/button-bg-1.svg',
    textColor: '#FFF36A',
    textOffsetX: 0,
    textOffsetY: 0,
  },
  {
    label: 'Sweet but Psycho →',
    href: '/product',
    backgroundImageSrc: '/popup/button-bg-2.svg',
    textColor: '#F6E9DE',
    textOffsetX: 0,
    textOffsetY: 0,
  },
  {
    label: 'Spicy Drama →',
    href: '/product',
    backgroundImageSrc: '/popup/button-bg-3.svg',
    textColor: '#F5EAFB',
    textOffsetX: 0,
    textOffsetY: 0,
  },
  {
    label: 'Lowkey Tangy →',
    href: '/product',
    backgroundImageSrc: '/popup/button-bg-4.svg',
    textColor: '#F0EC84',
    textOffsetX: 0,
    textOffsetY: 0,
  },
];

const DEFAULT_LEAD_CAPTURE: LandingPopupLeadCaptureContent = {
  headingPrefix: "You're",
  discountPrefix: 'take',
  discountMain: "5% off. you've earned it",
  prompt: 'where should we send it?',
  emailPlaceholder: 'your email',
  phonePlaceholder: 'your phone number',
  ctaLabel: 'unlock my 5%',
  disclaimer: 'no spam, just sour things :)',
  ctaBackgroundImageSrc: '/popup/button1.svg',
  successCode: POPUP_DISCOUNT_CODE,
  successMessage: 'you are in! copy the code and use it at checkout to get 5% off your cart total.',
};

export const DEFAULT_LANDING_POPUP_CONTENT: LandingPopupContent = {
  enabled: true,
  delaySeconds: 5,
  headingStart: 'what',
  headingMain: 'kind of sour are you?',
  subheading: 'be honest',
  backgroundColor: '#EEDDEB',
  closeIcon: {
    alt: 'Close popup',
  },
  images: {
    topLeft: {
      src: '/popup/image1.svg',
      alt: 'Decorative oil drip on the top left',
    },
    center: {
      src: '/popup/image2.svg',
      alt: 'Decorative center splash',
    },
    topRight: {
      src: '/popup/image3.svg',
      alt: 'Decorative lemon slice on the top right',
    },
    bottomLeft: {
      src: '/popup/image4.svg',
      alt: 'Decorative eye illustration on the bottom left',
    },
    thirdOilDrip: {
      src: '/popup/image1.svg',
      alt: 'Decorative third oil drip on the bottom right',
    },
  },
  options: DEFAULT_OPTIONS,
  leadCapture: DEFAULT_LEAD_CAPTURE,
};

const LANDING_POPUP_QUERY = `*[_type == "siteSettings"] | order(_updatedAt desc)[0]{
  landingPopupEnabled,
  landingPopupDelaySeconds,
  landingPopupHeadingStart,
  landingPopupHeadingMain,
  landingPopupSubheading,
  landingPopupBackgroundColor,
  "landingPopupCloseIconUrl": landingPopupCloseIcon.asset->url,
  landingPopupCloseIconAlt,
  "landingPopupTopLeftImage": coalesce(landingPopupTopLeftImageSvg.asset->url, landingPopupTopLeftImage),
  landingPopupTopLeftImageAlt,
  "landingPopupCenterImage": coalesce(landingPopupCenterImageSvg.asset->url, landingPopupCenterImage),
  landingPopupCenterImageAlt,
  "landingPopupTopRightImage": coalesce(landingPopupTopRightImageSvg.asset->url, landingPopupTopRightImage),
  landingPopupTopRightImageAlt,
  "landingPopupBottomLeftImage": coalesce(landingPopupBottomLeftImageSvg.asset->url, landingPopupBottomLeftImage),
  landingPopupBottomLeftImageAlt,
  "landingPopupThirdOilDripImage": coalesce(landingPopupThirdOilDripImageSvg.asset->url, landingPopupThirdOilDripImage),
  landingPopupThirdOilDripImageAlt,
  landingPopupLeadHeadingPrefix,
  landingPopupLeadDiscountPrefix,
  landingPopupLeadDiscountMain,
  landingPopupLeadPrompt,
  landingPopupLeadEmailPlaceholder,
  landingPopupLeadPhonePlaceholder,
  landingPopupLeadCtaLabel,
  landingPopupLeadDisclaimer,
  "landingPopupLeadCtaBackgroundImage": coalesce(landingPopupLeadCtaBackgroundImageSvg.asset->url, landingPopupLeadCtaBackgroundImage),
  landingPopupLeadSuccessCode,
  landingPopupLeadSuccessMessage,
  landingPopupOptions[]{
    label,
    href,
    "backgroundImage": coalesce(backgroundImageSvg.asset->url, backgroundImage),
    textColor,
    textOffsetX,
    textOffsetY
  }
}`;

const sanityClientLive = sanityClient.withConfig({ useCdn: false });
const SANITY_NO_STORE_OPTIONS = { cache: 'no-store' as const };

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asHexColor(value: unknown, fallback: string): string {
  const maybe = asNonEmptyString(value);
  if (!maybe) return fallback;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(maybe) ? maybe : fallback;
}

function asDelaySeconds(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const normalized = Math.round(value);
  return Math.min(30, Math.max(0, normalized));
}

function asOffsetPx(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  const normalized = Math.round(value);
  return Math.min(120, Math.max(-120, normalized));
}

function asValidAbsoluteUrl(value: unknown): string | undefined {
  const maybe = asNonEmptyString(value);
  if (!maybe) return undefined;
  try {
    return new URL(maybe).toString();
  } catch {
    return undefined;
  }
}

function asValidHref(value: unknown, fallback: string): string {
  const maybeHref = asNonEmptyString(value);
  if (!maybeHref) return fallback;

  if (maybeHref.startsWith('/')) return maybeHref;

  try {
    return new URL(maybeHref).toString();
  } catch {
    return fallback;
  }
}

function toPopupOptions(source: LandingPopupOptionQuery[] | undefined): LandingPopupOption[] {
  return DEFAULT_OPTIONS.map((fallback, index) => {
    const item = Array.isArray(source) ? source[index] : undefined;
    return {
      label: asNonEmptyString(item?.label) || fallback.label,
      href: asValidHref(item?.href, fallback.href),
      backgroundImageSrc: fallback.backgroundImageSrc,
      textColor: asHexColor(item?.textColor, fallback.textColor),
      textOffsetX: asOffsetPx(item?.textOffsetX, fallback.textOffsetX),
      textOffsetY: asOffsetPx(item?.textOffsetY, fallback.textOffsetY),
    };
  });
}

export async function getLandingPopupContent(revalidate = 0): Promise<LandingPopupContent> {
  const client = revalidate === 0 ? sanityClientLive : sanityClient;
  const fetchOptions = revalidate === 0 ? SANITY_NO_STORE_OPTIONS : { next: { revalidate } };

  try {
    const data = await client.fetch<LandingPopupQueryResult>(
      LANDING_POPUP_QUERY,
      {},
      fetchOptions,
    );

    return {
      enabled:
        typeof data?.landingPopupEnabled === 'boolean'
          ? data.landingPopupEnabled
          : DEFAULT_LANDING_POPUP_CONTENT.enabled,
      delaySeconds: asDelaySeconds(
        data?.landingPopupDelaySeconds,
        DEFAULT_LANDING_POPUP_CONTENT.delaySeconds,
      ),
      headingStart:
        asNonEmptyString(data?.landingPopupHeadingStart) ||
        DEFAULT_LANDING_POPUP_CONTENT.headingStart,
      headingMain:
        asNonEmptyString(data?.landingPopupHeadingMain) ||
        DEFAULT_LANDING_POPUP_CONTENT.headingMain,
      subheading:
        asNonEmptyString(data?.landingPopupSubheading) ||
        DEFAULT_LANDING_POPUP_CONTENT.subheading,
      backgroundColor: asHexColor(
        data?.landingPopupBackgroundColor,
        DEFAULT_LANDING_POPUP_CONTENT.backgroundColor,
      ),
      closeIcon: {
        src: asValidAbsoluteUrl(data?.landingPopupCloseIconUrl),
        alt:
          asNonEmptyString(data?.landingPopupCloseIconAlt) ||
          DEFAULT_LANDING_POPUP_CONTENT.closeIcon.alt,
      },
      images: {
        topLeft: {
          src: DEFAULT_LANDING_POPUP_CONTENT.images.topLeft.src,
          alt:
            asNonEmptyString(data?.landingPopupTopLeftImageAlt) ||
            DEFAULT_LANDING_POPUP_CONTENT.images.topLeft.alt,
        },
        center: {
          src: DEFAULT_LANDING_POPUP_CONTENT.images.center.src,
          alt:
            asNonEmptyString(data?.landingPopupCenterImageAlt) ||
            DEFAULT_LANDING_POPUP_CONTENT.images.center.alt,
        },
        topRight: {
          src: DEFAULT_LANDING_POPUP_CONTENT.images.topRight.src,
          alt:
            asNonEmptyString(data?.landingPopupTopRightImageAlt) ||
            DEFAULT_LANDING_POPUP_CONTENT.images.topRight.alt,
        },
        bottomLeft: {
          src: DEFAULT_LANDING_POPUP_CONTENT.images.bottomLeft.src,
          alt:
            asNonEmptyString(data?.landingPopupBottomLeftImageAlt) ||
            DEFAULT_LANDING_POPUP_CONTENT.images.bottomLeft.alt,
        },
        thirdOilDrip: {
          src: DEFAULT_LANDING_POPUP_CONTENT.images.thirdOilDrip.src,
          alt:
            asNonEmptyString(data?.landingPopupThirdOilDripImageAlt) ||
            DEFAULT_LANDING_POPUP_CONTENT.images.thirdOilDrip.alt,
        },
      },
      options: toPopupOptions(data?.landingPopupOptions),
      leadCapture: {
        headingPrefix:
          asNonEmptyString(data?.landingPopupLeadHeadingPrefix) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.headingPrefix,
        discountPrefix:
          asNonEmptyString(data?.landingPopupLeadDiscountPrefix) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.discountPrefix,
        discountMain:
          asNonEmptyString(data?.landingPopupLeadDiscountMain) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.discountMain,
        prompt:
          asNonEmptyString(data?.landingPopupLeadPrompt) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.prompt,
        emailPlaceholder:
          asNonEmptyString(data?.landingPopupLeadEmailPlaceholder) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.emailPlaceholder,
        phonePlaceholder:
          asNonEmptyString(data?.landingPopupLeadPhonePlaceholder) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.phonePlaceholder,
        ctaLabel:
          asNonEmptyString(data?.landingPopupLeadCtaLabel) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.ctaLabel,
        disclaimer:
          asNonEmptyString(data?.landingPopupLeadDisclaimer) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.disclaimer,
        ctaBackgroundImageSrc:
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.ctaBackgroundImageSrc,
        successCode:
          asNonEmptyString(data?.landingPopupLeadSuccessCode) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.successCode,
        successMessage:
          asNonEmptyString(data?.landingPopupLeadSuccessMessage) ||
          DEFAULT_LANDING_POPUP_CONTENT.leadCapture.successMessage,
      },
    };
  } catch {
    return DEFAULT_LANDING_POPUP_CONTENT;
  }
}
