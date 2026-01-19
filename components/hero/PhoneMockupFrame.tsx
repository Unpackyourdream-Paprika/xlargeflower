'use client';

import { ReactNode, useEffect, useState } from 'react';

interface PhoneMockupFrameProps {
  children: ReactNode;
  className?: string;
}

export default function PhoneMockupFrame({ children, className = '' }: PhoneMockupFrameProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스크롤에 따른 패럴랙스 값 계산 (가로 회전 강화)
  const parallaxY = scrollY * 0.15;
  const parallaxRotateX = 5 + scrollY * 0.015;
  const parallaxRotateY = -12 + scrollY * 0.04; // 가로 회전 강화: -12deg에서 시작, 스크롤 시 정면으로

  return (
    <div className={`relative ${className}`} style={{ perspective: '1000px' }}>
      {/* 3D Transform wrapper with parallax */}
      <div
        className="relative transform-gpu transition-transform duration-100 ease-out"
        style={{
          transform: `rotateY(${parallaxRotateY}deg) rotateX(${parallaxRotateX}deg) translateY(${-parallaxY}px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Phone body - iPhone style */}
        <div className="relative w-[280px] sm:w-[300px] lg:w-[320px] bg-[#1a1a1a] rounded-[45px] p-[10px] shadow-2xl shadow-black/60">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-br from-[#00F5A0]/20 via-transparent to-[#00D9F5]/20 rounded-[50px] blur-xl opacity-60" />

          {/* Phone frame border */}
          <div className="relative bg-[#0a0a0a] rounded-[38px] p-[3px] border border-[#333]">
            {/* Inner screen area */}
            <div className="relative bg-black rounded-[35px] overflow-hidden">
              {/* Dynamic Island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#1a1a1a] rounded-full mr-6" />
              </div>

              {/* Screen content area */}
              <div className="w-full aspect-[9/19.5] overflow-hidden">
                {children}
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Side buttons - Volume */}
          <div className="absolute left-[-2px] top-[100px] w-[3px] h-[30px] bg-[#333] rounded-l" />
          <div className="absolute left-[-2px] top-[140px] w-[3px] h-[50px] bg-[#333] rounded-l" />

          {/* Side button - Power */}
          <div className="absolute right-[-2px] top-[120px] w-[3px] h-[60px] bg-[#333] rounded-r" />
        </div>

        {/* Reflection effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-[45px] pointer-events-none" />
      </div>

      {/* Shadow under phone */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[40px] bg-[#00F5A0]/10 rounded-full blur-2xl"
        style={{ transform: 'translateX(-50%) rotateX(80deg)' }}
      />
    </div>
  );
}
