'use client';

import { useState, useEffect, lazy, Suspense } from 'react';

// ChatWidget을 동적 로딩 (초기 번들에서 제외)
const ChatWidget = lazy(() => import('./ChatWidget'));

// Chat context types for different entry points
export type ChatContext =
  | 'default'           // 기본 상담
  | 'find_model'        // 내 브랜드에 맞는 모델 찾기
  | 'free_consult'      // 무료 상담
  | 'growth_inquiry'    // GROWTH 플랜 도입 문의
  | 'performance_inquiry' // PERFORMANCE 플랜 상담
  | 'ads_package'       // 광고 패키지 상담
  | 'vip_consult';      // VIP 상담

// Custom event with context
interface ChatEventDetail {
  context: ChatContext;
}

export function triggerOpenChat(context: ChatContext = 'default') {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('openGlobalChat', { detail: { context } });
    window.dispatchEvent(event);
  }
}

export default function GlobalChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>('default');

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<ChatEventDetail>;
      const context = customEvent.detail?.context || 'default';
      setChatContext(context);
      setIsChatOpen(true);
      setHasBeenOpened(true);
    };
    window.addEventListener('openGlobalChat', handleOpenChat);
    return () => window.removeEventListener('openGlobalChat', handleOpenChat);
  }, []);

  const handleOpen = () => {
    setChatContext('default');
    setIsChatOpen(true);
    setHasBeenOpened(true);
  };

  const handleClose = () => {
    setIsChatOpen(false);
    // 닫을 때 context 리셋
    setTimeout(() => setChatContext('default'), 300);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleOpen}
        className="floating-chat-btn fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Widget - 한번이라도 열었을 때만 로드 (동적 로딩) */}
      {hasBeenOpened && (
        <Suspense fallback={null}>
          <ChatWidget
            isOpen={isChatOpen}
            onClose={handleClose}
            initialContext={chatContext}
          />
        </Suspense>
      )}
    </>
  );
}
