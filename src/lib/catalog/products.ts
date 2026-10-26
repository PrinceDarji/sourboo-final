/**
 * Temporary authoritative catalog, supplied by the owner on 19 October 2026.
 * Storefront and server-side checkout must use this same source while Sanity is
 * unavailable. Prices exclude the flat shipping charge; no product discount is
 * inferred. Restore CMS reads across all consumers together when ready.
 */
export type CatalogProduct = {
  slug: string;
  name: string;
  titleWord: string;
  accentWord: string;
  suffixWord?: string;
  price: string;
  pricePaise: number;
  discountPercent?: number;
  styleVariant: 'primary' | 'secondary';
  hoverLabel: string;
  jarImage: string;
  galleryImages: string[];
  titleColor: string;
  accentColor: string;
  detailInJarTitle: string;
  detailInJarSummary: string;
  detailInJarIngredients: string;
  detailOnTongueTitle: string;
  detailOnTongueBody: string;
  detailAfterOpeningTitle: string;
  detailAfterOpeningBody: string;
  detailDispatchNote: string;
  jarCount: number;
};

const shared = {
  detailInJarTitle: 'In the jar',
  detailOnTongueTitle: 'On the tongue',
  detailAfterOpeningTitle: 'After opening',
  detailDispatchNote: 'Dispatched within 2-4 working days. Delivery timelines vary by location.',
};

const sideEye: CatalogProduct = {
  ...shared,
  slug: 'sideeyesour',
  name: 'SIDE EYE SOUR',
  titleWord: 'side', accentWord: 'eye', suffixWord: 'sour',
  price: '₹399', pricePaise: 39900,
  styleVariant: 'primary',
  hoverLabel: 'Lemon & Chaat Masala',
  jarImage: '/product/catalog/side-eye.webp',
  galleryImages: ['/product/catalog/side-eye.webp', '/product/catalog/side-eye-lifestyle.webp', '/product/catalog/fridge.webp'],
  titleColor: '#E61E6E', accentColor: '#F18BB7',
  detailInJarSummary: 'Lemon & Chaat Masala\nSnackable pickled gherkins',
  detailInJarIngredients: 'Gherkins, Water, Vinegar, Lemon slices, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Sugar, Ginger powder, Calcium chloride',
  detailOnTongueBody: 'It’s properly khatta, with a sour punch that stops you for a second, and makes you squint a little. Juicy, spicy, sour, and more waiting to be discovered as you chew the crinkle-cut slices.\nPerfect for when you want to be extra and a lil hot. ¬‿¬',
  detailAfterOpeningBody: 'Store it in the fridge for max crunch - keep it where you can see it.\nEat it when your mouth wants to misbehave, or with any meal you love.',
  jarCount: 1,
};

const tamarin: CatalogProduct = {
  ...shared,
  slug: 'tamarintease',
  name: 'TAMARIN’ TEASE',
  titleWord: 'tamarin’', accentWord: 'tease',
  price: '₹399', pricePaise: 39900,
  styleVariant: 'secondary',
  hoverLabel: 'Tamarind & Chilli',
  jarImage: '/product/catalog/tamarin-tease.webp',
  galleryImages: ['/product/catalog/tamarin-tease.webp', '/product/catalog/tamarin-lifestyle.webp', '/product/catalog/fridge.webp'],
  titleColor: '#3E6A18', accentColor: '#7FA16D',
  detailInJarSummary: 'Tamarind & Chilli\nSnackable pickled gherkins',
  detailInJarIngredients: 'Gherkins, Water, Vinegar, Tamarind pulp, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Sugar, Ginger powder, Calcium chloride',
  detailOnTongueBody: 'It’s sweet-sour at the first bite proper imli, the kind that makes your mouth water instantly.\nYou get the full crunch of the whole gherkin, juicy and tangy, with spice slowly building as you chew. Teasing, mouth-watering, and hard to stop.',
  detailAfterOpeningBody: 'Store it in the fridge for max crunch - keep it where you can see it.\nEat it when your mouth wants something tangy, or with any meal you love.',
  jarCount: 1,
};

function bundle(
  slug: string, name: string, titleWord: string, accentWord: string,
  rupees: number, lemonCount: number, tamarindCount: number,
): CatalogProduct {
  const base = lemonCount === 0 ? tamarin : sideEye;
  const flavours = [
    ...(lemonCount ? [`${lemonCount} × SIDE EYE SOUR (Lemon & Chaat Masala)`] : []),
    ...(tamarindCount ? [`${tamarindCount} × TAMARIN’ TEASE (Tamarind & Chilli)`] : []),
  ];
  const both = lemonCount > 0 && tamarindCount > 0;
  return {
    ...base,
    slug, name, titleWord, accentWord, suffixWord: undefined,
    price: `₹${rupees}`, pricePaise: rupees * 100,
    jarImage: `/product/catalog/${slug}.webp`,
    galleryImages: [
      `/product/catalog/${slug}.webp`,
      ...(lemonCount ? ['/product/catalog/side-eye-lifestyle.webp'] : []),
      ...(tamarindCount ? ['/product/catalog/tamarin-lifestyle.webp'] : []),
      '/product/catalog/fridge.webp',
    ],
    hoverLabel: flavours.join('\n'),
    detailInJarSummary: `${flavours.join('\n')}\nSnackable pickled gherkins`,
    detailInJarIngredients: both
      ? `SIDE EYE SOUR\n${sideEye.detailInJarIngredients}\n\nTAMARIN’ TEASE\n${tamarin.detailInJarIngredients}`
      : base.detailInJarIngredients,
    detailOnTongueBody: both
      ? `SIDE EYE SOUR\n${sideEye.detailOnTongueBody}\n\nTAMARIN’ TEASE\n${tamarin.detailOnTongueBody}`
      : base.detailOnTongueBody,
    detailAfterOpeningBody: both
      ? `SIDE EYE SOUR\n${sideEye.detailAfterOpeningBody}\n\nTAMARIN’ TEASE\n${tamarin.detailAfterOpeningBody}`
      : base.detailAfterOpeningBody,
    jarCount: lemonCount + tamarindCount,
  };
}

export const CATALOG_PRODUCTS: readonly CatalogProduct[] = [
  sideEye,
  tamarin,
  bundle('tamarind-twins', 'Tamarind Twins', 'tamarind', 'twins', 719, 0, 2),
  bundle('lemon-lovers', 'lemon lovers', 'lemon', 'lovers', 729, 2, 0),
  bundle('sour-sampler', 'Sour sampler', 'sour', 'sampler', 729, 1, 1),
  // Four-jar assortment: two of each flavour.
  bundle('sourboo-stash', 'Sourboo Stash', 'sourboo', 'stash', 1299, 2, 2),
];

export const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  'side-eye-sour': 'sideeyesour',
  'side-eye-sour-spicy-pickled-gherkins': 'sideeyesour',
  'tamarin-tease': 'tamarintease',
  'tamarind-tease': 'tamarintease',
  'tamarin-tease-tangy-tamarind-pickled-gherkins': 'tamarintease',
  'tamarin-twins-tangy-tamarind-pickled-gherkins': 'tamarind-twins',
  'tamarin-twins': 'tamarind-twins',
};

export function findCatalogProduct(slug: string): CatalogProduct | undefined {
  const clean = slug.trim().toLowerCase();
  const canonical = PRODUCT_SLUG_ALIASES[clean] || clean;
  const key = canonical.replace(/[-_\s]/g, '');
  return CATALOG_PRODUCTS.find((product) => product.slug.replace(/-/g, '') === key);
}
