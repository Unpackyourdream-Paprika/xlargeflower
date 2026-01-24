'use client';

import { useEffect, useState } from 'react';

export default function AuroraBackground() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 테마 감지
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsLightTheme(theme === 'light');
    };
    checkTheme();

    // MutationObserver로 테마 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('resize', checkMobile);
      observer.disconnect();
    };
  }, []);

  if (!mounted) return null;

  // 라이트 테마에서는 오로라 배경 숨김 - 깔끔한 흰색 배경
  if (isLightTheme) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#FAFAFA]" />
    );
  }

  // 모바일에서는 간소화된 버전 (오브 2개만, 애니메이션 없음)
  if (isMobile) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 모바일: 정적 그라데이션 배경 (애니메이션 없음) */}
        <div
          className="absolute"
          style={{
            width: '300px',
            height: '300px',
            top: '-10%',
            left: '-5%',
            borderRadius: '50%',
            filter: 'blur(60px)',
            background: 'radial-gradient(circle, rgba(0, 245, 160, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '250px',
            height: '250px',
            top: '20%',
            right: '-10%',
            borderRadius: '50%',
            filter: 'blur(60px)',
            background: 'radial-gradient(circle, rgba(0, 217, 245, 0.25) 0%, transparent 70%)',
          }}
        />
        {/* Center vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 0%, rgba(5, 5, 5, 0.7) 100%)',
          }}
        />
      </div>
    );
  }

  // 데스크톱: 기존 애니메이션 유지
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Aurora Orb 1 - Main Mint */}
      <div
        className="aurora-orb aurora-orb-1"
        style={{
          background: 'radial-gradient(circle, rgba(0, 245, 160, 0.7) 0%, rgba(0, 245, 160, 0.25) 40%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 2 - Cyan */}
      <div
        className="aurora-orb aurora-orb-2"
        style={{
          background: 'radial-gradient(circle, rgba(0, 217, 245, 0.65) 0%, rgba(0, 217, 245, 0.2) 40%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 3 - Bright Violet accent */}
      <div
        className="aurora-orb aurora-orb-3"
        style={{
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.65) 0%, rgba(138, 43, 226, 0.25) 40%, transparent 70%)',
        }}
      />

      {/* Aurora Orb 4 - Bright Pink */}
      <div
        className="aurora-orb aurora-orb-4"
        style={{
          background: 'radial-gradient(circle, rgba(255, 105, 180, 0.6) 0%, rgba(255, 105, 180, 0.2) 40%, transparent 70%)',
        }}
      />

      {/* Center vignette for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 0%, rgba(5, 5, 5, 0.4) 100%)',
        }}
      />
    </div>
  );
}
