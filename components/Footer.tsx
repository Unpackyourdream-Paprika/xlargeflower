import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <span className="text-white font-bold text-xl tracking-tight">XLARGE FLOWER</span>
            <p className="text-white/60 mt-4 max-w-md text-sm">
              퍼포먼스 마케팅을 위한 AI 생성 광고 소재.
              <br />
              촬영 없이 48시간 내 납품.
            </p>
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

          {/* Contact */}
          <div>
            <h4 className="text-white/80 text-sm font-bold mb-4 tracking-wide">CONTACT</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li>주식회사 스네이크스테이크</li>
              <li>대표: 홍길동</li>
              <li>사업자등록번호: 000-00-00000</li>
              <li>통신판매업신고: 제0000-서울강남-0000호</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/50 text-xs">
            © 2025 주식회사 스네이크스테이크. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/50 hover:text-white transition-colors text-xs">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-white transition-colors text-xs">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
