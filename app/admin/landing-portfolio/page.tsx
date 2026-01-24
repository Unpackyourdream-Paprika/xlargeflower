'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAllLandingPortfolios,
  createLandingPortfolio,
  updateLandingPortfolio,
  deleteLandingPortfolio,
  updateLandingPortfolioOrders,
  LandingPortfolio
} from '@/lib/supabase';

export default function LandingPortfolioManagement() {
  const [portfolios, setPortfolios] = useState<LandingPortfolio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LandingPortfolio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    client_name: '',
    client_name_en: '',
    client_name_ja: '',
    category: '뷰티',
    category_en: '',
    category_ja: '',
    category_color: '#FF69B4',
    campaign_date: '',
    campaign_date_en: '',
    campaign_date_ja: '',
    title: '',
    title_en: '',
    title_ja: '',
    description: '',
    description_en: '',
    description_ja: '',
    video_url: '',
    thumbnail_url: '',
    metric_1_value: '',
    metric_1_label: '',
    metric_1_label_en: '',
    metric_1_label_ja: '',
    metric_2_value: '',
    metric_2_label: '',
    metric_2_label_en: '',
    metric_2_label_ja: '',
    sort_order: 0,
    is_active: true
  });

  // 번역 상태
  const [isTranslating, setIsTranslating] = useState(false);

  const ADMIN_PASSWORD = 'xlarge2024';

  const CATEGORY_OPTIONS = [
    { value: '뷰티', label: '뷰티', color: '#FF69B4' },
    { value: 'F&B', label: 'F&B', color: '#FFA500' },
    { value: 'D2C', label: 'D2C', color: '#9B59B6' },
    { value: '테크', label: '테크', color: '#3498DB' },
    { value: '패션', label: '패션', color: '#00F5A0' },
    { value: '라이프스타일', label: '라이프스타일', color: '#00D9F5' },
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

  const fetchPortfolios = useCallback(async () => {
    try {
      const data = await getAllLandingPortfolios();
      setPortfolios(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPortfolios();
  }, [isAuthenticated, fetchPortfolios]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_name_en: '',
      client_name_ja: '',
      category: '뷰티',
      category_en: '',
      category_ja: '',
      category_color: '#FF69B4',
      campaign_date: '',
      campaign_date_en: '',
      campaign_date_ja: '',
      title: '',
      title_en: '',
      title_ja: '',
      description: '',
      description_en: '',
      description_ja: '',
      video_url: '',
      thumbnail_url: '',
      metric_1_value: '',
      metric_1_label: '',
      metric_1_label_en: '',
      metric_1_label_ja: '',
      metric_2_value: '',
      metric_2_label: '',
      metric_2_label_en: '',
      metric_2_label_ja: '',
      sort_order: portfolios.length,
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LandingPortfolio) => {
    setEditingItem(item);
    setFormData({
      client_name: item.client_name || '',
      client_name_en: item.client_name_en || '',
      client_name_ja: item.client_name_ja || '',
      category: item.category || '뷰티',
      category_en: item.category_en || '',
      category_ja: item.category_ja || '',
      category_color: item.category_color || '#FF69B4',
      campaign_date: item.campaign_date || '',
      campaign_date_en: item.campaign_date_en || '',
      campaign_date_ja: item.campaign_date_ja || '',
      title: item.title || '',
      title_en: item.title_en || '',
      title_ja: item.title_ja || '',
      description: item.description || '',
      description_en: item.description_en || '',
      description_ja: item.description_ja || '',
      video_url: item.video_url || '',
      thumbnail_url: item.thumbnail_url || '',
      metric_1_value: item.metric_1_value || '',
      metric_1_label: item.metric_1_label || '',
      metric_1_label_en: item.metric_1_label_en || '',
      metric_1_label_ja: item.metric_1_label_ja || '',
      metric_2_value: item.metric_2_value || '',
      metric_2_label: item.metric_2_label || '',
      metric_2_label_en: item.metric_2_label_en || '',
      metric_2_label_ja: item.metric_2_label_ja || '',
      sort_order: item.sort_order,
      is_active: item.is_active
    });
    setIsModalOpen(true);
  };

  // 번역 함수
  const translateTexts = async () => {
    setIsTranslating(true);
    try {
      const textsToTranslate: string[] = [];
      const textMapping: { type: string }[] = [];

      // 번역할 텍스트 수집
      if (formData.client_name) {
        textsToTranslate.push(formData.client_name);
        textMapping.push({ type: 'client_name' });
      }
      if (formData.category) {
        textsToTranslate.push(formData.category);
        textMapping.push({ type: 'category' });
      }
      if (formData.campaign_date) {
        textsToTranslate.push(formData.campaign_date);
        textMapping.push({ type: 'campaign_date' });
      }
      if (formData.title) {
        textsToTranslate.push(formData.title);
        textMapping.push({ type: 'title' });
      }
      if (formData.description) {
        textsToTranslate.push(formData.description);
        textMapping.push({ type: 'description' });
      }
      if (formData.metric_1_label) {
        textsToTranslate.push(formData.metric_1_label);
        textMapping.push({ type: 'metric_1_label' });
      }
      if (formData.metric_2_label) {
        textsToTranslate.push(formData.metric_2_label);
        textMapping.push({ type: 'metric_2_label' });
      }

      if (textsToTranslate.length === 0) {
        setError('번역할 한국어 텍스트가 없습니다.');
        return;
      }

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: textsToTranslate,
          targetLanguages: ['en', 'ja']
        })
      });

      if (!response.ok) throw new Error('번역 API 오류');

      const { translations } = await response.json();

      // 번역 결과 적용
      const newFormData = { ...formData };
      translations.forEach((t: { original: string; en?: string; ja?: string }, index: number) => {
        const mapping = textMapping[index];
        if (mapping.type === 'client_name') {
          newFormData.client_name_en = t.en || '';
          newFormData.client_name_ja = t.ja || '';
        } else if (mapping.type === 'category') {
          newFormData.category_en = t.en || '';
          newFormData.category_ja = t.ja || '';
        } else if (mapping.type === 'campaign_date') {
          newFormData.campaign_date_en = t.en || '';
          newFormData.campaign_date_ja = t.ja || '';
        } else if (mapping.type === 'title') {
          newFormData.title_en = t.en || '';
          newFormData.title_ja = t.ja || '';
        } else if (mapping.type === 'description') {
          newFormData.description_en = t.en || '';
          newFormData.description_ja = t.ja || '';
        } else if (mapping.type === 'metric_1_label') {
          newFormData.metric_1_label_en = t.en || '';
          newFormData.metric_1_label_ja = t.ja || '';
        } else if (mapping.type === 'metric_2_label') {
          newFormData.metric_2_label_en = t.en || '';
          newFormData.metric_2_label_ja = t.ja || '';
        }
      });

      setFormData(newFormData);
      setSuccessMessage('번역이 완료되었습니다!');
    } catch (err) {
      console.error('Translation failed:', err);
      setError('번역 중 오류가 발생했습니다.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // 서명 받기
      const signRes = await fetch('/api/upload-video');
      if (!signRes.ok) throw new Error('서명 생성 실패');
      const { signature, timestamp, cloudName, apiKey } = await signRes.json();

      // Cloudinary 직접 업로드
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('signature', signature);
      uploadFormData.append('timestamp', timestamp.toString());
      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('folder', 'xlarge-showcase');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: uploadFormData }
      );

      if (!uploadRes.ok) throw new Error('업로드 실패');

      const result = await uploadRes.json();
      const videoUrl = result.secure_url;

      // 썸네일 URL 생성 (정사각형 1:1)
      const thumbnailUrl = videoUrl
        .replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,so_0,f_webp/')
        .replace(/\.[^.]+$/, '.webp');

      setFormData(prev => ({
        ...prev,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl
      }));

      setSuccessMessage('영상 업로드 완료!');
    } catch (err) {
      console.error('Upload failed:', err);
      setError('영상 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.client_name || !formData.title) {
      setError('클라이언트명과 제목은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateLandingPortfolio(editingItem.id!, formData);
        setSuccessMessage('수정 완료!');
      } else {
        await createLandingPortfolio(formData);
        setSuccessMessage('등록 완료!');
      }
      setIsModalOpen(false);
      fetchPortfolios();
    } catch (err) {
      console.error('Submit failed:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: LandingPortfolio) => {
    if (!confirm(`"${item.client_name}"을 삭제하시겠습니까?`)) return;

    try {
      await deleteLandingPortfolio(item.id!);
      setSuccessMessage('삭제 완료!');
      fetchPortfolios();
    } catch (err) {
      console.error('Delete failed:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (item: LandingPortfolio) => {
    try {
      await updateLandingPortfolio(item.id!, { is_active: !item.is_active });
      fetchPortfolios();
    } catch (err) {
      console.error('Toggle failed:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= portfolios.length) return;

    const newPortfolios = [...portfolios];
    [newPortfolios[index], newPortfolios[newIndex]] = [newPortfolios[newIndex], newPortfolios[index]];

    setPortfolios(newPortfolios);

    try {
      await updateLandingPortfolioOrders(
        newPortfolios.map((p, i) => ({ id: p.id!, sort_order: i }))
      );
    } catch (err) {
      console.error('Reorder failed:', err);
      fetchPortfolios();
    }
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
            <Link href="/admin/hero" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              히어로
            </Link>
            <Link href="/admin/showcase" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              쇼케이스
            </Link>
            <Link href="/admin/before-after" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              Before/After
            </Link>
            <Link href="/admin/landing-portfolio" className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap">
              랜딩 포트폴리오
            </Link>
            <Link href="/admin/portfolio" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              포트폴리오
            </Link>
            <span className="text-gray-600 text-sm">|</span>
            <Link href="/admin/artists" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              아티스트
            </Link>
            <Link href="/admin/pricing" className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap">
              가격 관리
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">랜딩 포트폴리오 관리</h2>
            <p className="text-gray-500 mt-1">메인 페이지 REAL PORTFOLIO 섹션의 3개 카드를 관리합니다.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
          >
            + 새 항목 추가
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
            <span className="text-[#00F5A0] font-medium">TIP:</span> 메인 페이지에는 활성화된 상위 3개 항목만 표시됩니다. 영상은 1:1 비율로 자동 크롭됩니다.
          </p>
        </div>

        {/* Portfolio List */}
        {portfolios.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">등록된 항목이 없습니다.</p>
            <p className="text-gray-600 text-sm">위의 &quot;새 항목 추가&quot; 버튼을 클릭하여 추가하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {portfolios.map((item, index) => (
              <div
                key={item.id}
                className={`bg-[#0A0A0A] border rounded-xl overflow-hidden ${
                  item.is_active ? 'border-[#222]' : 'border-red-500/30 opacity-60'
                }`}
              >
                <div className="p-4 flex flex-col lg:flex-row gap-4">
                  {/* Video Preview - 정사각형 */}
                  <div className="w-full lg:w-40 flex-shrink-0">
                    <div className="aspect-square bg-[#111] rounded-lg overflow-hidden relative">
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
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Order Badge */}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-black/70 rounded text-xs text-white font-mono">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: `${item.category_color || '#00F5A0'}20`, color: item.category_color || '#00F5A0' }}
                      >
                        {item.category}
                      </span>
                      <span className="text-gray-500 text-xs">{item.campaign_date}</span>
                      {!item.is_active && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">비활성</span>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{item.client_name}</h3>
                    <p className="text-gray-300 text-sm mb-2">{item.title}</p>
                    <p className="text-gray-500 text-xs mb-3">{item.description}</p>

                    {/* Metrics */}
                    <div className="flex gap-4">
                      {item.metric_1_value && (
                        <div>
                          <p className="text-[#00F5A0] font-bold">{item.metric_1_value}</p>
                          <p className="text-gray-500 text-xs">{item.metric_1_label}</p>
                        </div>
                      )}
                      {item.metric_2_value && (
                        <div>
                          <p className="text-[#00D9F5] font-bold">{item.metric_2_value}</p>
                          <p className="text-gray-500 text-xs">{item.metric_2_label}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === portfolios.length - 1}
                      className="p-2 bg-[#111] border border-[#333] rounded-lg hover:border-[#00F5A0]/50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
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
                          ? 'bg-[#111] border-[#333] hover:border-gray-500'
                          : 'bg-[#00F5A0]/10 border-[#00F5A0]/30'
                      }`}
                    >
                      {item.is_active ? (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingItem ? '항목 수정' : '새 항목 추가'}
              </h3>
              <button
                type="button"
                onClick={translateTexts}
                disabled={isTranslating}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isTranslating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    번역 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    자동 번역 (KO→EN/JA)
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Video Upload */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">영상 업로드</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isUploading ? 'border-[#00F5A0] bg-[#00F5A0]/5' : 'border-[#333] hover:border-[#00F5A0]/50'
                  }`}
                  onClick={() => {
                    if (isUploading) return;
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleVideoUpload(file);
                    };
                    input.click();
                  }}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[#00F5A0]">업로드 중...</span>
                    </div>
                  ) : formData.video_url ? (
                    <div className="flex items-center justify-center gap-2 text-[#00F5A0]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>영상 업로드됨 (클릭하여 변경)</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">클릭하여 영상 업로드</span>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">클라이언트명 * <span className="text-red-400">(KO)</span></label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                    placeholder="예: BEAUTY D사"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">캠페인 날짜 <span className="text-red-400">(KO)</span></label>
                  <input
                    type="text"
                    value={formData.campaign_date}
                    onChange={(e) => setFormData({ ...formData, campaign_date: e.target.value })}
                    className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                    placeholder="예: 2024.12 캠페인"
                  />
                </div>
              </div>

              {/* 클라이언트명 / 캠페인 날짜 번역 필드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-blue-400 mb-1">클라이언트명 (EN)</label>
                    <input
                      type="text"
                      value={formData.client_name_en}
                      onChange={(e) => setFormData({ ...formData, client_name_en: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-blue-500/30 rounded-lg focus:border-blue-500 focus:outline-none text-white text-sm"
                      placeholder="English"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-pink-400 mb-1">クライアント名 (JA)</label>
                    <input
                      type="text"
                      value={formData.client_name_ja}
                      onChange={(e) => setFormData({ ...formData, client_name_ja: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-pink-500/30 rounded-lg focus:border-pink-500 focus:outline-none text-white text-sm"
                      placeholder="日本語"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-blue-400 mb-1">캠페인 날짜 (EN)</label>
                    <input
                      type="text"
                      value={formData.campaign_date_en}
                      onChange={(e) => setFormData({ ...formData, campaign_date_en: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-blue-500/30 rounded-lg focus:border-blue-500 focus:outline-none text-white text-sm"
                      placeholder="English"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-pink-400 mb-1">キャンペーン日 (JA)</label>
                    <input
                      type="text"
                      value={formData.campaign_date_ja}
                      onChange={(e) => setFormData({ ...formData, campaign_date_ja: e.target.value })}
                      className="w-full px-3 py-2 bg-[#111] border border-pink-500/30 rounded-lg focus:border-pink-500 focus:outline-none text-white text-sm"
                      placeholder="日本語"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const selected = CATEGORY_OPTIONS.find(c => c.value === e.target.value);
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        category_color: selected?.color || '#00F5A0'
                      });
                    }}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                  >
                    {CATEGORY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">카테고리 색상</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.category_color}
                      onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                      className="w-12 h-12 rounded-lg border border-[#333] cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.category_color}
                      onChange={(e) => setFormData({ ...formData, category_color: e.target.value })}
                      className="flex-1 px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">제목 * <span className="text-red-400">(KO)</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                  placeholder="예: 인플루언서 대비 ROAS 3배 달성"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-blue-400 mb-1">제목 (EN)</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-blue-500/30 rounded-lg focus:border-blue-500 focus:outline-none text-white text-sm"
                    placeholder="English title"
                  />
                </div>
                <div>
                  <label className="block text-xs text-pink-400 mb-1">タイトル (JA)</label>
                  <input
                    type="text"
                    value={formData.title_ja}
                    onChange={(e) => setFormData({ ...formData, title_ja: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-pink-500/30 rounded-lg focus:border-pink-500 focus:outline-none text-white text-sm"
                    placeholder="日本語タイトル"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">설명 <span className="text-red-400">(KO)</span></label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                  placeholder="예: 기존 인플루언서 협찬 대비 동일 매체비로 전환율 3배 상승"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-blue-400 mb-1">설명 (EN)</label>
                  <input
                    type="text"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-blue-500/30 rounded-lg focus:border-blue-500 focus:outline-none text-white text-sm"
                    placeholder="English description"
                  />
                </div>
                <div>
                  <label className="block text-xs text-pink-400 mb-1">説明 (JA)</label>
                  <input
                    type="text"
                    value={formData.description_ja}
                    onChange={(e) => setFormData({ ...formData, description_ja: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111] border border-pink-500/30 rounded-lg focus:border-pink-500 focus:outline-none text-white text-sm"
                    placeholder="日本語説明"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="border-t border-[#333] pt-4">
                <p className="text-sm text-[#00F5A0] font-medium mb-3">성과 지표</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">지표 1 값</label>
                    <input
                      type="text"
                      value={formData.metric_1_value}
                      onChange={(e) => setFormData({ ...formData, metric_1_value: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                      placeholder="예: +312%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">지표 1 라벨 <span className="text-red-400">(KO)</span></label>
                    <input
                      type="text"
                      value={formData.metric_1_label}
                      onChange={(e) => setFormData({ ...formData, metric_1_label: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                      placeholder="예: ROAS 상승"
                    />
                  </div>
                </div>
                {/* 지표 1 라벨 번역 */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-blue-400 mb-1">Label (EN)</label>
                      <input
                        type="text"
                        value={formData.metric_1_label_en}
                        onChange={(e) => setFormData({ ...formData, metric_1_label_en: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#111] border border-blue-500/30 rounded focus:border-blue-500 focus:outline-none text-white text-xs"
                        placeholder="EN"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-pink-400 mb-1">ラベル (JA)</label>
                      <input
                        type="text"
                        value={formData.metric_1_label_ja}
                        onChange={(e) => setFormData({ ...formData, metric_1_label_ja: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#111] border border-pink-500/30 rounded focus:border-pink-500 focus:outline-none text-white text-xs"
                        placeholder="JA"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">지표 2 값</label>
                    <input
                      type="text"
                      value={formData.metric_2_value}
                      onChange={(e) => setFormData({ ...formData, metric_2_value: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:border-[#00F5A0] focus:outline-none text-white text-sm"
                      placeholder="예: ₩4,200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">지표 2 라벨 <span className="text-red-400">(KO)</span></label>
                    <input
                      type="text"
                      value={formData.metric_2_label}
                      onChange={(e) => setFormData({ ...formData, metric_2_label: e.target.value })}
                      className="w-full px-4 py-3 bg-[#111] border border-red-500/50 rounded-lg focus:border-red-500 focus:outline-none text-white text-sm"
                      placeholder="예: CPA 달성"
                    />
                  </div>
                </div>
                {/* 지표 2 라벨 번역 */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-blue-400 mb-1">Label (EN)</label>
                      <input
                        type="text"
                        value={formData.metric_2_label_en}
                        onChange={(e) => setFormData({ ...formData, metric_2_label_en: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#111] border border-blue-500/30 rounded focus:border-blue-500 focus:outline-none text-white text-xs"
                        placeholder="EN"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-pink-400 mb-1">ラベル (JA)</label>
                      <input
                        type="text"
                        value={formData.metric_2_label_ja}
                        onChange={(e) => setFormData({ ...formData, metric_2_label_ja: e.target.value })}
                        className="w-full px-2 py-1.5 bg-[#111] border border-pink-500/30 rounded focus:border-pink-500 focus:outline-none text-white text-xs"
                        placeholder="JA"
                      />
                    </div>
                  </div>
                </div>
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
