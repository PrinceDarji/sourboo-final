import { defineField, defineType } from "sanity";

const hexColorRule = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const svgImageOptions = {
  hotspot: true,
  accept: "image/png,image/jpeg,image/webp,image/gif",
} as const;
const svgFileOptions = {
  accept: ".svg,image/svg+xml",
} as const;

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title (internal)",
      type: "string",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),

    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      initialValue: 1,
      validation: (r) => r.required().integer().positive(),
    }),

    defineField({
      name: "styleVariant",
      title: "Card Style",
      type: "string",
      options: {
        list: [
          { title: "Primary (green splash / right leaf)", value: "primary" },
          { title: "Secondary (orange splash / left leaf)", value: "secondary" },
        ],
        layout: "radio",
      },
      initialValue: "primary",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "titleWord",
      title: "Title Word",
      type: "string",
      description: "Example: side / tamarin'",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "accentWord",
      title: "Accent Word",
      type: "string",
      description: "Example: eye / tease",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "suffixWord",
      title: "Suffix Word (optional)",
      type: "string",
      description: "Example: sour",
    }),

    defineField({
      name: "price",
      title: "Price Label",
      type: "string",
      initialValue: "₹399",
      validation: (r) => r.required(),
    }),

    defineField({
      name: "discountPercent",
      title: "Discount Percent (Optional)",
      description:
        "Set a discount between 10 and 50 to show strike-through original price with discounted price.",
      type: "number",
      validation: (r) => r.integer().min(10).max(50),
    }),

    defineField({
      name: "hoverLabel",
      title: "Hover Label",
      type: "text",
      rows: 2,
      validation: (r) => r.required(),
    }),

    defineField({
      name: "alwaysShowLabel",
      title: "Always Show Label",
      type: "boolean",
      initialValue: false,
    }),

    defineField({
      name: "splashImage",
      title: "Splash Image",
      type: "image",
      options: svgImageOptions,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "splashImageSvg",
      title: "Splash Image SVG",
      type: "file",
      description: "Use this for SVG files. It overrides Splash Image on the website.",
      options: svgFileOptions,
    }),

    defineField({
      name: "jarImage",
      title: "Jar Image",
      type: "image",
      options: svgImageOptions,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "jarImageSvg",
      title: "Jar Image SVG",
      type: "file",
      description: "Use this for SVG files. It overrides Jar Image on the website.",
      options: svgFileOptions,
    }),

    defineField({
      name: "galleryImages",
      title: "Detail Gallery Images (optional)",
      description: "Used on product detail page carousel. Add 1 or more images.",
      type: "array",
      of: [
        {
          type: "image",
          options: svgImageOptions,
        },
      ],
    }),

    defineField({
      name: "leafImage",
      title: "Leaf Illustration (optional)",
      type: "image",
      options: svgImageOptions,
    }),
    defineField({
      name: "leafImageSvg",
      title: "Leaf Illustration SVG (optional)",
      type: "file",
      description: "Use this for SVG files. It overrides Leaf Illustration on the website.",
      options: svgFileOptions,
    }),

    defineField({
      name: "titleColor",
      title: "Title Color",
      type: "string",
      initialValue: "#E61E6E",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && hexColorRule.test(v)
            ? true
            : "Use HEX like #E61E6E"
        ),
    }),

    defineField({
      name: "accentColor",
      title: "Accent Color",
      type: "string",
      initialValue: "#F18BB7",
      validation: (r) =>
        r.required().custom((v) =>
          typeof v === "string" && hexColorRule.test(v)
            ? true
            : "Use HEX like #F18BB7"
        ),
    }),

    defineField({
      name: "detailInJarTitle",
      title: "Detail: In The Jar Title",
      type: "string",
      initialValue: "In the jar",
    }),

    defineField({
      name: "detailInJarSummary",
      title: "Detail: In The Jar Summary",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "detailInJarIngredients",
      title: "Detail: In The Jar Ingredients",
      type: "text",
      rows: 6,
    }),

    defineField({
      name: "detailOnTongueTitle",
      title: "Detail: On The Tongue Title",
      type: "string",
      initialValue: "On the tongue",
    }),

    defineField({
      name: "detailOnTongueBody",
      title: "Detail: On The Tongue Body",
      type: "text",
      rows: 6,
    }),

    defineField({
      name: "detailAfterOpeningTitle",
      title: "Detail: After Opening Title",
      type: "string",
      initialValue: "After opening",
    }),

    defineField({
      name: "detailAfterOpeningBody",
      title: "Detail: After Opening Body",
      type: "text",
      rows: 5,
    }),

    defineField({
      name: "detailDispatchNote",
      title: "Detail: Dispatch Note",
      type: "text",
      rows: 3,
    }),
  ],
});
