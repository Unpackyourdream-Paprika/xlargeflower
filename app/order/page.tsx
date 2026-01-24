'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type SearchType = 'orderId' | 'email';

export default function OrderTrackingPage() {
  const [searchType, setSearchType] = useState<SearchType>('email');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Array<{ id: string; order_number?: string; created_at: string; status: string; customer_name?: string; source?: 'order' | 'contact' }>>([]);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrders([]);

    if (searchType === 'orderId') {
      // 주문번호로 조회
      if (!orderNumber.trim()) {
        setError('주문번호를 입력해주세요.');
        return;
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(orderNumber.trim())) {
        setError('올바른 주문번호 형식이 아닙니다.');
        return;
      }

      router.push(`/order/${orderNumber.trim()}`);
    } else {
      // 이메일로 조회
      if (!email.trim()) {
        setError('이메일을 입력해주세요.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('올바른 이메일 형식이 아닙니다.');
        return;
      }

      setIsLoading(true);

      try {
        // Supabase에서 이메일로 주문 조회 (orders 테이블)
        const { data: ordersData, error: ordersError } = await supabase
          .from('xlarge_flower_orders')
          .select('id, order_number, created_at, status, customer_name')
          .eq('customer_email', email.trim().toLowerCase())
          .order('created_at', { ascending: false });

        // contacts 테이블에서도 조회
        const { data: contactsData, error: contactsError } = await supabase
          .from('xlarge_flower_contacts')
          .select('id, created_at, status, name')
          .eq('email', email.trim().toLowerCase())
          .order('created_at', { ascending: false });

        if (ordersError && contactsError) throw ordersError;

        // 두 결과 합치기 (contacts는 order_number가 없으므로 id 사용)
        const combinedData = [
          ...(ordersData || []).map(o => ({ ...o, source: 'order' as const })),
          ...(contactsData || []).map(c => ({
            id: c.id,
            order_number: undefined,
            created_at: c.created_at,
            status: c.status || 'new',
            customer_name: c.name,
            source: 'contact' as const
          }))
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const data = combinedData;

        if (!data || data.length === 0) {
          setError('해당 이메일로 등록된 주문이 없습니다.');
        } else if (data.length === 1) {
          // 주문이 1개면 바로 이동
          router.push(`/order/${data[0].id}`);
        } else {
          // 여러 주문이 있으면 목록 표시
          setOrders(data);
        }
      } catch {
        setError('주문 조회 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      // orders 상태
      pending: '결제 대기',
      confirmed: '결제 완료',
      in_progress: '제작 중',
      review: '검토 중',
      revision: '수정 중',
      completed: '완료',
      cancelled: '취소됨',
      // contacts 상태
      new: '새 문의',
      contacted: '연락 완료',
      converted: '계약 완료',
      closed: '종료',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#050505] py-20">
      <div className="max-w-md mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-4">주문 조회</h1>
          <p className="text-gray-400">
            이메일 또는 주문번호로 작업 진행 상태를 확인하세요.
          </p>
        </motion.div>

        {/* 검색 타입 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-6"
        >
          <button
            type="button"
            onClick={() => { setSearchType('email'); setError(''); setOrders([]); }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              searchType === 'email'
                ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50'
            }`}
          >
            이메일로 조회
          </button>
          <button
            type="button"
            onClick={() => { setSearchType('orderId'); setError(''); setOrders([]); }}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
              searchType === 'orderId'
                ? 'bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black'
                : 'bg-[#111] border border-[#333] text-gray-400 hover:border-[#00F5A0]/50'
            }`}
          >
            주문번호로 조회
          </button>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {searchType === 'email' ? (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setOrders([]);
                }}
                placeholder="결제 시 입력한 이메일"
                className="w-full px-4 py-4 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                주문번호
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  setError('');
                }}
                placeholder="예: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                className="w-full px-4 py-4 bg-[#111] border border-[#333] rounded-xl text-white placeholder-gray-600 focus:border-[#00F5A0] focus:outline-none transition-colors text-sm"
              />
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-full font-bold text-center transition-all bg-gradient-to-r from-[#00F5A0] to-[#00D9F5] text-black hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? '조회 중...' : '조회하기'}
          </button>
        </motion.form>

        {/* 주문 목록 (이메일로 여러 주문 조회 시) */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <h3 className="text-white font-medium mb-4">주문 내역 ({orders.length}건)</h3>
            <div className="space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => router.push(`/order/${order.id}`)}
                  className="w-full p-4 bg-[#111] border border-[#333] rounded-xl text-left hover:border-[#00F5A0]/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs">{formatDate(order.created_at)}</span>
                      {order.source === 'contact' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">문의</span>
                      )}
                    </div>
                    <span className="text-[#00F5A0] text-xs font-medium">{getStatusLabel(order.status)}</span>
                  </div>
                  <p className="text-white text-sm font-bold">{order.order_number || order.id.slice(0, 8) + '...'}</p>
                  {order.customer_name && (
                    <p className="text-gray-500 text-xs mt-1">{order.customer_name}</p>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 p-6 bg-[#111] border border-[#222] rounded-xl"
        >
          <h3 className="text-white font-medium mb-4">조회 방법</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              <span><strong>이메일</strong>: 결제 시 입력한 이메일로 모든 주문을 조회합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00F5A0]">•</span>
              <span><strong>주문번호</strong>: 이메일로 받은 주문번호로 특정 주문을 조회합니다.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
