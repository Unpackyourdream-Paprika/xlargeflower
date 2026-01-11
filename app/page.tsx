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
          <p className="label-gradient mb-8">XLARGE FLOWER</p>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-none">
            <span className="block text-white mb-2">촬영은 끝났다.</span>
            <span className="block gradient-text">이제 생성이다.</span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-white max-w-xl mx-auto">
            48시간 완성. AI 광고 소재 솔루션.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={triggerOpenChat}
              className="btn-primary text-lg"
            >
              시작하기
            </button>
            <Link href="/portfolio" className="btn-secondary text-lg">
              작업물 보기
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 flex flex-wrap justify-center gap-12 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">48h</div>
              <div className="text-sm text-white/60 mt-1">평균 납품</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">1/5</div>
              <div className="text-sm text-white/60 mt-1">비용 절감</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">0</div>
              <div className="text-sm text-white/60 mt-1">촬영 필요</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-white">99만</div>
              <div className="text-sm text-white/60 mt-1">원부터</div>
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

      {/* Comparison Section */}
      <section className="section-spacing bg-[#080808] spotlight-top">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">왜 XLarge인가</h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#333333]">
                  <th className="text-left py-5 px-6 text-white/40 font-normal text-sm w-1/3"></th>
                  <th className="py-5 px-6 text-white/50 font-normal text-sm w-1/3">기존 프로덕션</th>
                  <th className="py-5 px-6 w-1/3">
                    <span className="gradient-text font-bold text-lg">XLARGE</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr className="border-b border-[#222222]">
                  <td className="text-left py-5 px-6 text-white/70 font-medium">제작 기간</td>
                  <td className="py-5 px-6 text-white/50">3-4주</td>
                  <td className="py-5 px-6 text-white font-bold text-xl">48시간</td>
                </tr>
                <tr className="border-b border-[#222222]">
                  <td className="text-left py-5 px-6 text-white/70 font-medium">촬영</td>
                  <td className="py-5 px-6 text-white/50">필요</td>
                  <td className="py-5 px-6 text-white font-bold text-xl">불필요</td>
                </tr>
                <tr className="border-b border-[#222222]">
                  <td className="text-left py-5 px-6 text-white/70 font-medium">모델</td>
                  <td className="py-5 px-6 text-white/50">필요</td>
                  <td className="py-5 px-6 text-white font-bold text-xl">불필요</td>
                </tr>
                <tr className="border-b border-[#222222]">
                  <td className="text-left py-5 px-6 text-white/70 font-medium">비용</td>
                  <td className="py-5 px-6 text-white/50">500만원~</td>
                  <td className="py-5 px-6 text-white font-bold text-xl">99만원~</td>
                </tr>
                <tr>
                  <td className="text-left py-5 px-6 text-white/70 font-medium">바리에이션</td>
                  <td className="py-5 px-6 text-white/50">추가 비용</td>
                  <td className="py-5 px-6 text-white font-bold text-xl">4-8개 포함</td>
                </tr>
              </tbody>
            </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="section-spacing bg-[#050505] spotlight-cards">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="label-tag mb-4">SELECT YOUR PACK</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">라인업</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ready Pack */}
            <ScrollReveal delay={0.1} direction="up">
              <div className="card h-full">
                <p className="label-tag mb-4">READY</p>
                <h3 className="text-3xl font-bold text-white mb-1">99만원</h3>
                <p className="text-white font-medium mb-1">오늘 결제, 오늘 런칭</p>
                <p className="text-white/40 text-sm mb-8">기성 템플릿</p>
                <ul className="feature-list mb-8">
                  <li>영상 소재 1개</li>
                  <li>비독점 라이선스</li>
                  <li>즉시 다운로드</li>
                </ul>
                <Link href="/products" className="btn-secondary w-full text-center block">
                  자세히 보기
                </Link>
              </div>
            </ScrollReveal>

            {/* Fast Pack - Featured */}
            <ScrollReveal delay={0.2} direction="up">
              <div className="card-featured relative h-full">
                <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-bold tracking-wide bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white">
                  RECOMMENDED
                </span>
                <p className="label-tag mb-4">FAST</p>
                <h3 className="text-3xl font-bold text-white mb-1">198만~398만원</h3>
                <p className="text-white font-medium mb-1">가장 완벽한 효율</p>
                <p className="text-white/40 text-sm mb-8">48H 커스텀</p>
                <ul className="feature-list mb-8">
                  <li>영상 바리에이션 4-8개</li>
                  <li>6s, 15s, 30s 포맷</li>
                  <li>수정 1-3회 포함</li>
                  <li>A/B 테스트 최적화</li>
                </ul>
                <button
                  onClick={triggerOpenChat}
                  className="btn-primary w-full"
                >
                  시작하기
                </button>
              </div>
            </ScrollReveal>

            {/* Exclusive Pack */}
            <ScrollReveal delay={0.3} direction="up">
              <div className="card h-full">
                <p className="label-tag mb-4">EXCLUSIVE</p>
                <h3 className="text-3xl font-bold text-white mb-1">별도 문의</h3>
                <p className="text-white font-medium mb-1">브랜드 독점 라이선스</p>
                <p className="text-white/40 text-sm mb-8">Private Plan</p>
                <ul className="feature-list mb-8">
                  <li>완전 독점 라이선스</li>
                  <li>전담 디렉터 배정</li>
                  <li>우선 납품</li>
                </ul>
                <Link href="/contact" className="btn-secondary w-full text-center block">
                  영업팀 문의
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-spacing bg-[#080808] spotlight-cards">
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">고객 후기</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1} direction="up">
              <div className="card h-full">
                <p className="text-white/80 mb-6">
                  &quot;급하게 광고 소재가 필요했는데 2일 만에 해결했습니다. 퀄리티도 프로덕션 뺨치더라고요.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/70 font-bold text-sm">
                    K
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">김** 마케팅 이사</div>
                    <div className="text-white/40 text-xs">뷰티 브랜드</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up">
              <div className="card h-full">
                <p className="text-white/80 mb-6">
                  &quot;한 번에 8개 크리에이티브를 받아서 A/B 테스트 돌렸더니 ROAS가 40% 올랐습니다.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/70 font-bold text-sm">
                    P
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">박** 퍼포먼스 팀장</div>
                    <div className="text-white/40 text-xs">광고 대행사</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up">
              <div className="card h-full">
                <p className="text-white/80 mb-6">
                  &quot;처음엔 AI라 의심했는데, 퀄리티 보고 깜짝 놀랐습니다. 촬영 없이 이게 가능하다니.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white/70 font-bold text-sm">
                    L
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">이** 대표</div>
                    <div className="text-white/40 text-xs">D2C 스타트업</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-[#050505] spotlight-center relative overflow-hidden">

        <ScrollReveal className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            아직도 촬영 스케줄 잡고 계신가요
          </h2>
          <p className="text-xl text-white/70 mb-2">
            남들은 이미 48시간 만에 광고 돌리고 있습니다
          </p>
          <p className="text-white/40 mb-12">
            99만원부터 시작 / 법인카드 결제 가능 / 세금계산서 발행
          </p>
          <button
            onClick={triggerOpenChat}
            className="btn-primary text-lg"
          >
            지금 시작하기
          </button>
        </ScrollReveal>
      </section>

      {/* Sticky Mobile CTA */}
      <div className="sticky-mobile-cta">
        <button
          onClick={triggerOpenChat}
          className="btn-primary w-full text-center"
        >
          무료 상담 시작하기
        </button>
      </div>
    </div>
  );
}
