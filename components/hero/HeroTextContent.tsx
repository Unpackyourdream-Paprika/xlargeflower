'use client';

import Link from 'next/link';
import { triggerOpenChat } from '@/components/GlobalChatButton';

export default function HeroTextContent() {
  return (
    <div className="text-center lg:text-left" style={{ wordBreak: 'keep-all' }}>
      <p className="label-gradient mb-6 lg:mb-8">CONVERSION-OPTIMIZED AI MODEL</p>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-normal"
        style={{ fontSize: 'clamp(1.875rem, 4vw, 3.75rem)' }}
      >
        <span className="block text-white mb-2" style={{ wordBreak: 'keep-all' }}>
          매출 전환율 1위,
        </span>
        <span className="block gradient-text" style={{ wordBreak: 'keep-all' }}>
          AI 버추얼 광고 모델
        </span>
        <span className="block gradient-text" style={{ wordBreak: 'keep-all' }}>
          제작 XLARGE
        </span>
      </h1>

      <p
        className="mt-6 lg:mt-8 text-base sm:text-lg lg:text-xl text-white/80 max-w-xl mx-auto lg:mx-0"
        style={{ wordBreak: 'keep-all' }}
      >
        국내 최초, 구매 전환(Conversion)에 최적화된 AI 퍼포먼스 모델 솔루션.
        <br className="hidden sm:block" />
        거품 낀 섭외비 대신, 확실한 영상 자산을 소유하세요.
      </p>

      <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <button
          onClick={() => {
            const modelSection = document.getElementById('model-lineup');
            if (modelSection) {
              modelSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="btn-primary text-base lg:text-lg whitespace-nowrap"
        >
          내 브랜드에 맞는 모델 찾기
        </button>
        <Link href="/portfolio" className="btn-secondary text-base lg:text-lg whitespace-nowrap">
          포트폴리오 보기
        </Link>
      </div>
    </div>
  );
}
