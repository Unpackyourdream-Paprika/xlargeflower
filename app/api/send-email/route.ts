import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/supabase';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us22';
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || '';

type EmailType = 'order_confirmation' | 'proposal_sent' | 'delivery_complete';

interface EmailRequest {
  orderId: string;
  type: EmailType;
  proposalUrls?: string[];
  proposalNote?: string;
  deliveryUrls?: string[];
  deliveryNote?: string;
}

// Mailchimp에 연락처 추가/업데이트 및 태그 설정
async function addToMailchimpWithTag(email: string, firstName: string, tags: string[]) {
  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    console.warn('Mailchimp not configured');
    return null;
  }

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;
  const emailHash = require('crypto').createHash('md5').update(email.toLowerCase()).digest('hex');

  try {
    // 먼저 연락처 추가/업데이트
    await fetch(`${url}/${emailHash}`, {
      method: 'PUT',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        merge_fields: {
          FNAME: firstName || '',
        },
      }),
    });

    // 태그 추가
    for (const tag of tags) {
      await fetch(`${url}/${emailHash}/tags`, {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: [{ name: tag, status: 'active' }],
        }),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Mailchimp error:', error);
    return null;
  }
}

// 이메일 내용 생성
function generateEmailContent(type: EmailType, order: Record<string, unknown>, extraData?: Record<string, unknown>) {
  const orderId = order.id as string;
  const customerName = order.customer_name as string || '고객';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://xlarge.flower';
  const orderUrl = `${baseUrl}/order/${orderId}`;

  switch (type) {
    case 'order_confirmation':
      return {
        subject: `[XLARGE FLOWER] 주문이 접수되었습니다`,
        html: `
          <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: white; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #00F5A0; font-size: 24px; margin: 0;">XLARGE FLOWER</h1>
            </div>

            <h2 style="color: white; font-size: 20px; margin-bottom: 20px;">
              안녕하세요 ${customerName}님,<br/>주문이 접수되었습니다!
            </h2>

            <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="color: #888; margin: 0 0 8px;">주문번호</p>
              <p style="color: white; font-family: monospace; font-size: 12px; margin: 0; word-break: break-all;">${orderId}</p>
            </div>

            <p style="color: #888; line-height: 1.6;">
              주문 내용을 검토 후 곧 작업을 시작하겠습니다.<br/>
              진행 상황은 아래 링크에서 확인하실 수 있습니다.
            </p>

            <a href="${orderUrl}" style="display: block; text-align: center; background: linear-gradient(to right, #00F5A0, #00D9F5); color: black; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 32px 0;">
              주문 상태 확인하기
            </a>

            <p style="color: #555; font-size: 12px; text-align: center;">
              문의사항이 있으시면 언제든 연락 주세요.
            </p>
          </div>
        `,
      };

    case 'proposal_sent':
      const proposalUrls = extraData?.proposalUrls as string[] || [];
      const proposalNote = extraData?.proposalNote as string || '';
      return {
        subject: `[XLARGE FLOWER] 기획안이 준비되었습니다`,
        html: `
          <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: white; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #00F5A0; font-size: 24px; margin: 0;">XLARGE FLOWER</h1>
            </div>

            <h2 style="color: white; font-size: 20px; margin-bottom: 20px;">
              ${customerName}님,<br/>기획안이 준비되었습니다!
            </h2>

            <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="color: #888; margin: 0 0 16px;">기획안 확인하기</p>
              ${proposalUrls.map((url: string, i: number) => `
                <a href="${url}" style="display: block; color: #00F5A0; margin: 8px 0; text-decoration: none;">
                  📄 기획안 ${i + 1} 보기 →
                </a>
              `).join('')}
            </div>

            ${proposalNote ? `
              <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #888; margin: 0 0 8px;">담당자 메모</p>
                <p style="color: white; margin: 0; white-space: pre-wrap;">${proposalNote}</p>
              </div>
            ` : ''}

            <p style="color: #888; line-height: 1.6;">
              기획안을 검토하시고 피드백이 있으시면 알려주세요.<br/>
              확정 후 제작을 시작하겠습니다.
            </p>

            <a href="${orderUrl}" style="display: block; text-align: center; background: linear-gradient(to right, #00F5A0, #00D9F5); color: black; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 32px 0;">
              주문 상세 보기
            </a>
          </div>
        `,
      };

    case 'delivery_complete':
      const deliveryUrls = extraData?.deliveryUrls as string[] || [];
      const deliveryNote = extraData?.deliveryNote as string || '';
      return {
        subject: `[XLARGE FLOWER] 영상이 완성되었습니다! 🎉`,
        html: `
          <div style="font-family: 'Pretendard', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: white; padding: 40px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #00F5A0; font-size: 24px; margin: 0;">XLARGE FLOWER</h1>
            </div>

            <h2 style="color: white; font-size: 20px; margin-bottom: 20px;">
              🎉 ${customerName}님,<br/>영상이 완성되었습니다!
            </h2>

            <div style="background: linear-gradient(to right, rgba(0,245,160,0.1), rgba(0,217,245,0.1)); border: 1px solid rgba(0,245,160,0.3); border-radius: 12px; padding: 24px; margin: 24px 0;">
              <p style="color: #00F5A0; margin: 0 0 16px; font-weight: bold;">📹 영상 다운로드</p>
              ${deliveryUrls.map((url: string, i: number) => `
                <a href="${url}" style="display: block; background: #111; border: 1px solid #333; padding: 12px 16px; border-radius: 8px; color: #00F5A0; margin: 8px 0; text-decoration: none;">
                  영상 ${i + 1} 다운로드 →
                </a>
              `).join('')}
            </div>

            ${deliveryNote ? `
              <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="color: #888; margin: 0 0 8px;">안내사항</p>
                <p style="color: white; margin: 0; white-space: pre-wrap;">${deliveryNote}</p>
              </div>
            ` : ''}

            <p style="color: #888; line-height: 1.6;">
              XLARGE FLOWER를 이용해 주셔서 감사합니다.<br/>
              추가 수정이 필요하시면 언제든 연락 주세요!
            </p>

            <a href="${orderUrl}" style="display: block; text-align: center; background: linear-gradient(to right, #00F5A0, #00D9F5); color: black; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 32px 0;">
              주문 상세 보기
            </a>

            <p style="color: #555; font-size: 12px; text-align: center; margin-top: 40px;">
              다음에도 XLARGE FLOWER와 함께해 주세요! 💚
            </p>
          </div>
        `,
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { orderId, type, proposalUrls, proposalNote, deliveryUrls, deliveryNote } = body;

    // 주문 정보 조회
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.customer_email) {
      return NextResponse.json({ error: 'Customer email not found' }, { status: 400 });
    }

    // 이메일 내용 생성
    const emailContent = generateEmailContent(type, order as unknown as Record<string, unknown>, {
      proposalUrls,
      proposalNote,
      deliveryUrls,
      deliveryNote,
    });

    // Mailchimp 태그 설정으로 자동화 트리거
    const tagMap: Record<EmailType, string[]> = {
      order_confirmation: ['XLARGE_ORDER', 'ORDER_CONFIRMED'],
      proposal_sent: ['XLARGE_ORDER', 'PROPOSAL_SENT'],
      delivery_complete: ['XLARGE_ORDER', 'DELIVERY_COMPLETE'],
    };

    await addToMailchimpWithTag(
      order.customer_email,
      order.customer_name || '',
      tagMap[type]
    );

    // 여기서 실제 이메일 발송 로직 추가 가능
    // Mailchimp Transactional, SendGrid, Resend 등 사용
    // 현재는 Mailchimp 자동화 워크플로우로 처리한다고 가정

    console.log('Email would be sent:', {
      to: order.customer_email,
      subject: emailContent.subject,
      type,
    });

    return NextResponse.json({
      success: true,
      message: `Email notification triggered for ${type}`,
      emailContent: {
        to: order.customer_email,
        subject: emailContent.subject,
      },
    });
  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
