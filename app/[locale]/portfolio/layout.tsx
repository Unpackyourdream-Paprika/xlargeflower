import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '소속 AI 아티스트 라인업 - Flower 및 전속 모델 | XLARGE',
  description: '패션, 뷰티, F&B 등 산업별 최적화된 AI 인플루언서 라인업. 원하는 이미지로 즉시 커스텀 가능한 고퀄리티 모델을 확인하세요.',
  openGraph: {
    title: '소속 AI 아티스트 라인업 - Flower 및 전속 모델 | XLARGE',
    description: '패션, 뷰티, F&B 등 산업별 최적화된 AI 인플루언서 라인업. 원하는 이미지로 즉시 커스텀 가능한 고퀄리티 모델을 확인하세요.',
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
