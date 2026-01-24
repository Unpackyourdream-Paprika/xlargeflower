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
  title: 'XLARGE | 브랜드와 셀러를 위한 AI 퍼포먼스 크리에이티브',
  description: '인플루언서 거품을 뺀 합리적 비용. 초상권 걱정 없는 브랜드 전속 AI 모델로 귀사의 ROAS를 극대화하세요. 촬영 없이 48시간 내 납품. 지금 VIP 상담 신청.',
  keywords: ['AI 광고 모델', '버추얼 인플루언서 제작', 'AI 영상 제작', '숏폼 광고 소재', '퍼포먼스 마케팅 소재', 'ROAS 개선', '초상권 없는 모델', '광고 모델 섭외 비용', 'UGC 마케팅'],
  authors: [{ name: 'XLARGE' }],
  openGraph: {
    title: 'XLARGE | 브랜드와 셀러를 위한 AI 퍼포먼스 크리에이티브',
    description: '인플루언서 거품을 뺀 합리적 비용. 초상권 걱정 없는 브랜드 전속 AI 모델로 귀사의 ROAS를 극대화하세요.',
    images: ['/images/xlargeflower_og.png'],
    type: 'website',
    locale: 'ko_KR',
    siteName: 'XLARGE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XLARGE | 브랜드와 셀러를 위한 AI 퍼포먼스 크리에이티브',
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

        {/* 인스타그램 인앱 브라우저 최적화 */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* DNS Prefetch - 외부 리소스 빠른 로딩 */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Preconnect - 중요 도메인 사전 연결 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* 폰트 로딩 최적화: display=swap으로 FOIT 방지 */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          crossOrigin="anonymous"
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
        {/* Meta Pixel (Facebook/Instagram Ads) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'YOUR_PIXEL_ID'}');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'YOUR_PIXEL_ID'}&ev=PageView&noscript=1`}
          />
        </noscript>
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
