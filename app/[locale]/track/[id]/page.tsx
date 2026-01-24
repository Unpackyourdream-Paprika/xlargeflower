'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getOrderById, XLargeFlowerOrder, supabase } from '@/lib/supabase';

// 상태별 정보
const STATUS_INFO: Record<string, { label: string; color: string; description: string; step: number }> = {
  // orders 상태
  pending: {
    label: '결제 대기',
    color: '#FFA500',
    description: '결제 확인을 기다리고 있습니다.',
    step: 1
  },
  confirmed: {
    label: '결제 완료',
    color: '#00D9F5',
    description: '결제가 확인되었습니다. 곧 작업이 시작됩니다.',
    step: 2
  },
  in_progress: {
    label: '제작 중',
    color: '#00F5A0',
    description: 'AI 크리에이티브 영상을 제작하고 있습니다.',
    step: 3
  },
  review: {
    label: '검토 중',
    color: '#9B59B6',
    description: '제작된 영상을 내부 검토하고 있습니다.',
    step: 4
  },
  revision: {
    label: '수정 중',
    color: '#E67E22',
    description: '요청하신 수정사항을 반영하고 있습니다.',
    step: 4
  },
  completed: {
    label: '완료',
    color: '#00F5A0',
    description: '작업이 완료되었습니다!',
    step: 5
  },
  cancelled: {
    label: '취소됨',
    color: '#E74C3C',
    description: '주문이 취소되었습니다.',
    step: 0
  },
  // contacts 상태
  new: {
    label: '새 문의',
    color: '#9B59B6',
    description: '문의가 접수되었습니다. 담당자가 곧 연락드릴 예정입니다.',
    step: 1
  },
  contacted: {
    label: '연락 완료',
    color: '#00D9F5',
    description: '담당자가 연락을 드렸습니다.',
    step: 2
  },
  converted: {
    label: '계약 완료',
    color: '#00F5A0',
    description: '계약이 완료되었습니다.',
    step: 5
  },
  closed: {
    label: '종료',
    color: '#888888',
    description: '문의가 종료되었습니다.',
    step: 5
  }
};

const STEPS = [
  { step: 1, label: '결제 대기' },
  { step: 2, label: '결제 완료' },
  { step: 3, label: '제작 중' },
  { step: 4, label: '검토' },
  { step: 5, label: '완료' },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<XLargeFlowerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        // 먼저 orders 테이블에서 조회
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch {
        // orders에 없으면 contacts 테이블에서 조회
        try {
          const { data: contactData, error: contactError } = await supabase
            .from('xlarge_flower_contacts')
            .select('*')
            .eq('id', orderId)
            .single();

          if (contactError || !contactData) {
            setError('주문을 찾을 수 없습니다. 주문번호를 다시 확인해주세요.');
          } else {
            // contacts 데이터를 orders 형식으로 변환
            const convertedOrder: XLargeFlowerOrder = {
              id: contactData.id,
              created_at: contactData.created_at,
              customer_name: contactData.name,
              customer_email: contactData.email,
              customer_phone: contactData.phone,
              customer_company: contactData.company,
              status: contactData.status || 'new',
              chat_log: [],
              order_summary: {
                product: contactData.product_interest,
              },
              admin_note: contactData.message,
              final_price: contactData.budget ? parseInt(contactData.budget.replace(/[^0-9]/g, '')) : undefined,
            };
            setOrder(convertedOrder);
          }
        } catch {
          setError('주문을 찾을 수 없습니다. 주문번호를 다시 확인해주세요.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00F5A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">주문 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#050505] py-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">주문을 찾을 수 없습니다</h1>
          <p className="text-gray-400 mb-8">{error || '주문번호를 다시 확인해주세요.'}</p>
          <button
            onClick={() => router.push('/order')}
            className="px-6 py-3 bg-[#111] border border-[#333] text-white rounded-xl hover:border-[#00F5A0]/50 transition-colors"
          >
            다시 조회하기
          </button>
        </div>
      </div>
    );
  }

  const status = order.status || 'pending';
  const statusInfo = STATUS_INFO[status] || STATUS_INFO.pending;
  const currentStep = statusInfo.step;

  return (
    <div className="min-h-screen bg-[#050505] py-20">
      <div className="max-w-2xl mx-auto px-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-gray-500 text-sm mb-2">주문번호</p>
          <h1 className="text-2xl font-bold text-white mb-2">{order.order_number || orderId}</h1>
          {order.order_number && (
            <p className="text-xs font-mono text-white/40 break-all">{orderId}</p>
          )}

          {/* 상태 뱃지 */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusInfo.color }} />
            {statusInfo.label}
          </div>
          <p className="text-gray-400 mt-4">{statusInfo.description}</p>
        </motion.div>

        {/* 진행 상태 바 */}
        {status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        currentStep >= step.step
                          ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                          : 'bg-[#222] text-gray-500'
                      }`}
                    >
                      {currentStep > step.step ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.step
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${currentStep >= step.step ? 'text-white' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${
                        currentStep > step.step ? 'bg-[#00F5A0]' : 'bg-[#222]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 주문 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">주문 정보</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">주문일시</span>
              <span className="text-white">{formatDate(order.created_at)}</span>
            </div>
            {order.customer_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">주문자</span>
                <span className="text-white">{order.customer_name}</span>
              </div>
            )}
            {order.customer_email && (
              <div className="flex justify-between">
                <span className="text-gray-500">이메일</span>
                <span className="text-white">{order.customer_email}</span>
              </div>
            )}
            {order.selected_pack && (
              <div className="flex justify-between">
                <span className="text-gray-500">선택 상품</span>
                <span className="text-[#00F5A0] font-medium">{order.selected_pack} 팩</span>
              </div>
            )}
            {order.final_price && (
              <div className="flex justify-between">
                <span className="text-gray-500">결제 금액</span>
                <span className="text-white font-bold">₩{formatPrice(order.final_price)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* 요약 정보 */}
        {order.order_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">제작 상세</h2>
            <div className="space-y-4">
              {order.order_summary.product && (
                <div className="flex justify-between">
                  <span className="text-gray-500">제품/브랜드</span>
                  <span className="text-white">{order.order_summary.product}</span>
                </div>
              )}
              {order.order_summary.category && (
                <div className="flex justify-between">
                  <span className="text-gray-500">카테고리</span>
                  <span className="text-white">{order.order_summary.category}</span>
                </div>
              )}
              {order.order_summary.platform && (
                <div className="flex justify-between">
                  <span className="text-gray-500">플랫폼</span>
                  <span className="text-white">{order.order_summary.platform}</span>
                </div>
              )}
              {order.order_summary.target_audience && (
                <div className="flex justify-between">
                  <span className="text-gray-500">타겟층</span>
                  <span className="text-white">{order.order_summary.target_audience}</span>
                </div>
              )}
              {order.order_summary.vibe && (
                <div className="flex justify-between">
                  <span className="text-gray-500">분위기</span>
                  <span className="text-white">{order.order_summary.vibe}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* 기획안 확인 */}
        {order.proposal_urls && order.proposal_urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">📄</span>
              기획안 확인
            </h2>
            {order.proposal_note && (
              <p className="text-gray-400 text-sm mb-4">{order.proposal_note}</p>
            )}
            <div className="space-y-2">
              {order.proposal_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-purple-400 hover:border-purple-500/50 transition-colors"
                >
                  기획안 {index + 1} 보기 →
                </a>
              ))}
            </div>
            {order.proposal_sent_at && (
              <p className="text-gray-500 text-xs mt-4">
                전송일: {formatDate(order.proposal_sent_at)}
              </p>
            )}
          </motion.div>
        )}

        {/* 완료된 결과물 */}
        {status === 'completed' && order.final_video_urls && order.final_video_urls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#00F5A0]/10 to-[#00D9F5]/10 border border-[#00F5A0]/30 rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00F5A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              결과물 다운로드
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {order.delivery_note || '제작이 완료되었습니다. 아래 링크에서 다운로드해주세요.'}
            </p>
            <div className="space-y-2">
              {order.final_video_urls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 bg-[#111] border border-[#333] rounded-xl text-[#00F5A0] hover:border-[#00F5A0]/50 transition-colors"
                >
                  영상 {index + 1} 다운로드 →
                </a>
              ))}
            </div>
            {order.delivered_at && (
              <p className="text-gray-500 text-xs mt-4">
                납품일: {formatDate(order.delivered_at)}
              </p>
            )}
          </motion.div>
        )}

        {/* 관리자 메모 */}
        {order.admin_note && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-6"
          >
            <h2 className="text-lg font-bold text-white mb-4">담당자 메모</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{order.admin_note}</p>
          </motion.div>
        )}

        {/* 하단 버튼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <button
            onClick={() => router.push('/order')}
            className="flex-1 py-4 bg-[#111] border border-[#333] text-white rounded-xl hover:border-[#00F5A0]/50 transition-colors"
          >
            다른 주문 조회
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-4 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            홈으로
          </button>
        </motion.div>
      </div>
    </div>
  );
}
