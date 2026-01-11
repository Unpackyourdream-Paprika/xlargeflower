'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const categories = [
  { id: 'all', name: '전체' },
  { id: 'beauty', name: '뷰티' },
  { id: 'fashion', name: '패션' },
  { id: 'tech', name: '테크' },
  { id: 'food', name: '식음료' },
  { id: 'lifestyle', name: '라이프스타일' },
];

const portfolioItems = [
  {
    id: 1,
    title: '뷰티 디바이스 광고',
    category: 'beauty',
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '15초',
    format: '세로형',
    description: 'LED 뷰티 마스크 프로모션 영상',
    productionTime: '48시간',
    cost: '198만원',
  },
  {
    id: 2,
    title: '스킨케어 제품',
    category: 'beauty',
    thumbnail: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '6초',
    format: '정사각형',
    description: '세럼 바르는 시연 영상',
    productionTime: '24시간',
    cost: '99만원',
  },
  {
    id: 3,
    title: '패션 룩북',
    category: 'fashion',
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '30초',
    format: '세로형',
    description: '여름 컬렉션 쇼케이스',
    productionTime: '72시간',
    cost: '298만원',
  },
  {
    id: 4,
    title: '스마트워치',
    category: 'tech',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '15초',
    format: '가로형',
    description: '웨어러블 테크 기능 하이라이트',
    productionTime: '48시간',
    cost: '198만원',
  },
  {
    id: 5,
    title: '커피 브랜드',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '6초',
    format: '정사각형',
    description: '프리미엄 커피 경험',
    productionTime: '24시간',
    cost: '99만원',
  },
  {
    id: 6,
    title: '피트니스 앱',
    category: 'lifestyle',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '15초',
    format: '세로형',
    description: '운동 트래킹 앱 프로모션',
    productionTime: '48시간',
    cost: '198만원',
  },
  {
    id: 7,
    title: '럭셔리 핸드백',
    category: 'fashion',
    thumbnail: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '15초',
    format: '정사각형',
    description: '디자이너 가방 제품 영상',
    productionTime: '48시간',
    cost: '198만원',
  },
  {
    id: 8,
    title: '무선 이어버드',
    category: 'tech',
    thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '6초',
    format: '세로형',
    description: '오디오 제품 쇼케이스',
    productionTime: '24시간',
    cost: '99만원',
  },
  {
    id: 9,
    title: '유기농 스낵',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '15초',
    format: '정사각형',
    description: '건강 스낵 브랜드 영상',
    productionTime: '48시간',
    cost: '198만원',
  },
];

function PortfolioCard({ item }: { item: typeof portfolioItems[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="group relative bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden hover:border-[#00F5A0]/50 hover:shadow-xl hover:shadow-[#00F5A0]/10 transition-all"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail / Video */}
      <div className="aspect-video bg-[#111] relative overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />
        <video
          ref={videoRef}
          src={item.videoUrl}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Play Indicator */}
        <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
            <svg className="w-6 h-6 text-[#00F5A0] ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs text-white font-medium">
          {item.duration}
        </div>

        {/* Production Info Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-[#00F5A0]/20 backdrop-blur-sm text-[#00F5A0] rounded text-xs font-medium border border-[#00F5A0]/30">
            {item.productionTime}
          </span>
          <span className="px-2 py-1 bg-[#00D9F5]/20 backdrop-blur-sm text-[#00D9F5] rounded text-xs font-medium border border-[#00D9F5]/30">
            {item.cost}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-1 bg-[#00F5A0]/10 text-[#00F5A0] rounded font-medium border border-[#00F5A0]/20">
            {item.format}
          </span>
          <span className="text-xs text-gray-500">
            {categories.find(c => c.id === item.category)?.name}
          </span>
        </div>
        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
        <p className="text-sm text-gray-400">{item.description}</p>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">포트폴리오</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI로 생성한 광고 소재 실제 사례. 촬영 없이 제작되었습니다.
          </p>
        </div>

        {/* Quality Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0A0A0A] border border-[#00F5A0]/30 rounded-full">
            <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">
              100% AI 생성 - 촬영 없이 제작
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

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-3xl font-bold gradient-text mb-2">500+</div>
            <div className="text-sm text-gray-400">납품 완료 영상</div>
          </div>
          <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-3xl font-bold gradient-text mb-2">98%</div>
            <div className="text-sm text-gray-400">고객 만족도</div>
          </div>
          <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-3xl font-bold gradient-text mb-2">48시간</div>
            <div className="text-sm text-gray-400">평균 납품 시간</div>
          </div>
          <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center">
            <div className="text-3xl font-bold gradient-text mb-2">150+</div>
            <div className="text-sm text-gray-400">만족한 고객사</div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-white mb-8">고객 후기</h2>
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
                &quot;저희 업계에서 속도가 생명인데, XLarge는 어떤 프로덕션보다 빠르게 퀄리티 있는 소재를 뽑아줍니다.&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">김민수 이사</div>
                <div className="text-gray-500">뷰티라이프 마케팅본부</div>
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
                &quot;이제 한 번에 8개 크리에이티브를 A/B 테스트할 수 있게 됐습니다. ROAS가 40% 개선됐어요.&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">이지영 팀장</div>
                <div className="text-gray-500">애드픽셀 퍼포먼스팀</div>
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
                &quot;퀄리티에 깜짝 놀랐습니다. 촬영 안 하고 만들었다는 게 믿기지 않아요.&quot;
              </p>
              <div className="text-sm">
                <div className="font-semibold text-white">박준혁 대표</div>
                <div className="text-gray-500">굿즈마켓</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-12 bg-gradient-to-r from-[#00F5A0]/5 to-[#00D9F5]/5 border border-[#00F5A0]/20 rounded-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">직접 만들어보시겠어요?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            48시간 내 AI 생성 광고 소재를 받아보세요. 촬영 없이, 기다림 없이.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-full font-semibold hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all"
          >
            프로젝트 시작하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
