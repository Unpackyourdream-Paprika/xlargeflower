import { NextRequest, NextResponse } from 'next/server';
import { getHeroAssets, createHeroAsset } from '@/lib/supabase';

export async function GET() {
  try {
    const assets = await getHeroAssets(false); // 전체 조회 (어드민용)
    return NextResponse.json({ assets });
  } catch (error) {
    console.error('Failed to fetch hero assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero assets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, thumbnail_url, video_url, thumbnail_webp_url, sort_order, is_active } = body;

    if (!thumbnail_url || !video_url) {
      return NextResponse.json(
        { error: 'thumbnail_url and video_url are required' },
        { status: 400 }
      );
    }

    const asset = await createHeroAsset({
      title: title || null,
      thumbnail_url,
      video_url,
      thumbnail_webp_url: thumbnail_webp_url || null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    });

    return NextResponse.json({ success: true, asset });
  } catch (error) {
    console.error('Failed to create hero asset:', error);
    return NextResponse.json(
      { error: 'Failed to create hero asset' },
      { status: 500 }
    );
  }
}
