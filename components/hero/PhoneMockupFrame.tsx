'use client';

import { ReactNode, useEffect, useState } from 'react';

interface PhoneMockupFrameProps {
  children: ReactNode;
  className?: string;
}

export default function PhoneMockupFrame({ children, className = '' }: PhoneMockupFrameProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone wrapper - 패딩 추가로 glow와 버튼이 안쪽에 유지 */}
      <div className="relative px-2">
        {/* Phone body - iPhone style */}
        <div className="relative w-[280px] sm:w-[300px] lg:w-[320px] bg-[#1a1a1a] rounded-[45px] p-[10px] shadow-2xl shadow-black/60">
          {/* Outer glow - 부모 안쪽에 유지 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F5A0]/20 via-transparent to-[#00D9F5]/20 rounded-[50px] blur-lg opacity-60" />

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

          {/* Side buttons - Volume - 안쪽에 배치 */}
          <div className="absolute left-0 top-[100px] w-[2px] h-[30px] bg-[#333] rounded-l" />
          <div className="absolute left-0 top-[140px] w-[2px] h-[50px] bg-[#333] rounded-l" />

          {/* Side button - Power */}
          <div className="absolute right-0 top-[120px] w-[2px] h-[60px] bg-[#333] rounded-r" />
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
