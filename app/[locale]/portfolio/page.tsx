'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getPortfolioItems, XLargeFlowerPortfolio } from '@/lib/supabase';

function CaseStudyCard({ item, categories }: { item: XLargeFlowerPortfolio; categories: { id: string; name: string }[] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const categoryLabel = categories.find(c => c.id === item.category)?.name || item.category;

  return (
    <div
      className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00F5A0]/50 hover:shadow-xl hover:shadow-[#00F5A0]/10 transition-all"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 고객사 로고 헤더 */}
      {item.client_name && (
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          {item.client_logo_url ? (
            <img
              src={item.client_logo_url}
              alt={item.client_name}
              className="h-6 object-contain opacity-80"
            />
          ) : (
            <span className="text-sm font-medium text-white/80">{item.client_name}</span>
          )}
          {item.campaign_date && (
            <span className="text-xs text-gray-500 ml-auto">{item.campaign_date}</span>
          )}
        </div>
      )}

      {/* Thumbnail / Video */}
      <div className="aspect-[9/16] bg-[#111] relative overflow-hidden">
        <img
          src={item.thumbnail_url}
          alt={item.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />
        {item.video_url && (
          <video
            ref={videoRef}
            src={item.video_url}
            muted
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Play Indicator */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <svg className="w-6 h-6 text-[#00F5A0] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

      </div>

      {/* 성과 지표 섹션 */}
      {(item.metric_1_value || item.metric_2_value) && (
        <div className="grid grid-cols-2 gap-2 p-4 border-b border-white/5">
          {item.metric_1_value && (
            <div className="text-center p-3 bg-[#00F5A0]/5 rounded-xl border border-[#00F5A0]/20">
              <div className="text-xl font-bold text-[#00F5A0]">{item.metric_1_value}</div>
              <div className="text-xs text-gray-400 mt-1">{item.metric_1_label || '성과 지표'}</div>
            </div>
          )}
          {item.metric_2_value && (
            <div className="text-center p-3 bg-[#00D9F5]/5 rounded-xl border border-[#00D9F5]/20">
              <div className="text-xl font-bold text-[#00D9F5]">{item.metric_2_value}</div>
              <div className="text-xs text-gray-400 mt-1">{item.metric_2_label || '성과 지표'}</div>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-1 rounded font-medium border"
            style={{
              backgroundColor: item.category_color ? `${item.category_color}15` : 'rgba(0,245,160,0.1)',
              color: item.category_color || '#00F5A0',
              borderColor: item.category_color ? `${item.category_color}30` : 'rgba(0,245,160,0.2)'
            }}
          >
            {categoryLabel}
          </span>
          <span className="text-xs text-gray-500">
            {item.format}
          </span>
        </div>
        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-gray-400">{item.description}</p>

        {/* 제작 정보 */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.production_time}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {item.cost}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const t = useTranslations('portfolio');

  const categories = [
    { id: 'all', name: t('categories.all') },
    { id: '기타', name: t('categories.other') },
    { id: '뷰티', name: t('categories.beauty') },
    { id: '패션', name: t('categories.fashion') },
    { id: 'F&B', name: t('categories.food') },
    { id: '테크', name: t('categories.tech') },
    { id: '라이프스타일', name: t('categories.lifestyle') },
  ];

  const [activeCategory, setActiveCategory] = useState('all');
  const [caseStudies, setCaseStudies] = useState<XLargeFlowerPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        // CASE 타입만 가져오기 (납품 사례)
        const items = await getPortfolioItems('CASE');
        setCaseStudies(items);
      } catch (error) {
        console.error('Failed to fetch case studies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCaseStudies();
  }, []);

  const filteredItems = activeCategory === 'all'
    ? caseStudies
    : caseStudies.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-tag mb-4">{t('label')}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Trust Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-[#00F5A0]/30 rounded-full">
            <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">
              {t('trustBadge')}
            </span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white shadow-lg shadow-[#00F5A0]/25'
                  : 'bg-[#0A0A0A] text-gray-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Case Studies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
              {t('loading')}
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">{t('emptyTitle')}</p>
            <p className="text-gray-600 text-sm">{t('emptyDesc')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {filteredItems.map((item) => (
              <CaseStudyCard key={item.id} item={item} categories={categories} />
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-16">
          <div className="p-4 sm:p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">500+</div>
            <div className="text-xs sm:text-sm text-gray-400">{t('stats.videos')}</div>
          </div>
          <div className="p-4 sm:p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">+285%</div>
            <div className="text-xs sm:text-sm text-gray-400">{t('stats.roas')}</div>
          </div>
          <div className="p-4 sm:p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">48h</div>
            <div className="text-xs sm:text-sm text-gray-400">{t('stats.delivery')}</div>
          </div>
          <div className="p-4 sm:p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2">150+</div>
            <div className="text-xs sm:text-sm text-gray-400">{t('stats.clients')}</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-white mb-8">{t('testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-[#00F5A0]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">
                &quot;{t('testimonials.review1')}&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">{t('testimonials.reviewer1Name')}</div>
                <div className="text-gray-500">{t('testimonials.reviewer1Company')}</div>
              </div>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-[#00F5A0]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">
                &quot;{t('testimonials.review2')}&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">{t('testimonials.reviewer2Name')}</div>
                <div className="text-gray-500">{t('testimonials.reviewer2Company')}</div>
              </div>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-[#00F5A0]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm mb-4">
                &quot;{t('testimonials.review3')}&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">{t('testimonials.reviewer3Name')}</div>
                <div className="text-gray-500">{t('testimonials.reviewer3Company')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 sm:p-12 bg-gradient-to-r from-[#00F5A0]/5 to-[#00D9F5]/5 border border-[#00F5A0]/20 rounded-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm sm:text-base">
            {t('ctaSubtitle')}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-full font-semibold hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all text-sm sm:text-base"
          >
            {t('ctaButton')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
