// Mailchimp 이메일 발송 모듈
// API 키 설정 후 사용 가능

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || '';
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || 'us1'; // API 키 뒤에 있는 서버 프리픽스 (예: us1, us2)
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID || ''; // Audience ID

interface MailchimpContact {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  tags?: string[];
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderSummary: {
    modelName?: string;
    platforms?: string;
    mediaBudget?: string;
    targetAudience?: string;
    targetRegion?: string;
    totalPrice?: number;
  };
  paymentMethod: 'bank' | 'card';
}

// Mailchimp API가 설정되어 있는지 확인
export function isMailchimpConfigured(): boolean {
  return !!(MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID);
}

// 연락처를 Mailchimp 리스트에 추가
export async function addContactToMailchimp(contact: MailchimpContact) {
  if (!isMailchimpConfigured()) {
    console.warn('Mailchimp is not configured. Skipping contact addition.');
    return null;
  }

  const url = `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: contact.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: contact.firstName || '',
          LNAME: contact.lastName || '',
          COMPANY: contact.company || '',
          PHONE: contact.phone || '',
        },
        tags: contact.tags || ['XLARGE_ORDER'],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // 이미 구독된 경우 무시
      if (error.title === 'Member Exists') {
        console.log('Contact already exists in Mailchimp');
        return { existing: true };
      }
      throw new Error(error.detail || 'Failed to add contact to Mailchimp');
    }

    return await response.json();
  } catch (error) {
    console.error('Mailchimp error:', error);
    throw error;
  }
}

// 주문 확인 이메일 발송 (Mailchimp Transactional / Mandrill 사용)
// 참고: Mailchimp Transactional은 별도 설정 필요
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  // Mailchimp Marketing API는 트랜잭션 이메일을 직접 지원하지 않음
  // 대안 1: Mailchimp Transactional (Mandrill) 사용
  // 대안 2: 캠페인 자동화 트리거 사용
  // 대안 3: 다른 이메일 서비스 (SendGrid, Resend 등) 사용

  console.log('Order confirmation email would be sent to:', data.customerEmail);
  console.log('Order ID:', data.orderId);

  // 현재는 Mailchimp 리스트에 연락처 추가 + 태그로 처리
  // 실제 이메일 발송은 Mailchimp 자동화 워크플로우에서 처리
  if (isMailchimpConfigured()) {
    try {
      await addContactToMailchimp({
        email: data.customerEmail,
        firstName: data.customerName,
        tags: [
          'XLARGE_ORDER',
          data.paymentMethod === 'bank' ? 'BANK_TRANSFER' : 'CARD_PAYMENT',
        ],
      });

      // 태그 추가로 자동화 트리거
      // Mailchimp에서 "XLARGE_ORDER" 태그가 추가되면
      // 자동으로 주문 확인 이메일이 발송되도록 설정 필요

      return { success: true, method: 'mailchimp_automation' };
    } catch (error) {
      console.error('Failed to add contact to Mailchimp:', error);
      return { success: false, error };
    }
  }

  return { success: false, reason: 'Mailchimp not configured' };
}

// 주문 상태 변경 알림 이메일
export async function sendOrderStatusEmail(
  customerEmail: string,
  orderId: string,
  status: string,
  message?: string
) {
  console.log('Status update email would be sent to:', customerEmail);
  console.log('Order ID:', orderId);
  console.log('New Status:', status);

  // Mailchimp 자동화로 처리하거나 별도 트랜잭션 이메일 서비스 사용
  return { success: true, method: 'pending_implementation' };
}

// 결과물 납품 이메일
export async function sendDeliveryEmail(
  customerEmail: string,
  orderId: string,
  downloadLinks: string[],
  note?: string
) {
  console.log('Delivery email would be sent to:', customerEmail);
  console.log('Order ID:', orderId);
  console.log('Download links:', downloadLinks);

  // Mailchimp 자동화로 처리하거나 별도 트랜잭션 이메일 서비스 사용
  return { success: true, method: 'pending_implementation' };
}
