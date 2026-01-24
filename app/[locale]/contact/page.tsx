'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { submitContact } from '@/lib/supabase';

// 상품명 매핑
const PRODUCT_NAMES: { [key: string]: string } = {
  'STARTER': 'STARTER 플랜',
  'GROWTH': 'GROWTH 플랜',
  'PERFORMANCE': 'PERFORMANCE 플랜',
  'PERFORMANCE_ADS': 'PERFORMANCE ADS 패키지',
  'VIP_PARTNER': 'VIP PARTNER 플랜'
};

// SearchParams를 사용하는 컴포넌트
function ContactForm({ onProductChange }: { onProductChange: (product: string) => void }) {
  const searchParams = useSearchParams();
  const productParam = searchParams.get('product');

  useEffect(() => {
    if (productParam && PRODUCT_NAMES[productParam]) {
      onProductChange(PRODUCT_NAMES[productParam]);
    }
  }, [productParam, onProductChange]);

  return null;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
    selectedProduct: ''
  });

  const handleProductChange = (product: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProduct: product
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const productOptions = [
    { value: '', label: '선택하세요 (선택사항)' },
    { value: 'STARTER 플랜', label: 'STARTER 플랜' },
    { value: 'GROWTH 플랜', label: 'GROWTH 플랜' },
    { value: 'PERFORMANCE 플랜', label: 'PERFORMANCE 플랜' },
    { value: 'PERFORMANCE ADS 패키지', label: 'PERFORMANCE ADS 패키지' },
    { value: 'VIP PARTNER 플랜', label: 'VIP PARTNER 플랜' },
    { value: '기타 문의', label: '기타 문의' }
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      await submitContact({
        name: formData.name,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone || null,
        budget: null,
        product_interest: formData.selectedProduct || null,
        message: formData.message
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Suspense로 searchParams 처리 */}
      <Suspense fallback={null}>
        <ContactForm onProductChange={handleProductChange} />
      </Suspense>

      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#222] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl text-white">
              XLARGE FLOWER
            </Link>
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
              ← 홈으로
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400 text-lg">찾아오시거나 문의를 남겨주세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Map & Info */}
          <div>
            {/* Google Map with Dark Style */}
            <div className="rounded-2xl overflow-hidden border border-[#222] mb-8">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.123456789!2d126.8891!3d37.5831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDM0JzU5LjIiTiAxMjbCsDUzJzIwLjgiRQ!5e0!3m2!1sko!2skr!4v1234567890&style=feature:all|element:geometry|color:0x050505&style=feature:all|element:labels.text.fill|color:0x666666&style=feature:water|element:geometry|color:0x0A0A0A&style=feature:road|element:geometry|color:0x111111"
                width="100%"
                height="400"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="XLARGE FLOWER Office Location"
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  본사 위치
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Republic of Korea, Seoul, Mapo-gu,<br />
                  World Cup buk-ro 56-gil, 12,<br />
                  TRUTEC Building, 11F
                </p>
              </div>

              <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  이메일
                </h3>
                <a
                  href="mailto:foohlower@pprk.xyz"
                  className="text-gray-400 hover:text-[#00F5A0] transition-colors"
                >
                  foohlower@pprk.xyz
                </a>
              </div>

              <div className="text-center text-gray-500 text-sm">
                (주)엑스라지 플라워
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">문의하기</h2>
              <p className="text-gray-500 mb-8">담당자가 확인 후 빠르게 연락드립니다.</p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">문의가 접수되었습니다!</h3>
                  <p className="text-gray-400 mb-6">빠른 시일 내에 연락드리겠습니다.</p>
                  <Link href="/" className="btn-primary inline-block">
                    홈으로 돌아가기
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        이름 <span className="text-[#00F5A0]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        회사명
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder="(주)회사명"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        이메일 <span className="text-[#00F5A0]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        연락처
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder="010-1234-5678"
                      />
                    </div>
                  </div>

                  {/* 관심 상품 선택 - 커스텀 드롭다운 */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      관심 상품
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#00F5A0] focus:outline-none transition-colors text-left flex items-center justify-between"
                    >
                      <span className={formData.selectedProduct ? 'text-white' : 'text-gray-500'}>
                        {formData.selectedProduct || '선택하세요 (선택사항)'}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* 드롭다운 메뉴 */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-lg">
                        {productOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, selectedProduct: option.value });
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              formData.selectedProduct === option.value
                                ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
                                : 'text-white hover:bg-[#222]'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      문의 내용 <span className="text-[#00F5A0]">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors resize-none"
                      placeholder="어떤 영상이 필요하신지 자유롭게 말씀해주세요."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? '전송 중...' : '문의 보내기'}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Chat CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">
                빠른 상담이 필요하신가요?
              </p>
              <p className="text-gray-400 text-sm">
                우측 하단의 <span className="text-[#00F5A0]">채팅 버튼</span>을 눌러 AI 디렉터와 바로 대화하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020202] border-t border-[#222] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            (주)엑스라지 플라워 | 대표: 김대표
          </p>
          <p className="mb-2">
            Email: <a href="mailto:foohlower@pprk.xyz" className="hover:text-[#00F5A0] transition-colors">foohlower@pprk.xyz</a>
          </p>
          <p className="mb-4">
            Address: Republic of Korea, Seoul, Mapo-gu, World Cup buk-ro 56-gil, 12, TRUTEC Building, 11F
          </p>
          <p>Copyright © 2025 XLARGE FLOWER. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
