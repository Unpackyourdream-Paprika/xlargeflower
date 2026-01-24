'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { triggerOpenChat } from '@/components/GlobalChatButton';
import { getActivePromotion, PromotionSettings, getPricingPlans, PricingPlan } from '@/lib/supabase';
import PricingCard from '@/components/PricingCard';

export default function ProductsPage() {
  const t = useTranslations('products');
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
          <p className="label-tag mb-4">{t('label')}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
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
              <PricingCard key={plan.id} plan={plan} promotion={promotion} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            {t('loadingPlans')}
          </div>
        )}

        {/* VIP 플랜 (gold 스타일) */}
        {pricingPlans.filter(p => p.card_style === 'gold').map((plan) => (
          <div key={plan.id} className="mb-8">
            <PricingCard plan={plan} promotion={promotion} />
          </div>
        ))}

        {/* VAT Notice */}
        <p className="text-center text-white/40 text-sm mb-16">
          {t('vatNotice')}
        </p>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t('faqTitle')}</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">{t('faq.q1')}</h3>
              <p className="text-gray-400 text-sm">
                {t('faq.a1')}
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">{t('faq.q2')}</h3>
              <p className="text-gray-400 text-sm">
                {t('faq.a2')}
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">{t('faq.q3')}</h3>
              <p className="text-gray-400 text-sm">
                {t('faq.a3')}
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">{t('faq.q4')}</h3>
              <p className="text-gray-400 text-sm">
                {t('faq.a4')}
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">{t('faq.q5')}</h3>
              <p className="text-gray-400 text-sm">
                {t('faq.a5')}
              </p>
            </div>
          </div>
        </section>

        {/* CTA - 다크/라이트 모드 대응 */}
        <div className="text-center p-12 bg-gradient-to-b from-gray-100 to-white dark:from-[#111] dark:to-[#0A0A0A] border border-gray-200 dark:border-[#333] rounded-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {t('ctaSubtitle')}
          </p>
          <button
            onClick={() => triggerOpenChat('vip_consult')}
            className="btn-primary inline-flex items-center gap-2"
          >
            {t('ctaButton')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
