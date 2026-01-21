'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  getAllArtistModels,
  createArtistModel,
  updateArtistModel,
  deleteArtistModel,
  uploadArtistImage,
  ArtistModel,
  ArtistCategory
} from '@/lib/supabase';

const CATEGORIES: { key: ArtistCategory; label: string }[] = [
  { key: 'FASHION', label: 'FASHION' },
  { key: 'BEAUTY', label: 'BEAUTY' },
  { key: 'F&B', label: 'F&B' },
  { key: 'TECH', label: 'TECH' },
  { key: 'LIFESTYLE', label: 'LIFESTYLE' },
];

interface ArtistFormData {
  name: string;
  name_ko: string;
  categories: ArtistCategory[];
  description: string;
  tags: string;
  thumbnail_url: string;
  hover_video_url: string;
}

const initialFormData: ArtistFormData = {
  name: '',
  name_ko: '',
  categories: ['FASHION'],
  description: '',
  tags: '',
  thumbnail_url: '',
  hover_video_url: '',
};

export default function ArtistManagement() {
  const [artists, setArtists] = useState<ArtistModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState<ArtistModel | null>(null);
  const [formData, setFormData] = useState<ArtistFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const fetchArtists = useCallback(async () => {
    try {
      const data = await getAllArtistModels();
      setArtists(data);
    } catch (err) {
      console.error('Failed to fetch artists:', err);
      setError('아티스트 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchArtists();
  }, [isAuthenticated, fetchArtists]);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleImageUpload = async (file: File, type: 'thumbnail' | 'video') => {
    setIsUploading(true);
    try {
      const url = await uploadArtistImage(file, type);
      if (type === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnail_url: url }));
      } else {
        setFormData(prev => ({ ...prev, hover_video_url: url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingArtist(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (artist: ArtistModel) => {
    setEditingArtist(artist);
    // category가 쉼표로 구분된 문자열이면 배열로 변환
    const categoriesArray: ArtistCategory[] = artist.category
      ? (artist.category.includes(',')
          ? artist.category.split(',').map(c => c.trim()) as ArtistCategory[]
          : [artist.category as ArtistCategory])
      : ['FASHION'];
    setFormData({
      name: artist.name,
      name_ko: artist.name_ko || '',
      categories: categoriesArray,
      description: artist.description,
      tags: artist.tags?.join(', ') || '',
      thumbnail_url: artist.thumbnail_url,
      hover_video_url: artist.hover_video_url || '',
    });
    setIsModalOpen(true);
  };

  const handleDownloadImage = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      setError('이미지 다운로드에 실패했습니다.');
    }
  };

  const toggleCategory = (cat: ArtistCategory) => {
    setFormData(prev => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        // 최소 1개는 선택되어야 함
        if (prev.categories.length === 1) return prev;
        return { ...prev, categories: prev.categories.filter(c => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArtist(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.thumbnail_url) {
      setError('이름과 썸네일 이미지는 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const artistData = {
        name: formData.name,
        name_ko: formData.name_ko || undefined,
        category: formData.categories.join(', ') as ArtistCategory,
        description: formData.description,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        thumbnail_url: formData.thumbnail_url,
        hover_video_url: formData.hover_video_url || undefined,
        is_active: true,
        sort_order: editingArtist?.sort_order || artists.length + 1,
      };

      if (editingArtist) {
        await updateArtistModel(editingArtist.id!, artistData);
        setSuccessMessage('아티스트가 수정되었습니다.');
      } else {
        await createArtistModel(artistData);
        setSuccessMessage('새 아티스트가 등록되었습니다.');
      }

      closeModal();
      await fetchArtists();
    } catch (err) {
      console.error('Submit failed:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArtistActive = async (artist: ArtistModel) => {
    try {
      await updateArtistModel(artist.id!, { is_active: !artist.is_active });
      await fetchArtists();
      setSuccessMessage(`아티스트가 ${artist.is_active ? '비활성화' : '활성화'}되었습니다.`);
    } catch (err) {
      console.error('Failed to update artist:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (artist: ArtistModel) => {
    if (!confirm(`"${artist.name}"을(를) 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;

    try {
      await deleteArtistModel(artist.id!);
      await fetchArtists();
      setSuccessMessage('아티스트가 삭제되었습니다.');
    } catch (err) {
      console.error('Failed to delete artist:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  // Login screen
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
              <label className="block text-sm font-medium text-gray-400 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                placeholder="관리자 비밀번호 입력"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
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
              href="/admin/hero"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              히어로
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              쇼케이스
            </Link>
            <Link
              href="/admin/before-after"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              Before/After
            </Link>
            <Link
              href="/admin/landing-portfolio"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              랜딩 포트폴리오
            </Link>
            <Link
              href="/admin/portfolio"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
              포트폴리오
            </Link>
            <span className="text-gray-600 text-sm">|</span>
            <Link
              href="/admin/artists"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
            >
              아티스트
            </Link>
            <Link
              href="/admin/pricing"
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
            >
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
            <h2 className="text-2xl font-bold text-white">AI 아티스트 관리</h2>
            <p className="text-gray-500 mt-1">메인 페이지 아티스트 라인업 섹션을 관리합니다.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 아티스트 등록
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline hover:no-underline">
              닫기
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-xl text-[#00F5A0] text-sm">
            {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">전체 아티스트</p>
            <p className="text-2xl font-bold text-white mt-1">{artists.length}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">활성화</p>
            <p className="text-2xl font-bold text-[#00F5A0] mt-1">
              {artists.filter(a => a.is_active).length}
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">비활성화</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">
              {artists.filter(a => !a.is_active).length}
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">카테고리</p>
            <p className="text-2xl font-bold text-white mt-1">
              {new Set(artists.map(a => a.category)).size}
            </p>
          </div>
        </div>

        {/* Artist Grid */}
        {artists.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">등록된 아티스트가 없습니다.</p>
            <p className="text-gray-600 text-sm mb-6">새 아티스트 등록 버튼을 눌러 시작하세요.</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              새 아티스트 등록
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className={`
                  relative bg-[#0A0A0A] border rounded-2xl overflow-hidden group
                  ${artist.is_active ? 'border-[#222]' : 'border-red-500/30 opacity-60'}
                `}
              >
                {/* Thumbnail */}
                <div className="aspect-[4/5] bg-[#111] relative overflow-hidden">
                  {artist.thumbnail_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${artist.thumbnail_url})` }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(artist)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="수정"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleArtistActive(artist)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${artist.is_active
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-[#00F5A0] hover:bg-[#00D9F5]'
                        }
                      `}
                      title={artist.is_active ? '비활성화' : '활성화'}
                    >
                      {artist.is_active ? (
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
                      onClick={() => handleDelete(artist)}
                      className="p-2 bg-red-500 hover:bg-red-400 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${artist.is_active
                        ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
                        : 'bg-red-500/20 text-red-400'
                      }
                    `}>
                      {artist.is_active ? '활성' : '비활성'}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white/80">
                      {artist.category}
                    </span>
                  </div>

                  {/* Sort Order */}
                  <div className="absolute bottom-3 right-3">
                    <span className="px-2 py-1 bg-black/60 rounded text-xs text-white font-mono">
                      #{artist.sort_order || 0}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold truncate">
                    {artist.name}
                    {artist.name_ko && (
                      <span className="ml-2 text-sm font-normal text-white/60">
                        {artist.name_ko}
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {artist.description || '설명 없음'}
                  </p>
                  {artist.tags && artist.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {artist.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#111] border border-[#333] rounded text-xs text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
          <h3 className="text-white font-medium mb-3">사용 방법</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">1</span>
              <strong className="text-white">[새 아티스트 등록]</strong> 버튼을 눌러 아티스트 정보를 입력하세요.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">2</span>
              썸네일 이미지는 <strong className="text-white">4:5 비율</strong> (세로형)을 권장합니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">3</span>
              활성화된 아티스트만 메인 페이지 라인업 섹션에 표시됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">4</span>
              호버 비디오(선택)를 등록하면 마우스 올렸을 때 재생됩니다.
            </li>
          </ul>
        </div>
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-[#0A0A0A] border border-[#222] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[#0A0A0A] border-b border-[#222] p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingArtist ? '아티스트 수정' : '새 아티스트 등록'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  썸네일 이미지 *
                </label>
                <div className="flex gap-4">
                  <div
                    className={`
                      relative w-32 h-40 bg-[#111] border-2 border-dashed rounded-xl overflow-hidden cursor-pointer
                      ${formData.thumbnail_url ? 'border-[#00F5A0]/50' : 'border-[#333] hover:border-[#00F5A0]/30'}
                    `}
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    {formData.thumbnail_url ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${formData.thumbnail_url})` }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs">4:5 비율</span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-[#00F5A0] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'thumbnail');
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-500">
                      클릭하여 이미지를 업로드하세요.<br />
                      권장 비율: 4:5 (세로형)<br />
                      권장 크기: 800x1000px 이상
                    </p>
                    {formData.thumbnail_url && (
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleDownloadImage(formData.thumbnail_url, formData.name || 'artist')}
                          className="text-sm text-[#00F5A0] hover:underline"
                        >
                          이미지 다운로드
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                          className="text-sm text-red-400 hover:underline"
                        >
                          이미지 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    영문 이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="FLOWER"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    한글 이름
                  </label>
                  <input
                    type="text"
                    value={formData.name_ko}
                    onChange={(e) => setFormData(prev => ({ ...prev, name_ko: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                    placeholder="플라워"
                  />
                </div>
              </div>

              {/* Category - 복수 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  카테고리 * <span className="text-gray-500 font-normal">(복수 선택 가능)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => toggleCategory(cat.key)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${formData.categories.includes(cat.key)
                          ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                          : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50'
                        }
                      `}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  소개 문구
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                  placeholder="20대 타겟의 힙한 스트릿 패션 전문"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                  placeholder="시크, 스트릿, MZ"
                />
              </div>

              {/* Hover Video (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  호버 비디오 (선택)
                </label>
                <div className="flex gap-4">
                  {formData.hover_video_url ? (
                    <div className="relative w-32 h-40 bg-[#111] border border-[#333] rounded-xl overflow-hidden">
                      <video
                        src={formData.hover_video_url}
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
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hover_video_url: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="w-32 h-40 bg-[#111] border-2 border-dashed border-[#333] hover:border-[#00F5A0]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-500"
                      onClick={() => videoInputRef.current?.click()}
                    >
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs">선택사항</span>
                    </div>
                  )}
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'video');
                    }}
                  />
                  <p className="text-sm text-gray-500 flex-1">
                    마우스를 올렸을 때 재생될 짧은 영상.<br />
                    권장: MP4, 3-5초, 무음
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 bg-[#111] border border-[#333] text-white font-medium rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      저장 중...
                    </span>
                  ) : (
                    editingArtist ? '수정 완료' : '등록하기'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
