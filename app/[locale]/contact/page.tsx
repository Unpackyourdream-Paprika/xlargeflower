'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const t = useTranslations('contact');

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
    { value: '', label: locale === 'en' ? 'Select (Optional)' : locale === 'ja' ? '選択してください（任意）' : '선택하세요 (선택사항)' },
    { value: 'STARTER', label: t('productOptions.starter') },
    { value: 'GROWTH', label: t('productOptions.growth') },
    { value: 'PERFORMANCE', label: t('productOptions.performance') },
    { value: 'PERFORMANCE ADS', label: t('productOptions.performanceAds') },
    { value: 'VIP PARTNER', label: t('productOptions.vip') },
    { value: 'OTHER', label: t('productOptions.other') }
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
      alert(t('errorMessage'));
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
            <Link href={`/${locale}`} className="font-bold text-xl text-white">
              {t('siteName')}
            </Link>
            <Link href={`/${locale}`} className="text-gray-500 hover:text-white text-sm transition-colors">
              {t('backToHome')}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-gray-400 text-lg">{t('subtitle')}</p>
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
                  {t('location')}
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
                  {t('email')}
                </h3>
                <a
                  href="mailto:foohlower@pprk.xyz"
                  className="text-gray-400 hover:text-[#00F5A0] transition-colors"
                >
                  foohlower@pprk.xyz
                </a>
              </div>

              <div className="text-center text-gray-500 text-sm">
                Snake Steak Co., Ltd.
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t('formTitle')}</h2>
              <p className="text-gray-500 mb-8">{t('formSubtitle')}</p>

              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t('successTitle')}</h3>
                  <p className="text-gray-400 mb-6">{t('successMessage')}</p>
                  <Link href={`/${locale}`} className="btn-primary inline-block">
                    {t('goHome')}
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('nameLabel')} <span className="text-[#00F5A0]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder={t('namePlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('companyLabel')}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder={t('companyPlaceholder')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('emailLabel')} <span className="text-[#00F5A0]">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder={t('emailPlaceholder')}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('phoneLabel')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                  </div>

                  {/* 관심 상품 선택 - 커스텀 드롭다운 */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      {t('productLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#00F5A0] focus:outline-none transition-colors text-left flex items-center justify-between"
                    >
                      <span className={formData.selectedProduct ? 'text-white' : 'text-gray-500'}>
                        {formData.selectedProduct ? productOptions.find(o => o.value === formData.selectedProduct)?.label || formData.selectedProduct : productOptions[0].label}
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
                      {t('messageLabel')} <span className="text-[#00F5A0]">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors resize-none"
                      placeholder={t('messagePlaceholder')}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isSubmitting ? t('submitting') : t('submitButton')}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Chat CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm mb-4">
                {t('quickChat')}
              </p>
              <p className="text-gray-400 text-sm">
                {t('quickChatDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020202] border-t border-[#222] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p className="mb-2">
            Snake Steak Co., Ltd.
          </p>
          <p className="mb-2">
            Email: <a href="mailto:foohlower@pprk.xyz" className="hover:text-[#00F5A0] transition-colors">foohlower@pprk.xyz</a>
          </p>
          <p className="mb-4">
            Address: Republic of Korea, Seoul, Mapo-gu, World Cup buk-ro 56-gil, 12, TRUTEC Building, 11F
          </p>
          <p>Copyright © 2025 Snake Steak Co., Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
