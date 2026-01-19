import { NextRequest, NextResponse } from 'next/server';
import { updateHeroLayoutType, HeroLayoutType } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { layout_type } = body as { layout_type: HeroLayoutType };

    if (!layout_type || !['VERTICAL_ROLLING', 'MOBILE_MOCKUP'].includes(layout_type)) {
      return NextResponse.json(
        { error: 'Invalid layout type' },
        { status: 400 }
      );
    }

    await updateHeroLayoutType(layout_type);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero layout:', error);
    return NextResponse.json(
      { error: 'Failed to update hero layout' },
      { status: 500 }
    );
  }
}
