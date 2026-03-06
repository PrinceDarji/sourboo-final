import { NextResponse } from 'next/server';
import { getInstagramLatestPosts } from '@/src/lib/instagram/feed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') || '3');
  const safeLimit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 10)) : 3;

  const posts = await getInstagramLatestPosts(safeLimit);

  return NextResponse.json(
    { posts },
    {
      headers: {
        'Cache-Control': 's-maxage=900, stale-while-revalidate=900',
      },
    },
  );
}

