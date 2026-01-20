'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import HeroTextContent from './HeroTextContent';
import PhoneMockupFrame from './PhoneMockupFrame';
import { HeroMediaAsset } from '@/lib/supabase';

// iOS 저전력 모드 대응 비디오 재생 함수
function playVideoSafely(video: HTMLVideoElement) {
  video.muted = true;
  video.playsInline = true;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // 재생 실패 시 약간의 지연 후 재시도
      setTimeout(() => {
        video.play().catch(() => {});
      }, 100);
    });
  }
}

// Cloudinary URL 최적화 함수 - 최대한 빠른 로딩
function optimizeVideoUrl(url: string, isMobile: boolean): string {
  if (!url.includes('cloudinary.com')) return url;
  // 모바일: 초경량 (270p), 데스크톱: 경량 (360p)
  // so_0: 시작점 0초 (스트리밍 빠른 시작)
  // f_mp4: MP4 고정 (호환성)
  // vc_h264: H.264 코덱 (하드웨어 가속)
  // q_auto:eco: 최저 품질 (가장 빠른 로딩)
  // br_300k/500k: 낮은 비트레이트
  const transformation = isMobile
    ? 'w_270,h_480,c_limit,f_mp4,vc_h264,q_auto:eco,br_300k,so_0'
    : 'w_360,h_640,c_limit,f_mp4,vc_h264,q_auto:eco,br_500k,so_0';
  return url.replace('/upload/', `/upload/${transformation}/`);
}

// 비디오 프리로드 함수
function preloadVideo(url: string) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// 모바일 감지 훅
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

interface HeroTypeC_MockupProps {
  assets: HeroMediaAsset[];
}

export default function HeroTypeC_Mockup({ assets }: HeroTypeC_MockupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isDissolving, setIsDissolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const preloadedRef = useRef(false);

  // 첫 번째 비디오 즉시 프리로드 (컴포넌트 마운트 시)
  useEffect(() => {
    if (preloadedRef.current || assets.length === 0) return;
    preloadedRef.current = true;

    const firstAsset = assets[0];
    if (firstAsset?.video_url) {
      // 모바일/데스크톱 판단 후 최적화된 URL로 프리로드
      const checkMobile = window.innerWidth < 768;
      const optimizedUrl = optimizeVideoUrl(firstAsset.video_url, checkMobile);
      preloadVideo(optimizedUrl);
    }
  }, [assets]);

  const nextAssetIndex = useCallback((current: number) => {
    return (current + 1) % assets.length;
  }, [assets.length]);

  // 영상 끝나면 다음으로 디졸브 전환
  const handleVideoEnded = useCallback(() => {
    if (assets.length <= 1) return;

    setIsDissolving(true);
    setNextIndex(nextAssetIndex(currentIndex));

    // 디졸브 완료 후 인덱스 교체
    setTimeout(() => {
      setCurrentIndex(nextAssetIndex(currentIndex));
      setIsDissolving(false);
    }, 800); // 디졸브 시간
  }, [assets.length, currentIndex, nextAssetIndex]);

  // 인디케이터 클릭 시 디졸브 전환
  const handleIndicatorClick = useCallback((index: number) => {
    if (index === currentIndex || isDissolving) return;

    setIsDissolving(true);
    setNextIndex(index);

    setTimeout(() => {
      setCurrentIndex(index);
      setIsDissolving(false);
    }, 800);
  }, [currentIndex, isDissolving]);

  // iOS 저전력 모드 대응: 마운트 시 즉시 재생 시도
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 즉시 재생 시도
    playVideoSafely(video);

    // IntersectionObserver로 뷰포트 진입 시에도 재생 시도
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          playVideoSafely(videoRef.current);
        }
      },
      { threshold: 0, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [currentIndex]);

  // 터치/클릭 시 재생 시도 (iOS 저전력 모드 우회)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (videoRef.current) {
        playVideoSafely(videoRef.current);
      }
    };

    // 첫 번째 터치/클릭에서 재생 시도
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('click', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  const currentAsset = assets[currentIndex];
  const nextAsset = assets[nextIndex];

  return (
    <div ref={containerRef} className="relative z-10 w-full min-h-screen flex items-center">
      {/* max-w-7xl 컨테이너로 navbar와 기준점 맞춤 */}
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center">
        {/* Left: Text Content - 50% 고정, 내부 max-width 제한 */}
        <div
          className="w-full lg:flex-shrink-0 py-8 lg:py-0 lg:pr-10 flex items-center justify-center lg:justify-start order-1"
          style={{ flexBasis: '50%', minWidth: '320px' }}
        >
          <div className="max-w-lg w-full">
            <HeroTextContent />
          </div>
        </div>

      {/* Right: Phone Mockup - 모바일/데스크톱 공통 */}
      <div
        className="w-full lg:flex-shrink-0 flex items-center justify-center py-4 lg:py-0 order-2"
        style={{ flexBasis: '50%' }}
      >
        <PhoneMockupFrame>
          {assets.length > 0 && currentAsset ? (
            <div className="relative w-full h-full">
              {/* Current Video - 페이드 아웃 */}
              <div
                className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
                  isDissolving ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ transitionDuration: '800ms' }}
              >
                <video
                  ref={videoRef}
                  key={`current-${currentAsset.id}`}
                  src={optimizeVideoUrl(currentAsset.video_url, isMobile)}
                  autoPlay
                  muted
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnded}
                  onLoadedData={(e) => playVideoSafely(e.currentTarget)}
                  onCanPlay={(e) => playVideoSafely(e.currentTarget)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Next Video - 페이드 인 (디졸브 시에만 표시) */}
              {isDissolving && nextAsset && (
                <div
                  className="absolute inset-0 transition-opacity duration-800 ease-in-out opacity-100"
                  style={{ transitionDuration: '800ms' }}
                >
                  <video
                    key={`next-${nextAsset.id}`}
                    src={optimizeVideoUrl(nextAsset.video_url, isMobile)}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={(e) => playVideoSafely(e.currentTarget)}
                    onCanPlay={(e) => playVideoSafely(e.currentTarget)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {assets.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleIndicatorClick(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentIndex
                        ? 'bg-white w-4'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
                {assets.length > 5 && (
                  <span className="text-white/40 text-xs ml-1">+{assets.length - 5}</span>
                )}
              </div>

              {/* Top gradient for status bar area */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            /* 빈 상태에서도 폰 프레임 내부에 콘텐츠 표시 */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#111]">
              <div className="text-center px-4">
                <div className="w-12 h-12 bg-[#222] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">미디어를 등록해주세요</p>
              </div>
            </div>
          )}
        </PhoneMockupFrame>
      </div>
      </div>
    </div>
  );
}
