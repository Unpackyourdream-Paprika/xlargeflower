'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, XLargeFlowerPortfolio } from '@/lib/supabase';

export default function AdminPortfolioPage() {
  const [portfolios, setPortfolios] = useState<XLargeFlowerPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<XLargeFlowerPortfolio | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    thumbnail_url: '',
    video_url: '',
    duration: '',
    format: '',
    description: '',
    production_time: '',
    cost: ''
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
      if (editingItem) {
        const { error } = await supabase
          .from('xlarge_flower_portfolio')
          .update({
            ...formData,
            video_url: formData.video_url || null
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('xlarge_flower_portfolio')
          .insert([{
            ...formData,
            video_url: formData.video_url || null,
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
        cost: ''
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
      cost: item.cost
    });
    setShowAddModal(true);
  };

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
      <nav className="bg-[#0A0A0A] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <Link
              href="/admin"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/admin/orders"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors"
            >
              주문 관리
            </Link>
            <Link
              href="/admin/portfolio"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm"
            >
              포트폴리오
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors"
            >
              쇼케이스 관리
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">포트폴리오 관리</h2>
            <p className="text-gray-500 mt-1">메인 페이지에 표시될 포트폴리오를 관리합니다.</p>
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
                cost: ''
              });
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
          >
            + 새 포트폴리오 추가
          </button>
        </div>

        {/* Portfolio Grid */}
        {portfolios.length === 0 ? (
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
            {portfolios.map((item) => (
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
                      <p className="text-sm text-[#00F5A0]">{item.category}</p>
                    </div>
                    <span className="text-xs text-gray-500">{item.duration}</span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-2 bg-[#111] border border-[#333] text-white rounded-lg text-sm font-medium hover:border-[#00F5A0]/50 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.is_active
                          ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                          : 'bg-[#00F5A0]/10 border border-[#00F5A0]/30 text-[#00F5A0] hover:bg-[#00F5A0]/20'
                      }`}
                    >
                      {item.is_active ? '숨기기' : '공개'}
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
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingItem ? '포트폴리오 수정' : '새 포트폴리오 추가'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    카테고리 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="뷰티, 패션, 식품..."
                    required
                  />
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
