import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe 초기화 (환경 변수에서 시크릿 키 가져오기)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      customerName,
      customerEmail,
      productName,
      metadata
    } = body;

    // 필수 값 검증
    if (!amount || !customerEmail || !productName) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Stripe API 키 확인
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe가 설정되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // 원화(KRW)는 소수점이 없는 통화이므로 amount를 그대로 사용
    const unitAmount = Math.round(amount);

    // Stripe Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: productName,
              description: `XLARGE FLOWER - ${productName}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      metadata: {
        customerName: customerName || '',
        ...metadata,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?payment=cancelled`,
      locale: 'ko',
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Stripe checkout session error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `결제 처리 중 오류가 발생했습니다: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '결제 세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
