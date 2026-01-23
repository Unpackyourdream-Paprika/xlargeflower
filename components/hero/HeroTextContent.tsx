'use client';

import Link from 'next/link';
import { triggerOpenChat } from '@/components/GlobalChatButton';
import { useState, useEffect } from 'react';

const descriptions = [
  '잘 만든 상품이 묻히지 않도록. 클릭을 부르는 AI 숏폼 소재로, 준비된 상세페이지에 폭발적인 트래픽을 꽂아드립니다.',
  '100명이 들어와야 1명이 삽니다. 지금 필요한 건 압도적인 노출입니다. 이탈 없는 고효율 AI 광고 소재로 구매할 고객을 사장님 스토어 앞까지 데려다 놓겠습니다.',
  '아무리 좋은 제품도 클릭하지 않으면 팔리지 않습니다. 평균 클릭률(CTR) 2배 상승. 검증된 AI 퍼포먼스 영상으로 잠재 고객을 쓸어 담으세요.',
];

export default function HeroTextContent() {
  const [currentDescription, setCurrentDescription] = useState(descriptions[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    setCurrentDescription(descriptions[randomIndex]);
  }, []);

  return (
    <div className="text-center lg:text-left" style={{ wordBreak: 'keep-all' }}>
      <p className="label-gradient mb-6 lg:mb-8">AI SHORT-FORM AD PRODUCTION</p>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-normal text-white"
        style={{ fontSize: 'clamp(1.875rem, 4vw, 3.75rem)' }}
      >
        <span className="block" style={{ wordBreak: 'keep-all' }}>
          모델 섭외 없는
        </span>
        <span className="block" style={{ wordBreak: 'keep-all' }}>
          AI 숏폼 광고 제작
        </span>
      </h1>

      <p
        className="mt-6 lg:mt-8 text-base sm:text-lg lg:text-xl text-white/80 max-w-xl mx-auto lg:mx-0"
        style={{ wordBreak: 'keep-all' }}
      >
        {currentDescription}
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
