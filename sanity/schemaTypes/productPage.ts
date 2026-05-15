import { defineArrayMember, defineField, defineType } from 'sanity';

const svgImageOptions = {
  hotspot: true,
  accept: 'image/png,image/jpeg,image/webp,image/gif',
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

export const productPage = defineType({
  name: 'productPage',
  title: 'Product Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      initialValue: 'Product Page',
    }),

    defineField({
      name: 'emptyStateText',
      title: 'Empty State Text',
      type: 'string',
      initialValue: 'No products yet.',
      validation: (rule) => rule.max(140),
    }),

    defineField({
      name: 'showFlavorMatchSection',
      title: 'Show Flavor Match Section',
      description:
        "Toggle the full block from 'can't decide?' up to just before the FAQs section.",
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'matchIntroHeadingTop',
      title: 'Match Intro Heading (Top)',
      type: 'string',
      initialValue: "can't decide?",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'matchIntroHeadingBottom',
      title: 'Match Intro Heading (Bottom)',
      type: 'string',
      initialValue: "let's match you with your flavour ;)",
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'matchIntroPathImage',
      title: 'Match Intro Path Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('matchIntroPathImageSvg', 'Match Intro Path Image SVG'),
    defineField({
      name: 'matchIntroPathImageAlt',
      title: 'Match Intro Path Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'matchIntroBody',
      title: 'Match Intro Body Text',
      type: 'text',
      rows: 4,
      initialValue: 'if you dislike sweet snacks\nand you add extra chilli\nwithout tasting',
      validation: (rule) => rule.max(260),
    }),

    defineField({
      name: 'primaryPlayerImage',
      title: 'Primary Match Player Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('primaryPlayerImageSvg', 'Primary Match Player Image SVG'),
    defineField({
      name: 'primaryPlayerImageAlt',
      title: 'Primary Match Player Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'primaryMeters',
      title: 'Primary Match Meters',
      type: 'array',
      description: 'Up to 4 meter rows. Leave any field empty to use website defaults.',
      of: [
        defineArrayMember({
          name: 'primaryMeter',
          title: 'Primary Meter',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(40),
            }),
            defineField({
              name: 'fill',
              title: 'Fill (0-100)',
              type: 'number',
              validation: (rule) => rule.min(0).max(100),
            }),
            defineField({
              name: 'showTail',
              title: 'Show Tail Pattern',
              type: 'boolean',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'fill',
            },
            prepare(value) {
              const title = typeof value.title === 'string' ? value.title.trim() : '';
              const fill = typeof value.subtitle === 'number' ? `${Math.round(value.subtitle)}%` : '';
              return {
                title: title || 'Primary meter',
                subtitle: fill || 'Default fill',
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'primarySelectionPathImage',
      title: 'Primary Selection Path Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('primarySelectionPathImageSvg', 'Primary Selection Path Image SVG'),
    defineField({
      name: 'primarySelectionPathImageAlt',
      title: 'Primary Selection Path Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'primarySelectionHeading',
      title: 'Primary Selection Heading',
      type: 'string',
      initialValue: 'selection locked:',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'primarySelectionJarImage',
      title: 'Jar Image beside "get side eye sour" CTA',
      type: 'image',
      description: 'Controls the jar image overlapping the Side Eye Sour CTA card.',
      options: svgImageOptions,
    }),
    svgFileField('primarySelectionJarImageSvg', 'Jar Image beside "get side eye sour" CTA SVG'),
    defineField({
      name: 'primarySelectionJarImageAlt',
      title: 'Jar Image beside "get side eye sour" CTA Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'primarySelectionCtaBackgroundImage',
      title: 'Primary Selection CTA Background Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('primarySelectionCtaBackgroundImageSvg', 'Primary Selection CTA Background Image SVG'),
    defineField({
      name: 'primarySelectionCtaBackgroundImageAlt',
      title: 'Primary Selection CTA Background Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'primarySelectionCtaText',
      title: 'Primary Selection CTA Text',
      type: 'text',
      rows: 3,
      initialValue: 'get side eye sour\n¬‿¬',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'primarySelectionCtaAriaLabel',
      title: 'Primary Selection CTA Aria Label',
      type: 'string',
      initialValue: 'Open side eye sour',
      validation: (rule) => rule.max(120),
    }),

    defineField({
      name: 'secondaryPromptPathImage',
      title: 'Secondary Prompt Path Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('secondaryPromptPathImageSvg', 'Secondary Prompt Path Image SVG'),
    defineField({
      name: 'secondaryPromptPathImageAlt',
      title: 'Secondary Prompt Path Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'secondaryPromptText',
      title: 'Secondary Prompt Text',
      type: 'text',
      rows: 3,
      initialValue: 'you want tang?\nyou handle spice!',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'secondaryPlayerImage',
      title: 'Secondary Match Player Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('secondaryPlayerImageSvg', 'Secondary Match Player Image SVG'),
    defineField({
      name: 'secondaryPlayerImageAlt',
      title: 'Secondary Match Player Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'secondaryMeters',
      title: 'Secondary Match Meters',
      type: 'array',
      description: 'Up to 4 meter rows. Leave any field empty to use website defaults.',
      of: [
        defineArrayMember({
          name: 'secondaryMeter',
          title: 'Secondary Meter',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(40),
            }),
            defineField({
              name: 'fill',
              title: 'Fill (0-100)',
              type: 'number',
              validation: (rule) => rule.min(0).max(100),
            }),
            defineField({
              name: 'showTail',
              title: 'Show Tail Pattern',
              type: 'boolean',
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'fill',
            },
            prepare(value) {
              const title = typeof value.title === 'string' ? value.title.trim() : '';
              const fill = typeof value.subtitle === 'number' ? `${Math.round(value.subtitle)}%` : '';
              return {
                title: title || 'Secondary meter',
                subtitle: fill || 'Default fill',
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'secondarySelectionPathImage',
      title: 'Secondary Selection Path Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('secondarySelectionPathImageSvg', 'Secondary Selection Path Image SVG'),
    defineField({
      name: 'secondarySelectionPathImageAlt',
      title: 'Secondary Selection Path Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'secondarySelectionJarImage',
      title: 'Jar Image beside "tamarin tease / makes sense" CTA',
      type: 'image',
      description: 'Controls the jar image overlapping the Tamarin Tease CTA card.',
      options: svgImageOptions,
    }),
    svgFileField('secondarySelectionJarImageSvg', 'Jar Image beside "tamarin tease / makes sense" CTA SVG'),
    defineField({
      name: 'secondarySelectionJarImageAlt',
      title: 'Jar Image beside "tamarin tease / makes sense" CTA Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'secondarySelectionCtaBackgroundImage',
      title: 'Secondary Selection CTA Background Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('secondarySelectionCtaBackgroundImageSvg', 'Secondary Selection CTA Background Image SVG'),
    defineField({
      name: 'secondarySelectionCtaBackgroundImageAlt',
      title: 'Secondary Selection CTA Background Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'secondarySelectionCtaText',
      title: 'Secondary Selection CTA Text',
      type: 'text',
      rows: 3,
      initialValue: 'tamarin tease',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'secondarySelectionCtaAriaLabel',
      title: 'Secondary Selection CTA Aria Label',
      type: 'string',
      initialValue: 'Open tamarin tease',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'secondaryClosingText',
      title: 'Secondary Closing Text',
      type: 'string',
      initialValue: 'makes sense ;)',
      validation: (rule) => rule.max(120),
    }),

    defineField({
      name: 'faqHeadingPart1',
      title: 'FAQ Heading Part 1',
      type: 'string',
      initialValue: 'get your',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'faqHeadingPart2',
      title: 'FAQ Heading Part 2',
      type: 'string',
      initialValue: 'FAQs',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'faqHeadingPart3',
      title: 'FAQ Heading Part 3',
      type: 'string',
      initialValue: 'of what',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'faqHeadingPart4',
      title: 'FAQ Heading Part 4',
      type: 'string',
      initialValue: 'you put in ur mouth',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'faqItems',
      title: 'FAQ Items',
      type: 'array',
      description: 'Up to 5 FAQs. Leave any field blank to keep website defaults for that position.',
      of: [
        defineArrayMember({
          name: 'faqItem',
          title: 'FAQ Item',
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.max(180),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.max(420),
            }),
          ],
          preview: {
            select: {
              title: 'question',
            },
            prepare(value) {
              const title = typeof value.title === 'string' ? value.title.trim() : '';
              return {
                title: title || 'FAQ item',
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(5),
    }),

    defineField({
      name: 'reviewBubbles',
      title: 'Phone Review Bubbles',
      type: 'array',
      description: 'Text only. Keep empty to use default bubble copy.',
      of: [
        defineArrayMember({
          name: 'reviewBubble',
          title: 'Review Bubble',
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Bubble Text',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.max(80),
            }),
          ],
          preview: {
            select: {
              title: 'text',
            },
            prepare(value) {
              const title = typeof value.title === 'string' ? value.title.trim() : '';
              return {
                title: title || 'Review bubble',
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
});
