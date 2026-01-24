'use client';

import { useState, useEffect } from 'react';
import { triggerOpenChat } from '@/components/GlobalChatButton';
import { getActivePromotion, PromotionSettings, getPricingPlans, PricingPlan } from '@/lib/supabase';
import PricingCard from '@/components/PricingCard';

export default function ProductsPage() {
  const [paymentType, setPaymentType] = useState<'card' | 'invoice'>('card');
  const [promotion, setPromotion] = useState<PromotionSettings | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promo, plans] = await Promise.all([
          getActivePromotion(),
          getPricingPlans()
        ]);
        setPromotion(promo);
        setPricingPlans(plans);
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="label-tag mb-4">AI 모델 도입 비용 안내</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            모델 섭외비 0원, 스튜디오 비용 0원
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            단 한 번의 결제로, 추가 비용 없이 평생 소장하세요.
          </p>
        </div>

        {/* 결제 방식 토글 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 p-1 bg-[#111] rounded-full border border-[#333]">
            <button
              onClick={() => setPaymentType('card')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                paymentType === 'card'
                  ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              카드 결제
            </button>
            <button
              onClick={() => setPaymentType('invoice')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                paymentType === 'invoice'
                  ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              세금계산서
              <span className="ml-1 text-[10px] text-[#00F5A0]">10% 할인</span>
            </button>
          </div>
        </div>

        {/* Promotion Banner */}
        {promotion && (
          <div className="mb-8 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl text-center">
            <span className="text-yellow-400 font-bold">{promotion.badge_text || `${promotion.discount_rate}% 할인`}</span>
            <span className="text-gray-300 ml-2">{promotion.title}</span>
          </div>
        )}

        {/* Products Grid - DB에서 가져온 플랜 사용 */}
        {pricingPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pricingPlans.filter(p => p.card_style !== 'gold').map((plan) => (
              <PricingCard key={plan.id} plan={plan} promotion={promotion} paymentType={paymentType} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            플랜 정보를 불러오는 중...
          </div>
        )}

        {/* VIP 플랜 (gold 스타일) */}
        {pricingPlans.filter(p => p.card_style === 'gold').map((plan) => (
          <div key={plan.id} className="mb-8">
            <PricingCard plan={plan} promotion={promotion} paymentType={paymentType} />
          </div>
        ))}

        {/* VAT Notice */}
        <p className="text-center text-white/40 text-sm mb-16">
          ※ 모든 금액은 VAT 별도이며, 착수금 50% 납입 시 프로젝트가 시작됩니다.
        </p>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">자주 묻는 질문</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">AI가 만든 영상이 진짜 사람 같나요?</h3>
              <p className="text-gray-400 text-sm">
                네, 최신 AI 기술로 제작된 영상은 실제 모델 촬영과 구분이 어려울 정도의 퀄리티입니다. 포트폴리오에서 직접 확인하실 수 있으며, 실제 광고에서 높은 성과를 내고 있습니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">저작권이나 초상권 문제는 없나요?</h3>
              <p className="text-gray-400 text-sm">
                AI로 생성된 가상 인물이므로 초상권 문제가 없습니다. 라이선스 기간 내 무제한 사용 가능하며, 영구 소장 라이선스 선택 시 평생 사용하실 수 있습니다. 인플루언서 스캔들 리스크도 0%입니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">수정은 어떻게 되나요?</h3>
              <p className="text-gray-400 text-sm">
                패키지별로 수정 횟수가 포함되어 있으며, 자막/텍스트 변경, 색상 조정, 길이 편집 등이 가능합니다. VIP PARTNER 플랜은 수정 5회가 지원됩니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">영구 소장 라이선스란 무엇인가요?</h3>
              <p className="text-gray-400 text-sm">
                한 번 결제로 제작된 영상을 평생 사용하실 수 있습니다. 재계약이나 추가 비용 없이 모든 광고 채널(메타, 구글, 틱톡 등)에서 무제한 노출 가능합니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">어떤 결제 방식을 지원하나요?</h3>
              <p className="text-gray-400 text-sm">
                전 세계 어디서든 결제 가능한 글로벌 PG(Stripe)와 국내 계좌이체를 지원합니다. 복잡한 절차 없이 법인/개인 카드로 즉시 결제가 가능하며, 고액 건의 경우 담당 매니저를 통해 세금계산서 발행 및 입금 처리를 도와드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA - 다크/라이트 모드 대응 */}
        <div className="text-center p-12 bg-gradient-to-b from-gray-100 to-white dark:from-[#111] dark:to-[#0A0A0A] border border-gray-200 dark:border-[#333] rounded-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">어떤 플랜이 적합할지 고민되시나요?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            전문 컨설턴트가 귀사의 니즈를 분석하여 최적의 솔루션을 제안드립니다.
          </p>
          <button
            onClick={() => triggerOpenChat('vip_consult')}
            className="btn-primary inline-flex items-center gap-2"
          >
            VIP 상담 신청하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
