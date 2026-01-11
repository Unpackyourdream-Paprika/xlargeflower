import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  delivery: string;
  badge: string | null;
  target?: string;
}

const products: { ready: Product[]; fast: Product[]; exclusive: Product[] } = {
  ready: [
    {
      id: 'ready-1',
      name: 'READY A-1',
      price: '990,000',
      description: '기본 기성 소재',
      target: '소규모 테스트용',
      features: [
        '영상 소재 1개 (15초)',
        '비독점 라이선스',
        '카테고리 보호 (최대 3개사)',
        '즉시 다운로드',
        '원본 파일 포함',
      ],
      delivery: '즉시',
      badge: null,
    },
    {
      id: 'ready-2',
      name: 'READY A-2',
      price: '1,490,000',
      description: '프리미엄 기성 소재',
      target: '빠른 런칭 필요시',
      features: [
        '영상 소재 1개 (15초 + 6초)',
        '비독점 라이선스',
        '카테고리 보호 (최대 3개사)',
        '즉시 다운로드',
        '원본 파일 포함',
        '자막 바리에이션 포함',
      ],
      delivery: '즉시',
      badge: null,
    },
  ],
  fast: [
    {
      id: 'fast-1',
      name: 'FAST B-1',
      price: '1,980,000',
      description: '스타터 크리에이티브 팩',
      target: '초기 테스트 & 검증용',
      features: [
        '영상 바리에이션 4개',
        '6초 + 15초 포맷',
        '비독점 라이선스',
        '카테고리 보호',
        '수정 1회 포함',
        '자막 바리에이션',
      ],
      delivery: '48시간',
      badge: null,
    },
    {
      id: 'fast-2',
      name: 'FAST B-2',
      price: '2,980,000',
      description: '그로스 크리에이티브 팩',
      target: '본격 스케일업용',
      features: [
        '영상 바리에이션 6개',
        '6초 + 15초 + 30초 포맷',
        '비독점 라이선스',
        '카테고리 보호',
        '수정 2회 포함',
        '자막 바리에이션',
        'A/B 테스트 가이드',
      ],
      delivery: '48시간',
      badge: '인기',
    },
    {
      id: 'fast-3',
      name: 'FAST B-3',
      price: '3,980,000',
      description: '스케일 크리에이티브 팩',
      target: '대량 소재 필요시',
      features: [
        '영상 바리에이션 8개',
        '모든 포맷 옵션',
        '비독점 라이선스',
        '강화된 카테고리 보호',
        '수정 3회 포함',
        '자막 바리에이션',
        '퍼포먼스 컨설팅',
      ],
      delivery: '72시간',
      badge: '최고 가성비',
    },
  ],
  exclusive: [
    {
      id: 'exclusive-1',
      name: 'EXCLUSIVE C-1',
      price: '별도 협의',
      description: '3개월 독점',
      target: '브랜드 독점 필요시',
      features: [
        '완전 독점 라이선스 (3개월)',
        '무제한 영상 바리에이션',
        '모든 포맷 옵션',
        '우선 서포트',
        '무제한 수정',
        '전담 담당자',
        '퍼포먼스 데이터 공유',
      ],
      delivery: '협의',
      badge: null,
    },
    {
      id: 'exclusive-2',
      name: 'EXCLUSIVE C-2',
      price: '별도 협의',
      description: '영구 독점',
      target: '완전 독점 소유권',
      features: [
        '완전 독점 라이선스 (영구)',
        '무제한 영상 바리에이션',
        '모든 포맷 옵션',
        'VIP 서포트',
        '무제한 수정',
        '전담 팀',
        '퍼포먼스 보장',
        '맞춤 AI 모델 트레이닝',
      ],
      delivery: '협의',
      badge: '엔터프라이즈',
    },
  ],
};

function ProductCard({ product, accentButton = false }: { product: Product; accentButton?: boolean }) {
  return (
    <div className={`relative p-6 rounded-2xl transition-all ${accentButton ? 'card-featured' : 'card'}`}>
      {product.badge && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black rounded-full text-xs font-bold">
          {product.badge}
        </div>
      )}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">{product.name}</h3>
        <p className="text-sm text-gray-400">{product.description}</p>
        {product.target && (
          <span className="inline-block mt-2 text-xs px-2 py-1 bg-[#00F5A0]/10 text-[#00F5A0] rounded font-medium border border-[#00F5A0]/20">
            {product.target}
          </span>
        )}
      </div>
      <div className="mb-4">
        <span className="text-2xl font-bold text-white">
          {product.price.includes('협의') ? product.price : `₩${product.price}`}
        </span>
      </div>
      <div className="mb-4">
        <span className="text-xs text-[#00F5A0] bg-[#00F5A0]/10 px-2 py-1 rounded font-medium">
          납품: {product.delivery}
        </span>
      </div>
      <ul className="space-y-2 mb-6">
        {product.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4 text-[#00F5A0] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/contact"
        className={`block w-full text-center py-3 rounded-full font-medium transition-all ${
          accentButton
            ? 'btn-primary'
            : 'btn-secondary'
        }`}
      >
        문의하기
      </Link>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen py-24 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">상품</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            크리에이티브 니즈에 맞는 패키지를 선택하세요.
          </p>
        </div>

        {/* Important Notice */}
        <div className="mb-16 p-6 bg-[#0A0A0A] border border-[#00F5A0]/30 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            안내사항
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">*</span>
              100% 선결제 원칙. 크몽/숨고 에스크로 이용 가능.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">*</span>
              수정은 자막/텍스트 변경만 포함. 모델/모션 변경 불가.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">*</span>
              비독점 라이선스는 동일 카테고리 내 최대 3개사 판매 (카테고리 보호).
            </li>
          </ul>
        </div>

        {/* Ready Pack Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">READY 팩</h2>
              <p className="text-gray-500">기성 소재. 즉시 납품.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.ready.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Fast Pack Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00F5A0]/20 to-[#00D9F5]/20 border border-[#00F5A0]/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">FAST 팩</h2>
              <p className="text-gray-500">맞춤 제작. 48시간 납품.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.fast.map((product) => (
              <ProductCard key={product.id} product={product} accentButton={true} />
            ))}
          </div>
        </section>

        {/* Exclusive Pack Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#111] border border-[#222] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#00D9F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">EXCLUSIVE 팩</h2>
              <p className="text-gray-500">완전 독점. 엔터프라이즈 솔루션.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.exclusive.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">자주 묻는 질문</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">&quot;카테고리 보호&quot;가 뭔가요?</h3>
              <p className="text-gray-400 text-sm">
                비독점 라이선스의 경우, 동일 제품 카테고리(예: 미용기기) 내에서 최대 3개사까지만 판매합니다. 경쟁사가 같은 소재를 사용하는 것을 방지합니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">&quot;수정&quot;에는 뭐가 포함되나요?</h3>
              <p className="text-gray-400 text-sm">
                수정에는 텍스트/자막 변경, 색상 조정, 간단한 편집이 포함됩니다. 모델 변경이나 모션 수정은 포함되지 않으며 새로운 주문이 필요합니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">왜 100% 선결제인가요?</h3>
              <p className="text-gray-400 text-sm">
                AI 생성에는 상당한 컴퓨팅 리소스가 선투입됩니다. 엔터프라이즈 고객(B2B)의 경우 유연한 결제 조건을 제공합니다. 첫 거래시 크몽이나 숨고 에스크로를 이용하실 수 있습니다.
              </p>
            </div>
            <div className="p-6 bg-[#0A0A0A] border border-[#222] rounded-xl">
              <h3 className="font-semibold text-white mb-2">프로덕션 회사와 뭐가 다른가요?</h3>
              <p className="text-gray-400 text-sm">
                일반 프로덕션은 3주 이상 소요됩니다 (기획, 촬영, 편집). 저희는 48시간 내 납품하며, 스케줄 조율, 장소 섭외, 모델 코디네이션이 필요 없습니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-12 bg-[#0A0A0A] border border-[#00F5A0]/30 rounded-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">어떤 패키지를 선택해야 할지 모르겠다면?</h2>
          <p className="text-gray-400 mb-8">
            니즈에 맞는 최적의 옵션을 추천해 드립니다.
          </p>
          <Link
            href="/contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            무료 상담 받기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
