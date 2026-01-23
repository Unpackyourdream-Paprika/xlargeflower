'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import HeroTextContent from './HeroTextContent';
import PhoneMockupFrame from './PhoneMockupFrame';
import { HeroMediaAsset } from '@/lib/supabase';
import { decode } from 'blurhash';

// iOS 저전력 모드 대응 비디오 재생 함수
function playVideoSafely(video: HTMLVideoElement) {
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log('Video play failed, retrying...', error);
      // 재생 실패 시 약간의 지연 후 재시도
      setTimeout(() => {
        video.play().catch((e) => console.log('Second play attempt failed:', e));
      }, 100);
    });
  }
}

// Progressive Streaming 최적화 - Fast Start 활성화
function optimizeVideoUrl(url: string, isMobile: boolean): string {
  if (!url.includes('cloudinary.com')) return url;

  // vc_auto = video codec auto
  // so_0 = start offset 0 (fast start를 위해 메타데이터를 파일 시작 부분으로 이동)
  const transformation = isMobile
    ? 'vc_auto,w_270,h_480,c_fill,br_400k,so_0,f_mp4'
    : 'vc_auto,w_320,h_568,c_fill,br_700k,so_0,f_mp4';

  const optimizedUrl = url.replace('/upload/', `/upload/${transformation}/`);
  console.log('Optimized video URL:', optimizedUrl, 'isMobile:', isMobile);
  return optimizedUrl;
}

// BlurHash를 canvas로 디코딩해서 Data URI 생성
// 네트워크 요청 0, HTML 인라인
function getBlurHashDataUrl(blurhash: string | undefined, width: number, height: number): string {
  if (!blurhash) {
    // BlurHash 없으면 Cloudinary 폴백
    return '';
  }

  try {
    const pixels = decode(blurhash, width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.1);
  } catch (e) {
    return '';
  }
}

// Cloudinary 폴백 (BlurHash 없을 때)
function getPosterUrl(url: string): string {
  if (!url.includes('cloudinary.com')) return '';
  return url.replace('/upload/', '/upload/w_8,h_14,c_fill,e_pixelate:10,f_jpg,q_1,so_0/');
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
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const [nextBlurDataUrl, setNextBlurDataUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const currentAsset = assets[currentIndex];
  const nextAsset = assets[nextIndex];

  // BlurHash를 Data URI로 변환 (클라이언트 사이드)
  useEffect(() => {
    if (currentAsset?.blurhash) {
      const dataUrl = getBlurHashDataUrl(currentAsset.blurhash, 32, 56);
      setBlurDataUrl(dataUrl);
    } else if (currentAsset) {
      // 폴백
      setBlurDataUrl(getPosterUrl(currentAsset.video_url));
    }
  }, [currentIndex, currentAsset]);

  useEffect(() => {
    if (nextAsset?.blurhash) {
      const dataUrl = getBlurHashDataUrl(nextAsset.blurhash, 32, 56);
      setNextBlurDataUrl(dataUrl);
    } else if (nextAsset) {
      setNextBlurDataUrl(getPosterUrl(nextAsset.video_url));
    }
  }, [nextIndex, nextAsset]);

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
                {/* Current Video - 즉시 스트리밍 시작 */}
                <div
                  className={`absolute inset-0 transition-opacity duration-800 ease-in-out z-10 ${
                    isDissolving ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{ transitionDuration: '800ms' }}
                >
                  {/* BlurHash Placeholder - 비디오 로딩 전까지만 표시 */}
                  {blurDataUrl && (
                    <img
                      src={blurDataUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        imageRendering: 'pixelated',
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)'
                      }}
                    />
                  )}
                  <video
                    ref={videoRef}
                    key={`current-${currentAsset.id}`}
                    src={optimizeVideoUrl(currentAsset.video_url, isMobile)}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    webkit-playsinline="true"
                    onEnded={handleVideoEnded}
                    onLoadedData={(e) => {
                      console.log('Video loaded:', e.currentTarget.src);
                      playVideoSafely(e.currentTarget);
                    }}
                    onCanPlay={(e) => {
                      console.log('Video can play:', e.currentTarget.src);
                      playVideoSafely(e.currentTarget);
                    }}
                    onPlay={() => console.log('Video playing')}
                    onError={(e) => console.error('Video error:', e)}
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>

                {/* Next Video - 페이드 인 (디졸브 시에만 표시) */}
                {isDissolving && nextAsset && (
                  <div
                    className="absolute inset-0 transition-opacity duration-800 ease-in-out opacity-100 z-20"
                    style={{ transitionDuration: '800ms' }}
                  >
                    {/* Next BlurHash Placeholder */}
                    {nextBlurDataUrl && (
                      <img
                        src={nextBlurDataUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          imageRendering: 'pixelated',
                          filter: 'blur(20px)',
                          transform: 'scale(1.1)'
                        }}
                      />
                    )}
                    <video
                      key={`next-${nextAsset.id}`}
                      src={optimizeVideoUrl(nextAsset.video_url, isMobile)}
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      webkit-playsinline="true"
                      onLoadedData={(e) => playVideoSafely(e.currentTarget)}
                      onCanPlay={(e) => playVideoSafely(e.currentTarget)}
                      onError={(e) => console.error('Next video error:', e)}
                      className="w-full h-full object-cover relative z-10"
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
