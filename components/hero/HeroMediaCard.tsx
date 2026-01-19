'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cloudinary 비디오 URL 최적화
  const optimizedVideoUrl = videoUrl.includes('cloudinary.com')
    ? videoUrl.replace('/upload/', '/upload/w_480,q_auto:low/')
    : videoUrl;

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-[rgba(0,245,160,0.15)] shadow-[0_0_20px_rgba(0,245,160,0.08)] ${className}`}
      whileHover={{ scale: 1.03 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <img
        src={thumbnailUrl}
        alt={title || 'Hero media'}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video */}
      <video
        ref={videoRef}
        src={optimizedVideoUrl}
        muted
        loop
        playsInline
        preload="metadata"
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

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
