# Mobile and delivery reliability — November 1, 2026

Phone/tablet layout overrides apply below 1280px; coarse-pointer devices also receive simplified motion. Checkout columns stack below that width, fields allow shrinking, and 16px field text avoids iOS focus zoom. Product cards use fluid widths and tablet grids. PDP purchase controls remain visible above the safe area; the cart overlay remains above them. Home tablet hero uses stable viewport units.

The shared popup CMS fetch and product marketing CMS fetch now stream independently of the storefront. Catalog/PDP data remain local and prerendered. Product navigation has a loading boundary. Desktop styling remains otherwise intact.

Confirmation recovery now includes all paid, unsent orders, even if the original worker never recorded an error. Claims are marked as in progress and recovered after 15 minutes. Repeated payment notifications preserve delivery diagnostics. Losing a claim no longer starts a second unguarded invoice/email send. Oldest-updated ordering rotates failed orders fairly.

Operational limitations: the existing Vercel cron runs daily, at 03:00 UTC. This change does not enable a more frequent schedule. Three paid orders were found with missing confirmation timestamps and no saved diagnostic; no manual resends were performed. Already-stuck claims created before the new in-progress marker require operator investigation. SMTP acceptance and database recording are not atomic: interruption after SMTP acceptance may cause a duplicate on recovery. Provider outages and invalid customer addresses can still fail. Monitor retry results and invoice error fields.

Validation: unit tests, TypeScript, ESLint, production build, and HTTP smoke checks for storefront/PDP/checkout routes. These do not establish mobile Core Web Vitals, physical-device visual correctness, payment settlement, or inbox delivery. Changes require deployment.
