'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Admin 페이지에서는 Header 숨기기
  if (pathname?.includes('/admin')) {
    return null;
  }

  // Extract locale from pathname
  const pathSegments = pathname?.split('/') || [];
  const locale = ['ko', 'en', 'ja'].includes(pathSegments[1]) ? pathSegments[1] : '';
  const basePath = locale ? `/${locale}` : '';

  // Active 링크 스타일
  const getLinkClass = (href: string) => {
    const fullHref = `${basePath}${href === '/' ? '' : href}`;
    const currentPath = pathname || '';
    const isActive = currentPath === fullHref || (href === '/' && currentPath === basePath);
    return isActive
      ? 'text-[#00F5A0] font-semibold text-sm drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]'
      : 'text-white/70 hover:text-white transition-colors text-sm';
  };

  // 부드러운 스크롤 핸들러 (헤더 높이 고려)
  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; // 헤더 높이
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#222222]">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href={basePath || '/'} className="flex items-center gap-2">
            <Image
              src="/images/LOGO_XLARGE FLOWER.svg"
              alt="XLARGE FLOWER"
              width={80}
              height={16}
              className="h-4 w-auto md:h-[18px] [html[data-theme='light']_&]:invert"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href={basePath || '/'} className={getLinkClass('/')}>
              {t('home')}
            </Link>
            <a
              href="#why-ai"
              className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer"
              onClick={(e) => handleSmoothScroll(e, 'why-ai')}
            >
              {t('whyAi')}
            </a>
            <Link href={`${basePath}/portfolio`} className={getLinkClass('/portfolio')}>
              {t('portfolio')}
            </Link>
            <Link href={`${basePath}/products`} className={getLinkClass('/products')}>
              {t('pricing')}
            </Link>
            <Link href={`${basePath}/track`} className={getLinkClass('/track')}>
              {t('track')}
            </Link>
            <Link href={`${basePath}/contact`} className={pathname?.endsWith('/contact') ? 'btn-primary text-sm py-2 px-5 ring-2 ring-[#00F5A0]/50' : 'btn-primary text-sm py-2 px-5'}>
              {t('contact')}
            </Link>
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <LanguageSwitcher />
            <button
              className="text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation with Smooth Animation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 border-t border-[#222222]">
                <motion.div
                  className="flex flex-col gap-4"
                  initial="closed"
                  animate="open"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.07 }
                    },
                    closed: {}
                  }}
                >
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={basePath || '/'}
                      className={`${getLinkClass('/')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('home')}
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#why-ai"
                      className="text-white/70 hover:text-white transition-colors text-sm block cursor-pointer"
                      onClick={(e) => handleSmoothScroll(e, 'why-ai')}
                    >
                      {t('whyAi')}
                    </a>
                  </motion.div>
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`${basePath}/portfolio`}
                      className={`${getLinkClass('/portfolio')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('portfolio')}
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`${basePath}/products`}
                      className={`${getLinkClass('/products')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('pricing')}
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`${basePath}/contact`}
                      className={`${getLinkClass('/contact')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('contact')}
                    </Link>
                  </motion.div>
                  <motion.div
                    variants={{
                      open: { y: 0, opacity: 1 },
                      closed: { y: -10, opacity: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={`${basePath}/track`}
                      className={`${getLinkClass('/track')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('track')}
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
