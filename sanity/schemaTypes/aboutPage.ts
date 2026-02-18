// sanity/schemaTypes/aboutPage.ts
import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (internal)",
      type: "string",
      initialValue: "About Page",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "navPickleImage",
      title: "Navbar Pickle Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "heroImage",
      title: "Hero / Cover Image",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "envelopeHeading",
      title: "Envelope Heading",
      type: "string",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "envelopeBody",
      title: "Envelope Body",
      type: "text",
      rows: 6,
      validation: (r) => r.required(),
    }),

    defineField({
      name: "envelopeSignoff",
      title: "Envelope Signoff",
      type: "string",
      validation: (r) => r.required(),
    }),

    // Keep old field for backward compatibility with existing documents.
    defineField({
      name: "envelopeText",
      title: "Envelope Text (Legacy)",
      type: "text",
      rows: 6,
      hidden: true,
    }),
  ],
});
