'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtistModel, getArtistModels, PricingPlan, PromotionSettings, submitContact, getCustomModelSettings, CustomModelSettings } from '@/lib/supabase';

interface OrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pricingPlans: PricingPlan[];
  initialArtist?: string;
  promotion?: PromotionSettings | null;
}

type ModelOption = 'select' | 'none' | 'custom';
type Step = 1 | 2 | 3 | 4; // 1: 모델선택, 2: 매체선택, 3: 정보입력, 4: 결제
type PaymentMethod = 'bank' | 'card' | null;

// Discord 웹훅 트래킹
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1464450994913153228/uw35o_5VS8jZdAKmlA3NjIzOnaXkGrZvcFm-IQDrfgO6HPiLhU5Z8a6hPqp1k7FRb__H';

async function sendDiscordWebhook(data: {
  step: number;
  action: string;
  details: Record<string, unknown>;
}) {
  try {
    const embed = {
      title: `🛒 주문 트래킹 - Step ${data.step}`,
      description: data.action,
      color: data.step === 4 ? 0x00F5A0 : 0x5865F2,
      fields: Object.entries(data.details).map(([key, value]) => ({
        name: key,
        value: String(value) || '(없음)',
        inline: true
      })),
      timestamp: new Date().toISOString()
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (error) {
    console.error('Discord webhook error:', error);
  }
}

export default function OrderBottomSheet({ isOpen, onClose, pricingPlans, initialArtist, promotion }: OrderBottomSheetProps) {
  const [step, setStep] = useState<Step>(1);
  const [artists, setArtists] = useState<ArtistModel[]>([]);
  const [modelOption, setModelOption] = useState<ModelOption>('select');
  const [selectedArtistId, setSelectedArtistId] = useState<string>('');
  const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);
  const [customModelSettings, setCustomModelSettings] = useState<CustomModelSettings>({
    price: 2000000,
    title: '커스텀 모델 주문제작',
    description: '브랜드 전용 AI 모델 개발',
    features: []
  });

  // 상품(팩) 선택 - 필수
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  // Step 2: 매체 선택 데이터
  const [mediaData, setMediaData] = useState({
    platforms: [] as string[],
    mediaBudget: '',
    targetAudience: '',
    targetRegion: ''
  });

  // Step 3: 정보 입력 데이터
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });

  // Step 4: 결제 관련
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분 = 1800초
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // 타이머 효과
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive]);

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 아티스트 목록 및 커스텀 모델 설정 로드
  useEffect(() => {
    async function loadData() {
      try {
        const [artistsData, customSettings] = await Promise.all([
          getArtistModels(),
          getCustomModelSettings()
        ]);
        setArtists(artistsData);
        setCustomModelSettings(customSettings);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    if (isOpen) {
      loadData();
      // 모달 열림 트래킹
      sendDiscordWebhook({
        step: 0,
        action: '주문 모달 열림',
        details: { timestamp: new Date().toLocaleString('ko-KR') }
      });
    }
  }, [isOpen]);

  // 초기 아티스트 설정
  useEffect(() => {
    if (initialArtist && artists.length > 0) {
      const artist = artists.find(a => a.name === initialArtist);
      if (artist) {
        setModelOption('select');
        setSelectedArtistId(artist.id || '');
      }
    }
  }, [initialArtist, artists]);

  // 금액 포맷
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 선택된 모델 정보
  const getSelectedModelInfo = () => {
    if (modelOption === 'select') {
      const artist = artists.find(a => a.id === selectedArtistId);
      return artist ? { name: artist.name, price: artist.price || 0 } : null;
    } else if (modelOption === 'custom') {
      return { name: customModelSettings.title, price: customModelSettings.price };
    }
    return { name: '모델 없음', price: 0 };
  };

  // 선택된 상품(팩) 정보
  const getSelectedPlanInfo = () => {
    const plan = pricingPlans.find(p => p.id === selectedPlanId);
    return plan || null;
  };

  // 총 금액 계산 (팩 가격 + 모델 가격)
  const calculateTotalPrice = () => {
    const planInfo = getSelectedPlanInfo();
    const modelInfo = getSelectedModelInfo();

    let total = planInfo?.price || 0;

    // 모델 추가 비용 (기존 아티스트 선택 시)
    if (modelOption === 'select' && modelInfo?.price) {
      total += modelInfo.price;
    }
    // 커스텀 모델은 별도 가격
    if (modelOption === 'custom') {
      total += customModelSettings.price;
    }

    // 프로모션 할인 적용
    if (promotion && promotion.discount_rate > 0) {
      total = Math.round(total * (1 - promotion.discount_rate / 100));
    }

    return total;
  };

  // 상품명 생성
  const getProductName = () => {
    const plan = getSelectedPlanInfo();
    const model = getSelectedModelInfo();

    let name = plan?.title || '상품';
    if (model?.name && modelOption !== 'none') {
      name += ` + ${model.name}`;
    }
    return name;
  };

  // Step 1: 상품 + 모델 선택 완료
  const handleStep1Next = () => {
    const planInfo = getSelectedPlanInfo();
    const modelInfo = getSelectedModelInfo();
    sendDiscordWebhook({
      step: 1,
      action: '상품 + 모델 선택 완료',
      details: {
        '선택 상품': planInfo?.title || '없음',
        '상품 가격': planInfo?.price ? `₩${formatPrice(planInfo.price)}` : '₩0',
        '모델 옵션': modelOption === 'select' ? '기존 아티스트' : modelOption === 'custom' ? '커스텀 모델' : '모델 없음',
        '선택된 모델': modelInfo?.name || '없음',
        '총 금액': `₩${formatPrice(calculateTotalPrice())}`
      }
    });
    setStep(2);
  };

  // Step 2: 매체 선택 완료
  const handleStep2Next = () => {
    sendDiscordWebhook({
      step: 2,
      action: '매체 선택 완료',
      details: {
        '선택 플랫폼': mediaData.platforms.join(', ') || '없음',
        '매체비 예산': mediaData.mediaBudget || '미정',
        '타겟층': mediaData.targetAudience || '미정',
        '타겟 지역': mediaData.targetRegion || '미정'
      }
    });
    setStep(3);
  };

  // Step 3: 정보 입력 완료 -> 결제 단계로
  const handleStep3Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const modelInfo = getSelectedModelInfo();

      // 주문 내용 정리
      const message = `[모델 선택]
- 옵션: ${modelOption === 'select' ? '기존 아티스트' : modelOption === 'custom' ? '커스텀 모델' : '모델 없음'}
- 모델명: ${modelInfo?.name || '없음'}
- 모델 가격: ₩${formatPrice(modelInfo?.price || 0)}

[매체 정보]
- 플랫폼: ${mediaData.platforms.join(', ') || '미정'}
- 매체비 예산: ${mediaData.mediaBudget || '미정'}
- 타겟층: ${mediaData.targetAudience || '미정'}
- 타겟 지역: ${mediaData.targetRegion || '미정'}

[고객 메시지]
${formData.message || '(없음)'}`;

      await submitContact({
        name: formData.name,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone || null,
        budget: `₩${formatPrice(calculateTotalPrice())}`,
        product_interest: modelInfo?.name || null,
        message,
      });

      // Step 3 완료 트래킹
      sendDiscordWebhook({
        step: 3,
        action: '정보 입력 완료 - 결제 단계 진입',
        details: {
          '이름': formData.name,
          '회사명': formData.company || '개인',
          '이메일': formData.email,
          '연락처': formData.phone || '미입력',
          '총 금액': `₩${formatPrice(calculateTotalPrice())}`
        }
      });

      setStep(4);
    } catch (error) {
      console.error('Submit error:', error);
      alert('주문 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 무통장입금 선택
  const handleBankTransfer = async () => {
    setPaymentMethod('bank');
    setIsTimerActive(true);
    setTimeLeft(30 * 60); // 30분 리셋
    setIsSubmitted(true);

    sendDiscordWebhook({
      step: 4,
      action: '💰 무통장입금 선택',
      details: {
        '고객명': formData.name,
        '이메일': formData.email,
        '총 금액': `₩${formatPrice(calculateTotalPrice())}`,
        '입금 마감': '30분 내'
      }
    });

    // 주문 확인 이메일 발송 시도
    try {
      // 주문 정보를 DB에 저장하고 ID 받기
      const planInfo = getSelectedPlanInfo();
      const modelInfo = getSelectedModelInfo();
      const orderData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || null,
        customer_company: formData.company || null,
        order_summary: {
          product: getProductName(),
          plan: planInfo?.title,
          modelOption,
          model: modelInfo?.name,
          platforms: mediaData.platforms.join(', '),
          mediaBudget: mediaData.mediaBudget,
          target_audience: mediaData.targetAudience,
          targetRegion: mediaData.targetRegion,
          estimated_price: calculateTotalPrice()
        },
        selected_pack: planInfo?.title || 'READY',
        final_price: calculateTotalPrice()
      };

      // 주문 생성 API 호출
      const createResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (createResponse.ok) {
        const { orderId } = await createResponse.json();
        // 주문 확인 이메일 발송
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            type: 'order_confirmation'
          })
        });
      }
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      // 이메일 발송 실패해도 주문 플로우는 계속 진행
    }
  };

  // 카드결제 선택 (Stripe)
  const handleCardPayment = async () => {
    setPaymentMethod('card');
    setIsStripeLoading(true);

    sendDiscordWebhook({
      step: 4,
      action: '💳 카드결제 선택 (Stripe)',
      details: {
        '고객명': formData.name,
        '이메일': formData.email,
        '총 금액': `₩${formatPrice(calculateTotalPrice())}`
      }
    });

    try {
      const totalPrice = calculateTotalPrice();
      const productName = getProductName();

      // 필수 값 검증
      if (!totalPrice || totalPrice <= 0) {
        throw new Error('결제 금액이 유효하지 않습니다.');
      }

      // Stripe Checkout 세션 생성
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          customerName: formData.name,
          customerEmail: formData.email,
          productName: productName,
          metadata: {
            selectedPlan: getSelectedPlanInfo()?.title,
            modelOption,
            selectedModel: getSelectedModelInfo()?.name,
            platforms: mediaData.platforms.join(', '),
            mediaBudget: mediaData.mediaBudget,
            targetAudience: mediaData.targetAudience,
            targetRegion: mediaData.targetRegion,
            company: formData.company,
            phone: formData.phone,
            message: formData.message
          }
        })
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Stripe Checkout 페이지로 리다이렉트
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Stripe error:', error);
      alert('카드결제 연결 중 오류가 발생했습니다. 무통장입금을 이용해주세요.');
      setPaymentMethod(null);
    } finally {
      setIsStripeLoading(false);
    }
  };

  // 플랫폼 토글
  const togglePlatform = (platform: string) => {
    setMediaData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // 모델 옵션 변경
  const handleModelOptionChange = (option: ModelOption) => {
    setModelOption(option);
    if (option !== 'select') {
      setSelectedArtistId('');
    }
  };

  // 아티스트 선택
  const handleArtistSelect = (artist: ArtistModel) => {
    setSelectedArtistId(artist.id || '');
    setIsArtistDropdownOpen(false);
  };

  // 뒤로 가기
  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      if (step === 4) {
        setPaymentMethod(null);
        setIsSubmitted(false);
        setIsTimerActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setStep(1);
    setIsSubmitted(false);
    setSelectedPlanId('');
    setModelOption('select');
    setSelectedArtistId('');
    setMediaData({ platforms: [], mediaBudget: '', targetAudience: '', targetRegion: '' });
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    setPaymentMethod(null);
    setIsTimerActive(false);
    setTimeLeft(30 * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  if (!isOpen) return null;

  // Step 1 유효성: 상품(팩) 필수 + 모델 선택 조건
  const isStep1Valid = selectedPlanId && (modelOption === 'none' || modelOption === 'custom' || (modelOption === 'select' && selectedArtistId));

  // 진행률 표시
  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[101]"
      >
        <div className="bg-[#0A0A0A] border-t border-[#222] rounded-t-3xl max-h-[90vh] flex flex-col">
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Progress Bar */}
          {!isSubmitted && (
            <div className="px-6 pb-2">
              <div className="h-1 bg-[#222] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={step >= 1 ? 'text-[#00F5A0]' : ''}>모델 선택</span>
                <span className={step >= 2 ? 'text-[#00F5A0]' : ''}>매체 선택</span>
                <span className={step >= 3 ? 'text-[#00F5A0]' : ''}>정보 입력</span>
                <span className={step >= 4 ? 'text-[#00F5A0]' : ''}>결제</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step > 1 && !isSubmitted && (
                <button
                  onClick={handleBack}
                  className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center hover:bg-[#222] transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <h2 className="text-xl font-bold text-white">
                {step === 1 && '모델 선택'}
                {step === 2 && '매체 선택'}
                {step === 3 && '정보 입력'}
                {step === 4 && !isSubmitted && '결제 방법'}
                {step === 4 && isSubmitted && '주문 완료'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-[#111] border border-[#333] flex items-center justify-center hover:bg-[#222] transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {/* Step 1: 상품 + 모델 선택 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 상품(팩) 선택 - 필수 */}
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      📦 상품 선택 <span className="text-[#00F5A0] text-xs">(필수)</span>
                    </h3>
                    <div className="space-y-2">
                      {pricingPlans.filter(p => p.is_active).map((plan) => {
                        const discountedPrice = promotion && promotion.discount_rate > 0
                          ? Math.round(plan.price * (1 - promotion.discount_rate / 100))
                          : plan.price;

                        return (
                          <label
                            key={plan.id}
                            className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all ${
                              selectedPlanId === plan.id
                                ? 'bg-[#00F5A0]/10 border-[#00F5A0]'
                                : 'bg-[#111] border-[#333] hover:border-[#00F5A0]/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="plan"
                              checked={selectedPlanId === plan.id}
                              onChange={() => setSelectedPlanId(plan.id || '')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedPlanId === plan.id
                                ? 'border-[#00F5A0] bg-[#00F5A0]'
                                : 'border-gray-600'
                            }`}>
                              {selectedPlanId === plan.id && (
                                <div className="w-2 h-2 bg-black rounded-full" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{plan.title}</span>
                                {plan.is_featured && (
                                  <span className="px-2 py-0.5 bg-[#00F5A0]/20 text-[#00F5A0] text-xs rounded-full">
                                    {plan.badge_text || 'BEST'}
                                  </span>
                                )}
                              </div>
                              {plan.subtitle && (
                                <p className="text-sm text-gray-500">{plan.subtitle}</p>
                              )}
                            </div>
                            <div className="text-right">
                              {promotion && promotion.discount_rate > 0 ? (
                                <>
                                  <p className="text-gray-500 text-xs line-through">₩{formatPrice(plan.price)}</p>
                                  <p className="text-[#00F5A0] font-bold">₩{formatPrice(discountedPrice)}</p>
                                </>
                              ) : (
                                <p className="text-white font-bold">₩{formatPrice(plan.price)}</p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="border-t border-[#333] pt-4">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      🎭 AI 모델 선택 <span className="text-gray-500 text-xs">(선택)</span>
                    </h3>
                  </div>

                  {/* 기존 아티스트 선택 */}
                  <label className="flex items-start gap-3 cursor-pointer group p-4 bg-[#111] border border-[#333] rounded-xl hover:border-[#00F5A0]/50 transition-colors">
                    <div className="relative mt-0.5">
                      <input
                        type="radio"
                        name="modelOption"
                        checked={modelOption === 'select'}
                        onChange={() => handleModelOptionChange('select')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        modelOption === 'select'
                          ? 'border-[#00F5A0] bg-[#00F5A0]'
                          : 'border-gray-600'
                      }`}>
                        {modelOption === 'select' && (
                          <div className="w-2 h-2 bg-black rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium">기존 아티스트 모델 선택</span>
                      <p className="text-sm text-gray-500">등록된 AI 모델 중 선택</p>
                    </div>
                  </label>

                  {/* 아티스트 드롭다운 */}
                  {modelOption === 'select' && (
                    <div className="relative ml-4">
                      <button
                        type="button"
                        onClick={() => setIsArtistDropdownOpen(!isArtistDropdownOpen)}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#00F5A0] focus:outline-none transition-colors text-left flex items-center justify-between"
                      >
                        <span className={selectedArtistId ? 'text-white' : 'text-gray-500'}>
                          {artists.find(a => a.id === selectedArtistId)?.name || '모델을 선택하세요'}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isArtistDropdownOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isArtistDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-lg max-h-60 overflow-y-auto">
                          {artists.map((artist) => (
                            <button
                              key={artist.id}
                              type="button"
                              onClick={() => handleArtistSelect(artist)}
                              className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                                selectedArtistId === artist.id
                                  ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
                                  : 'text-white hover:bg-[#222]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {artist.thumbnail_url && (
                                  <img
                                    src={artist.thumbnail_url}
                                    alt={artist.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <span className="block">{artist.name}</span>
                                  {artist.name_ko && (
                                    <span className="text-xs text-gray-500">{artist.name_ko}</span>
                                  )}
                                </div>
                              </div>
                              {artist.price && artist.price > 0 && (
                                <span className="text-sm text-gray-400">+₩{formatPrice(artist.price)}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 커스텀 모델 주문제작 */}
                  <label className="flex items-start gap-3 cursor-pointer group p-4 bg-[#111] border border-[#333] rounded-xl hover:border-purple-500/50 transition-colors">
                    <div className="relative mt-0.5">
                      <input
                        type="radio"
                        name="modelOption"
                        checked={modelOption === 'custom'}
                        onChange={() => handleModelOptionChange('custom')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        modelOption === 'custom'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-600'
                      }`}>
                        {modelOption === 'custom' && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{customModelSettings.title}</span>
                        <span className="text-sm text-purple-400 font-medium">+₩{formatPrice(customModelSettings.price)}</span>
                      </div>
                      <p className="text-sm text-gray-500">{customModelSettings.description}</p>
                    </div>
                  </label>

                  {/* 모델 필요없음 */}
                  <label className="flex items-start gap-3 cursor-pointer group p-4 bg-[#111] border border-[#333] rounded-xl hover:border-[#00F5A0]/50 transition-colors">
                    <div className="relative mt-0.5">
                      <input
                        type="radio"
                        name="modelOption"
                        checked={modelOption === 'none'}
                        onChange={() => handleModelOptionChange('none')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        modelOption === 'none'
                          ? 'border-[#00F5A0] bg-[#00F5A0]'
                          : 'border-gray-600'
                      }`}>
                        {modelOption === 'none' && (
                          <div className="w-2 h-2 bg-black rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-white font-medium">모델 필요없음</span>
                      <p className="text-sm text-gray-500">영상만 제작 (모델 출연 없이)</p>
                    </div>
                  </label>

                  {/* 다음 버튼 */}
                  <button
                    onClick={handleStep1Next}
                    disabled={!isStep1Valid}
                    className="w-full py-4 rounded-full font-bold text-center transition-all bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    다음
                  </button>
                </motion.div>
              )}

              {/* Step 2: 매체 선택 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 플랫폼 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      광고 플랫폼 (복수 선택 가능)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['TikTok', 'YouTube', 'Instagram', 'Facebook', 'Naver', '기타'].map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => togglePlatform(platform)}
                          className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                            mediaData.platforms.includes(platform)
                              ? 'bg-[#00F5A0]/20 border-[#00F5A0] text-[#00F5A0]'
                              : 'bg-[#111] border-[#333] text-white hover:border-[#00F5A0]/50'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 매체비 예산 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      월 매체비 예산
                    </label>
                    <select
                      value={mediaData.mediaBudget}
                      onChange={(e) => setMediaData({ ...mediaData, mediaBudget: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#00F5A0] focus:outline-none transition-colors"
                    >
                      <option value="">선택하세요</option>
                      <option value="100만원 미만">100만원 미만</option>
                      <option value="100-300만원">100-300만원</option>
                      <option value="300-500만원">300-500만원</option>
                      <option value="500-1000만원">500-1000만원</option>
                      <option value="1000만원 이상">1000만원 이상</option>
                      <option value="미정">미정 / 협의 필요</option>
                    </select>
                  </div>

                  {/* 타겟층 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      타겟층
                    </label>
                    <input
                      type="text"
                      value={mediaData.targetAudience}
                      onChange={(e) => setMediaData({ ...mediaData, targetAudience: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                      placeholder="예: 20-30대 여성, MZ세대"
                    />
                  </div>

                  {/* 타겟 지역 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      타겟 지역
                    </label>
                    <select
                      value={mediaData.targetRegion}
                      onChange={(e) => setMediaData({ ...mediaData, targetRegion: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white focus:border-[#00F5A0] focus:outline-none transition-colors"
                    >
                      <option value="">선택하세요</option>
                      <option value="국내 전체">국내 전체</option>
                      <option value="수도권">수도권</option>
                      <option value="지방">지방</option>
                      <option value="해외">해외</option>
                      <option value="글로벌">글로벌 (국내+해외)</option>
                    </select>
                  </div>

                  {/* 다음 버튼 */}
                  <button
                    onClick={handleStep2Next}
                    className="w-full py-4 rounded-full font-bold text-center transition-all bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black hover:opacity-90"
                  >
                    다음
                  </button>
                </motion.div>
              )}

              {/* Step 3: 정보 입력 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleStep3Next} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          이름 <span className="text-[#00F5A0]">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                          placeholder="홍길동"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          회사명
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                          placeholder="(주)회사명"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          이메일 <span className="text-[#00F5A0]">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                          placeholder="email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          연락처
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                          placeholder="010-1234-5678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        추가 요청사항
                      </label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors resize-none"
                        placeholder="추가 요청사항이 있으시면 자유롭게 적어주세요."
                      />
                    </div>

                    {/* 주문 요약 */}
                    <div className="p-4 bg-[#111] border border-[#333] rounded-xl space-y-2">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">주문 요약</h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">모델</span>
                        <span className="text-white">{getSelectedModelInfo()?.name || '없음'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">플랫폼</span>
                        <span className="text-white">{mediaData.platforms.join(', ') || '미정'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">매체비 예산</span>
                        <span className="text-white">{mediaData.mediaBudget || '미정'}</span>
                      </div>
                      <div className="border-t border-[#333] my-3" />
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">예상 금액</span>
                        <span className="text-[#00F5A0] font-bold text-lg">₩{formatPrice(calculateTotalPrice())}</span>
                      </div>
                    </div>

                    {/* 다음 버튼 */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.name || !formData.email}
                      className="w-full py-4 rounded-full font-bold text-center transition-all bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '처리 중...' : '다음'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 4: 결제 방법 선택 */}
              {step === 4 && !isSubmitted && (
                <motion.div
                  key="step4-select"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* 결제 금액 표시 */}
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-2">결제 금액</p>
                    <p className="text-3xl font-bold text-white">₩{formatPrice(calculateTotalPrice())}</p>
                  </div>

                  {/* 결제 방법 선택 */}
                  <div className="space-y-4">
                    {/* 무통장입금 */}
                    <button
                      onClick={handleBankTransfer}
                      className="w-full p-6 bg-[#111] border border-[#333] rounded-2xl text-left hover:border-[#00F5A0]/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#00F5A0]/20 rounded-full flex items-center justify-center group-hover:bg-[#00F5A0]/30 transition-colors">
                          <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">무통장입금</p>
                          <p className="text-gray-500 text-sm">계좌이체로 결제합니다</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-500 group-hover:text-[#00F5A0] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>

                    {/* 카드결제 */}
                    <button
                      onClick={handleCardPayment}
                      disabled={isStripeLoading}
                      className="w-full p-6 bg-[#111] border border-[#333] rounded-2xl text-left hover:border-purple-500/50 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-bold text-lg">
                            {isStripeLoading ? '연결 중...' : '카드결제'}
                          </p>
                          <p className="text-gray-500 text-sm">신용카드로 결제합니다</p>
                        </div>
                        {isStripeLoading ? (
                          <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: 무통장입금 완료 */}
              {step === 4 && isSubmitted && paymentMethod === 'bank' && (
                <motion.div
                  key="step4-bank"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">주문이 접수되었습니다!</h3>
                  <p className="text-gray-400 mb-4">아래 계좌로 입금해주세요.</p>

                  {/* 타이머 */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      timeLeft <= 300 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                    </div>
                    <p className={`text-sm mt-2 ${timeLeft <= 300 ? 'text-red-400' : 'text-gray-500'}`}>
                      {timeLeft <= 0 ? '세션이 만료되었습니다' : '30분 내로 입금해주세요. 세션이 만료됩니다.'}
                    </p>
                  </div>

                  {/* 입금 정보 */}
                  <div className="bg-[#111] border border-[#333] rounded-xl p-6 text-left mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-4">무통장 입금 안내</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">예금주</span>
                        <span className="text-white font-medium">스네이크 스테이크 주식회사</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">계좌번호</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#00F5A0] font-bold">006037-04-008637</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('006037-04-008637');
                              alert('계좌번호가 복사되었습니다.');
                            }}
                            className="px-2 py-1 text-xs bg-[#222] text-gray-400 rounded hover:bg-[#333] transition-colors"
                          >
                            복사
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">입금액</span>
                        <span className="text-white font-bold">₩{formatPrice(calculateTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">입금자명</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-6">
                    입금 확인 후 빠른 시일 내에 연락드리겠습니다.<br />
                    주문 후 이메일에서 내용만 체크해주세요.
                  </p>

                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-[#111] border border-[#333] text-white rounded-xl hover:border-[#00F5A0]/50 transition-colors"
                  >
                    닫기
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}
