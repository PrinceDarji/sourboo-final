import { defineArrayMember, defineField, defineType } from 'sanity';

const svgImageOptions = {
  hotspot: true,
  accept: 'image/*',
} as const;
const svgFileOptions = {
  accept: '.svg,image/svg+xml',
} as const;

function svgFileField(name: string, title: string) {
  return defineField({
    name,
    title,
    type: 'file',
    description: 'Use this for SVG files. It overrides the image field above on the website.',
    options: svgFileOptions,
  });
}

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      initialValue: 'Site Settings',
    }),
    defineField({
      name: 'landingPopupEnabled',
      title: 'Landing Popup Enabled',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'landingPopupDelaySeconds',
      title: 'Landing Popup Delay (seconds)',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.integer().min(0).max(30),
    }),
    defineField({
      name: 'landingPopupHeadingStart',
      title: 'Landing Popup Heading Start',
      type: 'string',
      initialValue: 'what',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'landingPopupHeadingMain',
      title: 'Landing Popup Heading Main',
      type: 'string',
      initialValue: 'kind of sour are you?',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'landingPopupSubheading',
      title: 'Landing Popup Subheading',
      type: 'string',
      initialValue: 'be honest',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'landingPopupBackgroundColor',
      title: 'Landing Popup Background Color',
      type: 'string',
      initialValue: '#EEDDEB',
      validation: (rule) =>
        rule.custom((value) => {
          if (typeof value !== 'string' || !value.trim()) return true;
          return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
            ? true
            : 'Use HEX like #EEDDEB';
        }),
    }),
    defineField({
      name: 'landingPopupCloseIcon',
      title: 'Landing Popup Close Icon (SVG/File)',
      type: 'file',
      options: {
        accept: '.svg,image/svg+xml,image/png,image/webp,image/jpeg',
      },
    }),
    defineField({
      name: 'landingPopupCloseIconAlt',
      title: 'Landing Popup Close Icon Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupTopLeftImage',
      title: 'Landing Popup Top Left Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupTopLeftImageSvg', 'Landing Popup Top Left Image SVG'),
    defineField({
      name: 'landingPopupTopLeftImageAlt',
      title: 'Landing Popup Top Left Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupCenterImage',
      title: 'Landing Popup Center Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupCenterImageSvg', 'Landing Popup Center Image SVG'),
    defineField({
      name: 'landingPopupCenterImageAlt',
      title: 'Landing Popup Center Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupTopRightImage',
      title: 'Landing Popup Top Right Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupTopRightImageSvg', 'Landing Popup Top Right Image SVG'),
    defineField({
      name: 'landingPopupTopRightImageAlt',
      title: 'Landing Popup Top Right Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupBottomLeftImage',
      title: 'Landing Popup Bottom Left Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupBottomLeftImageSvg', 'Landing Popup Bottom Left Image SVG'),
    defineField({
      name: 'landingPopupBottomLeftImageAlt',
      title: 'Landing Popup Bottom Left Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupThirdOilDripImage',
      title: 'Landing Popup Third Oil Drip Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupThirdOilDripImageSvg', 'Landing Popup Third Oil Drip Image SVG'),
    defineField({
      name: 'landingPopupThirdOilDripImageAlt',
      title: 'Landing Popup Third Oil Drip Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupLeadHeadingPrefix',
      title: 'Landing Popup Lead Step Heading Prefix',
      type: 'string',
      initialValue: "You're",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'landingPopupLeadDiscountPrefix',
      title: 'Landing Popup Lead Step Discount Prefix',
      type: 'string',
      initialValue: 'take',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'landingPopupLeadDiscountMain',
      title: 'Landing Popup Lead Step Discount Main',
      type: 'string',
      initialValue: "5% off. you've earned it",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'landingPopupLeadPrompt',
      title: 'Landing Popup Lead Step Prompt Text',
      type: 'string',
      initialValue: 'where should we send it?',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'landingPopupLeadEmailPlaceholder',
      title: 'Landing Popup Lead Step Email Placeholder',
      type: 'string',
      initialValue: 'your email',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'landingPopupLeadPhonePlaceholder',
      title: 'Landing Popup Lead Step Phone Placeholder',
      type: 'string',
      initialValue: 'your phone number',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'landingPopupLeadCtaLabel',
      title: 'Landing Popup Lead Step CTA Label',
      type: 'string',
      initialValue: 'unlock my 5%',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'landingPopupLeadDisclaimer',
      title: 'Landing Popup Lead Step Disclaimer Text',
      type: 'string',
      initialValue: 'no spam, just sour things :)',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'landingPopupLeadCtaBackgroundImage',
      title: 'Landing Popup Lead Step CTA Background Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('landingPopupLeadCtaBackgroundImageSvg', 'Landing Popup Lead Step CTA Background Image SVG'),
    defineField({
      name: 'landingPopupLeadSuccessCode',
      title: 'Landing Popup Lead Step Success Coupon Code',
      type: 'string',
      description:
        'Displayed in the popup after submit. Keep this aligned with the hardcoded cart logic.',
      initialValue: 'SOURBABE05',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'landingPopupLeadSuccessMessage',
      title: 'Landing Popup Lead Step Success Message',
      type: 'string',
      initialValue:
        'you are in! copy the code and use it at checkout to get 5% off your cart total.',
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'landingPopupOptions',
      title: 'Landing Popup Options',
      type: 'array',
      description: 'Up to 4 option buttons.',
      of: [
        defineArrayMember({
          name: 'landingPopupOption',
          title: 'Landing Popup Option',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(80),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              description: 'Use a path like /product or a full https URL.',
              validation: (rule) => rule.max(500),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Button Background Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('backgroundImageSvg', 'Button Background Image SVG'),
            defineField({
              name: 'textColor',
              title: 'Text Color (HEX)',
              type: 'string',
              validation: (rule) =>
                rule.custom((value) => {
                  if (typeof value !== 'string' || !value.trim()) return true;
                  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value.trim())
                    ? true
                    : 'Use HEX like #FFFFFF';
                }),
            }),
            defineField({
              name: 'textOffsetX',
              title: 'Text Offset X (px)',
              type: 'number',
              description: 'Negative = move left, positive = move right.',
              initialValue: 0,
              validation: (rule) => rule.integer().min(-120).max(120),
            }),
            defineField({
              name: 'textOffsetY',
              title: 'Text Offset Y (px)',
              type: 'number',
              description: 'Negative = move up, positive = move down.',
              initialValue: 0,
              validation: (rule) => rule.integer().min(-120).max(120),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
              media: 'backgroundImage',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
      initialValue: [
        { label: 'Sour & Savage →', href: '/product' },
        { label: 'Sweet but Psycho →', href: '/product' },
        { label: 'Spicy Drama →', href: '/product' },
        { label: 'Lowkey Tangy →', href: '/product' },
      ],
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      description: 'Displayed above the Instagram strip in the footer.',
      initialValue: '@sourboosnacks',
    }),
    defineField({
      name: 'instagramProfileUrl',
      title: 'Instagram Profile URL',
      type: 'url',
      initialValue: 'https://www.instagram.com/eatsourboo/',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'whatsappUrl',
      title: 'WhatsApp URL',
      type: 'url',
      initialValue: 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'instagramFeedLinks',
      title: 'Instagram Cards (Links)',
      type: 'array',
      description:
        'These power the footer Instagram cards. Add up to 3 links with short labels.',
      of: [
        defineArrayMember({
          name: 'instagramFeedLink',
          title: 'Instagram Feed Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Card Label',
              type: 'string',
              validation: (rule) => rule.max(100),
            }),
            defineField({
              name: 'url',
              title: 'Instagram Post URL',
              type: 'url',
              validation: (rule) =>
                rule.uri({
                  scheme: ['https'],
                  allowRelative: false,
                }),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Card Background Image',
              type: 'image',
              options: svgImageOptions,
              description: 'Optional. If empty, the card falls back to a gradient background.',
            }),
            svgFileField('backgroundImageSvg', 'Card Background Image SVG'),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'url',
              media: 'backgroundImage',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'instagramHeadingPrefix',
      title: 'Instagram Heading Prefix',
      type: 'string',
      description: 'Shown before the Instagram handle in the footer section.',
      initialValue: 'get to know',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'instagramFallbackCardLabel',
      title: 'Instagram Fallback Card Label',
      type: 'string',
      description: 'Shown on placeholder cards when no Instagram posts are configured.',
      initialValue: 'connect instagram feed',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
      initialValue: 'stay sour',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'footerBackgroundImage',
      title: 'Footer Background Image',
      type: 'image',
      options: svgImageOptions,
      description:
        'Optional. Upload a raster footer background image here. Use the SVG field below for SVG files. If empty, the current default pink background is used.',
    }),
    svgFileField('footerBackgroundImageSvg', 'Footer Background Image SVG'),
    defineField({
      name: 'footerLogoImage',
      title: 'Footer Logo Image',
      type: 'image',
      options: svgImageOptions,
      description: 'Optional. Upload the raster logo used in the center of the footer. Use the SVG field below for SVG files.',
    }),
    svgFileField('footerLogoImageSvg', 'Footer Logo Image SVG'),
    defineField({
      name: 'footerLogoAlt',
      title: 'Footer Logo Alt Text',
      type: 'string',
      initialValue: 'Sourboo logo',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'footerPrimaryLinks',
      title: 'Footer Primary Links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'footerPrimaryLink',
          title: 'Footer Primary Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              description: 'Use a path like /about or a full https URL.',
              validation: (rule) => rule.max(500),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(2),
      initialValue: [
        { label: 'HOME', href: '/' },
        { label: 'OUR STORY', href: '/about' },
      ],
    }),
    defineField({
      name: 'footerSecondaryLinks',
      title: 'Footer Secondary Links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'footerSecondaryLink',
          title: 'Footer Secondary Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              description: 'Use a path like /product or a full https URL.',
              validation: (rule) => rule.max(500),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(2),
      initialValue: [
        { label: 'SHOP', href: '/product' },
        { label: 'JOIN US', href: '/join' },
      ],
    }),
    defineField({
      name: 'footerPolicyLinks',
      title: 'Footer Policy Links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'footerPolicyLink',
          title: 'Footer Policy Link',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(80),
            }),
            defineField({
              name: 'href',
              title: 'Href',
              type: 'string',
              description: 'Use a path like /privacy-policy or a full https URL.',
              validation: (rule) => rule.max(500),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(5),
      initialValue: [
        { label: 'TERMS & CONDITIONS', href: '/terms-and-conditions' },
        { label: 'PRIVACY POLICY', href: '/privacy-policy' },
        { label: 'REFUND POLICY', href: '/refund-policy' },
        { label: 'SHIPPING POLICY', href: '/shipping-policy' },
        { label: 'CONTACT', href: '/contact' },
      ],
    }),
  ],
});
