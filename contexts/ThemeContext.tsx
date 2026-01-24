'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // 초기 테마 로드 (localStorage 또는 랜덤 할당)
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('xlarge-theme') as Theme | null;
    const isFirstVisit = !localStorage.getItem('xlarge-ab-assigned');

    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      // 기존 방문자: 저장된 테마 사용
      setThemeState(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (isFirstVisit) {
      // 첫 방문자: 랜덤으로 테마 할당 (A/B 테스트)
      const randomTheme: Theme = Math.random() < 0.5 ? 'dark' : 'light';
      setThemeState(randomTheme);
      localStorage.setItem('xlarge-theme', randomTheme);
      localStorage.setItem('xlarge-ab-assigned', 'true');
      document.documentElement.setAttribute('data-theme', randomTheme);

      // GA 이벤트: A/B 테스트 그룹 할당
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ab_test_assigned', {
          event_category: 'AB_Test',
          event_label: randomTheme === 'dark' ? 'variant_A_dark' : 'variant_B_light',
          theme_variant: randomTheme,
          non_interaction: true,
        });
      }
    }
  }, []);

  // 테마 변경 함수
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('xlarge-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    // GA 이벤트 전송 - A/B 테스트용
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'theme_change', {
        event_category: 'AB_Test',
        event_label: newTheme,
        theme_variant: newTheme,
      });
    }
  }, []);

  // 테마 토글 함수
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Shift + G 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'G') {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  // SSR 하이드레이션 문제 방지
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
