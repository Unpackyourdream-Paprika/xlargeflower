'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import HeroMediaCard from './HeroMediaCard';
import { HeroMediaAsset } from '@/lib/supabase';

interface VerticalMarqueeProps {
  items: HeroMediaAsset[];
  speed?: number;
  direction?: 'up' | 'down';
  className?: string;
}

export default function VerticalMarquee({
  items,
  speed = 30,
  direction = 'up',
  className = '',
}: VerticalMarqueeProps) {
  const baseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 아이템을 3번 반복하여 무한 루프 효과
  const repeatedItems = [...items, ...items, ...items];
  const itemHeight = 280; // 대략적인 카드 높이 + gap
  const totalHeight = items.length * itemHeight;

  useAnimationFrame((time, delta) => {
    const moveBy = (direction === 'up' ? -1 : 1) * speed * (delta / 1000);
    let newY = baseY.get() + moveBy;

    // 무한 루프를 위한 위치 리셋
    if (direction === 'up' && newY <= -totalHeight) {
      newY += totalHeight;
    } else if (direction === 'down' && newY >= 0) {
      newY -= totalHeight;
    }

    baseY.set(newY);
  });

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className={`h-full overflow-hidden ${className}`}>
      <motion.div
        style={{ y: baseY }}
        className="flex flex-col gap-4"
      >
        {repeatedItems.map((item, index) => (
          <HeroMediaCard
            key={`${item.id}-${index}`}
            thumbnailUrl={item.thumbnail_url}
            videoUrl={item.video_url}
            title={item.title}
            className="w-full aspect-[9/16] flex-shrink-0"
          />
        ))}
      </motion.div>
    </div>
  );
}
