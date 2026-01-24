'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArtistModel } from '@/lib/supabase';

interface ArtistDetailModalProps {
  artist: ArtistModel | null;
  isOpen: boolean;
  onClose: () => void;
  isLightTheme: boolean;
  onStartWithModel?: (artistName: string, noModelNeeded: boolean) => void;
}

// YouTube/TikTok Shorts URL을 embed URL로 변환
function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube Shorts
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('shorts/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
    }
  }

  // YouTube 일반
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  // YouTube 짧은 URL
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  // TikTok
  if (url.includes('tiktok.com')) {
    // TikTok은 직접 embed가 복잡하므로 원본 URL 반환
    return url;
  }

  return url;
}

export default function ArtistDetailModal({ artist, isOpen, onClose, isLightTheme, onStartWithModel }: ArtistDetailModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  const embedUrl = artist?.shorts_url ? getEmbedUrl(artist.shorts_url) : null;
  const isTikTok = artist?.shorts_url?.includes('tiktok.com');

  return (
    <AnimatePresence>
      {isOpen && artist && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal - 전면 가득 + 둥근 모서리 */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-0 top-4 bottom-0 z-[101] pointer-events-auto overflow-y-auto rounded-t-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`min-h-full rounded-t-3xl ${isLightTheme ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
              {/* Close Button */}
              <button
                onClick={onClose}
                className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isLightTheme
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 프로필 사진 영역 - 1:1 비율, 위쪽 크롭 */}
              <div className="relative w-full aspect-square overflow-hidden rounded-t-3xl">
                <div
                  className="absolute inset-0 bg-cover bg-top"
                  style={{ backgroundImage: `url(${artist.thumbnail_url})` }}
                />
                {/* 그라데이션 오버레이 */}
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  isLightTheme
                    ? 'from-white via-white/20 to-transparent'
                    : 'from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent'
                }`} />
              </div>

              {/* Content Section */}
              <div className="relative -mt-20 px-5 pb-6">
                {/* Name - 테마에 따라 색상 변경 */}
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: isLightTheme ? '#000000' : '#FFFFFF' }}>
                  {artist.name}
                  {artist.name_ko && (
                    <span className="ml-2 text-lg font-normal" style={{ color: isLightTheme ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' }}>
                      {artist.name_ko}
                    </span>
                  )}
                </h2>

                {/* Tags - 작게 */}
                {artist.tags && artist.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {artist.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          isLightTheme
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/30'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description - 아티스트 설명 */}
                {artist.description && (
                  <p className={`mt-3 text-sm leading-relaxed ${
                    isLightTheme ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {artist.description}
                  </p>
                )}

                {/* Shorts 영상 영역 - 태그 밑에 */}
                {(embedUrl || artist.hover_video_url) && (
                  <div className="mt-4 relative aspect-[9/16] w-full max-w-sm mx-auto overflow-hidden bg-black rounded-2xl">
                    {embedUrl && !isTikTok ? (
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : artist.hover_video_url ? (
                      <video
                        src={artist.hover_video_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : null}

                    {/* TikTok Link */}
                    {isTikTok && artist.shorts_url && (
                      <a
                        href={artist.shorts_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                        </svg>
                        TikTok에서 보기
                      </a>
                    )}
                  </div>
                )}

                {/* CTA Button */}
                <button
                  onClick={() => {
                    if (onStartWithModel && artist) {
                      onStartWithModel(artist.name, false);
                    }
                    onClose();
                  }}
                  className={`mt-6 w-full py-4 rounded-full font-bold text-center transition-all ${
                    isLightTheme
                      ? 'bg-gradient-to-r from-purple-600 to-emerald-500 hover:opacity-90'
                      : 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] hover:opacity-90'
                  }`}
                  style={{ color: isLightTheme ? '#FFFFFF' : '#000000' }}
                >
                  '{artist.name}'로 만들기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
