'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { ShowcaseVideo } from '@/lib/supabase';

// wrap 함수: 값을 min과 max 범위 내에서 순환시킴
function wrap(min: number, max: number, value: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

// 폴백 비디오 (DB에 데이터 없을 때 사용)
const FALLBACK_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-clouds-32807-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-woman-modeling-hoop-earrings-4902-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-curly-haired-woman-looking-at-camera-4693-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-changing-lights-1240-large.mp4',
];

interface VideoCardProps {
  src: string;
  index: number;
}

function VideoCard({ src, index }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 relative overflow-hidden rounded-3xl border border-[rgba(0,245,160,0.15)] shadow-[0_0_30px_rgba(0,245,160,0.08)]"
      style={{
        width: '180px',
        height: '320px',
        marginLeft: index > 0 ? '-16px' : '0', // 겹침 효과
        zIndex: isHovered ? 50 : 10 - (index % 10),
      }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 비디오 */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{ filter: isHovered ? 'none' : 'brightness(0.8)' }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* 오버레이 (hover 시 사라짐) */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* 하단 그라데이션 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </motion.div>
  );
}

interface ParallaxRowProps {
  videos: string[];
  baseVelocity: number;
  direction: 1 | -1;
}

function ParallaxRow({ videos, baseVelocity, direction }: ParallaxRowProps) {
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

  // 무한 루프를 위한 x 위치 계산
  const x = useTransform(baseX, (v) => `${wrap(-25, -75, v)}%`);

  const directionFactor = useRef<number>(direction);

  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // 스크롤 방향에 따라 속도 조절
    if (velocityFactor.get() < 0) {
      directionFactor.current = -direction;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = direction;
    }

    // 스크롤 속도에 따른 가속
    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  // 비디오를 4번 반복하여 무한 루프 효과
  const repeatedVideos = [...videos, ...videos, ...videos, ...videos];

  return (
    <motion.div className="flex items-center" style={{ x }}>
      {repeatedVideos.map((video, index) => (
        <VideoCard key={`${video}-${index}`} src={video} index={index} />
      ))}
    </motion.div>
  );
}

interface VideoMarqueeProps {
  videos?: ShowcaseVideo[];
}

export default function VideoMarquee({ videos }: VideoMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // DB 데이터가 있으면 사용, 없으면 폴백
  const videoUrls = videos && videos.length > 0
    ? videos.map(v => v.video_url)
    : FALLBACK_VIDEOS;

  // Row 1과 Row 2에 다른 순서로 비디오 배분
  const row1Videos = videoUrls;
  const row2Videos = [...videoUrls].reverse();

  return (
    <section
      ref={containerRef}
      className="py-16 md:py-24 overflow-hidden bg-[#050505] relative"
    >
      {/* 좌우 그라데이션 오버레이 */}
      <div className="absolute top-0 bottom-0 left-0 w-40 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-40 bg-gradient-to-l from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />

      {/* 섹션 헤더 */}
      <div className="text-center mb-12 px-6 relative z-30">
        <p className="label-tag mb-4">AI-GENERATED CREATIVES</p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          모두 AI가 만들었습니다
        </h2>
        <p className="text-white/60 mt-4 max-w-xl mx-auto">
          촬영 없이, 모델 섭외 없이. 48시간 안에 이 퀄리티가 나옵니다.
        </p>
      </div>

      {/* 비디오 월 - 살짝 기울임 */}
      <div className="relative -rotate-2 space-y-4">
        {/* Row 1: 오른쪽으로 이동 */}
        <div className="overflow-hidden">
          <ParallaxRow videos={row1Videos} baseVelocity={-2} direction={1} />
        </div>

        {/* Row 2: 왼쪽으로 이동 (데스크톱만) */}
        <div className="overflow-hidden hidden md:block">
          <ParallaxRow videos={row2Videos} baseVelocity={2} direction={-1} />
        </div>
      </div>

      {/* 통계 */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-center px-6 relative z-30">
        <div>
          <div className="text-2xl md:text-3xl font-bold gradient-text">500+</div>
          <div className="text-white/50 text-sm mt-1">납품 완료</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold gradient-text">48h</div>
          <div className="text-white/50 text-sm mt-1">평균 제작</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold gradient-text">98%</div>
          <div className="text-white/50 text-sm mt-1">만족도</div>
        </div>
      </div>
    </section>
  );
}
