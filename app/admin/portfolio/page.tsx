'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, XLargeFlowerPortfolio, PortfolioType } from '@/lib/supabase';

export default function AdminPortfolioPage() {
  const [portfolios, setPortfolios] = useState<XLargeFlowerPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<XLargeFlowerPortfolio | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | PortfolioType>('ALL');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    thumbnail_url: '',
    video_url: '',
    duration: '',
    format: '',
    description: '',
    production_time: '',
    cost: '',
    // 새 필드들
    portfolio_type: 'CASE' as PortfolioType,
    client_name: '',
    client_logo_url: '',
    metric_1_value: '',
    metric_1_label: '',
    metric_2_value: '',
    metric_2_label: '',
    is_featured: false,
    campaign_date: '',
    category_color: '#00F5A0'
  });

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('xlarge_flower_portfolio')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        video_url: formData.video_url || null,
        client_logo_url: formData.client_logo_url || null,
        metric_1_value: formData.metric_1_value || null,
        metric_1_label: formData.metric_1_label || null,
        metric_2_value: formData.metric_2_value || null,
        metric_2_label: formData.metric_2_label || null,
        campaign_date: formData.campaign_date || null,
        category_color: formData.category_color || null
      };

      if (editingItem) {
        const { error } = await supabase
          .from('xlarge_flower_portfolio')
          .update(submitData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('xlarge_flower_portfolio')
          .insert([{
            ...submitData,
            is_active: true,
            order_index: portfolios.length
          }]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingItem(null);
      setFormData({
        title: '',
        category: '',
        thumbnail_url: '',
        video_url: '',
        duration: '',
        format: '',
        description: '',
        production_time: '',
        cost: '',
        portfolio_type: 'CASE',
        client_name: '',
        client_logo_url: '',
        metric_1_value: '',
        metric_1_label: '',
        metric_2_value: '',
        metric_2_label: '',
        is_featured: false,
        campaign_date: '',
        category_color: '#00F5A0'
      });
      fetchPortfolios();
    } catch (error) {
      console.error('Failed to save portfolio:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleEdit = (item: XLargeFlowerPortfolio) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      thumbnail_url: item.thumbnail_url,
      video_url: item.video_url || '',
      duration: item.duration,
      format: item.format,
      description: item.description,
      production_time: item.production_time,
      cost: item.cost,
      portfolio_type: item.portfolio_type || 'MODEL',
      client_name: item.client_name || '',
      client_logo_url: item.client_logo_url || '',
      metric_1_value: item.metric_1_value || '',
      metric_1_label: item.metric_1_label || '',
      metric_2_value: item.metric_2_value || '',
      metric_2_label: item.metric_2_label || '',
      is_featured: item.is_featured || false,
      campaign_date: item.campaign_date || '',
      category_color: item.category_color || '#00F5A0'
    });
    setShowAddModal(true);
  };

  const handleToggleFeatured = async (item: XLargeFlowerPortfolio) => {
    try {
      const { error } = await supabase
        .from('xlarge_flower_portfolio')
        .update({ is_featured: !item.is_featured })
        .eq('id', item.id);

      if (error) throw error;
      fetchPortfolios();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  // 필터링된 포트폴리오
  const filteredPortfolios = filterType === 'ALL'
    ? portfolios
    : portfolios.filter(p => p.portfolio_type === filterType);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('xlarge_flower_portfolio')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPortfolios();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: XLargeFlowerPortfolio) => {
    try {
      const { error } = await supabase
        .from('xlarge_flower_portfolio')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;
      fetchPortfolios();
    } catch (error) {
      console.error('Failed to toggle:', error);
    }
  };

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
            <Link href="/" className="text-gray-500 hover:text-white text-sm transition-colors">
              사이트 보기
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#0A0A0A] border-b border-[#222] overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            <Link
              href="/admin"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              대시보드
            </Link>
            <Link
              href="/admin/orders"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              주문 관리
            </Link>
            <Link
              href="/admin/portfolio"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
            >
              포트폴리오
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              쇼케이스
            </Link>
            <Link
              href="/admin/artists"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              아티스트
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">포트폴리오 관리</h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">AI 모델 라인업 및 고객사 성공 사례를 관리합니다.</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                title: '',
                category: '',
                thumbnail_url: '',
                video_url: '',
                duration: '',
                format: '',
                description: '',
                production_time: '',
                cost: '',
                portfolio_type: 'CASE',
                client_name: '',
                client_logo_url: '',
                metric_1_value: '',
                metric_1_label: '',
                metric_2_value: '',
                metric_2_label: '',
                is_featured: false,
                campaign_date: '',
                category_color: '#00F5A0'
              });
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all text-sm sm:text-base"
          >
            + 새 포트폴리오 추가
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'ALL', label: '전체', count: portfolios.length },
            { key: 'CASE', label: '고객 사례', count: portfolios.filter(p => p.portfolio_type === 'CASE').length },
            { key: 'MODEL', label: 'AI 모델', count: portfolios.filter(p => p.portfolio_type === 'MODEL').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as 'ALL' | PortfolioType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === tab.key
                  ? 'bg-[#00F5A0] text-black'
                  : 'bg-[#111] border border-[#333] text-gray-400 hover:text-white hover:border-[#00F5A0]/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        {filteredPortfolios.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-12 text-center">
            <p className="text-gray-500">아직 포트폴리오가 없습니다.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-[#00F5A0] hover:text-[#00D9F5] font-medium transition-colors"
            >
              첫 포트폴리오 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((item) => (
              <div
                key={item.id}
                className={`bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden hover:border-[#00F5A0]/50 transition-colors ${
                  !item.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className="aspect-video bg-[#111] relative">
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                  {/* 타입 뱃지 */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      item.portfolio_type === 'CASE'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {item.portfolio_type === 'CASE' ? '고객사례' : 'AI모델'}
                    </span>
                    {item.is_featured && (
                      <span className="px-2 py-1 bg-[#00F5A0]/20 text-[#00F5A0] text-xs font-bold rounded border border-[#00F5A0]/30">
                        메인노출
                      </span>
                    )}
                  </div>
                  {!item.is_active && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700">
                      비공개
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: item.category_color ? `${item.category_color}20` : 'rgba(0, 245, 160, 0.1)',
                            color: item.category_color || '#00F5A0'
                          }}
                        >
                          {item.category}
                        </span>
                        {item.client_name && (
                          <span className="text-xs text-gray-500">{item.client_name}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{item.duration}</span>
                  </div>

                  {/* 성과 지표 미리보기 */}
                  {(item.metric_1_value || item.metric_2_value) && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-[#222]">
                      {item.metric_1_value && (
                        <div>
                          <p className="text-lg font-bold text-[#00F5A0]">{item.metric_1_value}</p>
                          <p className="text-xs text-gray-500">{item.metric_1_label}</p>
                        </div>
                      )}
                      {item.metric_2_value && (
                        <div>
                          <p className="text-lg font-bold text-[#00D9F5]">{item.metric_2_value}</p>
                          <p className="text-xs text-gray-500">{item.metric_2_label}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2 bg-[#111] border border-[#333] text-white rounded-lg text-sm font-medium hover:border-[#00F5A0]/50 transition-colors"
                    >
                      수정
                    </button>
                    {item.portfolio_type === 'CASE' && (
                      <button
                        onClick={() => handleToggleFeatured(item)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          item.is_featured
                            ? 'bg-[#00F5A0]/20 border border-[#00F5A0]/50 text-[#00F5A0]'
                            : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50'
                        }`}
                        title={item.is_featured ? '메인 노출 해제' : '메인에 노출'}
                      >
                        ★
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        item.is_active
                          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-[#00F5A0]/10 border border-[#00F5A0]/30 text-[#00F5A0] hover:bg-[#00F5A0]/20'
                      }`}
                    >
                      {item.is_active ? '숨김' : '공개'}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="py-2 px-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingItem ? '포트폴리오 수정' : '새 포트폴리오 추가'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  타입 <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, portfolio_type: 'CASE' })}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.portfolio_type === 'CASE'
                        ? 'bg-purple-500/20 border-2 border-purple-500 text-purple-400'
                        : 'bg-[#111] border border-[#333] text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    고객 사례 (CASE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, portfolio_type: 'MODEL' })}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                      formData.portfolio_type === 'MODEL'
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-blue-400'
                        : 'bg-[#111] border border-[#333] text-gray-400 hover:border-blue-500/50'
                    }`}
                  >
                    AI 모델 (MODEL)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    제목 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder={formData.portfolio_type === 'CASE' ? 'ROAS 3배 달성' : 'RUBY - 뷰티 전문'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    업종/카테고리 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="뷰티, 패션, F&B..."
                    required
                  />
                </div>
              </div>

              {/* 고객사례 전용 필드 */}
              {formData.portfolio_type === 'CASE' && (
                <>
                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-4">
                    <p className="text-purple-400 text-sm font-medium">고객 사례 정보</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          고객사명
                        </label>
                        <input
                          type="text"
                          value={formData.client_name}
                          onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="뷰티 D사, F&B M사..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          캠페인 날짜
                        </label>
                        <input
                          type="text"
                          value={formData.campaign_date}
                          onChange={(e) => setFormData({ ...formData, campaign_date: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="2024.12 캠페인"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        고객사 로고 URL
                      </label>
                      <input
                        type="url"
                        value={formData.client_logo_url}
                        onChange={(e) => setFormData({ ...formData, client_logo_url: e.target.value })}
                        className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                        placeholder="https://..."
                      />
                    </div>

                    {/* 성과 지표 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">성과 지표 1</label>
                        <input
                          type="text"
                          value={formData.metric_1_value}
                          onChange={(e) => setFormData({ ...formData, metric_1_value: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="수치 (예: +312%)"
                        />
                        <input
                          type="text"
                          value={formData.metric_1_label}
                          onChange={(e) => setFormData({ ...formData, metric_1_label: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="라벨 (예: ROAS 상승)"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">성과 지표 2</label>
                        <input
                          type="text"
                          value={formData.metric_2_value}
                          onChange={(e) => setFormData({ ...formData, metric_2_value: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="수치 (예: ₩4,200)"
                        />
                        <input
                          type="text"
                          value={formData.metric_2_label}
                          onChange={(e) => setFormData({ ...formData, metric_2_label: e.target.value })}
                          className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                          placeholder="라벨 (예: CPA 달성)"
                        />
                      </div>
                    </div>

                    {/* 메인 노출 토글 */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.is_featured ? 'bg-[#00F5A0]' : 'bg-[#333]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            formData.is_featured ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-400">
                        메인 페이지에 노출 {formData.is_featured && <span className="text-[#00F5A0]">(활성)</span>}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* 카테고리 색상 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    카테고리 색상
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.category_color}
                      onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                      className="w-12 h-10 bg-transparent border border-[#333] rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_color}
                      onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                      placeholder="#00F5A0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    미리보기
                  </label>
                  <span
                    className="inline-block px-3 py-2 text-sm font-bold rounded"
                    style={{
                      backgroundColor: `${formData.category_color}20`,
                      color: formData.category_color
                    }}
                  >
                    {formData.category || '카테고리'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  썸네일 URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                  placeholder="https://..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  영상 URL (선택)
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    길이 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="15초, 30초..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    포맷 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="9:16, 1:1..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  설명 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    제작 시간 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.production_time}
                    onChange={(e) => setFormData({ ...formData, production_time: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="48시간, 즉시 납품..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    비용 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="990,000원~"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium hover:border-[#555] transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
                >
                  {editingItem ? '저장' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
