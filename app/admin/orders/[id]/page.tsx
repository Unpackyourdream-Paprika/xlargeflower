'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus, updateOrderDelivery, XLargeFlowerOrder } from '@/lib/supabase';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<XLargeFlowerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(resolvedParams.id);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [resolvedParams.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);

    try {
      await updateOrderStatus(order.id!, newStatus);
      setOrder({ ...order, status: newStatus as XLargeFlowerOrder['status'] });
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelivery = async () => {
    if (!order || !deliveryUrl.trim()) return;
    setIsUpdating(true);

    try {
      await updateOrderDelivery(order.id!, [deliveryUrl], deliveryNote);
      setOrder({
        ...order,
        status: 'completed',
        final_video_urls: [deliveryUrl],
        delivery_note: deliveryNote
      });
      setShowDeliveryModal(false);
    } catch (error) {
      console.error('Failed to deliver:', error);
      alert('납품 처리에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { border: string; text: string; label: string }> = {
      pending: { border: 'border-gray-500', text: 'text-gray-400', label: '접수대기' },
      confirmed: { border: 'border-blue-500', text: 'text-blue-400', label: '입금확인' },
      in_progress: { border: 'border-[#00F5A0]', text: 'text-[#00F5A0]', label: '작업중' },
      review: { border: 'border-orange-500', text: 'text-orange-400', label: '검토중' },
      revision: { border: 'border-red-500', text: 'text-red-400', label: '수정요청' },
      completed: { border: 'border-[#00D9F5]', text: 'text-[#00D9F5]', label: '납품완료' },
      cancelled: { border: 'border-gray-600', text: 'text-gray-500', label: '취소' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded border ${badge.border} ${badge.text} text-sm font-medium`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">주문을 찾을 수 없습니다.</p>
          <Link href="/admin/orders" className="text-[#00F5A0] hover:text-[#00D9F5] transition-colors">
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Header */}
      <header className="bg-[#0A0A0A] border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">
              ← 뒤로
            </button>
            <h1 className="text-xl font-bold text-white">주문 상세</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">주문 상태</h2>
                {getStatusBadge(order.status || 'pending')}
              </div>

              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'in_progress', 'review', 'completed', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isUpdating || order.status === status}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      order.status === status
                        ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                        : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    {{
                      pending: '접수대기',
                      confirmed: '입금확인',
                      in_progress: '작업중',
                      review: '검토중',
                      completed: '납품완료',
                      cancelled: '취소'
                    }[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">AI 요약 정보</h2>

              {order.order_summary ? (
                <div className="grid grid-cols-2 gap-4">
                  {order.order_summary.product && (
                    <div>
                      <p className="text-sm text-gray-500">제품</p>
                      <p className="font-medium text-white">{order.order_summary.product}</p>
                    </div>
                  )}
                  {order.order_summary.category && (
                    <div>
                      <p className="text-sm text-gray-500">카테고리</p>
                      <p className="font-medium text-white">{order.order_summary.category}</p>
                    </div>
                  )}
                  {order.order_summary.target_audience && (
                    <div>
                      <p className="text-sm text-gray-500">타겟</p>
                      <p className="font-medium text-white">{order.order_summary.target_audience}</p>
                    </div>
                  )}
                  {order.order_summary.vibe && (
                    <div>
                      <p className="text-sm text-gray-500">분위기</p>
                      <p className="font-medium text-white">{order.order_summary.vibe}</p>
                    </div>
                  )}
                  {order.order_summary.platform && (
                    <div>
                      <p className="text-sm text-gray-500">플랫폼</p>
                      <p className="font-medium text-white">{order.order_summary.platform}</p>
                    </div>
                  )}
                  {order.order_summary.recommended_pack && (
                    <div>
                      <p className="text-sm text-gray-500">추천 상품</p>
                      <p className="font-medium text-[#00F5A0]">{order.order_summary.recommended_pack} 팩</p>
                    </div>
                  )}
                  {order.order_summary.estimated_price && (
                    <div>
                      <p className="text-sm text-gray-500">예상 금액</p>
                      <p className="font-medium text-white">
                        {new Intl.NumberFormat('ko-KR').format(order.order_summary.estimated_price)}원
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">요약 정보가 없습니다.</p>
              )}
            </div>

            {/* Chat Log */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">상담 내역</h2>
                <button
                  onClick={() => setShowChatLog(!showChatLog)}
                  className="text-sm text-[#00F5A0] hover:text-[#00D9F5] transition-colors"
                >
                  {showChatLog ? '접기' : '펼치기'}
                </button>
              </div>

              {showChatLog && order.chat_log && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {order.chat_log.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                            : 'bg-[#1A1A1A] border border-[#333] text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showChatLog && (
                <p className="text-gray-500 text-sm">
                  총 {order.chat_log?.length || 0}개의 메시지
                </p>
              )}
            </div>

            {/* Delivery */}
            {order.status === 'completed' && order.final_video_urls && order.final_video_urls.length > 0 && (
              <div className="bg-[#00D9F5]/10 border border-[#00D9F5]/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-[#00D9F5] mb-4">납품 완료</h2>
                <div className="space-y-2">
                  {order.final_video_urls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#00F5A0] hover:text-[#00D9F5] underline transition-colors"
                    >
                      영상 링크 {idx + 1}
                    </a>
                  ))}
                </div>
                {order.delivery_note && (
                  <p className="mt-4 text-sm text-gray-400">{order.delivery_note}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Customer Info & Actions */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">고객 정보</h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium text-white">{order.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium text-white">{order.customer_phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium text-white">{order.customer_email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">주문일</p>
                  <p className="font-medium text-white">
                    {order.created_at && formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">빠른 액션</h2>

              <div className="space-y-3">
                {order.customer_phone && (
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="block w-full py-3 px-4 bg-[#111] border border-[#333] text-white rounded-xl font-medium text-center hover:border-[#00F5A0]/50 transition-colors"
                  >
                    전화하기
                  </a>
                )}

                {order.status !== 'completed' && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="block w-full py-3 px-4 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl text-center hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all"
                  >
                    납품하기
                  </button>
                )}

                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating || order.status === 'cancelled'}
                  className="block w-full py-3 px-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium text-center hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  주문 취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delivery Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">납품하기</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  영상 URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={deliveryUrl}
                  onChange={(e) => setDeliveryUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  납품 메모 (선택)
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-xl focus:border-[#00F5A0] focus:outline-none text-white placeholder-gray-600 resize-none"
                  placeholder="추가 안내사항..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 py-3 bg-[#111] border border-[#333] text-white rounded-xl font-medium hover:border-[#555] transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleDelivery}
                  disabled={isUpdating || !deliveryUrl.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black font-bold rounded-xl hover:shadow-lg hover:shadow-[#00F5A0]/20 transition-all disabled:opacity-50"
                >
                  {isUpdating ? '처리 중...' : '납품 완료'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
