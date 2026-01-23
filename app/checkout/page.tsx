'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const planName = searchParams.get('plan') || '';
  const price = searchParams.get('price') || '0';

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('ko-KR').format(parseInt(price));
  };

  const handleStripeCheckout = async () => {
    setIsLoading(true);

    try {
      // TODO: Stripe Checkout Session 생성 API 호출
      // const response = await fetch('/api/checkout/create-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan: planName, price: parseInt(price) })
      // });
      // const { url } = await response.json();
      // window.location.href = url;

      alert('Stripe 연동은 아직 구현되지 않았습니다.\n\n담당자가 별도 안내 드리겠습니다.');
      router.push('/#contact-form');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('결제 페이지 로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!planName || !price) {
      router.push('/');
    }
  }, [planName, price, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold">XL</span>
            </div>
          </div>

          {/* Plan Info */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">카드 결제</h1>
            <p className="text-gray-500 text-sm">안전한 결제를 위해 Stripe를 사용합니다</p>
          </div>

          {/* Order Summary */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6 mb-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm">선택한 플랜</span>
              <span className="text-white font-medium">{planName}</span>
            </div>
            <div className="flex justify-between items-end pt-4 border-t border-[#222]">
              <span className="text-gray-400">결제 금액</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#00F5A0]">₩{formatPrice(price)}</span>
                <p className="text-xs text-gray-500 mt-1">VAT 포함</p>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-[#00F5A0]/5 border border-[#00F5A0]/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-[#00F5A0] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-white font-medium mb-1">법인카드 결제 안내</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  결제 완료 시 지출증빙용 영수증이 자동으로 발행됩니다.
                  세금계산서가 필요하신 경우 별도로 문의해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleStripeCheckout}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  결제창 로딩 중...
                </span>
              ) : (
                '카드로 결제하기'
              )}
            </button>

            <Link
              href="/#contact-form"
              className="block w-full py-4 bg-[#111] border border-[#333] text-white font-medium rounded-xl hover:border-[#00F5A0]/50 transition-all text-center"
            >
              도입 문의하기
            </Link>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">SSL 보안</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">안전 결제</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          로딩 중...
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
