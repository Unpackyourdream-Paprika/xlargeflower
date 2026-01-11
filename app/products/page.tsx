'use client';

import Link from 'next/link';
import { triggerOpenChat } from '@/components/GlobalChatButton';

interface Product {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  highlights?: string[];
  delivery: string;
  badge: string | null;
  badgeColor?: string;
  isPopular?: boolean;
  buttonText: string;
  buttonStyle: 'primary' | 'secondary' | 'gold';
}

const products: Product[] = [
  {
    id: 'starter',
    name: 'STARTER',
    price: '₩3,000,000~',
    subtitle: '테스트 도입을 위한 베이직 플랜',
    description: '처음 AI 크리에이티브를 도입하는 브랜드를 위한 입문 패키지',
    features: [
      'AI 인플루언서 영상 1종 (15초)',
      '기본 배경/의상 제공',
      '비독점 라이선스 (1년)',
      '수정 1회 (단순 편집)',
      '원본 파일 포함',
    ],
    delivery: '48시간',
    badge: null,
    buttonText: '시작하기',
    buttonStyle: 'secondary',
  },
  {
    id: 'growth',
    name: 'GROWTH',
    price: '₩5,500,000',
    subtitle: '가장 인기 있는 주력 플랜',
    description: '본격적인 퍼포먼스 마케팅을 위한 최적의 패키지',
    features: [
      '영상 1종 + 바리에이션 3종 (총 4개)',
      '브랜드 맞춤 커스텀 (의상/PPL 적용)',
      '전담 매니저 배정',
      '수정 2회 포함',
      '6초/15초/30초 포맷 선택',
    ],
    highlights: [
      '영구 소장 라이선스 (기간 무제한)',
    ],
    delivery: '48시간',
    badge: 'BEST CHOICE',
    isPopular: true,
    buttonText: '도입 문의하기',
    buttonStyle: 'primary',
  },
  {
    id: 'performance',
    name: 'PERFORMANCE',
    price: '₩9,000,000',
    subtitle: '고퀄리티 연출이 필요한 프리미엄 플랜',
    description: '대규모 캠페인과 스케일업을 위한 프리미엄 패키지',
    features: [
      '영상 2종 + 바리에이션 6종 (총 8개)',
      '전문 디렉터의 고퀄리티 연출',
      '영구 소장 라이선스',
      '우선 제작 (Fast Track)',
      '무제한 포맷 옵션',
      'A/B 테스트 가이드 제공',
    ],
    highlights: [
      '성과 저조 시 소재 교체(AS) 1회 보장',
    ],
    delivery: '48시간',
    badge: 'PREMIUM',
    badgeColor: 'cyan',
    buttonText: '도입 상담받기',
    buttonStyle: 'secondary',
  },
  {
    id: 'vip-partner',
    name: 'VIP PARTNER',
    price: '별도 문의',
    subtitle: '중견/대기업을 위한 분기 독점 계약',
    description: '브랜드 전용 AI 모델과 전담 팀이 배정되는 Enterprise 솔루션',
    features: [
      '3개월 파트너십 (총 12개 영상 제작)',
      '브랜드 전속 AI 모델 독점 개발',
      '월간 성과 리포트 및 전략 컨설팅',
      'VIP 전용 핫라인 및 무제한 수정',
      '전담 팀 배정',
      '계약 기간 내 영구 라이선스',
    ],
    delivery: '협의',
    badge: 'ENTERPRISE',
    badgeColor: 'gold',
    buttonText: 'VIP 컨시어지 연결',
    buttonStyle: 'gold',
  },
];

function ProductCard({ product }: { product: Product }) {
  const getBadgeStyle = () => {
    if (product.badgeColor === 'gold') {
      return 'bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black';
    }
    if (product.badgeColor === 'cyan') {
      return 'bg-gradient-to-r from-[#00D9F5] to-[#00F5A0] text-black';
    }
    return 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white';
  };

  const getButtonStyle = () => {
    if (product.buttonStyle === 'gold') {
      return 'bg-gradient-to-r from-[#B8860B] to-[#FFD700] text-black hover:opacity-90';
    }
    if (product.buttonStyle === 'primary') {
      return 'btn-primary';
    }
    return 'btn-secondary';
  };

  const getCardStyle = () => {
    if (product.isPopular) {
      return 'card-featured';
    }
    if (product.badgeColor === 'gold') {
      return 'card bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border-[#B8860B]/40';
    }
    if (product.badgeColor === 'cyan') {
      return 'card border-[#00D9F5]/30';
    }
    return 'card';
  };

  const handleClick = () => {
    if (product.buttonStyle === 'primary' || product.buttonStyle === 'secondary') {
      triggerOpenChat();
    }
  };

  return (
    <div className={`relative p-6 rounded-2xl transition-all h-full flex flex-col ${getCardStyle()}`}>
      {product.badge && (
        <div className={`absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold ${getBadgeStyle()}`}>
          {product.badge}
        </div>
      )}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-1 ${product.badgeColor === 'gold' ? 'text-[#FFD700]' : 'text-white'}`}>
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">{product.subtitle}</p>
      </div>
      <div className="mb-4">
        <span className="text-3xl font-bold text-white">
          {product.price}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-4">{product.description}</p>
      <div className="mb-4">
        <span className="text-xs text-[#00F5A0] bg-[#00F5A0]/10 px-2 py-1 rounded font-medium">
          납품: {product.delivery}
        </span>
      </div>

      {/* Highlights */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="mb-4 p-3 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-lg">
          {product.highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-[#00F5A0] font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {highlight}
            </div>
          ))}
        </div>
      )}

      <ul className="space-y-2 mb-6 flex-1">
        {product.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${product.badgeColor === 'gold' ? 'text-[#FFD700]' : 'text-[#00F5A0]'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {product.buttonStyle === 'gold' ? (
        <Link
          href="/contact"
          className={`block w-full text-center py-3 rounded-full font-medium transition-all ${getButtonStyle()}`}
        >
          {product.buttonText}
        </Link>
      ) : (
        <button
          onClick={handleClick}
          className={`block w-full py-3 rounded-full font-medium transition-all ${getButtonStyle()}`}
        >
          {product.buttonText}
        </button>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-tag mb-4">AI 모델 도입 비용 안내</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            모델 섭외비 0원, 스튜디오 비용 0원
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            월 300만 원대로 평생 소장 가능한 고효율 광고 소재를 확보하세요.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* VAT Notice */}
        <p className="text-center text-white/40 text-sm mb-16">
          ※ 모든 금액은 VAT 별도이며, 착수금 50% 납입 시 프로젝트가 시작됩니다.
        </p>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">자주 묻는 질문</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">AI가 만든 영상이 진짜 사람 같나요?</h3>
              <p className="text-gray-400 text-sm">
                네, 최신 AI 기술로 제작된 영상은 실제 모델 촬영과 구분이 어려울 정도의 퀄리티입니다. 포트폴리오에서 직접 확인하실 수 있으며, 실제 광고에서 높은 성과를 내고 있습니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">저작권이나 초상권 문제는 없나요?</h3>
              <p className="text-gray-400 text-sm">
                AI로 생성된 가상 인물이므로 초상권 문제가 없습니다. 라이선스 기간 내 무제한 사용 가능하며, 영구 소장 라이선스 선택 시 평생 사용하실 수 있습니다. 인플루언서 스캔들 리스크도 0%입니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">수정은 어떻게 되나요?</h3>
              <p className="text-gray-400 text-sm">
                패키지별로 수정 횟수가 포함되어 있으며, 자막/텍스트 변경, 색상 조정, 길이 편집 등이 가능합니다. VIP PARTNER 플랜은 무제한 수정이 지원됩니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">영구 소장 라이선스란 무엇인가요?</h3>
              <p className="text-gray-400 text-sm">
                한 번 결제로 제작된 영상을 평생 사용하실 수 있습니다. 재계약이나 추가 비용 없이 모든 광고 채널(메타, 구글, 틱톡 등)에서 무제한 노출 가능합니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">어떤 결제 방식을 지원하나요?</h3>
              <p className="text-gray-400 text-sm">
                법인카드, 계좌이체, 에스크로(크몽/숨고) 결제를 지원합니다. 착수금 50% 납입 후 프로젝트가 시작되며, 세금계산서 발행이 가능합니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-12 bg-gradient-to-b from-[#0A0A0A] to-[#050505] border border-[#00F5A0]/30 rounded-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">어떤 플랜이 적합할지 고민되시나요?</h2>
          <p className="text-gray-400 mb-8">
            전문 컨설턴트가 귀사의 니즈를 분석하여 최적의 솔루션을 제안드립니다.
          </p>
          <button
            onClick={triggerOpenChat}
            className="btn-primary inline-flex items-center gap-2"
          >
            VIP 상담 신청하기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
