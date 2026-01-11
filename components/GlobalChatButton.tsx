'use client';

import { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';

// Global event for opening chat from anywhere
export const openChatEvent = new Event('openGlobalChat');

export function triggerOpenChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(openChatEvent);
  }
}

export default function GlobalChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener('openGlobalChat', handleOpenChat);
    return () => window.removeEventListener('openGlobalChat', handleOpenChat);
  }, []);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="floating-chat-btn fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* Chat Widget */}
      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
