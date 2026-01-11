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
  title: 'XLARGE FLOWER | 48시간 AI 광고 소재 제작',
  description: '촬영 없이, 모델 섭외 없이. 귀사의 브랜드 필름을 48시간 만에 완성합니다. AI 기반 숏폼 광고 솔루션.',
  keywords: ['AI영상제작', '숏폼광고', '릴스마케팅', '영상편집', 'AI모델', '광고소재', '퍼포먼스마케팅'],
  authors: [{ name: 'XLARGE FLOWER' }],
  openGraph: {
    title: '촬영은 끝났다. 이제 생성이다. | XLARGE FLOWER',
    description: '48시간 완성 하이엔드 광고 소재. 지금 바로 견적 확인하기.',
    images: ['/og-image.svg'],
    type: 'website',
    locale: 'ko_KR',
    siteName: 'XLARGE FLOWER',
  },
  twitter: {
    card: 'summary_large_image',
    title: '촬영은 끝났다. 이제 생성이다. | XLARGE FLOWER',
    description: '48시간 완성 하이엔드 광고 소재. 지금 바로 견적 확인하기.',
    images: ['/og-image.svg'],
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
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
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
