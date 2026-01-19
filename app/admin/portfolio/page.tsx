'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase, XLargeFlowerPortfolio, PortfolioType } from '@/lib/supabase';

export default function AdminPortfolioPage() {
  const [portfolios, setPortfolios] = useState<XLargeFlowerPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | PortfolioType>('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 간단 편집 모달
  const [editingItem, setEditingItem] = useState<XLargeFlowerPortfolio | null>(null);
  const [editForm, setEditForm] = useState({ client_name: '', category: '', title: '', description: '' });

  const fetchPortfolios = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // 드래그앤드롭 업로드
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('');

    const totalFiles = files.length;
    let completed = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('video/')) {
          setError(`${file.name}은(는) 비디오 파일이 아닙니다.`);
          continue;
        }

        setUploadStatus(`[${i + 1}/${totalFiles}] ${file.name} 업로드 중...`);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload-video', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('업로드 실패');
        }

        const result = await response.json();

        // DB에 저장
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        const { error: insertError } = await supabase
          .from('xlarge_flower_portfolio')
          .insert([{
            title: fileName,
            category: '기타',
            thumbnail_url: result.thumbnailUrl || result.videoUrl,
            video_url: result.videoUrl,
            duration: '15초',
            format: '9:16',
            description: fileName,
            production_time: '48시간',
            cost: '문의',
            portfolio_type: 'CASE',
            client_name: null,
            is_featured: false,
            is_active: true,
            order_index: portfolios.length + i
          }]);

        if (insertError) throw insertError;

        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
        setUploadStatus(`[${i + 1}/${totalFiles}] 완료!`);
      }

      setUploadStatus('모든 업로드 완료!');
      await fetchPortfolios();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // 간단 편집 저장
  const handleEditSave = async () => {
    if (!editingItem) return;

    try {
      const { error } = await supabase
        .from('xlarge_flower_portfolio')
        .update({
          client_name: editForm.client_name || null,
          category: editForm.category || '기타',
          title: editForm.title || editingItem.title,
          description: editForm.description || null
        })
        .eq('id', editingItem.id);

      if (error) throw error;
      setEditingItem(null);
      fetchPortfolios();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('저장 실패');
    }
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
            <Link href="/admin" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              대시보드
            </Link>
            <Link href="/admin/orders" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              주문 관리
            </Link>
            <Link href="/admin/portfolio" className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap">
              포트폴리오
            </Link>
            <Link href="/admin/showcase" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              쇼케이스
            </Link>
            <Link href="/admin/artists" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              아티스트
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">포트폴리오 관리</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">고객사 성공 사례를 관리합니다.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">닫기</button>
          </div>
        )}

        {/* Upload Zone - 쇼케이스처럼 */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            mb-8 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
            ${isDragging ? 'border-[#00F5A0] bg-[#00F5A0]/5' : 'border-[#333] hover:border-[#00F5A0]/50 bg-[#0A0A0A]'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => {
            if (!isUploading) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'video/*';
              input.multiple = true;
              input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
              input.click();
            }
          }}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white font-medium">업로드 중... {uploadProgress}%</p>
              {uploadStatus && <p className="text-[#00F5A0] text-sm">{uploadStatus}</p>}
              <div className="w-64 h-2 bg-[#222] rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">드래그 & 드롭으로 영상 업로드</p>
              <p className="text-gray-500 text-sm">또는 클릭하여 파일 선택</p>
            </>
          )}
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
            <p className="text-gray-600 text-sm mt-2">위 영역에 영상을 드래그하여 업로드하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredPortfolios.map((item) => (
              <div
                key={item.id}
                className={`relative bg-[#0A0A0A] border rounded-xl overflow-hidden group ${
                  item.is_active ? 'border-[#222]' : 'border-red-500/30 opacity-60'
                }`}
              >
                {/* Video */}
                <div className="aspect-[9/16] bg-[#111] relative">
                  {item.video_url ? (
                    <video
                      src={item.video_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No Video
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditForm({
                          client_name: item.client_name || '',
                          category: item.category || '',
                          title: item.title || '',
                          description: item.description || ''
                        });
                      }}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="편집"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_active ? 'bg-gray-600 hover:bg-gray-500' : 'bg-[#00F5A0] hover:bg-[#00D9F5]'
                      }`}
                      title={item.is_active ? '숨기기' : '공개'}
                    >
                      {item.is_active ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="p-2 bg-red-500 hover:bg-red-400 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      item.portfolio_type === 'CASE'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {item.portfolio_type === 'CASE' ? '사례' : '모델'}
                    </span>
                    {item.is_featured && (
                      <span className="px-2 py-1 bg-[#00F5A0]/20 text-[#00F5A0] text-xs font-bold rounded">
                        메인
                      </span>
                    )}
                  </div>

                  {/* Featured Star */}
                  <button
                    onClick={() => handleToggleFeatured(item)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors ${
                      item.is_featured
                        ? 'bg-[#00F5A0] text-black'
                        : 'bg-black/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {item.client_name || item.title || '제목 없음'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Modal - 간단 */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-4">정보 수정</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">클라이언트명 (상단 표시)</label>
                <input
                  type="text"
                  value={editForm.client_name}
                  onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white"
                  placeholder="예: 국민건강보험공단"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">카테고리</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white"
                >
                  <option value="기타">기타</option>
                  <option value="뷰티">뷰티</option>
                  <option value="패션">패션</option>
                  <option value="F&B">F&B</option>
                  <option value="테크">테크</option>
                  <option value="라이프스타일">라이프스타일</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">제목 (하단 표시)</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white"
                  placeholder="예: 건강보험 캠페인"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">설명 (하단 표시)</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white"
                  placeholder="예: AI 모델로 제작한 건강보험 광고"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
