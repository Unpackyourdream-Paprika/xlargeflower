'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAllPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  updatePricingPlanOrders,
  PricingPlan,
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  PromotionSettings
} from '@/lib/supabase';

export default function PricingManagement() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [promotions, setPromotions] = useState<PromotionSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [planFormData, setPlanFormData] = useState({
    title: '',
    subtitle: '',
    price: 0,
    price_suffix: '',
    features: [''],
    is_featured: false,
    badge_text: '',
    badge_color: '#00F5A0',
    button_text: '시작하기',
    button_action: 'link',
    button_link: '/products',
    chat_trigger: '',
    card_style: 'default',
    sort_order: 0,
    is_active: true
  });

  const [promoFormData, setPromoFormData] = useState({
    title: '',
    discount_rate: 50,
    start_date: '',
    end_date: '',
    is_active: true,
    badge_text: ''
  });

  const ADMIN_PASSWORD = 'xlarge2024';

  const CARD_STYLES = [
    { value: 'default', label: '기본' },
    { value: 'featured', label: '추천 (그린 테두리)' },
    { value: 'purple', label: '퍼플' },
    { value: 'gold', label: '골드 (VIP)' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [plansData, promosData] = await Promise.all([
        getAllPricingPlans(),
        getAllPromotions()
      ]);
      setPlans(plansData);
      setPromotions(promosData);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Plan functions
  const resetPlanForm = () => {
    setPlanFormData({
      title: '',
      subtitle: '',
      price: 0,
      price_suffix: '',
      features: [''],
      is_featured: false,
      badge_text: '',
      badge_color: '#00F5A0',
      button_text: '시작하기',
      button_action: 'link',
      button_link: '/products',
      chat_trigger: '',
      card_style: 'default',
      sort_order: plans.length,
      is_active: true
    });
  };

  const openCreatePlanModal = () => {
    resetPlanForm();
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      title: plan.title || '',
      subtitle: plan.subtitle || '',
      price: plan.price || 0,
      price_suffix: plan.price_suffix || '',
      features: plan.features?.length ? plan.features : [''],
      is_featured: plan.is_featured || false,
      badge_text: plan.badge_text || '',
      badge_color: plan.badge_color || '#00F5A0',
      button_text: plan.button_text || '시작하기',
      button_action: plan.button_action || 'link',
      button_link: plan.button_link || '/products',
      chat_trigger: plan.chat_trigger || '',
      card_style: plan.card_style || 'default',
      sort_order: plan.sort_order,
      is_active: plan.is_active
    });
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = async () => {
    if (!planFormData.title || planFormData.price <= 0) {
      setError('플랜명과 가격은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...planFormData,
        features: planFormData.features.filter(f => f.trim() !== '')
      };

      if (editingPlan) {
        await updatePricingPlan(editingPlan.id!, submitData);
        setSuccessMessage('플랜 수정 완료!');
      } else {
        await createPricingPlan(submitData);
        setSuccessMessage('플랜 등록 완료!');
      }
      setIsPlanModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Submit failed:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (plan: PricingPlan) => {
    if (!confirm(`"${plan.title}" 플랜을 삭제하시겠습니까?`)) return;

    try {
      await deletePricingPlan(plan.id!);
      setSuccessMessage('플랜 삭제 완료!');
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  const movePlan = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plans.length) return;

    const newPlans = [...plans];
    [newPlans[index], newPlans[newIndex]] = [newPlans[newIndex], newPlans[index]];
    setPlans(newPlans);

    try {
      await updatePricingPlanOrders(
        newPlans.map((p, i) => ({ id: p.id!, sort_order: i }))
      );
    } catch (err) {
      console.error('Reorder failed:', err);
      fetchData();
    }
  };

  // Feature management
  const addFeature = () => {
    setPlanFormData({ ...planFormData, features: [...planFormData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = planFormData.features.filter((_, i) => i !== index);
    setPlanFormData({ ...planFormData, features: newFeatures.length ? newFeatures : [''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...planFormData.features];
    newFeatures[index] = value;
    setPlanFormData({ ...planFormData, features: newFeatures });
  };

  // Promotion functions
  const resetPromoForm = () => {
    const now = new Date();
    const endDate = new Date('2026-02-15T23:59:59');
    setPromoFormData({
      title: '기간 한정 할인',
      discount_rate: 50,
      start_date: now.toISOString().slice(0, 16),
      end_date: endDate.toISOString().slice(0, 16),
      is_active: true,
      badge_text: '50% OFF'
    });
  };

  const openCreatePromoModal = () => {
    resetPromoForm();
    setEditingPromo(null);
    setIsPromoModalOpen(true);
  };

  const openEditPromoModal = (promo: PromotionSettings) => {
    setEditingPromo(promo);
    setPromoFormData({
      title: promo.title || '',
      discount_rate: promo.discount_rate || 50,
      start_date: promo.start_date ? new Date(promo.start_date).toISOString().slice(0, 16) : '',
      end_date: promo.end_date ? new Date(promo.end_date).toISOString().slice(0, 16) : '',
      is_active: promo.is_active,
      badge_text: promo.badge_text || ''
    });
    setIsPromoModalOpen(true);
  };

  const handlePromoSubmit = async () => {
    if (!promoFormData.title || !promoFormData.start_date || !promoFormData.end_date) {
      setError('프로모션명, 시작일, 종료일은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...promoFormData,
        start_date: new Date(promoFormData.start_date).toISOString(),
        end_date: new Date(promoFormData.end_date).toISOString()
      };

      if (editingPromo) {
        await updatePromotion(editingPromo.id!, submitData);
        setSuccessMessage('프로모션 수정 완료!');
      } else {
        await createPromotion(submitData);
        setSuccessMessage('프로모션 등록 완료!');
      }
      setIsPromoModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Submit failed:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async (promo: PromotionSettings) => {
    if (!confirm(`"${promo.title}" 프로모션을 삭제하시겠습니까?`)) return;

    try {
      await deletePromotion(promo.id!);
      setSuccessMessage('프로모션 삭제 완료!');
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  const handleTogglePromoActive = async (promo: PromotionSettings) => {
    try {
      await updatePromotion(promo.id!, { is_active: !promo.is_active });
      fetchData();
    } catch (err) {
      console.error('Toggle failed:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const getPromoStatus = (promo: PromotionSettings) => {
    const now = new Date();
    const start = new Date(promo.start_date);
    const end = new Date(promo.end_date);

    if (!promo.is_active) return { label: '비활성', color: 'text-gray-400 bg-gray-500/20' };
    if (now < start) return { label: '예정', color: 'text-blue-400 bg-blue-500/20' };
    if (now > end) return { label: '종료', color: 'text-red-400 bg-red-500/20' };
    return { label: '진행중', color: 'text-[#00F5A0] bg-[#00F5A0]/20' };
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">XL</span>
              </div>
              <h1 className="text-xl font-bold text-white">XLARGE FLOWER</h1>
            </div>
            <p className="text-gray-500">관리자 로그인</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white"
                placeholder="관리자 비밀번호 입력"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl">
              로그인
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
          로딩 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">XL</span>
              </div>
              <h1 className="text-lg font-bold text-white">XLARGE FLOWER</h1>
              <span className="px-2 py-0.5 bg-[#111] border border-[#333] rounded text-xs text-gray-400">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">사이트 보기</Link>
              <button
                onClick={() => { localStorage.removeItem('adminAuth'); setIsAuthenticated(false); }}
                className="text-gray-500 hover:text-red-400 text-sm transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#0A0A0A] border-b border-[#222] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 min-w-max items-center">
            <Link href="/admin" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              대시보드
            </Link>
            <Link href="/admin/orders" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              주문 관리
            </Link>
            <Link href="/admin/pricing" className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap">
              가격 관리
            </Link>
            <Link href="/admin/hero" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              히어로
            </Link>
            <Link href="/admin/showcase" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              쇼케이스
            </Link>
            <Link href="/admin/landing-portfolio" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              랜딩 포트폴리오
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">닫기</button>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-xl text-[#00F5A0] text-sm">
            {successMessage}
          </div>
        )}

        {/* ============================================ */}
        {/* 상단: 상품 목록 관리 */}
        {/* ============================================ */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">상품 목록 관리</h2>
              <p className="text-gray-500 mt-1">요금제 플랜을 추가/수정/삭제할 수 있습니다.</p>
            </div>
            <button
              onClick={openCreatePlanModal}
              className="px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
            >
              + 새 상품 추가
            </button>
          </div>

          {plans.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
              <p className="text-gray-500 mb-2">등록된 플랜이 없습니다.</p>
              <p className="text-gray-600 text-sm">&quot;새 상품 추가&quot; 버튼을 클릭하여 추가하세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`bg-[#0A0A0A] border rounded-xl overflow-hidden ${
                    plan.is_active ? (plan.is_featured ? 'border-[#00F5A0]/50' : 'border-[#222]') : 'border-red-500/30 opacity-60'
                  }`}
                >
                  <div className="p-4 flex flex-col lg:flex-row gap-4">
                    {/* Order & Badge */}
                    <div className="flex items-center gap-3 lg:w-32 flex-shrink-0">
                      <span className="px-2 py-1 bg-black/50 rounded text-xs text-white font-mono">#{index + 1}</span>
                      {plan.is_featured && (
                        <span className="px-2 py-1 bg-[#00F5A0]/20 text-[#00F5A0] text-xs font-bold rounded">
                          {plan.badge_text || 'FEATURED'}
                        </span>
                      )}
                      {!plan.is_active && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">비활성</span>
                      )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-lg">{plan.title}</h3>
                      <p className="text-gray-500 text-sm">{plan.subtitle}</p>
                      <div className="mt-2">
                        <span className="text-[#00F5A0] font-bold text-xl">₩{formatPrice(plan.price)}</span>
                        <span className="text-gray-400 text-sm">{plan.price_suffix}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.features?.slice(0, 3).map((f, i) => (
                          <span key={i} className="px-2 py-0.5 bg-[#111] text-gray-400 text-xs rounded">
                            {f.length > 20 ? f.slice(0, 20) + '...' : f}
                          </span>
                        ))}
                        {(plan.features?.length || 0) > 3 && (
                          <span className="px-2 py-0.5 bg-[#111] text-gray-500 text-xs rounded">
                            +{(plan.features?.length || 0) - 3}개
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                      <button onClick={() => movePlan(index, 'up')} disabled={index === 0}
                        className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button onClick={() => movePlan(index, 'down')} disabled={index === plans.length - 1}
                        className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50 disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button onClick={() => openEditPlanModal(plan)}
                        className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeletePlan(plan)}
                        className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================ */}
        {/* 하단: 프로모션/할인 설정 */}
        {/* ============================================ */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">프로모션/할인 설정</h2>
              <p className="text-gray-500 mt-1">기간 한정 할인 이벤트를 설정합니다. 활성화 시 전 상품에 자동 적용됩니다.</p>
            </div>
            <button
              onClick={openCreatePromoModal}
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-medium rounded-lg hover:bg-yellow-500/30 transition-all"
            >
              + 새 프로모션
            </button>
          </div>

          {promotions.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-8 text-center">
              <p className="text-gray-500 mb-2">등록된 프로모션이 없습니다.</p>
              <p className="text-gray-600 text-sm">할인 이벤트가 필요할 때 추가하세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotions.map((promo) => {
                const status = getPromoStatus(promo);
                return (
                  <div
                    key={promo.id}
                    className={`bg-[#0A0A0A] border rounded-xl p-4 ${
                      status.label === '진행중' ? 'border-yellow-500/50' : 'border-[#222]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold">{promo.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="text-yellow-400 font-bold text-xl">{promo.discount_rate}% OFF</span>
                          {promo.badge_text && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                              {promo.badge_text}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-400">
                          {formatDate(promo.start_date)} ~ {formatDate(promo.end_date)}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => openEditPromoModal(promo)}
                          className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-yellow-500/50">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleTogglePromoActive(promo)}
                          className={`p-2 rounded-lg border ${promo.is_active ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-[#111] border-[#333]'}`}>
                          {promo.is_active ? (
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <button onClick={() => handleDeletePromo(promo)}
                          className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20">
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingPlan ? '플랜 수정' : '새 플랜 추가'}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">플랜명 *</label>
                  <input
                    type="text"
                    value={planFormData.title}
                    onChange={(e) => setPlanFormData({ ...planFormData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    placeholder="예: Starter"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">카드 스타일</label>
                  <select
                    value={planFormData.card_style}
                    onChange={(e) => setPlanFormData({ ...planFormData, card_style: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  >
                    {CARD_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">부제목</label>
                <input
                  type="text"
                  value={planFormData.subtitle}
                  onChange={(e) => setPlanFormData({ ...planFormData, subtitle: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  placeholder="예: 테스트 도입을 위한 베이직 플랜"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">가격 (원) *</label>
                  <input
                    type="number"
                    value={planFormData.price}
                    onChange={(e) => setPlanFormData({ ...planFormData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    placeholder="3300000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">가격 접미사</label>
                  <input
                    type="text"
                    value={planFormData.price_suffix}
                    onChange={(e) => setPlanFormData({ ...planFormData, price_suffix: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    placeholder="예: ~ 또는 /월"
                  />
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">기능 목록</label>
                <div className="space-y-2">
                  {planFormData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                        placeholder={`기능 ${index + 1}`}
                      />
                      <button onClick={() => removeFeature(index)}
                        className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20">
                        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button onClick={addFeature}
                    className="w-full py-2 border border-dashed border-[#333] rounded-lg text-gray-400 hover:border-[#00F5A0] hover:text-[#00F5A0] text-sm">
                    + 기능 추가
                  </button>
                </div>
              </div>

              {/* Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPlanFormData({ ...planFormData, is_featured: !planFormData.is_featured })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${planFormData.is_featured ? 'bg-[#00F5A0]' : 'bg-[#333]'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${planFormData.is_featured ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                  <span className="text-sm text-gray-400">추천 뱃지 표시</span>
                </div>
                {planFormData.is_featured && (
                  <div>
                    <input
                      type="text"
                      value={planFormData.badge_text}
                      onChange={(e) => setPlanFormData({ ...planFormData, badge_text: e.target.value })}
                      className="w-full px-4 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                      placeholder="뱃지 텍스트 (예: BEST CHOICE)"
                    />
                  </div>
                )}
              </div>

              {/* Button */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">버튼 텍스트</label>
                  <input
                    type="text"
                    value={planFormData.button_text}
                    onChange={(e) => setPlanFormData({ ...planFormData, button_text: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    placeholder="시작하기"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">버튼 링크</label>
                  <input
                    type="text"
                    value={planFormData.button_link}
                    onChange={(e) => setPlanFormData({ ...planFormData, button_link: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    placeholder="/products"
                  />
                </div>
              </div>

              {/* Active */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPlanFormData({ ...planFormData, is_active: !planFormData.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${planFormData.is_active ? 'bg-[#00F5A0]' : 'bg-[#333]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${planFormData.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-400">{planFormData.is_active ? '활성화' : '비활성화'}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsPlanModalOpen(false)}
                className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium">
                취소
              </button>
              <button onClick={handlePlanSubmit} disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl disabled:opacity-50">
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingPromo ? '프로모션 수정' : '새 프로모션'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">프로모션명 *</label>
                <input
                  type="text"
                  value={promoFormData.title}
                  onChange={(e) => setPromoFormData({ ...promoFormData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                  placeholder="예: 2월 반값 할인"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">할인율 (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={promoFormData.discount_rate}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discount_rate: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">뱃지 텍스트</label>
                  <input
                    type="text"
                    value={promoFormData.badge_text}
                    onChange={(e) => setPromoFormData({ ...promoFormData, badge_text: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                    placeholder="예: 2.15까지 50%"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">시작일 *</label>
                  <input
                    type="datetime-local"
                    value={promoFormData.start_date}
                    onChange={(e) => setPromoFormData({ ...promoFormData, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">종료일 *</label>
                  <input
                    type="datetime-local"
                    value={promoFormData.end_date}
                    onChange={(e) => setPromoFormData({ ...promoFormData, end_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-yellow-500 focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPromoFormData({ ...promoFormData, is_active: !promoFormData.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${promoFormData.is_active ? 'bg-yellow-500' : 'bg-[#333]'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${promoFormData.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-400">{promoFormData.is_active ? '활성화' : '비활성화'}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsPromoModalOpen(false)}
                className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium">
                취소
              </button>
              <button onClick={handlePromoSubmit} disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-xl disabled:opacity-50">
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
