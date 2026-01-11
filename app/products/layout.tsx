import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '도입 비용 안내 | XLARGE AI 모델 에이전시',
  description: '모델 섭외비, 스튜디오 비용 0원. 월 300만 원대로 평생 소장 가능한 고효율 광고 소재를 확보하세요. 중견/대기업 전용 엔터프라이즈 플랜 지원.',
  openGraph: {
    title: '도입 비용 안내 | XLARGE AI 모델 에이전시',
    description: '모델 섭외비, 스튜디오 비용 0원. 월 300만 원대로 평생 소장 가능한 고효율 광고 소재를 확보하세요.',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
