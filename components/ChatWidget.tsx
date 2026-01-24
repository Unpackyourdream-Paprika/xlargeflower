'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, OrderSummaryInput } from '@/lib/supabase';
import { ChatContext } from './GlobalChatButton';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: ChatContext;
}

// Context별 초기 메시지
const INITIAL_MESSAGES: Record<ChatContext, string> = {
  default: '안녕하세요! XLARGE 크리에이티브 디렉터입니다.\n\n어떤 영상을 만들고 싶으신가요?',
  find_model: '안녕하세요! 브랜드에 딱 맞는 AI 모델을 찾아드릴게요.\n\n어떤 업종이시고, 타겟 고객층은 어떻게 되시나요?\n(예: 뷰티 브랜드, 20-30대 여성 타겟)',
  free_consult: '안녕하세요! 무료 상담 도와드릴게요.\n\n인플루언서 마케팅에서 AI 모델로 전환을 고려 중이신가요?\n현재 마케팅 고민이 무엇인지 편하게 말씀해 주세요.',
  growth_inquiry: '안녕하세요! GROWTH 플랜에 관심 가져주셔서 감사합니다.\n\nGROWTH 플랜은 영상 1종 + 바리에이션 3종(총 4개)으로 본격적인 광고 테스트에 최적화되어 있어요.\n\n어떤 제품/서비스를 홍보하실 예정이신가요?',
  performance_inquiry: '안녕하세요! PERFORMANCE 플랜 상담 도와드릴게요.\n\n이 플랜은 영상 2종 + 바리에이션 6종(총 8개)에 성과 저조 시 소재 교체 AS까지 포함되어 있어요.\n\n현재 광고 운영 중이시라면, 어떤 채널에서 주로 광고하고 계신가요?',
  ads_package: '안녕하세요! 퍼포먼스 광고 패키지 상담입니다.\n\n영상 제작부터 메타/틱톡/유튜브 광고 세팅, ROAS 분석까지 올인원으로 진행해 드려요.\n\n현재 월 광고비 예산은 어느 정도 생각하고 계신가요?',
  vip_consult: '안녕하세요! VIP 상담을 요청해 주셨네요.\n\n중견/대기업 고객님께는 분기 독점 계약과 브랜드 전속 AI 모델 개발 서비스를 제공해 드리고 있습니다.\n\n회사명과 현재 마케팅 니즈를 말씀해 주시면, 맞춤 제안서를 준비해 드릴게요.'
};

export default function ChatWidget({ isOpen, onClose, initialContext = 'default' }: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryInput | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const lastContextRef = useRef<ChatContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 채팅창 열릴 때 즉시 초기 메시지 설정
  useEffect(() => {
    if (isOpen) {
      // context가 바뀌었거나 처음 열리는 경우
      if (lastContextRef.current !== initialContext) {
        lastContextRef.current = initialContext;
        setMessages([{
          id: Date.now().toString(),
          role: 'assistant',
          content: INITIAL_MESSAGES[initialContext],
          timestamp: new Date(),
        }]);
        setOrderSummary(null);
        setOrderSubmitted(false);
      }
    }
  }, [isOpen, initialContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, orderSummary]);

  // 채팅창 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 메시지 전송 후 입력 필드에 포커스
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.hasOrder && data.orderSummary) {
        setOrderSummary(data.orderSummary);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.phone) return;

    setIsSubmittingOrder(true);

    try {
      const chatLog = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      await createOrder({
        chat_log: chatLog,
        order_summary: orderSummary || {},
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || undefined,
        customer_phone: customerInfo.phone
      });

      setOrderSubmitted(true);
      setShowOrderForm(false);
    } catch (error) {
      console.error('Order submit error:', error);
      alert('주문 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price) + '원';
  };

  const getPackLabel = (pack: string) => {
    const labels: Record<string, string> = {
      'READY': 'READY',
      'FAST': 'FAST',
      'EXCLUSIVE': 'EXCLUSIVE'
    };
    return labels[pack] || pack;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - 모바일에서만 표시 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Chat Window with Spring Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed z-50 flex flex-col overflow-hidden bg-[#0A0A0A] border border-[#222222] md:bottom-24 md:right-6 md:w-[380px] md:h-[600px] md:max-h-[calc(100vh-120px)] md:rounded-2xl inset-0 md:inset-auto rounded-none w-full h-full max-h-[100dvh]"
          >
        {/* Header */}
        <div className="bg-[#111111] border-b border-[#222222] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
              <span className="text-white font-bold text-xs">XL</span>
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI DIRECTOR</h3>
              <p className="text-xs text-[#555555] flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Online
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#050505] dark:bg-[#050505] bg-white min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2.5 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                    : 'dark:bg-[#1A1A1A] dark:border-[#222222] dark:text-white bg-white border border-black text-black'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#111111] border border-[#222222] rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-[#555555] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary Card */}
          {orderSummary && !orderSubmitted && (
            <div className="card-featured p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-[#888888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-bold text-white text-sm">ORDER SUMMARY</h3>
              </div>

              <div className="space-y-2 text-xs">
                {orderSummary.product && (
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Product</span>
                    <span className="text-white">{orderSummary.product}</span>
                  </div>
                )}
                {orderSummary.target_audience && (
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Target</span>
                    <span className="text-white">{orderSummary.target_audience}</span>
                  </div>
                )}
                {orderSummary.vibe && (
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Vibe</span>
                    <span className="text-white">{orderSummary.vibe}</span>
                  </div>
                )}
                {orderSummary.recommended_pack && (
                  <div className="flex justify-between pt-2 border-t border-[#222222]">
                    <span className="text-[#555555]">Pack</span>
                    <span className="font-bold gradient-text">{getPackLabel(orderSummary.recommended_pack)}</span>
                  </div>
                )}
                {orderSummary.estimated_price && (
                  <div className="flex justify-between">
                    <span className="text-[#555555]">Price</span>
                    <span className="font-bold text-white">{formatPrice(orderSummary.estimated_price)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full mt-4 btn-primary py-2.5 text-sm"
              >
                주문 접수하기
              </button>
            </div>
          )}

          {/* Order Submitted */}
          {orderSubmitted && (
            <div className="bg-[#111111] border border-[#222222] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-white text-sm">주문 접수 완료</h3>
              </div>
              <p className="text-xs text-[#888888]">
                담당자가 확인 후 연락드리겠습니다.
              </p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!orderSubmitted && (
          <form onSubmit={handleSubmit} className="p-4 bg-[#0A0A0A] border-t border-[#222222]">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2.5 bg-[#111111] border border-[#222222] rounded-lg focus:outline-none focus:border-[#00F5A0] text-sm text-white placeholder-[#555555]"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          )}
          </motion.div>

          {/* Order Form Modal */}
          {showOrderForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 w-full max-w-sm"
              >
                <h3 className="text-lg font-bold text-white mb-6">연락처 입력</h3>

                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#888888] mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="input-minimal"
                      placeholder="홍길동"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888888] mb-2">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="input-minimal"
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#888888] mb-2">
                      이메일
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="input-minimal"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1 py-3 bg-[#111111] border border-[#222222] text-white rounded-lg font-medium text-sm hover:bg-[#1a1a1a] transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="flex-1 btn-primary py-3 text-sm disabled:opacity-50"
                    >
                      {isSubmittingOrder ? '접수 중...' : '주문 접수'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
