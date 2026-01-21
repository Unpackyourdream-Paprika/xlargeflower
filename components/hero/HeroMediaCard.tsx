'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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

interface HeroMediaCardProps {
  thumbnailUrl: string;
  videoUrl: string;
  title?: string;
  className?: string;
}

export default function HeroMediaCard({
  thumbnailUrl,
  videoUrl,
  title,
  className = '',
}: HeroMediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Cloudinary 비디오 URL 최적화 - 모바일에서 더 낮은 품질
  const optimizedVideoUrl = videoUrl.includes('cloudinary.com')
    ? videoUrl.replace('/upload/', isMobile
        ? '/upload/w_240,q_auto:eco,br_300k/'
        : '/upload/w_360,q_auto:low/')
    : videoUrl;

  // IntersectionObserver로 뷰포트 진입 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered && isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, isInView]);

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl border border-[rgba(0,245,160,0.15)] shadow-[0_0_20px_rgba(0,245,160,0.08)] ${className}`}
      whileHover={{ scale: isMobile ? 1 : 1.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={title || 'Hero media'}
        loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video - 뷰포트에 있을 때만 로드 */}
      {isInView && (
        <video
          ref={videoRef}
          src={optimizedVideoUrl}
          muted
          loop
          playsInline
          preload="none"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </motion.div>
  );
}
