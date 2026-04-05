import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '../../components/about/AboutNavbar';
import SiteFooter from '../../components/SiteFooter';
import ProductDetailCartActions from '@/app/components/cart/ProductDetailCartActions';
import ProductImageCarousel from '@/app/components/product/ProductImageCarousel';
import ProductDetailSections from '@/app/components/product/ProductDetailSections';
import ProductShareButton from '@/app/components/product/ProductShareButton';
import { sanityClient } from '@/src/lib/sanity/client';
import { urlFor } from '@/src/lib/sanity/image';
import { calculateDiscountedRupees, formatInr, normalizeDiscountPercent, parsePriceLabel } from '@/src/lib/cart/price';

export const revalidate = 300;

type StyleVariant = 'primary' | 'secondary';

type SanityProductDetail = {
  slug?: string;
  titleWord?: string;
  accentWord?: string;
  suffixWord?: string;
  price?: string;
  discountPercent?: number;
  jarImage?: unknown;
  galleryImages?: unknown[];
  titleColor?: string;
  accentColor?: string;
  styleVariant?: StyleVariant;
  detailInJarTitle?: string;
  detailInJarSummary?: string;
  detailInJarIngredients?: string;
  detailOnTongueTitle?: string;
  detailOnTongueBody?: string;
  detailAfterOpeningTitle?: string;
  detailAfterOpeningBody?: string;
  detailDispatchNote?: string;
};

type ProductDetail = {
  slug: string;
  title: string;
  accent: string;
  suffix?: string;
  price: string;
  discountedPrice?: string;
  cartPrice: string;
  jarImage: string;
  carouselImages: string[];
  titleColor: string;
  accentColor: string;
  styleVariant: StyleVariant;
  detailInJarTitle: string;
  detailInJarSummary: string;
  detailInJarIngredients: string;
  detailOnTongueTitle: string;
  detailOnTongueBody: string;
  detailAfterOpeningTitle: string;
  detailAfterOpeningBody: string;
  detailDispatchNote: string;
};

const PRODUCT_DETAIL_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  "slug": slug.current,
  titleWord,
  accentWord,
  suffixWord,
  price,
  discountPercent,
  jarImage,
  galleryImages,
  titleColor,
  accentColor,
  styleVariant,
  detailInJarTitle,
  detailInJarSummary,
  detailInJarIngredients,
  detailOnTongueTitle,
  detailOnTongueBody,
  detailAfterOpeningTitle,
  detailAfterOpeningBody,
  detailDispatchNote
}`;

const PRODUCT_SLUGS_QUERY = `*[_type == "product" && defined(slug.current)]{
  "slug": slug.current
}`;

type ProductSlugRow = {
  slug?: string;
};

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function imageSrc(source: unknown, fallback: string) {
  try {
    return source ? urlFor(source).width(1400).quality(80).url() : fallback;
  } catch {
    return fallback;
  }
}

function defaultDetailContent(styleVariant: StyleVariant) {
  if (styleVariant === 'secondary') {
    return {
      detailInJarTitle: 'In the jar',
      detailInJarSummary: 'Snackable pickled gherkins',
      detailInJarIngredients:
        'Quantity- 350 grams\n\nGherkins (60/100 grade), Water, Vinegar, Tamarind pulp, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Sugar, Ginger powder, Calcium chloride',
      detailOnTongueTitle: 'On the tongue',
      detailOnTongueBody:
        "It’s sweet-sour at the first bite proper imli, the kind that makes your mouth water instantly.\nYou get the full crunch of the whole gherkin, juicy and tangy, with spice slowly building as you chew. Teasing, mouth-watering, and hard to stop.",
      detailAfterOpeningTitle: 'After opening',
      detailAfterOpeningBody:
        'Store in the fridge for max crunch - keep it where you can see it.\nEat it straight from the jar, with chaat, or next to anything that needs a bold kick.',
      detailDispatchNote: 'Dispatched within 2-4 working days. Delivery timelines vary by location.',
    };
  }

  return {
    detailInJarTitle: 'In the jar',
    detailInJarSummary: 'Snackable pickled gherkins',
    detailInJarIngredients:
      'Quantity- 350 grams\n\nGherkins (60/100 grade),Water, Vinegar, Sugar, Lemon slices, Rock salt, Chaat masala powder, Whole red chilli, Cumin powder, Dehydrated chopped garlic, Yellow mustard seeds, Ginger powder, Calcium chloride',
    detailOnTongueTitle: 'On the tongue',
    detailOnTongueBody:
      "It's properly khatta and stings at the first bite and makes you squint a little.\nJuicy, spicy, sour, with more flavour coming out as you chew the crinkle-cut slices.\nPerfect for when you want to be extra and a lil hot.",
    detailAfterOpeningTitle: 'After opening',
    detailAfterOpeningBody:
      'Store it in the fridge for max crunch - keep it where you can see it.\nEat it when your mouth wants to misbehave, or with any meal you love.',
    detailDispatchNote: 'Dispatched within 2-4 working days. Delivery timelines vary by location.',
  };
}

function toProductDetail(doc: SanityProductDetail): ProductDetail {
  const styleVariant: StyleVariant = doc.styleVariant === 'secondary' ? 'secondary' : 'primary';
  const isSecondary = styleVariant === 'secondary';
  const defaults = defaultDetailContent(styleVariant);
  const price = asNonEmptyString(doc.price) || '₹399';
  const parsedPrice = parsePriceLabel(price);
  const discountPercent = normalizeDiscountPercent(doc.discountPercent);
  const hasValidPrice = Number.isFinite(parsedPrice) && parsedPrice > 0;
  const discountedRupees =
    hasValidPrice && discountPercent
      ? calculateDiscountedRupees(parsedPrice, discountPercent)
      : Math.round(parsedPrice);
  const hasDiscount = Boolean(
    hasValidPrice && discountPercent && discountedRupees > 0 && discountedRupees < Math.round(parsedPrice),
  );
  const discountedPrice = hasDiscount ? formatInr(discountedRupees) : undefined;
  const cartPrice = discountedPrice || price;
  const jarFallback = isSecondary ? '/product/tamarin-jar.svg' : '/product/side-eye-jar.svg';
  const jarImage = imageSrc(doc.jarImage, jarFallback);
  const gallerySources = Array.isArray(doc.galleryImages) ? doc.galleryImages : [];
  const cmsGallery = gallerySources
    .map((source) => imageSrc(source, ''))
    .filter((src): src is string => src.length > 0);
  const carouselImages = cmsGallery.length > 0 ? cmsGallery : [jarImage];

  return {
    slug: asNonEmptyString(doc.slug) || 'product',
    title: asNonEmptyString(doc.titleWord) || (isSecondary ? "tamarin'" : 'side'),
    accent: asNonEmptyString(doc.accentWord) || (isSecondary ? 'tease' : 'eye'),
    suffix: asNonEmptyString(doc.suffixWord) || (isSecondary ? undefined : 'sour'),
    price,
    discountedPrice,
    cartPrice,
    jarImage,
    carouselImages,
    titleColor: asNonEmptyString(doc.titleColor) || (isSecondary ? '#3E6A18' : '#E61E6E'),
    accentColor: asNonEmptyString(doc.accentColor) || (isSecondary ? '#7FA16D' : '#F18BB7'),
    styleVariant,
    detailInJarTitle: asNonEmptyString(doc.detailInJarTitle) || defaults.detailInJarTitle,
    detailInJarSummary: asNonEmptyString(doc.detailInJarSummary) || defaults.detailInJarSummary,
    detailInJarIngredients:
      asNonEmptyString(doc.detailInJarIngredients) || defaults.detailInJarIngredients,
    detailOnTongueTitle: asNonEmptyString(doc.detailOnTongueTitle) || defaults.detailOnTongueTitle,
    detailOnTongueBody: asNonEmptyString(doc.detailOnTongueBody) || defaults.detailOnTongueBody,
    detailAfterOpeningTitle:
      asNonEmptyString(doc.detailAfterOpeningTitle) || defaults.detailAfterOpeningTitle,
    detailAfterOpeningBody:
      asNonEmptyString(doc.detailAfterOpeningBody) || defaults.detailAfterOpeningBody,
    detailDispatchNote: asNonEmptyString(doc.detailDispatchNote) || defaults.detailDispatchNote,
  };
}

async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const doc = await sanityClient.fetch<SanityProductDetail | null>(
      PRODUCT_DETAIL_QUERY,
      { slug },
      { next: { revalidate } },
    );
    if (!doc) return null;
    return toProductDetail(doc);
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const rows = await sanityClient.fetch<ProductSlugRow[]>(PRODUCT_SLUGS_QUERY, {}, { next: { revalidate } });
    if (!Array.isArray(rows)) return [];

    return rows
      .map((row) => (typeof row.slug === 'string' ? row.slug.trim() : ''))
      .filter((slug) => slug.length > 0)
      .map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

function ProductName({ product }: { product: ProductDetail }) {
  if (product.suffix) {
    return (
      <p
        className="text-center text-[clamp(2.6rem,5.5vw,4.9rem)] leading-[0.92] font-coolvetica"
        style={{ color: product.titleColor }}
      >
        {product.title}
        <span className="mx-2 font-rascal" style={{ color: product.accentColor }}>
          {product.accent}
        </span>
        {product.suffix}
      </p>
    );
  }

  return (
    <p className="text-center text-[clamp(2.6rem,5.5vw,4.9rem)] leading-[0.92] font-coolvetica">
      <span style={{ color: product.titleColor }}>{product.title}</span>{' '}
      <span className="font-rascal" style={{ color: product.accentColor }}>
        {product.accent}
      </span>
    </p>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const productName = `${product.title} ${product.accent}${product.suffix ? ` ${product.suffix}` : ''}`;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#ECECEC] pt-24 md:pt-28">
      <Navbar />

      <section className="mx-auto w-full max-w-[430px] px-4 pb-24 md:max-w-[1100px] md:px-8 md:pb-32">
        <div className="mt-2 flex md:mt-4">
          <Link
            href="/product"
            className="inline-flex h-[56px] w-[220px] items-center justify-center gap-2 whitespace-nowrap bg-[url('/product/button1.svg')] bg-contain bg-center bg-no-repeat px-4 text-[clamp(1.1rem,2vw,1.55rem)] leading-none text-[#FFF8F8] font-schoolbell transition-transform hover:scale-[1.02] md:h-[64px] md:w-[260px]"
          >
            <span aria-hidden>←</span>
            back to products
          </Link>
        </div>

        <ProductImageCarousel images={product.carouselImages} productName={productName} />

        <div className="mt-3 md:mt-6">
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <ProductName product={product} />
            <ProductShareButton productName={productName} />
          </div>
          <div className="relative mx-auto mt-2 h-[34px] w-[194px] md:h-[42px] md:w-[240px]">
            <Image src="/product/reviewstars.svg" alt="5 star reviews" fill className="object-contain" />
          </div>
          {product.discountedPrice ? (
            <div className="mt-2 flex items-center justify-center gap-3 leading-none">
              <p
                className="inline-block text-[#8A7F74] font-coolvetica"
                style={{
                  fontSize: 'clamp(2.8rem,3.2vw,3.7rem)',
                  lineHeight: 1,
                  textDecorationLine: 'line-through',
                  textDecorationColor: '#DC2626',
                  textDecorationThickness: '3px',
                }}
              >
                {product.price}
              </p>
              <p className="text-center text-[clamp(2.1rem,3.8vw,3.3rem)] text-[#1D1D1D] font-coolvetica">
                {product.discountedPrice}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-center text-[clamp(2.1rem,3.8vw,3.3rem)] leading-none text-[#1D1D1D] font-coolvetica">
              {product.price}
            </p>
          )}
          <ProductDetailCartActions
            slug={product.slug}
            name={productName}
            priceLabel={product.cartPrice}
            image={product.jarImage}
          />
        </div>

        <ProductDetailSections
          detailInJarTitle={product.detailInJarTitle}
          detailInJarSummary={product.detailInJarSummary}
          detailInJarIngredients={product.detailInJarIngredients}
          detailOnTongueTitle={product.detailOnTongueTitle}
          detailOnTongueBody={product.detailOnTongueBody}
          detailAfterOpeningTitle={product.detailAfterOpeningTitle}
          detailAfterOpeningBody={product.detailAfterOpeningBody}
        />

        <p className="mx-auto mt-8 max-w-[390px] whitespace-pre-line text-center text-[clamp(2rem,3.2vw,3rem)] leading-[1.08] text-[#E63182] font-schoolbell md:mt-12 md:max-w-[930px]">
          {product.detailDispatchNote}
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
