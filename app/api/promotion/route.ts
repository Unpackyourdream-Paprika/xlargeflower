import { NextResponse } from 'next/server';
import { getActivePromotion } from '@/lib/supabase';

export async function GET() {
  try {
    const promotion = await getActivePromotion();

    if (!promotion) {
      return NextResponse.json({
        active: false,
        discount_rate: 0,
        original_prices: {
          starter: 3300000,
          growth: 5500000,
          performance: 9000000,
          ads: 15000000
        },
        discounted_prices: null,
        badge_text: null
      });
    }

    const originalPrices = {
      starter: 3300000,
      growth: 5500000,
      performance: 9000000,
      ads: 15000000
    };

    const discountMultiplier = (100 - promotion.discount_rate) / 100;
    const discountedPrices = {
      starter: Math.round(originalPrices.starter * discountMultiplier),
      growth: Math.round(originalPrices.growth * discountMultiplier),
      performance: Math.round(originalPrices.performance * discountMultiplier),
      ads: Math.round(originalPrices.ads * discountMultiplier)
    };

    return NextResponse.json({
      active: true,
      discount_rate: promotion.discount_rate,
      badge_text: promotion.badge_text || `${promotion.discount_rate}% OFF`,
      end_date: promotion.end_date,
      original_prices: originalPrices,
      discounted_prices: discountedPrices
    });
  } catch (error) {
    console.error('Promotion API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotion' },
      { status: 500 }
    );
  }
}
