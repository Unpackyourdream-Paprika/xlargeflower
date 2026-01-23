'use client';

import { PricingPlan, PromotionSettings } from '@/lib/supabase';
import { triggerOpenChat, ChatContext } from '@/components/GlobalChatButton';
import { trackConversion } from '@/lib/analytics';

interface PricingCardProps {
  plan: PricingPlan;
  promotion?: PromotionSettings | null;
  paymentType: 'card' | 'invoice';
  onPlanSelect?: (planName: string) => void;
}

export default function PricingCard({ plan, promotion, paymentType, onPlanSelect }: PricingCardProps) {
  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

  // 가격 계산 (프로모션 할인 > 세금계산서 할인 순으로 적용)
  const getPrice = (basePrice: number) => {
    let price = basePrice;

    // 프로모션 할인 적용
    if (promotion) {
      price = Math.round(price * (100 - promotion.discount_rate) / 100);
    }

    // 세금계산서 할인 추가 적용
    if (paymentType === 'invoice') {
      price = Math.round(price * 0.9);
    }

    return price;
  };

  // 원래 가격 (프로모션 없을 때 기준)
  const getOriginalPrice = (basePrice: number) => {
    if (paymentType === 'invoice') {
      return Math.round(basePrice * 0.9);
    }
    return basePrice;
  };

  const showStrikethrough = promotion || paymentType === 'invoice';
  const finalPrice = getPrice(plan.price);
  const originalPrice = getOriginalPrice(plan.price);

  // 카드 스타일에 따른 클래스
  const getCardClass = () => {
    switch (plan.card_style) {
      case 'featured':
        return 'card-featured relative';
      case 'purple':
        return 'card bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border-purple-500/40';
      case 'gold':
        return 'bg-gradient-to-r from-[#1a1a1a] via-[#111] to-[#1a1a1a] border border-[#B8860B]/40 rounded-2xl';
      default:
        return 'card';
    }
  };

  // 버튼 스타일
  const getButtonClass = () => {
    switch (plan.card_style) {
      case 'featured':
        return 'btn-primary w-full';
      case 'purple':
        return 'block w-full text-center py-3 rounded-full font-medium bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:opacity-90 transition-all';
      case 'gold':
        return 'inline-block text-center px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black hover:opacity-90 transition-all';
      default:
        return 'btn-secondary w-full text-center block';
    }
  };

  // 라벨 색상
  const getLabelColor = () => {
    switch (plan.card_style) {
      case 'purple':
        return 'text-purple-400';
      case 'gold':
        return 'text-[#FFD700]';
      default:
        return '';
    }
  };

  const handleButtonClick = () => {
    // GA4 + Meta Pixel 전환 추적
    trackConversion.planCheckoutClick(plan.title, finalPrice);

    // Chat 버튼 처리
    if (plan.button_action === 'chat' && plan.chat_trigger) {
      triggerOpenChat(plan.chat_trigger as ChatContext);
      return;
    }

    // 가격 기준 결제 플로우 분기
    // Starter (50만) / Growth (150만): 카드 결제
    // Performance (450만) / VIP: 도입 문의
    const CARD_PAYMENT_THRESHOLD = 2000000; // 200만 원 이하는 카드 결제

    if (plan.price <= CARD_PAYMENT_THRESHOLD) {
      // 소액 플랜: Stripe 카드 결제창 팝업
      const confirmed = window.confirm(
        '법인카드 결제 시 지출증빙용 영수증이 자동 발행됩니다.\n\n결제 페이지로 이동하시겠습니까?'
      );
      if (confirmed) {
        window.location.href = `/checkout?plan=${encodeURIComponent(plan.title)}&price=${finalPrice}`;
      }
    } else {
      // 고액 플랜: 도입 문의 폼으로 이동
      if (onPlanSelect) {
        onPlanSelect(plan.title);
      }
      const contactSection = document.getElementById('contact-form');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // VIP/Gold 스타일은 다른 레이아웃
  if (plan.card_style === 'gold') {
    return (
      <div className={`${getCardClass()} p-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold tracking-wider ${getLabelColor()}`}>{plan.title}</span>
              <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{plan.subtitle}</h3>
            <p className="text-[#FFD700]/80 text-sm">{plan.features?.join(' + ')}</p>
          </div>
          <button onClick={handleButtonClick} className={`shrink-0 ${getButtonClass()}`}>
            {plan.button_text}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardClass()} h-full flex flex-col`}>
      {/* Featured Badge */}
      {plan.is_featured && plan.badge_text && (
        <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black rounded-sm">
          {plan.badge_text}
        </span>
      )}

      {/* Promotion Badge */}
      {promotion && (
        <div className="mb-3">
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded animate-pulse">
            {promotion.badge_text || `${promotion.discount_rate}% OFF`}
          </span>
        </div>
      )}

      {/* Plan Title */}
      <p className={`label-tag mb-4 ${getLabelColor()}`}>{plan.title}</p>

      {/* Price */}
      <div className="mb-1">
        {showStrikethrough && (
          <span className="text-white/40 text-sm line-through mr-2">
            ₩{formatPrice(originalPrice)}
          </span>
        )}
        <h3 className="text-2xl font-bold text-white inline">
          ₩{formatPrice(finalPrice)}{plan.price_suffix}
        </h3>
      </div>

      {/* Subtitle */}
      <p className={`text-sm mb-6 ${plan.card_style === 'purple' ? 'text-purple-300/80' : 'text-white/60'}`}>
        {plan.subtitle}
      </p>

      {/* Features */}
      {plan.card_style === 'purple' ? (
        <ul className="space-y-2 mb-8 flex-1">
          {plan.features?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
              <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="feature-list mb-8 flex-1">
          {plan.features?.map((feature, index) => {
            const isHighlighted = plan.highlighted_features?.includes(index);
            return (
              <li key={index}>
                {isHighlighted ? (
                  <strong className="text-white">{feature}</strong>
                ) : (
                  feature
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Button - 항상 버튼으로 처리 (컨택트 폼 스크롤) */}
      <button onClick={handleButtonClick} className={getButtonClass()}>
        {plan.button_text}
      </button>
    </div>
  );
}
