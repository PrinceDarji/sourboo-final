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

export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      initialValue: 'About Page',
    }),

    defineField({
      name: 'navPickleImage',
      title: 'Navbar Pickle Image (Legacy)',
      type: 'image',
      options: svgImageOptions,
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
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'hi i am sakshi,',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'string',
      initialValue: 'and i am really glad you are here',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'heroIntroBody',
      title: 'Hero Intro Body',
      type: 'text',
      rows: 4,
      initialValue: 'if u are here, i am assuming, you like sour or curious enough to try it',
      validation: (rule) => rule.max(320),
    }),

    defineField({
      name: 'section2Heading',
      title: 'Section 2 Heading',
      type: 'text',
      rows: 3,
      initialValue: "I've always been (annoyingly) obsessed with flavours.",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'section2MixingLabel',
      title: 'Section 2 Mixing Label',
      type: 'string',
      initialValue: 'Mixing things',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'section2TastingLabel',
      title: 'Section 2 Tasting Label',
      type: 'string',
      initialValue: 'Tasting everything',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'section2Image1',
      title: 'Section 2 Image 1',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section2Image1Svg', 'Section 2 Image 1 SVG'),
    defineField({
      name: 'section2Image1Alt',
      title: 'Section 2 Image 1 Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section2Image2',
      title: 'Section 2 Image 2',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section2Image2Svg', 'Section 2 Image 2 SVG'),
    defineField({
      name: 'section2Image2Alt',
      title: 'Section 2 Image 2 Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section2Image3',
      title: 'Section 2 Image 3',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section2Image3Svg', 'Section 2 Image 3 SVG'),
    defineField({
      name: 'section2Image3Alt',
      title: 'Section 2 Image 3 Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section2SpentYearsText',
      title: 'Section 2 Spent Years Text',
      type: 'string',
      initialValue: 'spent 5 years',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'section2JourneyText',
      title: 'Section 2 Journey Text',
      type: 'text',
      rows: 3,
      initialValue: 'around food and drinks from london bar shifts to a 9-5 desk job in India',
      validation: (rule) => rule.max(260),
    }),

    defineField({
      name: 'section3Heading',
      title: 'Section 3 Heading',
      type: 'string',
      initialValue: 'different lives, same cravings',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'section3EyesSequence',
      title: 'Section 3 Eyes Sequence Images',
      type: 'array',
      description: 'Up to 4 images used in the eye animation sequence.',
      of: [
        defineArrayMember({
          name: 'eyesSequenceImage',
          title: 'Eyes Sequence Image',
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
              validation: (rule) => rule.max(140),
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
      name: 'section3TongueImage',
      title: 'Section 3 Tongue Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section3TongueImageSvg', 'Section 3 Tongue Image SVG'),
    defineField({
      name: 'section3TongueImageAlt',
      title: 'Section 3 Tongue Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section3IndiaCallout1',
      title: 'Section 3 India Callout 1',
      type: 'string',
      initialValue: 'India loves chaaat',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'section3IndiaCallout2',
      title: 'Section 3 India Callout 2',
      type: 'string',
      initialValue: 'India loves flavour',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'section3IndiaCallout3',
      title: 'Section 3 India Callout 3',
      type: 'string',
      initialValue: 'India loves that sour & spicy hit',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'section3ClosingText',
      title: 'Section 3 Closing Text',
      type: 'string',
      initialValue: 'Nothing worked for a desi palate that loves',
      validation: (rule) => rule.max(200),
    }),

    defineField({
      name: 'section4FlavorWords',
      title: 'Section 4 Flavor Words',
      type: 'array',
      description: 'Up to 3 flavor words with optional background images.',
      of: [
        defineArrayMember({
          name: 'flavorWord',
          title: 'Flavor Word',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.max(60),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Background Image',
              type: 'image',
              options: svgImageOptions,
            }),
            svgFileField('backgroundImageSvg', 'Background Image SVG'),
          ],
          preview: {
            select: {
              title: 'label',
              media: 'backgroundImage',
            },
          },
        }),
      ],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'section4BodyText',
      title: 'Section 4 Body Text',
      type: 'text',
      rows: 3,
      initialValue: "but doesn't want to feel weighed down after snacking",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'section4IssueHeading',
      title: 'Section 4 Issue Heading',
      type: 'string',
      initialValue: 'MY BIGGEST ISSUE?',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'section4SideText',
      title: 'Section 4 Side Text',
      type: 'string',
      initialValue: 'Sour was always treated like a side.',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'section4LemonImage',
      title: 'Section 4 Lemon Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section4LemonImageSvg', 'Section 4 Lemon Image SVG'),
    defineField({
      name: 'section4LemonImageAlt',
      title: 'Section 4 Lemon Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section4LemonCaption',
      title: 'Section 4 Lemon Caption',
      type: 'string',
      initialValue: 'A squeeze here.',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section4SpoonImage',
      title: 'Section 4 Spoon Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section4SpoonImageSvg', 'Section 4 Spoon Image SVG'),
    defineField({
      name: 'section4SpoonImageAlt',
      title: 'Section 4 Spoon Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section4SpoonCaption',
      title: 'Section 4 Spoon Caption',
      type: 'string',
      initialValue: 'A spoon of pickle there.',
      validation: (rule) => rule.max(140),
    }),

    defineField({
      name: 'section5TearImage',
      title: 'Section 5 Tear Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section5TearImageSvg', 'Section 5 Tear Image SVG'),
    defineField({
      name: 'section5TearImageAlt',
      title: 'Section 5 Tear Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section5IntroducingText',
      title: 'Section 5 Introducing Text',
      type: 'string',
      initialValue: 'Introducing',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'section5LogoImage',
      title: 'Section 5 Logo Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section5LogoImageSvg', 'Section 5 Logo Image SVG'),
    defineField({
      name: 'section5LogoImageAlt',
      title: 'Section 5 Logo Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section5TaglineImage',
      title: 'Section 5 Tagline Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section5TaglineImageSvg', 'Section 5 Tagline Image SVG'),
    defineField({
      name: 'section5TaglineImageAlt',
      title: 'Section 5 Tagline Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section5Paragraph1',
      title: 'Section 5 Paragraph 1',
      type: 'text',
      rows: 3,
      initialValue: "sour first snack, made for people who don't eat quietly.",
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'section5Paragraph2Prefix',
      title: 'Section 5 Paragraph 2 Prefix',
      type: 'string',
      initialValue: 'for women who love',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'section5Paragraph2Accent',
      title: 'Section 5 Paragraph 2 Accent',
      type: 'text',
      rows: 3,
      initialValue: 'loud flavours, strong opinions, and fully indulging.',
      validation: (rule) => rule.max(220),
    }),
    defineField({
      name: 'section5Paragraph3',
      title: 'Section 5 Paragraph 3',
      type: 'string',
      initialValue: 'The kind who make faces when they eat.',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'section5Paragraph4',
      title: 'Section 5 Paragraph 4',
      type: 'string',
      initialValue: 'The kind who ask for extra nimbu.',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'section5ClosingText',
      title: 'Section 5 Closing Text',
      type: 'string',
      initialValue: 'A new way of snacking.',
      validation: (rule) => rule.max(160),
    }),

    defineField({
      name: 'section6TopStripImages',
      title: 'Section 6 Top Strip Images',
      type: 'array',
      description: 'Up to 3 images shown in the top strip.',
      of: [
        defineArrayMember({
          name: 'section6TopStripImage',
          title: 'Section 6 Top Strip Image',
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
              validation: (rule) => rule.max(140),
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
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'section6HeadingLine1',
      title: 'Section 6 Heading Line 1',
      type: 'string',
      initialValue: "That's Sourboo to me.",
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'section6HeadingLine2',
      title: 'Section 6 Heading Line 2',
      type: 'string',
      initialValue: 'And I hope you love it as much as I do',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'section6JoinMoreText',
      title: 'Section 6 Join More Text',
      type: 'string',
      initialValue: 'join more',
      validation: (rule) => rule.max(100),
    }),
    defineField({
      name: 'section6EnvelopeImage',
      title: 'Section 6 Envelope Image',
      type: 'image',
      options: svgImageOptions,
    }),
    svgFileField('section6EnvelopeImageSvg', 'Section 6 Envelope Image SVG'),
    defineField({
      name: 'section6EnvelopeImageAlt',
      title: 'Section 6 Envelope Image Alt Text',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),

    defineField({
      name: 'envelopeHeading',
      title: 'Envelope Heading',
      type: 'string',
      validation: (rule) => rule.max(140),
    }),
    defineField({
      name: 'envelopeBody',
      title: 'Envelope Body',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.max(800),
    }),
    defineField({
      name: 'envelopeSignoff',
      title: 'Envelope Signoff',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),

    // Keep old field for backward compatibility with existing documents.
    defineField({
      name: 'envelopeText',
      title: 'Envelope Text (Legacy)',
      type: 'text',
      rows: 6,
      hidden: true,
    }),
  ],
});
