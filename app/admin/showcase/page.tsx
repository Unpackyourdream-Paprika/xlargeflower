'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getAllShowcaseVideos,
  createShowcaseVideo,
  updateShowcaseVideo,
  deleteShowcaseVideo,
  uploadShowcaseVideo,
  ShowcaseVideo
} from '@/lib/supabase';

export default function ShowcaseManagement() {
  const [videos, setVideos] = useState<ShowcaseVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchVideos = useCallback(async () => {
    try {
      const data = await getAllShowcaseVideos();
      setVideos(data);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setError('비디오를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchVideos();
  }, [isAuthenticated, fetchVideos]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    const totalFiles = files.length;
    let completed = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('video/')) {
          setError(`${file.name}은(는) 비디오 파일이 아닙니다.`);
          continue;
        }

        // Upload to Supabase Storage
        const videoUrl = await uploadShowcaseVideo(file);

        // Get next sort order
        const maxSortOrder = videos.reduce((max, v) => Math.max(max, v.sort_order || 0), 0);

        // Create database entry
        await createShowcaseVideo({
          video_url: videoUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          is_active: true,
          sort_order: maxSortOrder + 1 + i
        });

        completed++;
        setUploadProgress(Math.round((completed / totalFiles) * 100));
      }

      // Refresh video list
      await fetchVideos();
    } catch (err) {
      console.error('Upload failed:', err);
      setError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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

  const toggleVideoActive = async (video: ShowcaseVideo) => {
    try {
      await updateShowcaseVideo(video.id!, { is_active: !video.is_active });
      await fetchVideos();
    } catch (err) {
      console.error('Failed to update video:', err);
      setError('상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (video: ShowcaseVideo) => {
    if (!confirm(`"${video.title || '이 비디오'}"를 삭제하시겠습니까?`)) return;

    try {
      await deleteShowcaseVideo(video.id!);
      await fetchVideos();
    } catch (err) {
      console.error('Failed to delete video:', err);
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
              className="py-4 border-b-2 border-transparent text-gray-500 hover:text-white font-medium text-sm transition-colors"
            >
              포트폴리오
            </Link>
            <Link
              href="/admin/showcase"
              className="py-4 border-b-2 border-[#00F5A0] text-[#00F5A0] font-medium text-sm"
            >
              쇼케이스 관리
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">쇼케이스 비디오 관리</h2>
          <p className="text-gray-500 mt-1">메인 페이지 비디오 월에 표시될 영상을 관리합니다.</p>
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
              <div className="w-48 h-2 bg-[#222] rounded-full mx-auto overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-white font-medium mb-2">
                드래그 & 드롭으로 비디오 업로드
              </p>
              <p className="text-gray-500 text-sm">
                또는 클릭하여 파일 선택 (MP4, MOV, WebM)
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">전체 영상</p>
            <p className="text-2xl font-bold text-white mt-1">{videos.length}</p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">활성화</p>
            <p className="text-2xl font-bold text-[#00F5A0] mt-1">
              {videos.filter(v => v.is_active).length}
            </p>
          </div>
          <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-gray-500">비활성화</p>
            <p className="text-2xl font-bold text-gray-500 mt-1">
              {videos.filter(v => !v.is_active).length}
            </p>
          </div>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-2">등록된 영상이 없습니다.</p>
            <p className="text-gray-600 text-sm">위 영역에 비디오를 드래그하여 업로드하세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`
                  relative bg-[#0A0A0A] border rounded-xl overflow-hidden group
                  ${video.is_active ? 'border-[#222]' : 'border-red-500/30 opacity-60'}
                `}
              >
                {/* Video Thumbnail */}
                <div className="aspect-[9/16] bg-[#111] relative">
                  <video
                    src={video.video_url}
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
                      onClick={() => toggleVideoActive(video)}
                      className={`
                        p-2 rounded-lg transition-colors
                        ${video.is_active
                          ? 'bg-gray-600 hover:bg-gray-500'
                          : 'bg-[#00F5A0] hover:bg-[#00D9F5]'
                        }
                      `}
                      title={video.is_active ? '비활성화' : '활성화'}
                    >
                      {video.is_active ? (
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
                      onClick={() => handleDelete(video)}
                      className="p-2 bg-red-500 hover:bg-red-400 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${video.is_active
                        ? 'bg-[#00F5A0]/20 text-[#00F5A0]'
                        : 'bg-red-500/20 text-red-400'
                      }
                    `}>
                      {video.is_active ? '활성' : '비활성'}
                    </span>
                  </div>

                  {/* Sort Order */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-black/60 rounded text-xs text-white font-mono">
                      #{video.sort_order || 0}
                    </span>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {video.title || '제목 없음'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {video.created_at && new Date(video.created_at).toLocaleDateString('ko-KR')}
                  </p>
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
              드래그 & 드롭 또는 클릭으로 비디오를 업로드하세요.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              활성화된 영상만 메인 페이지 비디오 월에 표시됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              영상 위에 마우스를 올리면 미리보기가 재생됩니다.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              권장 형식: MP4 (H.264), 세로형 (9:16), 10초 이내
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
