// Google Analytics & Meta Pixel 이벤트 헬퍼 함수

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

// GA4 이벤트 타입
export type GAEventName =
  | 'generate_lead'           // 상담 신청 (핵심 이벤트)
  | 'begin_checkout'          // 가격 플랜 시작하기 클릭
  | 'view_item'               // 특정 상품/플랜 조회
  | 'add_to_cart'             // 관심 상품 추가 (향후 사용)
  | 'scroll_depth_50'         // 스크롤 50% 도달
  | 'scroll_depth_90'         // 스크롤 90% 도달
  | 'video_engagement'        // 비디오 시청
  | 'contact_click';          // 문의하기 클릭

interface GAEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  product_name?: string;
  product_price?: number;
  currency?: string;
  [key: string]: any;
}

// GA4 이벤트 전송
export const trackGA4Event = (
  eventName: GAEventName,
  params: GAEventParams = {}
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      send_to: 'G-WBLTN85HQK'
    });
    console.log('[GA4] Event tracked:', eventName, params);
  }
};

// Meta Pixel 이벤트 전송
export const trackMetaEvent = (
  eventName: string,
  params: Record<string, any> = {}
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
    console.log('[Meta Pixel] Event tracked:', eventName, params);
  }
};

// 통합 전환 이벤트 (GA4 + Meta Pixel 동시 전송)
export const trackConversion = {
  // 상담 신청 (가장 중요한 전환)
  consultClick: (source: string = 'unknown') => {
    trackGA4Event('generate_lead', {
      event_category: 'engagement',
      event_label: `consult_${source}`,
      value: 1
    });
    trackMetaEvent('Lead', {
      content_name: `Consultation Request - ${source}`,
      content_category: 'consultation'
    });
  },

  // 가격 플랜 "시작하기" 클릭
  planCheckoutClick: (planName: string, price: number) => {
    trackGA4Event('begin_checkout', {
      event_category: 'ecommerce',
      event_label: planName,
      value: price,
      product_name: planName,
      product_price: price,
      currency: 'KRW'
    });
    trackMetaEvent('InitiateCheckout', {
      content_name: planName,
      value: price,
      currency: 'KRW'
    });
  },

  // 포트폴리오 상세 보기
  portfolioView: (portfolioName: string) => {
    trackGA4Event('view_item', {
      event_category: 'engagement',
      event_label: `portfolio_${portfolioName}`
    });
  },

  // 비디오 시청 (3초 이상)
  videoEngagement: (videoId: string) => {
    trackGA4Event('video_engagement', {
      event_category: 'engagement',
      event_label: videoId
    });
    trackMetaEvent('ViewContent', {
      content_type: 'video',
      content_ids: [videoId]
    });
  },

  // 스크롤 깊이 추적
  scrollDepth: (depth: number) => {
    if (depth === 50) {
      trackGA4Event('scroll_depth_50', {
        event_category: 'engagement',
        event_label: 'scroll_50_percent'
      });
    } else if (depth >= 90) {
      trackGA4Event('scroll_depth_90', {
        event_category: 'engagement',
        event_label: 'scroll_90_percent'
      });
    }
  }
};
