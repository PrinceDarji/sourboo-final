import { NextResponse } from 'next/server';
import { getSocialLinksConfig } from '@/src/lib/sanity/siteSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const social = await getSocialLinksConfig(0);

  return NextResponse.json(social, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
