'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { ShowcaseVideo } from '@/lib/supabase';
import { useCountUp } from './animations/useCountUp';

// wrap 함수: 값을 min과 max 범위 내에서 순환시킴
function wrap(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
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

interface VideoCardProps {
  src: string;
  webpSrc?: string;  // WebP 미리보기 URL
  index: number;
  isMobile?: boolean;
}

function VideoCard({ src, webpSrc, index, isMobile = false }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cloudinary URL 최적화
  const optimizedVideoUrl = src.includes('cloudinary.com')
    ? src.replace('/upload/', '/upload/w_280,h_500,c_limit,q_auto:low/')
    : src;

  // 비디오 첫 프레임 썸네일 (Cloudinary 자동 추출)
  const thumbnailUrl = src.includes('cloudinary.com')
    ? src.replace('/upload/', '/upload/w_180,h_320,c_fill,so_0,f_jpg,q_auto:eco/').replace('.mp4', '.jpg')
    : '';

  // 비디오 재생 함수 - 데스크톱 전용
  const playVideo = (video: HTMLVideoElement) => {
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
  };

  // 데스크톱에서만 IntersectionObserver 사용
  useEffect(() => {
    if (isMobile) return; // 모바일에서는 비디오 로드 안함

    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          playVideo(video);
        } else {
          video.pause();
        }
      },
      { threshold: 0, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="flex-shrink-0 relative overflow-hidden rounded-3xl border border-[rgba(0,245,160,0.15)] shadow-[0_0_30px_rgba(0,245,160,0.08)] transition-transform duration-300"
      style={{
        width: isMobile ? '150px' : '180px',
        height: isMobile ? '267px' : '320px',
        marginLeft: index > 0 ? '12px' : '0',
        zIndex: isHovered ? 50 : 10,
        transform: isHovered && !isMobile ? 'scale(1.05)' : 'scale(1)',
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* 썸네일 - 비디오 로딩 완료 전까지 표시 */}
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            !isMobile && isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}

      {/* 데스크톱: 비디오 재생 */}
      {!isMobile && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={(e) => playVideo(e.currentTarget)}
          onCanPlay={() => setIsVideoLoaded(true)}
          className="w-full h-full object-cover relative z-10"
          src={optimizedVideoUrl}
        />
      )}
    </div>
  );
}

interface VideoItem {
  videoUrl: string;
  webpUrl?: string;
}

interface ParallaxRowProps {
  videos: VideoItem[];
  baseVelocity: number;
  direction: 1 | -1;
  isMobile?: boolean;
}

// 데스크톱용 패럴랙스 Row (기존 로직)
function DesktopParallaxRow({ videos, baseVelocity, direction }: ParallaxRowProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-25, -75, v)}%`);
  const directionFactor = useRef<number>(direction);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -direction;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = direction;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const repeatedVideos = [...videos, ...videos, ...videos, ...videos];

  return (
    <motion.div className="flex items-center" style={{ x }}>
      {repeatedVideos.map((video, index) => (
        <VideoCard
          key={`${video.videoUrl}-${index}`}
          src={video.videoUrl}
          webpSrc={video.webpUrl}
          index={index}
          isMobile={false}
        />
      ))}
    </motion.div>
  );
}

// 모바일용 CSS 애니메이션 Row (경량화)
function MobileScrollRow({ videos, direction }: { videos: VideoItem[]; direction: 1 | -1 }) {
  // 모바일에서는 최대 6개만 표시 (메모리 절약)
  const limitedVideos = videos.slice(0, 6);
  const animationClass = direction === 1 ? 'animate-scroll-left-mobile' : 'animate-scroll-right-mobile';

  return (
    <div className={`flex items-center ${animationClass}`} style={{ width: 'max-content' }}>
      {limitedVideos.map((video, index) => (
        <VideoCard
          key={`${video.videoUrl}-${index}`}
          src={video.videoUrl}
          webpSrc={video.webpUrl}
          index={index}
          isMobile={true}
        />
      ))}
    </div>
  );
}

function ParallaxRow({ videos, baseVelocity, direction, isMobile = false }: ParallaxRowProps) {
  if (isMobile) {
    return <MobileScrollRow videos={videos} direction={direction} />;
  }
  return <DesktopParallaxRow videos={videos} baseVelocity={baseVelocity} direction={direction} />;
}

// 카운팅 애니메이션 컴포넌트
interface AnimatedStatProps {
  value: number;
  suffix: string;
  label: string;
  isVisible: boolean;
  delay: number;
  isMobile?: boolean;
}

function AnimatedStat({ value, suffix, label, isVisible, delay, isMobile = false }: AnimatedStatProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  // 모바일에서는 애니메이션 비활성화 - 즉시 최종값 표시
  const { displayValue } = useCountUp({
    end: value,
    duration: isMobile ? 0 : 1800,
    suffix,
    enabled: shouldAnimate,
  });

  // 모바일에서는 즉시 표시
  const finalValue = isMobile && shouldAnimate ? `${value}${suffix}` : (shouldAnimate ? displayValue : '0' + suffix);

  return (
    <div
      className={`transition-all duration-700 ${
        shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
        <span
          className="bg-clip-text text-transparent animate-gradient"
          style={{
            backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5, #00F5A0)',
            backgroundSize: '200% 100%',
          }}
        >
          {finalValue}
        </span>
      </div>
      <div className="text-white/60 text-base sm:text-lg md:text-xl mt-3">{label}</div>
    </div>
  );
}

interface VideoMarqueeProps {
  videos?: ShowcaseVideo[];
}

export default function VideoMarquee({ videos }: VideoMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [shouldLoadVideos, setShouldLoadVideos] = useState(false);
  const isMobile = useIsMobile();

  // 섹션이 뷰포트에 진입하면 비디오 로드 시작 (모바일에서는 이미지만 표시하므로 즉시 true)
  useEffect(() => {
    if (isMobile) {
      setShouldLoadVideos(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadVideos(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '200px' } // 200px 미리 로드 시작
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isMobile]);

  // 통계 섹션 스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // DB 데이터를 VideoItem 형태로 변환
  const videoItems: VideoItem[] = videos && videos.length > 0
    ? videos.map(v => ({
        videoUrl: v.video_url,
        webpUrl: v.thumbnail_webp_url
      }))
    : [];

  // Row 1과 Row 2에 다른 순서로 비디오 배분
  const row1Videos = videoItems;
  const row2Videos = [...videoItems].reverse();

  const hasVideos = videoItems.length > 0;

  return (
    <section
      ref={containerRef}
      className="py-16 md:py-24 overflow-hidden bg-[#050505] relative"
    >
      {/* 섹션 헤더 */}
      <div className="text-center mb-12 px-6 relative z-30">
        <p className="label-tag mb-4">AI-GENERATED CREATIVES</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          모두 이곳에서 만들었습니다
        </h2>
        <p className="text-white/60 mt-4 max-w-xl mx-auto">
          촬영 없이, 모델 섭외 없이. 48시간 안에 이 퀄리티가 나옵니다.
        </p>
      </div>

      {/* 비디오 월 - 살짝 기울임 (비디오 있을 때만, 뷰포트 진입 후 로드) */}
      {hasVideos && shouldLoadVideos && (
        <div className="relative -rotate-2 space-y-4">
          {/* Row 1: 오른쪽으로 이동 */}
          <div className="overflow-hidden">
            <ParallaxRow videos={row1Videos} baseVelocity={-2} direction={1} isMobile={isMobile} />
          </div>

          {/* Row 2: 왼쪽으로 이동 (데스크톱만) */}
          <div className="overflow-hidden hidden md:block">
            <ParallaxRow videos={row2Videos} baseVelocity={2} direction={-1} isMobile={false} />
          </div>
        </div>
      )}

      {/* 통계 - 크게 강조 + 카운팅 애니메이션 (항상 표시) */}
      <div
        ref={statsRef}
        className={`${hasVideos ? 'mt-20 md:mt-28' : 'mt-8'} flex flex-wrap justify-center gap-12 sm:gap-16 md:gap-24 lg:gap-32 text-center px-6 relative z-30`}
      >
        <AnimatedStat value={500} suffix="+" label="납품 완료" isVisible={statsVisible} delay={0} isMobile={isMobile} />
        <AnimatedStat value={48} suffix="h" label="평균 제작" isVisible={statsVisible} delay={150} isMobile={isMobile} />
        <AnimatedStat value={98} suffix="%" label="만족도" isVisible={statsVisible} delay={300} isMobile={isMobile} />
      </div>
    </section>
  );
}
