'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtistModel, getArtistModels, PricingPlan, PromotionSettings, getCustomModelSettings, CustomModelSettings } from '@/lib/supabase';

interface OrderBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pricingPlans: PricingPlan[];
  initialArtist?: string;
  initialPlan?: string;
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

// 매체비 옵션 (금액 포함)
const MEDIA_BUDGET_OPTIONS = [
  { label: '10만원', value: 100000 },
  { label: '50만원', value: 500000 },
  { label: '100만원', value: 1000000 },
  { label: '300만원', value: 3000000 },
  { label: '500만원', value: 5000000 },
  { label: '1000만원', value: 10000000 },
  { label: '미정 / 협의 필요', value: 0 },
];

// 지역 자동완성 데이터 (도달률 포함)
interface RegionData {
  name: string;
  reach: string; // 예상 도달률
  population?: string; // 인구/사용자 수
}

const REGION_DATA: RegionData[] = [
  // 글로벌/전체
  { name: '전세계 (Worldwide)', reach: '4.9B+', population: '49억 사용자' },
  { name: '글로벌 (국내+해외)', reach: '4.9B+', population: '49억 사용자' },

  // 대한민국 - 전체/권역
  { name: '대한민국 전체', reach: '46M', population: '4,600만' },
  { name: '수도권', reach: '26M', population: '2,600만' },
  { name: '비수도권', reach: '20M', population: '2,000만' },

  // 대한민국 - 시/도
  { name: '서울', reach: '9.7M', population: '970만' },
  { name: '경기', reach: '13.5M', population: '1,350만' },
  { name: '인천', reach: '2.9M', population: '290만' },
  { name: '부산', reach: '3.4M', population: '340만' },
  { name: '대구', reach: '2.4M', population: '240만' },
  { name: '대전', reach: '1.5M', population: '150만' },
  { name: '광주', reach: '1.4M', population: '140만' },
  { name: '울산', reach: '1.1M', population: '110만' },
  { name: '세종', reach: '380K', population: '38만' },
  { name: '강원', reach: '1.5M', population: '150만' },
  { name: '충북', reach: '1.6M', population: '160만' },
  { name: '충남', reach: '2.1M', population: '210만' },
  { name: '전북', reach: '1.8M', population: '180만' },
  { name: '전남', reach: '1.8M', population: '180만' },
  { name: '경북', reach: '2.6M', population: '260만' },
  { name: '경남', reach: '3.3M', population: '330만' },
  { name: '제주', reach: '670K', population: '67만' },

  // 일본 - 전체/권역
  { name: '일본 전체', reach: '101M', population: '1억 100만' },
  { name: '도쿄', reach: '14M', population: '1,400만' },
  { name: '오사카', reach: '8.8M', population: '880만' },
  { name: '나고야', reach: '2.3M', population: '230만' },
  { name: '후쿠오카', reach: '1.6M', population: '160만' },
  { name: '삿포로', reach: '2M', population: '200만' },
  { name: '요코하마', reach: '3.7M', population: '370만' },
  { name: '교토', reach: '1.5M', population: '150만' },
  { name: '고베', reach: '1.5M', population: '150만' },

  // 중국 - 전체/주요도시
  { name: '중국 전체', reach: '1B+', population: '10억+' },
  { name: '베이징', reach: '21M', population: '2,100만' },
  { name: '상하이', reach: '24M', population: '2,400만' },
  { name: '광저우', reach: '18M', population: '1,800만' },
  { name: '선전', reach: '17M', population: '1,700만' },
  { name: '청두', reach: '21M', population: '2,100만' },
  { name: '항저우', reach: '12M', population: '1,200만' },

  // 대만
  { name: '대만 전체', reach: '21M', population: '2,100만' },
  { name: '타이베이', reach: '2.6M', population: '260만' },
  { name: '가오슝', reach: '2.7M', population: '270만' },

  // 홍콩/마카오
  { name: '홍콩', reach: '6.4M', population: '640만' },
  { name: '마카오', reach: '680K', population: '68만' },

  // 동남아시아
  { name: '동남아시아 전체', reach: '400M+', population: '4억+' },
  { name: '싱가포르', reach: '5.3M', population: '530만' },
  { name: '태국 전체', reach: '57M', population: '5,700만' },
  { name: '방콕', reach: '10M', population: '1,000만' },
  { name: '베트남 전체', reach: '72M', population: '7,200만' },
  { name: '호치민', reach: '9M', population: '900만' },
  { name: '하노이', reach: '8M', population: '800만' },
  { name: '인도네시아 전체', reach: '170M', population: '1억 7,000만' },
  { name: '자카르타', reach: '10M', population: '1,000만' },
  { name: '말레이시아 전체', reach: '28M', population: '2,800만' },
  { name: '쿠알라룸푸르', reach: '7.8M', population: '780만' },
  { name: '필리핀 전체', reach: '84M', population: '8,400만' },
  { name: '마닐라', reach: '13M', population: '1,300만' },

  // 인도
  { name: '인도 전체', reach: '467M', population: '4억 6,700만' },
  { name: '뭄바이', reach: '20M', population: '2,000만' },
  { name: '델리', reach: '32M', population: '3,200만' },
  { name: '벵갈루루', reach: '12M', population: '1,200만' },

  // 미국 - 전체/권역
  { name: '미국 전체', reach: '270M', population: '2억 7,000만' },
  { name: '뉴욕', reach: '8.3M', population: '830만' },
  { name: '로스앤젤레스', reach: '3.9M', population: '390만' },
  { name: '시카고', reach: '2.7M', population: '270만' },
  { name: '휴스턴', reach: '2.3M', population: '230만' },
  { name: '마이애미', reach: '450K', population: '45만' },
  { name: '샌프란시스코', reach: '870K', population: '87만' },
  { name: '시애틀', reach: '750K', population: '75만' },
  { name: '라스베이거스', reach: '650K', population: '65만' },
  { name: '캘리포니아', reach: '39M', population: '3,900만' },
  { name: '텍사스', reach: '29M', population: '2,900만' },
  { name: '플로리다', reach: '22M', population: '2,200만' },

  // 캐나다
  { name: '캐나다 전체', reach: '33M', population: '3,300만' },
  { name: '토론토', reach: '2.9M', population: '290만' },
  { name: '밴쿠버', reach: '2.5M', population: '250만' },
  { name: '몬트리올', reach: '1.8M', population: '180만' },

  // 유럽 - 전체
  { name: '유럽 전체', reach: '450M', population: '4억 5,000만' },

  // 영국
  { name: '영국 전체', reach: '57M', population: '5,700만' },
  { name: '런던', reach: '8.9M', population: '890만' },
  { name: '맨체스터', reach: '2.8M', population: '280만' },
  { name: '버밍엄', reach: '1.1M', population: '110만' },

  // 프랑스
  { name: '프랑스 전체', reach: '53M', population: '5,300만' },
  { name: '파리', reach: '2.1M', population: '210만' },

  // 독일
  { name: '독일 전체', reach: '66M', population: '6,600만' },
  { name: '베를린', reach: '3.6M', population: '360만' },
  { name: '뮌헨', reach: '1.5M', population: '150만' },
  { name: '프랑크푸르트', reach: '750K', population: '75만' },

  // 이탈리아
  { name: '이탈리아 전체', reach: '43M', population: '4,300만' },
  { name: '로마', reach: '2.8M', population: '280만' },
  { name: '밀라노', reach: '1.4M', population: '140만' },

  // 스페인
  { name: '스페인 전체', reach: '40M', population: '4,000만' },
  { name: '마드리드', reach: '3.3M', population: '330만' },
  { name: '바르셀로나', reach: '1.6M', population: '160만' },

  // 네덜란드
  { name: '네덜란드 전체', reach: '14M', population: '1,400만' },
  { name: '암스테르담', reach: '870K', population: '87만' },

  // 기타 유럽
  { name: '스위스', reach: '7.6M', population: '760만' },
  { name: '오스트리아', reach: '7.5M', population: '750만' },
  { name: '벨기에', reach: '9.8M', population: '980만' },
  { name: '스웨덴', reach: '9M', population: '900만' },
  { name: '노르웨이', reach: '4.8M', population: '480만' },
  { name: '덴마크', reach: '5M', population: '500만' },
  { name: '핀란드', reach: '4.6M', population: '460만' },
  { name: '폴란드', reach: '27M', population: '2,700만' },
  { name: '체코', reach: '8.9M', population: '890만' },
  { name: '포르투갈', reach: '8.2M', population: '820만' },
  { name: '그리스', reach: '8M', population: '800만' },
  { name: '아일랜드', reach: '4.2M', population: '420만' },

  // 오세아니아
  { name: '호주 전체', reach: '23M', population: '2,300만' },
  { name: '시드니', reach: '5.3M', population: '530만' },
  { name: '멜버른', reach: '5M', population: '500만' },
  { name: '브리즈번', reach: '2.5M', population: '250만' },
  { name: '뉴질랜드 전체', reach: '4.3M', population: '430만' },
  { name: '오클랜드', reach: '1.7M', population: '170만' },

  // 중남미
  { name: '중남미 전체', reach: '450M', population: '4억 5,000만' },
  { name: '브라질 전체', reach: '150M', population: '1억 5,000만' },
  { name: '상파울루', reach: '12M', population: '1,200만' },
  { name: '리우데자네이루', reach: '6.7M', population: '670만' },
  { name: '멕시코 전체', reach: '98M', population: '9,800만' },
  { name: '멕시코시티', reach: '9M', population: '900만' },
  { name: '아르헨티나 전체', reach: '36M', population: '3,600만' },
  { name: '부에노스아이레스', reach: '3M', population: '300만' },
  { name: '콜롬비아', reach: '38M', population: '3,800만' },
  { name: '칠레', reach: '16M', population: '1,600만' },
  { name: '페루', reach: '24M', population: '2,400만' },

  // 중동
  { name: '중동 전체', reach: '200M', population: '2억' },
  { name: 'UAE', reach: '9.5M', population: '950만' },
  { name: '두바이', reach: '3.5M', population: '350만' },
  { name: '사우디아라비아', reach: '29M', population: '2,900만' },
  { name: '이스라엘', reach: '7.3M', population: '730만' },
  { name: '터키 전체', reach: '62M', population: '6,200만' },
  { name: '이스탄불', reach: '15M', population: '1,500만' },
  { name: '카타르', reach: '2.6M', population: '260만' },
  { name: '쿠웨이트', reach: '4M', population: '400만' },

  // 아프리카
  { name: '아프리카 전체', reach: '570M', population: '5억 7,000만' },
  { name: '남아프리카공화국', reach: '28M', population: '2,800만' },
  { name: '이집트', reach: '51M', population: '5,100만' },
  { name: '나이지리아', reach: '33M', population: '3,300만' },
  { name: '케냐', reach: '12M', population: '1,200만' },

  // 러시아/CIS
  { name: '러시아 전체', reach: '99M', population: '9,900만' },
  { name: '모스크바', reach: '12M', population: '1,200만' },
  { name: '상트페테르부르크', reach: '5.4M', population: '540만' },
];

// reach 문자열을 숫자로 변환 (예: '4.9B+' -> 4900000000, '46M' -> 46000000)
const parseReachToNumber = (reach: string): number => {
  const cleanedReach = reach.replace(/[+,]/g, '').trim();
  const match = cleanedReach.match(/^([\d.]+)([KMB])?$/i);
  if (!match) return 0;

  const num = parseFloat(match[1]);
  const suffix = (match[2] || '').toUpperCase();

  switch (suffix) {
    case 'K': return num * 1000;
    case 'M': return num * 1000000;
    case 'B': return num * 1000000000;
    default: return num;
  }
};

// 숫자를 포맷팅 (예: 4900000000 -> '49억', 46000000 -> '4,600만')
const formatReachNumber = (num: number): string => {
  if (num >= 100000000) {
    // 1억 이상
    const billions = num / 100000000;
    return `${billions.toFixed(billions % 1 === 0 ? 0 : 1)}억`;
  } else if (num >= 10000) {
    // 1만 이상
    const tenThousands = num / 10000;
    return `${Math.round(tenThousands).toLocaleString()}만`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}천`;
  }
  return num.toLocaleString();
};

// 매체비에 따른 예상 도달 수 계산 (CPM 기반)
// 평균 CPM: 약 5,000원~15,000원 (국가/플랫폼별 상이)
// 보수적으로 CPM 10,000원 기준으로 계산
const calculateEstimatedReach = (mediaBudget: number, totalPotentialReach: number): { min: number; max: number } => {
  if (mediaBudget === 0) return { min: 0, max: 0 };

  // CPM (Cost Per Mille) 기준: 1000회 노출당 비용
  // 한국: 약 3,000~8,000원, 글로벌: 약 5,000~15,000원
  const cpmMin = 3000; // 최저 CPM (최대 도달)
  const cpmMax = 15000; // 최고 CPM (최소 도달)

  // 예상 노출 수 계산
  const maxReach = Math.floor((mediaBudget / cpmMin) * 1000);
  const minReach = Math.floor((mediaBudget / cpmMax) * 1000);

  // 잠재 도달 가능 인원을 초과하지 않도록 제한
  return {
    min: Math.min(minReach, totalPotentialReach),
    max: Math.min(maxReach, totalPotentialReach)
  };
};

export default function OrderBottomSheet({ isOpen, onClose, pricingPlans, initialArtist, initialPlan, promotion }: OrderBottomSheetProps) {
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
    mediaBudget: 0,
    targetAudience: '',
    targetRegions: [] as string[],
    landingUrl: ''
  });

  // 지역 자동완성
  const [regionInput, setRegionInput] = useState('');
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  const [filteredRegions, setFilteredRegions] = useState<RegionData[]>([]);

  // Step 3: 정보 입력 데이터
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });

  // 파일 업로드
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: 결제 관련
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30분 = 1800초
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  // 지역 검색 필터링 - 실제로 검색어를 입력했을 때만 자동완성 표시
  useEffect(() => {
    const trimmedInput = regionInput.trim();
    if (trimmedInput && trimmedInput !== ' ') {
      // 실제 검색어가 있을 때만 필터링
      const filtered = REGION_DATA.filter(r =>
        r.name.toLowerCase().includes(trimmedInput.toLowerCase()) &&
        !mediaData.targetRegions.includes(r.name)
      );
      setFilteredRegions(filtered);
      setShowRegionSuggestions(filtered.length > 0);
    } else {
      setFilteredRegions([]);
      setShowRegionSuggestions(false);
    }
  }, [regionInput, mediaData.targetRegions]);

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

  // 초기 플랜 설정 - 플랜이 지정되면 자동 선택
  useEffect(() => {
    if (initialPlan && pricingPlans.length > 0) {
      const plan = pricingPlans.find(p => p.title === initialPlan);
      if (plan && plan.id) {
        setSelectedPlanId(plan.id);
      }
    }
  }, [initialPlan, pricingPlans]);

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

  // 공급가액 계산 (팩 가격 + 모델 가격 + 매체비) - VAT 별도
  // 할인은 상품(팩) 가격에만 적용, 모델/매체비는 할인 제외
  const calculateSubtotal = () => {
    const planInfo = getSelectedPlanInfo();
    const modelInfo = getSelectedModelInfo();

    // 상품 가격 (할인 적용 대상)
    let planPrice = planInfo?.price || 0;
    if (promotion && promotion.discount_rate > 0) {
      planPrice = Math.round(planPrice * (1 - promotion.discount_rate / 100));
    }

    let total = planPrice;

    // 모델 추가 비용 (할인 미적용)
    if (modelOption === 'select' && modelInfo?.price) {
      total += modelInfo.price;
    }
    // 커스텀 모델은 별도 가격 (할인 미적용)
    if (modelOption === 'custom') {
      total += customModelSettings.price;
    }

    // 매체비 추가 (할인 미적용)
    total += mediaData.mediaBudget;

    return total;
  };

  // VAT 계산 (10%)
  const calculateVAT = () => {
    return Math.round(calculateSubtotal() * 0.1);
  };

  // 총 금액 계산 (공급가액 + VAT 10%)
  const calculateTotalPrice = () => {
    return calculateSubtotal() + calculateVAT();
  };

  // 선택 항목 요약 생성
  const getSelectionSummary = () => {
    const items: string[] = [];
    const planInfo = getSelectedPlanInfo();
    const modelInfo = getSelectedModelInfo();

    if (planInfo) {
      items.push(planInfo.title);
    }
    if (modelOption !== 'none' && modelInfo?.name) {
      items.push(modelInfo.name);
    }
    if (mediaData.mediaBudget > 0) {
      items.push(`매체비 ${formatPrice(mediaData.mediaBudget)}원`);
    }

    return items.join(' + ');
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
        '매체비': mediaData.mediaBudget > 0 ? `₩${formatPrice(mediaData.mediaBudget)}` : '미정',
        '타겟층': mediaData.targetAudience || '미정',
        '타겟 지역': mediaData.targetRegions.join(', ') || '미정',
        '랜딩 URL': mediaData.landingUrl || '미입력'
      }
    });
    setStep(3);
  };

  // 생성된 주문 ID 저장
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Step 3: 정보 입력 완료 -> 결제 단계로
  const handleStep3Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const planInfo = getSelectedPlanInfo();
      const modelInfo = getSelectedModelInfo();

      // 주문 생성 (xlarge_flower_orders 테이블에 저장)
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
          mediaBudget: mediaData.mediaBudget > 0 ? `₩${formatPrice(mediaData.mediaBudget)}` : '미정',
          target_audience: mediaData.targetAudience,
          targetRegion: mediaData.targetRegions.join(', '),
          landingUrl: mediaData.landingUrl || null,
          estimated_price: calculateTotalPrice(),
          message: formData.message || null,
          hasAttachments: uploadedFiles.length > 0,
          attachmentCount: uploadedFiles.length
        },
        selected_pack: planInfo?.title || 'READY',
        final_price: calculateTotalPrice()
      };

      const createResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json().catch(() => ({}));
        console.error('Order creation failed:', {
          status: createResponse.status,
          statusText: createResponse.statusText,
          error: errorData
        });
        // 에러가 있어도 결제 단계로 진행 (주문 ID 없이)
        setCreatedOrderId(null);
      } else {
        const { orderId } = await createResponse.json();
        setCreatedOrderId(orderId);
      }

      // Step 3 완료 트래킹
      sendDiscordWebhook({
        step: 3,
        action: '정보 입력 완료 - 결제 단계 진입',
        details: {
          '이름': formData.name,
          '회사명': formData.company || '개인',
          '이메일': formData.email,
          '연락처': formData.phone || '미입력',
          '첨부파일': uploadedFiles.length > 0 ? `${uploadedFiles.length}개` : '없음',
          '총 금액': `₩${formatPrice(calculateTotalPrice())}`
        }
      });

      setStep(4);
    } catch (error) {
      console.error('Submit error:', error);
      // 에러가 있어도 결제 단계로 진행
      setStep(4);
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

    // 주문 확인 이메일 발송 (이미 Step 3에서 주문 생성됨)
    if (createdOrderId) {
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrderId,
            type: 'order_confirmation'
          })
        });
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
      }
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
            targetRegion: mediaData.targetRegions.join(', '),
            landingUrl: mediaData.landingUrl,
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

  // 지역 선택 (태그로 추가)
  const handleRegionSelect = (region: string) => {
    if (!mediaData.targetRegions.includes(region)) {
      setMediaData(prev => ({ ...prev, targetRegions: [...prev.targetRegions, region] }));
    }
    setRegionInput('');
    setShowRegionSuggestions(false);
  };

  // 지역 태그 삭제
  const handleRegionRemove = (region: string) => {
    setMediaData(prev => ({
      ...prev,
      targetRegions: prev.targetRegions.filter(r => r !== region)
    }));
  };

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // 파일 삭제
  const handleFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
    setMediaData({ platforms: [], mediaBudget: 0, targetAudience: '', targetRegions: [], landingUrl: '' });
    setRegionInput('');
    setFormData({ name: '', company: '', email: '', phone: '', message: '' });
    setUploadedFiles([]);
    setPaymentMethod(null);
    setIsTimerActive(false);
    setTimeLeft(30 * 60);
    setCreatedOrderId(null);
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
                <span className={step >= 1 ? 'text-[#00F5A0]' : ''}>모델 및 상품</span>
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
              <div>
                <h2 className="text-xl font-bold text-white">
                  {step === 1 && '모델 및 상품 선택'}
                  {step === 2 && '매체 선택'}
                  {step === 3 && '정보 입력'}
                  {step === 4 && !isSubmitted && '결제 방법'}
                  {step === 4 && isSubmitted && '주문 완료'}
                </h2>
                {!isSubmitted && (
                  <div className="mt-1">
                    <p className="text-sm text-[#00F5A0] font-medium">
                      ₩{formatPrice(calculateTotalPrice())} <span className="text-xs text-gray-500">(VAT 포함)</span>
                    </p>
                    {getSelectionSummary() && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        ({getSelectionSummary()})
                      </p>
                    )}
                  </div>
                )}
              </div>
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
                      상품 선택 <span className="text-[#00F5A0] text-xs">(필수)</span>
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
                      AI 모델 선택 <span className="text-gray-500 text-xs">(선택)</span>
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
                      {['TikTok', 'YouTube', 'Instagram', 'Facebook', '기타'].map((platform) => (
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
                    <div className="grid grid-cols-4 gap-2">
                      {MEDIA_BUDGET_OPTIONS.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setMediaData({ ...mediaData, mediaBudget: option.value })}
                          className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                            mediaData.mediaBudget === option.value
                              ? 'bg-[#00F5A0]/20 border-[#00F5A0] text-[#00F5A0]'
                              : 'bg-[#111] border-[#333] text-white hover:border-[#00F5A0]/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
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

                  {/* 타겟 지역 - 자동완성 + 태그 */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      타겟 지역
                    </label>
                    {/* 선택된 지역 태그들 */}
                    {mediaData.targetRegions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mediaData.targetRegions.map((regionName) => {
                          const regionData = REGION_DATA.find(r => r.name === regionName);
                          return (
                            <span
                              key={regionName}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00F5A0]/20 border border-[#00F5A0] text-[#00F5A0] text-sm rounded-full"
                            >
                              <span>{regionName}</span>
                              {regionData && (
                                <span className="text-xs opacity-70">{regionData.reach}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRegionRemove(regionName)}
                                className="hover:text-white transition-colors ml-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <input
                      type="text"
                      value={regionInput}
                      onChange={(e) => setRegionInput(e.target.value)}
                      onFocus={() => {
                        // 포커스 시에는 자동으로 목록을 열지 않음 - 검색어 입력 시에만 표시
                      }}
                      onBlur={() => {
                        // 약간의 딜레이 후 닫기 (클릭 이벤트 처리 위해)
                        setTimeout(() => setShowRegionSuggestions(false), 200);
                      }}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                      placeholder="지역명 검색 (예: 서울, 도쿄, 뉴욕)"
                    />
                    {showRegionSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-[#111] border border-[#333] rounded-xl overflow-hidden shadow-lg max-h-64 overflow-y-auto">
                        {filteredRegions.map((region) => (
                          <button
                            key={region.name}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleRegionSelect(region.name)}
                            className="w-full px-4 py-3 text-left hover:bg-[#222] transition-colors flex items-center justify-between"
                          >
                            <span className="text-white">{region.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[#00F5A0] text-sm font-medium">{region.reach}</span>
                              {region.population && (
                                <span className="text-gray-500 text-xs">({region.population})</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 예상 도달 수 표시 - 지역 선택 후 표시 */}
                  {mediaData.targetRegions.length > 0 && (
                    (() => {
                      // 선택된 지역들의 총 잠재 도달 수 계산
                      const totalPotentialReach = mediaData.targetRegions.reduce((sum, regionName) => {
                        const regionData = REGION_DATA.find(r => r.name === regionName);
                        if (regionData) {
                          return sum + parseReachToNumber(regionData.reach);
                        }
                        return sum;
                      }, 0);

                      const estimatedReach = calculateEstimatedReach(mediaData.mediaBudget, totalPotentialReach);

                      return (
                        <div className="p-4 bg-gradient-to-r from-[#00F5A0]/5 to-[#00D9F5]/5 border border-[#00F5A0]/30 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm">선택 지역 총 사용자</span>
                            <span className="text-white font-bold text-lg">{formatReachNumber(totalPotentialReach)}명</span>
                          </div>
                          {mediaData.mediaBudget > 0 ? (
                            <div className="pt-3 border-t border-[#333]">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-gray-400 text-sm block">예상 도달 수</span>
                                  <span className="text-gray-500 text-xs">₩{formatPrice(mediaData.mediaBudget)} 기준</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[#00F5A0] font-bold text-xl">
                                    {formatReachNumber(estimatedReach.min)} ~ {formatReachNumber(estimatedReach.max)}명
                                  </span>
                                  <span className="text-gray-500 text-xs block">
                                    CPM 3,000~15,000원 기준
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-3 border-t border-[#333]">
                              <span className="text-gray-500 text-sm">위에서 매체비를 선택하면 예상 도달 수가 계산됩니다</span>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}

                  {/* 랜딩 URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      랜딩 URL <span className="text-gray-600">(선택)</span>
                    </label>
                    <input
                      type="url"
                      value={mediaData.landingUrl}
                      onChange={(e) => setMediaData({ ...mediaData, landingUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
                      placeholder="https://example.com"
                    />
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

                    {/* 파일 업로드 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        제품 이미지/설명 파일 <span className="text-gray-600">(선택)</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-3 bg-[#111] border border-dashed border-[#333] rounded-xl text-gray-400 hover:border-[#00F5A0]/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        파일 첨부하기
                      </button>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between px-3 py-2 bg-[#111] border border-[#333] rounded-lg">
                              <span className="text-sm text-white truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => handleFileRemove(index)}
                                className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-1">이미지, PDF, Word, PPT 파일 지원</p>
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
                        <span className="text-gray-500">상품</span>
                        <span className="text-white">{getSelectedPlanInfo()?.title || '없음'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">모델</span>
                        <span className="text-white">{getSelectedModelInfo()?.name || '없음'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">매체비</span>
                        <span className="text-white">{mediaData.mediaBudget > 0 ? `₩${formatPrice(mediaData.mediaBudget)}` : '미정'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">플랫폼</span>
                        <span className="text-white">{mediaData.platforms.join(', ') || '미정'}</span>
                      </div>
                      <div className="border-t border-[#333] my-3" />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">공급가액</span>
                        <span className="text-white">₩{formatPrice(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">부가세 (10%)</span>
                        <span className="text-white">₩{formatPrice(calculateVAT())}</span>
                      </div>
                      <div className="border-t border-[#333] my-3" />
                      <div className="flex justify-between">
                        <span className="text-gray-400 font-medium">총 결제금액</span>
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
                    <p className="text-gray-400 text-sm mb-2">결제 금액 (VAT 포함)</p>
                    <p className="text-3xl font-bold text-white">₩{formatPrice(calculateTotalPrice())}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      공급가액 ₩{formatPrice(calculateSubtotal())} + VAT ₩{formatPrice(calculateVAT())}
                    </p>
                    {getSelectionSummary() && (
                      <p className="text-sm text-gray-500 mt-1">({getSelectionSummary()})</p>
                    )}
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
                        <span className="text-gray-500">입금액 (VAT 포함)</span>
                        <span className="text-white font-bold">₩{formatPrice(calculateTotalPrice())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">입금자명</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm mb-6">
                    입금 확인 요청이 완료되었습니다.<br />
                    영업 시간 기준 1시간 이내에 담당자가 연락드립니다.
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
