# Sourboo SEO, performance and reliability audit

Date: 26 October 2026. Scope: local source, production build and local HTTP checks.

## Implemented

- Added canonical URLs and distinct metadata for the storefront, product, company, contact and policy pages.
- Consolidated `/home` into `/` with a permanent redirect. Known product aliases redirect to catalog slugs. Internal home links use `/`.
- Added server-rendered Product/Offer JSON-LD, using authoritative catalog prices and local gallery images. No invented reviews, ratings, stock levels or delivery promises.
- Added product-page H1 headings and a catalog H1. Fixed an existing fallback that appended “sour” to bundle names.
- Excluded checkout and payment-return pages from indexing. Popup pages retain noindex. Robots allows crawlers to see these noindex directives and excludes API routes.
- Removed the duplicate home URL and artificial current-time modification dates from the sitemap.
- Replaced uncached marketing-content reads with five-minute revalidation. Root popup settings and the public settings API now also use caching. CMS fetches have a five-second timeout and one retry.
- Production build now prerenders the home, about, catalog, contact/policy pages and all six product pages, rather than rendering these on every request. Checkout APIs remain dynamic and retain server-owned pricing.
- Restricted automatic marketing redirects to the homepage, protecting product browsing, checkout and payment-return flows. Popup dismissal persists for the browser session with an in-memory fallback.
- Protected cart storage writes, merged old cart aliases, restored catalog prices, and bounded quantities. Invalid carts and malformed JSON return HTTP 400 before order/payment creation.
- Lowered the section reveal threshold so tall sections can become visible; cleanup restores their visibility.
- Set the Turbopack project root, fixed an unsupported image quality setting, excluded generated bundles from linting, and resolved existing lint warnings.
- Added `npm test`, `npm run typecheck`, and `npm run test:smoke`. The smoke suite starts/stops its own production server on port 3217 and never submits a valid payment request.

## Validation

- Nine regression tests cover catalog/checkout consistency, offline pricing, shipping, legacy cart aliases, invalid payloads, and safe structured-data serialization.
- Production HTTP checks cover canonical tags, descriptions, headings and structured data across 15 public pages; redirects; checkout noindex; unknown product handling; sitemap; all six checkout quotes; malformed JSON.
- Build output verifies prerendering. Local response timings are not Core Web Vitals and are not a before/after performance benchmark.

## Remaining limits and follow-up

- Changes require deployment. Verify deployed canonicals use `https://www.sourboo.com`, then submit the sitemap in Google Search Console and check product URLs with Google's Rich Results Test.
- No live payment, settlement, refund, email delivery or invoice was exercised. Existing webhook authorization and duplicate-event protection were inspected, not certified end to end. Use PhonePe UAT to verify the full lifecycle.
- No browser visual/accessibility audit or field Core Web Vitals measurement was performed. After deployment, measure mobile LCP, INP and CLS using PageSpeed Insights and Search Console before claiming score improvements.
- Sanity remains an external dependency for marketing text and settings. Pages retain fallbacks and now cache content for five minutes; CMS edits may take that long to appear. The newer Sanity popup images still require the actual files or asset references.
- Catalog and checkout intentionally remain on the owner-provided local snapshot. Changing Sanity products alone will not change prices. Keep `src/lib/catalog/products.ts` authoritative until a coordinated CMS migration.
- The homepage still has a timed full-page marketing prompt. It no longer interrupts checkout, but replacing it with a non-blocking opt-in is a future UX decision.
- Large legacy source assets remain in `public`; active components already use WebP variants for the largest home imagery. Do not remove originals without checking CMS references.

## References

- https://developers.google.com/search/docs/appearance/structured-data/product
- https://developers.google.com/search/docs/specialty/ecommerce/designing-a-url-structure-for-ecommerce-sites
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- https://nextjs.org/docs/app/api-reference/functions/fetch
