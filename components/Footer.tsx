'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Admin 페이지에서는 Footer 숨기기
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#080808] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Image
              src="/images/LOGO_XLARGE FLOWER.svg"
              alt="XLARGE FLOWER"
              width={120}
              height={24}
              className="h-5 w-auto [html[data-theme='light']_&]:invert"
            />
            <p className="text-white/60 mt-4 max-w-md text-sm">
              유입을 위한 XLARGE FLOWER
              <br />
              촬영 없이 48시간 내 납품.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="mailto:foohlower@pprk.xyz"
                className="text-white/60 hover:text-[#00F5A0] transition-colors"
                aria-label="Email"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/xlflwr.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00F5A0] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@FOOHLOWER/shorts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#00F5A0] transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white/80 text-sm font-bold mb-4 tracking-wide">SERVICE</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-white/60 hover:text-white transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-white/60 hover:text-white transition-colors text-sm">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h4 className="text-white/80 text-sm font-bold mb-4 tracking-wide">COMPANY</h4>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="font-medium text-white/80">스네이크 스테이크 주식회사</li>
              <li>대표이사: 정재훈</li>
              <li>사업자등록번호: 666-81-02807</li>
              <li className="pt-2">서울특별시 마포구 월드컵북로56길 12, 11층</li>
              <li>(상암동, Trutec Building)</li>
              <li>foohlower@pprk.xyz</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-xs">
            © 2025 스네이크 스테이크 주식회사 (Snake Steak Co., Ltd.). All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/50 hover:text-white transition-colors text-xs">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-white transition-colors text-xs">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
