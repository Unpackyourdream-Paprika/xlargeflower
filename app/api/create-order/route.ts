import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service role key로 서버사이드 Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const body: OrderRequest = await request.json();

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

    // 주문 생성
    const { data: order, error } = await supabase
      .from('xlarge_flower_orders')
      .insert([{
        customer_name: customer_name || null,
        customer_email: customer_email.toLowerCase(),
        customer_phone: customer_phone || null,
        customer_company: customer_company || null,
        order_summary: order_summary || {},
        selected_pack: selected_pack || null,
        final_price: final_price || null,
        chat_log: chat_log || [],
        status: 'pending'
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
