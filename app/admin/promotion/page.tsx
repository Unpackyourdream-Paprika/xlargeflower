'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  PromotionSettings
} from '@/lib/supabase';

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<PromotionSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromotionSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    discount_rate: 50,
    start_date: '',
    end_date: '',
    is_active: true,
    badge_text: ''
  });

  const ADMIN_PASSWORD = 'xlarge2024';

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

  const fetchPromotions = useCallback(async () => {
    try {
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPromotions();
  }, [isAuthenticated, fetchPromotions]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const resetForm = () => {
    const now = new Date();
    const endDate = new Date('2026-02-15T23:59:59');

    setFormData({
      title: '2월 반값 할인',
      discount_rate: 50,
      start_date: now.toISOString().slice(0, 16),
      end_date: endDate.toISOString().slice(0, 16),
      is_active: true,
      badge_text: '2.15까지 50%'
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PromotionSettings) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      discount_rate: item.discount_rate || 50,
      start_date: item.start_date ? new Date(item.start_date).toISOString().slice(0, 16) : '',
      end_date: item.end_date ? new Date(item.end_date).toISOString().slice(0, 16) : '',
      is_active: item.is_active,
      badge_text: item.badge_text || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.start_date || !formData.end_date) {
      setError('프로모션명, 시작일, 종료일은 필수입니다.');
      return;
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('종료일은 시작일보다 늦어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };

      if (editingItem) {
        await updatePromotion(editingItem.id!, submitData);
        setSuccessMessage('수정 완료!');
      } else {
        await createPromotion(submitData);
        setSuccessMessage('등록 완료!');
      }
      setIsModalOpen(false);
      fetchPromotions();
    } catch (err) {
      console.error('Submit failed:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PromotionSettings) => {
    if (!confirm(`"${item.title}" 프로모션을 삭제하시겠습니까?`)) return;

    try {
      await deletePromotion(item.id!);
      setSuccessMessage('삭제 완료!');
      fetchPromotions();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: PromotionSettings) => {
    try {
      await updatePromotion(item.id!, { is_active: !item.is_active });
      fetchPromotions();
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl"
            >
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
              <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
                사이트 보기
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('adminAuth');
                  setIsAuthenticated(false);
                }}
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
            <Link href="/admin/promotion" className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap">
              프로모션
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
            <Link href="/admin/portfolio" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              포트폴리오
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">프로모션 관리</h2>
            <p className="text-gray-500 mt-1">기간 한정 할인 프로모션을 설정합니다.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
          >
            + 새 프로모션
          </button>
        </div>

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

        {/* Info */}
        <div className="mb-6 p-4 bg-[#0A0A0A] border border-[#222] rounded-xl">
          <p className="text-gray-400 text-sm">
            <span className="text-[#00F5A0] font-medium">TIP:</span> 프로모션이 활성화되고 기간 내에 있으면 Pricing 섹션에 자동으로 할인이 적용됩니다.
          </p>
        </div>

        {/* Promotion List */}
        {promotions.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">등록된 프로모션이 없습니다.</p>
            <p className="text-gray-600 text-sm">&quot;새 프로모션&quot; 버튼을 클릭하여 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((item) => {
              const status = getPromoStatus(item);
              return (
                <div
                  key={item.id}
                  className={`bg-[#0A0A0A] border rounded-xl overflow-hidden ${
                    status.label === '진행중' ? 'border-[#00F5A0]/50' : 'border-[#222]'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-bold text-lg">{item.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">할인율:</span>
                            <span className="text-[#00F5A0] font-bold text-xl">{item.discount_rate}%</span>
                          </div>
                          {item.badge_text && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                              {item.badge_text}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                          <div>
                            <span className="text-gray-600">시작:</span> {formatDate(item.start_date)}
                          </div>
                          <div>
                            <span className="text-gray-600">종료:</span> {formatDate(item.end_date)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`p-2 rounded-lg border ${
                            item.is_active
                              ? 'bg-[#00F5A0]/10 border-[#00F5A0]/30'
                              : 'bg-[#111] border-[#333] hover:border-gray-500'
                          }`}
                        >
                          {item.is_active ? (
                            <svg className="w-4 h-4 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg hover:bg-red-500/20"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-lg font-bold text-white mb-6">
              {editingItem ? '프로모션 수정' : '새 프로모션'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">프로모션명 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  placeholder="예: 2월 반값 할인"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">할인율 (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData({ ...formData, discount_rate: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">뱃지 텍스트</label>
                <input
                  type="text"
                  value={formData.badge_text}
                  onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  placeholder="예: 2.15까지 50%"
                />
                <p className="text-xs text-gray-500 mt-1">가격 옆에 표시될 뱃지 문구입니다.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">시작일 *</label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">종료일 *</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_active ? 'bg-[#00F5A0]' : 'bg-[#333]'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      formData.is_active ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-400">
                  {formData.is_active ? '활성화' : '비활성화'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl disabled:opacity-50"
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
