import { NextRequest, NextResponse } from 'next/server';
import { updateHeroAssetOrders } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body as { orders: { id: string; sort_order: number }[] };

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: 'orders array is required' },
        { status: 400 }
      );
    }

    await updateHeroAssetOrders(orders);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update hero asset orders:', error);
    return NextResponse.json(
      { error: 'Failed to update hero asset orders' },
      { status: 500 }
    );
  }
}
