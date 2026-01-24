'use client';

import { useState, useEffect } from 'react';
import { getArtistModels, ArtistModel, ArtistCategory } from '@/lib/supabase';
import CustomModelModal from './CustomModelModal';
import ArtistDetailModal from './ArtistDetailModal';

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
  isLightTheme: boolean;
  onClick: () => void;
}

function ArtistCard({ artist, isLightTheme, onClick }: Omit<ArtistCardProps, 'index'>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.02] ${isLightTheme ? 'bg-white shadow-lg' : 'bg-[#0A0A0A]'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
        {/* 카드 테두리 글로우 효과 */}
        <div
          className={`absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none z-10 ${
            isHovered
              ? isLightTheme
                ? 'shadow-[0_0_30px_rgba(139,92,246,0.3),inset_0_0_1px_rgba(139,92,246,0.6)]'
                : 'shadow-[0_0_30px_rgba(0,245,160,0.4),inset_0_0_1px_rgba(0,245,160,0.8)]'
              : 'shadow-none'
          }`}
          style={{
            border: isHovered
              ? isLightTheme
                ? '1px solid rgba(139,92,246,0.5)'
                : '1px solid rgba(0,245,160,0.6)'
              : isLightTheme
                ? '1px solid rgba(0,0,0,0.1)'
                : '1px solid rgba(255,255,255,0.1)',
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

          {/* 그라데이션 오버레이 */}
          <div className={`absolute inset-0 ${isLightTheme ? 'bg-gradient-to-t from-white/95 via-white/30 to-transparent' : 'bg-gradient-to-t from-black/90 via-black/20 to-transparent'}`} />

        </div>

        {/* 정보 영역 */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* 카테고리 태그들 */}
          <div className="flex flex-wrap gap-1">
            {artist.category.split(',').map((cat, i) => (
              <span
                key={i}
                className={`inline-block px-2 py-0.5 text-[9px] font-medium tracking-[0.1em] uppercase rounded-md backdrop-blur-sm ${
                  isLightTheme
                    ? 'bg-black/20'
                    : 'bg-white/10'
                }`}
                style={{ color: '#FFFFFF' }}
              >
                {cat.trim()}
              </span>
            ))}
          </div>

          {/* 이름 */}
          <h3 className={`mt-1.5 text-lg font-bold tracking-tight ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
            {artist.name}
            {artist.name_ko && (
              <span className={`ml-1.5 text-xs font-normal ${isLightTheme ? 'text-gray-900' : 'text-white/60'}`}>
                {artist.name_ko}
              </span>
            )}
          </h3>
        </div>
    </div>
  );
}

// 빈 상태 플레이스홀더 카드
function PlaceholderCard() {
  return (
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
  );
}

// 커스텀 모델 제작 CTA 카드 - PC: 가로형 배너, 모바일: 세로형 카드
function CustomModelCard({ onOpenModal, isLightTheme }: { onOpenModal: () => void; isLightTheme: boolean }) {
  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border transition-all duration-500 hover:scale-[1.01] ${
        isLightTheme
          ? 'bg-gradient-to-r md:bg-gradient-to-r from-[#F5F0FF] to-white border-purple-300 hover:border-purple-500'
          : 'bg-gradient-to-b md:bg-gradient-to-r from-[#1a0a2e] to-[#0A0A0A] border-purple-500/30 hover:border-[#00F5A0]/50'
      }`}
      onClick={onOpenModal}
    >
      {/* 글로우 효과 */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl shadow-[0_0_40px_rgba(0,245,160,0.2)]" />
      </div>

      {/* 모바일: 세로 레이아웃, PC: 가로 레이아웃 */}
      <div className="aspect-[4/5] md:aspect-auto md:py-8 relative flex flex-col md:flex-row items-center justify-center md:justify-between p-6 md:px-12 gap-4 md:gap-8">
        {/* 왼쪽: 아이콘 + 텍스트 */}
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
          {/* 아이콘 */}
          <div className="w-16 h-16 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-[#00F5A0]/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <svg
              className="w-8 h-8 md:w-7 md:h-7 text-[#00F5A0]"
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
          <div className="text-center md:text-left">
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isLightTheme ? 'text-purple-600' : 'text-purple-400'}`}>
              CUSTOM MODEL
            </span>
            <h3 className={`text-xl md:text-2xl font-bold tracking-tight mt-1 ${isLightTheme ? 'text-gray-900' : 'text-white'}`}>
              나만의 AI 모델 만들기
            </h3>
            <p className={`text-sm mt-1 ${isLightTheme ? 'text-gray-600' : 'text-white/60'}`}>
              <span className="md:hidden">원하는 얼굴이 없나요?<br />브랜드 전용 AI 모델을 만들어 드립니다</span>
              <span className="hidden md:inline">원하는 얼굴이 없나요? 브랜드 전용 AI 모델을 만들어 드립니다</span>
            </p>
          </div>
        </div>

        {/* 오른쪽: 태그 + CTA 버튼 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {/* 특징 태그 */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${isLightTheme ? 'bg-purple-100 text-purple-600' : 'bg-white/10 text-white/70'}`}>
              독점 라이선스
            </span>
            <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${isLightTheme ? 'bg-purple-100 text-purple-600' : 'bg-white/10 text-white/70'}`}>
              수정 3회
            </span>
          </div>

          {/* CTA 버튼 */}
          <div className="px-6 py-3 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black text-sm font-bold group-hover:shadow-[0_0_20px_rgba(0,245,160,0.4)] transition-all duration-300 whitespace-nowrap">
            제작 문의하기 →
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArtistLineup() {
  const [artists, setArtists] = useState<ArtistModel[]>([]);
  const [activeCategory, setActiveCategory] = useState<ArtistCategory>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [useDemoData, setUseDemoData] = useState(false);
  const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistModel | null>(null);
  const isLightTheme = useThemeDetector();

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
    <section id="model-lineup" data-section="artist-lineup" className={`section-spacing relative overflow-hidden lg:pt-24 ${isLightTheme ? 'bg-[#FAFAFA]' : ''}`}>
      {/* Deep Violet 그라데이션 배경 - 다크 모드에서만 표시 */}
      {!isLightTheme && (
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
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16">
          <span className="label-gradient">XLARGE AI ARTIST LINEUP</span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold text-white tracking-tight">
            소속 XLARGE 아티스트
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto" style={{ wordBreak: 'keep-all' }}>
            <span className="block sm:inline">셀러와 브랜드에 최적화된</span>{' '}
            <span className="block sm:inline text-nowrap">XLARGE 모델을 선택해 보세요.</span>
            <br className="hidden md:block" />
            <span className="block sm:inline mt-2 sm:mt-0">XLARGE 아티스트는 고유한 페르소나와</span>{' '}
            <span className="block sm:inline text-nowrap">전문 분야를 가지고 있습니다.</span>
          </p>
        </div>

        {/* 카테고리 필터 탭 */}
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

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 아티스트 그리드 */}
        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {showPlaceholders
              ? PLACEHOLDER_CARDS.map((_, index) => (
                  <PlaceholderCard key={`placeholder-${index}`} />
                ))
              : filteredArtists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    isLightTheme={isLightTheme}
                    onClick={() => setSelectedArtist(artist)}
                  />
                ))}
          </div>
        )}

        {/* 커스텀 모델 제작 CTA - 별도 섹션 */}
        {!isLoading && activeCategory === 'ALL' && (
          <div className="mt-8">
            <CustomModelCard
              onOpenModal={() => setIsCustomModelModalOpen(true)}
              isLightTheme={isLightTheme}
            />
          </div>
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

      {/* Artist Detail Modal */}
      <ArtistDetailModal
        artist={selectedArtist}
        isOpen={!!selectedArtist}
        onClose={() => setSelectedArtist(null)}
        isLightTheme={isLightTheme}
        onStartWithModel={(artistName, noModelNeeded) => {
          // 커스텀 이벤트를 발생시켜 메인 페이지의 바텀시트를 열기
          const event = new CustomEvent('openContactWithArtist', {
            detail: { artistName, noModelNeeded }
          });
          window.dispatchEvent(event);
        }}
      />
    </section>
  );
}
