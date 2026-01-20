'use client';

import { useRef, ReactNode, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  // CSS 기반 애니메이션으로 전환 (Framer-motion 제거)
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // delay 적용 후 애니메이션 트리거
          setTimeout(() => {
            setIsInView(true);
          }, delay * 1000);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  // 방향별 초기 transform 값
  const directionStyles = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${className} ${
        isInView
          ? 'opacity-100 translate-x-0 translate-y-0'
          : `opacity-0 ${directionStyles[direction]}`
      }`}
      style={{
        transitionDuration: '0.6s',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  );
}
