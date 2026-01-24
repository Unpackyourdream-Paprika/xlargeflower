'use client';

import Link from 'next/link';
import React from 'react';
import { useTranslations } from 'next-intl';

export default function HeroTextContent() {
  const t = useTranslations('hero');

  return (
    <div className="text-center lg:text-left" style={{ wordBreak: 'keep-all' }}>
      <p className="label-gradient mb-6 lg:mb-8">{t('label')}</p>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-normal text-white"
        style={{ fontSize: 'clamp(1.875rem, 4vw, 3.75rem)' }}
      >
        <span className="block" style={{ wordBreak: 'keep-all' }}>
          {t('title1')}
        </span>
        <span className="block gradient-text" style={{ wordBreak: 'keep-all' }}>
          {t('title2')}
        </span>
      </h1>

      <p
        className="mt-6 lg:mt-8 text-base sm:text-lg lg:text-xl text-white/80 max-w-xl mx-auto lg:mx-0"
        style={{ wordBreak: 'keep-all' }}
      >
        {t('desc1')}<strong className="text-white">{t('desc1Bold')}</strong>{t('desc1End')}<br />
        {t('desc2')}<br /><br />
        <strong className="text-[#00F5A0]">{t('desc3Bold')}</strong>{t('desc3End')}<br />
        {t('desc4')}<br />
        <span className="text-white/60">{t('desc5')}</span>
      </p>

      <div className="mt-8 lg:mt-10 hidden lg:flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Link href="#comparison" className="btn-primary text-base lg:text-lg whitespace-nowrap">
          {t('ctaCompare')}
        </Link>
        <Link href="#pricing" className="btn-secondary text-base lg:text-lg whitespace-nowrap">
          {t('ctaPricing')}
        </Link>
      </div>
    </div>
  );
}
