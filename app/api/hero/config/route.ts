import { NextResponse } from 'next/server';
import { getHeroConfig } from '@/lib/supabase';

// 캐시: 60초 동안 유지
export const revalidate = 60;

export async function GET() {
  try {
    const config = await getHeroConfig();

    // 응답에 캐시 헤더 추가 (브라우저 + CDN 캐싱)
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Failed to fetch hero config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero config' },
      { status: 500 }
    );
  }
}
