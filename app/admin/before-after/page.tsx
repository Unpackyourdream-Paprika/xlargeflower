'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAllBeforeAfterAssets,
  createBeforeAfterAsset,
  updateBeforeAfterAsset,
  deleteBeforeAfterAsset,
  BeforeAfterAsset
} from '@/lib/supabase';

export default function BeforeAfterManagement() {
  const [assets, setAssets] = useState<BeforeAfterAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadType, setUploadType] = useState<'before' | 'after'>('after');

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

  const fetchAssets = useCallback(async () => {
    try {
      const data = await getAllBeforeAfterAssets();
      setAssets(data);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAssets();
  }, [isAuthenticated, fetchAssets]);

  // 이미지 업로드 (Before - 원본 사진)
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('이미지 업로드 중...');

    try {
      const file = files[0];

      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        setIsUploading(false);
        return;
      }

      // Cloudinary에 이미지 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'xlarge_uploads');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error('이미지 업로드 실패');

      const result = await response.json();
      setUploadProgress(100);

      // DB에 저장 (before_image_url만)
      await createBeforeAfterAsset({
        before_image_url: result.secure_url,
        after_video_url: '', // 나중에 추가
        is_active: false,
        title: file.name.replace(/\.[^/.]+$/, '')
      });

      setUploadStatus('업로드 완료!');
      await fetchAssets();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  // 비디오 업로드 (After - 결과 영상)
  const handleVideoUpload = async (files: FileList | null, assetId?: string) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('비디오 업로드 중...');

    try {
      const file = files[0];

      if (!file.type.startsWith('video/')) {
        setError('비디오 파일만 업로드 가능합니다.');
        setIsUploading(false);
        return;
      }

      // Cloudinary에 비디오 업로드
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('비디오 업로드 실패');

      const result = await response.json();
      setUploadProgress(100);

      if (assetId) {
        // 기존 에셋에 영상 추가
        await updateBeforeAfterAsset(assetId, {
          after_video_url: result.videoUrl,
          after_video_webp_url: result.webpUrl
        });
      } else {
        // 새 에셋 생성 (영상만)
        await createBeforeAfterAsset({
          before_image_url: '/images/nikedunk.webp', // 기본 이미지
          after_video_url: result.videoUrl,
          after_video_webp_url: result.webpUrl,
          is_active: false,
          title: file.name.replace(/\.[^/.]+$/, '')
        });
      }

      setUploadStatus('업로드 완료!');
      await fetchAssets();
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
    if (uploadType === 'before') {
      handleImageUpload(e.dataTransfer.files);
    } else {
      handleVideoUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const toggleAssetActive = async (asset: BeforeAfterAsset) => {
    try {
      // 다른 에셋들 비활성화 (하나만 활성화)
      if (!asset.is_active) {
        for (const a of assets) {
          if (a.is_active && a.id !== asset.id) {
            await updateBeforeAfterAsset(a.id!, { is_active: false });
          }
        }
      }
      await updateBeforeAfterAsset(asset.id!, { is_active: !asset.is_active });
      await fetchAssets();
    } catch (err) {
      console.error('Failed to update asset:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (asset: BeforeAfterAsset) => {
    if (!confirm(`"${asset.title || '이 항목'}"을 삭제하시겠습니까?`)) return;

    try {
      await deleteBeforeAfterAsset(asset.id!);
      await fetchAssets();
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError('삭제에 실패했습니다.');
    }
  };

  // Dark Login Screen
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
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm whitespace-nowrap"
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
          <h2 className="text-2xl font-bold text-white">Before & After 관리</h2>
          <p className="text-gray-500 mt-1">메인 페이지의 원본 사진 → AI 영상 변환 섹션을 관리합니다.</p>
        </div>

        {/* Error Message */}
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

        {/* Upload Type Selection */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setUploadType('before')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadType === 'before'
                ? 'bg-[#00F5A0] text-black'
                : 'bg-[#111] text-gray-400 hover:text-white border border-[#333]'
            }`}
          >
            원본 이미지 업로드
          </button>
          <button
            onClick={() => setUploadType('after')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              uploadType === 'after'
                ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                : 'bg-[#111] text-gray-400 hover:text-white border border-[#333]'
            }`}
          >
            결과 영상 업로드
          </button>
        </div>

        {/* Upload Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            mb-8 border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-[#00F5A0] bg-[#00F5A0]/5'
              : 'border-[#333] hover:border-[#00F5A0]/50 bg-[#0A0A0A]'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onClick={() => {
            if (!isUploading) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = uploadType === 'before' ? 'image/*' : 'video/*';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (uploadType === 'before') {
                  handleImageUpload(files);
                } else {
                  handleVideoUpload(files);
                }
              };
              input.click();
            }
          }}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 border-4 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-white font-medium">
                업로드 중... {uploadProgress}%
              </p>
              {uploadStatus && (
                <p className="text-[#00F5A0] text-sm">{uploadStatus}</p>
              )}
              <div className="w-64 h-2 bg-[#222] rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                {uploadType === 'before' ? (
                  <svg className="w-8 h-8 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-[#00D9F5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <p className="text-white font-medium mb-2">
                {uploadType === 'before'
                  ? '드래그 & 드롭으로 원본 이미지 업로드'
                  : '드래그 & 드롭으로 결과 영상 업로드'}
              </p>
              <p className="text-gray-500 text-sm">
                {uploadType === 'before'
                  ? '또는 클릭하여 파일 선택 (JPG, PNG, WebP)'
                  : '또는 클릭하여 파일 선택 (MP4, MOV, WebM)'}
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">전체 항목</p>
            <p className="text-2xl font-bold text-white mt-1">{assets.length}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">현재 활성화</p>
            <p className="text-2xl font-bold text-[#00F5A0] mt-1">
              {assets.filter(a => a.is_active).length}
            </p>
          </div>
        </div>

        {/* Asset Grid */}
        {assets.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">등록된 항목이 없습니다.</p>
            <p className="text-gray-600 text-sm">위 영역에 파일을 드래그하여 업로드하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={`
                  relative bg-[#0A0A0A] border rounded-xl overflow-hidden
                  ${asset.is_active ? 'border-[#00F5A0]/50' : 'border-[#222]'}
                `}
              >
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  {/* Before Image */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">RAW INPUT (원본)</p>
                    <div className="aspect-video bg-[#111] rounded-lg overflow-hidden relative">
                      {asset.before_image_url ? (
                        <img
                          src={asset.before_image_url}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          이미지 없음
                        </div>
                      )}
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = async (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files[0]) {
                              setIsUploading(true);
                              try {
                                const formData = new FormData();
                                formData.append('file', files[0]);
                                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'xlarge_uploads');
                                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                                const response = await fetch(
                                  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                                  { method: 'POST', body: formData }
                                );
                                const result = await response.json();
                                await updateBeforeAfterAsset(asset.id!, { before_image_url: result.secure_url });
                                await fetchAssets();
                              } catch (err) {
                                setError('이미지 업로드 실패');
                              } finally {
                                setIsUploading(false);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black rounded text-xs text-white"
                      >
                        변경
                      </button>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center md:w-12">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
                      <svg className="w-5 h-5 text-white md:rotate-0 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* After Video */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-2">RENDERED OUTPUT (결과)</p>
                    <div className="aspect-video bg-[#111] rounded-lg overflow-hidden relative">
                      {asset.after_video_url ? (
                        <video
                          src={asset.after_video_url}
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
                          영상 없음
                        </div>
                      )}
                      {asset.after_video_webp_url && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-[#00D9F5]/20 rounded text-xs text-[#00D9F5]">
                          WebP
                        </span>
                      )}
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'video/*';
                          input.onchange = (e) => {
                            handleVideoUpload((e.target as HTMLInputElement).files, asset.id);
                          };
                          input.click();
                        }}
                        className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 hover:bg-black rounded text-xs text-white"
                      >
                        변경
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 justify-end">
                    <button
                      onClick={() => toggleAssetActive(asset)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all
                        ${asset.is_active
                          ? 'bg-[#00F5A0]/20 text-[#00F5A0] hover:bg-[#00F5A0]/30'
                          : 'bg-[#111] text-gray-400 hover:text-white border border-[#333]'
                        }
                      `}
                    >
                      {asset.is_active ? '활성화됨' : '비활성'}
                    </button>
                    <button
                      onClick={() => handleDelete(asset)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-all"
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div className="px-4 pb-4 flex items-center gap-2">
                  <span className="text-gray-500 text-sm">제목:</span>
                  <span className="text-white text-sm">{asset.title || '제목 없음'}</span>
                  <span className="text-gray-600 text-xs ml-auto">
                    {asset.created_at && new Date(asset.created_at).toLocaleDateString('ko-KR')}
                  </span>
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
              <span className="text-[#00F5A0]">•</span>
              원본 이미지와 결과 영상을 각각 업로드하세요.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              하나의 항목만 활성화할 수 있습니다 (메인 페이지에 표시).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              영상 위에 마우스를 올리면 미리보기가 재생됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              권장: 원본 이미지 (16:9), 영상 (MP4, 10초 이내)
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
