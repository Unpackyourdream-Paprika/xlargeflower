'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitContact } from '@/lib/supabase';

type ModalStep = 'SELECT' | 'GENERATE' | 'CONTACT';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 모델 프로필 타입
interface ModelProfile {
  name: string;
  nameKo: string;
  height: string;
  bloodType: string;
  mbti: string;
  age: string;
  specialty: string;
}

// 랜덤 프로필 생성 함수
function generateRandomProfile(styleKeyword: string): ModelProfile {
  const bloodTypes = ['A', 'B', 'O', 'AB'];
  const mbtis = ['ENFP', 'INFJ', 'ENTP', 'ISFJ', 'ESTJ', 'INFP', 'ENTJ', 'ISFP', 'ESTP', 'INTJ'];
  const specialties = ['패션 화보', '뷰티 광고', '브랜드 캠페인', 'SNS 콘텐츠', '럭셔리 브랜드', 'CF 모델'];

  // 스타일 키워드에서 이름 생성
  const namePool = {
    시크: { en: 'SERA', ko: '세라' },
    청순: { en: 'YUNA', ko: '유나' },
    고급: { en: 'LUNA', ko: '루나' },
    럭셔리: { en: 'ARIA', ko: '아리아' },
    힙: { en: 'ZENA', ko: '제나' },
    내추럴: { en: 'HANA', ko: '하나' },
    도시: { en: 'MIRA', ko: '미라' },
    따뜻: { en: 'SORA', ko: '소라' },
    쿨: { en: 'KIRA', ko: '키라' },
    우아: { en: 'ELLA', ko: '엘라' },
    default: { en: 'NOVA', ko: '노바' }
  };

  // 키워드 매칭
  let selectedName = namePool.default;
  const lowerKeyword = styleKeyword.toLowerCase();
  for (const [key, value] of Object.entries(namePool)) {
    if (lowerKeyword.includes(key)) {
      selectedName = value;
      break;
    }
  }

  return {
    name: selectedName.en,
    nameKo: selectedName.ko,
    height: `${Math.floor(Math.random() * (172 - 165 + 1)) + 165}cm`,
    bloodType: `${bloodTypes[Math.floor(Math.random() * bloodTypes.length)]}형`,
    mbti: mbtis[Math.floor(Math.random() * mbtis.length)],
    age: `${Math.floor(Math.random() * (26 - 22 + 1)) + 22}세`,
    specialty: specialties[Math.floor(Math.random() * specialties.length)]
  };
}

export default function CustomModelModal({ isOpen, onClose }: CustomModelModalProps) {
  const [step, setStep] = useState<ModalStep>('SELECT');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [modelProfile, setModelProfile] = useState<ModelProfile | null>(null);
  const [customModelName, setCustomModelName] = useState(''); // 사용자 지정 모델 이름

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setStep('SELECT');
      setGeneratedImage(null);
      setPrompt('');
      setError(null);
      setModelProfile(null);
      setCustomModelName('');
      setFormData({ name: '', company: '', email: '', phone: '', message: '' });
      setIsSubmitted(false);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // AI 이미지 생성
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('원하는 스타일을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이미지 생성에 실패했습니다.');
      }

      setGeneratedImage(data.imageUrl);
      // 프로필도 함께 생성
      setModelProfile(generateRandomProfile(prompt));
    } catch (err) {
      const message = err instanceof Error ? err.message : '이미지 생성에 실패했습니다.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 최종 모델 이름 (사용자 지정 or 자동 생성)
  const finalModelName = customModelName.trim() || modelProfile?.name || 'CUSTOM';
  const finalModelNameKo = customModelName.trim() ? '' : modelProfile?.nameKo || '';

  // 문의 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    try {
      const profileInfo = modelProfile
        ? `\n\n[생성된 AI 모델 프로필]\n- 모델명: ${finalModelName}${finalModelNameKo ? ` (${finalModelNameKo})` : ''}\n- 신장: ${modelProfile.height}\n- 혈액형: ${modelProfile.bloodType}\n- MBTI: ${modelProfile.mbti}\n- 연령: ${modelProfile.age}\n- 특기: ${modelProfile.specialty}`
        : '';

      const messageWithImage = generatedImage
        ? `[AI 체험을 통해 생성된 모델 프로필이 첨부되어 있습니다]\n\n입력한 스타일: ${prompt}${profileInfo}\n\n---\n\n${formData.message}`
        : formData.message;

      await submitContact({
        name: formData.name,
        company: formData.company || null,
        email: formData.email,
        phone: formData.phone || null,
        budget: null,
        product_interest: generatedImage ? `AI 모델 선택 문의 (${finalModelName})` : '맞춤형 모델 제작',
        message: messageWithImage,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submit error:', error);
      alert('문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 생성 실패 시 문의 폼으로 이동
  const handleErrorToContact = () => {
    setError(null);
    setStep('CONTACT');
    setFormData({
      ...formData,
      message: 'AI 모델 생성 체험 중 연결되어 문의드립니다. 원하는 스타일: ' + prompt,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-h-[90vh] overflow-y-auto bg-[#0A0A0A] border border-[#222] rounded-2xl shadow-2xl ${
            step === 'GENERATE' && generatedImage ? 'max-w-2xl' : 'max-w-lg'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Step 1: Selection */}
          {step === 'SELECT' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400">
                  CUSTOM MODEL
                </span>
                <h2 className="mt-2 text-2xl font-bold text-white">맞춤형 모델 제작</h2>
                <p className="mt-2 text-white/60">어떤 방식으로 시작하시겠어요?</p>
              </div>

              <div className="space-y-4">
                {/* Option A: 바로 상담 */}
                <button
                  onClick={() => setStep('CONTACT')}
                  className="w-full p-6 bg-[#111] border border-[#333] rounded-xl text-left hover:border-[#00F5A0]/50 hover:bg-[#111]/80 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00F5A0]/20 to-[#00D9F5]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                        전문가에게 바로 상담받기
                      </h3>
                      <p className="text-sm text-white/50">
                        원하는 스타일을 상담사에게 직접 설명해 주세요
                      </p>
                    </div>
                  </div>
                </button>

                {/* Option B: AI 모델 생성 */}
                <button
                  onClick={() => setStep('GENERATE')}
                  className="w-full p-6 bg-gradient-to-r from-purple-900/30 to-[#0A0A0A] border border-purple-500/30 rounded-xl text-left hover:border-[#00F5A0]/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00F5A0] transition-colors">
                        AI 모델 직접 생성해보기
                        <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                          NEW
                        </span>
                      </h3>
                      <p className="text-sm text-white/50">
                        원하는 스타일의 전속 모델을 직접 만들어 보세요
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Generate */}
          {step === 'GENERATE' && (
            <div className="p-8">
              {/* Back button */}
              <button
                onClick={() => {
                  setStep('SELECT');
                  setGeneratedImage(null);
                  setModelProfile(null);
                  setError(null);
                }}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                뒤로 가기
              </button>

              {!generatedImage ? (
                // 입력 화면
                <>
                  <div className="text-center mb-6">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400">
                      AI MODEL GENERATOR
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-white">나만의 AI 모델 만들기</h2>
                    <p className="mt-2 text-white/60">원하는 모델의 스타일과 분위기를 입력해 주세요</p>
                  </div>

                  {/* Prompt Input */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
                      placeholder="예: 시크한 도시 여성, 따뜻한 분위기의 청순한 모델"
                      className="w-full px-4 py-4 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors text-lg"
                      disabled={isGenerating}
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {['시크한', '청순한', '고급스러운', '힙한', '내추럴', '우아한'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setPrompt((prev) => prev ? `${prev}, ${tag}` : tag)}
                          className="px-3 py-1 text-xs bg-[#222] border border-[#333] rounded-full text-white/60 hover:text-white hover:border-purple-500/50 transition-all"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] hover:shadow-[0_0_30px_rgba(0,245,160,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        AI가 모델 프로필을 생성하고 있습니다...
                      </span>
                    ) : (
                      '모델 생성하기'
                    )}
                  </button>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm mb-3">{error}</p>
                      <button
                        onClick={handleErrorToContact}
                        className="text-sm text-white/70 hover:text-[#00F5A0] transition-colors underline"
                      >
                        상담을 통해 원하시는 모델을 찾아드릴까요?
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // 프로필 카드 결과 화면
                <>
                  <div className="text-center mb-6">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00F5A0]">
                      AI MODEL PROFILE
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-white">모델 프로필 카드</h2>
                  </div>

                  {/* 프로필 카드 */}
                  <div className="bg-gradient-to-b from-[#111] to-[#0A0A0A] border border-[#333] rounded-2xl overflow-hidden">
                    {/* 3면도 이미지 (정사각형) */}
                    <div className="relative">
                      <img
                        src={generatedImage}
                        alt="AI Model - 3 Views"
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex justify-between text-xs text-white/60">
                          <span>FRONT VIEW</span>
                          <span>45° ANGLE</span>
                          <span>SIDE PROFILE</span>
                        </div>
                      </div>
                    </div>

                    {/* 모델 정보 */}
                    {modelProfile && (
                      <div className="p-6">
                        {/* 이름 입력 */}
                        <div className="mb-4">
                          <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-2">
                            MODEL NAME (직접 입력 가능)
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={customModelName}
                              onChange={(e) => setCustomModelName(e.target.value.toUpperCase())}
                              placeholder={modelProfile.name}
                              className="flex-1 px-4 py-2 bg-[#0A0A0A] border border-[#333] rounded-xl text-2xl font-bold text-white placeholder-white/30 focus:border-[#00F5A0] focus:outline-none transition-colors uppercase tracking-tight"
                            />
                            <span className="px-3 py-1 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-full text-xs text-[#00F5A0]">
                              EXCLUSIVE
                            </span>
                          </div>
                          {!customModelName && (
                            <p className="mt-1 text-xs text-white/40">
                              자동 생성: {modelProfile.name} ({modelProfile.nameKo})
                            </p>
                          )}
                        </div>

                        {/* 스펙 그리드 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">HEIGHT</p>
                            <p className="text-lg font-bold text-white">{modelProfile.height}</p>
                          </div>
                          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">BLOOD</p>
                            <p className="text-lg font-bold text-white">{modelProfile.bloodType}</p>
                          </div>
                          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">MBTI</p>
                            <p className="text-lg font-bold text-white">{modelProfile.mbti}</p>
                          </div>
                          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-3 text-center">
                            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">AGE</p>
                            <p className="text-lg font-bold text-white">{modelProfile.age}</p>
                          </div>
                        </div>

                        {/* 특기/스타일 */}
                        <div className="flex items-center gap-2 mb-6">
                          <span className="text-xs text-white/40">SPECIALTY:</span>
                          <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm text-purple-300">
                            {modelProfile.specialty}
                          </span>
                          <span className="px-3 py-1 bg-[#222] border border-[#333] rounded-full text-sm text-white/60">
                            {prompt}
                          </span>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setGeneratedImage(null);
                              setModelProfile(null);
                              setCustomModelName('');
                              handleGenerate();
                            }}
                            disabled={isGenerating}
                            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#222] border border-[#333] hover:border-[#00F5A0]/50 transition-all disabled:opacity-50"
                          >
                            다시 생성하기
                          </button>
                          <button
                            onClick={() => setStep('CONTACT')}
                            className="flex-1 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] hover:shadow-[0_0_20px_rgba(0,245,160,0.4)] transition-all"
                          >
                            이 모델로 선택하기
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Contact Form */}
          {step === 'CONTACT' && (
            <div className="p-8">
              {/* Back button */}
              {!isSubmitted && (
                <button
                  onClick={() => setStep(generatedImage ? 'GENERATE' : 'SELECT')}
                  className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  뒤로 가기
                </button>
              )}

              {/* 선택한 모델 프로필 미리보기 */}
              {generatedImage && modelProfile && !isSubmitted && (
                <div className="mb-6 p-4 bg-[#111] border border-[#333] rounded-xl">
                  <p className="text-xs text-white/50 mb-3">선택한 모델</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={generatedImage}
                      alt="Selected Model"
                      className="w-24 h-24 object-cover rounded-lg border border-[#333]"
                    />
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white">
                        {finalModelName}
                        {finalModelNameKo && <span className="text-sm text-white/60 ml-2">({finalModelNameKo})</span>}
                      </p>
                      <p className="text-xs text-white/50">
                        {modelProfile.height} / {modelProfile.bloodType} / {modelProfile.mbti}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-full text-xs text-[#00F5A0]">
                      선택됨
                    </span>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#00F5A0]">
                  CONTRACT REQUEST
                </span>
                <h2 className="mt-2 text-2xl font-bold text-white">
                  {generatedImage ? '모델 계약 문의' : '제작 문의하기'}
                </h2>
                <p className="mt-2 text-white/60">담당자가 빠르게 연락드립니다</p>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {generatedImage ? '계약 문의가 접수되었습니다!' : '문의가 접수되었습니다!'}
                  </h3>
                  <p className="text-gray-400 mb-6">빠른 시일 내에 연락드리겠습니다.</p>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#00F5A0] to-[#00D9F5]"
                  >
                    확인
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-2 gap-4">
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
                      문의 내용 <span className="text-[#00F5A0]">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors resize-none"
                      placeholder={generatedImage ? "모델 활용 계획, 예산, 일정 등을 자유롭게 말씀해주세요." : "원하시는 모델 스타일, 용도, 일정 등을 자유롭게 말씀해주세요."}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] hover:shadow-[0_0_30px_rgba(0,245,160,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? '전송 중...' : (generatedImage ? '계약 문의 보내기' : '문의 보내기')}
                  </button>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 모달 열기를 위한 이벤트 트리거 함수
export function triggerOpenCustomModelModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('openCustomModelModal'));
  }
}
