import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Slack webhook 전송 함수
async function sendSlackNotification(orderData: {
  orderId: string;
  customer_name?: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_company?: string | null;
  selected_pack?: string;
  final_price?: number;
  order_summary?: Record<string, unknown>;
}) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) {
    console.log('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return;
  }

  try {
    const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 새로운 주문이 접수되었습니다!',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*고객명:*\n${orderData.customer_name || '미입력'}`
          },
          {
            type: 'mrkdwn',
            text: `*회사명:*\n${orderData.customer_company || '개인'}`
          },
          {
            type: 'mrkdwn',
            text: `*이메일:*\n${orderData.customer_email}`
          },
          {
            type: 'mrkdwn',
            text: `*연락처:*\n${orderData.customer_phone || '미입력'}`
          }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*선택 상품:*\n${orderData.selected_pack || '미선택'}`
          },
          {
            type: 'mrkdwn',
            text: `*결제 금액:*\n₩${formatPrice(orderData.final_price || 0)}`
          }
        ]
      }
    ];

    // 주문 상세 정보 추가
    if (orderData.order_summary) {
      const summary = orderData.order_summary;
      const summaryFields = [];

      if (summary.platforms) {
        summaryFields.push({
          type: 'mrkdwn',
          text: `*플랫폼:*\n${summary.platforms}`
        });
      }
      if (summary.target_audience) {
        summaryFields.push({
          type: 'mrkdwn',
          text: `*타겟층:*\n${summary.target_audience}`
        });
      }
      if (summary.targetRegion) {
        summaryFields.push({
          type: 'mrkdwn',
          text: `*타겟 지역:*\n${summary.targetRegion}`
        });
      }
      if (summary.mediaBudget) {
        summaryFields.push({
          type: 'mrkdwn',
          text: `*매체비:*\n${summary.mediaBudget}`
        });
      }

      if (summaryFields.length > 0) {
        blocks.push({
          type: 'section',
          fields: summaryFields as { type: 'mrkdwn'; text: string }[]
        });
      }
    }

    // 주문 ID 추가
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `주문 ID: \`${orderData.orderId}\` | 접수 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
        }
      ]
    } as { type: 'context'; elements: { type: 'mrkdwn'; text: string }[] });

    await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks })
    });

    console.log('Slack notification sent successfully');
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

interface OrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  customer_company?: string | null;
  order_summary: {
    modelOption?: string;
    product?: string;
    platforms?: string;
    mediaBudget?: string;
    target_audience?: string;
    targetRegion?: string;
    estimated_price?: number;
  };
  selected_pack?: string;
  final_price?: number;
  chat_log?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    // 환경 변수를 함수 내부에서 가져오기 (런타임에 확실히 로드)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    console.log('=== Create Order API Called ===');
    console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
    console.log('Service Key exists:', !!supabaseServiceKey, supabaseServiceKey ? `(${supabaseServiceKey.substring(0, 20)}...)` : '');
    console.log('Anon Key exists:', !!supabaseAnonKey);
    console.log('Using key type:', supabaseServiceKey ? 'SERVICE_ROLE' : 'ANON');

    if (!supabaseUrl) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing SUPABASE_URL'
      }, { status: 500 });
    }

    if (!supabaseServiceKey && !supabaseAnonKey) {
      console.error('Missing Supabase keys');
      return NextResponse.json({
        error: 'Server configuration error',
        details: 'Missing Supabase keys'
      }, { status: 500 });
    }

    // Supabase 클라이언트 생성 (함수 내부에서)
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body: OrderRequest = await request.json();
    console.log('Order request body:', JSON.stringify(body, null, 2));

    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_company,
      order_summary,
      selected_pack,
      final_price,
      chat_log
    } = body;

    if (!customer_email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // selected_pack 값을 DB 제약조건에 맞게 매핑
    // DB에서 허용하는 값: null 또는 특정 enum 값들
    // 팩 이름을 order_summary에 저장하고, selected_pack은 null로 설정
    const orderSummaryWithPack = {
      ...order_summary,
      selected_pack_name: selected_pack // 팩 이름은 order_summary에 저장
    };

    // 주문 생성
    const { data: order, error } = await supabase
      .from('xlarge_flower_orders')
      .insert([{
        customer_name: customer_name || null,
        customer_email: customer_email.toLowerCase(),
        customer_phone: customer_phone || null,
        customer_company: customer_company || null,
        order_summary: orderSummaryWithPack,
        selected_pack: null, // 제약조건 우회 - 팩 정보는 order_summary에 저장됨
        final_price: final_price || null,
        chat_log: chat_log || [],
        status: 'pending'
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', JSON.stringify(error, null, 2));
      return NextResponse.json({
        error: 'Failed to create order',
        details: error.message,
        code: error.code,
        hint: error.hint || null
      }, { status: 500 });
    }

    console.log('Order created successfully:', order.id);

    // Slack 알림 전송 (비동기로 처리, 실패해도 주문은 성공)
    sendSlackNotification({
      orderId: order.id,
      customer_name,
      customer_email,
      customer_phone,
      customer_company,
      selected_pack,
      final_price,
      order_summary: orderSummaryWithPack
    }).catch(err => console.error('Slack notification error:', err));

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
