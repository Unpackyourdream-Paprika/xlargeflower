'use client';

import { useState, useEffect, useRef } from 'react';
import AuroraBackground from '@/components/animations/AuroraBackground';
import HeroTypeA_Rolling from './HeroTypeA_Rolling';
import HeroTypeC_Mockup from './HeroTypeC_Mockup';
import { HeroConfig } from '@/lib/supabase';

// 비디오 프리로드 함수 - 최우선 로딩
function preloadHeroVideo(url: string, isMobile: boolean) {
  if (!url.includes('cloudinary.com')) return;

  // 최적화된 URL 생성
  const transformation = isMobile
    ? 'w_270,h_480,c_limit,f_mp4,vc_h264,q_auto:eco,br_300k,so_0'
    : 'w_360,h_640,c_limit,f_mp4,vc_h264,q_auto:eco,br_500k,so_0';
  const optimizedUrl = url.replace('/upload/', `/upload/${transformation}/`);

  // link preload 추가
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = optimizedUrl;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);

  // fetch로 즉시 다운로드 시작 (캐시에 저장)
  fetch(optimizedUrl, { mode: 'cors', credentials: 'omit' }).catch(() => {});
}

// 스켈레톤 로딩 컴포넌트 - 레이아웃 유지
function HeroSkeleton() {
  return (
    <div className="relative z-10 w-full min-h-screen flex items-center">
      {/* max-w-7xl 컨테이너로 navbar와 기준점 맞춤 */}
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center">
        {/* Left: Text Skeleton - 50% 고정, 내부 max-width 제한 */}
        <div
          className="w-full lg:flex-shrink-0 py-8 lg:py-0 lg:pr-10 flex items-center justify-center lg:justify-start"
          style={{ flexBasis: '50%', minWidth: '320px' }}
        >
          <div className="max-w-lg w-full space-y-6">
          {/* Label skeleton */}
          <div className="h-4 w-48 bg-white/5 rounded animate-pulse mx-auto lg:mx-0" />
          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="h-12 lg:h-16 w-64 bg-white/5 rounded animate-pulse mx-auto lg:mx-0" />
            <div className="h-12 lg:h-16 w-80 bg-gradient-to-r from-[#00F5A0]/10 to-[#00D9F5]/10 rounded animate-pulse mx-auto lg:mx-0" />
            <div className="h-12 lg:h-16 w-56 bg-gradient-to-r from-[#00F5A0]/10 to-[#00D9F5]/10 rounded animate-pulse mx-auto lg:mx-0" />
          </div>
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full max-w-md bg-white/5 rounded animate-pulse mx-auto lg:mx-0" />
            <div className="h-4 w-3/4 max-w-sm bg-white/5 rounded animate-pulse mx-auto lg:mx-0" />
          </div>
          {/* Button skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <div className="h-12 w-48 bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 rounded-full animate-pulse" />
            <div className="h-12 w-40 bg-white/5 rounded-full animate-pulse" />
          </div>
        </div>
        </div>

        {/* Right: Media Skeleton - 50% 고정 */}
        <div
          className="w-full lg:flex-shrink-0 flex items-center justify-center py-8 lg:py-0"
          style={{ flexBasis: '50%' }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/40 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MainHeroContainer() {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const preloadedRef = useRef(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const isMobile = window.innerWidth < 768;

      try {
        const response = await fetch('/api/hero/config');
        if (!response.ok) {
          throw new Error('Failed to fetch hero config');
        }
        const data = await response.json();

        // API 응답 받자마자 첫 번째 비디오 즉시 프리로드
        if (!preloadedRef.current && data.assets?.length > 0) {
          preloadedRef.current = true;
          const firstVideoUrl = data.assets[0]?.video_url;
          if (firstVideoUrl) {
            preloadHeroVideo(firstVideoUrl, isMobile);
          }
        }

        setConfig(data);
      } catch (err) {
        console.error('Failed to fetch hero config:', err);
        // 에러 시에도 기본값으로 레이아웃 표시 (레이아웃 깨짐 방지)
        setConfig({
          layout_type: 'VERTICAL_ROLLING',
          assets: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora Background */}
      <AuroraBackground />

      {/* Hero Content - 로딩/에러 시에도 레이아웃 유지 */}
      {isLoading ? (
        <HeroSkeleton />
      ) : config ? (
        config.layout_type === 'VERTICAL_ROLLING' ? (
          <HeroTypeA_Rolling assets={config.assets} />
        ) : (
          <HeroTypeC_Mockup assets={config.assets} />
        )
      ) : (
        /* config가 null인 경우도 기본 레이아웃 표시 */
        <HeroTypeA_Rolling assets={[]} />
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
