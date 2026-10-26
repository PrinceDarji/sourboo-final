import { NextResponse } from 'next/server';
import { getSocialLinksConfig } from '@/src/lib/sanity/siteSettings';

export const revalidate = 300;

export async function GET() {
  const social = await getSocialLinksConfig(300);

  return NextResponse.json(social, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
