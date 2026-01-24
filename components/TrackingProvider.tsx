'use client';

import { useEffect, useRef, useCallback } from 'react';
import { tracking } from '@/lib/userTracking';

// 추적할 섹션 정의
const TRACKED_SECTIONS = [
  { selector: '[data-section="hero"]', name: 'Hero' },
  { selector: '[data-section="video-showcase"]', name: 'Video Showcase' },
  { selector: '[data-section="artist-lineup"]', name: 'Artist Lineup' },
  { selector: '[data-section="how-it-works"]', name: 'How It Works' },
  { selector: '[data-section="portfolio"]', name: 'Portfolio' },
  { selector: '#why-ai', name: 'Why AI' },
  { selector: '[data-section="our-position"]', name: 'Our Position' },
  { selector: '[data-section="pricing"]', name: 'Pricing' },
  { selector: '[data-section="social-proof"]', name: 'Social Proof' },
  { selector: '[data-section="final-cta"]', name: 'Final CTA' },
];

interface SectionStats {
  name: string;
  enterTime: number | null;
  totalTime: number;
  scrollDepth: number;
}

export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  const sessionStartTime = useRef<number>(Date.now());
  const sectionStats = useRef<Map<string, SectionStats>>(new Map());
  const lastScrollDepth = useRef<number>(0);
  const clickCount = useRef<number>(0);
  const interactedElements = useRef<Set<string>>(new Set());
  const visibleSections = useRef<Set<string>>(new Set());
  const hasTrackedPageView = useRef<boolean>(false);

  // 섹션 초기화
  const initializeSections = useCallback(() => {
    TRACKED_SECTIONS.forEach(({ name }) => {
      if (!sectionStats.current.has(name)) {
        sectionStats.current.set(name, {
          name,
          enterTime: null,
          totalTime: 0,
          scrollDepth: 0
        });
      }
    });
  }, []);

  // 클릭 핸들러
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    clickCount.current++;

    // 클릭한 요소 정보 수집
    const element = target.tagName.toLowerCase();
    const text = target.textContent?.trim().substring(0, 50) || '';
    const classList = Array.from(target.classList).join(' ');

    // 클릭한 섹션 찾기
    let section = 'Unknown';
    for (const { selector, name } of TRACKED_SECTIONS) {
      if (target.closest(selector)) {
        section = name;
        break;
      }
    }

    // 버튼, 링크, 카드 등 중요한 요소만 추적
    const isTrackable =
      element === 'button' ||
      element === 'a' ||
      target.closest('button') ||
      target.closest('a') ||
      classList.includes('btn') ||
      classList.includes('card') ||
      target.getAttribute('role') === 'button';

    if (isTrackable) {
      const elementId = target.id || classList.substring(0, 30) || element;
      interactedElements.current.add(`${section}:${elementId}`);

      tracking.trackClick(
        elementId,
        text,
        section,
        { x: Math.round(e.clientX), y: Math.round(e.clientY) }
      );
    }
  }, []);

  // 스크롤 핸들러
  const handleScroll = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScroll = window.scrollY;
    const scrollPercent = Math.round((currentScroll / scrollHeight) * 100);

    if (scrollPercent > lastScrollDepth.current) {
      lastScrollDepth.current = scrollPercent;
    }

    // 섹션 가시성 체크 및 시간 추적
    TRACKED_SECTIONS.forEach(({ selector, name }) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;

      const stats = sectionStats.current.get(name);
      if (!stats) return;

      if (isVisible) {
        if (!visibleSections.current.has(name)) {
          // 섹션 진입
          visibleSections.current.add(name);
          stats.enterTime = Date.now();
        }

        // 섹션 내 스크롤 깊이 계산
        const sectionScrollDepth = Math.max(0, Math.min(100,
          Math.round(((window.innerHeight - rect.top) / (rect.height + window.innerHeight)) * 100)
        ));
        if (sectionScrollDepth > stats.scrollDepth) {
          stats.scrollDepth = sectionScrollDepth;
        }
      } else {
        if (visibleSections.current.has(name) && stats.enterTime) {
          // 섹션 이탈
          const duration = (Date.now() - stats.enterTime) / 1000;
          stats.totalTime += duration;
          stats.enterTime = null;
          visibleSections.current.delete(name);

          // 섹션 뷰 이벤트 전송 (3초 이상 본 경우만)
          if (duration >= 3) {
            tracking.trackSectionView(name, Math.round(duration), stats.scrollDepth);
          }
        }
      }
    });
  }, []);

  // 세션 종료 시 요약 전송
  const sendSummary = useCallback(() => {
    // 아직 보고 있는 섹션들의 시간 마무리
    visibleSections.current.forEach(name => {
      const stats = sectionStats.current.get(name);
      if (stats && stats.enterTime) {
        stats.totalTime += (Date.now() - stats.enterTime) / 1000;
        stats.enterTime = null;
      }
    });

    const totalDuration = Math.round((Date.now() - sessionStartTime.current) / 1000);
    const sectionsViewed = Array.from(sectionStats.current.values())
      .filter(s => s.totalTime > 0)
      .map(s => ({ section: s.name, duration: Math.round(s.totalTime) }));

    tracking.sendSessionSummary({
      totalDuration,
      sectionsViewed,
      clickCount: clickCount.current,
      maxScrollDepth: lastScrollDepth.current,
      interactedElements: Array.from(interactedElements.current)
    });
  }, []);

  // 초기화 및 이벤트 리스너 등록
  useEffect(() => {
    if (typeof window === 'undefined') return;

    initializeSections();

    // 페이지 뷰 추적 (최초 1회)
    if (!hasTrackedPageView.current) {
      hasTrackedPageView.current = true;
      tracking.trackPageView(window.location.pathname, document.title);
    }

    // 이벤트 리스너 등록
    document.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 초기 스크롤 위치 체크
    handleScroll();

    // 페이지 이탈 시 세션 요약 전송
    const handleBeforeUnload = () => {
      sendSummary();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendSummary();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 주기적으로 버퍼 flush (30초마다)
    const flushInterval = setInterval(() => {
      tracking.flush();
    }, 30000);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(flushInterval);
    };
  }, [initializeSections, handleClick, handleScroll, sendSummary]);

  return <>{children}</>;
}
