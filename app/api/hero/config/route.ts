import { NextResponse } from 'next/server';
import { getHeroConfig } from '@/lib/supabase';

export async function GET() {
  try {
    const config = await getHeroConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Failed to fetch hero config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hero config' },
      { status: 500 }
    );
  }
}
