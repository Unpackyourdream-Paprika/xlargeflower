'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Active 링크 스타일
  const getLinkClass = (href: string) => {
    const isActive = pathname === href || (href === '/' && pathname === '/');
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
          <Link href="/" className="flex items-center gap-2">
            <span className="text-white font-bold text-lg tracking-tight">XLARGE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className={getLinkClass('/')}>
              HOME
            </Link>
            <a
              href="#why-ai"
              className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer"
              onClick={(e) => handleSmoothScroll(e, 'why-ai')}
            >
              WHY AI?
            </a>
            <Link href="/portfolio" className={getLinkClass('/portfolio')}>
              PORTFOLIO
            </Link>
            <Link href="/products" className={getLinkClass('/products')}>
              PRICING
            </Link>
            <Link href="/contact" className={pathname === '/contact' ? 'btn-primary text-sm py-2 px-5 ring-2 ring-[#00F5A0]/50' : 'btn-primary text-sm py-2 px-5'}>
              VIP ACCESS
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
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
                      href="/"
                      className={`${getLinkClass('/')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      HOME
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
                      WHY AI?
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
                      href="/portfolio"
                      className={`${getLinkClass('/portfolio')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      PORTFOLIO
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
                      href="/products"
                      className={`${getLinkClass('/products')} block`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      PRICING
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
                      href="/contact"
                      className="btn-primary text-sm py-2 px-5 text-center block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      VIP ACCESS
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
