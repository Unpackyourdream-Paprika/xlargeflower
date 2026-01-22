'use client';

import Link from 'next/link';
import { triggerOpenChat } from '@/components/GlobalChatButton';

export default function HeroTextContent() {
  return (
    <div className="text-center lg:text-left" style={{ wordBreak: 'keep-all' }}>
      <p className="label-gradient mb-6 lg:mb-8">AI SHORT-FORM AD PRODUCTION</p>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-normal"
        style={{ fontSize: 'clamp(1.875rem, 4vw, 3.75rem)' }}
      >
        <span className="block text-white mb-2" style={{ wordBreak: 'keep-all' }}>
          매출 전환율 1위,
        </span>
        <span className="block gradient-text" style={{ wordBreak: 'keep-all' }}>
          모델 섭외 없는
        </span>
        <span className="block gradient-text" style={{ wordBreak: 'keep-all' }}>
          AI 숏폼 광고 제작
        </span>
      </h1>

      <p
        className="mt-6 lg:mt-8 text-base sm:text-lg lg:text-xl text-white/80 max-w-xl mx-auto lg:mx-0"
        style={{ wordBreak: 'keep-all' }}
      >
        모델은 저희가 준비했습니다. 대표님은 텍스트만 주세요.
        <br className="hidden sm:block" />
        촬영/섭외 비용 0원, 48시간 만에 구매로 이어지는 고효율 광고 소재를 받아보세요.
      </p>

      <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Link href="/portfolio" className="btn-primary text-base lg:text-lg whitespace-nowrap">
          제작 가능한 영상 보기
        </Link>
        <button
          onClick={() => triggerOpenChat()}
          className="btn-secondary text-base lg:text-lg whitespace-nowrap"
        >
          무료 견적 받기
        </button>
      </div>
    </div>
  );
}
