import { createClient } from 'next-sanity';

const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  '9xcisbtj';
const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  process.env.SANITY_DATASET ||
  'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01';

if (!projectId || !dataset) {
  throw new Error(
    'Missing Sanity config. Set NEXT_PUBLIC_SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_DATASET.'
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  timeout: 5000,
  maxRetries: 1,
  useCdn: true, // fast + cheap for content
});
