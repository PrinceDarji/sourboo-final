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

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      initialValue: 'Home Page',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero / Cover Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('heroImageSvg', 'Hero / Cover Image SVG'),
    defineField({
      name: 'heroImageAlt',
      title: 'Hero Image Alt Text',
      type: 'string',
      description: 'Used for accessibility and SEO.',
    }),
    defineField({
      name: 'heroTitleLine1',
      title: 'Hero Title Line 1',
      type: 'string',
      initialValue: 'the sourboo way,',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'heroTitleLine2',
      title: 'Hero Title Line 2',
      type: 'string',
      initialValue: 'cravings comes first',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'productBands',
      title: 'Product Bands',
      type: 'array',
      description:
        'Controls CTA labels and background images for the two product strips shown below the hero.',
      of: [
        defineArrayMember({
          name: 'productBand',
          title: 'Product Band',
          type: 'object',
          fields: [
            defineField({
              name: 'variant',
              title: 'Band Variant',
              type: 'string',
              options: {
                list: [
                  { title: 'Primary (Side Eye)', value: 'primary' },
                  { title: 'Secondary (Tamarin Tease)', value: 'secondary' },
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'ctaLabel',
              title: 'CTA Label',
              type: 'string',
              validation: (rule) => rule.max(100),
            }),
            defineField({
              name: 'sectionBackgroundImage',
              title: 'Section Background Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('sectionBackgroundImageSvg', 'Section Background Image SVG'),
            defineField({
              name: 'productLabelImage',
              title: 'Product Label Image',
              type: 'image',
              description:
                'The long product label / packaging strip shown in this product band on tablet and desktop.',
              options: svgImageOptions,
            }),
            svgFileField('productLabelImageSvg', 'Product Label Image SVG'),
            defineField({
              name: 'productLabelMobileImage',
              title: 'Product Label Image (Mobile)',
              type: 'image',
              description:
                'Optional smaller-screen product label / packaging strip. Falls back to Product Label Image.',
              options: svgImageOptions,
            }),
            svgFileField('productLabelMobileImageSvg', 'Product Label Image SVG (Mobile)'),
            defineField({
              name: 'ctaBackgroundImage',
              title: 'CTA Background Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('ctaBackgroundImageSvg', 'CTA Background Image SVG'),
          ],
          preview: {
            select: {
              title: 'ctaLabel',
              subtitle: 'variant',
              media: 'sectionBackgroundImage',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: 'introHeadlineLine1',
      title: 'Intro Headline Line 1',
      type: 'string',
      initialValue: 'sourboo made for people who eat',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'introHeadlineLine2',
      title: 'Intro Headline Line 2',
      type: 'string',
      initialValue: 'with intent',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'introBodyLine1',
      title: 'Intro Body Line 1',
      type: 'string',
      initialValue: 'who like flavour loud and immediate',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'introBodyLine2',
      title: 'Intro Body Line 2',
      type: 'string',
      initialValue: 'food that fits into real moments',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'readRantImage',
      title: 'Read Rant Sliding Image',
      type: 'image',
      description: 'The sliding image shown beside the Read Rant CTA on the home page.',
      options: svgImageOptions,
    }),
    svgFileField('readRantImageSvg', 'Read Rant Sliding Image SVG'),
    defineField({
      name: 'readRantImageAlt',
      title: 'Read Rant Sliding Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'readRantCtaLabel',
      title: 'Read Rant CTA Label',
      type: 'string',
      initialValue: 'read my rant →',
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: 'posters',
      title: 'Poster Images',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'poster',
          title: 'Poster',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('imageSvg', 'Image SVG'),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (rule) => rule.max(120),
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              media: 'image',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'horizontalGallery',
      title: 'Horizontal Gallery Images',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'horizontalGalleryItem',
          title: 'Horizontal Gallery Item',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('imageSvg', 'Image SVG'),
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (rule) => rule.max(120),
            }),
          ],
          preview: {
            select: {
              title: 'alt',
              media: 'image',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(7),
    }),
    defineField({
      name: 'reviewBubbles',
      title: 'Phone Review Bubbles',
      type: 'array',
      description: 'Only text is editable here. Bubble styles and placements stay fixed in code.',
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
