'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';

// 테마 감지 훅
function useThemeDetector() {
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme');
      setIsLightTheme(theme === 'light');
    };
    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return isLightTheme;
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isLightTheme = useThemeDetector();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Get the path without the current locale prefix
    const segments = pathname.split('/');
    const isLocaleInPath = locales.includes(segments[1] as Locale);

    let newPath: string;
    if (isLocaleInPath) {
      // Replace the locale segment
      segments[1] = newLocale;
      newPath = segments.join('/');
    } else {
      // Add the locale prefix
      newPath = `/${newLocale}${pathname}`;
    }

    // Save preference to cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors text-sm ${
          isLightTheme
            ? 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
            : 'bg-white/5 hover:bg-white/10'
        }`}
        aria-label="Select language"
      >
        <span className="text-base">{localeFlags[locale]}</span>
        <span className={`hidden sm:inline ${isLightTheme ? 'text-gray-700' : 'text-white/70'}`}>
          {localeNames[locale]}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            isLightTheme ? 'text-gray-500' : 'text-white/50'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 py-1 w-36 rounded-lg shadow-xl z-50 ${
          isLightTheme
            ? 'bg-white border border-gray-200'
            : 'bg-[#1a1a1a] border border-white/10'
        }`}>
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                loc === locale
                  ? isLightTheme
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-[#00F5A0]/10 text-[#00F5A0]'
                  : isLightTheme
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {loc === locale && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
