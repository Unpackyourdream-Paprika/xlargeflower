'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createOrder, OrderSummaryInput } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

const INITIAL_CONTENT = '안녕하세요! 엑스라지 플라워 크리에이티브 디렉터 소현입니다. 😊\n\n오늘 어떤 영상을 만들고 싶으신가요?';

export default function ConsultPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 클라이언트에서만 초기 메시지 설정 (hydration 에러 방지)
  useEffect(() => {
    if (!isInitialized) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: INITIAL_CONTENT,
        timestamp: new Date(),
      }]);
      setIsInitialized(true);
    }
  }, [isInitialized]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummaryInput | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, orderSummary]);

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
      // API 호출용 메시지 형식으로 변환
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 주문서가 생성되었는지 확인
      if (data.hasOrder && data.orderSummary) {
        setOrderSummary(data.orderSummary);
        setShowActions(true);
      } else if (data.message.includes('추천') || data.message.includes('팩]') || data.message.includes('문의')) {
        setShowActions(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송합니다, 일시적인 오류가 발생했어요. 다시 시도해 주시겠어요? 😅',
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
      'READY': 'READY 팩',
      'FAST': 'FAST 팩 ⭐',
      'EXCLUSIVE': 'EXCLUSIVE 팩'
    };
    return labels[pack] || pack;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-white/10 px-4 py-4 flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F5A0] to-[#00D9F5] flex items-center justify-center">
            <span className="text-white font-bold text-sm">소현</span>
          </div>
          <div>
            <h1 className="font-semibold text-white">AI 디렉터 소현</h1>
            <p className="text-xs text-[#00F5A0] flex items-center gap-1">
              <span className="w-2 h-2 bg-[#00F5A0] rounded-full animate-pulse"></span>
              온라인
            </p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white'
                  : 'bg-[#0A0A0A] border border-white/10 text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#00F5A0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[#00F5A0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[#00F5A0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary Card */}
        {orderSummary && !orderSubmitted && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-gradient-to-br from-[#00F5A0]/10 to-[#00D9F5]/10 border-2 border-[#00F5A0]/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-bold text-[#00D9F5]">주문서 요약</h3>
              </div>

              <div className="space-y-2 text-sm">
                {orderSummary.product && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">제품</span>
                    <span className="font-medium text-white">{orderSummary.product}</span>
                  </div>
                )}
                {orderSummary.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">카테고리</span>
                    <span className="font-medium text-white">{orderSummary.category}</span>
                  </div>
                )}
                {orderSummary.target_audience && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">타겟</span>
                    <span className="font-medium text-white">{orderSummary.target_audience}</span>
                  </div>
                )}
                {orderSummary.vibe && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">분위기</span>
                    <span className="font-medium text-white">{orderSummary.vibe}</span>
                  </div>
                )}
                {orderSummary.platform && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">플랫폼</span>
                    <span className="font-medium text-white">{orderSummary.platform}</span>
                  </div>
                )}

                <div className="border-t border-[#00F5A0]/30 pt-2 mt-2">
                  {orderSummary.recommended_pack && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">추천 상품</span>
                      <span className="font-bold text-[#00F5A0]">{getPackLabel(orderSummary.recommended_pack)}</span>
                    </div>
                  )}
                  {orderSummary.estimated_price && (
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-400">예상 금액</span>
                      <span className="font-bold text-[#00F5A0]">{formatPrice(orderSummary.estimated_price)}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full mt-4 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all"
              >
                이대로 주문 접수하기
              </button>
            </div>
          </div>
        )}

        {/* Order Submitted Confirmation */}
        {orderSubmitted && (
          <div className="flex justify-start">
            <div className="max-w-[90%] bg-[#00F5A0]/10 border-2 border-[#00F5A0]/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-white">주문이 접수되었습니다!</h3>
              </div>
              <p className="text-sm text-gray-300">
                담당자가 확인 후 빠르게 연락드리겠습니다. 감사합니다! 🎉
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">연락처 입력</h3>
            <p className="text-sm text-gray-400 mb-4">담당자가 확인 후 연락드립니다.</p>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  이름/담당자명 <span className="text-[#00F5A0]">*</span>
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-500"
                  placeholder="홍길동"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  연락처 <span className="text-[#00F5A0]">*</span>
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-500"
                  placeholder="010-1234-5678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  이메일 (선택)
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderForm(false)}
                  className="flex-1 py-3 bg-[#111] border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-[#1a1a1a] transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all disabled:opacity-50"
                >
                  {isSubmittingOrder ? '접수 중...' : '주문 접수'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {showActions && !orderSubmitted && (
        <div className="px-4 py-3 bg-[#0A0A0A] border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Link
              href="/contact"
              className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-full text-sm font-medium hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all"
            >
              문의하기
            </Link>
            <Link
              href="/products"
              className="flex-shrink-0 px-4 py-2 bg-[#111] border border-white/10 text-gray-300 rounded-full text-sm font-medium hover:border-white/20 hover:text-white transition-all"
            >
              상품 더보기
            </Link>
            <Link
              href="/portfolio"
              className="flex-shrink-0 px-4 py-2 bg-[#111] border border-white/10 text-gray-300 rounded-full text-sm font-medium hover:border-white/20 hover:text-white transition-all"
            >
              포트폴리오
            </Link>
          </div>
        </div>
      )}

      {/* Input */}
      {!orderSubmitted && (
        <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border-t border-white/10 px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 bg-[#111] border border-white/10 rounded-full focus:outline-none focus:border-[#00F5A0] text-white placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-white rounded-full flex items-center justify-center hover:shadow-lg hover:shadow-[#00F5A0]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* After Order Submitted */}
      {orderSubmitted && (
        <div className="bg-[#0A0A0A] border-t border-white/10 px-4 py-4">
          <Link
            href="/"
            className="block w-full py-3 bg-[#111] border border-white/10 text-gray-300 rounded-xl font-medium text-center hover:border-white/20 hover:text-white transition-all"
          >
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}
