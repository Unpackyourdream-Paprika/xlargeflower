import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalChatButton from "@/components/GlobalChatButton";
import { ThemeProvider } from "@/contexts/ThemeContext";
import TrackingProvider from "@/components/TrackingProvider";
import { locales, type Locale } from "@/i18n/config";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages();
  const metadata = messages.metadata as Record<string, string>;

  const localeMap: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
  };

  return {
    title: metadata?.title || 'XLARGE',
    description: metadata?.description || 'AI Performance Creative',
    keywords: metadata?.keywords?.split(', ') || [],
    authors: [{ name: 'XLARGE' }],
    openGraph: {
      title: metadata?.title || 'XLARGE',
      description: metadata?.description || 'AI Performance Creative',
      images: ['/images/xlargeflower_og.png'],
      type: 'website',
      locale: localeMap[locale] || 'ko_KR',
      siteName: 'XLARGE',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata?.title || 'XLARGE',
      description: metadata?.description || 'AI Performance Creative',
      images: ['/images/xlargeflower_og.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'ko': '/ko',
        'en': '/en',
        'ja': '/ja',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="naver-site-verification" content="10b9b9b7a25c91eb7bcdf5221c87782d57917c45" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />

        {/* Preconnect */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Font */}
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

        {/* Meta Pixel */}
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
            alt=""
          />
        </noscript>
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <TrackingProvider>
              <Header />
              <main className="pt-16">
                {children}
              </main>
              <Footer />
              {/* <GlobalChatButton /> */}
            </TrackingProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
