'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/animations/ScrollReveal';
import VideoMarquee from '@/components/VideoMarquee';
import ArtistLineup from '@/components/ArtistLineup';
import MainHeroContainer from '@/components/hero/MainHeroContainer';
import { triggerOpenChat } from '@/components/GlobalChatButton';
import { getShowcaseVideos, ShowcaseVideo, getBeforeAfterAsset, BeforeAfterAsset, getLandingPortfolios, LandingPortfolio } from '@/lib/supabase';

export default function Home() {
  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);
  const [landingPortfolios, setLandingPortfolios] = useState<LandingPortfolio[]>([]);
  const [beforeAfterAsset, setBeforeAfterAsset] = useState<BeforeAfterAsset | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'invoice'>('card');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videos, portfolios, beforeAfter] = await Promise.all([
          getShowcaseVideos(),
          getLandingPortfolios(),
          getBeforeAfterAsset()
        ]);
        setShowcaseVideos(videos);
        setLandingPortfolios(portfolios);
        setBeforeAfterAsset(beforeAfter);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // 가격 계산 (세금계산서 발행 시 10% 할인)
  const getPrice = (basePrice: number) => {
    if (paymentType === 'invoice') {
      return Math.round(basePrice * 0.9);
    }
    return basePrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };
  return (
    <div className="min-h-screen bg-[#050505] main-content">
      {/* Hero Section - Dynamic Layout */}
      <MainHeroContainer />

      {/* AI Video Showcase - Video Wall */}
      <VideoMarquee videos={showcaseVideos} />

      {/* AI Artist Lineup Section */}
      <ArtistLineup />

      {/* Before & After Section */}
      <section className="section-spacing bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-20">
              <p className="label-tag mb-4">HOW IT WORKS</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                원본 사진이 광고 영상이 된다
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
                    <span className="label-tag px-4 py-1.5 bg-[#0A0A0A]">RAW INPUT</span>
                  </div>
                  <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-8 h-full hover:grayscale transition-all duration-500">
                    <div className="aspect-video bg-[#111111] rounded-lg overflow-hidden mb-6">
                      <img
                        src={beforeAfterAsset?.before_image_url || '/images/nikedunk.webp'}
                        alt="원본 제품 사진"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-white font-bold text-center text-lg">원본 사진</p>
                    <p className="text-white/40 text-sm text-center mt-2">폰 촬영 OK</p>
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
                      RENDERED OUTPUT
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
                        <p className="text-white font-bold text-lg">48시간 완성</p>
                        <p className="text-white/40 text-sm mt-2">바로 광고 송출 가능</p>
                      </div>
                    </div>
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
                    0원
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">촬영 비용</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
                    }}
                  >
                    48h
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">평균 납품</p>
              </div>
              <div>
                <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5)',
                    }}
                  >
                    무제한
                  </span>
                </p>
                <p className="text-white/60 text-base sm:text-lg md:text-xl mt-3">바리에이션</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Real Portfolio / Case Study Section - DB 연동 */}
      <section className="section-spacing bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">REAL PORTFOLIO</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                이미 상위 1% 브랜드는<br />
                <span className="gradient-text">XLARGE와 함께 매출을 올리고 있습니다</span>
              </h2>
              <p className="text-white/60 mt-4">가상 얼굴로 만든 실제 성공 사례를 확인하세요</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(landingPortfolios.length > 0 ? landingPortfolios : [
              // 폴백 데이터: DB에 데이터가 없을 때 기본 카드 표시
              {
                id: 'fallback-1',
                client_name: 'BEAUTY D사',
                category: '뷰티',
                category_color: '#FF69B4',
                campaign_date: '2024.12 캠페인',
                title: '인플루언서 대비 ROAS 3배 달성',
                description: '기존 인플루언서 협찬 대비 동일 매체비로 전환율 3배 상승',
                metric_1_value: '+312%',
                metric_1_label: 'ROAS 상승',
                metric_2_value: '₩4,200',
                metric_2_label: 'CPA 달성',
                video_url: '',
                thumbnail_url: '',
                sort_order: 0,
                is_active: true
              },
              {
                id: 'fallback-2',
                client_name: 'F&B M사',
                category: 'F&B',
                category_color: '#FFA500',
                campaign_date: '2025.01 캠페인',
                title: 'CPA 67% 절감, 매출 2.5배',
                description: '15,000원 → 5,000원 CPA 하락, 월 매출 2.5배 성장',
                metric_1_value: '-67%',
                metric_1_label: 'CPA 절감',
                metric_2_value: '2.5x',
                metric_2_label: '매출 성장',
                video_url: '',
                thumbnail_url: '',
                sort_order: 1,
                is_active: true
              },
              {
                id: 'fallback-3',
                client_name: 'D2C C사',
                category: 'D2C',
                category_color: '#9B59B6',
                campaign_date: '2024.11 ~ 현재',
                title: '1년간 영상 재사용, ROI 극대화',
                description: '한 번 제작한 영상으로 12개월 광고 운영, 섭외비 절감',
                metric_1_value: '12개월',
                metric_1_label: '영상 재사용',
                metric_2_value: '₩0',
                metric_2_label: '추가 섭외비',
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
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
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
              <Link href="/portfolio" className="btn-secondary inline-flex items-center gap-2">
                전체 포트폴리오 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem & Solution Section - WHY AI? */}
      <section id="why-ai" className="section-spacing bg-[#050505]">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">WHY AI?</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">왜 인플루언서 거품을 믿으십니까?</h2>
              <p className="text-white/60 mt-4">팔로워 10만? 알고리즘이 막으면 아무도 못 봅니다.</p>
            </div>
          </ScrollReveal>

          {/* VS Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Old Way */}
            <ScrollReveal delay={0.1} direction="left">
              <div className="bg-[#0A0A0A] border border-red-500/20 rounded-2xl p-6 lg:p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold tracking-wider">OLD WAY</p>
                    <p className="text-white font-bold">기존 인플루언서</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">X</span>
                    <div>
                      <p className="text-white font-medium">도달률 5%의 함정</p>
                      <p className="text-white/50 text-sm">10만 팔로워? 알고리즘이 막으면 아무도 못 봅니다.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">X</span>
                    <div>
                      <p className="text-white font-medium">휘발성 게시물</p>
                      <p className="text-white/50 text-sm">24시간 뒤면 사라지는 스토리에 300만 원을 태우시겠습니까?</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">X</span>
                    <div>
                      <p className="text-white font-medium">통제 불가 리스크</p>
                      <p className="text-white/50 text-sm">&quot;그 멘트는 못 해요&quot;, &quot;술 먹고 사고 침&quot; - 예측 불가능한 변수</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">X</span>
                    <div>
                      <p className="text-white font-medium">매년 재협상</p>
                      <p className="text-white/50 text-sm">단가 상승, 일정 조율, 언제 폭탄 터질지 모르는 리스크</p>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            {/* New Standard */}
            <ScrollReveal delay={0.2} direction="right">
              <div className="bg-gradient-to-b from-[#00F5A0]/10 to-[#0A0A0A] border border-[#00F5A0]/30 rounded-2xl p-6 lg:p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#00F5A0]/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#00F5A0] text-xs font-bold tracking-wider">NEW STANDARD</p>
                    <p className="text-white font-bold">XLARGE AI</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-[#00F5A0] mt-1">O</span>
                    <div>
                      <p className="text-white font-medium">타겟 적중률 100%</p>
                      <p className="text-white/50 text-sm">우리 영상을 사서 귀사 계정으로 광고를 돌리세요. <strong className="text-[#00F5A0]">진짜 살 사람에게만</strong> 꽂힙니다.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#00F5A0] mt-1">O</span>
                    <div>
                      <p className="text-white font-medium">영구 소장 자산</p>
                      <p className="text-white/50 text-sm">한 번 구매하면 평생 귀사의 것. <strong className="text-[#00F5A0]">1년이고 2년이고</strong> 매출 날 때까지 돌리세요.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#00F5A0] mt-1">O</span>
                    <div>
                      <p className="text-white font-medium">완벽한 통제</p>
                      <p className="text-white/50 text-sm">브랜드가 원하는 표정, 멘트, 춤. <strong className="text-[#00F5A0]">100% 의도대로</strong> 연출합니다.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-[#00F5A0] mt-1">O</span>
                    <div>
                      <p className="text-white font-medium">리스크 제로</p>
                      <p className="text-white/50 text-sm">스캔들 없음, 단가 인상 없음, <strong className="text-[#00F5A0]">Clean AI</strong>로 안전하게.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom CTA */}
          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center">
              <p className="text-white/60 mb-6">인플루언서 1회 섭외 비용으로, 평생 쓰는 브랜드 전속 모델을 만드세요.</p>
              <button
                onClick={() => triggerOpenChat('free_consult')}
                className="btn-primary"
              >
                무료 상담 받기
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="section-spacing bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <p className="label-tag mb-4">OUR POSITION</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              우리는 인플루언서의 &apos;입&apos;이 아니라,<br />
              <span className="gradient-text">&apos;얼굴&apos;을 팝니다.</span>
            </h2>
            <div className="max-w-2xl mx-auto">
              <p className="text-white/70 text-lg mb-8">
                마케팅의 성공 공식은 <strong className="text-white">좋은 소재(Creative)</strong> X <strong className="text-white">정교한 타겟팅(Ads)</strong>입니다.
              </p>
              <p className="text-white/60 mb-12">
                타겟팅은 귀사의 마케터가 제일 잘합니다.<br />
                저희는 귀사의 마케터가 춤추게 할 <strong className="text-[#00F5A0]">&apos;압도적인 소재&apos;</strong>만 납품합니다.
              </p>

              {/* 임팩트 있는 200% 배지 */}
              <div className="relative inline-block group cursor-pointer">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                {/* Main badge */}
                <div className="relative px-8 sm:px-12 py-6 sm:py-8 bg-gradient-to-r from-[#0A0A0A] to-[#111111] border-2 border-[#00F5A0]/50 rounded-2xl shadow-[0_0_40px_rgba(0,245,160,0.15)] group-hover:shadow-[0_0_60px_rgba(0,245,160,0.25)] transition-all duration-300">
                  <p className="text-white/60 text-sm sm:text-base mb-2">매체비 효율을</p>
                  <p className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                    <span
                      className="bg-clip-text text-transparent animate-gradient"
                      style={{
                        backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5, #00F5A0)',
                        backgroundSize: '200% 100%',
                      }}
                    >
                      200%
                    </span>
                  </p>
                  <p className="text-white/60 text-sm sm:text-base mt-2">끌어올리는 AI 모델</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section - Premium */}
      <section className="section-spacing bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="label-tag mb-4">SELECT YOUR PLAN</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">귀사의 클래스에 맞는 플랜</h2>
              <p className="text-white/60 mt-4">프리미엄 AI 크리에이티브 솔루션</p>

              {/* 가격 비교 문구 */}
              <div className="mt-6 inline-block px-6 py-3 bg-[#0A0A0A] border border-[#00F5A0]/30 rounded-xl">
                <p className="text-sm text-white/80">
                  <span className="text-[#00F5A0] font-bold">300만 원</span>으로
                  <span className="text-white font-bold"> 3,000만 원</span>의 효과
                  <span className="text-white/60"> (모델 섭외비 + 스튜디오 렌탈비 절감)</span>
                </p>
              </div>

              {/* 결제 방식 토글 */}
              <div className="mt-8 flex justify-center">
                <div className="inline-flex bg-[#0A0A0A] border border-[#222] rounded-full p-1">
                  <button
                    onClick={() => setPaymentType('card')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      paymentType === 'card'
                        ? 'bg-white text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    카드 결제
                  </button>
                  <button
                    onClick={() => setPaymentType('invoice')}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      paymentType === 'invoice'
                        ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    세금계산서 (10% 할인)
                  </button>
                </div>
              </div>
              {paymentType === 'invoice' && (
                <p className="mt-3 text-sm text-[#00F5A0]">
                  기업 고객은 세금계산서 발행 시 10% 제휴 할인이 적용됩니다
                </p>
              )}
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* STARTER */}
            <ScrollReveal delay={0.1} direction="up">
              <div className="card h-full flex flex-col">
                <p className="label-tag mb-4">STARTER</p>
                <div className="mb-1">
                  {paymentType === 'invoice' && (
                    <span className="text-white/40 text-sm line-through mr-2">₩3,300,000</span>
                  )}
                  <h3 className="text-2xl font-bold text-white inline">
                    ₩{formatPrice(getPrice(3300000))}~
                  </h3>
                </div>
                <p className="text-white/60 text-sm mb-6">테스트 도입을 위한 베이직 플랜</p>
                <ul className="feature-list mb-8 flex-1">
                  <li>AI 인플루언서 영상 1종 (15초)</li>
                  <li>기본 배경/의상 제공</li>
                  <li>비독점 라이선스 (1년)</li>
                  <li>수정 1회 (단순 편집)</li>
                </ul>
                <Link href="/products" className="btn-secondary w-full text-center block">
                  시작하기
                </Link>
              </div>
            </ScrollReveal>

            {/* GROWTH - Best Choice */}
            <ScrollReveal delay={0.2} direction="up">
              <div className="card-featured relative h-full flex flex-col">
                <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black rounded-sm">
                  BEST CHOICE
                </span>
                <p className="label-tag mb-4">GROWTH</p>
                <div className="mb-1">
                  {paymentType === 'invoice' && (
                    <span className="text-white/40 text-sm line-through mr-2">₩5,500,000</span>
                  )}
                  <h3 className="text-2xl font-bold text-white inline">
                    ₩{formatPrice(getPrice(5500000))}
                  </h3>
                </div>
                <p className="text-white/60 text-sm mb-6">본격적인 성과를 위한 주력 플랜</p>
                <ul className="feature-list mb-8 flex-1">
                  <li><strong className="text-white">영상 1종 + 바리에이션 3종</strong> (총 4개)</li>
                  <li><strong className="text-white">브랜드 맞춤 커스텀</strong> (의상/PPL)</li>
                  <li><strong className="text-[#00F5A0]">영구 소장 라이선스</strong></li>
                  <li>전담 매니저 배정</li>
                  <li>수정 2회</li>
                </ul>
                <button
                  onClick={() => triggerOpenChat('growth_inquiry')}
                  className="btn-primary w-full"
                >
                  도입 문의하기
                </button>
              </div>
            </ScrollReveal>

            {/* PERFORMANCE */}
            <ScrollReveal delay={0.3} direction="up">
              <div className="card h-full flex flex-col border-[#00D9F5]/30">
                <p className="label-tag mb-4 text-[#00D9F5]">PERFORMANCE</p>
                <div className="mb-1">
                  {paymentType === 'invoice' && (
                    <span className="text-white/40 text-sm line-through mr-2">₩9,000,000</span>
                  )}
                  <h3 className="text-2xl font-bold text-white inline">
                    ₩{formatPrice(getPrice(9000000))}
                  </h3>
                </div>
                <p className="text-white/60 text-sm mb-6">고퀄리티 연출이 필요한 프리미엄 플랜</p>
                <ul className="feature-list mb-8 flex-1">
                  <li><strong className="text-white">영상 2종 + 바리에이션 6종</strong> (총 8개)</li>
                  <li>전문 디렉터의 고퀄리티 연출</li>
                  <li><strong className="text-[#00F5A0]">성과 저조 시 소재 교체(AS) 1회</strong></li>
                  <li>영구 소장 라이선스</li>
                  <li>우선 제작 (Fast Track)</li>
                </ul>
                <button
                  onClick={() => triggerOpenChat('performance_inquiry')}
                  className="btn-secondary w-full text-center"
                >
                  도입 상담받기
                </button>
              </div>
            </ScrollReveal>

            {/* PERFORMANCE ADS PACK - NEW */}
            <ScrollReveal delay={0.4} direction="up">
              <div className="card h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border-purple-500/40">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-purple-400 text-xs font-bold tracking-wider">PERFORMANCE ADS</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded">NEW</span>
                </div>
                <div className="mb-1">
                  {paymentType === 'invoice' && (
                    <span className="text-white/40 text-sm line-through mr-2">₩15,000,000~</span>
                  )}
                  <h3 className="text-2xl font-bold text-white inline">
                    ₩{formatPrice(getPrice(15000000))}~
                  </h3>
                </div>
                <p className="text-purple-300/80 text-sm mb-6">영상 제작 + 광고 운영 올인원</p>
                <ul className="space-y-2 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong className="text-white">AI 모델 영상 제작 (5종)</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>A/B 테스트용 바리에이션 (10종)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span><strong className="text-purple-300">메타/틱톡/유튜브 광고 세팅</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>타겟 오디언스 정밀 세팅</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>ROAS 분석 리포트 제공</span>
                  </li>
                </ul>
                <p className="text-xs text-white/40 mb-4 text-center">영상만 만든다고 팔리지 않습니다.</p>
                <button
                  onClick={() => triggerOpenChat('ads_package')}
                  className="block w-full text-center py-3 rounded-full font-medium bg-gradient-to-r from-purple-500 to-purple-400 text-white hover:opacity-90 transition-all"
                >
                  광고 패키지 상담
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* VIP PARTNER - Full Width */}
          <ScrollReveal delay={0.5}>
            <div className="mt-8 bg-gradient-to-r from-[#1a1a1a] via-[#111] to-[#1a1a1a] border border-[#B8860B]/40 rounded-2xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[#FFD700] text-xs font-bold tracking-wider">VIP PARTNER</span>
                    <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">중견/대기업을 위한 분기 독점 계약</h3>
                  <p className="text-[#FFD700]/80 text-sm">3개월 파트너십 (총 12개 영상) + 브랜드 전속 AI 모델 독점 개발 + 월간 성과 리포트</p>
                </div>
                <Link href="/contact" className="shrink-0 inline-block text-center px-8 py-3 rounded-full font-medium bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black hover:opacity-90 transition-all">
                  VIP 컨시어지 연결
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* VAT Notice */}
          <p className="text-center text-white/40 text-sm mt-8">
            ※ 모든 금액은 VAT 별도이며, 착수금 50% 납입 시 프로젝트가 시작됩니다.
          </p>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-spacing bg-[#050505]">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">SOCIAL PROOF</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                이미 상위 1% 브랜드는<br />
                <span className="gradient-text">&apos;얼굴&apos;을 갈아타기 시작했습니다</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1} direction="up">
              <div className="card h-full">
                <div className="mb-4">
                  <span className="text-3xl font-bold gradient-text">ROAS 3배</span>
                </div>
                <p className="text-white/80 mb-6">
                  &quot;인플루언서한테 협찬 뿌리는 것보다, XLARGE 영상 하나 사서 광고 돌리는 게 <strong className="text-[#00F5A0]">ROAS 3배</strong> 더 나왔습니다. 이제 협찬 안 합니다.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 rounded-full flex items-center justify-center text-[#00F5A0] font-bold text-sm">
                    D
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">정** 마케팅 팀장</div>
                    <div className="text-white/40 text-xs">뷰티 브랜드 D사</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up">
              <div className="card h-full">
                <div className="mb-4">
                  <span className="text-3xl font-bold gradient-text">CPA -67%</span>
                </div>
                <p className="text-white/80 mb-6">
                  &quot;같은 매체비로 전환 3배. 인플루언서 썼을 때 CPA 15,000원이었는데 <strong className="text-[#00F5A0]">XLARGE로 5,000원</strong>까지 떨어졌어요. 미쳤죠.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 rounded-full flex items-center justify-center text-[#00F5A0] font-bold text-sm">
                    M
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">박** 퍼포먼스 팀장</div>
                    <div className="text-white/40 text-xs">광고 대행사 M사</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up">
              <div className="card h-full">
                <div className="mb-4">
                  <span className="text-3xl font-bold gradient-text">영구 자산</span>
                </div>
                <p className="text-white/80 mb-6">
                  &quot;작년에 산 영상 지금도 쓰고 있어요. 인플루언서 6개월 계약했으면 벌써 2번은 다시 섭외했을 텐데. <strong className="text-[#00F5A0]">최고의 투자</strong>였습니다.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 rounded-full flex items-center justify-center text-[#00F5A0] font-bold text-sm">
                    C
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">이** 대표</div>
                    <div className="text-white/40 text-xs">D2C 스타트업 C사</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* CTA Section - Premium */}
      <section className="section-spacing bg-[#050505] spotlight-center relative overflow-hidden">

        <ScrollReveal className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            월 매출 1억을 더 만드는<br />가장 확실한 투자
          </h2>
          <p className="text-xl text-white/70 mb-2">
            상위 1% 브랜드가 선택한 AI 마케팅 솔루션
          </p>
          <p className="text-white/40 mb-12">
            법인카드 결제 가능 / 세금계산서 발행 / 48시간 납품
          </p>
          <button
            onClick={() => triggerOpenChat('vip_consult')}
            className="btn-primary text-lg"
          >
            VIP 상담 신청하기
          </button>
        </ScrollReveal>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="sticky-mobile-cta">
        <button
          onClick={() => triggerOpenChat('vip_consult')}
          className="btn-primary w-full text-center"
        >
          VIP 상담 신청하기
        </button>
      </div>
    </div>
  );
}
