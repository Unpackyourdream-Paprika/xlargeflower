import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalChatButton from "@/components/GlobalChatButton";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'XLARGE | 매출을 부르는 AI 광고 모델 & 숏폼 소재 제작 솔루션',
  description: '인플루언서 거품을 뺀 합리적 비용. 초상권 걱정 없는 브랜드 전속 AI 모델로 귀사의 ROAS를 극대화하세요. 촬영 없이 48시간 내 납품. 지금 VIP 상담 신청.',
  keywords: ['AI 광고 모델', '버추얼 인플루언서 제작', 'AI 영상 제작', '숏폼 광고 소재', '퍼포먼스 마케팅 소재', 'ROAS 개선', '초상권 없는 모델', '광고 모델 섭외 비용', 'UGC 마케팅'],
  authors: [{ name: 'XLARGE' }],
  openGraph: {
    title: 'XLARGE | 매출을 부르는 AI 광고 모델 & 숏폼 소재 제작 솔루션',
    description: '인플루언서 거품을 뺀 합리적 비용. 초상권 걱정 없는 브랜드 전속 AI 모델로 귀사의 ROAS를 극대화하세요.',
    images: ['/images/xlargeflower_og.png'],
    type: 'website',
    locale: 'ko_KR',
    siteName: 'XLARGE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XLARGE | 매출을 부르는 AI 광고 모델 & 숏폼 소재 제작 솔루션',
    description: '인플루언서 거품을 뺀 합리적 비용. 초상권 걱정 없는 브랜드 전속 AI 모델로 귀사의 ROAS를 극대화하세요.',
    images: ['/images/xlargeflower_og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="naver-site-verification" content="10b9b9b7a25c91eb7bcdf5221c87782d57917c45" />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WBLTN85HQK"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WBLTN85HQK');
            `,
          }}
        />
      </head>
      <body
        className={`${geistMono.variable} antialiased bg-[#050505] text-white`}
      >
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <GlobalChatButton />
      </body>
    </html>
  );
}
