import { defineArrayMember, defineField, defineType } from 'sanity';

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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      description: 'Displayed above the Instagram strip in the footer.',
      initialValue: '@sourboosnacks',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagramProfileUrl',
      title: 'Instagram Profile URL',
      type: 'url',
      initialValue: 'https://www.instagram.com/eatsourboo/',
      validation: (rule) => rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'whatsappUrl',
      title: 'WhatsApp URL',
      type: 'url',
      initialValue: 'https://chat.whatsapp.com/L9YSdLAYGfuEke1zXhvoWN',
      validation: (rule) => rule.required().uri({ scheme: ['https'] }),
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
              validation: (rule) => rule.required().max(100),
            }),
            defineField({
              name: 'url',
              title: 'Instagram Post URL',
              type: 'url',
              validation: (rule) =>
                rule.required().uri({
                  scheme: ['https'],
                  allowRelative: false,
                }),
            }),
            defineField({
              name: 'backgroundImage',
              title: 'Card Background Image',
              type: 'image',
              options: { hotspot: true },
              description: 'Optional. If empty, the card falls back to a gradient background.',
            }),
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
  ],
});
