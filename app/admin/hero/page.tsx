'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HeroMediaAsset, HeroLayoutType } from '@/lib/supabase';

interface SortableAssetCardProps {
  asset: HeroMediaAsset;
  onToggleActive: (asset: HeroMediaAsset) => void;
  onDelete: (asset: HeroMediaAsset) => void;
}

function SortableAssetCard({ asset, onToggleActive, onDelete }: SortableAssetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-[#0A0A0A] border rounded-xl overflow-hidden group
        ${asset.is_active ? 'border-[#222]' : 'border-red-500/30 opacity-60'}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-30 p-1.5 bg-black/60 rounded cursor-grab active:cursor-grabbing"
      >
        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Video Thumbnail */}
      <div className="aspect-[9/16] bg-[#111] relative">
        <video
          src={asset.video_url}
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

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onToggleActive(asset)}
            className={`
              p-2 rounded-lg transition-colors
              ${asset.is_active
                ? 'bg-gray-600 hover:bg-gray-500'
                : 'bg-[#00F5A0] hover:bg-[#00D9F5]'
              }
            `}
            title={asset.is_active ? '비활성화' : '활성화'}
          >
            {asset.is_active ? (
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
            onClick={() => onDelete(asset)}
            className="p-2 bg-red-500 hover:bg-red-400 rounded-lg transition-colors"
            title="삭제"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`
            px-2 py-1 rounded text-xs font-medium
            ${asset.is_active
              ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
              : 'bg-red-500/20 text-red-400'
            }
          `}>
            {asset.is_active ? '활성' : '비활성'}
          </span>
        </div>

        {/* Sort Order */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-1 bg-black/60 rounded text-xs text-white font-mono">
            #{asset.sort_order}
          </span>
        </div>
      </div>

      {/* Asset Info */}
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">
          {asset.title || '제목 없음'}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {asset.created_at && new Date(asset.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    </div>
  );
}

export default function HeroManagement() {
  const [assets, setAssets] = useState<HeroMediaAsset[]>([]);
  const [layoutType, setLayoutType] = useState<HeroLayoutType>('VERTICAL_ROLLING');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  const ADMIN_PASSWORD = 'xlarge2024';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      // Fetch layout type
      const configRes = await fetch('/api/hero/config');
      const config = await configRes.json();
      setLayoutType(config.layout_type);

      // Fetch all assets
      const assetsRes = await fetch('/api/admin/hero/assets');
      const assetsData = await assetsRes.json();
      setAssets(assetsData.assets || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated, fetchData]);

  const handleLayoutChange = async (newLayout: HeroLayoutType) => {
    setLayoutType(newLayout);
  };

  const handleSaveLayout = async () => {
    setIsSavingLayout(true);
    try {
      const res = await fetch('/api/admin/hero/layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout_type: layoutType }),
      });

      if (!res.ok) throw new Error('Failed to save layout');

      setSuccessMessage('레이아웃이 저장되었습니다.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save layout:', err);
      setError('레이아웃 저장에 실패했습니다.');
    } finally {
      setIsSavingLayout(false);
    }
  };

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

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload-video', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Cloudinary 업로드 실패');
        }

        const result = await uploadRes.json();

        // Get next sort order
        const maxSortOrder = assets.reduce((max, a) => Math.max(max, a.sort_order || 0), 0);

        // Create asset in DB
        const createRes = await fetch('/api/admin/hero/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ''),
            thumbnail_url: result.thumbnailUrl,
            video_url: result.videoUrl,
            thumbnail_webp_url: result.webpUrl,
            sort_order: maxSortOrder + 1 + i,
            is_active: true,
          }),
        });

        if (!createRes.ok) {
          throw new Error('DB 저장 실패');
        }

        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
        setUploadStatus(`[${i + 1}/${totalFiles}] 완료!`);
      }

      setUploadStatus('모든 업로드 완료!');
      await fetchData();
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

  const handleToggleActive = async (asset: HeroMediaAsset) => {
    try {
      await fetch(`/api/admin/hero/assets/${asset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !asset.is_active }),
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle active:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (asset: HeroMediaAsset) => {
    if (!confirm(`"${asset.title || '이 미디어'}"를 삭제하시겠습니까?`)) return;

    try {
      await fetch(`/api/admin/hero/assets/${asset.id}`, {
        method: 'DELETE',
      });
      await fetchData();
    } catch (err) {
      console.error('Failed to delete:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = assets.findIndex((a) => a.id === active.id);
      const newIndex = assets.findIndex((a) => a.id === over.id);

      const newAssets = arrayMove(assets, oldIndex, newIndex);
      setAssets(newAssets);

      // Update sort orders
      const orders = newAssets.map((asset, index) => ({
        id: asset.id!,
        sort_order: index,
      }));

      try {
        await fetch('/api/admin/hero/assets/order', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orders }),
        });
      } catch (err) {
        console.error('Failed to update order:', err);
        setError('순서 변경에 실패했습니다.');
        await fetchData();
      }
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
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
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
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors whitespace-nowrap"
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
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">메인 히어로 관리</h2>
          <p className="text-gray-500 mt-1">메인 페이지 히어로 섹션의 레이아웃과 콘텐츠를 관리합니다.</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              닫기
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-xl text-[#00F5A0] text-sm">
            {successMessage}
          </div>
        )}

        {/* Section 1: Layout Style Selection */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-4">레이아웃 스타일 선택</h3>
          <p className="text-gray-500 text-sm mb-6">메인 페이지에 표시할 히어로 섹션 디자인을 선택하세요.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Type A: Vertical Rolling */}
            <button
              onClick={() => handleLayoutChange('VERTICAL_ROLLING')}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                layoutType === 'VERTICAL_ROLLING'
                  ? 'border-[#00F5A0] bg-[#00F5A0]/5'
                  : 'border-[#333] hover:border-[#555]'
              }`}
            >
              {layoutType === 'VERTICAL_ROLLING' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-[#00F5A0] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="w-full h-32 bg-[#111] rounded-lg flex items-center justify-center overflow-hidden">
                  {/* Preview: Left text, Right columns */}
                  <div className="flex w-full h-full">
                    <div className="w-1/2 flex items-center justify-center p-2">
                      <div className="space-y-1">
                        <div className="h-2 w-16 bg-[#333] rounded" />
                        <div className="h-3 w-20 bg-[#00F5A0]/30 rounded" />
                        <div className="h-2 w-12 bg-[#333] rounded" />
                      </div>
                    </div>
                    <div className="w-1/2 flex gap-1 p-2">
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
                        <div className="flex-1 bg-[#222] rounded animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="text-white font-medium mb-1">버티컬 롤링 배너</h4>
              <p className="text-gray-500 text-xs">좌측 텍스트 + 우측 세로 무한 스크롤 배너</p>
            </button>

            {/* Type C: Mobile Mockup */}
            <button
              onClick={() => handleLayoutChange('MOBILE_MOCKUP')}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                layoutType === 'MOBILE_MOCKUP'
                  ? 'border-[#00F5A0] bg-[#00F5A0]/5'
                  : 'border-[#333] hover:border-[#555]'
              }`}
            >
              {layoutType === 'MOBILE_MOCKUP' && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-[#00F5A0] rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="mb-3">
                <div className="w-full h-32 bg-[#111] rounded-lg flex items-center justify-center overflow-hidden">
                  {/* Preview: Left text, Right phone */}
                  <div className="flex w-full h-full">
                    <div className="w-1/2 flex items-center justify-center p-2">
                      <div className="space-y-1">
                        <div className="h-2 w-16 bg-[#333] rounded" />
                        <div className="h-3 w-20 bg-[#00F5A0]/30 rounded" />
                        <div className="h-2 w-12 bg-[#333] rounded" />
                      </div>
                    </div>
                    <div className="w-1/2 flex items-center justify-center p-2">
                      {/* Phone mockup */}
                      <div className="w-12 h-24 bg-[#222] rounded-lg border-2 border-[#333] flex items-center justify-center transform rotate-3">
                        <div className="w-8 h-16 bg-gradient-to-b from-[#00F5A0]/20 to-[#00D9F5]/20 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="text-white font-medium mb-1">모바일 목업 스타일</h4>
              <p className="text-gray-500 text-xs">좌측 텍스트 + 우측 3D 스마트폰 프레임</p>
            </button>
          </div>

          <button
            onClick={handleSaveLayout}
            disabled={isSavingLayout}
            className="px-6 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-medium rounded-lg hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all disabled:opacity-50"
          >
            {isSavingLayout ? '저장 중...' : '레이아웃 저장'}
          </button>
        </div>

        {/* Section 2: Media Content Management */}
        <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">히어로 미디어 관리</h3>
          <p className="text-gray-500 text-sm mb-6">히어로 섹션에 표시할 영상을 관리합니다. 드래그하여 순서를 변경할 수 있습니다.</p>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              mb-6 border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${isDragging
                ? 'border-[#00F5A0] bg-[#00F5A0]/5'
                : 'border-[#333] hover:border-[#00F5A0]/50'
              }
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
              <div className="space-y-3">
                <div className="w-10 h-10 border-4 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-white font-medium">업로드 중... {uploadProgress}%</p>
                {uploadStatus && <p className="text-[#00F5A0] text-sm">{uploadStatus}</p>}
                <div className="w-48 h-2 bg-[#222] rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-[#111] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">드래그 & 드롭으로 비디오 업로드</p>
                <p className="text-gray-500 text-sm">또는 클릭하여 파일 선택 (MP4, MOV, WebM)</p>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111] rounded-lg p-3">
              <p className="text-sm text-gray-500">전체</p>
              <p className="text-xl font-bold text-white">{assets.length}</p>
            </div>
            <div className="bg-[#111] rounded-lg p-3">
              <p className="text-sm text-gray-500">활성화</p>
              <p className="text-xl font-bold text-[#00F5A0]">{assets.filter(a => a.is_active).length}</p>
            </div>
            <div className="bg-[#111] rounded-lg p-3">
              <p className="text-sm text-gray-500">비활성화</p>
              <p className="text-xl font-bold text-gray-500">{assets.filter(a => !a.is_active).length}</p>
            </div>
          </div>

          {/* Asset Grid */}
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">등록된 미디어가 없습니다.</p>
              <p className="text-gray-600 text-sm">위 영역에 비디오를 드래그하여 업로드하세요.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={assets.map(a => a.id!)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {assets.map((asset) => (
                    <SortableAssetCard
                      key={asset.id}
                      asset={asset}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
          <h3 className="text-white font-medium mb-3">사용 방법</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              레이아웃을 선택하고 &quot;레이아웃 저장&quot; 버튼을 클릭하면 메인 페이지에 즉시 반영됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              미디어 카드의 왼쪽 상단 핸들을 드래그하여 순서를 변경할 수 있습니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              활성화된 미디어만 메인 페이지에 표시됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              권장 영상: 세로형 (9:16), 10초 이내, MP4 형식
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
