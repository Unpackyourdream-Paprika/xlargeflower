'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ScrollReveal from '@/components/animations/ScrollReveal';
import VideoMarquee from '@/components/VideoMarquee';
import ArtistLineup from '@/components/ArtistLineup';
import MainHeroContainer from '@/components/hero/MainHeroContainer';
import { getShowcaseVideos, ShowcaseVideo, getBeforeAfterAsset, BeforeAfterAsset, getLandingPortfolios, LandingPortfolio, getActivePromotion, PromotionSettings, getPricingPlans, PricingPlan } from '@/lib/supabase';
import PricingCard from '@/components/PricingCard';
import OrderBottomSheet from '@/components/OrderBottomSheet';
import { trackConversion } from '@/lib/analytics';

export default function Home() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const t = useTranslations('home');
  const tCommon = useTranslations('common');

  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);
  const [landingPortfolios, setLandingPortfolios] = useState<LandingPortfolio[]>([]);
  const [beforeAfterAsset, setBeforeAfterAsset] = useState<BeforeAfterAsset | null>(null);
  const [promotion, setPromotion] = useState<PromotionSettings | null>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  // Bottom sheet / modal state - 기본값 true로 처음부터 표시
  const [showBottomSheet, setShowBottomSheet] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [initialOrderArtist, setInitialOrderArtist] = useState<string>('');
  const [initialOrderPlan, setInitialOrderPlan] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videos, portfolios, beforeAfter, promo, plans] = await Promise.all([
          getShowcaseVideos(),
          getLandingPortfolios(),
          getBeforeAfterAsset(),
          getActivePromotion(),
          getPricingPlans()
        ]);
        console.log('Showcase videos loaded:', videos?.length, videos);
        setShowcaseVideos(videos);
        setLandingPortfolios(portfolios);
        setBeforeAfterAsset(beforeAfter);
        setPromotion(promo);
        setPricingPlans(plans);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // 바텀시트는 항상 표시 (스크롤 리스너 제거)

  // 바텀 시트 열기/닫기
  const openContactModal = () => {
    setIsContactModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    document.body.style.overflow = '';
    setInitialOrderArtist('');
    setInitialOrderPlan('');
  };

  // 아티스트 모델 선택 이벤트 리스너
  useEffect(() => {
    const handleOpenContactWithArtist = (e: CustomEvent<{ artistName: string; noModelNeeded: boolean }>) => {
      const { artistName } = e.detail;
      setInitialOrderArtist(artistName);
      setIsContactModalOpen(true);
      document.body.style.overflow = 'hidden';
    };

    const handleOpenOrderWithPlan = (e: CustomEvent<{ planName: string }>) => {
      const { planName } = e.detail;
      setInitialOrderPlan(planName);
      setIsContactModalOpen(true);
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('openContactWithArtist', handleOpenContactWithArtist as EventListener);
    window.addEventListener('openOrderWithPlan', handleOpenOrderWithPlan as EventListener);
    return () => {
      window.removeEventListener('openContactWithArtist', handleOpenContactWithArtist as EventListener);
      window.removeEventListener('openOrderWithPlan', handleOpenOrderWithPlan as EventListener);
    };
  }, []);

  // 가격 계산 (프로모션 할인 적용)
  const getPrice = (basePrice: number) => {
    let price = basePrice;

    // 프로모션 할인 적용
    if (promotion) {
      price = Math.round(price * (100 - promotion.discount_rate) / 100);
    }

    return price;
  };

  // 원래 가격 (취소선에 표시할 가격)
  const getOriginalPrice = (basePrice: number) => {
    return basePrice;
  };

  const formatPrice = (price: number, isManwon: boolean = false) => {
    if (locale === 'ko') {
      // 한국어: 만원 단위 표시
      return new Intl.NumberFormat('ko-KR').format(price);
    } else if (locale === 'ja') {
      // 일본어: 엔화 표시 (원화와 유사한 가격대 사용)
      const yenPrice = isManwon ? price * 10000 : price;
      return `¥${new Intl.NumberFormat('ja-JP').format(Math.round(yenPrice / 10))}`;
    } else {
      // 영어: 달러 표시 (1 USD ≈ 1,400 KRW 기준)
      const usdPrice = isManwon ? price * 10000 : price;
      return `$${new Intl.NumberFormat('en-US').format(Math.round(usdPrice / 1400))}`;
    }
  };

  // 프로모션 종료 날짜 포맷
  const formatEndDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 최저가 계산 (프로모션 할인 적용된 가장 저렴한 플랜)
  const getLowestPrice = () => {
    if (pricingPlans.length === 0) {
      // 플랜 데이터가 없으면 기본값 (STARTER 500,000원 기준)
      return getPrice(500000);
    }
    // gold 스타일(VIP) 제외하고 최저가 찾기
    const regularPlans = pricingPlans.filter(p => p.card_style !== 'gold');
    if (regularPlans.length === 0) return getPrice(500000);

    const lowestPlan = regularPlans.reduce((min, plan) =>
      plan.price < min.price ? plan : min
    );
    console.log('Lowest plan:', lowestPlan.title, lowestPlan.price, '→', getPrice(lowestPlan.price));
    return getPrice(lowestPlan.price);
  };

  return (
    <div className="min-h-screen bg-[#050505] main-content">
      {/* Hero Section - Dynamic Layout */}
      <MainHeroContainer />

      {/* Comparison Section - 기존 촬영 vs XLARGE AI */}
      <section id="comparison" className="py-16 md:py-24 bg-[var(--bg-primary)]" data-section="comparison">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="label-tag mb-4">{t('comparison.label')}</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                {t('comparison.title')}
              </h2>
              <p className="text-[var(--text-secondary)] mt-4">
                {t('comparison.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            {/* 비교표 */}
            <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--bg-elevated)]">
                    <th className="py-4 px-4 md:px-6 text-left text-[var(--text-secondary)] text-sm font-medium w-1/3">{t('comparison.columnItem')}</th>
                    <th className="py-4 px-4 md:px-6 text-center text-red-500 text-sm font-medium w-1/3">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t('comparison.columnTraditional')}
                      </div>
                    </th>
                    <th className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] text-sm font-medium w-1/3">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {t('comparison.columnXlarge')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-[var(--border-default)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowCost')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowCostTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">
                      {locale === 'ko'
                        ? `${formatPrice(getLowestPrice() / 10000)}${t('comparison.rowCostXlargeUnit')}`
                        : `${formatPrice(getLowestPrice(), false)}${t('comparison.rowCostXlargeUnit')}`
                      }
                    </td>
                  </tr>
                  <tr className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowTime')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowTimeTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">{t('comparison.rowTimeXlarge')}</td>
                  </tr>
                  <tr className="border-t border-[var(--border-default)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowFailure')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowFailureTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">{t('comparison.rowFailureXlarge')}</td>
                  </tr>
                  <tr className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowRisk')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowRiskTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">{t('comparison.rowRiskXlarge')}</td>
                  </tr>
                  <tr className="border-t border-[var(--border-default)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowCopyright')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowCopyrightTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">{t('comparison.rowCopyrightXlarge')}</td>
                  </tr>
                  <tr className="border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
                    <td className="py-4 px-4 md:px-6 text-[var(--text-primary)] font-medium">{t('comparison.rowTests')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--text-secondary)]">{t('comparison.rowTestsTraditional')}</td>
                    <td className="py-4 px-4 md:px-6 text-center text-[var(--color-accent-start)] font-bold">{t('comparison.rowTestsXlarge')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 핵심 메시지 */}
            <div className="mt-8 text-center">
              <div className="inline-block px-6 py-4 bg-[var(--color-accent-start)]/10 border border-[var(--color-accent-start)]/30 rounded-xl">
                <p className="text-[var(--text-primary)] font-bold text-lg md:text-xl">
                  <span className="gradient-text">{t('comparison.bottomMessage')}</span>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* AI Video Showcase - Video Wall */}
      <VideoMarquee videos={showcaseVideos} />

      {/* AI Artist Lineup Section */}
      <ArtistLineup />

      {/* Before & After Section */}
      <section className="section-spacing bg-[#050505]" data-section="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="label-tag mb-4">{t('howItWorks.label')}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                <span className="block">{t('howItWorks.title1')}</span>
                <span className="block">{t('howItWorks.title2')}</span>
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative max-w-6xl mx-auto">
              {/* Processing Line - 연결 라인 (desktop only) */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-40 -translate-x-1/2 z-10">
                {/* Dashed line background */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2">
                  <div className="w-full h-full border-t-2 border-dashed border-[#00F5A0]/30"></div>
                </div>
                {/* Animated glow line */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent animate-pulse opacity-60"></div>
                </div>
              </div>

              {/* Arrow in the middle (desktop only) - with pulse animation */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                {/* Outer pulse ring */}
                <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 animate-ping"></div>
                {/* Second pulse ring */}
                <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-gradient-to-r from-[#00F5A0]/10 to-[#00D9F5]/10 animate-pulse"></div>
                {/* Main button */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center shadow-[0_0_40px_rgba(0,245,160,0.5)]">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-40 items-stretch">
                {/* Input */}
                <div className="relative">
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="label-tag px-4 py-1.5 bg-[#0A0A0A]">{t('howItWorks.rawInput')}</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-8 h-full hover:grayscale transition-all duration-500">
                    <div className="aspect-video bg-[#111111] rounded-lg overflow-hidden mb-6">
                      <img
                        src={beforeAfterAsset?.before_image_url || '/images/nikedunk.webp'}
                        alt={t('howItWorks.originalPhoto')}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white font-bold text-center text-lg">{t('howItWorks.originalPhoto')}</p>
                    <p className="text-white/40 text-sm text-center mt-2">{t('howItWorks.phoneOk')}</p>
                  </div>
                </div>

                {/* Mobile Arrow */}
                <div className="flex md:hidden justify-center -my-2">
                  <div className="relative">
                    <div className="absolute inset-0 w-14 h-14 -m-1 rounded-full bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 animate-ping"></div>
                    <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center shadow-[0_0_30px_rgba(0,245,160,0.4)]">
                      <svg className="w-6 h-6 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Output */}
                <div className="relative">
                  <div className="absolute -top-3 left-6 z-10">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white text-xs font-bold tracking-wide rounded-sm shadow-[0_0_20px_rgba(0,245,160,0.3)]">
                      {t('howItWorks.renderedOutput')}
                    </span>
                  </div>
                  <div className="relative h-full rounded-xl overflow-hidden">
                    {/* Glassmorphism background with stronger glow */}
                    <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm border-2 border-[#00F5A0]/40 rounded-xl shadow-[0_0_60px_rgba(0,245,160,0.15),inset_0_0_60px_rgba(0,245,160,0.05)]"></div>
                    <div className="relative p-8">
                      <div className="aspect-video rounded-lg overflow-hidden relative group shadow-[0_0_40px_rgba(0,245,160,0.2)]">
                        {/* WebP 썸네일 먼저 표시, 그 위에 비디오 */}
                        {beforeAfterAsset?.after_video_webp_url && (
                          <img
                            src={beforeAfterAsset.after_video_webp_url}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        )}
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover relative z-10"
                          src={beforeAfterAsset?.after_video_url || 'https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-bowl-with-cereals-seen-up-42017-large.mp4'}
                        />
                        {/* Video indicator */}
                        <div className="absolute top-3 right-3 z-20">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white text-xs font-bold rounded shadow-lg">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex gap-2 z-20">
                          <span className="px-2.5 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">6s</span>
                          <span className="px-2.5 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">15s</span>
                          <span className="px-2.5 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">30s</span>
                        </div>
                      </div>
                      <div className="text-center mt-6">
                        <p className="text-white font-bold text-lg">{t('howItWorks.completed48h')}</p>
                        <p className="text-white/40 text-sm mt-2">{t('howItWorks.readyForAds')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 제작 프로세스 설명 - STEP 형식 */}
              <div className="mt-12 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* STEP 1 */}
                  <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 text-center hover:border-[#00F5A0]/30 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold text-lg mb-4">
                      1
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{t('howItWorks.step1Title')}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('howItWorks.step1Desc1')}<br />
                      <strong className="text-white">{t('howItWorks.step1Desc2')}</strong><br />
                      {t('howItWorks.step1Desc3')}
                    </p>
                  </div>

                  {/* STEP 2 */}
                  <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 text-center hover:border-[#00F5A0]/30 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold text-lg mb-4">
                      2
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{t('howItWorks.step2Title')}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('howItWorks.step2Desc1')}<br />
                      <strong className="text-[#00F5A0]">{t('howItWorks.step2Desc2')}</strong><br />
                      {t('howItWorks.step2Desc3')}
                    </p>
                  </div>

                  {/* STEP 3 */}
                  <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 text-center hover:border-[#00F5A0]/30 transition-colors">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold text-lg mb-4">
                      3
                    </div>
                    <h4 className="text-white font-bold text-lg mb-2">{t('howItWorks.step3Title')}</h4>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {t('howItWorks.step3Desc1')}<br />
                      <strong className="text-[#00F5A0]">{t('howItWorks.step3Desc2')}</strong><br />
                      {t('howItWorks.step3Desc3')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Features - 크게 강조 */}
          <ScrollReveal delay={0.3}>
            <div className="mt-24 md:mt-32 flex flex-wrap justify-center gap-12 sm:gap-16 md:gap-24 lg:gap-32 text-center">
              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
                    }}
                  >
                    {t('howItWorks.stat1Value')}
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">{t('howItWorks.stat1Label')}</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
                    }}
                  >
                    {t('howItWorks.stat2Value')}
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">{t('howItWorks.stat2Label')}</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
                    }}
                  >
                    {t('howItWorks.stat3Value')}
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">{t('howItWorks.stat3Label')}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Real Portfolio / Case Study Section - DB 연동 */}
      <section data-section="portfolio" className="section-spacing bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">{t('portfolio.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                <span className="block">{t('portfolio.title1')}</span>
                <span className="gradient-text">{t('portfolio.title2')}</span>
              </h2>
              <p className="text-white/60 mt-4">
                {t('portfolio.subtitle')}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* DB 데이터 사용하되, en/ja는 텍스트만 번역 적용 (video_url 등은 DB 값 유지) */}
            {(landingPortfolios.length > 0 ? landingPortfolios.map((item, idx) => {
              // 한국어가 아닌 경우 번역된 텍스트 사용 (video_url, thumbnail_url은 DB 값 유지)
              if (locale !== 'ko') {
                const fallbackKey = `fallback${idx + 1}` as 'fallback1' | 'fallback2' | 'fallback3';
                return {
                  ...item,
                  client_name: t(`portfolio.${fallbackKey}.client`),
                  category: t(`portfolio.${fallbackKey}.category`),
                  campaign_date: t(`portfolio.${fallbackKey}.date`),
                  title: t(`portfolio.${fallbackKey}.title`),
                  description: t(`portfolio.${fallbackKey}.description`),
                  metric_1_value: t(`portfolio.${fallbackKey}.metric1Value`),
                  metric_1_label: t(`portfolio.${fallbackKey}.metric1Label`),
                  metric_2_value: t(`portfolio.${fallbackKey}.metric2Value`),
                  metric_2_label: t(`portfolio.${fallbackKey}.metric2Label`),
                };
              }
              return item;
            }) : [
              // DB가 비었을 때만 사용하는 fallback (video 없음)
              {
                id: 'fallback-1',
                client_name: t('portfolio.fallback1.client'),
                category: t('portfolio.fallback1.category'),
                category_color: '#FF69B4',
                campaign_date: t('portfolio.fallback1.date'),
                title: t('portfolio.fallback1.title'),
                description: t('portfolio.fallback1.description'),
                metric_1_value: t('portfolio.fallback1.metric1Value'),
                metric_1_label: t('portfolio.fallback1.metric1Label'),
                metric_2_value: t('portfolio.fallback1.metric2Value'),
                metric_2_label: t('portfolio.fallback1.metric2Label'),
                video_url: '',
                thumbnail_url: '',
                sort_order: 0,
                is_active: true
              },
              {
                id: 'fallback-2',
                client_name: t('portfolio.fallback2.client'),
                category: t('portfolio.fallback2.category'),
                category_color: '#FFA500',
                campaign_date: t('portfolio.fallback2.date'),
                title: t('portfolio.fallback2.title'),
                description: t('portfolio.fallback2.description'),
                metric_1_value: t('portfolio.fallback2.metric1Value'),
                metric_1_label: t('portfolio.fallback2.metric1Label'),
                metric_2_value: t('portfolio.fallback2.metric2Value'),
                metric_2_label: t('portfolio.fallback2.metric2Label'),
                video_url: '',
                thumbnail_url: '',
                sort_order: 1,
                is_active: true
              },
              {
                id: 'fallback-3',
                client_name: t('portfolio.fallback3.client'),
                category: t('portfolio.fallback3.category'),
                category_color: '#9B59B6',
                campaign_date: t('portfolio.fallback3.date'),
                title: t('portfolio.fallback3.title'),
                description: t('portfolio.fallback3.description'),
                metric_1_value: t('portfolio.fallback3.metric1Value'),
                metric_1_label: t('portfolio.fallback3.metric1Label'),
                metric_2_value: t('portfolio.fallback3.metric2Value'),
                metric_2_label: t('portfolio.fallback3.metric2Label'),
                video_url: '',
                thumbnail_url: '',
                sort_order: 2,
                is_active: true
              }
            ] as LandingPortfolio[]).map((item, index) => (
              <ScrollReveal key={item.id} delay={0.1 * (index + 1)} direction="up">
                <div className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00F5A0]/30 transition-all duration-300">
                  {/* Video/Image Area - 1:1 비율 */}
                  <div className="relative aspect-square overflow-hidden bg-[#111]">
                    {item.video_url ? (
                      <video
                        src={item.video_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-[#00F5A0]/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-[#00F5A0]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10 pointer-events-none" />

                    {/* Client Name */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-xs font-bold tracking-wider">{item.client_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="px-2 py-1 text-xs font-bold rounded"
                        style={{
                          backgroundColor: item.category_color ? `${item.category_color}20` : 'rgba(0, 245, 160, 0.1)',
                          color: item.category_color || '#00F5A0'
                        }}
                      >
                        {item.category}
                      </span>
                      {item.campaign_date && (
                        <span className="text-white/40 text-xs">{item.campaign_date}</span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-white/60 text-sm mb-4">{item.description}</p>

                    {/* Stats */}
                    {(item.metric_1_value || item.metric_2_value) && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        {item.metric_1_value && (
                          <div>
                            <p className="text-2xl font-bold gradient-text">{item.metric_1_value}</p>
                            <p className="text-white/40 text-xs">{item.metric_1_label}</p>
                          </div>
                        )}
                        {item.metric_2_value && (
                          <div>
                            <p className="text-2xl font-bold gradient-text">{item.metric_2_value}</p>
                            <p className="text-white/40 text-xs">{item.metric_2_label}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* CTA */}
          <ScrollReveal delay={0.4}>
            <div className="mt-12 text-center">
              <Link href={`/${locale}/portfolio`} className="btn-secondary inline-flex items-center gap-2">
                {t('portfolio.viewAll')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section - Premium */}
      <section data-section="pricing" className="section-spacing bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="label-tag mb-4">{t('pricing.label')}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('pricing.title')}</h2>
              <p className="text-white/60 mt-4">{t('pricing.subtitle')}</p>
            </div>
          </ScrollReveal>

          {/* DB에서 가져온 플랜 사용, 없으면 기본 플랜 표시 */}
          {pricingPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.filter(p => p.card_style !== 'gold').map((plan, index) => (
                <ScrollReveal key={plan.id} delay={0.1 * (index + 1)} direction="up">
                  <PricingCard plan={plan} promotion={promotion} locale={locale} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Fallback: 하드코딩 플랜 (DB 데이터가 없을 때) */}
              {/* STARTER */}
              <ScrollReveal delay={0.1} direction="up">
                <div className="card h-full flex flex-col">
                  {promotion && (
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded animate-pulse">
                        {promotion.badge_text || `${promotion.discount_rate}% OFF`}
                      </span>
                    </div>
                  )}
                  <p className="label-tag mb-4">{t('fallbackPlans.starter.name')}</p>
                  <div className="mb-1">
                    {promotion && (
                      <span className="text-white/40 text-sm line-through mr-2">₩{formatPrice(getOriginalPrice(3300000))}</span>
                    )}
                    <h3 className="text-2xl font-bold text-white inline">
                      ₩{formatPrice(getPrice(3300000))}~
                    </h3>
                    <span className="text-white/40 text-xs ml-1">(VAT)</span>
                  </div>
                  <p className="text-white/60 text-sm mb-6">{t('fallbackPlans.starter.description')}</p>
                  <ul className="feature-list mb-8 flex-1">
                    <li>{t('fallbackPlans.starter.feature1')}</li>
                    <li>{t('fallbackPlans.starter.feature2')}</li>
                    <li>{t('fallbackPlans.starter.feature3')}</li>
                    <li>{t('fallbackPlans.starter.feature4')}</li>
                  </ul>
                  <Link href="/contact?product=STARTER" className="btn-secondary w-full text-center block">
                    {t('pricing.startButton')}
                  </Link>
                </div>
              </ScrollReveal>

              {/* GROWTH */}
              <ScrollReveal delay={0.2} direction="up">
                <div className="card-featured relative h-full flex flex-col">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black rounded-sm whitespace-nowrap">
                    {t('pricing.bestChoice')}
                  </span>
                  {promotion && (
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded animate-pulse">
                        {promotion.badge_text || `${promotion.discount_rate}% OFF`}
                      </span>
                    </div>
                  )}
                  <p className="label-tag mb-4">{t('fallbackPlans.growth.name')}</p>
                  <div className="mb-1">
                    {promotion && (
                      <span className="text-white/40 text-sm line-through mr-2">₩{formatPrice(getOriginalPrice(5500000))}</span>
                    )}
                    <h3 className="text-2xl font-bold text-white inline">
                      ₩{formatPrice(getPrice(5500000))}
                    </h3>
                    <span className="text-white/40 text-xs ml-1">(VAT)</span>
                  </div>
                  <p className="text-white/60 text-sm mb-6">{t('fallbackPlans.growth.description')}</p>
                  <ul className="feature-list mb-8 flex-1">
                    <li><strong className="text-white">{t('fallbackPlans.growth.feature1')}</strong> {t('fallbackPlans.growth.feature1Sub')}</li>
                    <li><strong className="text-white">{t('fallbackPlans.growth.feature2')}</strong> {t('fallbackPlans.growth.feature2Sub')}</li>
                    <li><strong className="text-[#00F5A0]">{t('fallbackPlans.growth.feature3')}</strong></li>
                    <li>{t('fallbackPlans.growth.feature4')}</li>
                    <li>{t('fallbackPlans.growth.feature5')}</li>
                  </ul>
                  <Link href="/contact?product=GROWTH" className="btn-primary w-full text-center block">
                    {t('pricing.startButton')}
                  </Link>
                </div>
              </ScrollReveal>

              {/* PERFORMANCE */}
              <ScrollReveal delay={0.3} direction="up">
                <div className="card h-full flex flex-col border-[#00D9F5]/30">
                  {promotion && (
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded animate-pulse">
                        {promotion.badge_text || `${promotion.discount_rate}% OFF`}
                      </span>
                    </div>
                  )}
                  <p className="label-tag mb-4 text-[#00D9F5]">{t('fallbackPlans.performance.name')}</p>
                  <div className="mb-1">
                    {promotion && (
                      <span className="text-white/40 text-sm line-through mr-2">₩{formatPrice(getOriginalPrice(9000000))}</span>
                    )}
                    <h3 className="text-2xl font-bold text-white inline">
                      ₩{formatPrice(getPrice(9000000))}
                    </h3>
                    <span className="text-white/40 text-xs ml-1">(VAT)</span>
                  </div>
                  <p className="text-white/60 text-sm mb-6">{t('fallbackPlans.performance.description')}</p>
                  <ul className="feature-list mb-8 flex-1">
                    <li><strong className="text-white">{t('fallbackPlans.performance.feature1')}</strong> {t('fallbackPlans.performance.feature1Sub')}</li>
                    <li>{t('fallbackPlans.performance.feature2')}</li>
                    <li><strong className="text-[#00F5A0]">{t('fallbackPlans.performance.feature3')}</strong></li>
                    <li>{t('fallbackPlans.performance.feature4')}</li>
                    <li>{t('fallbackPlans.performance.feature5')}</li>
                  </ul>
                  <Link href="/contact?product=PERFORMANCE" className="btn-secondary w-full text-center block">
                    {t('pricing.startButton')}
                  </Link>
                </div>
              </ScrollReveal>

              {/* PERFORMANCE ADS */}
              <ScrollReveal delay={0.4} direction="up">
                <div className="card h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border-purple-500/40">
                  {promotion && (
                    <div className="mb-3">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded animate-pulse">
                        {promotion.badge_text || `${promotion.discount_rate}% OFF`}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-purple-400 text-xs font-bold tracking-wider">{t('fallbackPlans.performanceAds.name')}</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded">NEW</span>
                  </div>
                  <div className="mb-1">
                    {promotion && (
                      <span className="text-white/40 text-sm line-through mr-2">₩{formatPrice(getOriginalPrice(15000000))}~</span>
                    )}
                    <h3 className="text-2xl font-bold text-white inline">
                      ₩{formatPrice(getPrice(15000000))}~
                    </h3>
                    <span className="text-white/40 text-xs ml-1">(VAT)</span>
                  </div>
                  <p className="text-purple-300/80 text-sm mb-6">{t('fallbackPlans.performanceAds.description')}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong className="text-white">{t('fallbackPlans.performanceAds.feature1')}</strong></span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('fallbackPlans.performanceAds.feature2')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span><strong className="text-purple-300">{t('fallbackPlans.performanceAds.feature3')}</strong></span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('fallbackPlans.performanceAds.feature4')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{t('fallbackPlans.performanceAds.feature5')}</span>
                    </li>
                  </ul>
                  <p className="text-xs text-white/40 mb-4 text-center">{t('fallbackPlans.performanceAds.notice')}</p>
                  <Link href="/contact?product=PERFORMANCE_ADS" className="block w-full text-center py-3 rounded-full font-medium bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:opacity-90 transition-all">
                    {t('pricing.startButton')}
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          )}

          {/* VIP 플랜 (DB에서 gold 스타일인 것 또는 fallback) */}
          {pricingPlans.filter(p => p.card_style === 'gold').map((plan) => (
            <ScrollReveal key={plan.id} delay={0.5}>
              <div className="mt-8">
                <PricingCard plan={plan} promotion={promotion} locale={locale} />
              </div>
            </ScrollReveal>
          ))}

          {/* VIP PARTNER - Full Width */}
          <ScrollReveal delay={0.5}>
            <div className="mt-8 bg-gradient-to-r from-[#1a1a1a] via-[#111] to-[#1a1a1a] border border-[#B8860B]/40 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#FFD700] text-xs font-bold tracking-wider">{t('vipPartner.label')}</span>
                    <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{t('vipPartner.title')}</h3>
                  <p className="text-[#FFD700]/80 text-sm">{t('vipPartner.description')}</p>
                </div>
                <Link href="/contact" className="shrink-0 inline-block text-center px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black hover:opacity-90 transition-all">
                  {t('pricing.vipConnect')}
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* VAT Notice */}
          <p className="text-center text-white/40 text-sm mt-8">
            {t('pricing.vatNotice')}
          </p>
        </div>
      </section>

      {/* Final CTA Section - 긴급성 강조 */}
      <section data-section="final-cta" className="py-16 md:py-24 bg-[var(--bg-elevated)] border-t border-[var(--border-default)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            {/* 긴급성 배지 */}
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-red-500/20 border border-red-500/40 text-red-500 text-sm font-bold rounded-full animate-pulse">
                {t('finalCtaSection.urgencyBadge')}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-4" style={{ wordBreak: 'keep-all' }}>
              {t('finalCtaSection.title1')}<br className="md:hidden" /> <span className="gradient-text">{t('finalCtaSection.title2')}</span> {t('finalCtaSection.title3')}
            </h2>
            <p className="text-[var(--text-secondary)] text-base md:text-lg mb-4 max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
              {t('finalCtaSection.subtitle1')}<br />
              <strong className="text-[var(--text-primary)]">{t('finalCtaSection.subtitle2')}</strong>
            </p>
            <p className="gradient-text text-sm mb-8 font-medium">
              {t('finalCtaSection.message')}
            </p>

            {/* Contact Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* Phone Number */}
              <a
                href="tel:02-3142-7218"
                className="btn-primary inline-flex items-center justify-center gap-3 px-8 py-5 text-xl md:text-2xl rounded-2xl"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {t('finalCta.phone')}
              </a>

              {/* KakaoTalk Chat */}
              <a
                href="http://pf.kakao.com/_lhqhX/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#FEE500] text-[#3C1E1E] font-bold text-xl md:text-2xl rounded-2xl hover:opacity-90 transition-all shadow-[0_0_30px_rgba(254,229,0,0.3)] hover:shadow-[0_0_50px_rgba(254,229,0,0.5)]"
              >
                <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.654 1.75 4.984 4.375 6.313-.137.48-.885 3.095-.915 3.31 0 0-.019.152.08.21.098.059.213.013.213.013.281-.039 3.252-2.127 3.765-2.49.78.117 1.593.178 2.482.178 5.523 0 10-3.463 10-7.534C22 6.463 17.523 3 12 3z"/>
                </svg>
                {t('finalCta.kakao')}
              </a>
            </div>

            <p className="text-[var(--text-muted)] text-sm mt-6">
              {t('finalCta.notice')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Sticky Mobile CTA - 48시간 강조 */}
      <div className={`sticky-mobile-cta transition-transform duration-300 ${showBottomSheet ? 'translate-y-0' : 'translate-y-full'}`}>
        <button
          onClick={() => {
            trackConversion.consultClick('sticky_mobile_cta');
            openContactModal();
          }}
          className="btn-primary w-full text-center font-bold"
        >
          {t('stickyCta')}
        </button>
      </div>

      {/* Order Bottom Sheet Modal */}
      <OrderBottomSheet
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
        pricingPlans={pricingPlans}
        initialArtist={initialOrderArtist}
        initialPlan={initialOrderPlan}
        promotion={promotion}
        locale={locale}
      />
    </div>
  );
}
