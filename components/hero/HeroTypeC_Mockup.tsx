'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import HeroTextContent from './HeroTextContent';
import PhoneMockupFrame from './PhoneMockupFrame';
import { HeroMediaAsset } from '@/lib/supabase';

// 로컬 비디오 경로 (public/videos/ 폴더에서 서빙 - Vercel CDN 캐싱)
const LOCAL_HERO_VIDEOS = [
  '/videos/hero1.mp4',
  '/videos/hero2.mp4',
  '/videos/hero3.mp4',
];

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

interface HeroTypeC_MockupProps {
  assets: HeroMediaAsset[];
}

export default function HeroTypeC_Mockup({ assets }: HeroTypeC_MockupProps) {
  // 로컬 비디오 사용 (API 응답 무시하고 로컬 파일 사용)
  const videos = LOCAL_HERO_VIDEOS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isDissolving, setIsDissolving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextVideoIndex = useCallback((current: number) => {
    return (current + 1) % videos.length;
  }, [videos.length]);

  // 영상 끝나면 다음으로 디졸브 전환
  const handleVideoEnded = useCallback(() => {
    if (videos.length <= 1) return;

    setIsDissolving(true);
    setNextIndex(nextVideoIndex(currentIndex));

    // 디졸브 완료 후 인덱스 교체
    setTimeout(() => {
      setCurrentIndex(nextVideoIndex(currentIndex));
      setIsDissolving(false);
    }, 800); // 디졸브 시간
  }, [videos.length, currentIndex, nextVideoIndex]);

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

  const currentVideoUrl = videos[currentIndex];
  const nextVideoUrl = videos[nextIndex];

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
                  key={`current-${currentIndex}`}
                  src={currentVideoUrl}
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
              {isDissolving && (
                <div
                  className="absolute inset-0 transition-opacity duration-800 ease-in-out opacity-100"
                  style={{ transitionDuration: '800ms' }}
                >
                  <video
                    key={`next-${nextIndex}`}
                    src={nextVideoUrl}
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
                {videos.map((_, i) => (
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
              </div>

              {/* Top gradient for status bar area */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            </div>
          </PhoneMockupFrame>
        </div>
      </div>
    </div>
  );
}
