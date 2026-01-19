'use client';

import { useRef } from 'react';
import HeroTextContent from './HeroTextContent';
import VerticalMarquee from './VerticalMarquee';
import HeroMediaCard from './HeroMediaCard';
import { HeroMediaAsset } from '@/lib/supabase';

interface HeroTypeA_RollingProps {
  assets: HeroMediaAsset[];
}

export default function HeroTypeA_Rolling({ assets }: HeroTypeA_RollingProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 에셋을 두 컬럼으로 분배
  const column1 = assets.filter((_, i) => i % 2 === 0);
  const column2 = assets.filter((_, i) => i % 2 === 1);

  return (
    <div className="relative z-10 w-full min-h-screen flex items-center">
      {/* max-w-7xl 컨테이너로 navbar와 기준점 맞춤 */}
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center">
        {/* Left: Text Content - 50% 고정, 내부 max-width 제한 */}
        <div
          className="w-full lg:flex-shrink-0 py-8 lg:py-0 lg:pr-10 flex items-center justify-center lg:justify-start"
          style={{ flexBasis: '50%', minWidth: '320px' }}
        >
          <div className="max-w-lg w-full">
            <HeroTextContent />
          </div>
        </div>

      {/* Right: Visual Area - 강제 50% 고정, 빈 상태에서도 공간 유지 */}
      <div
        className="w-full lg:flex-shrink-0 min-h-[50vh] lg:min-h-[80vh] relative"
        style={{ flexBasis: '50%' }}
      >
        {/* Desktop: Dual Column Vertical Marquee */}
        <div className="hidden lg:flex h-full min-h-[80vh] gap-4 px-6 py-4 overflow-hidden">
          {assets.length > 0 ? (
            <>
              {/* Column 1 - scrolls up */}
              <div className="flex-1 h-full">
                <VerticalMarquee
                  items={column1.length > 0 ? column1 : assets}
                  speed={25}
                  direction="up"
                />
              </div>
              {/* Column 2 - scrolls down (different speed) */}
              <div className="flex-1 h-full">
                <VerticalMarquee
                  items={column2.length > 0 ? column2 : [...assets].reverse()}
                  speed={35}
                  direction="down"
                />
              </div>
            </>
          ) : (
            /* 빈 상태에서도 공간 유지 */
            <div className="flex-1 flex items-center justify-center text-white/40 min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p>미디어를 등록해주세요</p>
                <p className="text-sm text-white/20 mt-1">어드민 &gt; 히어로 관리</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Horizontal Scroll Carousel */}
        <div className="lg:hidden h-full min-h-[300px] flex items-center">
          <div
            ref={scrollRef}
            className="flex gap-4 px-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex-shrink-0 snap-center"
                  style={{ width: '200px' }}
                >
                  <HeroMediaCard
                    thumbnailUrl={asset.thumbnail_url}
                    videoUrl={asset.video_url}
                    title={asset.title}
                    className="w-full aspect-[9/16]"
                  />
                </div>
              ))
            ) : (
              /* 모바일 빈 상태 */
              <div className="flex items-center justify-center text-white/40 w-full py-12">
                <div className="text-center">
                  <p>미디어를 등록해주세요</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gradient overlays for visual polish */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-10 hidden lg:block" />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none z-10 hidden lg:block" />
      </div>
      </div>
    </div>
  );
}
