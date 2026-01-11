'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuroraBackground from '@/components/animations/AuroraBackground';
import ScrollReveal from '@/components/animations/ScrollReveal';
import VideoMarquee from '@/components/VideoMarquee';
import { triggerOpenChat } from '@/components/GlobalChatButton';
import { getShowcaseVideos, ShowcaseVideo } from '@/lib/supabase';

export default function Home() {
  const [showcaseVideos, setShowcaseVideos] = useState<ShowcaseVideo[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videos = await getShowcaseVideos();
        setShowcaseVideos(videos);
      } catch (error) {
        console.error('Failed to fetch showcase videos:', error);
      }
    };
    fetchVideos();
  }, []);
  return (
    <div className="min-h-screen bg-[#050505] main-content">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Soft Aurora Background Effect */}
        <AuroraBackground />

        <ScrollReveal className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <p className="label-gradient mb-8">CONVERSION-OPTIMIZED AI MODEL</p>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none">
            <span className="block text-white mb-2">매출 전환율 1위,</span>
            <span className="block gradient-text">AI 버추얼 광고 모델 제작 XLARGE</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            국내 최초, 구매 전환(Conversion)에 최적화된 AI 퍼포먼스 모델 솔루션.<br />
            거품 낀 섭외비 대신, 확실한 영상 자산을 소유하세요.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={triggerOpenChat}
              className="btn-primary text-lg"
            >
              내 브랜드에 맞는 모델 찾기
            </button>
            <Link href="/portfolio" className="btn-secondary text-lg">
              MODEL LINEUP 보기
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 flex flex-wrap justify-center gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold gradient-text">+320%</div>
              <div className="text-sm text-white/60 mt-1">평균 ROAS 상승</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">영구</div>
              <div className="text-sm text-white/60 mt-1">소장 라이선스</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">0%</div>
              <div className="text-sm text-white/60 mt-1">오너 리스크</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">48h</div>
              <div className="text-sm text-white/60 mt-1">납품 완료</div>
            </div>
          </div>
        </ScrollReveal>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
        </div>
      </section>

      {/* AI Video Showcase - Video Wall */}
      <VideoMarquee videos={showcaseVideos} />

      {/* Before & After Section */}
      <section className="section-spacing bg-[#050505] spotlight-top">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">HOW IT WORKS</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                원본 사진이 광고 영상이 된다
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative max-w-5xl mx-auto">
              {/* Arrow in the middle (desktop only) */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center shadow-lg shadow-[#00F5A0]/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-stretch">
              {/* Input */}
              <div className="relative">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="label-tag px-3 py-1 bg-[#0A0A0A]">RAW INPUT</span>
                </div>
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-6 h-full grayscale">
                  <div className="aspect-video bg-[#111111] rounded border border-dashed border-[#333333] flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-[#1a1a1a] rounded flex items-center justify-center">
                        <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-white/40 text-sm">product.jpg</p>
                    </div>
                  </div>
                  <p className="text-white font-bold text-center">원본 사진</p>
                  <p className="text-white/40 text-sm text-center mt-1">폰 촬영 OK</p>
                </div>
              </div>

              {/* Mobile Arrow */}
              <div className="flex md:hidden justify-center -my-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
                  <svg className="w-6 h-6 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Output */}
              <div className="relative">
                <div className="absolute -top-3 left-4 z-10">
                  <span className="px-3 py-1 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white text-xs font-bold tracking-wide">
                    RENDERED OUTPUT
                  </span>
                </div>
                <div className="card-featured h-full">
                  <div className="aspect-video rounded overflow-hidden relative group">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="https://assets.mixkit.co/videos/preview/mixkit-pouring-milk-into-a-bowl-with-cereals-seen-up-42017-large.mp4" type="video/mp4" />
                    </video>
                    {/* Video indicator */}
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white text-xs font-bold rounded">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">6s</span>
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">15s</span>
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">30s</span>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-white font-bold">48시간 완성</p>
                    <p className="text-white/40 text-sm mt-1">바로 광고 송출 가능</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Features */}
          <ScrollReveal delay={0.3}>
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <p className="text-white font-bold">촬영 불필요</p>
                <p className="text-white/50 text-sm mt-1">스튜디오, 모델, 장소 NO</p>
              </div>
              <div className="p-6">
                <p className="text-white font-bold">48시간 납품</p>
                <p className="text-white/50 text-sm mt-1">급한 캠페인도 문제없음</p>
              </div>
              <div className="p-6">
                <p className="text-white font-bold">무한 바리에이션</p>
                <p className="text-white/50 text-sm mt-1">소재 고갈 걱정 끝</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Problem & Solution Section - WHY AI? */}
      <section id="why-ai" className="section-spacing bg-[#080808] spotlight-top">
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
                onClick={triggerOpenChat}
                className="btn-primary"
              >
                무료 상담 받기
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why It Works Section */}
      <section className="section-spacing bg-[#050505] spotlight-center">
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
              <p className="text-white/60 mb-8">
                타겟팅은 귀사의 마케터가 제일 잘합니다.<br />
                저희는 귀사의 마케터가 춤추게 할 <strong className="text-[#00F5A0]">&apos;압도적인 소재&apos;</strong>만 납품합니다.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] border border-[#222222] rounded-full">
                <span className="text-white/60 text-sm">매체비 효율을</span>
                <span className="gradient-text font-bold text-xl">200%</span>
                <span className="text-white/60 text-sm">끌어올리는 AI 모델</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section - Premium */}
      <section className="section-spacing bg-[#050505] spotlight-cards">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">SELECT YOUR PLAN</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">귀사의 클래스에 맞는 플랜</h2>
              <p className="text-white/60 mt-4">프리미엄 AI 크리에이티브 솔루션</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* STARTER */}
            <ScrollReveal delay={0.1} direction="up">
              <div className="card h-full flex flex-col">
                <p className="label-tag mb-4">STARTER</p>
                <h3 className="text-2xl font-bold text-white mb-1">₩3,000,000~</h3>
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
                <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white">
                  BEST CHOICE
                </span>
                <p className="label-tag mb-4">GROWTH</p>
                <h3 className="text-2xl font-bold text-white mb-1">₩5,500,000</h3>
                <p className="text-white/60 text-sm mb-6">본격적인 성과를 위한 주력 플랜</p>
                <ul className="feature-list mb-8 flex-1">
                  <li><strong className="text-white">영상 1종 + 바리에이션 3종</strong> (총 4개)</li>
                  <li><strong className="text-white">브랜드 맞춤 커스텀</strong> (의상/PPL)</li>
                  <li><strong className="text-[#00F5A0]">영구 소장 라이선스</strong></li>
                  <li>전담 매니저 배정</li>
                  <li>수정 2회</li>
                </ul>
                <button
                  onClick={triggerOpenChat}
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
                <h3 className="text-2xl font-bold text-white mb-1">₩9,000,000</h3>
                <p className="text-white/60 text-sm mb-6">고퀄리티 연출이 필요한 프리미엄 플랜</p>
                <ul className="feature-list mb-8 flex-1">
                  <li><strong className="text-white">영상 2종 + 바리에이션 6종</strong> (총 8개)</li>
                  <li>전문 디렉터의 고퀄리티 연출</li>
                  <li><strong className="text-[#00F5A0]">성과 저조 시 소재 교체(AS) 1회</strong></li>
                  <li>영구 소장 라이선스</li>
                  <li>우선 제작 (Fast Track)</li>
                </ul>
                <button
                  onClick={triggerOpenChat}
                  className="btn-secondary w-full text-center"
                >
                  도입 상담받기
                </button>
              </div>
            </ScrollReveal>

            {/* VIP PARTNER */}
            <ScrollReveal delay={0.4} direction="up">
              <div className="card h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border-[#B8860B]/40">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#FFD700] text-xs font-bold tracking-wider">VIP PARTNER</span>
                  <svg className="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">별도 문의</h3>
                <p className="text-[#FFD700]/80 text-sm mb-6">중견/대기업을 위한 분기 독점 계약</p>
                <ul className="space-y-2 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong className="text-white">3개월 파트너십</strong> (총 12개 영상)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong className="text-white">브랜드 전속 AI 모델 독점 개발</strong>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    월간 성과 리포트 및 전략 컨설팅
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-[#FFD700] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    VIP 전용 핫라인 및 무제한 수정
                  </li>
                </ul>
                <Link href="/contact" className="block w-full text-center py-3 rounded-full font-medium bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black hover:opacity-90 transition-all">
                  VIP 컨시어지 연결
                </Link>
              </div>
            </ScrollReveal>
          </div>

          {/* VAT Notice */}
          <p className="text-center text-white/40 text-sm mt-8">
            ※ 모든 금액은 VAT 별도이며, 착수금 50% 납입 시 프로젝트가 시작됩니다.
          </p>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-spacing bg-[#080808] spotlight-cards">
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
            onClick={triggerOpenChat}
            className="btn-primary text-lg"
          >
            VIP 상담 신청하기
          </button>
        </ScrollReveal>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="sticky-mobile-cta">
        <button
          onClick={triggerOpenChat}
          className="btn-primary w-full text-center"
        >
          VIP 상담 신청하기
        </button>
      </div>
    </div>
  );
}
