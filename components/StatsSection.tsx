'use client';

import { useState, useEffect, useRef } from 'react';
import { useCountUp } from './animations/useCountUp';

// Circuit Pattern SVG Background - Enhanced with better visibility
const CircuitPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.08]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        {/* Horizontal lines */}
        <line x1="0" y1="20" x2="30" y2="20" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="0.5" />
        <line x1="40" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="0.5" />
        <line x1="80" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
        <line x1="0" y1="80" x2="40" y2="80" stroke="currentColor" strokeWidth="0.5" />
        <line x1="60" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="0.5" />

        {/* Vertical lines */}
        <line x1="20" y1="0" x2="20" y2="30" stroke="currentColor" strokeWidth="0.5" />
        <line x1="20" y1="70" x2="20" y2="100" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="0" x2="50" y2="20" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="40" x2="50" y2="60" stroke="currentColor" strokeWidth="0.5" />
        <line x1="80" y1="30" x2="80" y2="70" stroke="currentColor" strokeWidth="0.5" />

        {/* Connection dots */}
        <circle cx="20" cy="20" r="2" fill="currentColor" />
        <circle cx="50" cy="20" r="1.5" fill="currentColor" />
        <circle cx="80" cy="50" r="2" fill="currentColor" />
        <circle cx="20" cy="50" r="1.5" fill="currentColor" />
        <circle cx="50" cy="80" r="1.5" fill="currentColor" />
        <circle cx="40" cy="50" r="1.5" fill="currentColor" />

        {/* Small squares (chips) */}
        <rect x="45" y="45" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <rect x="75" y="75" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#circuit)" className="text-cyan-400" />
  </svg>
);

// Neon Box Icon (Deliveries) - Enhanced Glow
const BoxIcon = () => (
  <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F5A0" />
        <stop offset="50%" stopColor="#00D9F5" />
        <stop offset="100%" stopColor="#004EFF" />
      </linearGradient>
      <filter id="boxGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#boxGlow)">
      {/* Box body */}
      <path
        d="M48 12L80 28V68L48 84L16 68V28L48 12Z"
        stroke="url(#boxGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Middle line */}
      <path
        d="M16 28L48 44L80 28"
        stroke="url(#boxGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Vertical line */}
      <path
        d="M48 44V84"
        stroke="url(#boxGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Top flap detail */}
      <path
        d="M32 20L48 28L64 20"
        stroke="url(#boxGradient)"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
    </g>
  </svg>
);

// Neon Stopwatch Icon (Speed) - Enhanced Glow
const StopwatchIcon = () => (
  <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="watchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F5A0" />
        <stop offset="50%" stopColor="#00D9F5" />
        <stop offset="100%" stopColor="#004EFF" />
      </linearGradient>
      <filter id="watchGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#watchGlow)">
      {/* Main circle */}
      <circle
        cx="48"
        cy="52"
        r="32"
        stroke="url(#watchGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Top button */}
      <rect
        x="44"
        y="10"
        width="8"
        height="12"
        rx="2"
        stroke="url(#watchGradient)"
        strokeWidth="2"
        fill="none"
      />
      {/* Side button */}
      <rect
        x="72"
        y="32"
        width="10"
        height="6"
        rx="2"
        stroke="url(#watchGradient)"
        strokeWidth="2"
        fill="none"
      />
      {/* Clock hands */}
      <path
        d="M48 52V36"
        stroke="url(#watchGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M48 52L60 58"
        stroke="url(#watchGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Center dot */}
      <circle
        cx="48"
        cy="52"
        r="4"
        fill="url(#watchGradient)"
      />
    </g>
  </svg>
);

// Neon Thumbs Up Icon (Satisfaction) - Enhanced Glow
const ThumbsUpIcon = () => (
  <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00F5A0" />
        <stop offset="50%" stopColor="#00D9F5" />
        <stop offset="100%" stopColor="#004EFF" />
      </linearGradient>
      <filter id="thumbGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#thumbGlow)">
      {/* Thumb */}
      <path
        d="M36 44C36 44 40 24 48 20C56 16 60 24 60 32V40H72C76 40 80 44 80 48V52C80 56 78 60 74 64L66 76C64 80 60 82 56 82H32"
        stroke="url(#thumbGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Wrist/Palm area */}
      <rect
        x="16"
        y="44"
        width="20"
        height="38"
        rx="4"
        stroke="url(#thumbGradient)"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Cuff detail */}
      <path
        d="M16 56H36"
        stroke="url(#thumbGradient)"
        strokeWidth="1.5"
        opacity="0.6"
      />
    </g>
  </svg>
);

// Individual Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  isVisible: boolean;
  delay: number;
}

const StatCard = ({ icon, value, suffix, label, isVisible, delay }: StatCardProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  const { displayValue } = useCountUp({
    end: value,
    duration: 1800,
    suffix,
    enabled: shouldAnimate,
  });

  return (
    <div
      className={`flex flex-col items-center transition-all duration-700 ${
        shouldAnimate
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Icon */}
      <div className="mb-8 transform transition-transform duration-500 hover:scale-110">
        {icon}
      </div>

      {/* Number - Even larger with enhanced gradient */}
      <div className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter mb-4 leading-none">
        <span
          className="bg-clip-text text-transparent animate-gradient"
          style={{
            backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5, #004EFF, #00D9F5, #00F5A0)',
            backgroundSize: '200% 100%',
          }}
        >
          {shouldAnimate ? displayValue : '0' + suffix}
        </span>
      </div>

      {/* Label */}
      <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-medium tracking-wide">
        {label}
      </p>
    </div>
  );
};

export default function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.3,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      icon: <BoxIcon />,
      value: 500,
      suffix: '+',
      label: '누적 납품 건수',
    },
    {
      icon: <StopwatchIcon />,
      value: 48,
      suffix: '시간',
      label: '평균 제작 시간',
    },
    {
      icon: <ThumbsUpIcon />,
      value: 98,
      suffix: '%',
      label: '고객 만족도',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-28 sm:py-36 md:py-44 overflow-hidden"
    >
      {/* Premium Gradient Background - Deep Black to Deep Violet & Electric Blue */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #0D0015 25%, #1A0033 50%, #0D0D2B 75%, #001133 100%)',
        }}
      />

      {/* Secondary gradient overlay - Violet & Blue accent */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 50%, rgba(46, 2, 73, 0.4) 0%, transparent 60%), radial-gradient(ellipse 80% 50% at 80% 50%, rgba(0, 78, 255, 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Central glow effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0, 217, 245, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Circuit Pattern - Enhanced visibility */}
      <CircuitPattern />

      {/* Animated floating particles - fixed positions to avoid hydration mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[2px] h-[2px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[10%] top-[15%]" style={{ animationDelay: '0s', animationDuration: '3s' }} />
        <div className="absolute w-[1px] h-[1px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[25%] top-[8%]" style={{ animationDelay: '0.5s', animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-[#004EFF]/40 rounded-full animate-pulse left-[45%] top-[20%]" style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
        <div className="absolute w-[1px] h-[2px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[70%] top-[12%]" style={{ animationDelay: '1.5s', animationDuration: '4.5s' }} />
        <div className="absolute w-[2px] h-[1px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[85%] top-[25%]" style={{ animationDelay: '2s', animationDuration: '3s' }} />
        <div className="absolute w-[1px] h-[1px] bg-[#004EFF]/40 rounded-full animate-pulse left-[5%] top-[40%]" style={{ animationDelay: '0.3s', animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[20%] top-[55%]" style={{ animationDelay: '0.8s', animationDuration: '3.5s' }} />
        <div className="absolute w-[1px] h-[2px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[35%] top-[45%]" style={{ animationDelay: '1.3s', animationDuration: '4.5s' }} />
        <div className="absolute w-[2px] h-[1px] bg-[#004EFF]/40 rounded-full animate-pulse left-[55%] top-[60%]" style={{ animationDelay: '1.8s', animationDuration: '3s' }} />
        <div className="absolute w-[1px] h-[1px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[75%] top-[50%]" style={{ animationDelay: '2.3s', animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[90%] top-[65%]" style={{ animationDelay: '0.2s', animationDuration: '3.5s' }} />
        <div className="absolute w-[1px] h-[2px] bg-[#004EFF]/40 rounded-full animate-pulse left-[8%] top-[75%]" style={{ animationDelay: '0.7s', animationDuration: '4.5s' }} />
        <div className="absolute w-[2px] h-[1px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[30%] top-[85%]" style={{ animationDelay: '1.2s', animationDuration: '3s' }} />
        <div className="absolute w-[1px] h-[1px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[50%] top-[78%]" style={{ animationDelay: '1.7s', animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-[#004EFF]/40 rounded-full animate-pulse left-[65%] top-[88%]" style={{ animationDelay: '2.2s', animationDuration: '3.5s' }} />
        <div className="absolute w-[1px] h-[2px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[80%] top-[80%]" style={{ animationDelay: '2.7s', animationDuration: '4.5s' }} />
        <div className="absolute w-[2px] h-[1px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[95%] top-[35%]" style={{ animationDelay: '0.4s', animationDuration: '3s' }} />
        <div className="absolute w-[1px] h-[1px] bg-[#004EFF]/40 rounded-full animate-pulse left-[15%] top-[30%]" style={{ animationDelay: '0.9s', animationDuration: '4s' }} />
        <div className="absolute w-[2px] h-[2px] bg-[#00F5A0]/40 rounded-full animate-pulse left-[40%] top-[70%]" style={{ animationDelay: '1.4s', animationDuration: '3.5s' }} />
        <div className="absolute w-[1px] h-[2px] bg-[#00D9F5]/40 rounded-full animate-pulse left-[60%] top-[38%]" style={{ animationDelay: '1.9s', animationDuration: '4.5s' }} />
      </div>

      {/* Large ambient glow orbs */}
      <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-[#2E0249]/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-[#004EFF]/15 rounded-full blur-[150px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00D9F5]/5 rounded-full blur-[200px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div
          className={`text-center mb-20 sm:mb-24 md:mb-28 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-xs sm:text-sm font-bold tracking-[0.2em] text-[#00D9F5]/80 uppercase mb-4">
            PROVEN RESULTS
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            숫자로 증명하는{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #00F5A0, #00D9F5, #004EFF)',
              }}
            >
              XLARGE
            </span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              isVisible={isVisible}
              delay={index * 200}
            />
          ))}
        </div>

        {/* Bottom accent line */}
        <div
          className={`mt-20 sm:mt-24 md:mt-28 flex justify-center transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}
        >
          <div
            className="w-48 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, #00F5A0, #00D9F5, #004EFF, transparent)',
            }}
          />
        </div>
      </div>

      {/* Bottom edge gradient for seamless transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />
    </section>
  );
}
