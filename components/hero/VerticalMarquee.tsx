'use client';

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
  className = '',
}: VerticalMarqueeProps) {
  if (items.length === 0) return null;

  return (
    <div className={`h-full overflow-hidden ${className}`}>
      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <HeroMediaCard
            key={`${item.id}-${index}`}
            thumbnailUrl={item.thumbnail_url}
            videoUrl={item.video_url}
            title={item.title}
            className="w-full aspect-[9/16] flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
}
