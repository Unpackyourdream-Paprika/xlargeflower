'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './animations/ScrollReveal';
import { getArtistModels, ArtistModel, ArtistCategory } from '@/lib/supabase';
import CustomModelModal from './CustomModelModal';

// 카테고리 탭 정의
const CATEGORIES: { key: ArtistCategory; label: string; labelKo: string }[] = [
  { key: 'ALL', label: 'ALL', labelKo: '전체' },
  { key: 'FASHION', label: 'FASHION', labelKo: '패션' },
  { key: 'BEAUTY', label: 'BEAUTY', labelKo: '뷰티' },
  { key: 'F&B', label: 'F&B', labelKo: '식음료' },
  { key: 'TECH', label: 'TECH', labelKo: '테크' },
  { key: 'LIFESTYLE', label: 'LIFESTYLE', labelKo: '라이프스타일' },
];

// 데모용 더미 데이터 (DB에 데이터가 없을 때 표시)
const DEMO_ARTISTS: ArtistModel[] = [
  {
    id: 'demo-1',
    name: 'FLOWER',
    name_ko: '플라워',
    category: 'FASHION',
    thumbnail_url: '/demo/artist-flower.jpg',
    description: '20대 타겟의 힙한 스트릿 패션 전문',
    tags: ['시크', '스트릿', 'MZ'],
    is_active: true,
    sort_order: 1,
  },
  {
    id: 'demo-2',
    name: 'RUBY',
    name_ko: '루비',
    category: 'BEAUTY',
    thumbnail_url: '/demo/artist-ruby.jpg',
    description: '럭셔리 뷰티 & 스킨케어 전문',
    tags: ['청순', '럭셔리', '뷰티'],
    is_active: true,
    sort_order: 2,
  },
  {
    id: 'demo-3',
    name: 'JADE',
    name_ko: '제이드',
    category: 'LIFESTYLE',
    thumbnail_url: '/demo/artist-jade.jpg',
    description: '라이프스타일 & 웰니스 콘텐츠',
    tags: ['내추럴', '웰니스', '클린'],
    is_active: true,
    sort_order: 3,
  },
  {
    id: 'demo-4',
    name: 'NOVA',
    name_ko: '노바',
    category: 'TECH',
    thumbnail_url: '/demo/artist-nova.jpg',
    description: '테크 & 가전 제품 전문',
    tags: ['미래지향', '스마트', '테크'],
    is_active: true,
    sort_order: 4,
  },
];

// 빈 상태 플레이스홀더 카드
const PLACEHOLDER_CARDS = [1, 2, 3, 4];

interface ArtistCardProps {
  artist: ArtistModel;
  index: number;
}

function ArtistCard({ artist, index }: ArtistCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered && artist.hover_video_url) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, artist.hover_video_url]);

  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <motion.div
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#0A0A0A]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* 카드 테두리 글로우 효과 */}
        <div
          className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none z-10 ${
            isHovered
              ? 'shadow-[0_0_30px_rgba(0,245,160,0.4),inset_0_0_1px_rgba(0,245,160,0.8)]'
              : 'shadow-none'
          }`}
          style={{
            border: isHovered ? '1px solid rgba(0,245,160,0.6)' : '1px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* 이미지/비디오 컨테이너 */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* 썸네일 이미지 */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
              isHovered ? 'scale-105 grayscale' : 'scale-100 grayscale-0'
            }`}
            style={{
              backgroundImage: `url(${artist.thumbnail_url})`,
            }}
          />

          {/* 호버 비디오 (있을 경우) */}
          {artist.hover_video_url && (
            <video
              ref={videoRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              src={artist.hover_video_url}
              muted
              loop
              playsInline
            />
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* 태그들 (호버 시 표시) */}
          <AnimatePresence>
            {isHovered && artist.tags && artist.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 left-4 flex flex-wrap gap-2"
              >
                {artist.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm rounded-full text-white/80 border border-white/20"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 정보 영역 */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {/* 카테고리 */}
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
            {artist.category}
          </span>

          {/* 이름 */}
          <h3 className="mt-1 text-xl font-bold text-white tracking-tight">
            {artist.name}
            {artist.name_ko && (
              <span className="ml-2 text-sm font-normal text-white/60">
                {artist.name_ko}
              </span>
            )}
          </h3>

          {/* 설명 (호버 시 표시) */}
          <AnimatePresence>
            {isHovered && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 text-sm text-white/70 leading-relaxed"
              >
                {artist.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

// 빈 상태 플레이스홀더 카드
function PlaceholderCard({ index }: { index: number }) {
  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <div className="relative overflow-hidden rounded-2xl bg-[#0A0A0A] border border-white/10">
        <div className="aspect-[4/5] relative">
          {/* 실루엣 배경 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0A0A0A]">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-24 h-24 text-white/10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">
            COMING SOON
          </span>
          <h3 className="mt-1 text-xl font-bold text-white/30 tracking-tight">
            NEW ARTIST
          </h3>
          <p className="mt-2 text-sm text-white/20">
            새로운 아티스트가 데뷔 준비 중입니다
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}

// 커스텀 모델 제작 CTA 카드
function CustomModelCard({ index, onOpenModal }: { index: number; onOpenModal: () => void }) {
  return (
    <ScrollReveal delay={index * 0.1} direction="up">
      <motion.div
        className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a0a2e] to-[#0A0A0A] border border-purple-500/30 hover:border-[#00F5A0]/50 transition-all duration-500"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        onClick={onOpenModal}
      >
        {/* 글로우 효과 */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(0,245,160,0.2)]" />
        </div>

        <div className="aspect-[4/5] relative flex flex-col items-center justify-center p-6">
          {/* 아이콘 */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00F5A0]/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-[#00F5A0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          {/* 텍스트 */}
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400 mb-2">
            CUSTOM MODEL
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight text-center mb-2">
            맞춤형 모델 제작
          </h3>
          <p className="text-sm text-white/60 text-center leading-relaxed mb-4">
            원하는 얼굴이 없나요?
            <br />
            브랜드 전용 AI 모델을 만들어 드립니다
          </p>

          {/* CTA 버튼 */}
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black text-sm font-bold group-hover:shadow-[0_0_20px_rgba(0,245,160,0.4)] transition-all duration-300">
            제작 문의하기
          </div>

          {/* 특징 태그 */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="px-2 py-1 text-[10px] font-medium bg-white/5 rounded-full text-white/50">
              독점 라이선스
            </span>
            <span className="px-2 py-1 text-[10px] font-medium bg-white/5 rounded-full text-white/50">
              수정 3회
            </span>
          </div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

export default function ArtistLineup() {
  const [artists, setArtists] = useState<ArtistModel[]>([]);
  const [activeCategory, setActiveCategory] = useState<ArtistCategory>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(false);
  const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);

  useEffect(() => {
    async function fetchArtists() {
      try {
        const data = await getArtistModels();
        if (data && data.length > 0) {
          setArtists(data);
          setUseDemoData(false);
        } else {
          // DB에 데이터가 없으면 데모 데이터 사용
          setArtists(DEMO_ARTISTS);
          setUseDemoData(true);
        }
      } catch (error) {
        console.error('Failed to fetch artists:', error);
        // 에러 시 데모 데이터 사용
        setArtists(DEMO_ARTISTS);
        setUseDemoData(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchArtists();
  }, []);

  // 클라이언트 사이드 필터링
  // category가 쉼표로 구분된 문자열일 수 있음 (예: "FASHION, TECH")
  const filteredArtists =
    activeCategory === 'ALL'
      ? artists
      : artists.filter((artist) => {
          // 쉼표로 구분된 카테고리를 배열로 변환하여 검사
          const categories = artist.category
            .split(',')
            .map((c) => c.trim());
          return categories.includes(activeCategory);
        });

  const showPlaceholders = filteredArtists.length === 0 && !isLoading;

  return (
    <section id="model-lineup" className="section-spacing relative overflow-hidden lg:pt-24">
      {/* Deep Violet 그라데이션 배경 */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(88, 28, 135, 0.15) 0%, rgba(30, 10, 60, 0.08) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0, 245, 160, 0.05) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* 섹션 헤더 */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="label-gradient">XLARGE AI ARTIST LINEUP</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">
              소속 XLARGE 아티스트
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              셀러와 브랜드에 최적화된 XLARGE 모델을 선택해보세요.
              <br className="hidden md:block" />
              XLARGE 아티스트는 고유한 페르소나와 전문 분야를 가지고 있습니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 카테고리 필터 탭 */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat.key
                    ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black shadow-[0_0_20px_rgba(0,245,160,0.3)]'
                    : 'bg-transparent border border-white/20 text-white/70 hover:border-white/40 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 아티스트 그리드 */}
        {!isLoading && (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {showPlaceholders
                ? PLACEHOLDER_CARDS.map((_, index) => (
                    <motion.div
                      key={`placeholder-${index}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PlaceholderCard index={index} />
                    </motion.div>
                  ))
                : filteredArtists.map((artist, index) => (
                    <motion.div
                      key={artist.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArtistCard artist={artist} index={index} />
                    </motion.div>
                  ))}
              {/* 커스텀 모델 제작 CTA 카드 - 항상 마지막에 표시 */}
              {activeCategory === 'ALL' && (
                <motion.div
                  key="custom-model-card"
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <CustomModelCard
                    index={filteredArtists.length}
                    onOpenModal={() => setIsCustomModelModalOpen(true)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 데모 데이터 안내 (개발용) */}
        {useDemoData && !isLoading && (
          <p className="mt-8 text-center text-sm text-white/30">
            * 현재 데모 데이터가 표시되고 있습니다. 어드민에서 아티스트를 등록하세요.
          </p>
        )}
      </div>

      {/* Custom Model Modal */}
      <CustomModelModal
        isOpen={isCustomModelModalOpen}
        onClose={() => setIsCustomModelModalOpen(false)}
      />
    </section>
  );
}
