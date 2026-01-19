import { NextRequest, NextResponse } from 'next/server';
import { updateHeroAsset, deleteHeroAsset } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await updateHeroAsset(id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero asset:', error);
    return NextResponse.json(
      { error: 'Failed to update hero asset' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteHeroAsset(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete hero asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete hero asset' },
      { status: 500 }
    );
  }
}
